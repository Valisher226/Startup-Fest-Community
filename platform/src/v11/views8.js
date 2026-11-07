// v8 views: users, permissions, audit log, backend plan, privacy centre, security in account settings, no-access page
(() => {
const t = (s, v) => SF.t(s, v), esc = SF.esc, V = SF.V;
const S = () => SF.S, role = () => SF.S.role, R = k => SF.ROLES[k];
const sh = (title, right = '') => `<div class="sec-h"><h2>${title}</h2>${right}</div>`;
const when = iso => { if (!iso) return '–'; const d = new Date(iso); return d.toLocaleString(SF.lang === 'ru' ? 'ru' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); };
SF.when = when;
SF.can = (perm, r = role()) => r === 'org' || !SF.S.perms || !SF.S.perms[perm] || SF.S.perms[perm].includes(r);
SF.permOf = v => (SF.PERMS.find(p => p[2].includes(v)) || [])[0];
const trustNav = cur => `<nav class="subnav" aria-label="${t('Trust and safety')}">${[['users', 'Users'], ['permissions', 'Permissions'], ['audit', 'Audit log'], ['backend', 'Backend plan']].map(([k, l]) => `<a href="#/${k}" ${cur === k ? 'aria-current="page"' : ''}>${t(l)}</a>`).join('')}</nav>`;
const personOf = a => a.person || (S().slot[a.role] === a.id ? S().people[a.role] : null);

V.noaccess = p => `<div class="card pad stack center" style="align-items:center;max-width:560px;margin:40px auto">${SF.STAR(56)}<h2 class="display" style="font-size:44px">${t('No access')}</h2>
  <p class="muted" style="margin:0">${t('Your member type ({r}) cannot open this page. The Startup Fest team sets what each member type can do.', { r: t(R(role()).label) })}</p><a class="btn" href="#/home">${t('Back to home')}</a></div>`;

/* ---------- Users ---------- */
V.users = () => { const f = S().filters.utype || 'All', q = (S().filters.uq || '').toLowerCase();
  const list = S().accounts.filter(a => (f === 'All' || a.role === f) && (!q || (a.email + a.contact).toLowerCase().includes(q)));
  const by = Object.keys(SF.ROLES).map(k => [k, S().accounts.filter(a => a.role === k).length]);
  return `${trustNav('users')}${sh(t('Users'), `<button class="btn" data-act="invite">${t('Invite a member')}</button>`)}
  <div class="kpis"><div class="kpi red"><b class="num">${S().accounts.length}</b><span>${t('accounts in this demo')}</span></div><div class="kpi black"><b class="num">${S().accounts.filter(a => a.status === 'suspended').length}</b><span>${t('suspended')}</span></div>
    <div class="kpi"><b class="num">${S().accounts.filter(a => a.twofa).length}</b><span>${t('with a two-step code')}</span></div><div class="kpi"><b class="num">${S().deleted || 0}</b><span>${t('deleted on request')}</span></div></div>
  <div class="filters" style="margin-top:16px"><button class="chip ${f === 'All' ? 'red' : ''}" data-act="filter" data-k="utype" data-v="All">${t('All')} · ${S().accounts.length}</button>${by.map(([k, n]) => `<button class="chip ${f === k ? 'red' : ''}" data-act="filter" data-k="utype" data-v="${k}">${t(R(k).label)} · ${n}</button>`).join('')}
    <label class="sr" for="u-q">${t('Search')}</label><input id="u-q" class="input" data-filter="uq" placeholder="${t('Search by name or email')}" value="${esc(S().filters.uq || '')}"></div>
  <div class="card tablewrap"><table><thead><tr><th>${t('Name')}</th><th>${t('Email')}</th><th>${t('Member type')}</th><th>${t('Last sign-in')}</th><th>${t('Two-step')}</th><th>${t('Status')}</th><th></th></tr></thead><tbody>
  ${list.map(a => `<tr><td><div class="row" style="gap:8px;flex-wrap:nowrap"><span class="mini" style="width:30px;height:30px;font-size:11px;background:${R(a.role).color}">${SF.initials(a.contact)}</span><b>${esc(a.contact)}</b></div></td><td class="mono">${esc(a.email)}</td><td>${t(R(a.role).label)}</td><td class="num">${when(a.last)}</td>
    <td>${a.twofa ? '✓' : '–'}</td><td><span class="chip ${a.status === 'suspended' ? 'warn' : a.status === 'invited' ? '' : 'ok'}">${t({ active: 'Active', suspended: 'Suspended', invited: 'Invited' }[a.status] || 'Active')}</span></td>
    <td class="row" style="gap:6px;flex-wrap:nowrap">${a.id === (SF.account() || {}).id ? `<span class="muted small">${t('You')}</span>` : `${a.status === 'suspended' ? `<button class="btn ghost sm" data-act="ustatus" data-id="${a.id}" data-s="active">${t('Reactivate')}</button>` : `<button class="btn ghost sm" data-act="ustatus" data-id="${a.id}" data-s="suspended">${t('Suspend')}</button>`}<button class="btn ghost sm" data-act="ureset" data-id="${a.id}">${t('Reset password')}</button>`}</td></tr>`).join('')}</tbody></table></div>`; };

/* ---------- Permissions ---------- */
V.permissions = () => { const types = Object.keys(SF.ROLES).filter(k => k !== 'org');
  return `${trustNav('permissions')}${sh(t('Permissions'), `<button class="btn ghost sm" data-act="permreset">${t('Restore defaults')}</button>`)}
  <p class="muted" style="margin:-6px 0 14px">${t('Tick what each member type can open. Changes apply at once: menus hide the page and direct links are blocked. The Org team always has full access.')}</p>
  <div class="card tablewrap"><table class="perm-grid"><thead><tr><th>${t('Feature')}</th>${types.map(k => `<th><span class="dot" style="background:${R(k).color}"></span>${t(R(k).label)}</th>`).join('')}</tr></thead><tbody>
  ${SF.PERMS.map(([k, l]) => `<tr><th scope="row">${t(l)}</th>${types.map(r => `<td><label class="perm-cell"><input type="checkbox" data-perm="${k}" data-r="${r}" ${S().perms[k].includes(r) ? 'checked' : ''} aria-label="${esc(t(l) + ' · ' + t(R(r).label))}"><span></span></label></td>`).join('')}</tr>`).join('')}</tbody></table></div>`; };

/* ---------- Audit log ---------- */
V.audit = () => { const f = S().filters.atype || 'All', list = S().audit.filter(x => f === 'All' || x.type === f);
  return `${trustNav('audit')}${sh(t('Audit log'), `<button class="btn ghost sm" data-act="auditcsv">${t('Export CSV')}</button>`)}
  <p class="muted" style="margin:-6px 0 14px">${t('Every sensitive action is recorded with who did it and when. On the real server this log cannot be edited and is kept for 3 years.')}</p>
  <div class="filters">${['All', ...SF.AUDIT_TYPES].map(x => `<button class="chip ${f === x ? 'red' : ''}" data-act="filter" data-k="atype" data-v="${x}">${t(x)}</button>`).join('')}</div>
  <div class="card tablewrap"><table><thead><tr><th>${t('When')}</th><th>${t('Who')}</th><th>${t('Type')}</th><th>${t('Action')}</th><th>${t('Target')}</th></tr></thead><tbody>
  ${list.slice(0, 80).map(x => `<tr><td class="num">${when(x.at)}</td><td>${esc(x.who)}</td><td><span class="chip ${x.type === 'Security' ? 'warn' : ''}">${t(x.type)}</span></td><td>${t(x.act)}</td><td class="mono">${esc(x.target || '')}</td></tr>`).join('') || `<tr><td colspan="5" class="muted">${t('Nothing yet')}</td></tr>`}</tbody></table></div>`; };

/* ---------- Backend plan ---------- */
V.backend = () => `${trustNav('backend')}${sh(t('What the real platform needs'), `<span class="muted">${t('From this demo to real accounts')}</span>`)}
  <div class="grid g2">${SF.BACKEND.map(([a, b], i) => `<div class="card pad stack" style="gap:6px"><div class="row" style="gap:10px"><span class="step-n">${i + 1}</span><b style="font-size:18px">${t(a)}</b></div><span class="muted">${t(b)}</span></div>`).join('')}</div>
  ${sh(t('Running cost per month (estimate)'))}<div class="card tablewrap"><table><tbody>${SF.BACKEND_COST.map(([a, v]) => `<tr><td>${t(a)}</td><td class="num" style="text-align:right">${SF.uzs(v)}</td></tr>`).join('')}
  <tr><th>${t('Total')}</th><th class="num" style="text-align:right">${SF.uzs(SF.BACKEND_COST.reduce((a, x) => a + x[1], 0))}</th></tr></tbody></table></div>
  <p class="muted small">${t('Estimates for the demo. Real prices depend on the provider and the number of members.')}</p>`;

/* ---------- Privacy centre ---------- */
V.privacy = () => { const a = SF.account(); if (!a) return V.login(); const p = SF.me(), c = a.consent = a.consent || { tg: true, mail: true, sms: false, recommend: true };
  const val = k => k === 'name' ? p.name : k === 'region' ? t(p.region) : k === 'id' ? p.id : k === 'points' ? t('{n} points, {m} actions', { n: p.points, m: p.log.length }) : k === 'email' ? a.email : (p.fields[k] || '–');
  const hist = S().consentLog.filter(x => x.who === a.contact);
  const demo = SF.DEMO_ACCOUNTS.some(x => x.id === a.id);
  return `${SF.back('#/account', t('Account settings'))}${sh(t('Privacy centre'), `<span class="muted">${t('Your data, your choices')}</span>`)}
  <div class="grid g2" style="align-items:start"><div class="card pad stack"><b>${t('What we store about you')}</b><div class="list">${SF.STORED.map(([k, l]) => `<div class="it"><div class="grow"><div class="s">${t(l)}</div><div class="t">${esc(val(k))}</div></div></div>`).join('')}</div>
    <span class="muted small">${t('Stored in Uzbekistan, as the Law “On personal data” requires. We never sell personal data. Startups are recommended to partners only if they agree.')}</span></div>
  <div class="stack"><div class="card pad stack"><b>${t('Consents')}</b>${[['tg', 'Weekly digest in Telegram'], ['mail', 'Event reminders by email'], ['sms', 'SMS when a payment or ticket needs action'], ['recommend', role() === 'participant' ? 'Startup Fest may recommend my profile to partners' : 'Show my profile in the member directory']].map(([k, l]) => `<div class="row between"><span>${t(l)}</span><label class="switch"><input type="checkbox" data-consent="${k}" ${c[k] ? 'checked' : ''} aria-label="${esc(t(l))}"><span></span></label></div>`).join('')}
    ${hist.length ? `<div class="eyebrow" style="margin-top:6px">${t('History')}</div><div class="list">${hist.slice(0, 5).map(x => `<div class="it small"><div class="grow">${t(x.what)}</div><span class="chip ${x.on ? 'ok' : ''}">${x.on ? t('On') : t('Off')}</span><span class="muted num">${when(x.at)}</span></div>`).join('')}</div>` : ''}</div>
    <div class="card pad stack"><b>${t('Download my data')}</b><span class="muted small">${t('A file with everything we store about your account, in JSON format.')}</span><button class="btn ghost" style="align-self:start" data-act="mydata">${t('Download my data')}</button></div>
    <div class="card pad stack danger"><b>${t('Delete my account')}</b><span class="muted small">${t('Your ID, profile and points are removed. Payments stay in the accounting records for 5 years, as the law requires, without your profile.')}</span>
      ${demo ? `<span class="small">${t('Demo accounts from LOGINS.txt cannot be deleted. Create your own account to try this.')}</span>` : `<button class="btn dark" style="align-self:start" data-act="delacct">${t('Delete my account')}</button>`}</div></div></div>`; };

/* ---------- Account settings: security ---------- */
const acct7 = V.account;
V.account = () => { const h = acct7(), a = SF.account(); if (!a) return h; const hist = S().audit.filter(x => x.target === a.email && x.type === 'Security').slice(0, 6);
  return h + `<div class="grid g2" style="margin-top:16px;align-items:start"><div class="card pad stack"><b>${t('Two-step code')}</b><span class="muted small">${a.role === 'org' ? t('Required for Org team accounts. A 6-digit code is sent to your Telegram at every sign-in.') : t('Ask for a 6-digit code from Telegram at every sign-in.')}</span>
    <div class="row between"><span>${a.twofa ? t('On') : t('Off')}</span><label class="switch"><input type="checkbox" id="twofa" ${a.twofa ? 'checked' : ''} ${a.role === 'org' ? 'disabled' : ''} aria-label="${t('Two-step code')}"><span></span></label></div></div>
    <div class="card pad stack"><b>${t('Recent sign-ins')}</b><div class="list">${hist.map(x => `<div class="it small"><div class="grow">${t(x.act)}</div><span class="muted num">${when(x.at)}</span></div>`).join('') || `<span class="muted">–</span>`}</div><a class="link small" href="#/privacy">${t('Privacy centre')} →</a></div></div>`; };

/* ---------- org dashboard: trust tile ---------- */
const adm7 = V.admin;
V.admin = () => adm7().replace('<div class="grid g3">', `<div class="grid g3"><a class="card pad tile" href="#/users"><b style="font-size:20px">${t('Trust and safety')}</b><span class="muted">${t('{n} accounts · {s} suspended', { n: S().accounts.length, s: S().accounts.filter(a => a.status === 'suspended').length })}</span></a>`);

/* ---------- event page: camera check-in ---------- */
const ev7 = V.events;
V.events = p => { const h = ev7(p); if (role() !== 'org' || !p) return h;
  return h.replace('<form class="row" id="checkin-form"', `<button class="btn ghost sm" data-act="camscan" data-ev="${p}" style="align-self:start;margin-bottom:8px">📷 ${t('Scan with the camera')}</button><form class="row" id="checkin-form"`); };
})();
