// v4 actions: site-style sign-up, plans and mock checkout, invoices, shortlist fees, language buttons, mobile menu
(() => {
const t = (s, v) => SF.t(s, v), esc = SF.esc, A = SF.A, S = () => SF.S;
const plan = id => SF.ALL_PLANS.find(p => p.id === id);
SF.NAV.company.splice(2, 0, 'partner');
Object.assign(SF.TAB_OF, { guild: 'community', plans: null });

/* ---------- sign-up, matching the website's priority-list form ---------- */
const opt = (list, sel) => list.map(o => `<option value="${esc(o)}" ${o === sel ? 'selected' : ''}>${t(o)}</option>`).join('');
const roleFields = r => (SF.ROLE_FIELDS[r] || []).map(f => f.type === 'select'
  ? `<div class="field"><label for="jf-${f.k}">${t(f.label)}</label><select id="jf-${f.k}">${opt(f.options)}</select></div>`
  : `<div class="field"><label for="jf-${f.k}">${t(f.label)}</label><input id="jf-${f.k}" placeholder="${t(f.ph || '')}"></div>`).join('')
  + (r === 'participant' ? `<div class="two"><div class="field"><label for="jx-track">${t('Chosen track')}</label><select id="jx-track">${opt(SF.TRACK_OPTIONS)}</select></div>
    <div class="field"><label for="jx-level">${t('Experience level')}</label><select id="jx-level">${opt(SF.LEVEL_OPTIONS)}</select></div></div>
    <div class="field"><label for="jx-why">${t('Why do you want to take part?')}</label><textarea id="jx-why" minlength="20"></textarea><span class="hint">${t('200–500 characters')}</span></div>
    <div class="field"><label for="jx-prob">${t('Which problem do you want to solve?')}</label><textarea id="jx-prob"></textarea></div>
    <div class="field"><label for="jx-skills">${t('Skills and previous projects')}</label><textarea id="jx-skills"></textarea></div>` : '');
A.join = () => { const r = S().role === 'org' ? 'participant' : S().role;
  SF.modal(`<h3>${t('Join the priority list')}</h3><p class="muted" style="margin:0">${t('One Startup Fest ID for every event, application and gig.')}</p>
  <form id="join4-form" class="stack">
    <div class="field"><label for="j-prog">${t('Programme')}</label><select id="j-prog">${opt(SF.PROGRAMS)}</select></div>
    <div class="field"><label for="j-role">${t('Your role')}</label><select id="j-role">${Object.keys(SF.ROLE_FIELDS).map(k => `<option value="${k}" ${k === r ? 'selected' : ''}>${t(SF.ROLES[k].label)}</option>`).join('')}</select></div>
    <div class="field"><span>${t('First and last name')}</span><div class="two"><label class="sr" for="j-first">${t('First name')}</label><input id="j-first" class="input" required placeholder="${t('First name')}"><label class="sr" for="j-last">${t('Last name')}</label><input id="j-last" class="input" placeholder="${t('Last name')}"></div></div>
    <div class="field"><label for="j-reg">${t('Region')}</label><select id="j-reg" style="background-image:url(assets/img/icon-location-pin.svg),url(assets/img/icon-chevron-down.svg);background-position:12px center,right 12px center;background-size:14px,12px;background-repeat:no-repeat;padding-left:34px">${SF.REGIONS.map(x => `<option value="${x}">${t(x)}</option>`).join('')}</select></div>
    <div class="field"><label for="j-tg">${t('Telegram username')}</label><input id="j-tg" placeholder="@username"></div>
    <div class="two"><div class="field"><label for="j-mail">${t('Email')}</label><input id="j-mail" type="email" placeholder="name@mail.uz"></div>
      <div class="field"><label for="j-phone">${t('Phone number')}</label><input id="j-phone" inputmode="tel" value="+998 "></div></div>
    <div id="role-fields4" class="stack">${roleFields(r)}</div>
    <label class="row small" style="gap:8px"><input type="checkbox" id="j-ok" checked> ${t('Startup Fest may recommend my profile to partners')}</label>
    <div class="row end"><button type="button" class="btn ghost" data-close="1">${t('Cancel')}</button><button class="cta" type="submit"><span class="btn">${t('Send')}</span>${SF.ARROW}</button></div></form>`); };
document.addEventListener('change', e => { if (e.target.id === 'j-role' && document.getElementById('role-fields4')) document.getElementById('role-fields4').innerHTML = roleFields(e.target.value); }, true);

/* ---------- plans and checkout ---------- */
const checkout = (p, invId) => { const co = S().role === 'company' ? SF.myCompany() : '';
  SF.modal(`<h3>${t('Checkout')}</h3>
  <div class="card pad row between" style="background:#fafafa"><div><b style="font-size:18px">${t(p.name)}</b><div class="muted small">${p.perks.slice(0, 2).map(x => t(x)).join(' · ')}</div></div><b class="display" style="font-size:30px;color:var(--brand)">${SF.uzs(p.price)}</b></div>
  <form id="checkout-form" class="stack" data-plan="${p.id}" data-inv="${invId || ''}">
    <div class="field"><label for="ck-org">${t('Organisation')}</label><input id="ck-org" required value="${esc(co)}"></div>
    <div class="field"><label for="ck-inn">${t('Tax ID (INN)')}</label><input id="ck-inn" inputmode="numeric" maxlength="9" placeholder="302 456 789" required></div>
    ${p.id === 'member' ? `<div class="field"><label for="ck-guild">${t('Guild')}</label><select id="ck-guild">${opt(SF.GUILDS.filter(g => g.st === 'Active').map(g => g.n))}</select></div>` : ''}
    <fieldset class="stack" style="border:0;padding:0;margin:0"><legend class="small" style="font-weight:500;margin-bottom:6px">${t('Payment method')}</legend>
      ${SF.PAY_METHODS.map(([k, n], i) => `<label class="card pad row" style="padding:12px;cursor:pointer"><input type="radio" name="ck-m" value="${k}" ${i === 0 ? 'checked' : ''} style="accent-color:var(--accent)"> <b>${t(n)}</b></label>`).join('')}</fieldset>
    <p class="muted small" style="margin:0">${t('Demo: nothing is charged. In v9 this connects to Click and Payme.')}</p>
    <div class="row end"><button type="button" class="btn ghost" data-close="1">${t('Cancel')}</button><button class="cta" type="submit"><span class="btn">${t('Pay {v}', { v: SF.uzs(p.price) })}</span>${SF.ARROW}</button></div></form>`); };
let invN = 56;
const download = (name, text) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); };

Object.assign(A, {
  setlang: d => { S().lang = SF.lang = d.l; SF.render(); },
  burger: (d, el) => { const top = document.getElementById('top'), open = !top.classList.contains('open'); top.classList.toggle('open', open); el.setAttribute('aria-expanded', open); },
  choose: d => { const p = plan(d.plan); if (p.price === 0) { S().subs[SF.me().name] = { plan: p.id, since: 'Oct 2026', renews: '–' }; SF.toast(t('{p} is active', { p: t(p.name) })); return SF.render(); } checkout(p); },
  payinv: d => { const i = S().invoices.find(x => x.id === d.id); checkout(plan(i.plan), i.id); },
  markpaid: d => { const i = S().invoices.find(x => x.id === d.id); i.status = 'Paid'; SF.notify('company', t('Invoice {id} is paid. Thank you!', { id: i.id }), '#/partner'); SF.toast(t('Marked as paid')); SF.render(); },
  dlinv: d => { const i = S().invoices.find(x => x.id === d.id), p = plan(i.plan);
    download(i.id + '.txt', [`STARTUP FEST — ${t('Invoice')} ${i.id}`, '', `${t('To')}: ${i.to}`, `${t('Plan')}: ${t(p.name)}`, `${t('Amount')}: ${SF.uzs(i.amount)}`, `${t('Date')}: ${i.date}`, `${t('Payment method')}: ${t(i.method)}`, `${t('Status')}: ${t(i.status)}`, '', t('Demo invoice. No money was charged.')].join('\n'));
    SF.toast(t('Saved {f}', { f: i.id + '.txt' })); },
  shortlist: () => { const by = S().role === 'company' ? SF.myCompany() : SF.me().name, sub = S().subs[by], list = S().shortlist.filter(n => S().consent[n] !== false);
    S().requests.unshift({ id: 'r' + Date.now(), by, list, status: 'Requested' });
    if (!(sub && sub.plan === 'retainer')) S().invoices.unshift({ id: 'INV-2026-0' + (invN++), to: by, plan: 'shortlist', amount: 5e6, status: 'Due', method: 'Bank transfer (invoice)', date: '25 Oct 2026' });
    SF.notify('org', t('{w} asked for a shortlist: {l}', { w: by, l: list.join(', ') }), '#/directory'); S().shortlist = [];
    SF.toast(sub && sub.plan === 'retainer' ? t('Shortlist request sent. Included in your retainer.') : t('Shortlist request sent. An invoice for {p} was created.', { p: SF.uzs(5e6) })); SF.render(); },
});

const fh0 = SF.formHandlers;
SF.formHandlers = (f, val) => {
  if (f.id === 'join4-form') { const r = val('j-role'), fields = {}; (SF.ROLE_FIELDS[r] || []).forEach(x => fields[x.k] = val('jf-' + x.k));
    Object.assign(fields, { program: val('j-prog'), telegram: val('j-tg'), email: val('j-mail'), phone: val('j-phone') });
    if (r === 'participant') Object.assign(fields, { trackArea: val('jx-track'), level: val('jx-level'), why: val('jx-why'), problem: val('jx-prob'), skills: val('jx-skills') });
    const name = [val('j-first'), val('j-last')].filter(Boolean).join(' ') || t('New member');
    S().people[r] = { name, region: val('j-reg'), fields, id: 'SF-27-' + String(Math.floor(10000 + Math.random() * 89999)), points: 0, counts: { checkin: 0, apply: 0, gig: 0, intro: 0, contract: 0 }, log: [] };
    S().joined = (S().joined || 0) + 1; S().role = r; SF.award(r, 'join', t('Created a Startup Fest ID')); SF.notify(r, t('Welcome! Your ID is ready. Register for an event to earn points.'), '#/events');
    SF.closeModal(); SF.toast(t('Your ID is ready')); return SF.go('#/me'); }
  if (f.id === 'checkout-form') { const p = plan(f.dataset.plan), org = val('ck-org'), m = (f.querySelector('input[name=ck-m]:checked') || {}).value, mName = (SF.PAY_METHODS.find(x => x[0] === m) || [])[1];
    if (!/^\d{9}$/.test(val('ck-inn').replace(/\s/g, ''))) return SF.toast(t('The tax ID (INN) has 9 digits'));
    const status = m === 'invoice' ? 'Due' : 'Paid';
    if (f.dataset.inv) { const i = S().invoices.find(x => x.id === f.dataset.inv); Object.assign(i, { status: 'Paid', method: mName }); }
    else S().invoices.unshift({ id: 'INV-2026-0' + (invN++), to: org, plan: p.id, amount: p.price, status, method: mName, date: '25 Oct 2026' });
    if (!['host', 'shortlist'].includes(p.id)) S().subs[org] = { plan: p.id, guild: p.id === 'member' ? val('ck-guild') : (S().subs[org] || {}).guild, since: 'Oct 2026', renews: p.per === 'month' ? 'Nov 2026' : 'Oct 2027' };
    SF.notify('org', t('{o} chose {p}', { o: org, p: t(p.name) }), '#/admin');
    SF.closeModal(); SF.toast(status === 'Paid' || f.dataset.inv ? t('Paid. Your plan is active.') : t('Invoice created. Your plan starts when it is paid.')); return SF.render(); }
  return fh0 && fh0(f, val);
};

/* ---------- chrome: language buttons, sign-up label, footer ---------- */
const chrome0 = SF.renderChrome;
SF.renderChrome = () => { chrome0();
  document.querySelectorAll('#langs button').forEach(b => b.setAttribute('aria-pressed', b.dataset.l === SF.lang));
  document.getElementById('jointxt').textContent = t('Sign up');
  const tb = document.getElementById('tabs'); if (tb && !tb.querySelector('.mlangs')) tb.insertAdjacentHTML('beforeend', `<div class="mlangs">${['uz', 'ru', 'en'].map(l => `<button data-act="setlang" data-l="${l}" aria-pressed="${l === SF.lang}">${l.toUpperCase()}</button>`).join('')}</div>`);
  document.getElementById('foot-about').textContent = t('An ecosystem for young builders in all 14 regions of Uzbekistan.');
  document.getElementById('foot-contact').textContent = t('Contact');
  document.getElementById('foot-nav').innerHTML = `<h4>${t('Navigation')}</h4>` + SF.NAV[S().role].map(k => `<a href="#/${k}">${t(SF.LABEL[k])}</a>`).join('') + `<a href="#/plans">${t('Plans')}</a><a href="#/roadmap">${t('Roadmap')}</a>`;
};
window.addEventListener('hashchange', () => { const top = document.getElementById('top'); top.classList.remove('open'); });
SF.boot();
})();
