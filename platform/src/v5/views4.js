// v4 views: website-style home, guild pages, plans and checkout, partner dashboard, revenue
(() => {
const t = (s, v) => SF.t(s, v), esc = SF.esc, V = SF.V;
const role = () => SF.S.role;
const sh = (title, right = '') => `<div class="sec-h"><h2>${title}</h2>${right}</div>`;
const plan = id => SF.ALL_PLANS.find(p => p.id === id);
const price = p => p.price === 0 ? t('Free') : `${SF.uzs(p.price)} / ${t(p.per)}`;
const guildOf = slug => SF.GUILDS.find(g => SF.slug(g.n) === slug);
SF.myCompany = () => SF.me('company').name;

// extra icons for new tabs
const icon0 = SF.icon;
const EXTRA = { partner: '<path d="M3 12l4-4 5 3 5-5 4 4M4 20h16M7 20v-5M12 20v-7M17 20v-9"/>', plans: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>', content: '<path d="M4 5h16v11H8l-4 4zM8 9h8M8 12h5"/>' };
SF.icon = k => EXTRA[k] ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${EXTRA[k]}</svg>` : icon0(k);

/* ---------- Home: the website hero ---------- */
const home0 = V.home;
V.home = () => {
  const me = SF.me(), m = SF.metrics();
  const lead = { participant: 'Your next step: a Catalyst brief, a gig, or the National Final.', mentor: 'Founders near you need your hours this week.',
    investor: 'Curated deal flow from 14 regions.', company: 'Real problems in, signed pilots out.', org: 'Everything the community did this week.' }[role()];
  const hero = `<section class="hero"><div class="bg" aria-hidden="true"></div><div class="txt">
      <div class="hello">${SF.STAR(26)}<span>${t('Salom, {n}', { n: esc(me.name.split(' ')[0]) })}</span></div>
      <h1><span class="nw">STARTUPFEST—</span><br>${SF.lang === 'uz' ? `<span class="r">${t('BUILT FOR YOUR IDEA')}</span><br>${t('THE ECOSYSTEM')}` : `${t('THE ECOSYSTEM')}<br><span class="r">${t('BUILT FOR YOUR IDEA')}</span>`}</h1>
      <p style="margin:0;font-size:19px;font-weight:300;max-width:34ch">${t(lead)}</p>
      <div class="row"><a class="cta" href="#/me"><span class="btn">${t('My Startup Fest ID')}</span>${SF.ARROW}</a></div></div>
    <div class="hero-cta"><span class="lbl">${t('SIGN UP')}</span><a href="#/catalyst">CATALYST ${SF.ARROW}</a></div></section>
    <div class="kpis"><div class="kpi red"><b class="num">${SF.fmt(m.members)}</b><span>${t('members with an ID')}</span></div><div class="kpi black"><b class="num">14</b><span>${t('regions')}</span></div>
      <div class="kpi"><b class="num">${SF.BRIEFS.length}</b><span>${t('open Catalyst briefs')}</span></div><div class="kpi"><b class="num">$410K</b><span>${t('deals via Catalyst')}</span></div></div>`;
  const h = home0(); const a = h.indexOf('<section class="hero curtain">'), b = h.indexOf('</section>', a) + 10;
  return a >= 0 ? h.slice(0, a) + hero + h.slice(b) : hero + h;
};

/* ---------- Community: guild cards link to guild pages ---------- */
const comm0 = V.community;
V.community = () => { let h = comm0(); SF.GUILDS.forEach(g => { h = h.replace(`<b style="font-size:17px">${t(g.n)}</b>`, `<a href="#/guild/${SF.slug(g.n)}" class="link"><b style="font-size:17px">${t(g.n)}</b></a>`); }); return h; };

/* ---------- Guild page ---------- */
V.guild = slug => {
  const g = guildOf(slug); if (!g) return V.community();
  const S = SF.S, members = SF.GUILD_MEMBERS[g.n] || [], briefs = SF.BRIEFS.filter(b => b.guild === g.n);
  const pipe = S.pipeline.filter(p => briefs.some(b => b.id === p.brief)), contracts = pipe.filter(p => p.stage === 4);
  const mine = S.subs[SF.myCompany()], inGuild = mine && (mine.guild === g.n || mine.plan === 'national');
  const active = g.st === 'Active';
  return `${SF.back('#/community', t('Community'))}
  <section class="panel red" style="position:relative;overflow:hidden"><div style="position:absolute;right:-30px;top:-20px;opacity:.25">${SF.STAR(260, '#fff')}</div>
    <span class="chip" style="background:#fff;color:var(--brand)">${t(active ? 'Active guild' : 'After 5+ pilots')}</span>
    <h1 class="display" style="font-size:clamp(44px,6vw,80px);margin-top:12px">${t(g.n)}</h1>
    <p style="font-size:19px;font-weight:300;max-width:52ch;margin:.6em 0 0">${t('Companies in this guild post real problems, meet curated startups every quarter and run 100-day pilots.')}</p>
    <div class="kpis" style="margin-top:22px">${[[String(members.length), 'member companies'], [String(briefs.length), 'open briefs'], [String(pipe.filter(p => p.stage === 3).length), 'pilots running'], [SF.uzs(contracts.reduce((a, p) => a + p.value, 0)), 'contracts signed']]
      .map(([a, b]) => `<div class="kpi" style="background:#ffffff1f;border-color:#ffffff40"><b class="num" style="color:#fff">${a}</b><span style="color:#ffe3de">${t(b)}</span></div>`).join('')}</div></section>
  <div class="detail" style="margin-top:18px"><div class="stack">
    ${sh(t('Open briefs'))}${briefs.map(b => `<a class="card pad stack" href="#/catalyst/${b.id}"><div style="font-weight:700;font-size:18px">${t(b.problem)}</div><div class="row" style="gap:6px"><span class="chip">${esc(b.co)}</span><span class="chip money">${t(b.budget)}</span></div></a>`).join('') || `<div class="card empty">${t('No open briefs yet')}</div>`}
    ${sh(t('Results'))}<div class="card pad"><div class="list">${pipe.filter(p => p.stage >= 3).map(p => `<a class="it link" href="#/pilot/${p.id}"><div class="grow"><div class="t">${esc(p.startup)} × ${esc(SF.BRIEFS.find(b => b.id === p.brief).co)}</div><div class="s">${p.stage === 4 ? t('Contract signed') : t('Day {d} of 100', { d: p.day })}</div></div><span class="chip ${p.stage === 4 ? 'ok' : 'warn'}">${p.stage === 4 ? SF.uzs(p.value) : t('100-day pilot')}</span></a>`).join('') || `<span class="muted">${t('No pilots yet')}</span>`}</div></div>
  </div>
  <div class="stack"><div class="card pad stack"><b style="font-size:18px">${t('Member companies')}</b><div class="list">${members.map(([n, tier]) => `<div class="it"><span class="mini" style="background:${tier === 'anchor' ? 'var(--accent)' : 'var(--black)'}">${SF.initials(n)}</span><div class="grow"><div class="t">${esc(n)}</div></div><span class="chip ${tier === 'anchor' ? 'red' : ''}">${t(plan(tier).name)}</span></div>`).join('') || `<span class="muted">${t('Opens when the active guilds prove the model')}</span>`}</div></div>
    ${role() === 'company' ? (inGuild ? `<div class="card pad"><span class="chip ok">${t('You are a member')}</span></div>` : `<div class="card pad stack"><b>${t('Join this guild')}</b><span class="muted small">${t('Membership starts at {p}.', { p: price(SF.TIERS[0]) })}</span><a class="cta" href="#/plans"><span class="btn">${t('See plans')}</span>${SF.ARROW}</a></div>`) : ''}</div></div>`;
};

/* ---------- Plans ---------- */
const planCard = (p, cur) => `<div class="card pad stack ${p.top ? 'pin' : ''}" style="${p.top ? 'border-color:var(--accent);box-shadow:0 0 0 3px var(--pink)' : ''}">
  <div class="row between"><b class="display" style="font-size:32px">${t(p.name)}</b>${p.top ? `<span class="chip red">${t('Most chosen')}</span>` : ''}</div>
  <div class="display" style="font-size:40px;color:var(--brand)">${p.price === 0 ? t('Free') : SF.uzs(p.price)}<span class="small muted" style="font-family:var(--f-body);font-weight:400"> ${p.price ? '/ ' + t(p.per) : ''}</span></div>
  <div class="list">${p.perks.map(x => `<div class="it">${SF.STAR(18)}<span>${t(x)}</span></div>`).join('')}</div>
  ${cur ? `<span class="chip ok" style="align-self:start">${t('Your current plan')}</span>` : `<button class="cta" data-act="choose" data-plan="${p.id}"><span class="btn">${p.price === 0 ? t('Start free') : t('Choose')}</span>${SF.ARROW}</button>`}</div>`;
V.plans = () => { const sub = SF.S.subs[SF.myCompany()] || {};
  return `<section class="panel"><span class="eyebrow">${t('Partnership')}</span><h1 class="display" style="font-size:clamp(44px,6vw,84px);margin-top:8px">${t('Partner with Startup Fest')}</h1>
    <p style="font-size:19px;font-weight:300;max-width:60ch">${t('Companies pay for results: curated startups, real pilots and talent. Startups and students never pay.')}</p>
    <p class="muted small">${t('Example prices for the demo. Nothing is charged.')}</p></section>
  ${sh(t('For companies'))}<div class="grid g3">${SF.TIERS.map(p => planCard(p, role() === 'company' && sub.plan === p.id)).join('')}</div>
  ${sh(t('For SMEs and medium businesses'))}<div class="grid g3">${SF.SME_PLANS.map(p => planCard(p)).join('')}</div>
  ${sh(t('For scouting partners and investors'))}<div class="grid g2">${SF.SCOUT_PLANS.map(p => planCard(p, sub.plan === p.id && role() === 'company')).join('')}</div>`; };

/* ---------- Partner dashboard (company) ---------- */
V.partner = () => {
  const S = SF.S, co = SF.myCompany(), sub = S.subs[co], p = sub && plan(sub.plan);
  const briefs = SF.BRIEFS.filter(b => b.co === co), pipe = S.pipeline.filter(x => briefs.some(b => b.id === x.brief));
  const value = pipe.filter(x => x.stage === 4).reduce((a, x) => a + x.value, 0);
  const paidOut = Object.entries(S.gigState).filter(([id, g]) => g.st === 3 && (S.gigs.find(x => x.id === id) || {}).by === co).reduce((a, [, g]) => a + (g.uzs || 0), 0);
  const inv = S.invoices.filter(i => i.to === co), fees = inv.filter(i => i.status === 'Paid').reduce((a, i) => a + i.amount, 0);
  const roi = fees ? (value / fees).toFixed(1) : '–';
  return `<section class="panel black" style="position:relative;overflow:hidden"><div style="position:absolute;right:-20px;bottom:-30px;opacity:.5">${SF.STAR(240, '#e01a09')}</div>
    <span class="eyebrow" style="color:#bbb">${t('Partner panel')}</span><h1 class="display" style="font-size:clamp(40px,5.5vw,72px);margin-top:8px">${esc(co)}</h1>
    <div class="row" style="margin-top:14px">${p ? `<span class="chip money">${t(p.name)}</span>${sub.guild ? `<span class="chip" style="background:#ffffff1f;color:#fff">${t(sub.guild)}</span>` : ''}<span class="small" style="color:#ccc">${t('Member since {a} · renews {b}', { a: sub.since, b: sub.renews })}</span>` : `<span class="chip warn">${t('No membership yet')}</span>`}
    <a class="btn light sm" href="#/plans">${p ? t('Upgrade plan') : t('See plans')}</a></div></section>
  <div class="kpis">${[[String(briefs.length), 'briefs posted', 'red'], [String(pipe.length), 'applications received', ''], [String(pipe.filter(x => x.stage === 3).length), 'pilots running', ''], [SF.uzs(value), 'contracts signed', 'black']]
    .map(([a, b, c]) => `<div class="kpi ${c}"><b class="num">${a}</b><span>${t(b)}</span></div>`).join('')}</div>
  <div class="grid g2" style="margin-top:16px">
    <div class="card pad stack"><div class="eyebrow">${t('Return on membership')}</div><div class="display" style="font-size:64px;color:var(--brand)">${roi}×</div>
      <span class="muted">${t('Contract value from your pilots divided by the fees you paid ({f}).', { f: SF.uzs(fees) })}</span></div>
    <div class="card pad stack"><div class="eyebrow">${t('Talent')}</div><div class="display" style="font-size:44px">${SF.uzs(paidOut)}</div><span class="muted">${t('Paid to young builders through your gigs on Startup Earn')}</span>
      <a class="btn ghost sm" style="align-self:start" href="#/earn">${t('Post a gig')}</a></div></div>
  ${sh(t('Invoices'))}<div class="card tablewrap"><table><thead><tr><th>${t('Invoice')}</th><th>${t('Plan')}</th><th>${t('Amount')}</th><th>${t('Date')}</th><th>${t('Status')}</th><th></th></tr></thead><tbody>
  ${inv.map(i => `<tr><td class="mono">${i.id}</td><td>${t(plan(i.plan).name)}</td><td class="num">${SF.uzs(i.amount)}</td><td>${esc(i.date)}</td><td><span class="chip ${i.status === 'Paid' ? 'ok' : 'warn'}">${t(i.status)}</span></td>
    <td>${i.status === 'Due' ? `<button class="btn sm" data-act="payinv" data-id="${i.id}">${t('Pay now')}</button>` : `<button class="linkbtn" data-act="dlinv" data-id="${i.id}">${t('Download')}</button>`}</td></tr>`).join('') || `<tr><td colspan="6" class="muted">${t('No invoices yet')}</td></tr>`}</tbody></table></div>`;
};

/* ---------- Org dashboard: revenue ---------- */
const adm0 = V.admin;
V.admin = () => { const S = SF.S, paid = S.invoices.filter(i => i.status === 'Paid'), due = S.invoices.filter(i => i.status === 'Due');
  const arr = Object.values(S.subs).reduce((a, s) => { const p = plan(s.plan); return a + (p.per === 'year' ? p.price : p.per === 'month' ? p.price * 12 : 0); }, 0);
  const success = Math.round(S.pipeline.filter(p => p.stage === 4).reduce((a, p) => a + p.value, 0) * 0.07);
  const byTier = SF.ALL_PLANS.map(p => [p, Object.values(S.subs).filter(s => s.plan === p.id).length]).filter(([, n]) => n);
  return adm0() + `${sh(t('Revenue overview'), `<span class="muted">${t('Example figures for the demo')}</span>`)}
  <div class="kpis">${[[SF.uzs(arr), 'yearly membership revenue', 'red'], [SF.uzs(paid.reduce((a, i) => a + i.amount, 0)), 'paid invoices', ''], [SF.uzs(due.reduce((a, i) => a + i.amount, 0)), 'invoices due', ''], [SF.uzs(success), 'success fees at 7% of contracts', 'black']]
    .map(([a, b, c]) => `<div class="kpi ${c}"><b class="num">${a}</b><span>${t(b)}</span></div>`).join('')}</div>
  <div class="grid g2" style="margin-top:16px"><div class="card pad"><div class="eyebrow">${t('Members by plan')}</div><div class="list" style="margin-top:6px">${byTier.map(([p, n]) => `<div class="it"><div class="grow">${t(p.name)}</div><b class="num">${n}</b></div>`).join('')}</div></div>
  <div class="card pad"><div class="eyebrow">${t('Latest invoices')}</div><div class="list" style="margin-top:6px">${S.invoices.slice(0, 6).map(i => `<div class="it"><div class="grow"><div class="t">${esc(i.to)}</div><div class="s mono">${i.id} · ${t(plan(i.plan).name)}</div></div><span class="num">${SF.uzs(i.amount)}</span>
    ${i.status === 'Due' ? `<button class="btn ghost sm" data-act="markpaid" data-id="${i.id}">${t('Mark paid')}</button>` : `<span class="chip ok">${t('Paid')}</span>`}</div>`).join('')}</div></div></div>`; };

/* ---------- Directory: shortlist fee note ---------- */
const dir0 = V.directory;
V.directory = () => { let h = dir0(); const sub = SF.S.subs[role() === 'company' ? SF.myCompany() : SF.me().name];
  const note = sub && sub.plan === 'retainer' ? t('Included in your scouting retainer') : t('Shortlist fee: {p}. Startups that switched off recommendations are never included.', { p: SF.uzs(5e6) });
  return h.replace(`${t('Pick startups, then ask the Startup Fest team for a curated shortlist with intros. Startups opt in to be recommended.')}`, `${t('Pick startups, then ask the Startup Fest team for a curated shortlist with intros. Startups opt in to be recommended.')}<br><b>${note}</b>`); };
})();
