// v5 data: content engine (weekly posts, Telegram preview, Instagram cards, calendar, reach)
SF.VERSION = 'v5';
SF.ROADMAP.forEach(r => { if (r[0] === 'v4') r[3] = 'done'; if (r[0] === 'v5') { r[3] = 'now'; r[2] = 'The org team writes the Monday digest, Wednesday problem and Thursday launches in the platform; Telegram post preview in Uzbek, Russian or English with copy; members share launches for review; Instagram cards as PNG; a 4-week content calendar with reach tracking.'; } if (r[0] === 'v6') r[3] = 'next'; });
SF.CARD_TEMPLATES = [['wed', 'Problem of the week'], ['thu', 'Member launch'], ['event', 'Event'], ['stat', 'Big number']];
SF.WEEKS = ['27 Oct', '3 Nov', '10 Nov', '17 Nov'];
SF.SLOTS = [['mon', 'MON', 'Opportunities digest'], ['wed', 'WED', 'Problem of the week'], ['thu', 'THU', 'Member launches']];

const fe4 = SF.freshExtra;
SF.freshExtra = () => ({
  ...fe4(),
  pub: { mon: SF.DIGEST.map(x => ({ ...x })), wed: null, thu: SF.LAUNCHES.map(x => ({ ...x })) },
  draft: { lang: 'uz', mon: [0, 1, 2, 3], extra: [], wed: 'b3', thu: [0, 1, 2] },
  launchQueue: [{ id: 'lq1', n: 'Suvchi', t: 'Sensors now on 3 farms in Khorezm', by: 'Sanjar Bekov' }],
  posts: [
    { id: 'po1', slot: 'mon', week: '20 Oct', title: 'Opportunities digest', lang: 'uz', views: 1840 },
    { id: 'po2', slot: 'wed', week: '20 Oct', title: 'Problem of the week', lang: 'uz', views: 2310 },
    { id: 'po3', slot: 'thu', week: '20 Oct', title: 'Member launches', lang: 'uz', views: 1290 },
    { id: 'po4', slot: 'mon', week: '13 Oct', title: 'Opportunities digest', lang: 'ru', views: 960 },
    { id: 'po5', slot: 'wed', week: '13 Oct', title: 'Problem of the week', lang: 'uz', views: 4260 },
    { id: 'po6', slot: 'thu', week: '13 Oct', title: 'Member launches', lang: 'uz', views: 1105 },
  ],
  plan: { '27 Oct|mon': 'draft', '27 Oct|wed': 'draft', '27 Oct|thu': 'draft', '3 Nov|wed': 'planned' },
});
