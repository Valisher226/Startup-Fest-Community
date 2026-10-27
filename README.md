# Startup Fest Community Platform (demo)

A clickable demo of the Startup Fest community platform for founders, mentors, investors, companies, small businesses, scouting partners and the Startup Fest team. It matches the design of [startupfest.vercel.app](https://startupfest.vercel.app/uz) and works in Uzbek, Russian and English.

Everything runs in the browser with sample data. Nothing is sent anywhere.

## Open the demo

1. Download this repository (Code → Download ZIP) and unzip it.
2. Open `demo/index.html` in Chrome, Safari, Edge or Firefox. No internet or installation is needed.
3. Sign in with one of the logins in [`LOGINS.txt`](LOGINS.txt). Every member type has its own login page.

| Member type | Login | Password |
|---|---|---|
| Participant | aziza@demo.startupfest.uz | Founder#2026 |
| Mentor | bekzod@demo.startupfest.uz | Mentor#2026 |
| Investor | dilnoza@demo.startupfest.uz | Investor#2026 |
| Company | agrovodiy@demo.startupfest.uz | Company#2026 |
| Small business | buxoroipak@demo.startupfest.uz | Business#2026 |
| Scouting partner | scouting@demo.startupfest.uz | Scout#2026 |
| Org team | team@demo.startupfest.uz | Team#2026 (then a 6-digit code shown on screen) |

These are demo accounts only. What you do is saved in your own browser; "Reset demo" at the bottom of any page starts over.

## What is inside

| Version | Theme |
|---|---|
| v1 | Clickable prototype |
| v2 | Core loops: sign-up, points and badges, check-in, 100-day pilots |
| v3 | Uzbek/Russian, regions, the season and National Final |
| v4 | The website's design, guilds and paying partners |
| v5 | Content engine: Telegram posts, Instagram cards |
| v6 | Logins per member type, step-by-step sign-up, mentors, judging, peer groups |
| v7 | Investors: verification, deal rooms, VC Battle |
| v8 | Trust: permissions, audit log, privacy centre, two-step code |
| v9 | Telegram bot and mini-app (simulated), tickets and payments, offline check-in |
| v10 | Catalyst franchise: partner countries, playbook builder, analytics, language packs, impact report |

`demo/` is v10, which includes everything above. The full plan, including the proposed v11–v20 for the real platform, is in [`ROADMAP.md`](ROADMAP.md); `demo/README.txt` explains what to click.

All people, startups, companies and numbers are sample data, except 14 regions and the $410K in Catalyst deals. Partner countries in v10 are examples, not agreements. Uzbek and Russian texts are draft translations.

## Build and test

The source for every version is in `platform/src/v1` … `platform/src/v10`. See [`platform/BUILD.txt`](platform/BUILD.txt) for details.

```sh
cd platform
npm install jsdom@24                        # once, for the tests
python3 package.py src/v10 v10 build        # builds build/v10/StartupFest-Platform-v10 and a zip
cd build/v10/StartupFest-Platform-v10
EXTRA=../../../test10.js node ../../../test.js index.html   # 313 checks from v2 to v10
node ../../../crawl_lang.js index.html                      # renders every page in Uzbek and Russian
```
