// State, persistence, points engine and notifications
(() => {
const KEY = 'sf-platform-' + SF.VERSION;
const IDS = { participant: 'SF-27-00317', mentor: 'SF-27-00634', investor: 'SF-27-00951', company: 'SF-27-01268', org: 'SF-27-01585' };

function fresh() {
  const people = {};
  Object.keys(SF.ROLES).forEach(r => {
    const p = SF.ROLES[r].persona;
    people[r] = { name: p.name, region: p.region, fields: { ...p.fields }, id: IDS[r], points: { participant: 120, mentor: 340, investor: 80, company: 210, org: 0 }[r],
      counts: { checkin: r === 'participant' ? 1 : 0, apply: r === 'participant' ? 1 : 0, gig: 0, intro: 0, contract: 0 },
      log: r === 'participant' ? [{ t: 'Checked in at Regional Arena · Samarkand', p: 15 }, { t: 'Applied to the AgriTech Catalyst brief', p: 25 }] : [] };
  });
  return {
    v: SF.VERSION, lang: 'uz', role: 'participant', people,
    reg: { participant: ['e2'], mentor: ['e2'], investor: ['e5'], company: ['e1'], org: [] },
    checkins: { e1: [], e2: ['SF-27-04412'], e3: [], e4: [], e5: [], e6: [] },
    pipeline: [
      { id: 'p1', brief: 'b1', startup: 'Suvchi', stage: 3, day: 64, done: [0, 1, 2, 3], updates: [{ d: 'Day 60', t: 'Sensors live on 50 ha. Water use down 14% so far.' }], value: 0, status: 'open' },
      { id: 'p2', brief: 'b1', startup: 'AgroLens', stage: 0, day: 0, done: [], updates: [], value: 0, status: 'open', mine: true, pitch: 'Drone photos and a phone app that flag water stress per field.' },
      { id: 'p3', brief: 'b2', startup: 'BozorPay', stage: 4, day: 100, done: [0, 1, 2, 3, 4, 5], updates: [{ d: 'Day 100', t: 'Default rate on scored loans: 2.1% vs 6% before.' }], value: 180000000, status: 'open' },
      { id: 'p4', brief: 'b2', startup: 'MahallaGo', stage: 1, day: 0, done: [], updates: [], value: 0, status: 'open' },
      { id: 'p5', brief: 'b3', startup: 'VibraSense', stage: 2, day: 0, done: [], updates: [], value: 0, status: 'open' },
      { id: 'p6', brief: 'b4', startup: 'MahallaGo', stage: 3, day: 22, done: [0, 1], updates: [{ d: 'Day 20', t: 'Routing model live for 2 districts.' }], value: 0, status: 'open' },
      { id: 'p7', brief: 'b3', startup: "Yo'lchi", stage: 0, day: 0, done: [], updates: [], value: 0, status: 'open', pitch: 'Shared trucking data to plan maintenance stops.' },
      { id: 'p8', brief: 'b1', startup: 'TexTrace', stage: 0, day: 0, done: [], updates: [], value: 0, status: 'open', pitch: 'Field-level water records linked to export certificates.' },
    ],
    gigs: JSON.parse(JSON.stringify(SF.GIGS)), applied: [], launches: SF.LAUNCHES.map(l => l.v), upvoted: [],
    threads: JSON.parse(JSON.stringify(SF.THREADS)), cur: 't1', shortlist: [],
    notifs: [
      { id: 'n1', role: 'participant', t: 'AgroVodiy Holding posted a new AgriTech brief', go: '#/catalyst/b1', read: false },
      { id: 'n2', role: 'company', t: '3 startups applied to your irrigation brief', go: '#/catalyst/b1', read: false },
      { id: 'n3', role: 'org', t: 'Suvchi pilot reached day 64 of 100', go: '#/pilot/p1', read: false },
      { id: 'n4', role: 'mentor', t: 'Aziza Rahimova asked for feedback on pricing', go: '#/messages', read: false },
      { id: 'n5', role: 'investor', t: '4 new startups match AgriTech + FinTech', go: '#/directory', read: false },
    ],
    filters: {},
    ...(SF.freshExtra ? SF.freshExtra() : {}),
  };
}
function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); return s && s.v === SF.VERSION ? s : null; } catch (e) { return null; } }
SF.S = load() || fresh();
SF.save = () => { try { localStorage.setItem(KEY, JSON.stringify(SF.S)); } catch (e) {} };
SF.reset = () => { SF.S = fresh(); SF.save(); };
SF.me = (role = SF.S.role) => SF.S.people[role];

SF.level = pts => { let cur = SF.LEVELS[0], next = null; for (let i = 0; i < SF.LEVELS.length; i++) { if (pts >= SF.LEVELS[i][1]) { cur = SF.LEVELS[i]; next = SF.LEVELS[i + 1] || null; } } return { cur, next }; };
SF.badges = role => { const p = SF.me(role); return Object.keys(SF.BADGES).filter(b => SF.BADGES[b](p)); };

// award points for an action, log it, announce new badges and level-ups
SF.award = (role, rule, text) => {
  const p = SF.me(role), pts = SF.RULES[rule] || 0, before = SF.badges(role), lvl = SF.level(p.points).cur[0];
  p.points += pts; if (rule in p.counts) p.counts[rule]++;
  p.log.unshift({ t: text, p: pts });
  SF.badges(role).filter(b => !before.includes(b)).forEach(b => SF.notify(role, SF.t('New badge: {b}', { b: SF.t(b) }), '#/me'));
  const lvl2 = SF.level(p.points).cur[0];
  if (lvl2 !== lvl) SF.notify(role, SF.t('Level up: you are now a {l}', { l: SF.t(lvl2) }), '#/me');
  return pts;
};
SF.notify = (role, t, go) => { SF.S.notifs.unshift({ id: 'n' + Date.now() + Math.random(), role, t, go, read: false }); };

SF.metrics = () => {
  const S = SF.S, contracts = S.pipeline.filter(p => p.stage === 4);
  const valueUZS = contracts.reduce((a, p) => a + (p.value || 0), 0);
  const checkins = Object.values(S.checkins).reduce((a, l) => a + l.length, 0);
  return { members: 12480 + (S.joined || 0), mam: 3920 + checkins, running: S.pipeline.filter(p => p.stage === 3 && p.status === 'open').length,
    contracts: contracts.length, valueUZS, paying: 22 };
};

// scenario export/import (works when opened as a local file)
SF.exportScenario = () => {
  const blob = new Blob([JSON.stringify(SF.S, null, 1)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'startupfest-demo-scenario.json'; document.body.appendChild(a); a.click(); a.remove();
};
SF.importScenario = file => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => { try { const s = JSON.parse(r.result); if (!s.people || !s.pipeline) throw new Error('bad'); s.v = SF.VERSION; SF.S = s; SF.save(); res(); } catch (e) { rej(e); } };
  r.readAsText(file);
});
})();
