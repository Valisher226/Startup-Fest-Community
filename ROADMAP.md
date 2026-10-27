# Startup Fest Platform: roadmap v1 → v10

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
