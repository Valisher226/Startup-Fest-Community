// v10 actions: franchise instances, playbook builder and export, language packs, impact report, launch readiness
(() => {
const t = (s, v) => SF.t(s, v), esc = SF.esc, A = SF.A, S = () => SF.S;
const SCALE = ['instances', 'instance', 'playbook', 'analytics', 'langs', 'launch'];
Object.assign(SF.LABEL, { instances: 'Countries', playbook: 'Playbook builder', analytics: 'Analytics', langs: 'Language packs', impact: 'Impact report', launch: 'Launch readiness' });
SCALE.forEach(k => SF.TAB_OF[k] = 'admin'); SF.TAB_OF.impact = null;
SF.PUBLIC.push('impact');
const render9 = SF.render;
SF.render = () => { const v = (location.hash || '').split('/')[1]; if (S().session && SCALE.includes(v) && S().role !== 'org') history.replaceState(null, '', '#/noaccess/' + v); render9(); };
const download = (name, text) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); SF.toast(t('Saved {f}', { f: name })); };
const audit = (a, x) => SF.log && SF.log('Programmes', a, x);

/* ---------- language buttons follow the enabled packs ---------- */
const chrome9 = SF.renderChrome;
SF.renderChrome = () => { chrome9(); const box = document.getElementById('langs'); let b = box.querySelector('[data-l="ky"]');
  if (S().packs.ky && !b) { box.insertAdjacentHTML('beforeend', '<button data-act="setlang" data-l="ky" aria-pressed="false">KY</button>'); b = box.querySelector('[data-l="ky"]'); }
  if (!S().packs.ky && b) { b.remove(); if (SF.lang === 'ky') { S().lang = SF.lang = 'en'; } }
  if (!S().packs.ru) { const r = box.querySelector('[data-l="ru"]'); if (r) r.hidden = true; } else { const r = box.querySelector('[data-l="ru"]'); if (r) r.hidden = false; }
  box.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x.dataset.l === SF.lang)); };

Object.assign(A, {
  newinst: () => SF.modal(`<h3>${t('Add a country')}</h3><p class="muted" style="margin:0">${t('Start as “Interested”. The first year is free for less-developed countries.')}</p>
    <form id="inst-form" class="stack"><div class="two"><div class="field"><label for="in-c">${t('Country')}</label><input id="in-c" required></div><div class="field"><label for="in-city">${t('Main city')}</label><input id="in-city" required></div></div>
    <div class="field"><label for="in-p">${t('Partner organisation')}</label><input id="in-p" required placeholder="${t('e.g. Ministry of Digital Development')}"></div><div class="field"><label for="in-l">${t('Languages')}</label><input id="in-l" required></div>
    <div class="field"><label for="in-t">${t('Terms')}</label><select id="in-t">${['Free for the first year', 'Free pilot, then agreed case by case', 'Shared costs'].map(x => `<option value="${x}">${t(x)}</option>`).join('')}</select></div>
    <div class="row end"><button type="button" class="btn ghost" data-close="1">${t('Cancel')}</button><button class="btn">${t('Add')}</button></div></form>`),
  instnext: d => { const x = SF.inst(d.k), i = SF.INST_STAGES.indexOf(x.stage); if (i < SF.INST_STAGES.length - 1) x.stage = SF.INST_STAGES[i + 1]; if (!x.since) x.since = 'Oct 2026'; audit('Moved a country to the next stage', x.country + ' → ' + x.stage); SF.toast(t('{c} is now at “{s}”', { c: t(x.country), s: t(x.stage) })); SF.render(); },
  pbfor: d => { S().pb.inst = d.k; },
  pbdl: () => { const x = SF.inst(S().pb.inst); download(`catalyst-playbook-${x.k}-${S().pb.lang}.txt`, SF.playbookText()); audit('Exported a playbook', x.country); },
  packdl: () => { const rows = ['English\tUzbek\tRussian\tKyrgyz (draft)', ...Object.keys(SF.DICT.uz).sort().map(k => [k, SF.DICT.uz[k], SF.DICT.ru[k] || '', SF.DICT.ky[k] || ''].map(c => String(c).replace(/\s+/g, ' ')).join('\t'))]; download('startupfest-language-pack.tsv', rows.join('\n')); },
  impactdl: () => { const k = SF.homeKpi(); download('startupfest-impact-report-2026.txt', [t('Impact report · 2026'), '', `${t('members with a Startup Fest ID')}: ${SF.fmt(k.members)}`, `${t('regions with events')}: 14`, `${t('100-day pilots')}: ${k.pilots}`, `${t('value to members')}: ${SF.usd(k.value)}`, `${t('invested through the platform')}: ${SF.usd(SF.capital())}`, '', ...SF.STORIES.map(([n, r, s]) => `${n} (${t(r)}): ${t(s)}`), '', t('All numbers in this demo are sample data, except 14 regions and the $410K in Catalyst deals.')].join('\n')); },
  lstate: d => { const L = S().launch, nx = { todo: 'progress', progress: 'done', done: 'todo' }; L[d.n] = nx[L[d.n] || 'todo']; SF.render(); },
  loadtest: d => { const n = +d.n, ready = ['Load test with 10,000 users at once', 'Event-day plan for weak internet'].filter(k => S().launch[k] === 'done').length;
    const p50 = Math.round(90 + n / 120 - ready * 20), p95 = Math.round(240 + n / 14 - ready * 180), err = +(Math.max(0, n / 10000 * 1.8 - ready * 0.8)).toFixed(1);
    S().loadRuns.unshift({ n, p50, p95, err, ok: p95 < 800 && err < 1 }); S().loadRuns.length = Math.min(S().loadRuns.length, 6); SF.render(); },
});
document.addEventListener('change', e => { const el = e.target, s = S();
  if (el.dataset && el.dataset.onb) { const x = SF.inst(el.dataset.k); x.done = el.checked ? [...new Set([...x.done, el.dataset.onb])] : x.done.filter(o => o !== el.dataset.onb); SF.render(); }
  if (el.dataset && el.dataset.pb) { s.pb.on = el.checked ? SF.PLAYBOOK.map(p => p[0]).filter(k => k === el.dataset.pb || s.pb.on.includes(k)) : s.pb.on.filter(k => k !== el.dataset.pb); SF.render(); }
  if (el.dataset && el.dataset.pbnote) { s.pb.notes[el.dataset.pbnote] = el.value.trim(); SF.render(); }
  if (el.id === 'pb-inst') { s.pb.inst = el.value; SF.render(); }
  if (el.id === 'pb-lang') { s.pb.lang = el.value; SF.render(); }
  if (el.dataset && el.dataset.pack) { s.packs[el.dataset.pack] = el.checked; audit(el.checked ? 'Turned on a language pack' : 'Turned off a language pack', el.dataset.pack); SF.toast(t('Saved')); SF.render(); }
});
const fh9 = SF.formHandlers;
SF.formHandlers = (f, val) => {
  if (f.id === 'inst-form') { const c = val('in-c'), k = c.toLowerCase().replace(/[^a-z]/g, '').slice(0, 3) + S().inst.length;
    S().inst.push({ k, country: c, flag: '🌍', city: val('in-city'), partner: val('in-p'), stage: 'Interested', since: '', langs: val('in-l'), terms: val('in-t'), kpi: { members: 0, active: 0, briefs: 0, pilots: 0, contracts: 0, value: 0, regions: 0 }, done: [] });
    audit('Added a partner country', c); SF.closeModal(); SF.toast(t('{c} added', { c })); return SF.go('#/instance/' + k); }
  return fh9(f, val);
};
SF.boot();
})();
