"""Turn the reviewed portfolio into SQL for Supabase, plus the logins sheet to send to founders.

    python load_portfolio.py "<Portfolio folder>" "<website>" "<sql out dir>"

Passwords are generated here and only their bcrypt hashes go into the SQL.
The plain passwords are written once, to logins_to_send.xlsx in the Portfolio folder.
Startups marked "no" in the Include? column of portfolio_master.xlsx are skipped.
"""
import json
import re
import secrets
import sys
import unicodedata
from pathlib import Path

import bcrypt
import openpyxl
from openpyxl.styles import Alignment, Font, PatternFill

FOLDER, WEBSITE, SQLDIR = Path(sys.argv[1]), sys.argv[2].rstrip("/"), Path(sys.argv[3])
BOT = "https://t.me/StartupFest_Bot?start=checkin"
ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
CHUNK = 12

data = json.load(open(FOLDER / "portfolio_master.json"))
wb = openpyxl.load_workbook(FOLDER / "portfolio_master.xlsx", read_only=True)
head = [c.value for c in next(wb["Startups"].iter_rows(max_row=1))]
inc = head.index("Include? (Valijon)")
skip = {r[0] for r in wb["Startups"].iter_rows(min_row=2, values_only=True) if str(r[inc] or "").strip().lower() in ("no", "yo'q", "нет")}
startups = [s for s in data["startups"] if s["id"] not in skip]
bnames = {b["id"]: b["name"] for b in data["batches"]}


def q(v):
    return "null" if v is None else "'" + str(v).replace("'", "''") + "'"


def slug(name, used):
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:20].strip("-") or "startup"
    base, n = s, 2
    while s in used:
        s, n = f"{base}-{n}", n + 1
    used.add(s)
    return s


def achievement(s):
    wins = [r for b, r in s["batches"] if re.search(r"\$|place|pilot", r, re.I)]
    return "; ".join(wins)


used, logins, chunks = set(), [], []
for i in range(0, len(startups), CHUNK):
    part, sql = startups[i:i + CHUNK], []
    for n, s in enumerate(part, i):
        sql.append(f"insert into public.startups (id, name, one_liner, sector, stage, region, link, achievement, sort_order) values "
                   f"({q(s['id'])}, {q(s['name'])}, {q(s['one_liner'])}, {q(s['sector'])}, {q(s['stage'])}, {q(s['region'])}, {q(s['link'])}, {q(achievement(s))}, {n + 1});")
        for b, r in s["batches"]:
            sql.append(f"insert into public.startup_batches (startup_id, batch_id, result) values ({q(s['id'])}, {q(b)}, {q(r)});")
        for m in s["team"]:
            sql.append(f"insert into public.team_members (startup_id, name, role, phone, telegram, email, is_owner) values "
                       f"({q(s['id'])}, {q(m['name'])}, {q(m['role'])}, {q(m['phone'])}, {q(m['telegram'])}, {q(m['email'])}, {'true' if m['name'] == s['owner'] else 'false'});")
        if s["notes"]:
            sql.append(f"insert into public.org_notes (startup_id, notes) values ({q(s['id'])}, {q(s['notes'])});")
        login = slug(s["name"], used)
        pw = "".join(secrets.choice(ALPHABET) for _ in range(10))
        h = bcrypt.hashpw(pw.encode(), bcrypt.gensalt(10)).decode().replace("$2b$", "$2a$", 1)
        sql.append(f"insert into public.owners (user_id, startup_id, login) values (private.create_login({q(login)}, {q(h)}), {q(s['id'])}, {q(login)});")
        own = next((m for m in s["team"] if m["name"] == s["owner"]), {})
        logins.append((s, login, pw, own))
    chunks.append("\n".join(sql))

SQLDIR.mkdir(parents=True, exist_ok=True)
batches_sql = "\n".join(f"insert into public.batches (id, name, held_on, place) values ({q(b['id'])}, {q(b['name'])}, {q(b['held_on'])}, {q(b['place'])}) on conflict (id) do update set name = excluded.name, held_on = excluded.held_on, place = excluded.place;" for b in data["batches"])
(SQLDIR / "00_batches.sql").write_text(batches_sql)
for i, c in enumerate(chunks, 1):
    (SQLDIR / f"{i:02d}_startups.sql").write_text(c)


def msg_uz(s, login, pw, own):
    bs = ", ".join(bnames[b].replace("Catalyst × ", "") for b, _ in s["batches"])
    return (f"Assalomu alaykum{', ' + own['name'] if own.get('name') else ''}!\n\n"
            f"Siz {s['name']} jamoasi bilan Startup Fest Catalyst dasturida qatnashgansiz ({bs}). Biz Catalyst startaplari portfoliosini yig‘yapmiz va startapingiz haqidagi ma’lumot to‘g‘ri bo‘lishini istaymiz.\n\n"
            f"Iltimos, 2 daqiqa ajratib, ma’lumotlarni tekshiring va tasdiqlang:\n"
            f"• Saytda: {WEBSITE}/#/founder\n• yoki Telegramda: {BOT}\n\n"
            f"Login: {login}\nParol: {pw}\n\nRahmat!\nValijon, Startup Fest")


def msg_ru(s, login, pw, own):
    bs = ", ".join(bnames[b].replace("Catalyst × ", "") for b, _ in s["batches"])
    return (f"Здравствуйте{', ' + own['name'] if own.get('name') else ''}!\n\n"
            f"Вы участвовали в программе Startup Fest Catalyst с командой {s['name']} ({bs}). Мы собираем портфолио стартапов Catalyst и хотим, чтобы данные о вашем стартапе были точными.\n\n"
            f"Пожалуйста, уделите 2 минуты, проверьте и подтвердите данные:\n"
            f"• На сайте: {WEBSITE}/#/founder\n• или в Telegram: {BOT}\n\n"
            f"Логин: {login}\nПароль: {pw}\n\nСпасибо!\nВалижон, Startup Fest")


out = openpyxl.Workbook()
ws = out.active
ws.title = "Logins to send"
ws.append(["#", "Startup", "Success", "Send to", "Telegram", "Phone", "Login", "Password", "Message (Uzbek)", "Message (Russian)", "Sent? (date)"])
for cell in ws[1]:
    cell.font, cell.fill = Font(bold=True, color="FFFFFF"), PatternFill("solid", fgColor="C8102E")
for n, (s, login, pw, own) in enumerate(logins, 1):
    ws.append([n, s["name"], achievement(s), own.get("name", ""), own.get("telegram", ""), own.get("phone", ""), login, pw, msg_uz(s, login, pw, own), msg_ru(s, login, pw, own), ""])
for i, w in enumerate([5, 24, 36, 28, 18, 16, 18, 14, 70, 70, 14]):
    ws.column_dimensions[chr(65 + i)].width = w
for row in ws.iter_rows(min_row=2):
    for cell in row:
        cell.alignment = Alignment(wrap_text=True, vertical="top")
ws.freeze_panes = "C2"
dest = FOLDER / "logins_to_send.xlsx"
out.save(dest)
dest.chmod(0o600)
print(f"{len(logins)} logins, {len(chunks)} SQL chunks in {SQLDIR}, skipped {len(skip)} -> {dest}")
