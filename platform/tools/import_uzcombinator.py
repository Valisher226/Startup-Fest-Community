"""Turn the UzCombinator startup directory into portfolio rows: a review sheet for Valijon and SQL.

    python3 import_uzcombinator.py <startups.json> <demo_day_ranking.json> <portfolio_snapshot.json> <out dir>

Inputs come from fetch_uzc.py (public pages of uzcombinator.uz) and a read-only snapshot of the
current portfolio (id, name, team names). Nothing here talks to the database: the SQL file is
applied by hand, to staging first.

Rules
- A UzCombinator startup that is already in the portfolio (same name, founder names checked) is NOT
  added again: it gets the UzCombinator batch, and its empty fields are filled; nothing is overwritten.
- Demo Day amounts are "soft commitments made on Demo Day" (uzcombinator.uz/en/demo-day), not money
  received, so they are written as "$X soft commitment at UzCombinator Demo Day" and the website
  leaves them out of the "raised" total.
- Founders' names and roles are public on uzcombinator.uz; no phones or emails are added.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

import openpyxl
from openpyxl.styles import Alignment, Font, PatternFill

SRC, RANK, SNAP, OUT = (Path(a) for a in sys.argv[1:5])
OUT.mkdir(parents=True, exist_ok=True)
startups = json.load(open(SRC))["startups"]
ranking = json.load(open(RANK))
snap = json.load(open(SNAP))

BATCHES = [
    {"id": "uzc-b1", "name": "UzCombinator Batch 1", "held_on": "2026-03-17", "place": "Toshkent",
     "source": "https://uzcombinator.uz/en/demo-day"},
    {"id": "uzc-b2", "name": "UzCombinator Batch 2", "held_on": "2026-10-23", "place": "Founders Cafe, Toshkent",
     "source": "https://uzcombinator.uz/en/demo-day"},
]
SECTOR = {  # UzCombinator "Focus area" -> SF.PF_SECTORS (data11.js)
    "AI / ML": "AI, Data & Cybersecurity", "Cybersecurity": "AI, Data & Cybersecurity",
    "Edtech": "Edtech", "Fintech": "Fintech", "Health / Medtech": "Healthtech", "Agritech": "Agrotech",
    "E-commerce": "E-commerce & Retail", "Logistics": "Logistics & Transport", "Proptech": "Proptech & Construction",
    "Media / Content": "Media & Entertainment", "Hardware & IoT": "Industry & Manufacturing",
    "Drones": "Industry & Manufacturing",
    # no matching key: kept as Other, original shown in the sheet
    "SaaS / Enterprise": "Other", "Foodtech": "Other", "Lifestyle": "Other", "HRtech": "Other", "Legaltech": "Other",
}
REGION = {"toshkent": "Toshkent shahri", "tashkent": "Toshkent shahri", "farg‘ona": "Farg‘ona viloyati",
          "fargona": "Farg‘ona viloyati", "andijon": "Andijon viloyati", "buxoro": "Buxoro viloyati",
          "samarqand": "Samarqand viloyati", "namangan": "Namangan viloyati", "xorazm": "Xorazm viloyati",
          "nukus": "Qoraqalpog‘iston Respublikasi", "chicago": "Chicago, AQSh"}


def fold(s):
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "", s)


def key(name):
    k = fold(name)
    for suf in ("technologies", "uz", "app", "ai", "io"):
        if k.endswith(suf) and len(k) > len(suf) + 3:
            k = k[: -len(suf)]
    return k


def translit(s):  # Uzbek/Russian spellings of the same name: kh/x, sh, yo/io, double letters
    s = fold(s).replace("kh", "x").replace("h", "x").replace("yo", "o").replace("io", "o").replace("q", "k")
    return re.sub(r"(.)\1+", r"\1", s)


def people_overlap(a, b):
    ta = {translit(w) for n in a for w in re.split(r"[\s’'`ʻʼ-]+", n) if len(fold(w)) > 3}
    tb = {translit(w) for n in b for w in re.split(r"[\s’'`ʻʼ-]+", n) if len(fold(w)) > 3}
    return sorted(ta & tb)


def money(n):
    return "$" + f"{n:,}"


rank_by = {key(r["startup"]): r for r in ranking}
snap_by = {}
for s in snap:
    snap_by.setdefault(key(s["name"]), s)

rows, matched_ids = [], set()
order = sorted(startups, key=lambda r: (r["en"]["facts"].get("Batch", ""), r["en"]["ld_name"].lower()))
n = 0
for r in order:
    en, uz = r["en"], r["uz"]
    name = en["ld_name"] or uz["ld_name"]
    batch = {"UzC B1": "uzc-b1", "UzC B2": "uzc-b2"}[en["facts"]["Batch"]]
    focus = en["facts"].get("Focus area", "")
    status = en["facts"].get("Status", "Active").lower()
    hq = en["facts"].get("Headquarters", "") or en["location"]
    founders = [{"name": f["name"].strip(), "role": f["role"].strip()} for f in en["founders"] if f["name"].strip()]
    # Demo Day amount: exact ranking first, then the "Raised" fact on the startup's own page
    rk = rank_by.get(key(name))
    amount, amount_src = None, ""
    if rk:
        amount, amount_src = rk["amount"], "Demo Day ranking (exact)"
    elif en["facts"].get("Raised"):
        m = re.match(r"\$([\d.]+)\s*([KM]?)", en["facts"]["Raised"])
        if m:
            amount = int(float(m.group(1)) * {"K": 1000, "M": 1000000, "": 1}[m.group(2)])
            amount_src = f"startup page 'Raised: {en['facts']['Raised']}' (rounded)"
    ach = f"{money(amount)} soft commitment at UzCombinator Demo Day" if amount else ""
    # already in the portfolio?
    ex = snap_by.get(key(name))
    match, why = "", ""
    if ex:
        common = people_overlap([f["name"] for f in founders] + ([rk["founder"]] if rk else []), ex["team"])
        match = ex["id"]
        why = ("same founder: " + ", ".join(common)) if common else "SAME NAME ONLY, founders differ: check"
        matched_ids.add(ex["id"])
    if not match:
        n += 1
    rows.append({
        "id": match or f"U{n:03d}", "existing": bool(match), "match_check": why, "name": name, "batch": batch,
        "one_liner": uz["one_liner"] or en["one_liner"], "one_liner_en": en["one_liner"],
        "focus_area": focus, "sector": SECTOR.get(focus, "Other"), "status": "closed" if status == "closed" else "active",
        "region": REGION.get(hq.strip().lower(), hq.strip()), "hq_raw": hq, "link": en["website"],
        "team_size": en["facts"].get("Team size", ""), "achievement": ach, "amount": amount, "amount_src": amount_src,
        "founders": founders, "source": r["source_en"], "source_uz": r["source_uz"],
        "existing_name": ex["name"] if ex else "", "existing_team": ", ".join(ex["team"]) if ex else "",
        "existing_fields": ex if ex else {},
    })

# sort: biggest commitments first, then the rest by name; after the Catalyst startups (sort_order 1-67)
new = [x for x in rows if not x["existing"]]
for i, x in enumerate(sorted(new, key=lambda x: (-(x["amount"] or 0), x["name"].lower()))):
    x["sort_order"] = 101 + i


def q(v):
    return "null" if v is None else "'" + str(v).replace("'", "''") + "'"


sql = ["-- UzCombinator startups into the portfolio. Generated by platform/tools/import_uzcombinator.py",
       "-- Apply to STAGING first. Safe to run twice: inserts skip existing rows, updates only fill empty fields.",
       "begin;", ""]
for b in BATCHES:
    sql.append(f"insert into batches (id, name, held_on, place) values ({q(b['id'])}, {q(b['name'])}, {q(b['held_on'])}, {q(b['place'])}) on conflict (id) do nothing;")
sql.append("")
for x in rows:
    if x["existing"]:
        ex = x["existing_fields"]
        sets = []
        for col, val in (("one_liner", x["one_liner"]), ("link", x["link"]), ("region", x["region"]),
                         ("sector", x["sector"] if x["sector"] != "Other" else "")):
            if val:
                sets.append(f"{col} = case when coalesce({col}, '') = '' then {q(val)} else {col} end")
        if x["achievement"]:
            sets.append(f"achievement = case when achievement like '%UzCombinator%' then achievement when coalesce(achievement, '') = '' then {q(x['achievement'])} else achievement || '; ' || {q(x['achievement'])} end")
        sql.append(f"-- {x['name']}: already in the portfolio as {x['id']} ({x['match_check']})")
        if sets:
            sql.append(f"update startups set {', '.join(sets)}, updated_at = now() where id = {q(x['id'])};")
    else:
        sql.append(f"insert into startups (id, name, one_liner, sector, stage, region, link, status, achievement, sort_order) values "
                   f"({q(x['id'])}, {q(x['name'])}, {q(x['one_liner'])}, {q(x['sector'])}, '', {q(x['region'])}, {q(x['link'])}, "
                   f"{q(x['status'])}, {q(x['achievement'])}, {x['sort_order']}) on conflict (id) do nothing;")
        for i, f in enumerate(x["founders"]):
            owner = "true" if i == 0 else "false"
            sql.append(f"insert into team_members (startup_id, name, role, is_owner) select {q(x['id'])}, {q(f['name'])}, {q(f['role'])}, {owner} "
                       f"where not exists (select 1 from team_members where startup_id = {q(x['id'])} and name = {q(f['name'])});")
    res = x["achievement"] or "Accepted"
    sql.append(f"insert into startup_batches (startup_id, batch_id, result) values ({q(x['id'])}, {q(x['batch'])}, {q(res)}) on conflict (startup_id, batch_id) do nothing;")
    sql.append("")
sql += ["commit;", ""]
(OUT / "uzcombinator_import.sql").write_text("\n".join(sql))

# review workbook
wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Startups"
head = ["ID", "Already in portfolio?", "Founder check", "Startup", "Batch", "One-liner (uz)", "One-liner (en)",
        "UzC focus area", "Sector (portfolio)", "Status", "Region", "Website", "Team size (UzC)",
        "Demo Day soft commitment", "Amount source", "Founders (UzC)", "In portfolio as", "Current team in portfolio",
        "Source (en)", "Source (uz)", "Include? (Valijon)"]
ws.append(head)
for x in rows:
    ws.append([x["id"], "yes" if x["existing"] else "new", x["match_check"], x["name"], x["batch"], x["one_liner"],
               x["one_liner_en"], x["focus_area"], x["sector"], x["status"], x["region"], x["link"], x["team_size"],
               x["amount"], x["amount_src"], "; ".join(f"{f['name']} ({f['role']})" if f["role"] else f["name"] for f in x["founders"]),
               x["existing_name"], x["existing_team"], x["source"], x["source_uz"], ""])
bold, fill = Font(bold=True, color="FFFFFF"), PatternFill("solid", fgColor="C0261E")
for c in ws[1]:
    c.font, c.fill, c.alignment = bold, fill, Alignment(wrap_text=True, vertical="top")
for col, w in zip("ABCDEFGHIJKLMNOPQRSTU", [7, 10, 30, 20, 9, 40, 40, 16, 22, 8, 18, 28, 10, 12, 26, 45, 16, 40, 40, 40, 12]):
    ws.column_dimensions[col].width = w
for row in ws.iter_rows(min_row=2):
    for c in row:
        c.alignment = Alignment(wrap_text=True, vertical="top")
    row[13].number_format = '"$"#,##0'
ws.freeze_panes = "E2"
ws.auto_filter.ref = ws.dimensions

chk = wb.create_sheet("Check these")
chk.append(["#", "What to check", "Startups", "What the import does now"])
same_name = [x["name"] for x in rows if x["existing"] and x["match_check"].startswith("SAME NAME ONLY")]
other = [f"{x['name']} ({x['focus_area']})" for x in rows if x["sector"] == "Other" and not x["existing"]]
nolink = [x["name"] for x in rows if not x["link"]]
approx = [f"{x['name']} {money(x['amount'])}" for x in rows if x["amount"] and "rounded" in x["amount_src"]]
closed = [x["name"] for x in rows if x["status"] == "closed"]
items = [
    ("Same name but different founders. Same company?", ", ".join(same_name) or "-", "Treated as the same company (UzC batch added, empty fields filled). If different, give the UzC one a new ID."),
    ("Demo Day amounts are soft commitments, not money received.", "all with an amount", "Shown as 'committed' and left out of the 'raised' total. If you know which were paid, tell me and they become 'investment from …'."),
    ("Amounts taken from the startup's own page (rounded, e.g. $150K), not from the Demo Day ranking.", ", ".join(approx) or "-", "Used as is."),
    ("Focus areas with no matching portfolio sector.", ", ".join(other) or "-", "Sector = Other. Pick a better one if you like."),
    ("No website on UzCombinator.", ", ".join(nolink) or "-", "Link left empty."),
    ("Closed according to UzCombinator.", ", ".join(closed) or "-", "Status = closed (still listed, as with Catalyst startups)."),
    ("New startups have no login yet.", f"{len(new)} new", "They show in the portfolio, but founders cannot check in until logins are made (load step, like Catalyst)."),
    ("Stage is unknown for all of them.", "all", "Stage left empty ('Not specified'); founders fill it at check-in."),
]
for i, (a, b, c) in enumerate(items, 1):
    chk.append([i, a, b, c])
for c in chk[1]:
    c.font, c.fill = bold, fill
for col, w in zip("ABCD", [4, 55, 70, 60]):
    chk.column_dimensions[col].width = w
for row in chk.iter_rows(min_row=2):
    for c in row:
        c.alignment = Alignment(wrap_text=True, vertical="top")

src = wb.create_sheet("Sources")
for line in [["Source", "URL", "Fetched"],
             ["UzCombinator llms.txt (batch counts, list of 55)", "https://uzcombinator.uz/llms.txt", "2026-11-23"],
             ["Startup directory (one page per startup, uz + en)", "https://uzcombinator.uz/en/startup-directory", "2026-11-23"],
             ["Demo Day results and ranking ('Amounts are the soft commitments made on Demo Day.')", "https://uzcombinator.uz/en/demo-day", "2026-11-23"],
             ["Current portfolio (read-only snapshot)", "Supabase qtxudvcbujesvfrweacm, public.startups + team_members", "2026-11-23"]]:
    src.append(line)
for c in src[1]:
    c.font, c.fill = bold, fill
src.column_dimensions["A"].width, src.column_dimensions["B"].width, src.column_dimensions["C"].width = 70, 70, 12
wb.save(OUT / "uzcombinator_review.xlsx")

json.dump({"batches": BATCHES, "rows": rows}, open(OUT / "uzcombinator_rows.json", "w"), ensure_ascii=False, indent=1)
print(f"{len(rows)} startups: {len(new)} new, {len(rows) - len(new)} already in portfolio")
for x in rows:
    if x["existing"]:
        print(f"  {x['id']} {x['name']:<20} <- {x['match_check']}")
print("commitments:", sum(x["amount"] or 0 for x in rows), "| with amount:", sum(1 for x in rows if x["amount"]))
