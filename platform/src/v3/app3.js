// v3 actions: season, councils, consent, shortlist status, gig lifecycle, CSV export, language
(() => {
const t = (s, v) => SF.t(s, v), esc = SF.esc, A = SF.A, S = () => SF.S;
SF.NAV.participant.splice(3, 0, 'season');
SF.NAV.org.splice(1, 0, 'season');

// value to members now includes money paid to members through Startup Earn
const m0 = SF.metrics;
SF.metrics = () => { const m = m0(); m.valueUZS += Object.values(S().gigState).filter(g => g.st === 3).reduce((a, g) => a + (g.uzs || 0), 0); return m; };

const csv = (name, rows) => {
  const body = rows.map(r => r.map(c => { const v = String(c ?? ''); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(',')).join('\n');
  const blob = new Blob(['﻿' + body], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  SF.toast(t('Saved {f}', { f: name }));
};
const payModal = g => SF.modal(`<h3>${t('Confirm and pay')}</h3><p style="margin:0"><b>${t(g.title)}</b> · ${t('Assigned to {n}', { n: esc(S().gigState[g.id].who) })}</p>
  <form id="pay-form" data-g="${g.id}" class="stack"><div class="field"><label for="pay-v">${t('Amount (UZS)')}</label><input id="pay-v" inputmode="numeric" value="${SF.payUZS(g.pay) || ''}" required></div>
  <div class="field"><label for="pay-r">${t('Rating')}</label><select id="pay-r">${[5, 4, 3, 2, 1].map(n => `<option value="${n}">${'★'.repeat(n)}</option>`).join('')}</select></div>
  <p class="muted small" style="margin:0">${t('In the demo nothing is charged. In v9 this step uses Click or Payme.')}</p>
  <div class="row end"><button type="button" class="btn ghost" data-close="1">${t('Cancel')}</button><button class="btn">${t('Mark as paid')}</button></div></form>`);

Object.assign(A, {
  finalist: d => { S().finalists[d.key] = d.team; const [r] = d.key.split('|');
    if (SF.me('participant').fields.team === d.team) SF.notify('participant', t('{n} is invited to the National Final!', { n: d.team }), '#/season');
    SF.toast(t('{n} goes to the National Final from {r}', { n: d.team, r: t(r) })); SF.render(); },
  seatreq: d => { SF.notify('org', t('{w} applied for a seat on the {r} council', { w: SF.me().name, r: t(d.r) }), '#/council/' + encodeURIComponent(d.r)); SF.toast(t('Seat application sent to the council')); },
  pvote: d => { const p = S().problems[d.r].find(x => x.id === d.id); p.v++; SF.render(); },
  tobrief: d => { const p = S().problems[d.r].find(x => x.id === d.id); p.brief = true; SF.notify('company', t('New local problem from {r}: {p}', { r: t(d.r), p: t(p.t) }), '#/catalyst'); SF.toast(t('Sent to Catalyst. Guild companies are notified.')); SF.render(); },
  consent: (d, el) => { S().consent[d.n] = el.checked; SF.toast(el.checked ? t('{n} can now be recommended to partners', { n: d.n }) : t('{n} will not be shared with partners', { n: d.n })); SF.render(); },
  reqnext: d => { const r = S().requests.find(x => x.id === d.id); r.status = r.status === 'Requested' ? 'Curating' : 'Sent';
    const who = Object.keys(S().people).find(k => S().people[k].name === r.by); if (who) SF.notify(who, t('Your shortlist is {s}', { s: t(r.status).toLowerCase() }), '#/directory'); SF.render(); },
  gigtake: d => { S().gigState[d.g] = { st: 1, who: SF.me().name }; SF.award(S().role, 'gig', t('Took a gig: {g}', { g: t(S().gigs.find(x => x.id === d.g).title) }));
    SF.notify('company', t('{n} took your gig', { n: SF.me().name }), '#/earn'); SF.toast(t('The gig is yours. Mark it delivered when done.')); SF.render(); },
  gigdeliver: d => { S().gigState[d.g].st = 2; SF.notify('company', t('A gig was delivered. Confirm and pay.'), '#/earn'); SF.toast(t('Marked as delivered')); SF.render(); },
  gigpay: d => payModal(S().gigs.find(x => x.id === d.g)),
  csv: d => {
    if (d.k === 'regions') csv('startupfest-regions.csv', [['Region', 'Council', 'Members', 'Events this month'], ...SF.COUNCILS.map(c => [c.r, c.st, c.m, c.ev])]);
    if (d.k === 'pipeline') csv('startupfest-catalyst-pipeline.csv', [['Startup', 'Company', 'Guild', 'Stage', 'Status', 'Pilot day', 'Contract value (UZS)'],
      ...S().pipeline.map(p => { const b = SF.BRIEFS.find(x => x.id === p.brief); return [p.startup, b.co, b.guild, SF.STAGES[p.stage], p.status, p.day, p.value || ''] })]);
    if (d.k === 'season') csv('startupfest-season-2027.csv', [['Team', 'Region', 'Track', 'Points', 'Finalist'], ...SF.TEAMS.map(x => [x.n, x.r, x.tr, S().teamPts[x.n], S().finalists[x.r + '|' + x.tr] === x.n ? 'yes' : ''])]);
  },
});
// consent switch is a checkbox: route it through change
document.addEventListener('change', e => { if (e.target.dataset.act === 'consent') A.consent(e.target.dataset, e.target); }, true);

SF.formHandlers = (f, val) => {
  if (f.id === 'seat-form') { const r = f.dataset.r, ty = val('s-type'), list = S().seats[r] = S().seats[r] || [];
    if (list.filter(s => s[1] === ty).length >= 2) return SF.toast(t('{s} already has 2 seats. Pick another sector.', { s: t(ty) }));
    list.push([val('s-name'), ty, val('s-org') || '–']); SF.toast(t('Seat added')); return SF.render(); }
  if (f.id === 'problem-form') { const r = f.dataset.r, v = val('pb-t'); if (!v) return; (S().problems[r] = S().problems[r] || []).unshift({ id: r + Date.now(), t: v, by: t(SF.ROLES[S().role].label), v: 1, brief: false });
    SF.toast(t('Problem added to the {r} bank', { r: t(r) })); return SF.render(); }
  if (f.id === 'pay-form') { const g = f.dataset.g, st = S().gigState[g], v = parseInt(val('pay-v').replace(/\D/g, ''), 10) || 0;
    Object.assign(st, { st: 3, uzs: v, rating: +val('pay-r') });
    const who = Object.keys(S().people).find(k => S().people[k].name === st.who);
    if (who) { SF.award(who, 'gig', t('Got paid for a gig')); SF.notify(who, t('You were paid {v} for “{g}”', { v: SF.uzs(v), g: t(S().gigs.find(x => x.id === g).title) }), '#/me'); }
    SF.closeModal(); SF.toast(t('Paid. Counted as value to members.')); return SF.render(); }
};

// translate the fixed page chrome
const chrome0 = SF.renderChrome;
SF.renderChrome = () => { chrome0(); document.title = t('Startup Fest Platform'); document.querySelector('.tabs').setAttribute('aria-label', t('Sections')); };
SF.boot();
})();
