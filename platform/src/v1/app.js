(() => {
const HERO = "assets/img/hero.jpg";
const SPARK = '<svg class="spark" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z"/></svg>';
const I = {
  home:'<path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  events:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  catalyst:'<path d="M3 21V10l6 4V10l6 4V4h6v17z"/>',
  earn:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
  directory:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/>',
  messages:'<path d="M4 4h16v12H8l-4 4z"/>',
  community:'<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2 20c0-3 3-5 6-5s6 2 6 5M12 20c0-3 2-5 5-5s5 2 5 5"/>',
  me:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="11" r="2.5"/><path d="M5.5 17c.6-2 2-3 3.5-3s2.9 1 3.5 3M14 9h5M14 13h4"/>',
  admin:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
};
const icon = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${I[k]}</svg>`;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n => n.toLocaleString('en-US');

/* ---------- sample data (all fictional) ---------- */
const REGIONS = ['Tashkent city','Tashkent region','Andijan','Fergana','Namangan','Samarkand','Bukhara','Navoi','Kashkadarya','Surkhandarya','Jizzakh','Syrdarya','Khorezm','Karakalpakstan'];
const ROLES = {
  participant:{label:'Participant', color:'#E5251F', persona:{name:'Aziza Rahimova', region:'Samarkand', line:'School track · Team "AgroLens"'}},
  mentor:{label:'Mentor', color:'#E28D1D', persona:{name:'Bekzod Tursunov', region:'Tashkent city', line:'FinTech · product lead at a bank'}},
  investor:{label:'Investor', color:'#1C1514', persona:{name:'Dilnoza Karimova', region:'Tashkent city', line:'Angel · seed stage, AgriTech & FinTech'}},
  company:{label:'Company', color:'#2B7DE9', persona:{name:'AgroVodiy Holding', region:'Fergana', line:'AgriTech guild member'}},
  org:{label:'Org team', color:'#8E1000', persona:{name:'Startup Fest team', region:'Tashkent city', line:'Community & Growth'}},
};
const EVENTS = [
  {id:'e1', d:'14', m:'NOV', title:'Catalyst · AgriTech day', place:'AgroVodiy farm, Fergana', type:'Catalyst', region:'Fergana', seats:40, taken:31},
  {id:'e2', d:'20', m:'NOV', title:'Startup Night · Samarkand', place:'Youth Center, Samarkand', type:'Monthly meetup', region:'Samarkand', seats:80, taken:52},
  {id:'e3', d:'24', m:'NOV', title:'Catalyst showcase at Startup Week', place:'Tashkent', type:'Showcase', region:'Tashkent city', seats:150, taken:118},
  {id:'e4', d:'05', m:'DEC', title:'Startup Night · Nukus', place:'IT Park branch, Nukus', type:'Monthly meetup', region:'Karakalpakstan', seats:60, taken:19},
  {id:'e5', d:'12', m:'DEC', title:'VC Battle', place:'Zakovat Arena, Tashkent', type:'Investors', region:'Tashkent city', seats:200, taken:164},
  {id:'e6', d:'15', m:'JAN', title:'Startup Fest School · Cohort 1 kickoff', place:'Online', type:'Course', region:'Online', seats:500, taken:233},
];
const BRIEFS = [
  {id:'b1', co:'AgroVodiy Holding', guild:'AgriTech & Food', problem:'Predict cotton field water needs to cut irrigation waste by 20%.', owner:'Head of Operations', budget:'45M UZS pilot', due:'1 Dec'},
  {id:'b2', co:'Silk Road Bank', guild:'FinTech', problem:'Score micro-loans for bazaar traders without a credit history.', owner:'Retail Credit Director', budget:'60M UZS pilot', due:'8 Dec'},
  {id:'b3', co:'Navoi Metals', guild:'Energy & Industry', problem:'Spot conveyor belt failures early from vibration data.', owner:'Chief Engineer', budget:'80M UZS pilot', due:'15 Dec'},
  {id:'b4', co:'Fergana Region Admin', guild:'GovTech & Regions', problem:'Route citizen requests to the right office automatically.', owner:'Digitalisation Dept.', budget:'30M UZS pilot', due:'20 Dec'},
];
const STAGES = ['Applied','Selected','Catalyst day','100-day pilot','Contract'];
const STARTUPS = [
  {n:'AgroLens', s:'AgriTech', r:'Samarkand', st:'MVP', t:'Drone photos → crop disease alerts', team:3, badges:['Arena finalist']},
  {n:'BozorPay', s:'FinTech', r:'Andijan', st:'Revenue', t:'Payments and stock app for bazaar stalls', team:5, badges:['Catalyst pilot']},
  {n:'Suvchi', s:'AgriTech', r:'Khorezm', st:'Pilot', t:'Smart irrigation sensors for small farms', team:4, badges:['Catalyst pilot']},
  {n:'MahallaGo', s:'GovTech', r:'Tashkent city', st:'MVP', t:'Mahalla requests and announcements app', team:4, badges:['National finalist']},
  {n:'Ustoz.ai', s:'EdTech', r:'Namangan', st:'Revenue', t:'Uzbek-language AI tutor for exams', team:6, badges:['VC Battle']},
  {n:'VibraSense', s:'Industry', r:'Navoi', st:'Idea', t:'Vibration sensors for factory machines', team:2, badges:[]},
  {n:'TexTrace', s:'Textile', r:'Fergana', st:'MVP', t:'Cotton-to-garment tracing for exporters', team:3, badges:['Arena finalist']},
  {n:'Yo\'lchi', s:'Logistics', r:'Bukhara', st:'Pilot', t:'Shared trucking for regional SMEs', team:5, badges:['Catalyst pilot']},
];
const GIGS0 = [
  {id:'g1', title:'Telegram bot for bakery orders', by:'Non Uyi bakery', kind:'SME', region:'Fergana', pay:'2M UZS', type:'Gig'},
  {id:'g2', title:'Junior Flutter developer', by:'BozorPay', kind:'Startup', region:'Andijan', pay:'Job', type:'Job'},
  {id:'g3', title:'Logo and brand kit', by:'Suvchi', kind:'Startup', region:'Khorezm', pay:'1.2M UZS', type:'Gig'},
  {id:'g4', title:'Clean 2 years of sales data', by:'AgroVodiy Holding', kind:'Company', region:'Fergana', pay:'3M UZS', type:'Gig'},
  {id:'g5', title:'Part-time sales intern', by:'Ustoz.ai', kind:'Startup', region:'Namangan', pay:'Job', type:'Job'},
];
const THREADS0 = [
  {id:'t1', who:'Bekzod Tursunov', role:'mentor', msgs:[{me:0,t:'Saw your pitch at the Arena. Want feedback on pricing?'},{me:1,t:'Yes please! Thursday after school?'},{me:0,t:'Thursday 18:00 works. Send the deck before.'}]},
  {id:'t2', who:'AgroVodiy Holding', role:'company', msgs:[{me:0,t:'Your crop-alert idea fits our AgriTech brief. Apply before 1 Dec.'}]},
  {id:'t3', who:'Startup Fest team', role:'org', msgs:[{me:0,t:'Your Startup Fest ID is ready. Show the QR at every event.'}]},
];
const DIGEST = [
  {t:'UzCombinator Season 3 is open', s:'Accelerator · deadline 30 Nov', tag:'All regions'},
  {t:'Young Entrepreneurs championship', s:'Grants up to 1B UZS · deadline 10 Dec', tag:'All regions'},
  {t:'Startup Night · Samarkand', s:'Monthly meetup · 20 Nov', tag:'Samarkand'},
  {t:'Web Summit 2027 delegation call', s:'Priority for verified members', tag:'Fast lane'},
];
const LAUNCHES = [{n:'Ustoz.ai',t:'Launched exam mode for 9th grade',v:42},{n:'BozorPay',t:'First 100 bazaar stalls onboarded',v:37},{n:'TexTrace',t:'Signed first exporter',v:21}];
const GUILDS = [
  {n:'AgriTech & Food', st:'Active', co:6, p:9},{n:'FinTech', st:'Active', co:5, p:7},{n:'Energy & Industry', st:'Active', co:7, p:11},{n:'GovTech & Regions', st:'Active', co:3, p:4},
  {n:'Textile & Fashion', st:'After 5+ pilots', co:0, p:0},{n:'Tourism & Creative', st:'After 5+ pilots', co:0, p:0},{n:'Logistics & Commerce', st:'After 5+ pilots', co:0, p:0},{n:'Health & Education', st:'After 5+ pilots', co:0, p:0},{n:'Robotics & Hardware', st:'After 5+ pilots', co:0, p:0},
];
const COUNCILS = REGIONS.map((r,i)=>({r, st: ['Samarkand','Fergana','Khorezm'].includes(r)?'Pilot council': i%4===0?'Forming':'Planned', m: [1840,620,980,1310,870,1520,640,410,760,390,450,280,1120,530][i], ev:[6,1,3,4,2,5,1,1,2,1,1,0,4,2][i]}));

/* ---------- state ---------- */
const KEY='sf-demo-v1';
let S = load() || {role:'participant', view:'home', reg:['e2'], checkins:{}, apps:[{id:'a1', brief:'b1', startup:'AgroLens', stage:0, day:0}], pipeline:seedPipe(), gigs:GIGS0, applied:[], threads:THREADS0, cur:'t1', shortlist:[], points:120, joined:false, me:null};
function seedPipe(){return [
  {id:'p1', brief:'b1', startup:'Suvchi', stage:3, day:64},{id:'p2', brief:'b1', startup:'AgroLens', stage:0, day:0},{id:'p3', brief:'b2', startup:'BozorPay', stage:4, day:100},
  {id:'p4', brief:'b2', startup:'MahallaGo', stage:1, day:0},{id:'p5', brief:'b3', startup:'VibraSense', stage:2, day:0},{id:'p6', brief:'b4', startup:'MahallaGo', stage:3, day:22},{id:'p7', brief:'b3', startup:'Yo\'lchi', stage:0, day:0}]}
function load(){try{return JSON.parse(localStorage.getItem(KEY))}catch(e){return null}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
const me = () => S.me && S.me.role===S.role ? S.me : {...ROLES[S.role].persona, role:S.role, id:idFor(S.role)};
function idFor(role){return 'SF-27-'+String({participant:317,mentor:634,investor:951,company:1268,org:1585}[role]).padStart(5,'0')}
const initials = n => n.split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();

/* ---------- nav ---------- */
const NAV = {
  participant:['home','events','catalyst','earn','messages','community','me'],
  mentor:['home','events','directory','messages','community','me'],
  investor:['home','directory','events','messages','community','me'],
  company:['home','catalyst','earn','directory','messages','community','me'],
  org:['admin','events','catalyst','directory','community','messages','me'],
};
const LABEL = {home:'Home',events:'Events',catalyst:'Catalyst',earn:'Startup Earn',directory:'Startups',messages:'Messages',community:'Community',me:'My ID',admin:'Dashboard'};
function renderTabs(){
  const unread = S.threads.filter(t=>!t.read && t.id!==S.cur).length;
  document.getElementById('tabs').innerHTML = NAV[S.role].map(k=>`<button class="tab" data-go="${k}" ${S.view===k?'aria-current="page"':''}>${icon(k)}<span>${LABEL[k]}</span>${k==='messages'&&unread?`<span class="badge">${unread}</span>`:''}</button>`).join('');
}

/* ---------- views ---------- */
const V = {};
V.home = () => {
  const m = me(), r = S.role;
  const rec = {participant:['Apply to the AgriTech Catalyst brief','Register for Startup Night · Samarkand','2 gigs match your skills'],
    mentor:['3 founders asked for office hours','Judge at Startup Night · Samarkand','Log your mentoring hours (24 this year)'],
    investor:['4 new startups match AgriTech + FinTech','VC Battle · 12 Dec · seat reserved','Request a curated shortlist'],
    company:['7 applications to your AgriTech brief','Suvchi pilot: day 64 of 100','Post a gig for student builders']}[r] || [];
  return `
  <section class="hero curtain">
    <div class="txt">
      <div class="row" style="gap:8px">${SPARK}<span class="eyebrow" style="color:#fff;opacity:.9">Salom, ${esc(m.name.split(' ')[0])}</span></div>
      <h1>From every region,<br>into every industry</h1>
      <p style="margin:0;max-width:46ch;opacity:.92">${{participant:'Your next step: a Catalyst brief, a gig, or the National Final.',mentor:'Founders near you need your hours this week.',investor:'Curated deal flow from 14 regions.',company:'Real problems in, signed pilots out.'}[r]}</p>
      <div class="row"><button class="btn light" data-go="${r==='company'?'catalyst':r==='investor'?'directory':'events'}">${r==='company'?'Open my briefs':r==='investor'?'See deal flow':'See this month\'s events'}</button>
        <button class="btn ghost" style="color:#fff;box-shadow:inset 0 0 0 1.5px #fff" data-go="me">My Startup Fest ID</button></div>
    </div>
    <div class="photo" style="background-image:url(${HERO})" role="img" aria-label="Startup Fest stage at a Catalyst event"></div>
    <div class="kpis" style="grid-column:1/-1">
      <div class="kpi"><b class="num">12,480</b><span>members with an ID</span></div>
      <div class="kpi"><b class="num">14</b><span>regions</span></div>
      <div class="kpi"><b class="num">${BRIEFS.length}</b><span>open Catalyst briefs</span></div>
      <div class="kpi"><b class="num">$410K</b><span>deals via Catalyst</span></div>
    </div>
  </section>
  <div class="sec-h"><h2>This week</h2><span class="muted">Fresh every Monday, Wednesday and Thursday</span></div>
  <div class="grid g3">
    <div class="card pad day"><div class="d">MON</div><div class="stack" style="gap:6px"><b>Opportunities digest</b>
      <div class="list">${DIGEST.map(x=>`<div class="it"><div class="grow"><div class="t">${esc(x.t)}</div><div class="s">${esc(x.s)}</div></div><span class="chip ${x.tag==='Fast lane'?'red':''}">${esc(x.tag)}</span></div>`).join('')}</div></div></div>
    <div class="card pad day"><div class="d">WED</div><div class="stack"><b>Problem of the week</b>
      <div class="chip red" style="align-self:start">${esc(BRIEFS[2].guild)}</div>
      <div style="font-size:17px;font-weight:600">${esc(BRIEFS[2].problem)}</div>
      <div class="muted" style="font-size:13px">${esc(BRIEFS[2].co)} · owner: ${esc(BRIEFS[2].owner)} · ${esc(BRIEFS[2].budget)}</div>
      <button class="btn sm" style="align-self:start" data-go="catalyst">View brief</button></div></div>
    <div class="card pad day"><div class="d">THU</div><div class="stack" style="gap:6px"><b>Member launches</b>
      <div class="list">${LAUNCHES.map((x,i)=>`<div class="it"><div class="grow"><div class="t">${esc(x.n)}</div><div class="s">${esc(x.t)}</div></div><button class="btn ghost sm" data-up="${i}" aria-label="Upvote ${esc(x.n)}">▲ <span class="num">${x.v}</span></button></div>`).join('')}</div></div></div>
  </div>
  ${rec.length?`<div class="sec-h"><h2>For you</h2></div><div class="grid g3">${rec.map(t=>`<div class="card pad row hover">${SPARK.replace('class="spark"','class="spark" style="color:var(--red)"')}<span style="font-weight:600">${esc(t)}</span></div>`).join('')}</div>`:''}
  <div class="sec-h"><h2>The fast lane</h2><span class="muted">What a verified ID unlocks</span></div>
  <div class="grid g3">
    ${[['Priority review','At UzCombinator and Yoshlar Ventures pitch days'],['International delegations','Web Summit, Slush, TechCrunch Disrupt'],['Direct path','From your regional stage to the National Final in June']].map(([a,b])=>`<div class="card pad pin"><div class="eyebrow" style="color:var(--red)">Fast lane</div><div style="font-weight:700;font-size:17px;margin-top:4px">${a}</div><div class="muted">${b}</div></div>`).join('')}
  </div>`;
};
V.events = () => {
  const f = S.evf || 'All';
  const types = ['All', ...new Set(EVENTS.map(e=>e.type))];
  const list = EVENTS.filter(e=>f==='All'||e.type===f);
  const org = S.role==='org';
  return `<div class="sec-h" style="margin-top:0"><h2>Events</h2>
    <div class="filters"><label class="muted" for="evf" style="align-self:center">Type</label><select id="evf">${types.map(t=>`<option ${t===f?'selected':''}>${t}</option>`).join('')}</select></div></div>
  ${org?`<div class="card pad row between" style="margin-bottom:16px"><div><b>Check-in mode</b><div class="muted">Scan a member QR, or tap check-in below. Each check-in counts toward monthly active members.</div></div><span class="chip ok num">${Object.values(S.checkins).reduce((a,b)=>a+b,0)} checked in today</span></div>`:''}
  <div class="grid g2">${list.map(e=>{const reg=S.reg.includes(e.id); const pct=Math.round((e.taken+(reg?1:0))/e.seats*100);
    return `<div class="card pad ev hover"><div class="date"><b>${e.d}</b><span>${e.m}</span></div><div class="stack" style="gap:8px">
      <div class="row between"><span class="chip ${e.type==='Catalyst'?'red':''}">${esc(e.type)}</span><span class="muted num" style="font-size:13px">${e.taken+(reg?1:0)}/${e.seats} seats</span></div>
      <div style="font-weight:700;font-size:17px">${esc(e.title)}</div><div class="muted">${esc(e.place)}</div>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <div class="row">${org?`<button class="btn sm" data-checkin="${e.id}">Check in a member</button><span class="muted num">${S.checkins[e.id]||0} today</span>`
        : reg?`<span class="chip ok">Registered · show your QR</span><button class="btn ghost sm" data-unreg="${e.id}">Cancel</button>`:`<button class="btn sm" data-reg="${e.id}">Register with my ID</button>`}</div></div></div>`}).join('')}</div>`;
};
const briefCard = (b, cta) => `<div class="card pad stack hover"><div class="row between"><span class="chip red">${esc(b.guild)}</span><span class="muted" style="font-size:13px">Apply by ${esc(b.due)}</span></div>
  <div style="font-weight:700;font-size:17px">${esc(b.problem)}</div>
  <div class="row" style="gap:6px"><span class="chip">${esc(b.co)}</span><span class="chip">Owner: ${esc(b.owner)}</span><span class="chip money">${esc(b.budget)}</span></div>${cta||''}</div>`;
function kanban(items){return `<div class="kanban">${STAGES.map((st,i)=>{const col=items.filter(p=>p.stage===i);return `<div class="col"><h4><span>${st}</span><span class="muted num">${col.length}</span></h4>
  ${col.map(p=>{const b=BRIEFS.find(x=>x.id===p.brief);return `<div class="kc"><b>${esc(p.startup)}</b><span class="muted" style="font-size:12px">${esc(b.co)} · ${esc(b.guild)}</span>
  ${i===3?`<div class="bar"><i style="width:${p.day}%"></i></div><span class="muted num" style="font-size:12px">Day ${p.day} of 100</span>`:''}
  ${i===4?'<span class="chip ok" style="align-self:start">Contract signed</span>':(S.role!=='participant'?`<button class="btn ghost sm" style="align-self:start" data-adv="${p.id}">Move to ${STAGES[i+1]}</button>`:'')}</div>`}).join('')||'<span class="muted" style="font-size:12px;padding:4px">None yet</span>'}</div>`}).join('')}</div>`}
V.catalyst = () => {
  const r=S.role;
  if (r==='participant'){
    const mine=S.apps;
    return `<div class="sec-h" style="margin-top:0"><h2>Catalyst</h2><span class="muted">Real problems. Named owner. Pilot budget.</span></div>
    ${mine.length?`<div class="card pad" style="margin-bottom:18px"><div class="eyebrow">My applications</div>${mine.map(a=>{const b=BRIEFS.find(x=>x.id===a.brief);return `<div class="stack" style="gap:8px;margin-top:10px"><div class="row between"><b>${esc(a.startup)} → ${esc(b.co)}</b><span class="chip warn">${STAGES[a.stage]}</span></div>
      <div class="row" style="gap:4px">${STAGES.map((s,i)=>`<span class="chip ${i<=a.stage?'red':''}" style="font-size:11px">${s}</span>`).join('')}</div></div>`}).join('')}</div>`:''}
    <div class="grid g2">${BRIEFS.map(b=>briefCard(b, S.apps.some(a=>a.brief===b.id)?'<span class="chip ok" style="align-self:start">Applied</span>':`<button class="btn sm" style="align-self:start" data-apply="${b.id}">Apply with my startup</button>`)).join('')}</div>`;
  }
  const items = r==='company'?S.pipeline.filter(p=>p.brief==='b1'):S.pipeline;
  const signed = S.pipeline.filter(p=>p.stage===4).length;
  return `<div class="sec-h" style="margin-top:0"><h2>${r==='company'?'My Catalyst pipeline':'Catalyst pipeline'}</h2>
    ${r==='company'?'<button class="btn" data-brief="new">Post a new brief</button>':`<span class="chip ok num">${signed} contracts signed · ${S.pipeline.filter(p=>p.stage===3).length} pilots running</span>`}</div>
  ${kanban(items)}
  <div class="sec-h"><h2>${r==='company'?'My open briefs':'Open briefs'}</h2></div>
  <div class="grid g2">${(r==='company'?BRIEFS.filter(b=>b.co==='AgroVodiy Holding'):BRIEFS).map(b=>briefCard(b,`<span class="muted" style="font-size:13px">${S.pipeline.filter(p=>p.brief===b.id).length} startups in the pipeline</span>`)).join('')}</div>`;
};
V.earn = () => {
  const f=S.earnf||'All';
  const list=S.gigs.filter(g=>f==='All'||g.type===f);
  return `<div class="sec-h" style="margin-top:0"><h2>Startup Earn</h2><div class="row">
    <div class="filters">${['All','Gig','Job'].map(t=>`<button class="btn sm ${t===f?'':'ghost'}" data-earnf="${t}">${t==='All'?'All':t+'s'}</button>`).join('')}</div>
    ${S.role!=='participant'?'<button class="btn" data-post="1">Post a gig</button>':''}</div></div>
  <p class="muted" style="margin:-4px 0 16px">Startups, SMEs and companies post paid work. Members earn, build a track record, and get hired.</p>
  <div class="grid g3">${list.map(g=>`<div class="card pad stack hover"><div class="row between"><span class="chip">${esc(g.kind)} · ${esc(g.region)}</span><span class="chip ${g.pay==='Job'?'red':'money'}">${esc(g.pay)}</span></div>
    <div style="font-weight:700;font-size:17px">${esc(g.title)}</div><div class="muted">by ${esc(g.by)}</div>
    ${S.applied.includes(g.id)?'<span class="chip ok" style="align-self:start">Applied · they\'ll message you</span>':`<button class="btn sm" style="align-self:start" data-take="${g.id}">${g.type==='Job'?'Apply':'Take this gig'}</button>`}</div>`).join('')}</div>`;
};
V.directory = () => {
  const sec=S.dsec||'All', reg=S.dreg||'All';
  const sectors=['All',...new Set(STARTUPS.map(s=>s.s))];
  const list=STARTUPS.filter(s=>(sec==='All'||s.s===sec)&&(reg==='All'||s.r===reg));
  const canPick = S.role==='investor'||S.role==='company'||S.role==='org';
  return `<div class="sec-h" style="margin-top:0"><h2>Startups</h2><div class="filters">
    <select id="dsec" aria-label="Sector">${sectors.map(t=>`<option ${t===sec?'selected':''}>${t}</option>`).join('')}</select>
    <select id="dreg" aria-label="Region"><option>All</option>${REGIONS.map(t=>`<option ${t===reg?'selected':''}>${t}</option>`).join('')}</select></div></div>
  ${canPick?`<div class="card pad row between" style="margin-bottom:16px"><div><b>Recommendations for your selection</b><div class="muted">Pick startups, then ask the Startup Fest team for a curated shortlist with intros. Startups opt in to be recommended.</div></div>
    <button class="btn" data-shortlist="1" ${S.shortlist.length?'':'disabled'}>Request shortlist (${S.shortlist.length})</button></div>`:''}
  <div class="grid g3">${list.map(s=>`<div class="card pad stack hover"><div class="row between"><b style="font-size:17px">${esc(s.n)}</b><span class="chip">${esc(s.st)}</span></div>
    <div>${esc(s.t)}</div><div class="row" style="gap:6px"><span class="chip red">${esc(s.s)}</span><span class="chip">${esc(s.r)}</span><span class="chip">Team of ${s.team}</span>${s.badges.map(b=>`<span class="chip ok">${esc(b)}</span>`).join('')}</div>
    <div class="row">${canPick?`<button class="btn ${S.shortlist.includes(s.n)?'':'ghost'} sm" data-pick="${esc(s.n)}">${S.shortlist.includes(s.n)?'✓ Picked':'Pick'}</button>`:''}<button class="btn ghost sm" data-intro="${esc(s.n)}">${S.role==='mentor'?'Offer office hours':'Request intro'}</button></div></div>`).join('')||'<div class="card empty">No startups match these filters yet.</div>'}</div>`;
};
V.messages = () => {
  const t=S.threads.find(x=>x.id===S.cur)||S.threads[0];
  return `<div class="sec-h" style="margin-top:0"><h2>Messages</h2><span class="muted">Founders, companies, mentors and investors in one place</span></div>
  <div class="card chat" style="overflow:hidden"><div class="threads">${S.threads.map(x=>`<button class="th" data-thread="${x.id}" aria-current="${x.id===t.id}"><span class="mini" style="background:${ROLES[x.role].color}">${initials(x.who)}</span>
    <span style="min-width:0"><b>${esc(x.who)}</b><br><span class="muted" style="font-size:13px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(x.msgs[x.msgs.length-1].t)}</span></span></button>`).join('')}</div>
  <div class="msgs"><div class="row" style="padding:12px 16px;border-bottom:1px solid var(--line)"><span class="mini" style="background:${ROLES[t.role].color}">${initials(t.who)}</span><div><b>${esc(t.who)}</b><div class="muted" style="font-size:12px">${ROLES[t.role].label}</div></div></div>
    <div class="scroll" id="scroll">${t.msgs.map(m=>`<div class="bubble ${m.me?'me':''}">${esc(m.t)}</div>`).join('')}</div>
    <form class="compose" id="compose"><label for="msg" hidden>Message</label><input id="msg" placeholder="Write a message…" autocomplete="off"><button class="btn">Send</button></form></div></div>`;
};
V.community = () => `<div class="sec-h" style="margin-top:0"><h2>Industry guilds</h2><span class="muted">Catalyst by sector. A new guild opens after 5+ pilots.</span></div>
  <div class="grid g3">${GUILDS.map(g=>`<div class="card pad stack ${g.st==='Active'?'':'pin'}"><div class="row between"><b style="font-size:17px">${esc(g.n)}</b><span class="chip ${g.st==='Active'?'ok':''}">${g.st}</span></div>
   ${g.st==='Active'?`<div class="row muted num" style="font-size:13px"><span>${g.co} member companies</span><span>·</span><span>${g.p} pilots</span></div>`:'<div class="muted" style="font-size:13px">Opens when the active guilds prove the model</div>'}</div>`).join('')}</div>
  <div class="sec-h"><h2>Regional councils</h2><span class="muted">One table per region · max 2 seats per sector · 1-year terms</span></div>
  <div class="card tablewrap"><table><thead><tr><th>Region</th><th>Council</th><th>Members</th><th>Events this month</th></tr></thead>
  <tbody>${COUNCILS.map(c=>`<tr><td><b>${esc(c.r)}</b></td><td><span class="chip ${c.st==='Pilot council'?'ok':c.st==='Forming'?'warn':''}">${c.st}</span></td><td class="num">${fmt(c.m)}</td><td class="num">${c.ev}</td></tr>`).join('')}</tbody></table></div>`;
V.me = () => {
  const m=me(), R=ROLES[S.role];
  const badges={participant:['Arena finalist','Crew','Catalyst applicant'],mentor:['Judge','Mentor · 24h','Champion'],investor:['Verified investor','VC Battle'],company:['Guild member','Catalyst host'],org:['Core team']}[S.role];
  const log=[['Registered for Startup Night · Samarkand','+10'],['Applied to AgriTech Catalyst','+25'],['Checked in at Regional Arena','+15'],['Upvoted 3 launches','+3']];
  return `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr));align-items:start">
  <div class="stack" style="align-items:center">
    <div class="idcard" style="--idc:${R.color}"><div class="head"><div><div class="role">${R.label.toUpperCase()}</div><div class="sub">STARTUP FEST ID</div></div>${SPARK.replace('spark','spark" style="width:22px;height:22px')}</div>
      <div class="body"><div class="avatar">${initials(m.name)}</div><div style="font-weight:700;font-size:19px">${esc(m.name)}</div><div class="muted" style="font-size:13px">${esc(m.region)} · ${esc(m.line||'')}</div>
      <div class="row" style="justify-content:center;gap:6px">${badges.map(b=>`<span class="chip" style="color:${R.color}">${esc(b)}</span>`).join('')}</div>
      <div class="qr" id="qr" aria-label="QR code for ${esc(m.id)}"></div><div class="mono muted">${esc(m.id)}</div></div></div>
    <p class="muted" style="text-align:center;max-width:34ch;margin:0">Show this QR at any Startup Fest event to check in. Your badges and points update automatically.</p>
  </div>
  <div class="stack">
    <div class="card pad row between"><div><div class="eyebrow">Points</div><div class="display" style="font-size:44px;color:var(--red)">${S.points}</div></div>
      <div style="flex:1;min-width:180px"><div class="row between muted" style="font-size:13px"><span>Next: Contributor</span><span class="num">${S.points}/200</span></div><div class="bar" style="margin-top:6px"><i style="width:${Math.min(100,S.points/2)}%"></i></div>
      <div class="muted" style="font-size:12px;margin-top:6px">Member → Contributor → Host → Champion → Fellow</div></div></div>
    <div class="card pad"><div class="eyebrow">Activity</div><div class="list" style="margin-top:6px">${log.map(([a,b])=>`<div class="it"><div class="grow">${a}</div><span class="chip red num">${b}</span></div>`).join('')}</div></div>
    <div class="card pad row between"><div><b>New here?</b><div class="muted">Create your own ID to see the sign-up flow.</div></div><button class="btn" data-join="1">Get a Startup Fest ID</button></div>
  </div></div>`;
};
V.admin = () => {
  const signed=S.pipeline.filter(p=>p.stage===4).length, running=S.pipeline.filter(p=>p.stage===3).length;
  const tiles=[['12,480','members with an ID'],['3,920','monthly active'],[String(running),'pilots running'],[String(signed),'contracts signed'],['22','paying companies'],['$410K','value to members']];
  return `<div class="sec-h" style="margin-top:0"><h2>Community dashboard</h2><span class="muted">North stars: monthly active members and value members gained</span></div>
  <div class="grid g3">${tiles.map(([a,b],i)=>`<div class="card pad tile ${i<2?'':'pin'}"><b class="num">${a}</b><span class="muted">${b}</span></div>`).join('')}</div>
  <div class="sec-h"><h2>Regions</h2><span class="muted">Ranked by monthly active members</span></div>
  <div class="card tablewrap"><table><thead><tr><th>#</th><th>Region</th><th>Members</th><th>Events / month</th><th>Council</th></tr></thead>
  <tbody>${[...COUNCILS].sort((a,b)=>b.m-a.m).map((c,i)=>`<tr><td class="num">${i+1}</td><td><b>${esc(c.r)}</b></td><td class="num">${fmt(c.m)}</td><td class="num">${c.ev}</td><td><span class="chip ${c.st==='Pilot council'?'ok':c.st==='Forming'?'warn':''}">${c.st}</span></td></tr>`).join('')}</tbody></table></div>
  <p class="muted" style="font-size:13px">All figures are sample data for the demo.</p>`;
};

/* ---------- modals ---------- */
function modal(html){document.getElementById('layer').innerHTML=`<div class="scrim" data-close="1"><div class="card pad modal stack" role="dialog" aria-modal="true">${html}</div></div>`;
  const f=document.querySelector('.modal input,.modal select,.modal textarea'); f&&f.focus()}
function closeModal(){document.getElementById('layer').innerHTML=''}
function toast(t){const el=document.createElement('div');el.className='toast';el.textContent=t;document.body.appendChild(el);setTimeout(()=>el.remove(),2600)}
const joinForm = () => modal(`<h3>Get your Startup Fest ID</h3><p class="muted" style="margin:0">One ID for every event, application and gig.</p>
  <form id="joinf" class="stack"><div class="field"><label for="j-name">Full name</label><input id="j-name" required placeholder="e.g. Sardor Aliyev"></div>
  <div class="field"><label for="j-role">I am a</label><select id="j-role">${Object.entries(ROLES).filter(([k])=>k!=='org').map(([k,v])=>`<option value="${k}" ${k===S.role?'selected':''}>${v.label}</option>`).join('')}</select></div>
  <div class="field"><label for="j-reg">Region</label><select id="j-reg">${REGIONS.map(r=>`<option>${r}</option>`).join('')}</select></div>
  <div class="field"><label for="j-line">Track or focus</label><input id="j-line" placeholder="e.g. University track · AgriTech"></div>
  <label class="row" style="font-size:13px;gap:8px"><input type="checkbox" id="j-ok" checked> Startup Fest may recommend my startup to partners</label>
  <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-close="1">Cancel</button><button class="btn">Create my ID</button></div></form>`);
const applyForm = id => {const b=BRIEFS.find(x=>x.id===id); modal(`<h3>Apply to ${esc(b.co)}</h3><p style="margin:0;font-weight:600">${esc(b.problem)}</p>
  <form id="applyf" data-b="${id}" class="stack"><div class="field"><label for="a-st">Startup</label><input id="a-st" required value="AgroLens"></div>
  <div class="field"><label for="a-sol">Your solution in two lines</label><textarea id="a-sol" required>Drone photos and a phone app that flag water stress per field, so irrigation runs only where needed.</textarea></div>
  <div class="field"><label for="a-team">Team size</label><select id="a-team"><option>1</option><option>2</option><option selected>3</option><option>4+</option></select></div>
  <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-close="1">Cancel</button><button class="btn">Send application</button></div></form>`)};
const postForm = () => modal(`<h3>Post a gig</h3><form id="postf" class="stack"><div class="field"><label for="p-title">What do you need?</label><input id="p-title" required placeholder="e.g. Instagram ads for our shop"></div>
  <div class="field"><label for="p-type">Type</label><select id="p-type"><option>Gig</option><option>Job</option></select></div>
  <div class="field"><label for="p-pay">Pay (UZS)</label><input id="p-pay" placeholder="e.g. 1.5M UZS"></div>
  <div class="field"><label for="p-reg">Region</label><select id="p-reg">${REGIONS.map(r=>`<option>${r}</option>`).join('')}</select></div>
  <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-close="1">Cancel</button><button class="btn">Publish gig</button></div></form>`);
const briefForm = () => modal(`<h3>Post a Catalyst brief</h3><p class="muted" style="margin:0">Briefs need a named owner and a pilot budget before they go live.</p>
  <form id="brieff" class="stack"><div class="field"><label for="br-p">Problem</label><textarea id="br-p" required placeholder="What hurts, and how you measure it today"></textarea></div>
  <div class="field"><label for="br-o">Owner (role)</label><input id="br-o" required placeholder="e.g. Head of Logistics"></div>
  <div class="field"><label for="br-b">Pilot budget</label><input id="br-b" required placeholder="e.g. 40M UZS"></div>
  <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-close="1">Cancel</button><button class="btn">Submit for review</button></div></form>`);

/* ---------- render + events ---------- */
function render(){
  if(!NAV[S.role].includes(S.view)) S.view=NAV[S.role][0];
  document.getElementById('role').value=S.role; renderTabs();
  document.getElementById('view').innerHTML=V[S.view]();
  if(S.view==='me'){const q=document.getElementById('qr'); if(q&&window.QRCode){new QRCode(q,{text:'STARTUPFEST:'+me().id,width:220,height:220,colorDark:'#1C1514',colorLight:'#ffffff'})} else if(q){q.innerHTML='<span class="mono">QR</span>'}}
  if(S.view==='messages'){const sc=document.getElementById('scroll'); if(sc) sc.scrollTop=sc.scrollHeight}
  save();
}
const go = v => {S.view=v; render(); window.scrollTo({top:0})};
document.getElementById('role').addEventListener('change',e=>{S.role=e.target.value; S.view=NAV[S.role][0]; render(); toast('Now viewing as '+ROLES[S.role].label)});
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-go],[data-reg],[data-unreg],[data-checkin],[data-apply],[data-adv],[data-earnf],[data-post],[data-take],[data-pick],[data-shortlist],[data-intro],[data-thread],[data-join],[data-close],[data-up],[data-brief]');
  if(!t) return; const d=t.dataset;
  if(d.close!==undefined && (e.target===t)){closeModal();return}
  if(d.close!==undefined) return;
  if(d.go) return go(d.go);
  if(d.reg){S.reg.push(d.reg);S.points+=10;toast('Registered. Show your QR at the door.');return render()}
  if(d.unreg){S.reg=S.reg.filter(x=>x!==d.unreg);toast('Registration cancelled');return render()}
  if(d.checkin){S.checkins[d.checkin]=(S.checkins[d.checkin]||0)+1;toast('Checked in · +15 points to the member');return render()}
  if(d.apply) return applyForm(d.apply);
  if(d.adv){const p=S.pipeline.find(x=>x.id===d.adv); if(p&&p.stage<4){p.stage++; if(p.stage===3)p.day=1; if(p.stage===4)p.day=100; toast(p.startup+' → '+STAGES[p.stage])} return render()}
  if(d.earnf){S.earnf=d.earnf;return render()}
  if(d.post) return postForm();
  if(d.brief) return briefForm();
  if(d.take){S.applied.push(d.take);S.points+=5;toast('Sent. The poster will message you.');return render()}
  if(d.pick){S.shortlist=S.shortlist.includes(d.pick)?S.shortlist.filter(x=>x!==d.pick):[...S.shortlist,d.pick];return render()}
  if(d.shortlist){toast('Shortlist request sent to the Startup Fest team');S.shortlist=[];return render()}
  if(d.intro){const id='t'+Date.now();S.threads.unshift({id,who:d.intro+' team',role:'participant',msgs:[{me:1,t:S.role==='mentor'?'Hi! I can offer office hours this week. When suits you?':'Hi! I found you on Startup Fest and would like an intro.'}]});S.cur=id;toast('Intro request sent');return go('messages')}
  if(d.thread){S.cur=d.thread;const th=S.threads.find(x=>x.id===d.thread);th.read=true;return render()}
  if(d.join) return joinForm();
  if(d.up!==undefined){LAUNCHES[+d.up].v++;S.points+=1;t.disabled=true;t.querySelector('span').textContent=LAUNCHES[+d.up].v;return}
});
document.addEventListener('change',e=>{
  if(e.target.id==='evf'){S.evf=e.target.value;render()}
  if(e.target.id==='dsec'){S.dsec=e.target.value;render()}
  if(e.target.id==='dreg'){S.dreg=e.target.value;render()}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
document.addEventListener('submit',e=>{
  e.preventDefault(); const f=e.target;
  if(f.id==='compose'){const v=f.querySelector('#msg').value.trim(); if(!v)return; const th=S.threads.find(x=>x.id===S.cur); th.msgs.push({me:1,t:v}); render(); document.getElementById('msg').focus();
    setTimeout(()=>{th.msgs.push({me:0,t:'Thanks! Let\'s talk on Thursday.'}); if(S.view==='messages')render()},1200); return}
  if(f.id==='joinf'){const role=f.querySelector('#j-role').value; S.me={name:f.querySelector('#j-name').value.trim()||'New member', role, region:f.querySelector('#j-reg').value, line:f.querySelector('#j-line').value.trim()||ROLES[role].label, id:'SF-27-'+String(Math.floor(10000+Math.random()*89999))};
    S.role=role; closeModal(); toast('Your ID is ready'); return go('me')}
  if(f.id==='applyf'){S.apps.push({id:'a'+Date.now(),brief:f.dataset.b,startup:f.querySelector('#a-st').value.trim()||'My startup',stage:0,day:0}); S.points+=25; closeModal(); toast('Application sent. Track it here.'); return render()}
  if(f.id==='postf'){const ty=f.querySelector('#p-type').value; S.gigs.unshift({id:'g'+Date.now(),title:f.querySelector('#p-title').value.trim(),by:me().name,kind:ROLES[S.role].label,region:f.querySelector('#p-reg').value,pay:ty==='Job'?'Job':(f.querySelector('#p-pay').value.trim()||'Paid'),type:ty}); closeModal(); toast('Gig published'); return render()}
  if(f.id==='brieff'){closeModal(); toast('Brief sent for review. It goes live after the owner and budget are confirmed.'); return}
});
render();
})();
