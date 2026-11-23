# v12 plan: Telegram bot and mini-app, for real

Written 2026-11-23. Status: **draft for Valijon to approve.** Nothing here is built yet.

**Goal (from ROADMAP.md):** members open their Startup Fest ID from Telegram on their phone.
**Target:** first founders using it by mid-December 2026; the roadmap's Jan 2027 is the public launch.

---

## 0. Decisions taken in this draft (change any of them)

These three were open questions. I picked the recommended option so the plan can be complete. If you choose differently, sections 2, 3 and 7 change; the rest stays.

| # | Question | This plan assumes | Why | If you pick the other option |
|---|---|---|---|---|
| D1 | New bot, or reuse @StartupFest_Bot? | **A new public bot** (working name `@StartupFestHubBot`; you create it in @BotFather). @StartupFest_Bot stays the team's internal Librarian. | The Librarian can open the team's ops and media files. Today one function (`gate()` in `catalyst-bot/portfolio.py`) is the only wall between founders and those files. A separate bot removes that risk entirely; the public bot simply has no access to them. | Same bot: we keep `gate()`, add every new command behind it, and add tests that every team command refuses non-staff. Cheaper, riskier. |
| D2 | Where does the bot run? | **Supabase Edge Functions** (webhook), in the same Supabase project as the portfolio. | Free, always on, no Mac needed, and it is next to the data. Webhooks also end the "Conflict" crashes. | A small server (~$5/month VPS) running Python. We could reuse `portfolio.py` as is, but someone has to keep a server patched. |
| D3 | Who are the first members? | **The 67 portfolio startups' founders first.** Open sign-up for new members comes after v12. | They already have real accounts, so v12 does not need the full v11 member database first. A real group of ~100 people to learn from. | Open sign-up now: v12 must first build member accounts for participants, mentors, etc. (adds ~2–3 weeks). |

One more thing to decide before **public** sign-up (not needed for founders): the data sits in Supabase **Seoul**. Uzbekistan's personal-data law requires citizens' personal data to be stored on servers in Uzbekistan. For ~100 founders who agreed to be in the portfolio this is a known, small risk; before thousands of members sign up, we need a plan (hosting in Uzbekistan, or legal advice). This is flagged again in section 9.

---

## 1. What exists today (checked 2026-11-21 to 23)

- **@StartupFest_Bot** (`~/catalyst-bot`, Python, python-telegram-bot 21). It is the team's file Librarian plus founder `/checkin`. It runs on Valijon's Mac with `run.sh` (polling, kept awake by `caffeinate`). It was off from 17 to 21 Nov because the Mac slept; restarted 21 Nov.
- **`/checkin`** (`portfolio.py`, 547 lines): founder sends login + password in chat (the bot deletes the password message), then an 8-step tap-to-answer form that writes to Supabase. A watcher job tells the ops group when a startup confirms.
- **Supabase** project `qtxudvcbujesvfrweacm` (Seoul). Tables: `startups` (69 rows, 2 are test), `team_members` (109), `owners` (69; already has an empty `telegram_user_id` column), `batches`, `startup_batches`, `org_staff`, `org_notes`, `change_log`; views `public_portfolio`, `public_batches`, `portfolio_status`. Row-level security is on everywhere.
- **Website v11** (`platform/src/v11`): `#/portfolio` (public), `#/portfolio/staff`, `#/founder`. Talks to Supabase with the publishable key (`sb.js`). Live at https://startup-fest-community-demo.vercel.app.
- **The demo's bot simulator (v9)** already designed the commands: `/myid`, `/events`, `/tickets`, `/digest`.

---

## 2. How it fits together

```
 Founder's phone (Telegram)
   │  chat: /start /myid /checkin /events /digest /help
   │  button: "Open Startup Fest"  ─────────────┐
   ▼                                            ▼
 Telegram servers                        Mini-app = the v11 website opened
   │ webhook (HTTPS POST + secret header)   inside Telegram (telegram-web-app.js)
   ▼                                            │ sends initData (signed by Telegram)
 Edge Function  bot      (grammY, TypeScript)   ▼
   │                                     Edge Function  tg-auth
   │                                       1. checks initData signature (HMAC)
   │                                       2. finds owners.telegram_user_id
   │                                       3. returns a normal Supabase session
   ▼                                            ▼
 Supabase Postgres  (same tables + RLS; new: events, posts, notifications, link_codes)
   ▲
   │ pg_cron every minute → Edge Function  notify  (sends queued messages slowly)
```

Plain words:
- **Webhook:** Telegram calls our function each time someone writes to the bot. Nothing has to stay awake on a laptop.
- **Mini-app:** Telegram can open a web page inside the chat. We open the existing website, so there is no second app to build.
- **initData:** when Telegram opens the mini-app it attaches "this is user 12345", signed with our bot's secret. The server checks the signature, so nobody can pretend to be someone else.
- **Service-role key:** the all-powerful Supabase key. It lives only inside Edge Functions (as a secret), never in the website or in git.

---

## 3. Phases

Each phase ends with something you can try on your phone. Estimates are working sessions with Claude, not calendar days.

### Phase 1: Foundation (≈2 sessions)
1. You create the new bot in @BotFather and send me the token through a secure path (paste into `supabase secrets set` yourself; never in chat).
2. A **staging** Supabase project (free) for building and testing, so the live portfolio is never touched by work in progress. Copy the schema with migrations; fill with test startups only.
3. Put the schema under version control: `supabase/migrations/` in this repo, starting from the current live schema (`supabase db dump --schema-only`).
4. Edge Function `bot` with grammY + `webhookCallback`, deployed with `verify_jwt = false` and protected by Telegram's `secret_token` header instead.
5. `/start`, `/help`, language choice (uz default, ru, en), bot menu and description in three languages.
- **Done when:** the new bot answers `/start` from your phone in Uzbek, with your Mac switched off.

### Phase 2: Linking Telegram to a founder account (≈2 sessions)
Two ways, both write `owners.telegram_user_id`:
- **A. One-tap link (main way):** for every startup we generate a one-time code. The founder's message contains a link `t.me/StartupFestHubBot?start=<code>`. Tapping it links their Telegram to the startup. Codes expire after 14 days and work once.
- **B. Fallback:** sign in once inside the mini-app with the existing login and password.
- Unlink and relink: `/logout` in the bot; the Org team can unlink from `#/portfolio/staff`.
- Several founders of one startup: v12 links one owner per startup (as today). Extra members linking is in "Later" (section 8).
- **Done when:** a test founder taps the link, and the bot greets them by startup name; no password typed in chat.

### Phase 3: The mini-app and "My ID" (≈3 sessions)
1. Edge Function `tg-auth`: verify initData (HMAC-SHA256 with key `HMAC("WebAppData", bot_token)`, reject if `auth_date` is older than 1 hour), look up the owner, then create a session with `auth.admin.generateLink({type:'magiclink'})` + `verifyOtp` and return it. The website stores it exactly like a password login (`sb.js` slot `founder`), so all existing RLS rules keep working.
2. Website: load `telegram-web-app.js`; when inside Telegram, skip the login page, follow Telegram's light/dark colours and the back button.
3. New page **`#/id`, My Startup Fest ID:** name, role, startup, batch and result, a QR code. The QR opens a public check page (`#/verify/<id>`) that shows only name, startup and "verified member".
4. `#/founder` (check-in) and `#/portfolio` work inside the mini-app.
5. The bot's menu button opens the mini-app; `/myid` replies with the ID card as an image plus the button.
- **Done when:** you tap "Open Startup Fest" in the bot and see your ID with a working QR, without typing a password.

### Phase 4: Commands with live data (≈3 sessions)
| Command | What it does | Data |
|---|---|---|
| `/myid` | ID card image + mini-app button | exists |
| `/checkin` | opens the check-in page in the mini-app (replaces the 8-step chat form) | exists |
| `/portfolio` | link to the public portfolio; for staff, today's confirmation counts | exists |
| `/events` | next 5 events with a "Register" button | **new tables** `events`, `event_registrations` |
| `/digest` | this week's Monday digest | **new table** `posts` |
| `/help`, `/lang`, `/logout` | | - |
| `/tickets` | **not in v12**; needs payments (v13). Shows "coming soon". | - |

The Org team adds events and posts in a new staff page `#/staff/events` and `#/staff/posts` (no developer needed). Registering writes a row; the bot confirms and adds a reminder (Phase 5).
- **Done when:** the Org team adds an event on the website and a founder registers for it from the bot.

### Phase 5: Notifications and posts (≈2 sessions)
1. Table `notifications` (who, text, send_after, sent_at, error). Everything that wants to message someone adds a row; nothing sends directly.
2. `pg_cron` calls Edge Function `notify` every minute. It sends at most 25 messages per second in total and 1 per second per person (Telegram's limits are about 30/s overall and 1/s per chat), and records failures (blocked bot, etc.).
3. Triggers:
   - Event reminder 24 h and 2 h before, for registered people.
   - Check-in reminder to linked founders whose startup is not confirmed: once a week, at most 3 times.
   - The Monday, Wednesday and Thursday posts: on the scheduled time, posted to @startupfestuz (the bot must be an admin there) and sent to people who opted in.
4. `/settings`: turn each kind of message on or off. Default: reminders on, weekly posts off (opt-in), because unwanted messages make people block the bot.
- **Done when:** a test event's reminder arrives on your phone 2 hours before it starts.

### Phase 6: Pilot with founders, then launch (≈2 sessions + 2 weeks of real use)
1. Move from staging to the live project: apply migrations, deploy functions, set the webhook. Rehearse once on staging.
2. Remove test rows (T001/T002, batch `test`, test logins) or keep them hidden with `is_test`.
3. Send the new one-tap links. Start with 10 founders you know well, then all 67.
4. Turn off `/checkin` on @StartupFest_Bot (it answers "use @StartupFestHubBot") after two weeks, so nobody is stranded.
5. Weekly review of the numbers in section 5; fix things every week.
- **Done when (v12 is finished):** at least **20 founders** have opened their ID in the mini-app on their phone, and **40 of 67 startups** are linked.

---

## 4. Database changes (staging first, then live)

```sql
-- linking
create table link_codes (code text primary key, startup_id text references startups(id),
  expires_at timestamptz not null, used_at timestamptz, used_by bigint);
-- owners.telegram_user_id already exists (bigint, unique)

-- events
create table events (id uuid primary key default gen_random_uuid(), title text not null,
  starts_at timestamptz not null, place text, region text, description text,
  capacity int, is_public boolean default true, created_by uuid);
create table event_registrations (event_id uuid references events(id), telegram_user_id bigint,
  startup_id text, created_at timestamptz default now(), primary key (event_id, telegram_user_id));

-- content and messages
create table posts (id uuid primary key default gen_random_uuid(), kind text check (kind in ('mon','wed','thu','other')),
  body_uz text, body_ru text, body_en text, send_at timestamptz, sent_at timestamptz);
create table notifications (id bigint generated always as identity primary key, telegram_user_id bigint not null,
  kind text, body text, send_after timestamptz default now(), sent_at timestamptz, error text);
create table bot_users (telegram_user_id bigint primary key, lang text default 'uz',
  wants_posts boolean default false, wants_reminders boolean default true, blocked_at timestamptz,
  first_seen timestamptz default now());
```
RLS: `events` and published `posts` readable by everyone; registrations readable by the person and staff; `link_codes`, `notifications` and `bot_users` only by the service role (Edge Functions) and staff.

---

## 5. How we will know it works (measure from day 1)

| Measure | Target by end of pilot |
|---|---|
| Startups linked to Telegram | 40 / 67 |
| Founders who opened the mini-app | 20 |
| Founders who finished check-in through the mini-app | 30 |
| Messages failed or bot blocked | under 5% |
| Bot reply time | under 2 s |
| Days the bot was down | 0 |

All of these come from the database (`bot_users`, `owners`, `notifications`, `change_log`), shown on `#/portfolio/staff`.

---

## 6. Tests

- **Unit tests (Deno):** initData check (valid, wrong signature, too old), link codes (expired, used twice), message rate limiter.
- **Bot tests:** fake Telegram updates sent to the function on staging; every command in uz/ru/en.
- **Website tests:** extend `test11.js` (now 369 checks) with `#/id`, `#/verify`, staff events and posts pages, and the "inside Telegram" mode.
- **Security checks:** a founder cannot read another startup's ID or registrations; the service-role key appears in no file in git (`git grep`); the webhook rejects requests without the secret header.
- **On real phones:** a cheap Android and an iPhone, Telegram light and dark theme, slow 3G.

---

## 7. What it costs

| Item | Cost | Note |
|---|---|---|
| Supabase Edge Functions | $0 | free plan includes 500K calls/month; v12 needs a few thousand |
| Supabase staging project | $0 | second free project in the org |
| Telegram bot | $0 | |
| Supabase Pro (optional) | $25/month | Free projects are **paused after a week without activity**. The bot keeps it active, but Pro removes the risk and adds daily backups. Recommended before the public launch. |
| Your time | ~1 h/week | approve texts, add events and posts, talk to founders |

---

## 8. Not in v12 (later)

- Tickets and payments (`/tickets`) → v13.
- Open sign-up for participants, mentors, investors, companies → after v12 (needs the member database).
- Every team member linking their own Telegram (today: one owner per startup).
- Moving data to a server in Uzbekistan → before public sign-up.
- Moving the internal Librarian bot off the Mac. It is a separate project; it can move to the same Supabase later or stay local.

---

## 9. Risks and how we handle them

| Risk | What we do |
|---|---|
| A bug exposes another founder's data | All reads go through RLS with the founder's own session; the security tests in section 6 run before every deploy. |
| The bot token or service-role key leaks | Kept only in Supabase secrets; never in git or chat; if leaked: revoke in @BotFather / rotate in Supabase (5 minutes). |
| Founders ignore the bot | Start with 10 founders you know; personal message from you with the one-tap link; reminders at most 3 times. |
| People block the bot because of too many messages | Weekly posts are opt-in; limits per person. |
| Supabase free project pauses | The bot keeps it active; upgrade to Pro before public launch. |
| Personal-data law (data in Seoul) | Fine to discuss for 100 consenting founders; must be solved before public sign-up. |
| Two bots confuse founders | Old bot's `/checkin` points to the new bot for two weeks, then stops. |

---

## 10. What I need from you

1. Approve or change decisions D1–D3 (section 0).
2. Create the new bot in @BotFather (name and @username your choice; I'll give step-by-step instructions) and put its token into Supabase secrets yourself.
3. Make the bot an admin of @startupfestuz (only for Phase 5 posts).
4. The first 10 founders for the pilot.
5. Short texts in Uzbek/Russian that should sound like Startup Fest (I'll draft, you correct).

## 11. Proposed calendar

| Week | Phases |
|---|---|
| 24–30 Nov | Phase 1, Phase 2 |
| 1–7 Dec | Phase 3 |
| 8–14 Dec | Phase 4, Phase 5 |
| 15–21 Dec | Phase 6: rehearsal, 10 founders |
| 22 Dec – 11 Jan | All 67 startups; fixes; v12 done |
