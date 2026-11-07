// v10 views: franchise instances, playbook builder, partner analytics, language packs, public impact report, launch readiness
(() => {
const t = (s, v) => SF.t(s, v), esc = SF.esc, V = SF.V;
const S = () => SF.S, role = () => SF.S.role;
const sh = (title, right = '') => `<div class="sec-h"><h2>${title}</h2>${right}</div>`;
const scaleNav = cur => `<nav class="subnav" aria-label="${t('Scale')}">${[['instances', 'Countries'], ['playbook', 'Playbook builder'], ['analytics', 'Analytics'], ['langs', 'Language packs'], ['impact', 'Impact report'], ['launch', 'Launch readiness']].map(([k, l]) => `<a href="#/${k}" ${cur === k ? 'aria-current="page"' : ''}>${t(l)}</a>`).join('')}</nav>`;
SF.inst = k => S().inst.find(x => x.k === k);
const stageChip = st => `<span class="chip ${st === 'Launched' ? 'ok' : st === 'Pilot' ? 'red' : st === 'Interested' ? '' : 'warn'}">${t(st)}</span>`;
const pctDone = x => Math.round(x.done.length / SF.ONBOARD.length * 100);

/* ---------- live numbers for the home instance ---------- */
SF.homeKpi = () => { const m = SF.metrics(), b = SF.inst('uz').kpi;
  return { ...b, members: m.members, active: m.mam, pilots: S().pipeline.filter(p => p.stage >= 3).length, contracts: m.contracts, value: Math.round(m.valueUZS / SF.FX) }; };
const kpi = x => x.k === 'uz' ? SF.homeKpi() : x.kpi;

/* ---------- Countries (instances) ---------- */
V.instances = () => `${scaleNav('instances')}${sh(t('Catalyst in other countries'), `<button class="btn" data-act="newinst">${t('Add a country')}</button>`)}
  <p class="muted" style="margin:-6px 0 14px;max-width:70ch">${t('Each partner country runs its own copy of the platform with its own language, team and data. Less-developed countries get the first year free; later terms are agreed case by case.')}</p>
  <div class="pipe">${SF.INST_STAGES.map(s => `<div class="pipe-st"><b class="num">${S().inst.filter(x => x.stage === s).length}</b><span>${t(s)}</span></div>`).join('')}</div>
  <div class="grid g2" style="margin-top:16px">${S().inst.map(x => { const k = kpi(x);
    return `<a class="card pad stack link inst-card" href="#/instance/${x.k}"><div class="row between"><div class="row" style="gap:10px"><span class="flag">${x.flag}</span><div><b style="font-size:20px">${t(x.country)}</b><div class="muted small">${t(x.city)} · ${esc(t(x.partner))}</div></div></div>${stageChip(x.stage)}</div>
      <div class="row between small"><span>${t('Onboarding')}</span><span class="num">${pctDone(x)}%</span></div><div class="bar"><i style="width:${pctDone(x)}%"></i></div>
      <div class="mini-kpis"><span><b class="num">${SF.fmt(k.members)}</b>${t('members')}</span><span><b class="num">${k.pilots}</b>${t('pilots')}</span><span><b class="num">${SF.usd(k.value)}</b>${t('value')}</span></div>
      <span class="muted small">${t(x.terms)}${x.since ? ' · ' + t('since {d}', { d: x.since }) : ''}</span></a>`; }).join('')}</div>`;
V.instance = k => { const x = SF.inst(k); if (!x) return V.instances(); const n = kpi(x);
  return `${SF.back('#/instances', t('Countries'))}<section class="panel red" style="position:relative;overflow:hidden"><div style="position:absolute;right:-30px;top:-30px;opacity:.2">${SF.STAR(240, '#fff')}</div>
    <div class="row between"><span class="chip" style="background:#fff;color:var(--brand)">${t(x.stage)}</span><span class="flag" style="font-size:44px">${x.flag}</span></div>
    <h1 class="display" style="font-size:clamp(44px,6vw,84px);margin-top:8px">STARTUP FEST · ${t(x.country).toUpperCase()}</h1><p style="margin:0;font-size:18px;font-weight:300">${esc(t(x.partner))} · ${esc(t(x.langs))} · ${t(x.terms)}</p>
    <div class="kpis" style="margin-top:18px">${[[SF.fmt(n.members), 'members'], [SF.fmt(n.active), 'monthly active'], [String(n.briefs), 'open briefs'], [SF.usd(n.value), 'value to members']].map(([a, b]) => `<div class="kpi"><b class="num">${a}</b><span>${t(b)}</span></div>`).join('')}</div></section>
  <div class="grid g2" style="margin-top:16px;align-items:start"><div class="card pad stack"><div class="row between"><b>${t('Onboarding checklist')}</b><span class="chip ${pctDone(x) === 100 ? 'ok' : 'warn'}">${pctDone(x)}%</span></div>
    <div class="list">${SF.ONBOARD.map(([o, l]) => `<label class="it check"><input type="checkbox" data-onb="${o}" data-k="${x.k}" ${x.done.includes(o) ? 'checked' : ''} ${x.k === 'uz' ? 'disabled' : ''}><div class="grow">${t(l)}</div></label>`).join('')}</div></div>
  <div class="stack"><div class="card pad stack"><b>${t('Stage')}</b><div class="inst-steps">${SF.INST_STAGES.map((s, i) => `<span class="${SF.INST_STAGES.indexOf(x.stage) >= i ? 'on' : ''}">${t(s)}</span>`).join('')}</div>
    ${x.k !== 'uz' && x.stage !== 'Launched' ? `<button class="btn" style="align-self:start" data-act="instnext" data-k="${x.k}">${t('Move to {s}', { s: t(SF.INST_STAGES[SF.INST_STAGES.indexOf(x.stage) + 1]) })}</button>` : ''}</div>
    <div class="card pad stack"><b>${t('What the partner gets')}</b><div class="list">${['A copy of the platform in their language', 'The Catalyst playbook and training for their team', 'Monthly calls with the Startup Fest team', 'A seat at the yearly Catalyst network meeting'].map(p => `<div class="it"><span>✓</span><div class="grow">${t(p)}</div></div>`).join('')}</div>
    <a class="btn ghost" style="align-self:start" href="#/playbook" data-act="pbfor" data-k="${x.k}">${t('Build their playbook')}</a></div></div></div>`; };

/* ---------- Playbook builder ---------- */
SF.playbookText = () => { const pb = S().pb, x = SF.inst(pb.inst), keep = SF.lang; SF.lang = pb.lang;
  try { const lines = [`STARTUP FEST · CATALYST PLAYBOOK`, `${t(x.country)} · ${t(x.partner)}`, '', ...SF.PLAYBOOK.filter(p => pb.on.includes(p[0])).flatMap(([k, n, d], i) => [`${i + 1}. ${t(n)}`, `   ${t(d)}`, ...(pb.notes[k] ? [`   ${t('Local note')}: ${pb.notes[k]}`] : []), '']), t('Made with the Startup Fest platform demo.')];
    return lines.join('\n'); } finally { SF.lang = keep; } };
V.playbook = () => { const pb = S().pb;
  return `${scaleNav('playbook')}${sh(t('Playbook builder'), `<button class="btn" data-act="pbdl">${t('Download playbook')}</button>`)}
  <div class="filters"><label class="muted" for="pb-inst" style="align-self:center">${t('For')}</label><select id="pb-inst" data-filter="pbinst">${S().inst.map(x => `<option value="${x.k}" ${pb.inst === x.k ? 'selected' : ''}>${x.flag} ${t(x.country)}</option>`).join('')}</select>
    <label class="muted" for="pb-lang" style="align-self:center">${t('Language')}</label><select id="pb-lang" data-filter="pblang">${[['en', 'English'], ['ru', 'Russian'], ['uz', 'Uzbek']].map(([k, l]) => `<option value="${k}" ${pb.lang === k ? 'selected' : ''}>${t(l)}</option>`).join('')}</select></div>
  <div class="grid g2" style="align-items:start"><div class="stack">${SF.PLAYBOOK.map(([k, n, d], i) => `<div class="card pad stack pb-ch ${pb.on.includes(k) ? '' : 'off'}"><div class="row between"><label class="row" style="gap:10px"><input type="checkbox" data-pb="${k}" ${pb.on.includes(k) ? 'checked' : ''}><b>${i + 1}. ${t(n)}</b></label></div>
    <span class="muted small">${t(d)}</span><div class="field"><label for="pbn-${k}" class="small">${t('Local note')}</label><input id="pbn-${k}" data-pbnote="${k}" value="${esc(pb.notes[k] || '')}" placeholder="${t('What is different in this country?')}"></div></div>`).join('')}</div>
  <div class="card pad stack pb-preview"><b>${t('Preview')}</b><pre id="pbtext">${esc(SF.playbookText())}</pre></div></div>`; };

/* ---------- Analytics across instances ---------- */
V.analytics = () => { const rows = S().inst.map(x => ({ x, k: kpi(x) })), mx = f => Math.max(1, ...rows.map(r => r.k[f]));
  const bars = (f, label, fmt = SF.fmt) => `<div class="card pad stack"><b>${t(label)}</b>${rows.map(r => `<div><div class="row between small"><span>${r.x.flag} ${t(r.x.country)}</span><b class="num">${fmt(r.k[f])}</b></div><div class="bar" style="margin-top:4px"><i style="width:${r.k[f] / mx(f) * 100}%"></i></div></div>`).join('')}</div>`;
  const fun = [['Members', SF.homeKpi().members], ['Applied to a brief', 1840], ['Selected', 212], ['In a pilot', S().pipeline.filter(p => p.stage >= 3).length * 12], ['Signed a contract', S().pipeline.filter(p => p.stage === 4).length * 9]];
  const regions = [...SF.COUNCILS].sort((a, b) => b.m - a.m), rmx = Math.max(...regions.map(r => r.m));
  return `${scaleNav('analytics')}${sh(t('Analytics across countries'), `<span class="muted">${t('Uzbekistan numbers are live from this demo')}</span>`)}
  <div class="grid g3">${bars('members', 'Members')}${bars('pilots', 'Pilots')}${bars('value', 'Value to members (USD)', SF.usd)}</div>
  <div class="grid g2" style="margin-top:16px;align-items:start"><div class="card pad stack"><b>${t('Uzbekistan: from member to contract')}</b>${fun.map(([l, v], i) => `<div class="funnel" style="--w:${Math.max(8, v / fun[0][1] * 100)}%"><span>${t(l)}</span><b class="num">${SF.fmt(v)}</b></div>`).join('')}<span class="muted small">${t('Sample numbers except members and pilots.')}</span></div>
  <div class="card pad stack"><b>${t('Members by region')}</b>${regions.map(r => `<div class="row" style="gap:10px"><span class="small" style="width:130px">${t(r.r)}</span><div class="bar grow"><i style="width:${r.m / rmx * 100}%"></i></div><span class="num small" style="width:56px;text-align:right">${SF.fmt(r.m)}</span></div>`).join('')}</div></div>
  <div class="card tablewrap" style="margin-top:16px"><table><thead><tr><th>${t('Country')}</th><th>${t('Stage')}</th><th>${t('Members')}</th><th>${t('Monthly active')}</th><th>${t('Briefs')}</th><th>${t('Pilots')}</th><th>${t('Contracts')}</th><th>${t('Regions')}</th></tr></thead><tbody>
  ${rows.map(({ x, k }) => `<tr><td><b>${x.flag} ${t(x.country)}</b></td><td>${stageChip(x.stage)}</td><td class="num">${SF.fmt(k.members)}</td><td class="num">${SF.fmt(k.active)}</td><td class="num">${k.briefs}</td><td class="num">${k.pilots}</td><td class="num">${k.contracts}</td><td class="num">${k.regions}</td></tr>`).join('')}</tbody></table></div>`; };

/* ---------- Language packs ---------- */
SF.coverage = l => { const base = Object.keys(SF.DICT.uz); if (l === 'en') return 100; const d = SF.DICT[l] || {}; return Math.min(100, Math.round(base.filter(k => k in d).length / base.length * 100)); };
V.langs = () => { const packs = [['uz', 'Uzbek (Latin)', 'Default'], ['ru', 'Russian', ''], ['en', 'English', 'Base language'], ['ky', 'Kyrgyz', 'Draft for the Kyrgyzstan pilot'], ['tg', 'Tajik', 'Planned'], ['mn', 'Mongolian', 'Planned']];
  return `${scaleNav('langs')}${sh(t('Language packs'))}
  <p class="muted" style="margin:-6px 0 14px;max-width:70ch">${t('Every word in the platform comes from a language pack. A new country translates the pack; anything not translated yet shows in English. Turn a pack on to add it to the language buttons.')}</p>
  <div class="card tablewrap"><table><thead><tr><th>${t('Language')}</th><th>${t('Translated')}</th><th>${t('Note')}</th><th>${t('In the menu')}</th></tr></thead><tbody>
  ${packs.map(([k, n, note]) => { const c = SF.DICT[k] || k === 'en' ? SF.coverage(k) : 0, avail = !!SF.DICT[k] || k === 'en';
    return `<tr><td><b>${t(n)}</b> <span class="mono muted">${k.toUpperCase()}</span></td><td style="min-width:200px"><div class="row" style="gap:8px;flex-wrap:nowrap"><div class="bar grow"><i style="width:${c}%"></i></div><span class="num small">${c}%</span></div></td><td class="muted">${t(note)}</td>
    <td>${avail ? `<label class="switch"><input type="checkbox" data-pack="${k}" ${S().packs[k] ? 'checked' : ''} ${['uz', 'en'].includes(k) ? 'disabled' : ''} aria-label="${esc(t(n))}"><span></span></label>` : `<span class="muted small">${t('Not started')}</span>`}</td></tr>`; }).join('')}</tbody></table></div>
  <div class="card pad row between" style="margin-top:16px"><div><b>${t('Translator file')}</b><div class="muted small">${t('All {n} English phrases with the current Kyrgyz draft, ready for a translator.', { n: SF.fmt(Object.keys(SF.DICT.uz).length) })}</div></div><button class="btn ghost" data-act="packdl">${t('Download for translation')}</button></div>`; };

/* ---------- Public impact report (opens without signing in) ---------- */
V.impact = () => { const k = SF.homeKpi(), hours = (SF.MENTORS || []).reduce((a, m) => a + m.hours, 0) + S().bookings.filter(b => b.status === 'Done').length;
  const nums = [[SF.fmt(k.members), 'members with a Startup Fest ID'], ['14', 'regions with events'], [String(k.pilots), '100-day pilots'], [SF.usd(k.value), 'value to members'], [SF.usd(SF.capital()), 'invested through the platform'], [SF.fmt(hours), 'mentor hours given'], [SF.fmt(S().tickets.filter(x => x.status === 'Paid').length + 4200), 'event tickets'], [String(S().inst.filter(x => x.k !== 'uz').length), 'partner countries']];
  return `${S().session && role() === 'org' ? scaleNav('impact') : ''}<section class="panel red impact-hero"><div class="impact-star">${SF.STAR(320, '#fff')}</div><div class="eyebrow" style="color:#fff;opacity:.8">${t('Impact report · 2026')}</div>
    <h1 class="display" style="font-size:clamp(48px,7vw,108px);margin-top:8px">${t('WHAT THE COMMUNITY DID')}</h1><p style="font-size:19px;font-weight:300;max-width:56ch;margin:0">${t('Startup Fest connects young builders in all 14 regions with companies, mentors and investors. These numbers update from the platform.')}</p></section>
  <div class="kpis" style="margin-top:16px">${nums.map(([a, b], i) => `<div class="kpi ${i === 0 ? 'red' : i === 3 ? 'black' : ''}"><b class="num">${a}</b><span>${t(b)}</span></div>`).join('')}</div>
  ${sh(t('Stories'))}<div class="grid g3">${SF.STORIES.map(([n, r, s]) => `<div class="card pad stack"><span class="chip red" style="align-self:start">${t(r)}</span><b style="font-size:20px">${esc(n)}</b><span>${t(s)}</span></div>`).join('')}</div>
  ${sh(t('Members by region'))}<div class="card pad"><div class="region-grid">${[...SF.COUNCILS].sort((a, b) => b.m - a.m).map(r => `<div class="rg" style="--o:${0.25 + r.m / Math.max(...SF.COUNCILS.map(x => x.m)) * 0.75}"><b class="num">${SF.fmt(r.m)}</b><span>${t(r.r)}</span></div>`).join('')}</div></div>
  <div class="row" style="margin-top:16px"><button class="btn" data-act="impactdl">${t('Download the report')}</button>${S().session ? '' : `<a class="btn ghost" href="#/signup">${t('Join Startup Fest')}</a><a class="btn ghost" href="#/login">${t('Sign in')}</a>`}</div>
  <p class="muted small">${t('All numbers in this demo are sample data, except 14 regions and the $410K in Catalyst deals.')}</p>`; };

/* ---------- Launch readiness ---------- */
V.launch = () => { const L = S().launch, items = SF.LAUNCH.flatMap(([, l]) => l), done = items.filter(([n]) => L[n] === 'done').length, p = Math.round(done / items.length * 100);
  return `${scaleNav('launch')}${sh(t('Launch readiness'), `<span class="chip ${p === 100 ? 'ok' : 'warn'}">${p === 100 ? t('Ready to launch') : t('{p}% ready', { p })}</span>`)}
  <div class="bar thick" style="margin-bottom:16px"><i style="width:${p}%"></i></div>
  <div class="grid g2" style="align-items:start">${SF.LAUNCH.map(([g, l]) => `<div class="card pad stack"><b>${t(g)}</b><div class="list">${l.map(([n, who]) => { const st = L[n] || 'todo';
    return `<div class="it"><div class="grow"><div class="t">${t(n)}</div><div class="s">${t(who)}</div></div><button class="chip ${st === 'done' ? 'ok' : st === 'progress' ? 'warn' : ''}" data-act="lstate" data-n="${esc(n)}">${t({ todo: 'To do', progress: 'In progress', done: 'Done' }[st])}</button></div>`; }).join('')}</div></div>`).join('')}</div>
  ${sh(t('Load test (simulation)'))}<div class="card pad stack"><div class="row">${[1000, 5000, 10000].map(n => `<button class="btn ghost sm" data-act="loadtest" data-n="${n}">${t('{n} users at once', { n: SF.fmt(n) })}</button>`).join('')}</div>
    ${S().loadRuns.length ? `<div class="tablewrap"><table><thead><tr><th>${t('Users')}</th><th>${t('Median response')}</th><th>${t('Slowest 5%')}</th><th>${t('Errors')}</th><th>${t('Result')}</th></tr></thead><tbody>${S().loadRuns.map(r => `<tr><td class="num">${SF.fmt(r.n)}</td><td class="num">${r.p50} ms</td><td class="num">${r.p95} ms</td><td class="num">${r.err}%</td><td><span class="chip ${r.ok ? 'ok' : 'warn'}">${r.ok ? t('Pass') : t('Needs work')}</span></td></tr>`).join('')}</tbody></table></div>` : `<span class="muted small">${t('A simulation of what the real load test measures. The goal: the slowest 5% of pages under 800 ms with 10,000 people online on festival day.')}</span>`}</div>`; };

/* ---------- dashboard tile and login link ---------- */
const adm9 = V.admin;
V.admin = () => adm9().replace('<div class="grid g3">', `<div class="grid g3"><a class="card pad tile" href="#/instances"><b style="font-size:20px">${t('Catalyst in other countries')}</b><span class="muted">${t('{n} partner countries · {r}% launch-ready', { n: S().inst.length - 1, r: Math.round(SF.LAUNCH.flatMap(([, l]) => l).filter(([n]) => S().launch[n] === 'done').length / SF.LAUNCH.flatMap(([, l]) => l).length * 100) })}</span></a>`);
const login9 = V.login;
V.login = p => login9(p).replace('<p>' + t('Every member type has its own login. Choose yours.') + '</p>', '<p>' + t('Every member type has its own login. Choose yours.') + `</p><a class="impact-link" href="#/impact">${t('See our impact report')} →</a>`);
})();
