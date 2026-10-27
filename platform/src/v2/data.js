// Sample data for the Startup Fest platform demo. All people, startups and companies are fictional.
window.SF = window.SF || {};
SF.VERSION = 'v2';

SF.REGIONS = ['Tashkent city','Tashkent region','Andijan','Fergana','Namangan','Samarkand','Bukhara','Navoi','Kashkadarya','Surkhandarya','Jizzakh','Syrdarya','Khorezm','Karakalpakstan'];

SF.ROLES = {
  participant: { label: 'Participant', color: '#E5251F',
    persona: { name: 'Aziza Rahimova', region: 'Samarkand', fields: { track: 'School / lyceum / college', team: 'AgroLens', skills: 'Design, pitching' } } },
  mentor: { label: 'Mentor', color: '#E28D1D',
    persona: { name: 'Bekzod Tursunov', region: 'Tashkent city', fields: { expertise: 'FinTech', company: 'Silk Road Bank', hours: '4' } } },
  investor: { label: 'Investor', color: '#1C1514',
    persona: { name: 'Dilnoza Karimova', region: 'Tashkent city', fields: { ticket: '$10K–$50K', sectors: 'AgriTech, FinTech', stage: 'Seed' } } },
  company: { label: 'Company', color: '#2B7DE9',
    persona: { name: 'AgroVodiy Holding', region: 'Fergana', fields: { guild: 'AgriTech & Food', size: '500+ staff', contact: 'Head of Operations' } } },
  org: { label: 'Org team', color: '#8E1000',
    persona: { name: 'Startup Fest team', region: 'Tashkent city', fields: { team: 'Community & Growth' } } },
};

// Sign-up questions differ per stakeholder
SF.ROLE_FIELDS = {
  participant: [
    { k: 'track', label: 'Track', type: 'select', options: ['School / lyceum / college', 'University', 'Founder (graduated)'] },
    { k: 'team', label: 'Team or startup name', ph: 'e.g. AgroLens' },
    { k: 'skills', label: 'Skills', ph: 'e.g. Design, coding, sales' } ],
  mentor: [
    { k: 'expertise', label: 'Expertise', type: 'select', options: ['FinTech', 'AgriTech', 'Energy & Industry', 'GovTech', 'Marketing', 'Product', 'Legal'] },
    { k: 'company', label: 'Where you work', ph: 'e.g. a bank, a factory, a ministry' },
    { k: 'hours', label: 'Hours per month you can give', type: 'select', options: ['2', '4', '8', '12+'] } ],
  investor: [
    { k: 'ticket', label: 'Typical ticket', type: 'select', options: ['Under $10K', '$10K–$50K', '$50K–$200K', '$200K+'] },
    { k: 'sectors', label: 'Sectors', ph: 'e.g. AgriTech, FinTech' },
    { k: 'stage', label: 'Stage', type: 'select', options: ['Pre-seed', 'Seed', 'Series A'] } ],
  company: [
    { k: 'guild', label: 'Industry guild', type: 'select', options: ['AgriTech & Food', 'FinTech', 'Energy & Industry', 'GovTech & Regions'] },
    { k: 'size', label: 'Company size', type: 'select', options: ['Under 50 staff', '50–500 staff', '500+ staff'] },
    { k: 'contact', label: 'Your role', ph: 'e.g. Head of Innovation' } ],
};
SF.FIELD_ON_CARD = { participant: 'track', mentor: 'expertise', investor: 'ticket', company: 'guild', org: 'team' };

SF.EVENTS = [
  { id: 'e1', d: '14', m: 'NOV', title: 'Catalyst · AgriTech day', place: 'AgroVodiy farm, Fergana', type: 'Catalyst', region: 'Fergana', seats: 40, taken: 31,
    about: 'Teams visit a working cotton farm, meet the operations team and pitch fixes for irrigation waste. Winners start a 100-day pilot.',
    agenda: [['09:00', 'Arrival and check-in'], ['10:00', 'Farm tour'], ['12:00', 'Problem briefing with the owner'], ['13:30', 'Build session'], ['17:00', 'Pitches and decision']] },
  { id: 'e2', d: '20', m: 'NOV', title: 'Startup Night · Samarkand', place: 'Youth Center, Samarkand', type: 'Monthly meetup', region: 'Samarkand', seats: 80, taken: 52,
    about: 'The monthly 90-minute format: three pitches, one talk from local industry, asks and offers, then matchmaking.',
    agenda: [['18:00', 'Check-in'], ['18:10', 'Industry talk'], ['18:30', '3 pitches'], ['19:00', 'Asks and offers'], ['19:15', 'Matchmaking']] },
  { id: 'e3', d: '24', m: 'NOV', title: 'Catalyst showcase at Startup Week', place: 'Tashkent', type: 'Showcase', region: 'Tashkent city', seats: 150, taken: 118,
    about: 'Pilot results from this autumn\'s Catalyst days, presented with the host companies.', agenda: [['14:00', 'Opening'], ['14:20', 'Pilot results'], ['16:00', 'Networking']] },
  { id: 'e4', d: '05', m: 'DEC', title: 'Startup Night · Nukus', place: 'IT Park branch, Nukus', type: 'Monthly meetup', region: 'Karakalpakstan', seats: 60, taken: 19,
    about: 'The monthly format in Karakalpakstan, hosted with the IT Park branch.', agenda: [['18:00', 'Check-in'], ['18:10', 'Industry talk'], ['18:30', '3 pitches'], ['19:15', 'Matchmaking']] },
  { id: 'e5', d: '12', m: 'DEC', title: 'VC Battle', place: 'Zakovat Arena, Tashkent', type: 'Investors', region: 'Tashkent city', seats: 200, taken: 164,
    about: 'Investor teams compete to pick the best startups. The audience votes live.', agenda: [['15:00', 'Doors'], ['15:30', 'Rounds 1–3'], ['18:00', 'Final and awards']] },
  { id: 'e6', d: '15', m: 'JAN', title: 'Startup Fest School · Cohort 1 kickoff', place: 'Online', type: 'Course', region: 'Online', seats: 500, taken: 233,
    about: 'Six weeks, weekly homework, a demo day at the end. In Uzbek and Russian.', agenda: [['19:00', 'Kickoff call'], ['19:40', 'Week 1 task']] },
];

// People already registered for events (for the org check-in demo)
SF.ATTENDEES = [
  { id: 'SF-27-00317', name: 'Aziza Rahimova', role: 'participant' },
  { id: 'SF-27-04412', name: 'Javohir Ergashev', role: 'participant' },
  { id: 'SF-27-05120', name: 'Malika Yusupova', role: 'participant' },
  { id: 'SF-27-00634', name: 'Bekzod Tursunov', role: 'mentor' },
  { id: 'SF-27-06231', name: 'Otabek Nazarov', role: 'participant' },
  { id: 'SF-27-07009', name: 'Shahzoda Islomova', role: 'participant' },
];

SF.BRIEFS = [
  { id: 'b1', co: 'AgroVodiy Holding', guild: 'AgriTech & Food', problem: 'Predict cotton field water needs to cut irrigation waste by 20%.', owner: 'Head of Operations', budget: '45M UZS pilot', due: '1 Dec',
    detail: 'We irrigate 3,200 hectares on a fixed schedule. Water bills rose 30% in two years. We can share 3 seasons of field data and give a test plot of 50 hectares.' },
  { id: 'b2', co: 'Silk Road Bank', guild: 'FinTech', problem: 'Score micro-loans for bazaar traders without a credit history.', owner: 'Retail Credit Director', budget: '60M UZS pilot', due: '8 Dec',
    detail: '70% of traders who apply have no credit history. We can share anonymised payment data from our POS terminals in 4 bazaars.' },
  { id: 'b3', co: 'Navoi Metals', guild: 'Energy & Industry', problem: 'Spot conveyor belt failures early from vibration data.', owner: 'Chief Engineer', budget: '80M UZS pilot', due: '15 Dec',
    detail: 'Each unplanned stop costs about 6 hours of output. We can install sensors on 2 conveyor lines for the pilot.' },
  { id: 'b4', co: 'Fergana Region Admin', guild: 'GovTech & Regions', problem: 'Route citizen requests to the right office automatically.', owner: 'Digitalisation Dept.', budget: '30M UZS pilot', due: '20 Dec',
    detail: 'We receive about 4,000 requests a month through Telegram and the call centre. A third go to the wrong office first.' },
];
SF.STAGES = ['Applied', 'Selected', 'Catalyst day', '100-day pilot', 'Contract'];
SF.MILESTONES = ['Kick-off with the owner', 'Data access confirmed', 'First working version', 'Mid-pilot review (day 50)', 'Results measured', 'Decision meeting'];

SF.STARTUPS = [
  { n: 'AgroLens', s: 'AgriTech', r: 'Samarkand', st: 'MVP', t: 'Drone photos → crop disease alerts', team: 3, badges: ['Arena finalist'] },
  { n: 'BozorPay', s: 'FinTech', r: 'Andijan', st: 'Revenue', t: 'Payments and stock app for bazaar stalls', team: 5, badges: ['Catalyst pilot'] },
  { n: 'Suvchi', s: 'AgriTech', r: 'Khorezm', st: 'Pilot', t: 'Smart irrigation sensors for small farms', team: 4, badges: ['Catalyst pilot'] },
  { n: 'MahallaGo', s: 'GovTech', r: 'Tashkent city', st: 'MVP', t: 'Mahalla requests and announcements app', team: 4, badges: ['National finalist'] },
  { n: 'Ustoz.ai', s: 'EdTech', r: 'Namangan', st: 'Revenue', t: 'Uzbek-language AI tutor for exams', team: 6, badges: ['VC Battle'] },
  { n: 'VibraSense', s: 'Industry', r: 'Navoi', st: 'Idea', t: 'Vibration sensors for factory machines', team: 2, badges: [] },
  { n: 'TexTrace', s: 'Textile', r: 'Fergana', st: 'MVP', t: 'Cotton-to-garment tracing for exporters', team: 3, badges: ['Arena finalist'] },
  { n: "Yo'lchi", s: 'Logistics', r: 'Bukhara', st: 'Pilot', t: 'Shared trucking for regional SMEs', team: 5, badges: ['Catalyst pilot'] },
];

SF.GIGS = [
  { id: 'g1', title: 'Telegram bot for bakery orders', by: 'Non Uyi bakery', kind: 'SME', region: 'Fergana', pay: '2M UZS', type: 'Gig' },
  { id: 'g2', title: 'Junior Flutter developer', by: 'BozorPay', kind: 'Startup', region: 'Andijan', pay: 'Job', type: 'Job' },
  { id: 'g3', title: 'Logo and brand kit', by: 'Suvchi', kind: 'Startup', region: 'Khorezm', pay: '1.2M UZS', type: 'Gig' },
  { id: 'g4', title: 'Clean 2 years of sales data', by: 'AgroVodiy Holding', kind: 'Company', region: 'Fergana', pay: '3M UZS', type: 'Gig' },
  { id: 'g5', title: 'Part-time sales intern', by: 'Ustoz.ai', kind: 'Startup', region: 'Namangan', pay: 'Job', type: 'Job' },
];

SF.THREADS = [
  { id: 't1', who: 'Bekzod Tursunov', role: 'mentor', msgs: [{ me: 0, t: 'Saw your pitch at the Arena. Want feedback on pricing?' }, { me: 1, t: 'Yes please! Thursday after school?' }, { me: 0, t: 'Thursday 18:00 works. Send the deck before.' }] },
  { id: 't2', who: 'AgroVodiy Holding', role: 'company', msgs: [{ me: 0, t: 'Your crop-alert idea fits our AgriTech brief. Apply before 1 Dec.' }] },
  { id: 't3', who: 'Startup Fest team', role: 'org', msgs: [{ me: 0, t: 'Your Startup Fest ID is ready. Show the QR at every event.' }] },
];

SF.DIGEST = [
  { t: 'UzCombinator Season 3 is open', s: 'Accelerator · deadline 30 Nov', tag: 'All regions' },
  { t: 'Young Entrepreneurs championship', s: 'Grants up to 1B UZS · deadline 10 Dec', tag: 'All regions' },
  { t: 'Startup Night · Samarkand', s: 'Monthly meetup · 20 Nov', tag: 'Samarkand' },
  { t: 'Web Summit 2027 delegation call', s: 'Priority for verified members', tag: 'Fast lane' },
];
SF.LAUNCHES = [{ n: 'Ustoz.ai', t: 'Launched exam mode for 9th grade', v: 42 }, { n: 'BozorPay', t: 'First 100 bazaar stalls onboarded', v: 37 }, { n: 'TexTrace', t: 'Signed first exporter', v: 21 }];

SF.GUILDS = [
  { n: 'AgriTech & Food', st: 'Active', co: 6, p: 9 }, { n: 'FinTech', st: 'Active', co: 5, p: 7 }, { n: 'Energy & Industry', st: 'Active', co: 7, p: 11 }, { n: 'GovTech & Regions', st: 'Active', co: 3, p: 4 },
  { n: 'Textile & Fashion', st: 'Later', co: 0, p: 0 }, { n: 'Tourism & Creative', st: 'Later', co: 0, p: 0 }, { n: 'Logistics & Commerce', st: 'Later', co: 0, p: 0 }, { n: 'Health & Education', st: 'Later', co: 0, p: 0 }, { n: 'Robotics & Hardware', st: 'Later', co: 0, p: 0 },
];
SF.COUNCILS = SF.REGIONS.map((r, i) => ({ r, st: ['Samarkand', 'Fergana', 'Khorezm'].includes(r) ? 'Pilot council' : i % 4 === 0 ? 'Forming' : 'Planned',
  m: [1840, 620, 980, 1310, 870, 1520, 640, 410, 760, 390, 450, 280, 1120, 530][i], ev: [6, 1, 3, 4, 2, 5, 1, 1, 2, 1, 1, 0, 4, 2][i] }));

// Points rules and levels
SF.RULES = { register: 10, checkin: 15, apply: 25, gig: 5, upvote: 1, message: 1, intro: 3, post: 5, accept: 5, update: 5, milestone: 10, contract: 50, join: 20 };
SF.LEVELS = [['Member', 0], ['Contributor', 200], ['Host', 500], ['Champion', 1000], ['Fellow', 2000]];
SF.BADGES = {
  'First check-in': s => s.counts.checkin >= 1,
  'Regular': s => s.counts.checkin >= 3,
  'Catalyst applicant': s => s.counts.apply >= 1,
  'Builder': s => s.counts.gig >= 1,
  'Connector': s => s.counts.intro >= 2,
  'Pilot partner': s => s.counts.contract >= 1,
};

SF.ROADMAP = [
  ['v1', 'Clickable prototype', 'Five stakeholder views, weekly rhythm, events, Catalyst, Startup Earn, directory, messages, My ID with QR, org dashboard.', 'done'],
  ['v2', 'Core loops that feel real', 'Sign-up per stakeholder, points and badges from real actions, event check-in, brief pages with accept/decline, the 100-day pilot workspace, contract values, notifications, demo tools.', 'now'],
  ['v3', 'Uzbek/Russian, regions and the season', 'Uzbek, Russian and English; campus → regional → National Final with a leaderboard; regional council pages; startup profiles with consent; Startup Earn lifecycle; CSV export.', 'next'],
  ['v4', 'Guilds and paying partners', 'Guild pages, company membership tiers, mock Click/Payme checkout, SME plans, sourcing-fee requests, partner dashboards.', 'later'],
  ['v5', 'Content engine', 'Write the Monday digest, Wednesday problem and Thursday launches in the platform; Telegram post preview; Instagram card export.', 'later'],
  ['v6', 'Mentors, judges and peer groups', 'Office-hours booking, judging scorecards with a live leaderboard, peer groups of 8, Champion and Fellow applications.', 'later'],
  ['v7', 'Investors and capital', 'Verified Investor Programme, deal room, VC Battle with live voting, intro and investment tracking.', 'later'],
  ['v8', 'Real backend and accounts', 'Shared database, Telegram login, roles and permissions, camera QR scanning, data-protection compliance, a pilot in one region.', 'later'],
  ['v9', 'Telegram mini-app and payments', 'The platform inside Telegram, bot notifications, Click/Payme payments, offline check-in.', 'later'],
  ['v10', 'Catalyst franchise and scale', 'Instances for partner countries, playbook builder, partner analytics, language packs, launch readiness.', 'later'],
];
