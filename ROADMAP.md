# Startup Fest Platform: roadmap v1 → v20

Every version is a working demo that opens offline from a folder (double-click `index.html`) and is zipped for sharing.
Every version is a demo with sample data saved in the viewer's browser. From v6 each member type signs in with its own login (see LOGINS.txt). v8 shows how accounts, permissions and personal data would work on a real server.

| Version | Theme | Status |
|---|---|---|
| v1 | Clickable prototype | Done |
| v2 | Core loops that feel real | Done |
| v3 | Uzbek/Russian, regions and the season | Done |
| v4 | The website's design + guilds and paying partners | Done |
| v5 | Content engine | Done |
| v6 | Accounts, mentors, judges and peer groups | Done |
| v7 | Investors and capital | Done |
| v8 | Trust, permissions and personal data | Done |
| v9 | Telegram mini-app, tickets and payments | Done |
| v10 | Catalyst franchise and scale | Done |

### Phase 2: from demo to the real platform (proposal)

v1–v10 prove the idea with sample data in one browser. v11–v20 turn it into a live platform that real members use, starting with one region and reaching all 14 by the June Youth Month caravan. Dates are a proposal to discuss with the team.

| Version | Theme | Target | Done when |
|---|---|---|---|
| v11 | Real accounts and shared data | Dec 2026 | The Startup Fest team uses it daily with real data |
| v12 | Telegram bot and mini-app, for real | Jan 2027 | Members open their ID from Telegram on their phone |
| v13 | Real payments and receipts | Feb 2027 | A company pays a membership with Click or Payme |
| v14 | Samarkand pilot | Mar 2027 | 500 members, 3 events and 1 Catalyst day run on the platform |
| v15 | Smart matching | Apr 2027 | Half of Catalyst applications come from recommendations |
| v16 | Startup Fest School | May 2027 | Cohort 1 finishes inside the platform |
| v17 | Phones, weak internet and accessibility | May 2027 | Works well on a cheap Android on 3G |
| v18 | All 14 regions | Jun 2027 | The caravan's regional stage runs on the platform |
| v19 | Partners and open API | Sep 2027 | 3 partners connect their systems |
| v20 | The Catalyst network goes live | Dec 2027 | A partner country runs its own copy for real |

## v1: Clickable prototype (done)
- Five stakeholder views: participant, mentor, investor, company, org team
- Home with the weekly rhythm: Monday digest, Wednesday problem of the week, Thursday launches
- Events with registration, Catalyst briefs and pipeline, Startup Earn, startup directory, messages
- Community page (guilds and regional councils), My ID with a scannable QR, org dashboard

## v2: Core loops that feel real
- Sign-up per stakeholder: different questions for each role, and a differently styled ID card
- Points and badges that come from real actions; the ladder Member → Contributor → Host → Champion → Fellow
- Event pages; check-in by typing or scanning an ID; attendance gives points and badges
- Catalyst brief pages; companies accept or decline applications with a note
- A 100-day pilot workspace: milestones, weekly updates, and recording the contract value
- Contract values feed "value to members" on the dashboard
- Notifications for every role
- Demo tools: reset, and export or import a scenario file to share a demo state
- The roadmap inside the app

## v3: Uzbek/Russian, regions and the season
- The interface in Uzbek (Latin, the default), Russian and English
- The season: campus round → regional stage → National Final, with a leaderboard by region and Startup Weekend wildcards
- A page for each regional council: seats by sector (max 2 per sector, enforced), a local problem bank, quarterly results
- Public startup profiles with a "can be recommended" consent switch; scouting partners request a shortlist and track its status
- The Startup Earn lifecycle: posted → assigned → delivered → paid → rated; earnings show on the member's ID
- CSV export from the org dashboard

## v4: The website's design + guilds and paying partners (done)
- The whole app restyled to match startupfest.vercel.app: fonts, colours, floating menu, tiles, the lightning-star motif, the Catalyst hero
- Sign-up uses the website's priority-list fields
- Guild pages: members, briefs, pilots, results
- Company membership tiers (guild member, anchor, national partner) and a mock checkout (Click and Payme)
- SME access plans and requests from scouting projects with a sourcing fee
- Partner dashboard showing return: briefs posted, pilots, hires, contracts

## v5: Content engine (done)
- The org team writes the Monday digest, Wednesday problem and Thursday launches inside the platform
- Telegram post preview with one-click copy; Instagram card generator (image export)
- A content calendar and simple reach tracking

## v6: Accounts, mentors, judges and peer groups (done)
- A separate login for every member type: Participant, Mentor, Investor, Company, Small business, Scouting partner, Org team (logins in LOGINS.txt)
- Sign-up like the Common App: choose your member type first, then account, personal information, type-specific profile, questions in your own words, consent and privacy (guardian for under-18s), review and submit; progress and saved answers
- Account settings: change email and password, forgot-password flow, switch account, log out
- Booking office hours with mentors (weekly grid, notes, ratings)
- Judging scorecards for regional stages, with a live leaderboard and locking results into the season
- Peer groups of 8 (paid tier) with waiting lists and session notes
- Champion and Fellow applications, Org team review and yearly renewals

## v7: Investors and capital (done)
- The Verified Investor Programme: application, checks, a verified badge
- A deal room per startup: data room requests, NDA, Q&A, status
- A VC Battle module with live audience voting and investor team picks
- Intro tracking and logging investments, which also feed "value to members"
- Founder side: investor-readiness checklist and a fundraising tracker

## v8: Trust, permissions and personal data (done)
- User management for the Org team: invite, suspend, change member type
- A permissions table that decides what each member type can see and do
- Audit log of every sensitive action
- Privacy centre: download my data, delete my account, consent history (Uzbek personal-data law)
- Security: lockout after failed logins, session timeout, two-step code for the Org team
- Camera QR check-in at events
- What the real backend needs (database, hosting in Uzbekistan, Telegram login)

## v9: Telegram mini-app, tickets and payments (done)
- The platform inside Telegram (mini-app view plus bot notifications)
- Paid event tickets; Click, Payme and Uzcard/Humo card payments with an SMS code step
- Check-in that works offline at events with weak internet, then syncs
- Notification settings per channel

## v10: Catalyst franchise and scale (done)
- Separate instances for partner countries (free pilots in less-developed countries first)
- A Catalyst playbook builder with export
- Partner analytics across instances
- Language packs and a public impact report page
- Launch readiness: security review, load testing, support process

## v11: Real accounts and shared data
- Move from the browser to a real database (PostgreSQL) hosted in Uzbekistan, as the personal-data law requires
- Real sign-up and sign-in on a web address with HTTPS; passwords stored as salted hashes; email confirmation
- The permissions table from v8 checked on the server for every request
- An Org team admin to edit events, briefs, guilds and councils without a developer
- Backups every night, with one restore tested every month
- Import the existing contacts (event registrations, the priority list from the website) with their consent

## v12: Telegram bot and mini-app, for real
- A real bot created in @BotFather; the platform opens as a Telegram mini-app
- Telegram Login: one tap to sign in, linked to the member's account
- Real notifications: event reminders, application replies, tickets, weekly digest
- Bot commands from the v9 simulator (/myid, /events, /tickets, /digest) answering with live data
- Monday/Wednesday/Thursday posts from the content engine sent to the channel and the bot

## v13: Real payments and receipts
- Click and Payme merchant accounts connected; payments confirmed automatically
- Fiscal receipts sent to the tax system; invoices with the company's INN
- Refunds and partial refunds from the Org team's payments page
- Paid plans live: guild membership, SME access, scouting retainer, tickets, peer groups
- A monthly money report for the team

## v14: Samarkand pilot
- One region first, during the campus round: 500 members, 3 events, 1 Catalyst day, 1 regional council
- A help desk in Telegram with a 24-hour reply target, and help pages in Uzbek and Russian
- Product analytics: which pages people use, where they stop in sign-up, weekly active members
- Two feedback sessions with members, mentors and host companies; fixes shipped every week
- A go/no-go review before going to more regions

## v15: Smart matching
- Recommend Catalyst briefs to the right teams, and teams to companies, based on skills, region and track
- Mentor suggestions for each founder; investor deal flow ranked by their thesis
- Search that understands Uzbek, Russian and mixed spelling (Latin and Cyrillic)
- Startup Fest recommends startups only with their consent, and explains why each match was made
- A quality check: the team reviews matches before they are sent

## v16: Startup Fest School
- Courses with weekly lessons, homework and deadlines, in Uzbek and Russian
- Mentors review homework; progress shows on the member's ID
- Certificates with a QR that anyone can check
- Demo day at the end of each cohort, with the best teams invited to Catalyst
- Course completion feeds points, badges and the season

## v17: Phones, weak internet and accessibility
- Installable on phones (PWA); every key page works offline and syncs later
- A light mode for slow connections: smaller pages, fewer images
- Accessibility review: screen readers, contrast, larger text, keyboard use
- A Karakalpak language pack
- Speed target: key pages open in under 2 seconds on 3G

## v18: All 14 regions
- Every regional council runs its own page: seats, local problems, events and quarterly results
- Regional dashboards for the youth affairs offices
- The June Youth Month caravan's regional stage on the platform: registration, check-in, judging and results
- National Final line-up, Startup Weekend winners and the university track handled in one place
- Exports for reports to the Agency and partners

## v19: Partners and open API
- An API and webhooks so partners can connect: IT Park, universities, company HR systems
- University sign-in for students; companies post briefs and gigs from their own systems
- Partner dashboards with return on investment: pilots, hires, contracts
- Shared calendars with other ecosystem events, so dates do not clash
- Startup data is never sold: partners only get what members agreed to share

## v20: The Catalyst network goes live
- The first partner country runs its own copy of the platform, in its language, with its own data (first year free)
- A network dashboard: every country's members, pilots and value, and shared lessons
- Cross-border Catalyst: a company in one country can post a brief to teams in another
- A yearly Catalyst network meeting run on the platform
- The platform's running costs covered by its own income (memberships, SME access, sourcing fees, tickets)
