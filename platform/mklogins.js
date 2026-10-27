// Writes LOGINS.txt from the demo accounts in a version's data files: node mklogins.js src/v6 > src/v6/LOGINS.txt
const vm = require('vm'), fs = require('fs'), path = require('path'), dir = process.argv[2];
const ctx = { window: {}, console }; ctx.SF = ctx.window.SF = {}; vm.createContext(ctx);
const files = fs.readFileSync(path.join(dir, 'scripts.txt'), 'utf8').split(/\s+/).filter(f => /^(i18n|data)/.test(f));
for (const f of files) vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx);
const SF = ctx.SF, pad = (s, n) => (s + ' '.repeat(n)).slice(0, n);
const out = [`STARTUP FEST PLATFORM ${SF.VERSION.toUpperCase()} — DEMO LOGINS`, '',
  'Open index.html, choose your member type on the Sign in page, then use the login below.',
  'Each member type has its own login page. A login only works on the page for its own type.',
  '', pad('Member type', 20) + pad('Login (email)', 34) + 'Password', '-'.repeat(68)];
SF.DEMO_ACCOUNTS.forEach(a => out.push(pad(SF.ROLES[a.role].label, 20) + pad(a.email, 34) + a.pass));
out.push('', 'Who is behind each account (sample people, all fictional):');
SF.DEMO_ACCOUNTS.forEach(a => out.push(`- ${SF.ROLES[a.role].label}: ${a.contact}${SF.ROLES[a.role].persona.name !== a.contact ? ' (' + SF.ROLES[a.role].persona.name + ')' : ''}`));
if (SF.LOCK_AFTER) out.push('', 'Org team: after the password the demo asks for a 6-digit code (as if sent to Telegram). The code is shown on screen.', 'Security: ' + SF.LOCK_AFTER + ' wrong passwords lock that login for ' + SF.LOCK_MIN + ' minutes (Reset demo clears it).');
out.push('', 'New accounts: click "Create account" to try the step-by-step sign-up. New accounts are saved in this browser only.',
  'Passwords you change inside the demo are saved in this browser. "Reset demo" (bottom of any page) restores the logins above.',
  'Demo only: these are not real accounts and the demo stores passwords in the browser.');
console.log(out.join('\n'));
