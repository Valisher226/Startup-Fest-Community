// v6 actions: sign in per member type, sign-up wizard, user menu, office hours, judging, peer groups, recognition
(() => {
const t = (s, v) => SF.t(s, v), esc = SF.esc, A = SF.A, S = () => SF.S;
const N = SF.NAV;
N.participant.splice(N.participant.indexOf('earn') + 1, 0, 'hours');
N.mentor.splice(1, 0, 'hours', 'judge');
N.sme = ['home', 'directory', 'earn', 'hours', 'plans', 'messages', 'community', 'me'];
N.scout = ['home', 'directory', 'plans', 'events', 'messages', 'community', 'me'];
Object.assign(SF.LABEL, { hours: 'Office hours', judge: 'Judging', peers: 'Peer groups', fellows: 'Champions', account: 'Account settings' });
Object.assign(SF.TAB_OF, { login: null, signup: null, account: 'me', fellows: 'me', peers: 'hours', judge: 'season', hours: 'community' });
const curView = () => (location.hash || '').split('/')[1] || '';

/* ---------- sessions ---------- */
// one person object per member type is "seated" in S.people; switching accounts swaps them
SF.login = acc => { const s = S(), r = acc.role;
  if (s.slot[r] !== acc.id) { const prev = s.accounts.find(a => a.id === s.slot[r]); if (prev) prev.person = s.people[r]; if (acc.person) s.people[r] = acc.person; delete acc.person; s.slot[r] = acc.id; }
  s.role = r; s.session = { acc: acc.id, at: Date.now() }; acc.last = new Date().toISOString(); };
SF.loginAs = r => { const acc = S().accounts.find(a => a.id === S().slot[r]) || S().accounts.find(a => a.role === r); if (acc) SF.login(acc); };
SF.logout = () => { S().session = null; SF.ui = {}; };

const render5 = SF.render;
SF.render = () => { const v = curView();
  if (!S().session && !SF.PUBLIC.includes(v)) history.replaceState(null, '', '#/login' + (SF.ui.loginType ? '/' + SF.ui.loginType : ''));
  render5();
  document.body.classList.toggle('signed-out', !S().session);
};
window.addEventListener('hashchange', () => { if (curView() !== 'login') SF.ui.loginErr = ''; if (curView() !== 'signup') SF.ui.wzErr = null; document.getElementById('umpanel') && (document.getElementById('umpanel').hidden = true); });

/* ---------- header: user menu or sign-in ---------- */
const chrome5 = SF.renderChrome;
SF.renderChrome = () => { chrome5(); const a = SF.account(), um = document.getElementById('usermenu'), join = document.getElementById('joinbtn');
  if (!a) { document.getElementById('tabs').innerHTML = `<div class="mlangs">${['uz', 'ru', 'en'].map(l => `<button data-act="setlang" data-l="${l}" aria-pressed="${l === SF.lang}">${l.toUpperCase()}</button>`).join('')}</div>`;
    um.innerHTML = `<a class="signin" href="#/login">${t('Sign in')}</a>`; join.hidden = false; document.getElementById('jointxt').textContent = t('Create account');
    document.getElementById('foot-nav').innerHTML = `<h4>${t('Navigation')}</h4><a href="#/login">${t('Sign in')}</a><a href="#/signup">${t('Create account')}</a>`; }
  else { join.hidden = true; const R = SF.ROLES[a.role];
    um.innerHTML = `<button class="um-btn" data-act="usermenu" aria-haspopup="true" aria-expanded="false"><span class="mini" style="background:${R.color}">${SF.initials(a.contact)}</span><span class="um-name">${esc(a.contact.split(' ')[0])}</span></button>
    <div class="um-panel" id="umpanel" hidden><div class="um-who"><span class="mini" style="background:${R.color}">${SF.initials(a.contact)}</span><div><b>${esc(a.contact)}</b><div class="muted small">${esc(a.email)}</div><span class="chip" style="background:${R.color};color:#fff;margin-top:4px">${t(R.label)}</span></div></div>
      <a href="#/me">${t('My Startup Fest ID')}</a><a href="#/account">${t('Account settings')}</a><a href="#/login">${t('Switch account')}</a><button data-act="logout">${t('Log out')}</button></div>`; }
};
document.addEventListener('click', e => { const p = document.getElementById('umpanel'); if (p && !p.hidden && !e.target.closest('#usermenu')) p.hidden = true; });

/* ---------- sign-up wizard ---------- */
const stepsNow = () => SF.signupSteps(S().signup.type);
const collect = f => { const d = S().signup.data;
  f.querySelectorAll('input,select,textarea').forEach(el => { if (!el.id && !el.name) return;
    if (el.type === 'checkbox' && el.name) { d[el.name] = [...f.querySelectorAll(`input[name="${el.name}"]:checked`)].map(x => x.value); return; }
    if (el.type === 'radio') return;
    if (el.type === 'checkbox') d[el.id] = el.checked; else if (el.id) d[el.id] = el.value.trim(); }); return d; };
const len = (d, k) => (d[k] || '').length;
const validate = (key, d, type) => { const e = {};
  const need = (k, msg = 'This field is required') => { if (!d[k] || (Array.isArray(d[k]) && !d[k].length)) e[k] = msg; };
  const chars = (k, a, b) => { if (len(d, k) < a || (b && len(d, k) > b)) e[k] = t('Write {a}–{b} characters (now {n})', { a, b: b || '∞', n: len(d, k) }); };
  if (key === 'type' && !type) e['su-type'] = 'Choose a member type';
  if (key === 'account') { if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d['su-mail'] || '')) e['su-mail'] = 'Enter a valid email';
    else if (S().accounts.some(a => a.email.toLowerCase() === d['su-mail'].toLowerCase())) e['su-mail'] = 'An account with this email already exists. Sign in instead.';
    if (SF.pwRules(d['su-pass'] || '').some(([ok]) => !ok)) e['su-pass'] = 'The password does not meet all the rules';
    if ((d['su-pass2'] || '') !== (d['su-pass'] || '')) e['su-pass2'] = 'Passwords do not match';
    need('su-heard', 'Choose one'); }
  if (key === 'personal') { need('su-first'); need('su-last');
    if (!/^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/.test((d['su-phone'] || '').replace(/-/g, ''))) e['su-phone'] = 'Use the format +998 90 123 45 67';
    if (type === 'participant') { need('su-dob'); if (d['su-dob'] && (new Date(d['su-dob']) > new Date('2014-10-25'))) e['su-dob'] = 'You need to be at least 12 years old'; } else need('su-title');
    need('su-langs', 'Choose at least one'); }
  if (key === 'profile') { if (['company', 'sme', 'scout'].includes(type)) { need('su-org'); if (!/^\d{9}$/.test((d['su-inn'] || '').replace(/\s/g, ''))) e['su-inn'] = 'The tax ID (INN) has 9 digits'; }
    (SF.ROLE_FIELDS[type] || []).forEach(f => need('jf-' + f.k)); }
  if (key === 'goals') { if (type === 'participant') { chars('jx-why', 200, 500); chars('jx-prob', 30, 400); }
    if (type === 'mentor') { need('su-topics', 'Choose at least one'); chars('su-bio', 50, 300); }
    if (type === 'investor') chars('su-thesis', 50, 400);
    if (type === 'company') chars('su-chal', 50, 500);
    if (type === 'sme') { need('su-needs', 'Choose at least one'); chars('su-prob', 30, 400); }
    if (type === 'scout') { chars('su-want', 50, 400); if (!d['su-fee']) e['su-fee'] = 'Please confirm'; } }
  if (key === 'consent') { if (!d['su-terms']) e['su-terms'] = 'Required to create an account'; if (!d['su-pd']) e['su-pd'] = 'Required to create an account';
    if (type === 'participant' && SF.isMinor(d['su-dob'])) { need('su-par'); if (!/^\+998[\s\d]{9,}$/.test(d['su-parph'] || '')) e['su-parph'] = 'Use the format +998 90 123 45 67'; } }
  if (key === 'review' && !d['su-confirm']) e['su-confirm'] = 'Please confirm';
  return e; };
const createAccount = () => { const s = S(), su = s.signup, d = su.data, type = su.type, fields = {};
  (SF.ROLE_FIELDS[type] || []).forEach(f => fields[f.k] = d['jf-' + f.k]);
  Object.assign(fields, { email: d['su-mail'], phone: d['su-phone'], telegram: d['su-tg'], languages: (d['su-langs'] || []).join(', '), heard: d['su-heard'] });
  if (type === 'participant') Object.assign(fields, { trackArea: d['jx-track'], level: d['jx-level'], why: d['jx-why'], problem: d['jx-prob'], skillsMore: d['jx-skills'], dob: d['su-dob'], guardian: d['su-par'] || '' });
  ({ mentor: ['su-topics', 'su-bio', 'su-judge', 'su-mode'], investor: ['su-kind', 'su-thesis', 'su-deals', 'su-lead', 'su-vip'], company: ['su-chal', 'su-budget', 'su-host'], sme: ['su-needs', 'su-prob', 'su-month'], scout: ['su-want', 'su-size'] }[type] || []).forEach(k => fields[k.slice(3)] = d[k]);
  if (d['su-inn']) fields.inn = d['su-inn'].replace(/\s/g, '');
  const contact = [d['su-first'], d['su-last']].join(' ').trim(), name = ['company', 'sme', 'scout'].includes(type) ? d['su-org'] : contact;
  const person = { name, region: d['su-reg'], fields, id: 'SF-27-' + String(Math.floor(10000 + Math.random() * 89999)), points: 0, counts: { checkin: 0, apply: 0, gig: 0, intro: 0, contract: 0 }, log: [] };
  const acc = { id: 'acc-' + Date.now(), role: type, email: d['su-mail'], pass: d['su-pass'], contact, created: 'Oct 2026', last: '', person, consent: { tg: !!d['su-c-tg'], mail: !!d['su-c-mail'], sms: !!d['su-c-sms'], recommend: !!d['su-c-rec'] } };
  s.accounts.push(acc); SF.login(acc);
  if (type === 'participant' && fields.team && d['su-c-rec'] === false) s.consent[fields.team] = false;
  if (type === 'mentor') { (s.mentorsNew = s.mentorsNew || []).push({ n: contact, exp: fields.expertise || 'Product', co: fields.company || '', region: d['su-reg'], langs: fields.languages, rating: 5, hours: 0, topics: d['su-topics'] || [] }); s.avail[contact] = []; }
  if (['sme', 'company', 'scout'].includes(type)) s.subs[name] = { plan: type === 'sme' ? 'sme-start' : '', since: 'Oct 2026', renews: '–' };
  s.joined = (s.joined || 0) + 1; SF.award(type, 'join', t('Created a Startup Fest ID'));
  SF.notify(type, t('Welcome! Your ID is ready. Register for an event to earn points.'), '#/events');
  SF.notify('org', t('New {r} account: {n}', { r: t(SF.ROLES[type].label), n: name }), '#/admin');
  s.signup = { step: 0, type: '', data: {}, done: [] };
  return acc; };

/* ---------- actions ---------- */
const bk = id => S().bookings.find(b => b.id === id);
const payModal = (title, amount, formId, extra = '') => SF.modal(`<h3>${title}</h3>
  <div class="card pad row between" style="background:#fafafa"><b>${t('Total')}</b><b class="display" style="font-size:30px;color:var(--brand)">${amount ? SF.uzs(amount) : t('Free')}</b></div>
  <form id="${formId}" class="stack" ${extra}>${amount ? `<fieldset class="stack" style="border:0;padding:0;margin:0"><legend class="small" style="font-weight:500;margin-bottom:6px">${t('Payment method')}</legend>
    ${[['click', 'Click'], ['payme', 'Payme'], ['uzcard', 'Uzcard / Humo card']].map(([k, n], i) => `<label class="card pad row" style="padding:12px;cursor:pointer"><input type="radio" name="pm" value="${k}" ${i === 0 ? 'checked' : ''} style="accent-color:var(--accent)"> <b>${t(n)}</b></label>`).join('')}</fieldset>
    <p class="muted small" style="margin:0">${t('Demo: nothing is charged.')}</p>` : ''}
  <div class="row end"><button type="button" class="btn ghost" data-close="1">${t('Cancel')}</button><button class="cta" type="submit"><span class="btn">${amount ? t('Pay {v}', { v: SF.uzs(amount) }) : t('Confirm')}</span>${SF.ARROW}</button></div></form>`);
let invN = 70;
Object.assign(A, {
  join: () => { SF.go('#/signup'); },
  signupas: d => { const su = S().signup; if (!su.type && d.type && d.type !== 'org') { su.type = d.type; } },
  showpass: d => { const el = document.getElementById(d.for); if (!el) return; el.type = el.type === 'password' ? 'text' : 'password'; const b = document.querySelector(`[data-act="showpass"][data-for="${d.for}"]`); b.textContent = el.type === 'password' ? t('Show') : t('Hide'); },
  filldemo: d => { const a = SF.DEMO_ACCOUNTS.find(x => x.role === d.type); const cur = S().accounts.find(x => x.id === a.id) || a; document.getElementById('li-mail').value = cur.email; document.getElementById('li-pass').value = cur.pass; },
  forgot: () => { const m = (document.getElementById('li-mail') || {}).value || '';
    SF.modal(`<h3>${t('Reset your password')}</h3><p class="muted" style="margin:0">${t('We will send a reset link to your email. In this demo, no email is sent: the reset link opens here.')}</p>
    <form id="forgot-form" class="stack"><div class="field"><label for="fg-mail">${t('Email')}</label><input id="fg-mail" type="email" required value="${esc(m)}"></div>
    <div class="row end"><button type="button" class="btn ghost" data-close="1">${t('Cancel')}</button><button class="btn">${t('Send reset link')}</button></div></form>`); },
  usermenu: (d, el) => { const p = document.getElementById('umpanel'); p.hidden = !p.hidden; el.setAttribute('aria-expanded', !p.hidden); },
  logout: () => { const r = S().role; SF.logout(); SF.closeModal(); SF.ui.loginType = r; SF.toast(t('You are signed out')); SF.go('#/login/' + r); },
  wzback: () => { const su = S().signup; collect(document.getElementById('su-form')); SF.ui.wzErr = null; su.step = Math.max(0, su.step - 1); SF.render(); window.scrollTo({ top: 0 }); },
  wzgo: d => { const su = S().signup, f = document.getElementById('su-form'); if (f) collect(f); SF.ui.wzErr = null; su.step = +d.i; SF.render(); window.scrollTo({ top: 0 }); },
  // office hours
  book: d => SF.modal(`<h3>${t('Book {m}', { m: esc(d.m) })}</h3><p class="muted" style="margin:0">${esc(d.s)} · ${t('30 minutes')}</p>
    <form id="book-form" class="stack" data-m="${esc(d.m)}" data-s="${d.s}"><div class="field"><label for="bk-t">${t('Your question')}</label><textarea id="bk-t" required placeholder="${t('e.g. How should I price my first pilot?')}"></textarea></div>
    <div class="field"><label for="bk-tried">${t('What have you tried?')}</label><input id="bk-tried"></div>
    <label class="row small" style="gap:8px"><input type="checkbox" id="bk-share" checked> ${t('Share my startup profile with the mentor')}</label>
    <div class="row end"><button type="button" class="btn ghost" data-close="1">${t('Cancel')}</button><button class="cta" type="submit"><span class="btn">${t('Book')}</span>${SF.ARROW}</button></div></form>`),
  ohcancel: d => { const b = bk(d.id); b.status = 'Cancelled'; SF.notify('mentor', t('{n} cancelled the {s} session', { n: b.by, s: b.slot }), '#/hours'); SF.toast(t('Session cancelled')); SF.render(); },
  ohslot: d => { const m = SF.me().name, av = S().avail[m] = S().avail[m] || []; S().avail[m] = av.includes(d.k) ? av.filter(x => x !== d.k) : [...av, d.k]; SF.render(); },
  ohdone: d => { const b = bk(d.id); SF.modal(`<h3>${t('Session with {n}', { n: esc(b.by) })}</h3><form id="ohnote-form" class="stack" data-id="${b.id}"><div class="field"><label for="oh-n">${t('Notes for the founder (they will see them)')}</label><textarea id="oh-n" required>${t('Next step: ')}</textarea></div>
    <div class="row end"><button type="button" class="btn ghost" data-close="1">${t('Cancel')}</button><button class="btn">${t('Mark done')}</button></div></form>`); },
  ohrate: d => { const b = bk(d.id); b.rating = +d.n; SF.notify('mentor', t('{n} rated your session {r}/5', { n: b.by, r: d.n }), '#/hours'); SF.toast(t('Thanks for the rating')); SF.render(); },
  // judging
  submitscores: d => { const ev = d.ev, dr = S().judgeDraft[ev] || {}, teams = SF.teamsFor(ev);
    const missing = teams.filter(tm => !dr[tm.n] || SF.CRITERIA.some(([k]) => !dr[tm.n][k]));
    if (missing.length) return SF.toast(t('Score every criterion for: {l}', { l: missing.map(x => x.n).join(', ') }));
    const me = SF.me().name, first = !(S().scores[ev] || {})[me]; (S().scores[ev] = S().scores[ev] || {})[me] = JSON.parse(JSON.stringify(dr)); S().filters.jedit = '';
    if (first) SF.award('mentor', 'score', t('Judged {e}', { e: t(SF.JUDGING.find(j => j.id === ev).title) }));
    SF.notify('org', t('{n} submitted scores for {e}', { n: me, e: t(SF.JUDGING.find(j => j.id === ev).title) }), '#/judge'); SF.toast(t('Scores submitted. The leaderboard is updated.')); SF.render(); },
  lockres: d => { const ev = d.ev, J = SF.JUDGING.find(j => j.id === ev), L = SF.leader(ev); S().locked[ev] = true;
    SF.TRACKS.forEach(tr => { const top = L.find(x => x.tr === tr && x.avg); if (top) S().finalists[J.region + '|' + tr] = top.n; });
    ['participant', 'mentor'].forEach(r => SF.notify(r, t('Results for {e} are final', { e: t(J.title) }), '#/season'));
    SF.toast(t('Results locked. Finalists added to the season.')); SF.render(); },
  nudge: d => { SF.notify('mentor', t('Reminder: please submit your scorecards'), '#/judge'); SF.toast(t('Reminder sent to {n}', { n: d.n })); },
  volunteer: () => { SF.notify('org', t('{n} volunteered to judge', { n: SF.me().name }), '#/judge'); SF.toast(t('Thanks! The org team will be in touch.')); },
  // peer groups
  peerjoin: d => { const g = SF.PEER_GROUPS.find(x => x.id === d.g), free = SF.me().points >= 1000 || Object.values(S().finalists).includes(SF.me().fields.team);
    payModal(t('Join {g}', { g: t(g.name) }), free ? 0 : SF.PEER_PRICE, 'peer-form', `data-g="${g.id}"`); },
  peerwait: d => { (S().peer.waitlist[d.g] = S().peer.waitlist[d.g] || []).push(SF.myName()); SF.toast(t('You are on the waiting list')); SF.render(); },
  peerleave: d => { S().peer.joined[d.g] = (S().peer.joined[d.g] || []).filter(n => n !== SF.myName()); SF.toast(t('You left the group')); SF.render(); },
  // recognition
  recogapply: d => SF.modal(`<h3>${t('Apply to be a {l}', { l: t(d.l) })}</h3><form id="recog-form" class="stack" data-l="${d.l}">
    <div class="field"><label for="rc-s">${t('What did you do for the community this year?')}</label><textarea id="rc-s" required placeholder="${t('Events you hosted, people you helped, results')}"></textarea></div>
    <div class="two"><div class="field"><label for="rc-r1">${t('Reference 1')}</label><input id="rc-r1" required placeholder="${t('Name and Startup Fest ID')}"></div><div class="field"><label for="rc-r2">${t('Reference 2')}</label><input id="rc-r2" required></div></div>
    <div class="row end"><button type="button" class="btn ghost" data-close="1">${t('Cancel')}</button><button class="btn">${t('Send application')}</button></div></form>`),
  renew: d => SF.modal(`<h3>${t('Renew for 2027')}</h3><form id="renew-form" class="stack" data-id="${d.id}"><div class="field"><label for="rn-s">${t('What did you do this year?')}</label><textarea id="rn-s" required></textarea></div>
    <div class="row end"><button type="button" class="btn ghost" data-close="1">${t('Cancel')}</button><button class="btn">${t('Send renewal')}</button></div></form>`),
  recogok: d => { const x = S().recog.find(y => y.id === d.id); x.status = 'Approved'; x.since = x.since || 'Oct 2026'; x.renews = 'Oct 2027'; SF.notify(x.role, t('You are now a {l}. Congratulations!', { l: t(x.level) }), '#/fellows'); SF.toast(t('Approved')); SF.render(); },
  recogno: d => { const x = S().recog.find(y => y.id === d.id); x.status = 'Declined'; SF.notify(x.role, t('Your {l} application was not approved this time', { l: t(x.level) }), '#/fellows'); SF.toast(t('Declined')); SF.render(); },
});

/* ---------- inputs: live counters, password rules, scores, member type ---------- */
document.addEventListener('input', e => { const el = e.target;
  if (el.dataset && el.dataset.count) { const n = document.getElementById(el.id + '-n'), max = el.dataset.count.split('-')[1]; if (n) n.textContent = el.value.length + (+max ? ' / ' + max : ''); }
  if (el.id === 'su-pass' || el.id === 'pw-new') { const ul = el.closest('.field').querySelector('.pw-rules'); if (ul) ul.outerHTML = SF.pwList(el.value); }
});
document.addEventListener('change', e => { const el = e.target;
  if (el.name === 'su-type') { const su = S().signup; if (su.type !== el.value) { su.type = el.value; su.done = su.done.filter(k => ['type', 'account', 'personal'].includes(k)); } SF.ui.wzErr = null; SF.render(); }
  if (el.dataset && el.dataset.score) { const dr = S().judgeDraft[el.dataset.ev] = S().judgeDraft[el.dataset.ev] || {}; (dr[el.dataset.team] = dr[el.dataset.team] || {})[el.dataset.k] = +el.value || ''; SF.render(); const again = document.getElementById(el.id); again && again.focus(); }
});
// hidden role switch (used by the automated tests): signs in as that type's demo account
document.addEventListener('change', e => { if (e.target.id === 'role') SF.loginAs(e.target.value); }, true);

/* ---------- forms ---------- */
const fh5 = SF.formHandlers;
SF.formHandlers = (f, val) => {
  if (f.id === 'login-form') { const type = f.dataset.type, mail = val('li-mail').toLowerCase(), pass = (f.querySelector('#li-pass') || {}).value || '';
    SF.ui.loginMail = val('li-mail'); const acc = S().accounts.find(a => a.email.toLowerCase() === mail);
    if (!mail || !pass) SF.ui.loginErr = t('Enter your email and password');
    else if (!acc || acc.pass !== pass) SF.ui.loginErr = t('The email or password is wrong');
    else if (acc.role !== type) SF.ui.loginErr = t('This is a {r} account. Use the {r} login.', { r: t(SF.ROLES[acc.role].label) }) + ` <a class="link" href="#/login/${acc.role}">${t('Go to the {r} login', { r: t(SF.ROLES[acc.role].label) })}</a>`;
    else { S().remember = f.querySelector('#li-rem').checked; SF.login(acc); SF.ui = {}; SF.toast(t('Signed in as {n}', { n: acc.contact })); return SF.go('#/' + SF.NAV[acc.role][0]); }
    return SF.render(); }
  if (f.id === 'su-form') { const su = S().signup, key = f.dataset.step, d = collect(f);
    if (key === 'type') { const r = f.querySelector('input[name=su-type]:checked'); if (r) su.type = r.value; }
    const e = validate(key, d, su.type); SF.ui.wzErr = Object.keys(e).length ? e : null;
    if (SF.ui.wzErr) { SF.render(); const first = document.querySelector('[aria-invalid="true"]'); first && first.focus(); return; }
    if (!su.done.includes(key)) su.done.push(key);
    if (key === 'review') { const acc = createAccount(); SF.go('#/me');
      SF.modal(`<div class="center stack" style="align-items:center">${SF.STAR(56)}<h3>${t('Your account is ready')}</h3><p class="muted" style="margin:0">${t('Sign in next time through the {r} login with {e}.', { r: t(SF.ROLES[acc.role].label), e: esc(acc.email) })}</p>
        <div class="mono">${SF.me().id}</div><button class="btn" data-close="1">${t('Go to my ID')}</button></div>`); return; }
    su.step = Math.min(su.step + 1, stepsNow().length - 1); SF.render(); window.scrollTo({ top: 0 }); return; }
  if (f.id === 'forgot-form') { const a = S().accounts.find(x => x.email.toLowerCase() === val('fg-mail').toLowerCase());
    if (!a) return SF.toast(t('No account with this email'));
    SF.modal(`<h3>${t('Choose a new password')}</h3><p class="muted small" style="margin:0">${t('Demo reset link for {e}', { e: esc(a.email) })}</p><form id="reset-form" class="stack" data-acc="${a.id}">
      <div class="field"><label for="pw-new">${t('New password')}</label><input id="pw-new" type="password" autocomplete="new-password">${SF.pwList('')}</div>
      <div class="row end"><button class="btn">${t('Save password')}</button></div></form>`); return; }
  if (f.id === 'reset-form' || f.id === 'pass-form') { const a = f.id === 'reset-form' ? S().accounts.find(x => x.id === f.dataset.acc) : SF.account(), p = (f.querySelector('#pw-new') || {}).value || '';
    if (f.id === 'pass-form' && (f.querySelector('#pw-old').value !== a.pass)) return SF.toast(t('The current password is wrong'));
    if (SF.pwRules(p).some(([ok]) => !ok)) return SF.toast(t('The password does not meet all the rules'));
    if (f.id === 'pass-form' && f.querySelector('#pw-new2').value !== p) return SF.toast(t('Passwords do not match'));
    a.pass = p; SF.closeModal(); SF.toast(t('Password changed')); return SF.render(); }
  if (f.id === 'acct-form') { const a = SF.account(), m = val('ac-mail');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m)) return SF.toast(t('Enter a valid email'));
    if (S().accounts.some(x => x !== a && x.email.toLowerCase() === m.toLowerCase())) return SF.toast(t('An account with this email already exists. Sign in instead.'));
    a.email = m; a.contact = val('ac-name') || a.contact; SF.toast(t('Saved')); return SF.render(); }
  if (f.id === 'book-form') { const me = SF.me(); S().bookings.unshift({ id: 'bk' + Date.now(), mentor: f.dataset.m, by: SF.myName(), team: me.fields.team || me.name, slot: f.dataset.s, topic: val('bk-t'), status: 'Booked' });
    SF.award(S().role, 'book', t('Booked office hours with {m}', { m: f.dataset.m })); SF.notify('mentor', t('{n} booked {s}: {q}', { n: SF.myName(), s: f.dataset.s, q: val('bk-t').slice(0, 50) }), '#/hours');
    SF.closeModal(); SF.toast(t('Booked. The mentor gets a Telegram reminder 1 hour before.')); return SF.render(); }
  if (f.id === 'ohnote-form') { const b = bk(f.dataset.id); b.status = 'Done'; b.notes = val('oh-n'); SF.award('mentor', 'ohdone', t('Gave office hours to {n}', { n: b.by }));
    if (b.by === SF.myNameOf('participant')) SF.notify('participant', t('{m} left notes from your session', { m: b.mentor }), '#/hours');
    SF.closeModal(); SF.toast(t('Session marked done. +{p} points', { p: SF.RULES.ohdone })); return SF.render(); }
  if (f.id === 'peernote-form') { const g = f.dataset.g; (S().peer.notes[g] = S().peer.notes[g] || []).unshift({ d: '25 Oct', by: SF.myName(), t: val('pn-t') }); return SF.render(); }
  if (f.id === 'peer-form') { const g = SF.PEER_GROUPS.find(x => x.id === f.dataset.g), m = (f.querySelector('input[name=pm]:checked') || {}).value;
    (S().peer.joined[g.id] = S().peer.joined[g.id] || []).push(SF.myName());
    if (m) S().invoices.unshift({ id: 'INV-2026-0' + (invN++), to: SF.myName(), plan: 'peer', amount: SF.PEER_PRICE, status: 'Paid', method: { click: 'Click', payme: 'Payme', uzcard: 'Uzcard / Humo card' }[m], date: '25 Oct 2026' });
    SF.award(S().role, 'peer', t('Joined the peer group {g}', { g: t(g.name) })); SF.notify('mentor', t('{n} joined {g}', { n: SF.myName(), g: t(g.name) }), '#/peers');
    SF.closeModal(); SF.toast(t('Welcome to the group. First session: {d}', { d: g.next })); return SF.render(); }
  if (f.id === 'recog-form') { S().recog.unshift({ id: 'fa' + Date.now(), name: SF.myName(), role: S().role, level: f.dataset.l, status: 'Submitted', since: '', renews: '', story: val('rc-s'), refs: [val('rc-r1'), val('rc-r2')] });
    SF.notify('org', t('{n} applied to be a {l}', { n: SF.myName(), l: t(f.dataset.l) }), '#/fellows'); SF.closeModal(); SF.toast(t('Application sent. The team replies within 2 weeks.')); return SF.render(); }
  if (f.id === 'renew-form') { const x = S().recog.find(y => y.id === f.dataset.id); x.status = 'Renewal submitted'; x.story = val('rn-s');
    SF.notify('org', t('{n} sent a {l} renewal', { n: x.name, l: t(x.level) }), '#/fellows'); SF.closeModal(); SF.toast(t('Renewal sent')); return SF.render(); }
  return fh5 && fh5(f, val);
};
})();
