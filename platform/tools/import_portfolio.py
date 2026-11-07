"""Build the first Startup Fest portfolio from the Catalyst batch files.

Reads the private event spreadsheets (never committed) and writes one
review workbook with a card per startup, its team, and a "check these" list.

    python import_portfolio.py "<Startup Fest folder>" "<output.xlsx>"
"""
import csv
import re
import sys
import unicodedata
from pathlib import Path

import openpyxl
from openpyxl.styles import Alignment, Font, PatternFill

ROOT = Path(sys.argv[1])
OUT = Path(sys.argv[2])
EV = ROOT / "Events"

BATCHES = [
    ("imzo", "Catalyst × IMZO", "2026-08-10", "Tashkent, IMZO factory"),
    ("yandex", "Catalyst × Yandex Pitch Day", "2026-09-12", "Tashkent, Yandex Uzbekistan office"),
    ("hududgaz", "Catalyst × Hududgaz ta'minoti", "2026-09-15", "Tashkent, Hududgaz ta'minoti"),
    ("regstone", "Catalyst × RegStone", "2026-11-03", "Samarqand, RegStone factory"),
]

# Results that are public on t.me/startupfestuz or recorded in Catalyst_Matching_Baza.xlsx
IMZO_PROJECTS = {  # hackathon team -> what the team built (from IMZO Pitch Decks/T1..T10)
    1: "Citadel (AI helper)", 2: "Binova × IMZO", 3: "Sentinel AI", 4: "Unifactory",
    5: "IMZO operational excellence", 6: "IMZO AI", 7: "Home visualiser (RU deck)",
    8: "IMZO Innovation", 9: "(deck has no title)", 10: "RomViz AI",
}
# Results confirmed by Valijon (8 Nov 2026): (startup, batch) -> (result text, US$ raised or committed, place)
OUTCOMES = {
    ("binova", "imzo"): ("1st place", 0, 1),
    ("ezgupro", "imzo"): ("2nd place (team project: IMZO AI)", 0, 2),
    ("unifactory", "imzo"): ("3rd place", 0, 3),
    ("core ai", "yandex"): ("$100,000 investment from Yoshlar Ventures", 100000, 0),
    ("voicelab", "yandex"): ("$80,000 investment from Yoshlar Ventures", 80000, 0),
    ("bonu", "yandex"): ("$40,000 investment from Yoshlar Ventures + $30,000 in Yandex Plus credits", 70000, 0),
    ("voicelab", "hududgaz"): ("$50,000 from Hududgaz ta'minoti", 50000, 0),
    ("camvi", "hududgaz"): ("$50,000 from Hududgaz ta'minoti", 50000, 0),
    ("inter-ai", "hududgaz"): ("$50,000 from Hududgaz ta'minoti", 50000, 0),
    ("hudud radar", "hududgaz"): ("$10,000 from Hududgaz ta'minoti", 10000, 0),
    ("timepay", "regstone"): ("Pilot contract with RegStone", 0, 0),
}
NAMES = {"ezgupro": "EzguPro", "mimoram ai": "MIMORAM AI", "core ai": "Core AI", "inter-ai": "inter-AI"}
OWNERS = {"ezgupro": "Nail Gizatullin", "mimoram ai": "Ilhomova Madinaxon"}
PERSON_ALIASES = {"madina ilhomova": "Ilhomova Madinaxon"}

ALIASES = {  # spelling variants -> one startup
    "sarbon24": "sarbon", "voice labs": "voicelab", "levlup food service": "levlup",
    "uy makon": "uy makon", "core ai": "core ai", "between": "between",
    "ezgusavdo": "ezgupro", "memora ai": "mimoram ai", "voicelab": "voicelab",
}


def norm(s):
    s = unicodedata.normalize("NFKD", str(s or "")).encode("ascii", "ignore").decode().lower()
    s = re.sub(r"[`'’ʻʼ‘]", "", s)
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 \-]", " ", s)).strip()


def key(name):
    k = norm(name)
    return ALIASES.get(k, k)


def person_key(name):
    t = [w for w in norm(name).split() if w not in {"ogli", "qizi", "ugli"}]
    return frozenset(t[:2]) if len(t) >= 2 else frozenset(t)


def same_person(a, b):
    ka, kb = person_key(a), person_key(b)
    return bool(ka) and (ka == kb or (len(ka) >= 2 and len(ka & kb) >= 2))


def clean_phone(p):
    if p is None:
        return ""
    s = re.sub(r"[^\d+]", "", str(p).split(".")[0].strip("'"))
    if not s:
        return ""
    if s.startswith("+"):
        return s
    if s.startswith("998"):
        return "+" + s
    if len(s) == 9:
        return "+998" + s
    return s


def tg(s):
    s = str(s or "").strip().strip("'")
    m = re.search(r"t\.me/([A-Za-z0-9_]{4,})", s) or re.search(r"@([A-Za-z0-9_]{4,})", s)
    if m:
        return "@" + m.group(1)
    if re.fullmatch(r"[A-Za-z][A-Za-z0-9_]{4,}", s):
        return "@" + s
    return ""


startups = {}   # key -> dict
people = []     # participants without a startup card
checks = []


def card(name, **kw):
    k = key(name)
    c = startups.setdefault(k, {"name": name.strip(), "one_liner": "", "sector": "", "stage": "", "region": "",
                                "link": "", "batches": [], "team": [], "notes": []})
    for f, v in kw.items():
        if v and not c.get(f):
            c[f] = str(v).strip()
    return c


def add_member(c, name, role="", phone="", telegram="", email="", source=""):
    name = re.sub(r"\s+", " ", str(name)).strip()
    name = PERSON_ALIASES.get(norm(name), name)
    for m in c["team"]:
        if same_person(m["name"], name):
            for f, v in (("role", role), ("phone", phone), ("telegram", telegram), ("email", email)):
                if v and not m[f]:
                    m[f] = v
            return m
    m = {"name": name, "role": role, "phone": phone, "telegram": telegram, "email": email, "source": source}
    c["team"].append(m)
    return m


def add_batch(c, bid, result):
    if not any(b[0] == bid for b in c["batches"]):
        c["batches"].append((bid, result))


# ---------- IMZO (10 Aug 2026) ----------
wb = openpyxl.load_workbook(EV / "Catalyst - Imzo (2026-08)" / "Imzo Responses.xlsx", read_only=True, data_only=True)
imzo_eval = [r for r in wb["Evaluation"].iter_rows(values_only=True) if r and r[0]][1:]
imzo_form = list(wb["Form Responses 1"].iter_rows(values_only=True))
mb = openpyxl.load_workbook(ROOT / "Strategy & Research" / "Catalyst_Matching_Baza.xlsx", read_only=True, data_only=True)
mb_rows = [r for r in mb["Startaplar"].iter_rows(values_only=True) if r and r[0] and str(r[0]).startswith("S")]


def imzo_contact(name):
    for r in imzo_eval:
        if same_person(r[0], name):
            return clean_phone(r[3]), tg(r[2]), str(r[4] or "").strip()
    return "", "", ""


def imzo_form_row(name):
    for r in imzo_form[1:]:
        for i in (2, 18, 34, 51):
            if i < len(r) and r[i] and same_person(r[i], name):
                return r, i
    return None, None


for r in list(wb["Teams"].iter_rows(values_only=True))[1:]:
    r = list(r or ()) + [None] * 3
    if not r[1]:
        continue
    team_no = int(re.sub(r"\D", "", str(r[0])))
    member, startup = str(r[1]).strip(), str(r[2] or "").strip()
    phone, telegram, email = imzo_contact(member)
    result = f"Hackathon team {team_no}: {IMZO_PROJECTS[team_no]}"
    if startup.lower() in ("individual", "", "no"):
        people.append({"batch": "imzo", "name": member, "detail": result, "phone": phone, "telegram": telegram, "email": email})
        continue
    if norm(startup) == norm(member.split()[0]):   # "Jaloliddin" listed as his own team name
        checks.append(f"IMZO: '{startup}' looks like a person's name, not a startup (member {member}).")
    c = card(startup, sector="")
    fr, base = imzo_form_row(member)
    if fr:
        c["link"] = c["link"] or str(fr[base + 10] or "").strip()
        c["sector"] = c["sector"] or str(fr[base + 7] or "").strip()
        c["stage"] = c["stage"] or str(fr[base + 8] or "").strip()
    for m in mb_rows:   # the founder's own project in the matching base: only if it names this startup
        if m[2] and same_person(m[2], member) and m[4] and key(m[1]) == key(startup):
            c["one_liner"] = c["one_liner"] or str(m[4])
    add_member(c, member, "", phone, telegram, email, "imzo")
    add_batch(c, "imzo", result)

for r in list(wb["Teams"].iter_rows(values_only=True))[1:]:   # Unifactory: the project Imzo hackathon team 4 built
    r = list(r or ()) + [None] * 3
    if r[1] and str(r[0]).strip() == "Team 4":
        u = card("Unifactory", sector="Industry & Manufacturing", one_liner="One real-time platform for the whole factory: production, staff, call centre, logistics and security.")
        add_member(u, str(r[1]).strip(), "", *imzo_contact(str(r[1]).strip()), "imzo")
        add_batch(u, "imzo", "Hackathon team 4: Unifactory")
checks.append("Unifactory: built at the Imzo hackathon by team 4 (people from ReShina, Manag.io, DataLabs, ECO SOIL). Who should get its login?")

# ---------- Yandex Pitch Day (12 Sep 2026) ----------
wy = openpyxl.load_workbook(EV / "Yandex Pitch Day (2026-09)" / "Yandex Responses (2026-10-13).xlsx", read_only=True, data_only=True)
yform = list(wy["Form Responses 1"].iter_rows(values_only=True))
COLS = [(3, 4, 5, 6, 7, 8, 9, 70), (19, 20, 21, 22, 23, 72, 25, 24), (35, 36, 37, 38, 39, 77, 41, 40)]


def yandex_form(name):
    for r in reversed(yform[1:]):
        for n, one, link, founder, contact, region, stage, team in COLS:
            if r[n] and key(r[n]) == key(name):
                return dict(one_liner=r[one], link=r[link], founder=r[founder], contact=r[contact],
                            region=r[region], stage=r[stage], team=r[team])
    return {}


cur = None
for r in list(wy["Teams"].iter_rows(values_only=True))[1:]:
    if not r or not any(r):
        continue
    vals = [v for v in r[1:5] if v is not None]
    if len(vals) >= 3 and not re.fullmatch(r"[\d.]+", str(vals[1])):
        cur, member, phone = str(vals[0]).strip(), str(vals[1]).strip(), vals[2]
    else:
        member, phone = str(vals[0]).strip(), vals[1] if len(vals) > 1 else ""
    if not cur:
        continue
    f = yandex_form(cur)
    c = card(cur, one_liner=f.get("one_liner"), link=f.get("link"), region=f.get("region"), stage=f.get("stage"))
    if f.get("team") and not any("Team (from form)" in n for n in c["notes"]):
        c["notes"].append("Team (from form): " + re.sub(r"\s+", " ", str(f["team"]))[:300])
    t = tg(f.get("contact")) if f.get("founder") and same_person(f["founder"], member) else ""
    add_member(c, member, "", clean_phone(phone), t, "", "yandex")
    add_batch(c, "yandex", "Pitched")

# ---------- Hududgaz ta'minoti (15 Sep 2026) ----------
wh = openpyxl.load_workbook(EV / "Catalyst - Hududgaz (2026-07)" / "Hududgazta'minoti Catalyst (Responses).xlsx", read_only=True, data_only=True)
heval = {norm(r[4]): r for r in wh["Copy of Evaluation"].iter_rows(values_only=True) if r and r[1] == "Startup" and r[4]}
for r in list(wh["Selected Candidates"].iter_rows(values_only=True))[1:]:
    if not r or not r[0]:
        continue
    r = list(r) + [None] * 5
    name = str(r[0]).strip()
    phone, track, email, note = clean_phone(r[1]), r[2], str(r[3] or "").strip(" -"), str(r[4] or "")
    if track == "Startup":
        m = re.match(r"Startup:\s*(.+?)\s*\((.+?)\)?$", note)
        sname, stage = (m.group(1), m.group(2)) if m else (note, "")
        ev = next((v for k, v in heval.items() if same_person(k, name)), None)
        c = card(sname, stage=stage, link=ev[6] if ev else "")
        add_member(c, name, "", phone, "", email, "hududgaz")
        add_batch(c, "hududgaz", "Selected startup")
    elif track == "Cybersecurity" and note and note not in ("-", "NewUU"):
        c = card(note, sector="Cybersecurity", one_liner="Cybersecurity team")
        add_member(c, name, "Cybersecurity specialist", phone, "", email, "hududgaz")
        add_batch(c, "hududgaz", "Selected cybersecurity team")
    else:
        people.append({"batch": "hududgaz", "name": name, "detail": f"{track}: {note}", "phone": phone, "telegram": "", "email": email})

# Hududgaz pitch-day winners recorded in Catalyst_Matching_Baza.xlsx but not on the selected-startups list
for m in mb_rows:
    if m[5] and "Hududgaz" in str(m[5]) and key(m[1]) not in startups:
        c = card(str(m[1]), sector=m[3], one_liner=m[4])
        add_batch(c, "hududgaz", "Pitched")
        checks.append(f"{c['name']}: Hududgaz pitch-day winner in the matching base, but no team names in the files. Who is the founder?")

# Problem/solution text from the Hududgaz form, for the selected startups
hform = list(wh["Form Responses 1"].iter_rows(values_only=True))
for r in hform[1:]:
    for n, txt in ((9, 12), (30, 33), (51, 54)):
        if len(r) > txt and r[n] and key(r[n]) in startups and r[txt]:
            c = startups[key(r[n])]
            c["one_liner"] = c["one_liner"] or re.split(r"(?<=[.!?])\s", str(r[txt]).strip())[0][:220]

# ---------- RegStone (3 Nov 2026) ----------
rs = EV / "Catalyst - Samarqand & Xorazm (2026-11)" / "startupfest-all-applications (RegStone, exported 2026-11-02).csv"
for x in csv.DictReader(open(rs, encoding="utf-8-sig")):
    if x["Status"] != "Accepted":
        continue
    sname = x["Startap nomi."].strip() or x["Jamoa nomi"].strip()
    if not sname:
        people.append({"batch": "regstone", "name": x["Name"], "detail": "No team name", "phone": clean_phone(x["Phone"]), "telegram": tg(x["Telegram"]), "email": x["Email"]})
        continue
    c = card(sname, one_liner=x["Loyihangiz nima qilishini bitta oddiy gapda tushuntirib bering."],
             link=x["Mahsulotingiz havolasi (Veb-sayt, mobil ilova yoki bot)."],
             region=x["Jamoangiz qaysi hududda joylashgan?"] or x["Hudud"],
             stage=x["Loyihangiz ayni paytda qaysi bosqichda?"], sector=x["Tanlangan yo‘nalish"])
    team = x["Jamoangiz tarkibi va a’zolarining rollari qanday?"].strip()
    if team and not any("Team (from form)" in n for n in c["notes"]):
        c["notes"].append("Team (from form): " + re.sub(r"\s+", " ", team)[:300])
    add_member(c, x["Name"].strip().title(), x["Sizning rolingiz"], clean_phone(x["Phone"]), tg(x["Telegram"]), x["Email"], "regstone")
    add_batch(c, "regstone", "Accepted")

# One-liners from the matching base, matched by startup name
for m in mb_rows:
    k = key(m[1])
    if k in startups and m[4] and not startups[k]["one_liner"] and "o‘rin" not in str(m[4]):
        startups[k]["one_liner"] = str(m[4])
    if k in startups and m[3] and not startups[k]["sector"]:
        startups[k]["sector"] = str(m[3])
if key("Hudud Gaz Ta'minot AJ") in startups:
    checks.append("'Hudud Gaz Ta'minot AJ' is the partner's own name; its link is hudud-gaz-pulse.base44.app. What is the startup really called?")

# ---------- results, names and owners confirmed by Valijon ----------
for (k, bid), (text, usd, place) in OUTCOMES.items():
    c = startups.get(k) or card(NAMES.get(k, k.title()))
    c["batches"] = [b for b in c["batches"] if b[0] != bid] + [(bid, text)]
    c["usd"] = c.get("usd", 0) + usd
    c["place"] = min(c.get("place") or 9, place or 9)
    c["pilot"] = c.get("pilot") or "pilot" in text.lower()
for k, n in NAMES.items():
    if k in startups:
        startups[k]["name"] = n
checks.append("RegStone: you mentioned a second pilot contract (a '3D calculator'-like startup). The channel and our files don't name it. Which startup is it?")

# ---------- checks ----------
for k, c in startups.items():
    if not c["one_liner"]:
        checks.append(f"{c['name']}: no one-line description yet (the founder will add it).")
    if not any(m["phone"] or m["telegram"] for m in c["team"]):
        checks.append(f"{c['name']}: no phone or Telegram for anyone in the team, so we can't send the login.")
    if len(c["batches"]) > 1:
        checks.append(f"{c['name']}: took part in {len(c['batches'])} batches ({', '.join(b[0] for b in c['batches'])}); merged into one card.")
for a in startups.values():
    for b in startups.values():
        if a is not b and a["name"] < b["name"] and "Unifactory" not in (a["name"], b["name"]):
            shared = [m["name"] for m in a["team"] if any(same_person(m["name"], n["name"]) for n in b["team"])]
            if shared:
                checks.append(f"{a['name']} and {b['name']} share {', '.join(shared)}: same startup, or one person in two?")

# ---------- write ----------
def success(c):
    return bool(c.get("usd") or (c.get("place") or 9) < 9 or c.get("pilot"))


border = [b[0] for b in BATCHES]
for c in startups.values():
    c["batches"].sort(key=lambda b: border.index(b[0]))
ordered = sorted(startups.values(), key=lambda c: (not success(c), -(c.get("usd") or 0), c.get("place") or 9, not c.get("pilot"),
                                                     border.index(c["batches"][0][0]) if c["batches"] else 9, c["name"].lower()))
for i, c in enumerate(ordered, 1):
    c["id"] = f"P{i:03d}"
    forced = OWNERS.get(key(c["name"]))
    owner = next((m for m in c["team"] if forced and same_person(m["name"], forced)), None) \
        or next((m for m in c["team"] if m["telegram"]), None) or next((m for m in c["team"] if m["phone"]), None) or (c["team"] or [{"name": ""}])[0]
    c["owner"] = owner["name"]

bnames = {b[0]: f"{b[1]} ({b[2]})" for b in BATCHES}
HEAD = Font(bold=True, color="FFFFFF")
FILL = PatternFill("solid", fgColor="C8102E")
out = openpyxl.Workbook()


def sheet(title, header, rows, widths):
    ws = out.create_sheet(title)
    ws.append(header)
    for cell in ws[1]:
        cell.font, cell.fill = HEAD, FILL
    for r in rows:
        ws.append(r)
    for i, w in enumerate(widths):
        ws.column_dimensions[chr(65 + i)].width = w
    for row in ws.iter_rows(min_row=2):
        for cell in row:
            cell.alignment = Alignment(wrap_text=True, vertical="top")
    ws.freeze_panes = "B2"
    return ws


out.remove(out.active)
sheet("Startups", ["ID", "Startup", "Success", "Batches and results", "Team members", "Owner (gets the login)", "One-liner", "Sector", "Stage", "Region", "Link", "Notes", "Include? (Valijon)"],
      [[c["id"], c["name"], "✓" if success(c) else "", "\n".join(f"{bnames[b]}: {res}" for b, res in c["batches"]), "\n".join(m["name"] for m in c["team"]),
        c["owner"], c["one_liner"], c["sector"], c["stage"], c["region"], c["link"], "\n".join(c["notes"]), "yes"] for c in ordered],
      [7, 22, 9, 46, 30, 24, 40, 18, 22, 14, 28, 50, 12])
sheet("Team", ["Startup ID", "Startup", "Member", "Role", "Phone", "Telegram", "Email", "From batch", "Owner?"],
      [[c["id"], c["name"], m["name"], m["role"], m["phone"], m["telegram"], m["email"], m["source"], "yes" if m["name"] == c["owner"] else ""]
       for c in ordered for m in c["team"]],
      [9, 22, 30, 20, 16, 20, 30, 10, 8])
sheet("Participants (no startup)", ["Batch", "Name", "What they did", "Phone", "Telegram", "Email"],
      [[bnames[p["batch"]], p["name"], p["detail"], p["phone"], p["telegram"], p["email"]] for p in people],
      [34, 30, 50, 16, 20, 30])
sheet("Batches", ["ID", "Batch", "Date", "Place", "Startup cards"],
      [[b[0], b[1], b[2], b[3], sum(1 for c in ordered if any(x[0] == b[0] for x in c["batches"]))] for b in BATCHES],
      [10, 34, 12, 34, 14])
sheet("Check these", ["#", "Question for Valijon"], [[i, t] for i, t in enumerate(checks, 1)], [5, 110])
OUT.parent.mkdir(parents=True, exist_ok=True)
out.save(OUT)
import json
json.dump({"batches": [dict(zip(("id", "name", "held_on", "place"), b)) for b in BATCHES],
           "startups": [{"id": c["id"], "name": c["name"], "one_liner": c["one_liner"], "sector": c["sector"], "stage": c["stage"], "region": c["region"],
                         "link": c["link"], "notes": "\n".join(c["notes"]), "owner": c["owner"], "batches": c["batches"], "team": c["team"]} for c in ordered]},
          open(OUT.with_suffix(".json"), "w"), ensure_ascii=False, indent=1)
OUT.with_suffix(".json").chmod(0o600)
print(f"{len(ordered)} startup cards, {sum(len(c['team']) for c in ordered)} team members, {len(people)} participants without a startup, {len(checks)} checks -> {OUT}")
