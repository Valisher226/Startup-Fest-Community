// v6 data: accounts for every member type, Common App-style sign-up, mentors, judging, peer groups, recognition
SF.VERSION = 'v6';
SF.ROADMAP.forEach(r => { if (r[0] === 'v5') r[3] = 'done'; if (r[0] === 'v6') { r[3] = 'now'; r[1] = 'Accounts, mentors, judges and peer groups'; r[2] = 'A separate login for every member type; a step-by-step sign-up where you first choose your member type; office hours with mentors; judging scorecards with a live leaderboard; paid peer groups of 8; Champion and Fellow applications and renewals.'; } if (r[0] === 'v7') r[3] = 'next'; });

// two more member types: small businesses and scouting partners
Object.assign(SF.ROLES, {
  sme: { label: 'Small business', color: '#6A3FB5',
    persona: { name: 'Buxoro Ipak', region: 'Bukhara', fields: { owner: 'Nodira Yusupova', business: 'Silk workshop and shop', size: '12 staff', need: 'Online sales' } } },
  scout: { label: 'Scouting partner', color: '#0E7C86',
    persona: { name: 'Silk Road Bank', region: 'Tashkent city', fields: { contact: 'Kamola Ergasheva', focus: 'FinTech, AgriTech', pace: 'Every quarter' } } },
});
// keep the org team last in every list
(() => { const o = SF.ROLES.org; delete SF.ROLES.org; SF.ROLES.org = o; })();
Object.assign(SF.ROLE_FIELDS, {
  sme: [
    { k: 'business', label: 'What your business does', ph: 'e.g. Silk workshop and shop' },
    { k: 'size', label: 'Team size', type: 'select', options: ['1–5 staff', '6–20 staff', '21–50 staff'] },
    { k: 'need', label: 'Main need', type: 'select', options: ['Online sales', 'Website or app', 'Accounting', 'Marketing', 'Delivery'] } ],
  scout: [
    { k: 'focus', label: 'Sectors you scout', ph: 'e.g. FinTech, AgriTech' },
    { k: 'pace', label: 'How often you need startups', type: 'select', options: ['Once', 'Every quarter', 'Every month'] },
    { k: 'contact', label: 'Contact person', ph: 'e.g. Head of Innovation' } ],
});
Object.assign(SF.FIELD_ON_CARD, { sme: 'business', scout: 'focus' });
SF.ROLE_INFO = {
  participant: ['Founders, students and teams', 'Apply to Catalyst briefs, take gigs, book mentors, compete in the season.'],
  mentor: ['Experts who give their time', 'Office hours with founders, judging at regional stages, peer-group moderation.'],
  investor: ['Angels, funds and corporate VCs', 'Curated deal flow from 14 regions and the VC Battle.'],
  company: ['Large and medium companies', 'Post real problems, host Catalyst days, run 100-day pilots.'],
  sme: ['Small businesses and shops', 'Pay for access to startups and student builders who solve everyday problems.'],
  scout: ['Banks, funds and corporates that scout', 'Ask Startup Fest to recommend startups. We charge a sourcing fee.'],
  org: ['Startup Fest staff', 'Invite only. Ask the Startup Fest team for an account.'],
};

// demo accounts — the same list is in LOGINS.txt next to index.html
SF.DEMO_ACCOUNTS = [
  { id: 'acc-participant', role: 'participant', email: 'aziza@demo.startupfest.uz', pass: 'Founder#2026', contact: 'Aziza Rahimova' },
  { id: 'acc-mentor', role: 'mentor', email: 'bekzod@demo.startupfest.uz', pass: 'Mentor#2026', contact: 'Bekzod Tursunov' },
  { id: 'acc-investor', role: 'investor', email: 'dilnoza@demo.startupfest.uz', pass: 'Investor#2026', contact: 'Dilnoza Karimova' },
  { id: 'acc-company', role: 'company', email: 'agrovodiy@demo.startupfest.uz', pass: 'Company#2026', contact: 'Rustam Aliev' },
  { id: 'acc-sme', role: 'sme', email: 'buxoroipak@demo.startupfest.uz', pass: 'Business#2026', contact: 'Nodira Yusupova' },
  { id: 'acc-scout', role: 'scout', email: 'scouting@demo.startupfest.uz', pass: 'Scout#2026', contact: 'Kamola Ergasheva' },
  { id: 'acc-org', role: 'org', email: 'team@demo.startupfest.uz', pass: 'Team#2026', contact: 'Valijon Narimov' },
];

// sign-up questions after the profile step (Common App style "writing" step)
SF.SIGNUP_TOPICS = ['Pitching', 'Pricing', 'Fundraising', 'Product', 'Legal', 'Marketing', 'Hiring', 'Export'];
SF.SME_NEEDS = ['Website or app', 'Online sales', 'Accounting', 'Marketing', 'Delivery', 'Hiring students'];
SF.HEARD = ['Telegram channel', 'Instagram', 'A friend', 'My school or university', 'A Startup Fest event', 'Other'];
SF.SPOKEN = ['Uzbek', 'Russian', 'English', 'Karakalpak'];

/* ---------- mentors and office hours ---------- */
SF.OH_DAYS = [['Mon', '3 Nov'], ['Tue', '4 Nov'], ['Wed', '5 Nov'], ['Thu', '6 Nov'], ['Fri', '7 Nov']];
SF.OH_TIMES = ['10:00', '14:00', '17:00', '19:00'];
SF.MENTORS = [
  { n: 'Bekzod Tursunov', exp: 'FinTech', co: 'Silk Road Bank', region: 'Tashkent city', langs: 'Uzbek, Russian, English', rating: 4.9, hours: 31, topics: ['Pricing', 'Fundraising'] },
  { n: 'Malika Ergasheva', exp: 'Marketing', co: 'Uzum', region: 'Tashkent city', langs: 'Uzbek, Russian', rating: 4.8, hours: 22, topics: ['Marketing', 'Pitching'] },
  { n: 'Jasur Qodirov', exp: 'Energy & Industry', co: 'Samarkand Textile Group', region: 'Samarkand', langs: 'Uzbek, Russian', rating: 4.7, hours: 18, topics: ['Export', 'Product'] },
  { n: 'Prof. Ulug‘bek Karimov', exp: 'AgriTech', co: 'Samarkand State University', region: 'Samarkand', langs: 'Uzbek, Russian, English', rating: 4.9, hours: 40, topics: ['Product', 'Pitching'] },
  { n: 'Zarina Hamidova', exp: 'Legal', co: 'Kosta Legal', region: 'Tashkent city', langs: 'Uzbek, Russian, English', rating: 4.6, hours: 12, topics: ['Legal', 'Fundraising'] },
  { n: 'Timur Nazarov', exp: 'Product', co: 'EPAM Tashkent', region: 'Online', langs: 'Russian, English', rating: 4.8, hours: 27, topics: ['Product', 'Hiring'] },
];
SF.OH_AVAIL = {
  'Bekzod Tursunov': ['Mon 19:00', 'Tue 14:00', 'Thu 19:00', 'Fri 10:00'],
  'Malika Ergasheva': ['Mon 14:00', 'Wed 17:00', 'Wed 19:00'],
  'Jasur Qodirov': ['Tue 10:00', 'Thu 14:00'],
  'Prof. Ulug‘bek Karimov': ['Mon 10:00', 'Wed 10:00', 'Fri 14:00'],
  'Zarina Hamidova': ['Tue 19:00', 'Thu 17:00'],
  'Timur Nazarov': ['Mon 17:00', 'Tue 17:00', 'Fri 19:00'],
};

/* ---------- judging ---------- */
SF.CRITERIA = [['problem', 'Problem and insight', 25], ['solution', 'Solution and demo', 25], ['traction', 'Traction and evidence', 20], ['team', 'Team', 15], ['impact', 'Impact on the region', 15]];
SF.JUDGING = [
  { id: 'j-sam', title: 'Regional stage · Samarkand', region: 'Samarkand', date: '20 Nov', judges: ['Bekzod Tursunov', 'Jasur Qodirov', 'Prof. Ulug‘bek Karimov'] },
  { id: 'j-fer', title: 'Regional stage · Fergana', region: 'Fergana', date: '27 Nov', judges: ['Bekzod Tursunov', 'Rustam Aliev', 'Madina Yo‘ldosheva'] },
];
SF.weighted = sc => sc ? Math.round(SF.CRITERIA.reduce((a, [k, , w]) => a + (+sc[k] || 0) * w, 0) / 10) : 0;

/* ---------- peer groups (paid tier) ---------- */
SF.PEER_PRICE = 150000;
SF.PEER_GROUPS = [
  { id: 'pg1', name: 'AgriTech founders · Samarkand', guild: 'AgriTech & Food', mod: 'Prof. Ulug‘bek Karimov', when: 'First Tuesday · 19:00 · Youth Center, Samarkand', next: '4 Nov',
    members: ['Sanjar Bekov', 'Temur Rasulov', 'Laylo Usmonova', 'Doniyor Akramov', 'Shahzoda Rajabova', 'Otabek Mirzayev'] },
  { id: 'pg2', name: 'FinTech builders · Tashkent', guild: 'FinTech', mod: 'Bekzod Tursunov', when: 'Every second Thursday · 19:00 · IT Park', next: '6 Nov',
    members: ['Alisher Tojiev', 'Mohira Saidova', 'Javlon Rustamov', 'Kamron Ahmedov', 'Sevara Ismoilova', 'Bobur Karimov', 'Nilufar Qosimova', 'Akbar Yusupov'] },
  { id: 'pg3', name: 'University founders · online', guild: 'All guilds', mod: 'Timur Nazarov', when: 'Every Sunday · 20:00 · online', next: '9 Nov',
    members: ['Asal Normatova', 'Ibrohim Sharipov', 'Diyora Xolmatova', 'Ravshan Ergashev', 'Madina Qurbonova'] },
];

/* ---------- recognition: Champions and Fellows ---------- */
SF.RECOG = [
  { k: 'Champion', min: 1000, perks: ['Free peer group', 'Champion badge on your ID', 'Front-row seats at the National Final'], needs: ['1,000 points', 'Hosted or helped at 2+ events', 'Two references from members'] },
  { k: 'Fellow', min: 2000, perks: ['Seat at the yearly feedback session', 'Paid trip to a partner country event', 'Fellow badge on your ID'], needs: ['2,000 points', 'A year as a Champion', 'A project that helped your region'] },
];
Object.assign(SF.RULES, { book: 5, ohdone: 20, score: 10, peer: 10, recog: 0 });

const fe5 = SF.freshExtra;
SF.ALL_PLANS.push({ id: 'peer', name: 'Peer group', price: SF.PEER_PRICE, per: 'month', perks: ['Monthly session with 7 founders', 'A moderator from the mentor pool', 'Shared notes and goals'] });
SF.freshExtra = () => { const b = fe5(); return {
  ...b, subs: { ...b.subs, 'Buxoro Ipak': { plan: 'sme-start', since: 'Sep 2026', renews: '–' } },
  role: 'participant', session: null, remember: true,
  accounts: SF.DEMO_ACCOUNTS.map(a => ({ ...a, created: 'Sep 2026', last: '' })),
  slot: Object.fromEntries(SF.DEMO_ACCOUNTS.map(a => [a.role, a.id])),
  signup: { step: 0, type: '', data: {}, done: [] },
  avail: JSON.parse(JSON.stringify(SF.OH_AVAIL)),
  bookings: [
    { id: 'bk1', mentor: 'Bekzod Tursunov', by: 'Aziza Rahimova', team: 'AgroLens', slot: 'Tue 14:00', topic: 'How to price drone scans for farms', status: 'Booked' },
    { id: 'bk2', mentor: 'Bekzod Tursunov', by: 'Sanjar Bekov', team: 'Suvchi', slot: 'Mon 19:00', topic: 'Preparing for a bank pilot', status: 'Booked' },
    { id: 'bk0', mentor: 'Malika Ergasheva', by: 'Aziza Rahimova', team: 'AgroLens', slot: 'Wed 17:00', week: '27 Oct', topic: 'Instagram for B2B', status: 'Done', notes: 'Post farm results weekly. Use one before/after photo per post.', rating: 5 },
  ],
  scores: {
    'j-sam': {
      'Jasur Qodirov': { AgroLens: { problem: 8, solution: 7, traction: 6, team: 8, impact: 9 }, 'Ipak Code': { problem: 7, solution: 8, traction: 7, team: 7, impact: 6 }, 'Registon AR': { problem: 6, solution: 7, traction: 5, team: 7, impact: 7 } },
      'Prof. Ulug‘bek Karimov': { AgroLens: { problem: 9, solution: 8, traction: 6, team: 7, impact: 9 }, 'Ipak Code': { problem: 7, solution: 7, traction: 8, team: 8, impact: 6 } },
    },
    'j-fer': { 'Rustam Aliev': { TexTrace: { problem: 8, solution: 8, traction: 7, team: 7, impact: 8 }, 'Qo‘qon Craft': { problem: 7, solution: 6, traction: 6, team: 8, impact: 8 } } },
  },
  judgeDraft: {}, locked: {},
  peer: { joined: { pg1: [], pg2: [], pg3: [] }, waitlist: { pg2: [] },
    notes: { pg1: [{ d: '7 Oct', by: 'Prof. Ulug‘bek Karimov', t: 'Sanjar shared his bank pilot pitch. Next time everyone brings one number they want to move this month.' }],
      pg2: [{ d: '9 Oct', by: 'Bekzod Tursunov', t: 'Talked about Central Bank sandbox rules. Mohira will share her application template.' }], pg3: [] } },
  recog: [
    { id: 'fa1', name: 'Bekzod Tursunov', role: 'mentor', level: 'Champion', status: 'Approved', since: 'Nov 2025', renews: 'Nov 2026', story: '31 office hours and judging at 3 regional stages.' },
    { id: 'fa2', name: 'Sanjar Bekov', role: 'participant', level: 'Champion', status: 'Submitted', since: '', renews: '', story: 'Ran 4 Startup Nights in Khorezm and brought 120 new members.' },
    { id: 'fa3', name: 'Jasur Qodirov', role: 'company', level: 'Fellow', status: 'Submitted', since: '', renews: '', story: 'Hosted 2 Catalyst days; 3 pilots became contracts.' },
    { id: 'fa4', name: 'Laylo Usmonova', role: 'participant', level: 'Champion', status: 'Approved', since: 'Mar 2026', renews: 'Mar 2027', story: 'Started the Startup Fest club at Samarkand State University.' },
  ],
}; };
