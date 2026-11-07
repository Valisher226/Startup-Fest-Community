// v11 views: founder check-in (#/founder) and the Org team's portfolio (#/portfolio, #/pstartup/<id>)
(() => {
const t = (s, v) => SF.t(s, v), esc = SF.esc, V = SF.V;
const sh = (title, right = '') => `<div class="sec-h"><h2>${title}</h2>${right}</div>`;
SF.pf = SF.pf || { f: { status: 'idle' }, o: { status: 'idle' }, hist: {} };
const F = () => SF.pf.f, O = () => SF.pf.o;
const MONTHS = { en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], uz: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'], ru: ['янв.', 'февр.', 'марта', 'апр.', 'мая', 'июня', 'июля', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'] };
const date = d => { if (!d) return ''; const x = new Date(d), m = (MONTHS[SF.lang] || MONTHS.en)[x.getMonth()]; return SF.lang === 'uz' ? `${x.getDate()}-${m}, ${x.getFullYear()}` : `${x.getDate()} ${m} ${x.getFullYear()}`; };
const batchChip = (sb, all) => { const b = all ? all.find(x => x.id === sb.batch_id) : sb.batches; return `<span class="chip" title="${esc(sb.result || '')}">${esc(b ? b.name.replace('Catalyst × ', '') : sb.batch_id)}${/place|\$|pilot/i.test(sb.result || '') ? ' 🏆' : ''}</span>`; };
const loginCard = (slot, title, intro, extra = '') => { const st = SF.pf[slot === 'founder' ? 'f' : 'o'];
  return `<div class="auth"><aside class="auth-side"><div class="auth-star" aria-hidden="true">${SF.STAR(300, '#fff')}</div>
    <h1 class="display">${title}</h1><p>${intro}</p>${extra}</aside>
  <section class="card pad auth-main stack"><h2 class="display" style="font-size:clamp(32px,4vw,46px)">${t('Sign in')}</h2>
    ${st.err ? `<div class="alert" role="alert">${esc(st.err)}</div>` : ''}
    <form id="pf-login-${slot}" class="stack" data-slot="${slot}">
      <div class="field"><label for="pf-l-${slot}">${t(slot === 'founder' ? 'Startup login' : 'Staff email or login')}</label><input id="pf-l-${slot}" autocomplete="username" required autocapitalize="off" spellcheck="false"></div>
      <div class="field"><label for="pf-p-${slot}">${t('Password')}</label><input id="pf-p-${slot}" type="password" autocomplete="current-password" required></div>
      <button class="btn" ${st.status === 'signing' ? 'disabled' : ''}>${t(st.status === 'signing' ? 'Signing in…' : 'Sign in')}</button></form></section></div>`; };

/* ---------- founder ---------- */
const loadFounder = () => { const f = F(); if (f.status === 'loading') return; f.status = 'loading';
  SF.sb.rest('founder').get('startups?select=*,startup_batches(result,batches(name,held_on)),team_members(id,name,role,is_owner)&order=id')
    .then(rows => { const s = rows[0]; if (!s) throw new SF.sb.SbError(t('This login is not linked to a startup. Write to the Startup Fest team.'), 403);
      s.team_members.sort((a, b) => b.is_owner - a.is_owner || a.name.localeCompare(b.name));
      Object.assign(f, { status: 'ready', data: s, draft: { ...s, since_catalyst: [...s.since_catalyst] }, step: f.step ?? (s.confirmed_at ? SF.PF_STEPS.length - 1 : 0), err: '' }); })
    .catch(e => { if (e.status === 401) { SF.sb.signOut('founder'); f.status = 'idle'; } else { f.status = 'error'; f.err = e.message; } })
    .finally(() => { if (location.hash.startsWith('#/founder')) SF.render(); }); };

const stepBody = (s, d, i) => {
  const chips = (k, opts, multi) => `<div class="filters" role="group">${opts.map(([v, l]) => { const on = multi ? d[k].includes(v) : d[k] === v;
    return `<button type="button" class="chip ${on ? 'red' : ''}" aria-pressed="${on}" data-act="pfpick" data-k="${k}" data-v="${esc(v)}" ${multi ? 'data-multi="1"' : ''}>${t(l)}</button>`; }).join('')}</div>`;
  switch (i) {
    case 0: return `<p class="muted" style="margin:0">${t('Check the name and the one-line description. Edit anything that is wrong.')}</p>
      <div class="field"><label for="pf-name">${t('Startup name')}</label><input id="pf-name" data-pf="name" value="${esc(d.name)}" required></div>
      <div class="field"><label for="pf-one">${t('What does it do, in one sentence?')}</label><textarea id="pf-one" data-pf="one_liner" rows="2" placeholder="${t('e.g. An AI operator that answers customer calls in Uzbek and Russian')}">${esc(d.one_liner)}</textarea></div>
      <div class="two"><div class="field"><label for="pf-sec">${t('Sector')}</label><select id="pf-sec" data-pf="sector"><option value="">${t('Choose')}</option>${[...new Set([d.sector, ...SF.PF_SECTORS].filter(Boolean))].map(x => `<option ${x === d.sector ? 'selected' : ''} value="${esc(x)}">${t(x)}</option>`).join('')}</select></div>
      <div class="field"><label for="pf-reg">${t('Region')}</label><select id="pf-reg" data-pf="region"><option value="">${t('Choose')}</option>${[...new Set([d.region, ...SF.REGIONS].filter(Boolean))].map(x => `<option ${x === d.region ? 'selected' : ''} value="${esc(x)}">${t(x)}</option>`).join('')}</select></div></div>`;
    case 1: return `<p class="muted" style="margin:0">${t('Who is in the team now? Remove people who left, add new ones.')}</p>
      <ul class="stack" style="list-style:none;padding:0;margin:0">${s.team_members.map(m => `<li class="card pad row between" style="gap:10px;padding:12px 14px">
        <div class="grow"><b>${esc(m.name)}</b>${m.is_owner ? ` <span class="chip ok">${t('You')}</span>` : ''}<br><input class="input" style="margin-top:6px;width:100%" aria-label="${t('Role of {n}', { n: m.name })}" placeholder="${t('Role, e.g. CEO, CTO, designer')}" value="${esc(m.role)}" data-pfrole="${m.id}"></div>
        ${m.is_owner ? '' : `<button type="button" class="btn ghost sm" data-act="pfdelmember" data-id="${m.id}">${t('Remove')}</button>`}</li>`).join('')}</ul>
      <form id="pf-add" class="pf-add"><label class="sr" for="pf-new">${t('Name')}</label><input id="pf-new" class="input" placeholder="${t('Add a member: full name')}"><label class="sr" for="pf-newrole">${t('Role')}</label><input id="pf-newrole" class="input" placeholder="${t('Role')}"><button class="btn ghost">${t('Add')}</button></form>`;
    case 2: return `<p class="muted" style="margin:0">${t('Where is the product today?')}</p>${chips('stage', SF.PF_STAGES.map(x => [x, x]))}`;
    case 3: return `<p class="muted" style="margin:0">${t('Are you still working on it?')}</p>${chips('status', SF.PF_STATUS)}`;
    case 4: return `<p class="muted" style="margin:0">${t('What happened since Catalyst? Choose all that apply.')}</p>${chips('since_catalyst', SF.PF_SINCE, true)}`;
    case 5: return `<div class="field"><label for="pf-link">${t('Website, app, bot or demo link')}</label><input id="pf-link" data-pf="link" type="url" inputmode="url" placeholder="https://" value="${esc(d.link)}"></div>`;
    case 6: return `<p style="margin:0">${t('Can Startup Fest recommend your startup to companies and investors?')}</p><p class="muted small" style="margin:0">${t('We only share your startup name, description and contact with partners you would want to meet. You can change this any time.')}</p>
      <div class="filters" role="group">${[[true, 'Yes'], [false, 'No']].map(([v, l]) => `<button type="button" class="chip ${d.can_recommend === v ? 'red' : ''}" aria-pressed="${d.can_recommend === v}" data-act="pfpick" data-k="can_recommend" data-v="${v}">${t(l)}</button>`).join('')}</div>`;
    default: return `<dl class="pf-sum">${[['Startup name', d.name], ['One-liner', d.one_liner], ['Sector', t(d.sector || '–')], ['Region', t(d.region || '–')], ['Team', s.team_members.map(m => m.name + (m.role ? ' (' + m.role + ')' : '')).join(', ')],
        ['Stage', t(d.stage || '–')], ['Status', t((SF.PF_STATUS.find(x => x[0] === d.status) || [, '–'])[1])], ['Since Catalyst', d.since_catalyst.map(k => t((SF.PF_SINCE.find(x => x[0] === k) || [, k])[1])).join(', ') || '–'],
        ['Link', d.link || '–'], ['Recommendations', d.can_recommend === null ? '–' : t(d.can_recommend ? 'Yes' : 'No')]]
        .map(([k, v], n) => `<div><dt>${t(k)}</dt><dd>${esc(v || '–')} <button type="button" class="linkbtn" data-act="pfgo" data-n="${[0, 0, 0, 0, 1, 2, 3, 4, 5, 6][n]}">${t('Edit')}</button></dd></div>`).join('')}</dl>
      ${s.confirmed_at ? `<div class="alert ok" role="status">✓ ${t('Confirmed on {d}. Thank you! You can come back and update it any time.', { d: date(s.confirmed_at) })}</div>` : ''}`;
  }
};

V.founder = () => {
  const f = F();
  if (!SF.sb.session('founder')) return loginCard('founder', t('YOUR STARTUP'), t('You took part in a Startup Fest Catalyst. Sign in with the login and password we sent you, check your startup’s details and confirm them. It takes about two minutes.'),
    `<p class="small" style="opacity:.85">${t('Prefer Telegram? The same check-in works in our bot.')} <a href="${SF.PF_BOT}" style="color:#fff;text-decoration:underline">${t('Open the bot')}</a></p>`);
  if (f.status === 'idle') { loadFounder(); }
  if (f.status !== 'ready') return `<div class="card pad">${f.status === 'error' ? `<div class="alert" role="alert">${esc(f.err)}</div><button class="btn ghost" data-act="pfout" data-slot="founder">${t('Sign out')}</button>` : `<p class="muted">${t('Loading your startup…')}</p>`}</div>`;
  const s = f.data, d = f.draft, i = f.step, last = SF.PF_STEPS.length - 1;
  return `${sh(esc(s.name), `<button class="btn ghost sm" data-act="pfout" data-slot="founder">${t('Sign out')}</button>`)}
  <div class="row" style="gap:6px;margin-bottom:6px">${s.startup_batches.map(b => batchChip(b)).join('')}</div>
  <div class="card pad stack pf-wizard" style="max-width:720px">
    <div class="row between"><b>${t('Step {n} of {m}', { n: i + 1, m: last + 1 })} · ${t(SF.PF_STEPS[i])}</b>${f.saving ? `<span class="muted small">${t('Saving…')}</span>` : f.saved ? `<span class="muted small">✓ ${t('Saved')}</span>` : ''}</div>
    <div class="bar thick" role="progressbar" aria-valuemin="0" aria-valuemax="${last}" aria-valuenow="${i}"><i style="width:${Math.round(i / last * 100)}%"></i></div>
    ${f.err ? `<div class="alert" role="alert">${esc(f.err)}</div>` : ''}
    ${stepBody(s, d, i)}
    <div class="row between" style="margin-top:6px">${i ? `<button type="button" class="btn ghost" data-act="pfgo" data-n="${i - 1}">${t('Back')}</button>` : '<span></span>'}
      ${i < last ? `<div class="row" style="gap:8px">${i < last - 1 ? `<button type="button" class="linkbtn" data-act="pfgo" data-n="${i + 1}" data-skip="1">${t('Skip')}</button>` : ''}<button type="button" class="btn" data-act="pfgo" data-n="${i + 1}">${t(i === last - 1 ? 'Review' : 'Correct, next')}</button></div>`
        : `<button type="button" class="btn" data-act="pfconfirm" ${f.saving ? 'disabled' : ''}>${t(s.confirmed_at ? 'Confirm again' : 'Confirm my startup')}</button>`}</div>
  </div>
  <p class="muted small" style="max-width:720px">${t('Everything you change is saved right away and seen only by you and the Startup Fest team.')} <button class="linkbtn" data-act="pfpw">${t('Change my password')}</button></p>`;
};
SF.pfLoadFounder = loadFounder;

/* ---------- Portfolio: public for everyone, full for signed-in staff ---------- */
const staff = () => !!SF.sb.session('org');
const k$ = n => '$' + (n >= 1000 ? Math.round(n / 1000) + 'K' : n);
// results are stored in English; show them short and in the reader's language
const ACH = [
  [/^\$([\d,]+) investment from (.+)$/i, (m) => ({ en: `${k$(+m[1].replace(/,/g, ''))} investment · ${m[2]}`, uz: `${k$(+m[1].replace(/,/g, ''))} investitsiya · ${m[2]}`, ru: `${k$(+m[1].replace(/,/g, ''))} инвестиций · ${m[2]}` })],
  [/^\$([\d,]+) in (.+) credits$/i, (m) => ({ en: `${k$(+m[1].replace(/,/g, ''))} ${m[2]} credits`, uz: `${k$(+m[1].replace(/,/g, ''))} ${m[2]} kreditlari`, ru: `${k$(+m[1].replace(/,/g, ''))} кредитов ${m[2]}` })],
  [/^\$([\d,]+) from (.+)$/i, (m) => ({ en: `${k$(+m[1].replace(/,/g, ''))} · ${m[2]}`, uz: `${k$(+m[1].replace(/,/g, ''))} · ${m[2]}`, ru: `${k$(+m[1].replace(/,/g, ''))} · ${m[2]}` })],
  [/^(\d)(?:st|nd|rd|th) place(?: \(team project: (.+)\))?$/i, (m) => ({ en: `${m[1]}${['st', 'nd', 'rd'][m[1] - 1] || 'th'} place`, uz: `${m[1]}-o‘rin`, ru: `${m[1]} место` })],
  [/^Pilot contract with (.+)$/i, (m) => ({ en: `Pilot contract · ${m[1]}`, uz: `Pilot shartnoma · ${m[1]}`, ru: `Пилотный контракт · ${m[1]}` })],
];
SF.pfAch = text => String(text || '').split(/;\s*|\s+\+\s+/).filter(Boolean).map(seg => { seg = seg.trim();
  for (const [re, f] of ACH) { const m = seg.match(re); if (m) { const o = f(m); return o[SF.lang] || o.en; } } return seg; }).join(' · ');
SF.pfRaised = rows => rows.reduce((a, s) => a + [...String(s.achievement || '').matchAll(/\$([\d,]+)/g)].reduce((x, m) => x + +m[1].replace(/,/g, ''), 0), 0);
const RESULT = [[/^Pitched$/, 'Pitched'], [/^Selected startup$/, 'Selected'], [/^Accepted$/, 'Accepted'], [/^Selected cybersecurity team$/, 'Selected team'], [/^Hackathon team (\d+): (.+)$/, 'Hackathon team {n}: {p}']];
const result = r => { if (/\$|place|pilot/i.test(r || '')) return SF.pfAch(r); for (const [re, k] of RESULT) { const m = String(r || '').match(re); if (m) return t(k, { n: m[1], p: m[2] }); } return r || ''; };
const shortBatch = b => (b && b.name ? b.name : '').replace('Catalyst × ', '');

const loadPublic = () => { const pb = SF.pf.p = SF.pf.p || { status: 'idle' }; if (pb.status === 'loading') return; pb.status = 'loading';
  Promise.all([SF.sb.anon('public_portfolio?select=*&order=sort_order,id'), SF.sb.anon('public_batches?select=*&order=held_on')])
    .then(([rows, batches]) => Object.assign(pb, { status: 'ready', rows, batches, err: '' }))
    .catch(e => Object.assign(pb, { status: 'error', err: t('Could not load the portfolio. Check the internet connection and refresh.'), at: Date.now() }))
    .finally(() => { if (/^#\/p(ortfolio|startup)/.test(location.hash)) SF.render(); }); };
const loadOrg = () => { const o = O(); if (o.status === 'loading') return; o.status = 'loading'; const r = SF.sb.rest('org');
  Promise.all([r.get('startups?select=*,startup_batches(batch_id,result),team_members(id,name,role,is_owner,phone,telegram,email),owners(login,first_login_at,telegram_user_id),org_notes(notes)&order=sort_order,id' + (SF.S.filters.pftest ? '' : '&is_test=eq.false')), r.get('batches?select=*&order=held_on' + (SF.S.filters.pftest ? '' : '&id=neq.test')), r.get('org_staff?select=name&user_id=eq.' + ((SF.sb.session('org') || {}).user || 'none'))])
    .then(([rows, batches, me]) => { if (!me.length) throw new SF.sb.SbError(t('This account is not on the Startup Fest staff list.'), 403);
      rows.forEach(x => { x.batches = x.startup_batches; x.team_size = x.team_members.length; x.confirmed = !!x.confirmed_at; });
      Object.assign(o, { status: 'ready', rows, batches, me: me[0].name, err: '', at: Date.now() }); })
    .catch(e => { if (e.status === 401) { SF.sb.signOut('org'); o.status = 'idle'; } else { o.status = 'error'; o.err = e.message; } })
    .finally(() => { if (/^#\/p(ortfolio|startup)/.test(location.hash)) SF.render(); }); };
SF.pfLoadOrg = loadOrg;
// the data behind the page: staff get everything, everyone else the public list
const pdata = () => { if (staff()) { const o = O(); if (o.status === 'idle') loadOrg(); return o; } const pb = SF.pf.p = SF.pf.p || { status: 'idle' }; if (pb.status === 'idle' || (pb.status === 'error' && Date.now() - (pb.at || 0) > 5000)) loadPublic(); return pb; };
const skeleton = () => `${sh(t('Portfolio'))}<div class="kpis">${['startups', 'raised', 'with results', 'batches'].map(k => `<div class="kpi"><b class="num">…</b><span>${t(k)}</span></div>`).join('')}</div>
  <p class="muted" role="status">${t('Loading…')}</p><div class="grid g3 pf-grid">${'<div class="card pad pf-card pf-skel" aria-hidden="true"><b class="pf-name">&nbsp;</b><span class="small">&nbsp;</span><span class="small">&nbsp;</span></div>'.repeat(6)}</div>`;
const gate = d => d.status === 'ready' ? '' : d.status === 'error' ? `<div class="card pad"><div class="alert" role="alert">${esc(d.err)}</div>${staff() ? `<button class="btn ghost" data-act="pfout" data-slot="org">${t('Sign out')}</button>` : ''}</div>` : skeleton();
const owner = s => (s.team_members || []).find(m => m.is_owner) || (s.team_members || [])[0] || {};
const state = s => s.confirmed_at ? 'confirmed' : s.owners && s.owners.first_login_at ? 'started' : 'waiting';
const STATE_L = { confirmed: 'Confirmed', started: 'Signed in', waiting: 'Waiting' };
SF.pfFiltered = () => { const d = staff() ? O() : SF.pf.p, f = SF.S.filters, q = (f.pfq || '').toLowerCase();
  return (d.rows || []).filter(s => (!f.pfb || f.pfb === 'all' || s.batches.some(b => b.batch_id === f.pfb))
    && (!f.pfsec || f.pfsec === 'all' || (f.pfsec === 'none' ? !s.sector : s.sector === f.pfsec))
    && (!f.pfst || f.pfst === 'all' || (f.pfst === 'none' ? !s.stage : s.stage === f.pfst))
    && (!f.pfres || f.pfres === 'all' || !!s.achievement)
    && (!staff() || !f.pfs || f.pfs === 'all' || state(s) === f.pfs)
    && (!q || (s.name + ' ' + s.one_liner + ' ' + (s.team_members || []).map(m => m.name).join(' ')).toLowerCase().includes(q))); };
const sel = (id, k, label, opts) => `<label class="pf-sel"><span>${t(label)}</span><select id="${id}" class="input" data-filter="${k}">${opts.map(([v, l]) => `<option value="${esc(v)}" ${(SF.S.filters[k] || 'all') === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>`;

V.portfolio = p => {
  if (p === 'staff' && !staff()) return loginCard('org', t('PORTFOLIO'), t('Staff sign-in: contacts, check-in status and history.'));
  const d = pdata(), g = gate(d); if (g) return g;
  const list = SF.pfFiltered(), all = d.rows, wins = all.filter(s => s.achievement).length;
  const sectors = SF.PF_SECTORS.filter(x => all.some(s => s.sector === x)), stages = SF.PF_STAGES.filter(x => all.some(s => s.stage === x));
  const filters = `<div class="pf-filters">
    ${sel('pf-b', 'pfb', 'Batch', [['all', t('All')], ...d.batches.map(b => [b.id, `${shortBatch(b)} · ${date(b.held_on)}`])])}
    ${sel('pf-sec', 'pfsec', 'Sector', [['all', t('All')], ...sectors.map(x => [x, t(x)]), ...(all.some(s => !s.sector) ? [['none', t('Not specified')]] : [])])}
    ${sel('pf-st', 'pfst', 'Stage', [['all', t('All')], ...stages.map(x => [x, t(x)]), ...(all.some(s => !s.stage) ? [['none', t('Not specified')]] : [])])}
    ${sel('pf-res', 'pfres', 'Results', [['all', t('All')], ['yes', t('With results')]])}
    ${staff() ? sel('pf-s', 'pfs', 'Check-in', [['all', t('All')], ...Object.entries(STATE_L).map(([k, l]) => [k, t(l)])]) : ''}
    <label class="pf-sel grow"><span>${t('Search')}</span><input id="pf-q" class="input" data-filter="pfq" placeholder="${t(staff() ? 'Startup or person' : 'Startup')}" value="${esc(SF.S.filters.pfq || '')}"></label></div>`;
  const right = staff() ? `<div class="row" style="gap:8px"><span class="muted small">${esc(d.me)}</span><button class="btn ghost sm" data-act="pfreload">${t('Refresh')}</button><button class="btn ghost sm" data-act="pfcsv">CSV</button><button class="btn ghost sm" data-act="pfout" data-slot="org">${t('Sign out')}</button></div>`
    : `<a class="linkbtn small" href="#/portfolio/staff">${t('Staff sign-in')}</a>`;
  const n = k => all.filter(s => state(s) === k).length;
  return `${sh(t('Portfolio'), right)}
  <div class="kpis"><div class="kpi red"><b class="num">${all.length}</b><span>${t('startups')}</span></div><div class="kpi black"><b class="num">${k$(SF.pfRaised(all))}</b><span>${t('raised')}</span></div>
    <div class="kpi"><b class="num">${wins}</b><span>${t('with results')}</span></div>${staff() ? `<div class="kpi"><b class="num">${n('confirmed')}/${all.length}</b><span>${t('confirmed')}</span></div>` : `<div class="kpi"><b class="num">${d.batches.length}</b><span>${t('batches')}</span></div>`}</div>
  ${filters}
  <div class="grid g3 pf-grid">${list.map(s => { const st = state(s);
    return `<a class="card pad stack pf-card" href="#/pstartup/${s.id}">
      <div class="row between" style="gap:8px;flex-wrap:nowrap"><b class="pf-name">${esc(s.name)}</b>${staff() ? `<span class="chip ${st === 'confirmed' ? 'ok' : st === 'started' ? '' : 'warn'}">${t(STATE_L[st])}</span>` : s.confirmed ? `<span class="chip ok" title="${t('Confirmed by the founder')}">✓</span>` : ''}</div>
      ${s.achievement ? `<b class="small pf-win">🏆 ${esc(SF.pfAch(s.achievement))}</b>` : ''}
      ${s.one_liner ? `<span class="muted small pf-one">${esc(s.one_liner)}</span>` : ''}
      <div class="row pf-tags">${s.sector ? `<span class="chip">${t(s.sector)}</span>` : ''}${s.stage ? `<span class="chip">${t(s.stage)}</span>` : ''}${s.batches.map(b => `<span class="chip ghost">${esc(shortBatch(d.batches.find(x => x.id === b.batch_id) || b))}</span>`).join('')}</div></a>`; }).join('') || `<div class="empty">${t('Nothing found.')}</div>`}</div>`; };

const HIST = { name: 'Startup name', one_liner: 'One-liner', sector: 'Sector', region: 'Region', link: 'Link', stage: 'Stage', status: 'Status', since_catalyst: 'Since Catalyst', can_recommend: 'Can be recommended',
  'team: added': 'Team member added', 'team: removed': 'Team member removed', 'team: changed': 'Team member changed', confirmed: 'Confirmed the details' };
const histVal = (what, v) => { if (v == null || v === '') return '';
  if (what === 'since_catalyst') { try { return JSON.parse(v).map(k => t((SF.PF_SINCE.find(x => x[0] === k) || [, k])[1])).join(', ') || '–'; } catch (e) { return v; } }
  if (what === 'can_recommend') return t(v === 'true' ? 'Yes' : 'No');
  if (what === 'status') return t((SF.PF_STATUS.find(x => x[0] === v) || [, v])[1]);
  if (what === 'stage' || what === 'sector' || what === 'region') return t(v);
  return String(v).slice(0, 140); };
const histItem = c => { const how = { web: t('website'), bot: t('Telegram bot') }[c.via] || t('import');
  const nv = c.what === 'confirmed' ? '' : histVal(c.what, c.new_value), ov = c.what === 'confirmed' || c.what.startsWith('team') ? '' : histVal(c.what, c.old_value);
  return `<li class="small"><span class="muted">${date(c.at)} · ${esc(how)}</span><br><b>${esc(t(HIST[c.what] || c.what))}</b>${c.what === 'team: removed' ? ': ' + esc(c.old_value) : nv ? ': ' + esc(nv) : ''}${ov ? ` <span class="muted">(${t('was')}: ${esc(ov)})</span>` : ''}</li>`; };
const linkOf = s => s.link ? `<a href="${esc(/^https?:/.test(s.link) ? s.link : 'https://' + s.link)}" target="_blank" rel="noopener">${esc(s.link.replace(/^https?:\/\//, '').slice(0, 48))}</a>` : '–';
V.pstartup = id => { const d = pdata(), g = gate(d); if (g) return g; const s = d.rows.find(x => x.id === id);
  if (!s) return `<div class="card pad"><p>${t('Startup not found.')}</p><a class="btn ghost" href="#/portfolio">${t('Back to the portfolio')}</a></div>`;
  const facts = [['Sector', t(s.sector || 'Not specified')], ['Stage', t(s.stage || 'Not specified')], ['Region', t(s.region || '–')], ['Team', t('{n} people', { n: s.team_size })], ['Link', linkOf(s)]];
  const batches = `<ul class="pf-batches">${s.batches.map(b => { const x = d.batches.find(y => y.id === b.batch_id) || b, r = staff() ? result(b.result) : (b.result ? SF.pfAch(b.result) : '');
    return `<li><b>${esc(shortBatch(x))}</b> <span class="muted">· ${date(x.held_on)}</span>${r ? `<br><span class="small">${esc(r)}</span>` : ''}</li>`; }).join('')}</ul>`;
  const head = `<a class="linkbtn" href="#/portfolio">← ${t('Portfolio')}</a>
  ${sh(esc(s.name), s.confirmed ? `<span class="chip ok">✓ ${t('Confirmed by the founder')}</span>` : '')}`;
  const about = `<div class="card pad stack">
    ${s.achievement ? `<div class="alert ok" role="note">🏆 ${esc(SF.pfAch(s.achievement))}</div>` : ''}
    ${s.one_liner ? `<p style="margin:0">${esc(s.one_liner)}</p>` : ''}
    <dl class="pf-sum">${facts.map(([k, v]) => `<div><dt>${t(k)}</dt><dd>${k === 'Link' ? v : esc(v)}</dd></div>`).join('')}</dl>
    <h3 style="margin:4px 0 0">${t('Batches')}</h3>${batches}</div>`;
  if (!staff()) return `${head}<div style="max-width:760px">${about}</div>`;
  const h = SF.pf.hist[id]; if (!h) { SF.pf.hist[id] = 'loading'; SF.sb.rest('org').get(`change_log?startup_id=eq.${id}&order=at.desc&limit=50`).then(r => { SF.pf.hist[id] = r; }).catch(() => { SF.pf.hist[id] = []; }).finally(() => SF.render()); }
  const ow = s.owners || {}, st = state(s);
  return `<a class="linkbtn" href="#/portfolio">← ${t('Portfolio')}</a>
  ${sh(esc(s.name), `<span class="chip ${st === 'confirmed' ? 'ok' : st === 'started' ? '' : 'warn'}">${t(STATE_L[st])}</span>`)}
  <div class="grid g2"><div class="stack">${about}
    <div class="card pad stack"><dl class="pf-sum">${[['Status', t((SF.PF_STATUS.find(x => x[0] === s.status) || [, '–'])[1])], ['Since Catalyst', s.since_catalyst.map(k => t((SF.PF_SINCE.find(x => x[0] === k) || [, k])[1])).join(', ') || '–'], ['Can be recommended', s.can_recommend === null ? '–' : t(s.can_recommend ? 'Yes' : 'No')]].map(([k, v]) => `<div><dt>${t(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    ${s.org_notes && s.org_notes.notes ? `<p class="muted small" style="margin:0;white-space:pre-line">${esc(s.org_notes.notes)}</p>` : ''}</div>
  </div><div class="stack">
    <div class="card pad stack"><h3 style="margin:0">${t('Team')}</h3>
      <div class="tablewrap"><table><thead><tr><th>${t('Name')}</th><th>${t('Role')}</th><th>${t('Phone')}</th><th>Telegram</th></tr></thead><tbody>
      ${s.team_members.map(m => `<tr><td><b>${esc(m.name)}</b>${m.is_owner ? ` <span class="chip ok">${t('login')}</span>` : ''}</td><td>${esc(m.role || '–')}</td><td class="mono">${esc(m.phone || '–')}</td><td class="mono">${esc(m.telegram || '–')}</td></tr>`).join('')}</tbody></table></div>
      <p class="muted small" style="margin:0">${t('Login')}: <span class="mono">${esc(ow.login || '–')}</span> · ${ow.first_login_at ? t('first signed in {d}', { d: date(ow.first_login_at) }) : t('has not signed in yet')}${ow.telegram_user_id ? ' · ' + t('linked to Telegram') : ''}</p></div>
    <div class="card pad stack"><h3 style="margin:0">${t('History')}</h3>
      ${h === 'loading' || !h ? `<p class="muted">${t('Loading…')}</p>` : h.length ? `<ul class="stack pf-hist" style="list-style:none;padding:0;margin:0;gap:6px">${(SF.S.filters.pfall === id ? h : h.slice(0, 12)).map(histItem).join('')}</ul>${h.length > 12 && SF.S.filters.pfall !== id ? `<button class="linkbtn" data-act="filter" data-k="pfall" data-v="${id}">${t('Show all {n} changes', { n: h.length })}</button>` : ''}` : `<p class="muted">${t('No changes yet.')}</p>`}</div>
  </div></div>`; };

/* ---------- a door to the founder page from the demo's sign-in screen ---------- */
const login0 = V.login;
V.login = p => login0(p).replace('</aside>', `<a class="card pad pf-door" href="#/founder" style="display:block;margin-top:18px;background:#ffffff1f;color:#fff;border:1px solid #ffffff55"><b>${t('Took part in a Catalyst?')}</b><br><span class="small">${t('Sign in with your startup login to update your startup →')}</span></a></aside>`);
})();
