// v9 data: Telegram bot and mini-app, paid tickets, card + SMS payments, offline check-in, notification settings
SF.VERSION = 'v9';
SF.ROADMAP.forEach(r => { if (r[0] === 'v8') r[3] = 'done'; if (r[0] === 'v9') { r[3] = 'now'; r[2] = 'A Telegram bot and mini-app simulator with commands and notifications; Sign in with Telegram; paid tickets with promo codes and Click, Payme, Uzcard or Humo payments confirmed by an SMS code; ticket QR codes and refunds; check-in that keeps working offline and syncs later; notification settings per channel; a payments page for the Org team.'; } if (r[0] === 'v10') r[3] = 'next'; });

SF.TICKETS = {
  e2: [['std', 'Free entry', 0]],
  e3: [['std', 'Standard', 0], ['vip', 'Partner seat', 150000]],
  e4: [['std', 'Free entry', 0]],
  e5: [['std', 'Standard', 50000], ['student', 'Student', 25000], ['vip', 'Investor lounge', 300000]],
  e6: [['course', 'Six-week course', 200000]],
};
SF.PROMOS = { STUDENT50: ['50% off for students', 0.5], CHAMPION: ['Free for Champions', 1], STARTUPNIGHT: ['20% off', 0.2] };
SF.PAY = [['click', 'Click', 0.01], ['payme', 'Payme', 0.01], ['uzcard', 'Uzcard', 0.015], ['humo', 'Humo', 0.015]];
SF.CHANNELS = [['tg', 'Telegram'], ['mail', 'Email'], ['sms', 'SMS'], ['app', 'In the platform']];
SF.TOPICS = [['events', 'Events and tickets'], ['catalyst', 'Catalyst and pilots'], ['messages', 'Messages'], ['money', 'Payments and invoices'], ['programmes', 'Mentors, judging and peer groups'], ['digest', 'Weekly digest']];
SF.NOTIFY_DEFAULT = { events: ['tg', 'app'], catalyst: ['tg', 'mail', 'app'], messages: ['tg', 'app'], money: ['tg', 'sms', 'mail', 'app'], programmes: ['tg', 'app'], digest: ['tg'] };
SF.BOT_CMDS = [['/start', 'Link your Startup Fest account'], ['/events', 'Events this month'], ['/myid', 'Your ID and QR'], ['/tickets', 'Your tickets'], ['/digest', 'This week’s digest'], ['/help', 'All commands']];

const fe8 = SF.freshExtra;
SF.freshExtra = () => ({
  ...fe8(),
  tgLink: { 'acc-participant': '@aziza_agrolens', 'acc-mentor': '@bekzod_t', 'acc-org': '@valijon_sf' },
  tickets: [
    { id: 'T-5521', ev: 'e5', type: 'std', holder: 'Aziza Rahimova', role: 'participant', price: 25000, promo: 'STUDENT50', method: 'Payme', status: 'Paid', date: '20 Oct 2026' },
    { id: 'T-5307', ev: 'e5', type: 'vip', holder: 'Dilnoza Karimova', role: 'investor', price: 300000, method: 'Click', status: 'Paid', date: '18 Oct 2026' },
    { id: 'T-5190', ev: 'e3', type: 'vip', holder: 'AgroVodiy Holding', role: 'company', price: 150000, method: 'Uzcard', status: 'Paid', date: '15 Oct 2026' },
    { id: 'T-4988', ev: 'e5', type: 'std', holder: 'Madina Rahimova', role: 'participant', price: 50000, method: 'Humo', status: 'Refunded', date: '11 Oct 2026' },
  ],
  pay: null, offline: false, offQueue: [],
  notify: {}, botChat: {},
});
