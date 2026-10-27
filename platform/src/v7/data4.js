// v4 data: website look, guilds and paying partners. Prices are example figures for the demo.
SF.VERSION = 'v4';
SF.STAR_PATH = 'M46.3584 78.6802L54.5392 23.668L85.2176 59.4899L161.573 15.9919L159.527 44.7773L224.974 0L140.439 90.834V49.2551L107.033 87.6356L135.666 134.972L76.3549 123.457L38.8592 158L43.6314 113.223L0 106.186L46.3584 78.6802Z';
SF.STAR = (w = 34, color = 'currentColor') => `<svg class="star" viewBox="0 0 225 158" width="${w}" height="${Math.round(w * 158 / 225)}" aria-hidden="true" style="width:${w}px;height:${Math.round(w * 158 / 225)}px"><path fill="${color}" d="${SF.STAR_PATH}"/></svg>`;
SF.SPARK = SF.STAR(22);
SF.ARROW = '<span class="arrow"><img src="assets/img/vector9.svg" alt=""></span>';

SF.slug = s => String(s).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
SF.TIERS = [
  { id: 'member', name: 'Guild member', price: 60e6, per: 'year', who: 'company', perks: ['1 industry guild', '2 Catalyst briefs a year', 'Quarterly curated pitch session', 'Talent board and Startup Earn posting'] },
  { id: 'anchor', name: 'Guild anchor', price: 250e6, per: 'year', who: 'company', top: true, perks: ['Lead one guild as co-chair', '6 Catalyst briefs a year', 'One hosted Catalyst day included', 'Seat on a regional council', 'Logo on the National Final stage'] },
  { id: 'national', name: 'National partner', price: 800e6, per: 'year', who: 'company', perks: ['All guilds', 'Unlimited Catalyst briefs', 'National Final partner', 'Quarterly impact report for your board'] },
];
SF.SME_PLANS = [
  { id: 'sme-start', name: 'SME Start', price: 0, per: 'free', perks: ['Post 1 local problem a quarter', 'Post gigs on Startup Earn'] },
  { id: 'sme-access', name: 'SME Access', price: 1.5e6, per: 'month', top: true, perks: ['Access to startups and student builders', '1 Catalyst seat a quarter', 'Priority on Startup Earn'] },
  { id: 'host', name: 'Host a Catalyst day', price: 29.5e6, per: 'event', perks: ['For medium businesses', 'Event costs + 18% service fee', 'Teams solve your problem on site', 'Winners can start a 100-day pilot'] },
];
SF.SCOUT_PLANS = [
  { id: 'shortlist', name: 'Shortlist', price: 5e6, per: 'shortlist', perks: ['10 vetted startups for your selection', 'Only startups that opted in', 'Intros by the Startup Fest team'] },
  { id: 'retainer', name: 'Scouting retainer', price: 40e6, per: 'year', top: true, perks: ['A shortlist every month', 'Early look at season finalists', 'Quarterly market brief'] },
];
SF.ALL_PLANS = [...SF.TIERS, ...SF.SME_PLANS, ...SF.SCOUT_PLANS];
SF.GUILD_MEMBERS = {
  'AgriTech & Food': [['Khorezm Agro Cluster', 'anchor'], ['AgroVodiy Holding', 'member'], ['Agrobank', 'member'], ['Samarkand Fruit Export', 'member'], ['Navbahor Seeds', 'member'], ['Toshkent Dairy', 'member']],
  'FinTech': [['Silk Road Bank', 'anchor'], ['Payme', 'member'], ['Aloqa Ventures', 'member'], ['Uzum Bank', 'member'], ['Kapital Leasing', 'member']],
  'Energy & Industry': [['Hududgazta‘minot', 'anchor'], ['Navoi Metals', 'member'], ['Imzo', 'member'], ['UzAuto Motors', 'member'], ['Termo Plus', 'member'], ['Fergana Oil Refinery', 'member'], ['Tractor Works', 'member']],
  'GovTech & Regions': [['Fergana Region Admin', 'anchor'], ['Samarkand City Hall', 'member'], ['Digital Uzbekistan Lab', 'member']],
};
SF.PAY_METHODS = [['click', 'Click'], ['payme', 'Payme'], ['invoice', 'Bank transfer (invoice)']];
SF.TRACK_OPTIONS = ['AI & Software Agents', 'FinTech', 'AgriTech', 'Robotics & Hardware', 'EdTech', 'GovTech', 'Creative & Media'];
SF.LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];
SF.PROGRAMS = ['Catalyst', 'Startup and Engineering Festival', 'Season 2027'];

SF.ROADMAP.forEach(r => { if (r[0] === 'v3') r[3] = 'done'; if (r[0] === 'v4') { r[3] = 'now'; r[2] = 'The website’s design across the app; guild pages; company membership tiers, SME and scouting plans with a mock Click/Payme checkout; invoices; a partner dashboard showing return on membership; revenue on the org dashboard.'; } if (r[0] === 'v5') r[3] = 'next'; });

const fe0 = SF.freshExtra;
SF.freshExtra = () => ({
  ...fe0(),
  subs: { 'AgroVodiy Holding': { plan: 'member', guild: 'AgriTech & Food', since: 'Mar 2026', renews: 'Mar 2027' }, 'Silk Road Bank': { plan: 'retainer', since: 'Jun 2026', renews: 'Jun 2027' } },
  invoices: [
    { id: 'INV-2026-014', to: 'AgroVodiy Holding', plan: 'member', amount: 60e6, status: 'Paid', method: 'Click', date: '12 Mar 2026' },
    { id: 'INV-2026-031', to: 'Silk Road Bank', plan: 'retainer', amount: 40e6, status: 'Paid', method: 'Bank transfer (invoice)', date: '3 Jun 2026' },
    { id: 'INV-2026-047', to: 'AgroVodiy Holding', plan: 'host', amount: 29.5e6, status: 'Due', method: 'Bank transfer (invoice)', date: '2 Nov 2026' },
    { id: 'INV-2026-052', to: 'Navoi Metals', plan: 'member', amount: 60e6, status: 'Paid', method: 'Payme', date: '18 Sep 2026' },
    { id: 'INV-2026-055', to: 'Khorezm Agro Cluster', plan: 'anchor', amount: 250e6, status: 'Paid', method: 'Bank transfer (invoice)', date: '1 Oct 2026' },
  ],
});
