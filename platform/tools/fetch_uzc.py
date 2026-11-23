"""Fetch every UzCombinator startup page (uz + en) and the Demo Day page; save raw HTML and parsed JSON.
Usage: python3 -I fetch_uzc.py <raw_dir> <out_json>"""
import html as H, json, re, sys, time, urllib.request, pathlib

RAW, OUT = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
RAW.mkdir(parents=True, exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0 (Macintosh) research-fetch"}

def get(url, name):
    f = RAW / name
    if not f.exists():
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
            f.write_bytes(r.read())
        time.sleep(0.6)
    return f.read_text("utf-8", "replace")

def strip(s): return H.unescape(re.sub(r"<[^>]+>", " ", re.sub(r"<style[^>]*>.*?</style>", " ", s, flags=re.S))).replace("\xa0", " ").strip()

def parse(h):
    d = {}
    m = re.search(r'<meta name="description" content="([^"]*)"', h); d["one_liner"] = H.unescape(m.group(1)) if m else ""
    m = re.search(r"<title>([^<]*)</title>", h); d["title"] = H.unescape(m.group(1)) if m else ""
    facts = {}
    for dt, dd in re.findall(r"<dt[^>]*>(.*?)</dt>.*?<dd[^>]*>(.*?)</dd>", h, re.S):
        k, v = strip(dt), re.sub(r"\s+", " ", strip(dd))
        if k and k not in facts and len(k) < 40: facts[k] = v
    d["facts"] = facts
    m = re.search(r'href="([^"]+)"[^>]*aria-label="Website"', h) or re.search(r'aria-label="Website"[^>]*href="([^"]+)"', h)
    d["website"] = H.unescape(m.group(1)) if m else ""
    d["socials"] = sorted(set(re.findall(r'href="(https://(?:t\.me|www\.linkedin\.com/company|instagram\.com|www\.instagram\.com)/[^"]+)"[^>]*aria-label="(?!Telegram"|LinkedIn"|Instagram")', h)))
    m = re.search(r'<script type="application/ld\+json">(.*?)</script>', h, re.S)
    org = {}
    if m:
        for node in json.loads(m.group(1)).get("@graph", []):
            if node.get("@type") == "Organization": org = node
    d["ld_name"] = org.get("name", ""); d["ld_desc"] = org.get("description", ""); d["batch_kw"] = org.get("keywords", "")
    d["logo"] = org.get("logo", ""); d["location"] = (org.get("location") or {}).get("name", "")
    d["employees"] = (org.get("numberOfEmployees") or {}).get("value")
    d["founders"] = [{"name": p.get("name", ""), "role": p.get("jobTitle", ""), "linkedin": p.get("sameAs", "")} for p in org.get("founder", []) or []]
    return d

slugs = [l.rstrip("/").split("/")[-1] for l in open(sys.argv[3]) if re.search(r"/startup-directory/[a-z0-9-]+$", l.strip())]
rows = []
for s in slugs:
    uz = parse(get(f"https://uzcombinator.uz/startup-directory/{s}", f"{s}.uz.html"))
    en = parse(get(f"https://uzcombinator.uz/en/startup-directory/{s}", f"{s}.en.html"))
    rows.append({"slug": s, "source_uz": f"https://uzcombinator.uz/startup-directory/{s}", "source_en": f"https://uzcombinator.uz/en/startup-directory/{s}", "uz": uz, "en": en})
    print(s, "|", en["ld_name"], "|", en["batch_kw"], "|", en["facts"])
dd = get("https://uzcombinator.uz/en/demo-day", "demo-day.en.html")
OUT.write_text(json.dumps({"startups": rows, "fetched": time.strftime("%Y-%m-%d")}, ensure_ascii=False, indent=1))
print("saved", len(rows))
