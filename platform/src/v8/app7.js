// v7 actions: investor verification, deal rooms, founder fundraising, VC Battle, intros and investments
(() => {
const t = (s, v) => SF.t(s, v), esc = SF.esc, A = SF.A, S = () => SF.S;
SF.NAV.investor = ['home', 'deals', 'battle', 'directory', 'events', 'messages', 'community', 'me'];
Object.assign(SF.LABEL, { deals: 'Deal flow', battle: 'VC Battle', raise: 'Fundraising', verify: 'Verification', deal: 'Deal room' });
Object.assign(SF.TAB_OF, { deals: 'admin', deal: 'deals', verify: 'deals', raise: 'me', battle: 'events' });

// investments count toward "value to members"
const m6 = SF.metrics;
SF.metrics = () => { const m = m6(); return { ...m, valueUZS: m.valueUZS + SF.capital() * SF.FX, invested: SF.capital() }; };

const download = (name, text) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); };
const founderOf = n => n === SF.myTeam() ? 'participant' : null;
const invModal = (n = '', amt = '', intro = '') => SF.modal(`<h3>${t('Log an investment')}</h3><p class="muted" style="margin:0">${t('Logged investments count toward “value to members” on the Startup Fest dashboard.')}</p>
  <form id="inv-form" class="stack" data-intro="${intro}"><div class="field"><label for="iv-s">${t('Startup')}</label><select id="iv-s">${[...new Set([...SF.rounds().map(r => r.n), ...SF.STARTUPS.map(s => s.n)])].map(x => `<option ${x === n ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></div>
  <div class="two"><div class="field"><label for="iv-a">${t('Amount (USD)')}</label><input id="iv-a" inputmode="numeric" required value="${amt}"></div><div class="field"><label for="iv-i">${t('Instrument')}</label><select id="iv-i">${SF.INSTRUMENTS.map(x => `<option value="${x}">${t(x)}</option>`).join('')}</select></div></div>
  <div class="field"><label for="iv-v">${t('How did you meet them?')}</label><select id="iv-v">${['Deal room', 'Catalyst', 'VC Battle', 'Startup Night', 'Intro from Startup Fest'].map(x => `<option value="${x}">${t(x)}</option>`).join('')}</select></div>
  <div class="row end"><button type="button" class="btn ghost" data-close="1">${t('Cancel')}</button><button class="btn">${t('Log investment')}</button></div></form>`);
const rnd = n => Math.floor(Math.random() * n);

const intro6 = A.intro;
Object.assign(A, {
  intro: d => { if (['investor', 'scout', 'company'].includes(S().role)) S().intros.unshift({ id: 'in' + Date.now(), by: SF.who(), startup: d.n, status: 'Requested', date: 'Oct 2026' }); intro6(d); },
  watch: d => { const w = S().watch[SF.who()] = S().watch[SF.who()] || []; S().watch[SF.who()] = w.includes(d.n) ? w.filter(x => x !== d.n) : [...w, d.n]; SF.render(); },
  dealreq: d => { SF.dealOf(d.n).access[SF.who()] = 'requested'; if (founderOf(d.n)) SF.notify('participant', t('{w} asked to open your data room', { w: SF.who() }), '#/raise');
    SF.toast(t('Request sent. The founder decides.')); SF.render(); },
  dealgrant: d => { SF.dealOf(SF.myTeam()).access[d.w] = 'granted'; SF.notify('investor', t('{s} opened its data room for you. Sign the NDA to see it.', { s: SF.myTeam() }), '#/deal/' + encodeURIComponent(SF.myTeam())); SF.toast(t('Access granted')); SF.render(); },
  dealdeny: d => { SF.dealOf(SF.myTeam()).access[d.w] = 'denied'; SF.toast(t('Declined')); SF.render(); },
  dldoc: d => { download(`${SF.slug(d.n)}-${SF.slug(d.doc)}.txt`, SF.docTxt(d.n, d.doc)); SF.toast(t('Saved {f}', { f: d.doc })); },
  updoc: d => { const x = SF.dealOf(SF.myTeam()); if (!x.docs.includes(d.doc)) x.docs.push(d.doc); SF.toast(t('{d} is in the data room', { d: t(d.doc) })); SF.render(); },
  introstep: d => { const x = S().intros.find(y => y.id === d.id); x.status = d.s; SF.render(); },
  loginv: d => invModal(d.n, d.amt || '', d.intro || ''),
  vipok: d => { const v = S().vip[d.n]; Object.assign(v, { status: 'Verified', since: 'Oct 2026', renews: 'Oct 2027', checks: ['id', 'track', 'funds', 'code'] }); SF.notify('investor', t('{n} is now a verified investor', { n: d.n }), '#/verify'); SF.toast(t('Verified')); SF.render(); },
  vipno: d => { S().vip[d.n].status = 'Declined'; SF.toast(t('Declined')); SF.render(); },
  // VC Battle
  bvote: d => { const B = S().battle, i = B.round; if (B.voted[i]) return; const v = B.votes[i] = B.votes[i] || {}; v[d.n] = (v[d.n] || 0) + 1; B.voted[i] = d.n; SF.award(S().role, 'upvote', t('Voted at VC Battle')); SF.toast(t('Vote counted')); SF.render(); },
  bopen: () => { S().battle.open = true; Object.keys(SF.ROLES).filter(r => r !== 'org').forEach(r => SF.notify(r, t('VC Battle: voting is open for {r}', { r: t(SF.bRound()[0]) }), '#/battle')); SF.render(); },
  bclose: () => { S().battle.open = false; SF.render(); },
  bsim: () => { const B = S().battle, i = B.round, names = SF.bStartups(i), v = B.votes[i] = B.votes[i] || {}, p = B.picks[i] = B.picks[i] || {};
    names.forEach(n => { v[n] = (v[n] || 0) + 20 + rnd(60); });
    SF.BATTLE.teams.forEach(tm => { if (p[tm.n] && tm.members.includes('Dilnoza Karimova')) return; const left = 250000; const a = rnd(left); p[tm.n] = Object.fromEntries(names.map((n, j) => [n, j === 0 ? a : Math.round((left - a) / (names.length - 1))])); });
    SF.toast(t('The hall voted')); SF.render(); },
  bnext: () => { const B = S().battle; if (B.round < 3) { B.round++; B.open = false; } SF.render(); },
  bfinish: () => { const B = S().battle, names = SF.bStartups(3); B.winner = names.slice().sort((a, b) => SF.bScore(3, b) - SF.bScore(3, a))[0]; B.done = true; B.open = false;
    Object.keys(SF.ROLES).forEach(r => SF.notify(r, t('{w} won VC Battle', { w: B.winner }), '#/battle')); if (B.winner === SF.myTeam()) SF.award('participant', 'contract', t('Won VC Battle'));
    SF.toast(t('{w} won VC Battle', { w: B.winner })); SF.render(); },
});
document.addEventListener('change', e => { const el = e.target; if (el.dataset && el.dataset.act === 'readyitem') { const r = S().ready[SF.myTeam()] = S().ready[SF.myTeam()] || [];
  S().ready[SF.myTeam()] = el.checked ? [...new Set([...r, el.dataset.k])] : r.filter(x => x !== el.dataset.k); SF.render(); } });

const fh6 = SF.formHandlers;
SF.formHandlers = (f, val) => {
  const num = id => parseInt(val(id).replace(/\D/g, ''), 10) || 0;
  if (f.id === 'vip-form') { if (!f.querySelector('#vp-funds').checked || !f.querySelector('#vp-code').checked) return SF.toast(t('Please confirm both statements'));
    if (val('vp-id').length < 6) return SF.toast(t('Enter your passport or ID card number'));
    S().vip[SF.who()] = { status: 'Submitted', kind: val('vp-kind'), deals: val('vp-deals'), note: val('vp-note'), idLast4: val('vp-id').slice(-4), checks: ['funds', 'code'] };
    SF.notify('org', t('{n} applied for investor verification', { n: SF.who() }), '#/deals'); SF.toast(t('Application sent')); return SF.render(); }
  if (f.id === 'nda-form') { if (!f.querySelector('#nda-ok').checked) return SF.toast(t('Please accept the NDA')); const d = SF.dealOf(f.dataset.n); d.nda.push(SF.who());
    if (founderOf(f.dataset.n)) SF.notify('participant', t('{w} signed the NDA and opened your data room', { w: SF.who() }), '#/raise'); SF.toast(t('NDA signed')); return SF.render(); }
  if (f.id === 'qa-form') { const n = f.dataset.n; SF.dealOf(n).qa.push({ id: 'q' + Date.now(), by: SF.who(), q: val('qa-q'), a: '' });
    if (founderOf(n)) SF.notify('participant', t('{w} asked: {q}', { w: SF.who(), q: val('qa-q').slice(0, 60) }), '#/raise'); SF.toast(t('Question sent')); return SF.render(); }
  if (f.id === 'commit-form') { const n = f.dataset.n, a = num('cm-a'); if (!a) return SF.toast(t('Enter an amount'));
    SF.dealOf(n).commits.push({ by: SF.who(), amt: a }); if (founderOf(n)) SF.notify('participant', t('{w} committed {a} to your round', { w: SF.who(), a: SF.usd(a) }), '#/raise');
    SF.toast(t('Committed {a}', { a: SF.usd(a) })); return SF.render(); }
  if (f.id === 'inv-form') { const a = num('iv-a'); if (!a) return SF.toast(t('Enter an amount'));
    S().investments.unshift({ id: 'iv' + Date.now(), by: SF.who(), startup: val('iv-s'), amt: a, instr: val('iv-i'), date: 'Oct 2026', via: val('iv-v') });
    const x = S().intros.find(y => y.id === f.dataset.intro) || S().intros.find(y => y.by === SF.who() && y.startup === val('iv-s')); if (x) x.status = 'Invested';
    SF.award(S().role, 'contract', t('Invested in {s}', { s: val('iv-s') })); SF.notify('org', t('{w} invested {a} in {s}', { w: SF.who(), a: SF.usd(a), s: val('iv-s') }), '#/deals');
    if (founderOf(val('iv-s'))) { SF.notify('participant', t('{w} invested {a}', { w: SF.who(), a: SF.usd(a) }), '#/raise'); }
    SF.closeModal(); SF.toast(t('Investment logged')); return SF.render(); }
  if (f.id === 'round-form') { (S().roundsNew = S().roundsNew || []).push({ n: SF.myTeam() || SF.me().name, owner: 'participant', round: val('rd-r'), ask: num('rd-a'), terms: val('rd-t'), close: val('rd-c'), metric: val('rd-m'), founder: SF.myName() });
    SF.notify('investor', t('{s} opened a {r} round', { s: SF.myTeam(), r: t(val('rd-r')) }), '#/deals'); SF.toast(t('Your round is open')); return SF.render(); }
  if (f.id.startsWith('ans-form-')) { const q = SF.dealOf(SF.myTeam()).qa.find(x => x.id === f.dataset.q); q.a = f.querySelector('input').value.trim(); SF.notify('investor', t('{s} answered your question', { s: SF.myTeam() }), '#/deal/' + encodeURIComponent(SF.myTeam())); SF.toast(t('Answer sent')); return SF.render(); }
  if (f.id === 'bpick-form') { const B = S().battle, i = B.round, team = SF.myBTeam(), picks = {}; f.querySelectorAll('input[data-n]').forEach(el => picks[el.dataset.n] = parseInt(el.value.replace(/\D/g, ''), 10) || 0);
    const other = Object.entries(B.picks).filter(([j]) => +j !== i).reduce((a, [, p]) => a + Object.values(p[team.n] || {}).reduce((b, x) => b + x, 0), 0), sum = Object.values(picks).reduce((a, x) => a + x, 0);
    if (other + sum > SF.BATTLE.budget) return SF.toast(t('That is more than your team’s budget'));
    (B.picks[i] = B.picks[i] || {})[team.n] = picks; SF.toast(t('Picks saved')); return SF.render(); }
  return fh6 && fh6(f, val);
};
})();
