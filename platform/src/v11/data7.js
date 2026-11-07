// v7 data: Verified Investor Programme, deal rooms, VC Battle, intros and investments
SF.VERSION = 'v7';
SF.ROADMAP.forEach(r => { if (r[0] === 'v6') r[3] = 'done'; if (r[0] === 'v7') { r[3] = 'now'; r[2] = 'The Verified Investor Programme with Org team review; a deal room per startup with access requests, NDA, documents, Q&A and soft commitments; a fundraising page for founders; VC Battle with investor team picks and live audience voting; intro tracking and logged investments that count toward value to members.'; }
  if (r[0] === 'v8') { r[3] = 'next'; r[1] = 'Trust, permissions and personal data'; r[2] = 'User management, a permissions table per member type, an audit log, a privacy centre (download or delete my data), login lockout and session timeout, camera QR check-in.'; }
  if (r[0] === 'v9') { r[1] = 'Telegram mini-app, tickets and payments'; r[2] = 'The platform inside Telegram, bot notifications, paid tickets with Click/Payme/Uzcard and an SMS code, offline check-in that syncs later.'; } });
SF.FX = 12800; // UZS per USD, for "value to members"
SF.usd = n => '$' + (n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : SF.fmt(n));

SF.RAISING = [
  { n: 'AgroLens', owner: 'participant', round: 'Pre-seed', ask: 150000, terms: 'SAFE · $1.2M cap', close: '15 Dec', metric: '3 farms paying · 210 ha covered', founder: 'Aziza Rahimova' },
  { n: 'BozorPay', round: 'Seed', ask: 400000, terms: 'Equity · $3M pre-money', close: '30 Nov', metric: '1,900 loans scored · 2.1% default rate', founder: 'Sherzod Nazarov', lead: 'Silk Road Bank' },
  { n: 'Ustoz.ai', round: 'Pre-seed', ask: 200000, terms: 'SAFE · $1.5M cap', close: '20 Dec', metric: '14 schools · 6,200 students', founder: 'Madina Rahimova' },
  { n: 'MahallaGo', round: 'Seed', ask: 350000, terms: 'Equity · $2.5M pre-money', close: '31 Jan', metric: 'Live in 2 districts of Fergana', founder: 'Javohir Islomov' },
  { n: 'Suvchi', round: 'Pre-seed', ask: 120000, terms: 'SAFE · $900K cap', close: '10 Jan', metric: 'Water use down 14% on 50 ha', founder: 'Sanjar Bekov' },
  { n: 'VibraSense', round: 'Pre-seed', ask: 180000, terms: 'Convertible note · 20% discount', close: '28 Feb', metric: 'Pilot with Navoi Metals', founder: 'Otabek Qurbonov' },
];
SF.DOCS = ['Pitch deck', 'Financial model', 'Cap table', 'Company registration', 'Traction metrics'];
SF.READY = [['deck', 'Pitch deck (10–12 slides)'], ['model', '18-month financial model'], ['cap', 'Cap table'], ['entity', 'Registered legal entity (LLC)'], ['metrics', 'Monthly metrics for the last 3 months'], ['refs', 'Two customer references'], ['mentor', 'A mentor session on fundraising']];
SF.INVEST_STAGES = ['Watching', 'Access requested', 'In data room', 'Committed', 'Invested'];
SF.INSTRUMENTS = ['SAFE', 'Equity', 'Convertible note', 'Grant'];
SF.VIP_NEEDS = [['id', 'Identity checked (passport or ID card)'], ['track', 'Two or more startup investments, or a fund licence'], ['funds', 'A statement that you can invest at least $10K this year'], ['code', 'You accept the investor code of conduct']];
SF.VIP_CODE = ['Reply to founders within 14 days', 'No fees charged to founders', 'Keep data-room documents private', 'Tell the founder honestly why you pass'];
SF.VIP_PERKS = ['Deal rooms for every raising startup', 'A seat on a VC Battle investor team', 'Verified badge on your ID', 'Quarterly deal-flow digest'];

/* ---------- VC Battle (12 Dec) ---------- */
SF.BATTLE = {
  rounds: [['Round 1', 'AgriTech and climate', ['AgroLens', 'Suvchi']], ['Round 2', 'FinTech and GovTech', ['BozorPay', 'MahallaGo']], ['Round 3', 'EdTech and industry', ['Ustoz.ai', 'VibraSense']], ['Final', 'The top 3', null]],
  teams: [{ n: 'Samarkand Angels', members: ['Dilnoza Karimova', 'Sardor Aliyev'] }, { n: 'Orient Ventures', members: ['Orient Ventures'] }, { n: 'Silk Road Bank', members: ['Silk Road Bank'] }, { n: 'IT Park Ventures', members: ['IT Park Ventures'] }],
  budget: 1000000,
};

const fe6 = SF.freshExtra;
SF.freshExtra = () => ({
  ...fe6(),
  vip: {
    'Dilnoza Karimova': { status: 'Verified', kind: 'Angel', since: 'Sep 2026', renews: 'Sep 2027', checks: ['id', 'track', 'funds', 'code'] },
    'Sardor Aliyev': { status: 'Submitted', kind: 'Angel', deals: '3', note: 'Invested in Ipak Code and two Tashkent startups.', checks: ['id', 'funds', 'code'] },
    'Orient Ventures': { status: 'Submitted', kind: 'Venture fund', deals: '11', note: 'Licensed fund, $8M under management.', checks: ['id', 'track', 'funds', 'code'] },
  },
  deal: {
    AgroLens: { commits: [{ by: 'Sardor Aliyev', amt: 20000 }, { by: 'Orient Ventures', amt: 40000 }], access: { 'Orient Ventures': 'granted', 'Sardor Aliyev': 'granted' }, nda: ['Orient Ventures', 'Sardor Aliyev'],
      qa: [{ id: 'q1', by: 'Orient Ventures', q: 'What do farms pay per hectare?', a: '$4 per hectare per season, paid after harvest.' }, { id: 'q2', by: 'Sardor Aliyev', q: 'Who flies the drones?', a: '' }], docs: ['Pitch deck', 'Financial model', 'Traction metrics'] },
    BozorPay: { commits: [{ by: 'Silk Road Bank', amt: 150000 }, { by: 'IT Park Ventures', amt: 70000 }], access: { 'Dilnoza Karimova': 'granted' }, nda: ['Dilnoza Karimova'],
      qa: [{ id: 'q3', by: 'Dilnoza Karimova', q: 'How do you collect repayments?', a: 'Daily through the stall’s Click wallet; 96% on time.' }], docs: SF.DOCS.slice() },
    'Ustoz.ai': { commits: [{ by: 'IT Park Ventures', amt: 50000 }], access: { 'Dilnoza Karimova': 'requested' }, nda: [], qa: [], docs: ['Pitch deck', 'Traction metrics'] },
    MahallaGo: { commits: [], access: {}, nda: [], qa: [], docs: ['Pitch deck'] },
    Suvchi: { commits: [{ by: 'Sardor Aliyev', amt: 10000 }], access: {}, nda: [], qa: [], docs: ['Pitch deck', 'Cap table'] },
    VibraSense: { commits: [], access: {}, nda: [], qa: [], docs: ['Pitch deck'] },
  },
  watch: { 'Dilnoza Karimova': ['MahallaGo', 'Suvchi'] },
  ready: { AgroLens: ['deck', 'model', 'metrics', 'mentor'] },
  intros: [
    { id: 'in1', by: 'Dilnoza Karimova', startup: 'BozorPay', status: 'Invested', date: 'Jul 2026' },
    { id: 'in2', by: 'Dilnoza Karimova', startup: 'Ustoz.ai', status: 'Meeting held', date: 'Oct 2026' },
    { id: 'in3', by: 'Dilnoza Karimova', startup: 'AgroLens', status: 'Requested', date: 'Oct 2026' },
    { id: 'in4', by: 'Silk Road Bank', startup: 'BozorPay', status: 'Invested', date: 'Sep 2026' },
  ],
  investments: [
    { id: 'iv1', by: 'Dilnoza Karimova', startup: 'BozorPay', amt: 50000, instr: 'SAFE', date: 'Aug 2026', via: 'Catalyst' },
    { id: 'iv2', by: 'Silk Road Bank', startup: 'BozorPay', amt: 150000, instr: 'Equity', date: 'Sep 2026', via: 'Catalyst' },
    { id: 'iv3', by: 'Sardor Aliyev', startup: 'Ipak Code', amt: 15000, instr: 'SAFE', date: 'Jun 2026', via: 'Startup Night' },
    { id: 'iv4', by: 'IT Park Ventures', startup: 'Ustoz.ai', amt: 60000, instr: 'Convertible note', date: 'May 2026', via: 'VC Battle 2025' },
  ],
  battle: { round: 0, open: false, votes: {}, voted: {}, picks: {}, done: false, winner: '' },
});
