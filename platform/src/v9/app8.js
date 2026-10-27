// v8 actions: permissions enforcement, login security (lockout, suspension, two-step code, idle timeout), audit log, users, privacy, camera check-in
(() => {
const t = (s, v) => SF.t(s, v), esc = SF.esc, A = SF.A, S = () => SF.S;
Object.assign(SF.LABEL, { users: 'Users', permissions: 'Permissions', audit: 'Audit log', backend: 'Backend plan', privacy: 'Privacy centre' });
Object.assign(SF.TAB_OF, { users: 'admin', permissions: 'admin', audit: 'admin', backend: 'admin', privacy: 'me', noaccess: null });
const curView = () => (location.hash || '').split('/')[1] || '';
const me = () => (SF.account() || {}).contact || 'unknown';
SF.log = (type, act, target = '') => { S().audit.unshift({ at: new Date().toISOString(), who: me(), type, act, target }); if (S().audit.length > 400) S().audit.length = 400; };
const ORG_ONLY = ['users', 'permissions', 'audit', 'backend', 'admin', 'content'];

/* ---------- render: idle timeout, permissions on routes and menus ---------- */
const render7 = SF.render;
SF.render = () => { const s = S(), v = curView();
  if (s.session && !s.remember && s.session.seen && Date.now() - s.session.seen > SF.IDLE_MIN * 60000) { SF.log('Security', 'Signed out after 30 minutes without activity', (SF.account() || {}).email); SF.logout(); SF.ui.loginErr = t('You were signed out after {m} minutes without activity.', { m: SF.IDLE_MIN }); }
  if (s.session) { s.session.seen = Date.now();
    const perm = SF.permOf(v); if ((perm && !SF.can(perm)) || (ORG_ONLY.includes(v) && s.role !== 'org')) history.replaceState(null, '', '#/noaccess/' + v); }
  const nav = SF.NAV[s.role], keep = nav.slice(); if (s.session) { const ok = nav.filter(k => { const p = SF.permOf(k); return !p || SF.can(p); }); nav.splice(0, nav.length, ...ok); }
  try { render7(); } finally { nav.splice(0, nav.length, ...keep); }
};

/* ---------- login security ---------- */
const otpModal = acc => { const code = String(100000 + Math.floor(Math.random() * 900000)); S().otp = { acc: acc.id, code, at: Date.now() };
  SF.modal(`<h3>${t('Enter the 6-digit code')}</h3><p class="muted" style="margin:0">${t('We sent a code to the Telegram account linked to {e}.', { e: esc(acc.email) })}</p>
  <div class="demo-hint"><b>${t('Demo')}</b><span>${t('Your code is {c}', { c: `<b class="mono" style="background:none;color:inherit;font-size:15px;letter-spacing:.2em">${code}</b>` })}</span></div>
  <form id="otp-form" class="stack"><div class="field"><label for="otp-c">${t('Code')}</label><input id="otp-c" inputmode="numeric" autocomplete="one-time-code" maxlength="6" required class="otp"></div>
  <div class="row end"><button type="button" class="btn ghost" data-close="1">${t('Cancel')}</button><button class="btn">${t('Sign in')}</button></div></form>`); };
const finishLogin = acc => { SF.login(acc); SF.ui = {}; SF.log('Security', 'Signed in', acc.email); SF.toast(t('Signed in as {n}', { n: acc.contact })); SF.go('#/' + SF.NAV[acc.role][0]); };

/* ---------- actions ---------- */
const download = (name, text, type = 'text/plain') => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: type + ';charset=utf-8' })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); };
const tempPass = () => 'Sf#' + Math.random().toString(36).slice(2, 8) + '7';
const logout6 = A.logout, markpaid4 = A.markpaid, vipok7 = A.vipok, lockres6 = A.lockres, recogok6 = A.recogok;
let camStream = null, camTimer = null;
const camStop = () => { if (camTimer) clearInterval(camTimer); camTimer = null; if (camStream) camStream.getTracks().forEach(x => x.stop()); camStream = null; };
Object.assign(A, {
  logout: d => { SF.log('Security', 'Signed out', (SF.account() || {}).email); logout6(d); },
  markpaid: d => { SF.log('Money', 'Marked an invoice paid', d.id); markpaid4(d); },
  vipok: d => { SF.log('Programmes', 'Verified an investor', d.n); vipok7(d); },
  lockres: d => { SF.log('Programmes', 'Locked judging results', t(SF.JUDGING.find(j => j.id === d.ev).title)); lockres6(d); },
  recogok: d => { SF.log('Programmes', 'Approved a Champion or Fellow', (S().recog.find(x => x.id === d.id) || {}).name); recogok6(d); },
  invite: () => SF.modal(`<h3>${t('Invite a member')}</h3><p class="muted" style="margin:0">${t('They get an email with a temporary password and must change it at first sign-in.')}</p>
    <form id="invite-form" class="stack"><div class="field"><label for="iv-name">${t('Full name')}</label><input id="iv-name" required></div><div class="field"><label for="iv-mail">${t('Email')}</label><input id="iv-mail" type="email" required></div>
    <div class="field"><label for="iv-type">${t('Member type')}</label><select id="iv-type">${Object.keys(SF.ROLES).map(k => `<option value="${k}">${t(SF.ROLES[k].label)}</option>`).join('')}</select></div>
    <div class="row end"><button type="button" class="btn ghost" data-close="1">${t('Cancel')}</button><button class="btn">${t('Send invite')}</button></div></form>`),
  ustatus: d => { const a = S().accounts.find(x => x.id === d.id); a.status = d.s; if (d.s === 'suspended' && S().session && S().session.acc === a.id) SF.logout();
    SF.log('Accounts', d.s === 'suspended' ? 'Suspended an account' : 'Reactivated an account', a.email); SF.toast(d.s === 'suspended' ? t('Account suspended') : t('Account reactivated')); SF.render(); },
  ureset: d => { const a = S().accounts.find(x => x.id === d.id), p = tempPass(); a.pass = p; a.mustChange = true; SF.log('Accounts', 'Reset a password', a.email);
    SF.modal(`<h3>${t('Temporary password')}</h3><p class="muted" style="margin:0">${t('Send it to {n} privately. They must change it after signing in.', { n: esc(a.contact) })}</p><div class="mono temp-pass">${p}</div><div class="row end"><button class="btn" data-close="1">${t('Done')}</button></div>`); SF.render(); },
  permreset: () => { S().perms = JSON.parse(JSON.stringify(SF.PERM_DEFAULT)); SF.log('Permissions', 'Restored default permissions'); SF.toast(t('Defaults restored')); SF.render(); },
  auditcsv: () => { const rows = [['When', 'Who', 'Type', 'Action', 'Target'], ...S().audit.map(x => [x.at, x.who, x.type, x.act, x.target])];
    download('startupfest-audit-log.csv', rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n'), 'text/csv'); SF.log('Personal data', 'Exported the audit log'); SF.toast(t('Saved {f}', { f: 'startupfest-audit-log.csv' })); },
  mydata: () => { const a = SF.account(), { pass, ...acc } = a, p = SF.me();
    const data = { exported: new Date().toISOString(), account: acc, profile: p, registrations: S().reg[a.role] || [], bookings: S().bookings.filter(b => b.by === a.contact || b.mentor === a.contact), consents: S().consentLog.filter(x => x.who === a.contact), invoices: S().invoices.filter(i => i.to === p.name || i.to === a.contact) };
    download(`startupfest-my-data-${p.id}.json`, JSON.stringify(data, null, 2), 'application/json'); SF.log('Personal data', 'Downloaded own data', p.id); SF.toast(t('Saved {f}', { f: `startupfest-my-data-${p.id}.json` })); },
  delacct: () => SF.modal(`<h3>${t('Delete my account')}</h3><p style="margin:0">${t('This cannot be undone. Type DELETE to confirm.')}</p><form id="del-form" class="stack"><div class="field"><label for="del-c" class="sr">DELETE</label><input id="del-c" required autocomplete="off"></div>
    <div class="row end"><button type="button" class="btn ghost" data-close="1">${t('Cancel')}</button><button class="btn dark">${t('Delete my account')}</button></div></form>`),
  camscan: d => { SF.modal(`<h3>${t('Scan a Startup Fest ID')}</h3><div class="cam"><video id="camv" playsinline muted></video><div class="cam-frame"></div></div><p class="muted small" id="camnote" style="margin:0">${t('Point the camera at the QR code on the member’s ID.')}</p><div class="row end"><button class="btn ghost" data-close="1">${t('Close')}</button></div>`);
    const note = m => { const el = document.getElementById('camnote'); if (el) el.textContent = m; };
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) || !('BarcodeDetector' in window)) return note(t('This browser cannot scan QR codes with the camera. Use Chrome on Android or a Mac, or type the ID below.'));
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(st => { camStream = st; const v = document.getElementById('camv'); if (!v) return camStop(); v.srcObject = st; v.play();
      const det = new window.BarcodeDetector({ formats: ['qr_code'] });
      camTimer = setInterval(() => { const vv = document.getElementById('camv'); if (!vv) return camStop(); det.detect(vv).then(codes => { const c = codes.find(x => /^STARTUPFEST:SF-\d{2}-\d{5}$/.test(x.rawValue)); if (!c) return;
        camStop(); SF.closeModal(); const inp = document.getElementById('ci-id'), f = document.getElementById('checkin-form'); if (inp && f) { inp.value = c.rawValue.split(':')[1]; f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); } }).catch(() => {}); }, 350);
    }).catch(() => note(t('Camera access was refused. Allow the camera in the browser, or type the ID below.'))); },
});
document.addEventListener('click', e => { if (e.target.closest('[data-close]') && camStream) camStop(); });

document.addEventListener('change', e => { const el = e.target, s = S();
  if (el.dataset && el.dataset.perm) { const l = s.perms[el.dataset.perm]; s.perms[el.dataset.perm] = el.checked ? [...new Set([...l, el.dataset.r])] : l.filter(x => x !== el.dataset.r);
    SF.log('Permissions', el.checked ? 'Allowed a feature' : 'Blocked a feature', `${(SF.PERMS.find(p => p[0] === el.dataset.perm) || [])[1]} · ${SF.ROLES[el.dataset.r].label}`); SF.toast(t('Permissions updated')); SF.render(); }
  if (el.dataset && el.dataset.consent) { const a = SF.account(); a.consent = a.consent || {}; a.consent[el.dataset.consent] = el.checked;
    const what = { tg: 'Weekly digest in Telegram', mail: 'Event reminders by email', sms: 'SMS when a payment or ticket needs action', recommend: 'Recommend my profile to partners' }[el.dataset.consent];
    s.consentLog.unshift({ at: new Date().toISOString(), who: a.contact, what, on: el.checked }); SF.log('Personal data', el.checked ? 'Gave consent' : 'Withdrew consent', what);
    if (el.dataset.consent === 'recommend' && a.role === 'participant' && SF.me().fields.team) s.consent[SF.me().fields.team] = el.checked; SF.toast(t('Saved')); SF.render(); }
  if (el.id === 'twofa') { const a = SF.account(); a.twofa = el.checked; SF.log('Security', el.checked ? 'Turned on the two-step code' : 'Turned off the two-step code', a.email); SF.render(); }
});

/* ---------- forms ---------- */
const fh7 = SF.formHandlers;
SF.formHandlers = (f, val) => { const s = S();
  if (f.id === 'login-form') { const mail = val('li-mail').toLowerCase(), pass = (f.querySelector('#li-pass') || {}).value || '', acc = s.accounts.find(a => a.email.toLowerCase() === mail), fl = s.fails[mail] = s.fails[mail] || { n: 0, until: 0 };
    SF.ui.loginMail = val('li-mail');
    if (fl.until > Date.now()) { SF.ui.loginErr = t('Too many wrong passwords. Try again in {m} minutes or reset your password.', { m: Math.ceil((fl.until - Date.now()) / 60000) }); return SF.render(); }
    if (acc && acc.pass === pass) { fl.n = 0;
      if (acc.status === 'suspended') { SF.log('Security', 'Sign-in refused: account suspended', acc.email); SF.ui.loginErr = t('This account is suspended. Contact the Startup Fest team.'); return SF.render(); }
      if (acc.role !== f.dataset.type) return fh7(f, val);
      s.remember = f.querySelector('#li-rem').checked;
      if (acc.twofa) return otpModal(acc);
      return finishLogin(acc); }
    if (mail && pass) { fl.n++; SF.log('Security', 'Failed login', mail); if (fl.n >= SF.LOCK_AFTER) { fl.until = Date.now() + SF.LOCK_MIN * 60000; fl.n = 0; SF.log('Security', 'Account locked for 15 minutes', mail); }
      SF.ui.loginErr = fl.until > Date.now() ? t('Too many wrong passwords. Try again in {m} minutes or reset your password.', { m: SF.LOCK_MIN }) : t('The email or password is wrong') + ' · ' + t('{n} tries left', { n: SF.LOCK_AFTER - fl.n }); return SF.render(); }
    return fh7(f, val); }
  if (f.id === 'otp-form') { const o = s.otp, acc = o && s.accounts.find(a => a.id === o.acc);
    if (!o || Date.now() - o.at > 5 * 60000) { SF.closeModal(); return SF.toast(t('The code expired. Sign in again.')); }
    if (val('otp-c') !== o.code) { SF.log('Security', 'Wrong two-step code', acc.email); return SF.toast(t('Wrong code')); }
    s.otp = null; SF.closeModal(); return finishLogin(acc); }
  if (f.id === 'su-form' && f.dataset.step === 'review') { const before = (SF.account() || {}).id; const r = fh7(f, val); const a = SF.account();
    if (a && a.id !== before) { a.status = 'active'; a.twofa = false; SF.log('Accounts', 'Created an account', a.email); } return r; }
  if (f.id === 'pass-form' || f.id === 'reset-form') { const a = f.id === 'pass-form' ? SF.account() : s.accounts.find(x => x.id === f.dataset.acc), old = a && a.pass; const r = fh7(f, val);
    if (a && a.pass !== old) { a.mustChange = false; SF.log('Security', 'Changed the password', a.email); } return r; }
  if (f.id === 'invite-form') { const m = val('iv-mail'); if (s.accounts.some(a => a.email.toLowerCase() === m.toLowerCase())) return SF.toast(t('An account with this email already exists. Sign in instead.'));
    const r = val('iv-type'), p = tempPass(), name = val('iv-name');
    s.accounts.push({ id: 'acc-' + Date.now(), role: r, email: m, pass: p, contact: name, created: 'Oct 2026', last: '', status: 'active', twofa: r === 'org', mustChange: true,
      person: { name, region: 'Tashkent city', fields: {}, id: 'SF-27-' + String(Math.floor(10000 + Math.random() * 89999)), points: 0, counts: { checkin: 0, apply: 0, gig: 0, intro: 0, contract: 0 }, log: [] } });
    SF.log('Accounts', 'Invited a member', m);
    SF.modal(`<h3>${t('Invite ready')}</h3><p class="muted" style="margin:0">${t('In the real platform this goes by email. For the demo, here is the login:')}</p><div class="mono temp-pass">${esc(m)}<br>${p}</div><div class="row end"><button class="btn" data-close="1">${t('Done')}</button></div>`); return SF.render(); }
  if (f.id === 'del-form') { if (val('del-c') !== 'DELETE') return SF.toast(t('Type DELETE to confirm'));
    const a = SF.account(); SF.log('Personal data', 'Deleted own account', a.email); s.accounts = s.accounts.filter(x => x.id !== a.id); s.deleted = (s.deleted || 0) + 1;
    const demo = SF.DEMO_ACCOUNTS.find(x => x.role === a.role); const back = demo && s.accounts.find(x => x.id === demo.id);
    if (back) { if (back.person) { s.people[a.role] = back.person; delete back.person; } s.slot[a.role] = back.id; }
    SF.logout(); SF.closeModal(); SF.toast(t('Your account was deleted')); return SF.go('#/login'); }
  return fh7(f, val);
};

/* ---------- first sign-in after a reset: ask for a new password ---------- */
const chrome7 = SF.renderChrome;
SF.renderChrome = () => { chrome7(); const a = SF.account();
  const up = document.getElementById('umpanel'); if (up && !up.querySelector('[href="#/privacy"]')) up.querySelector('[href="#/account"]').insertAdjacentHTML('afterend', `<a href="#/privacy">${t('Privacy centre')}</a>`);
  if (up && a && a.role === 'org' && !up.querySelector('[href="#/users"]')) up.querySelector('[href="#/privacy"]').insertAdjacentHTML('afterend', `<a href="#/users">${t('Trust and safety')}</a>`);
  const el = document.getElementById('mustchange'); if (el) el.remove();
  if (a && a.mustChange) document.getElementById('view').insertAdjacentHTML('afterbegin', `<div id="mustchange" class="alert row between" role="alert" style="margin-bottom:12px"><span>${t('You signed in with a temporary password. Choose your own now.')}</span><a class="btn sm" href="#/account">${t('Change password')}</a></div>`); };
})();
