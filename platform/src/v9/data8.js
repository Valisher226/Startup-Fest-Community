// v8 data: user management, permissions, audit log, privacy centre, login security, camera check-in, backend plan
SF.VERSION = 'v8';
SF.ROADMAP.forEach(r => { if (r[0] === 'v7') r[3] = 'done'; if (r[0] === 'v8') { r[3] = 'now'; r[2] = 'User management with invites and suspensions; a permissions table that controls what each member type sees; an audit log; a privacy centre to download or delete your data and change consents; lockout after failed logins, session timeout and a two-step code for the Org team; camera QR check-in; the backend plan.'; } if (r[0] === 'v9') r[3] = 'next'; });

// what each member type may do; routes listed here are hidden and blocked without the permission
SF.PERMS = [
  ['catalyst', 'Catalyst briefs and pilots', ['catalyst', 'pilot']],
  ['earn', 'Startup Earn gigs', ['earn']],
  ['directory', 'Startup directory', ['directory', 'startup']],
  ['hours', 'Mentor office hours', ['hours']],
  ['peers', 'Peer groups', ['peers']],
  ['deals', 'Deal flow and deal rooms', ['deals', 'deal', 'verify']],
  ['battle', 'VC Battle', ['battle']],
  ['judge', 'Judging', ['judge']],
  ['messages', 'Messages', ['messages']],
  ['plans', 'Plans and checkout', ['plans']],
];
SF.PERM_DEFAULT = {
  catalyst: ['participant', 'company'], earn: ['participant', 'company', 'sme'], directory: ['participant', 'mentor', 'investor', 'company', 'sme', 'scout'],
  hours: ['participant', 'mentor', 'sme'], peers: ['participant', 'mentor', 'sme'], deals: ['participant', 'investor', 'scout'], battle: ['participant', 'mentor', 'investor', 'company', 'sme', 'scout'],
  judge: ['mentor'], messages: ['participant', 'mentor', 'investor', 'company', 'sme', 'scout'], plans: ['company', 'sme', 'scout', 'investor'],
};
SF.LOCK_AFTER = 5; SF.LOCK_MIN = 15; SF.IDLE_MIN = 30;
SF.AUDIT_TYPES = ['Security', 'Accounts', 'Permissions', 'Personal data', 'Money', 'Programmes'];
SF.STORED = [['name', 'Name'], ['region', 'Region'], ['id', 'Startup Fest ID'], ['email', 'Email'], ['phone', 'Phone number'], ['telegram', 'Telegram username'], ['points', 'Points and activity']];
SF.BACKEND = [
  ['Database', 'PostgreSQL with one row per member, event, application and payment. Personal data of citizens of Uzbekistan stays on servers in Uzbekistan, as the personal-data law requires.'],
  ['Hosting', 'A local cloud (for example IT Park or Uztelecom data centres) for the database; static files on a CDN.'],
  ['Login', 'Email and password plus Telegram Login. A two-step code for staff. Passwords stored as salted hashes, never as text.'],
  ['Permissions', 'The same table as on this page, checked on the server for every request, not only hidden in the menu.'],
  ['Audit log', 'Every sensitive action written to an append-only table and kept for 3 years.'],
  ['Payments', 'Click and Payme merchant accounts; webhooks mark invoices as paid.'],
  ['Telegram', 'A bot for notifications and a mini-app that opens the same platform (v9).'],
  ['Pilot', 'One region first (Samarkand): 500 members, 3 events, 1 Catalyst day, then all 14 regions.'],
];
SF.BACKEND_COST = [['Cloud hosting and database', 4500000], ['SMS codes (about 3,000 a month)', 1200000], ['Domain, email, backups', 600000], ['Support (part-time)', 6000000]];

const fe7 = SF.freshExtra;
SF.freshExtra = () => { const b = fe7();
  b.accounts.forEach(a => Object.assign(a, { status: 'active', twofa: a.role === 'org' }));
  b.accounts.push({ id: 'acc-old', role: 'participant', email: 'temur.old@mail.uz', pass: 'Old#20250', contact: 'Temur Rasulov', created: 'Mar 2025', last: '2026-04-02T10:00:00Z', status: 'suspended', twofa: false,
    person: { name: 'Temur Rasulov', region: 'Fergana', fields: { team: 'TexTrace' }, id: 'SF-27-00422', points: 310, counts: { checkin: 4, apply: 2, gig: 0, intro: 0, contract: 0 }, log: [] } });
  return { ...b,
    perms: JSON.parse(JSON.stringify(SF.PERM_DEFAULT)),
    fails: {}, otp: null,
    audit: [
      { at: '2026-10-24T18:12:00Z', who: 'Valijon Narimov', type: 'Programmes', act: 'Locked judging results', target: 'Regional stage · Khorezm' },
      { at: '2026-10-24T09:40:00Z', who: 'Valijon Narimov', type: 'Accounts', act: 'Suspended an account', target: 'temur.old@mail.uz' },
      { at: '2026-10-23T15:05:00Z', who: 'Dilnoza Karimova', type: 'Personal data', act: 'Downloaded own data', target: 'SF-27-00951' },
      { at: '2026-10-23T11:30:00Z', who: 'unknown', type: 'Security', act: 'Failed login', target: 'team@demo.startupfest.uz' },
      { at: '2026-10-22T08:00:00Z', who: 'Valijon Narimov', type: 'Money', act: 'Marked an invoice paid', target: 'INV-2026-052' },
    ],
    consentLog: [{ at: '2026-09-12T10:00:00Z', who: 'Aziza Rahimova', what: 'Recommend my profile to partners', on: true }],
    deleted: 0,
  }; };
