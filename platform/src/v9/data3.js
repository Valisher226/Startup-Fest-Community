// v3 sample data: the season, regional councils, startup profiles, gig lifecycle
SF.TRACKS = ['School / college', 'University'];
SF.SEASON_STAGES = [
  { k: 'campus', name: 'Campus round', when: 'February–March', about: 'Schools, colleges and universities run qualifiers with the Startup Fest kit.' },
  { k: 'regional', name: 'Regional stage', when: 'June · Youth Month caravan', about: 'The caravan visits all 14 regions. The best team per track goes to the final.' },
  { k: 'final', name: 'National Final', when: 'Last day of the festival', about: 'All regional finalists plus Startup Weekend wildcards compete for the prize pool.' },
];
SF.PRIZE_UZS = 500000000;
// teams in the 2027 season (points from campus round + regional stage)
SF.TEAMS = [
  ['AgroLens', 'Samarkand', 'School / college', 412], ['Ipak Code', 'Samarkand', 'University', 398], ['Registon AR', 'Samarkand', 'University', 351],
  ['Suvchi', 'Khorezm', 'University', 405], ['Xiva Tours', 'Khorezm', 'School / college', 288], ['BozorPay', 'Andijan', 'University', 430],
  ['Andijan Robotics', 'Andijan', 'School / college', 377], ['TexTrace', 'Fergana', 'University', 389], ['Qo‘qon Craft', 'Fergana', 'School / college', 302],
  ['Ustoz.ai', 'Namangan', 'University', 444], ['Gul Market', 'Namangan', 'School / college', 266], ["Yo'lchi", 'Bukhara', 'University', 371],
  ['Buxoro Eco', 'Bukhara', 'School / college', 249], ['VibraSense', 'Navoi', 'University', 318], ['MahallaGo', 'Tashkent city', 'University', 421],
  ['Kids Coders', 'Tashkent city', 'School / college', 344], ['Orol Water', 'Karakalpakstan', 'University', 336], ['Nukus Bots', 'Karakalpakstan', 'School / college', 291],
  ['Qarshi Agro', 'Kashkadarya', 'School / college', 274], ['Termiz Med', 'Surkhandarya', 'University', 259], ['Jizzax Solar', 'Jizzakh', 'University', 233],
  ['Guliston Farm', 'Syrdarya', 'School / college', 218], ['Chirchiq Labs', 'Tashkent region', 'University', 305], ['Zarafshon Mine AI', 'Navoi', 'School / college', 241],
].map(([n, r, tr, p]) => ({ n, r, tr, p }));
SF.WILDCARDS = [['Hackonnect Nomads', 'Startup Weekend Tashkent'], ['Samarqand Builders', 'Startup Weekend Samarkand'], ['Nukus Night Owls', 'Startup Weekend Nukus']];

SF.SEAT_TYPES = ['Large company', 'Local business', 'University', 'Investor', 'Founder', 'Youth office'];
SF.SEATS = {
  Samarkand: [['Jasur Qodirov', 'Large company', 'Samarkand Textile Group'], ['Nodira Aminova', 'Local business', 'Bazaar traders association'], ['Prof. Ulug‘bek Karimov', 'University', 'Samarkand State University'],
    ['Dilnoza Karimova', 'Investor', 'Angel'], ['Aziza Rahimova', 'Founder', 'AgroLens'], ['Sherzod Toshev', 'Youth office', 'Regional Youth Affairs office']],
  Fergana: [['Rustam Aliev', 'Large company', 'AgroVodiy Holding'], ['Gulnora Saidova', 'Large company', 'Fergana Oil Refinery'], ['Bobur Ismoilov', 'Local business', 'Qo‘qon crafts cooperative'],
    ['Madina Yo‘ldosheva', 'University', 'Fergana Polytechnic'], ['Temur Rasulov', 'Founder', 'TexTrace']],
  Khorezm: [['Akmal Sobirov', 'Large company', 'Khorezm Agro Cluster'], ['Zulfiya Rahmonova', 'University', 'Urgench State University'], ['Sanjar Bekov', 'Founder', 'Suvchi'], ['Lola Nurmatova', 'Youth office', 'Regional Youth Affairs office']],
};
SF.PROBLEMS = {
  Samarkand: [['Hotels lose bookings because guests cannot pay by card at small guesthouses', 'Local business', 7], ['Textile workshops waste 12% of fabric when cutting', 'Large company', 4]],
  Fergana: [['Apricot growers sell late and lose 30% to spoilage', 'Local business', 9]],
  Khorezm: [['Canal water reaches the last farms 2 days late', 'Large company', 5]],
};
SF.STARTUP_INFO = {
  AgroLens: { founder: 'Aziza Rahimova', year: 2026, consent: true, owner: 'participant' }, BozorPay: { founder: 'Jahongir Usmonov', year: 2025, consent: true },
  Suvchi: { founder: 'Sanjar Bekov', year: 2025, consent: true }, MahallaGo: { founder: 'Kamola Ergasheva', year: 2026, consent: true },
  'Ustoz.ai': { founder: 'Farrux Nazarov', year: 2024, consent: true }, VibraSense: { founder: 'Diyor Hamidov', year: 2026, consent: false },
  TexTrace: { founder: 'Temur Rasulov', year: 2025, consent: true }, "Yo'lchi": { founder: 'Botir Xolmatov', year: 2025, consent: true },
};
SF.GIG_STEPS = ['Open', 'Assigned', 'Delivered', 'Paid'];

SF.freshExtra = () => ({
  seats: JSON.parse(JSON.stringify(SF.SEATS)),
  problems: Object.fromEntries(Object.entries(SF.PROBLEMS).map(([r, l]) => [r, l.map(([t, by, v], i) => ({ id: r + i, t, by, v, brief: false }))])),
  consent: Object.fromEntries(Object.entries(SF.STARTUP_INFO).map(([n, i]) => [n, i.consent])),
  requests: [{ id: 'r1', by: 'Silk Road Bank', list: ['BozorPay', 'MahallaGo'], status: 'Curating' }],
  finalists: { 'Samarkand|School / college': 'AgroLens', 'Andijan|University': 'BozorPay', 'Namangan|University': 'Ustoz.ai', 'Tashkent city|University': 'MahallaGo' },
  teamPts: Object.fromEntries(SF.TEAMS.map(x => [x.n, x.p])),
  gigState: { g1: { st: 0 }, g2: { st: 0 }, g3: { st: 1, who: 'Javohir Ergashev' }, g4: { st: 0 }, g5: { st: 0 }, g6: { st: 3, who: 'Aziza Rahimova', uzs: 600000, rating: 5 } },
});
// one finished gig so earnings show on the participant's ID
SF.GIGS.push({ id: 'g6', title: 'Translate a pitch deck into Russian', by: 'TexTrace', kind: 'Startup', region: 'Fergana', pay: '600K UZS', type: 'Gig' });
SF.ROLE_FIELDS.participant[0].options = ['School / college', 'University', 'Founder (graduated)'];
SF.ROLES.participant.persona.fields.track = 'School / college';
