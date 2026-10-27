// v10 data: Catalyst franchise instances, playbook builder, partner analytics, language packs, public impact report, launch readiness
SF.VERSION = 'v10';
SF.ROADMAP.forEach(r => { if (r[0] === 'v9') r[3] = 'done'; if (r[0] === 'v10') { r[3] = 'now'; r[2] = 'Country instances for the Catalyst franchise (free first year for less-developed countries) with onboarding checklists; a playbook builder with export; analytics across instances; language packs including a Kyrgyz draft; a public impact report that opens without signing in; a launch-readiness checklist with a load-test simulation.'; } });

SF.INST_STAGES = ['Interested', 'Agreement', 'Onboarding', 'Pilot', 'Launched'];
SF.INSTANCES = [
  { k: 'uz', country: 'Uzbekistan', flag: '🇺🇿', city: 'Tashkent', partner: 'Startup Fest · Yoshlar Ventures', stage: 'Launched', since: '2025', langs: 'Uzbek, Russian, English', terms: 'Home instance',
    kpi: { members: 12480, active: 3920, briefs: 4, pilots: 6, contracts: 3, value: 410000, regions: 14 } },
  { k: 'kg', country: 'Kyrgyzstan', flag: '🇰🇬', city: 'Bishkek', partner: 'Tech park (sample partner)', stage: 'Pilot', since: 'Sep 2026', langs: 'Kyrgyz, Russian', terms: 'Free for the first year',
    kpi: { members: 860, active: 310, briefs: 2, pilots: 1, contracts: 0, value: 0, regions: 2 } },
  { k: 'tj', country: 'Tajikistan', flag: '🇹🇯', city: 'Dushanbe', partner: 'Innovation agency (sample partner)', stage: 'Onboarding', since: 'Nov 2026', langs: 'Tajik, Russian', terms: 'Free for the first year',
    kpi: { members: 120, active: 40, briefs: 0, pilots: 0, contracts: 0, value: 0, regions: 1 } },
  { k: 'mn', country: 'Mongolia', flag: '🇲🇳', city: 'Ulaanbaatar', partner: 'Startup hub (sample, in talks)', stage: 'Interested', since: '', langs: 'Mongolian, English', terms: 'Free for the first year',
    kpi: { members: 0, active: 0, briefs: 0, pilots: 0, contracts: 0, value: 0, regions: 0 } },
];
SF.ONBOARD = [['team', 'Local team of 3 named'], ['agree', 'Partnership agreement signed'], ['brand', 'Brand guide and Catalyst name agreed'], ['lang', 'Language pack translated'], ['hosts', '3 host companies with a named owner'], ['first', 'First Catalyst day held'], ['pilot', 'First 100-day pilot running'], ['report', 'First quarterly report sent']];
SF.PLAYBOOK = [
  ['hosts', 'Find host companies', 'Start with 3 companies that have a real problem, a named owner and a pilot budget. Ask the owner, not the PR team.'],
  ['brief', 'Write a Catalyst brief', 'One page: the problem, how it is measured today, the owner, the budget and the deadline. No brief goes live without an owner.'],
  ['day', 'Run a Catalyst day', 'Teams visit the site, meet the owner, build for 4 hours and pitch. The company decides the same day.'],
  ['pilot', 'Run the 100-day pilot', 'Weekly updates, 6 milestones, a result recorded at day 100: a contract, a job or a clear no.'],
  ['value', 'Measure value to members', 'Count contracts, jobs, investments and paid gigs in money. Report it every quarter.'],
  ['rhythm', 'Keep a weekly rhythm', 'Monday opportunities, Wednesday problem of the week, Thursday member launches. Same days every week.'],
  ['councils', 'Set up regional councils', 'One table per region, at most 2 seats per sector, one-year terms. Councils collect local problems.'],
  ['season', 'Run the season', 'Campus round, regional stage, national final. Judges score on the same 5 criteria everywhere.'],
  ['money', 'Make it pay for itself', 'Guild memberships, SME access, sourcing fees, tickets and peer groups. Never charge founders to apply.'],
];
SF.LAUNCH = [
  ['Security', [['Outside security review of login and payments', 'IT Park security team'], ['Passwords hashed, two-step code for staff', 'Developer'], ['Backups tested by restoring one', 'Developer']]],
  ['Load', [['Load test with 10,000 users at once', 'Developer'], ['Event-day plan for weak internet', 'Events lead']]],
  ['Support', [['Help desk in Telegram, reply within 24 hours', 'Community team'], ['Help pages in 3 languages', 'Content lead']]],
  ['Legal', [['Personal data stored in Uzbekistan', 'Lawyer'], ['Terms of use and privacy policy approved', 'Lawyer'], ['Payment provider contracts signed', 'Finance']]],
  ['People', [['Moderators for each region', 'Community & Growth'], ['Training for the Org team', 'Community & Growth']]],
];
SF.STORIES = [
  ['Suvchi', 'Khorezm', 'Cut irrigation water use by 14% on 50 hectares in a 100-day pilot.'],
  ['BozorPay', 'Andijan', 'Scored 1,900 micro-loans for bazaar traders; raised $200K after a Catalyst pilot.'],
  ['Ustoz.ai', 'Namangan', 'An Uzbek-language exam tutor now used in 14 schools by 6,200 students.'],
];
// Kyrgyz language pack (draft): menu and the most visible words; everything else falls back to English
SF.DICT.ky = {
  'Home': 'Башкы бет', 'Events': 'Иш-чаралар', 'Catalyst': 'Catalyst', 'Startup Earn': 'Startup Earn', 'Startups': 'Стартаптар', 'Messages': 'Билдирүүлөр', 'Community': 'Коомчулук', 'My ID': 'Менин ID', 'Dashboard': 'Панель',
  'Season': 'Сезон', 'Content': 'Контент', 'Office hours': 'Кеңеш сааттары', 'Judging': 'Баалоо', 'Deal flow': 'Келишимдер', 'VC Battle': 'VC Battle', 'Plans': 'Тарифтер', 'Sign in': 'Кирүү', 'Create account': 'Каттоо', 'Sign up': 'Катталуу',
  'Notifications': 'Билдирмелер', 'Log out': 'Чыгуу', 'Account settings': 'Аккаунт жөндөөлөрү', 'Welcome back': 'Кош келиңиз', 'Email': 'Электрондук почта', 'Password': 'Сырсөз', 'Participant': 'Катышуучу', 'Mentor': 'Ментор', 'Investor': 'Инвестор',
  'Company': 'Компания', 'Small business': 'Чакан бизнес', 'Scouting partner': 'Скаутинг өнөктөшү', 'Org team': 'Уюштуруучулар', 'Register with my ID': 'ID менен катталуу', 'Buy a ticket': 'Билет сатып алуу', 'My tickets': 'Менин билеттерим',
  'Points': 'Упайлар', 'Badges': 'Төш белгилер', 'Activity': 'Активдүүлүк', 'Salom, {n}': 'Салам, {n}', 'members with an ID': 'ID бар мүчөлөр', 'regions': 'аймактар', 'Contact': 'Байланыш', 'Navigation': 'Навигация', 'Roadmap': 'Жол картасы',
  'Impact report': 'Таасир отчёту', 'Language packs': 'Тил пакеттери',
};

const fe9 = SF.freshExtra;
SF.freshExtra = () => ({
  ...fe9(),
  inst: JSON.parse(JSON.stringify(SF.INSTANCES)).map(x => ({ ...x, done: x.k === 'uz' ? SF.ONBOARD.map(o => o[0]) : x.k === 'kg' ? ['team', 'agree', 'brand', 'lang', 'hosts', 'first'] : x.k === 'tj' ? ['team', 'agree'] : [] })),
  pb: { inst: 'kg', lang: 'en', on: SF.PLAYBOOK.map(p => p[0]), notes: { hosts: 'In Bishkek, start with HTP resident companies.' } },
  packs: { uz: true, ru: true, en: true, ky: false },
  launch: { 'Passwords hashed, two-step code for staff': 'done', 'Personal data stored in Uzbekistan': 'done', 'Help desk in Telegram, reply within 24 hours': 'done', 'Moderators for each region': 'progress', 'Load test with 10,000 users at once': 'todo' },
  loadRuns: [],
});
