const puppeteer = require('../site/node_modules/puppeteer-core');
const file = process.argv[2];
(async () => { const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  for (const lang of ['uz', 'ru', 'en']) for (const role of ['participant', 'mentor', 'investor', 'company', 'sme', 'org']) for (const w of [1360, 1440, 1600]) {
    const p = await b.newPage(); await p.setViewport({ width: w, height: 900 }); await p.goto('file://' + file + '#/home');
    await p.evaluate((l, r) => { SF.S.lang = SF.lang = l; if (SF.loginAs) SF.loginAs(r); else SF.S.role = r; SF.render(); }, lang, role); await new Promise(r => setTimeout(r, 200));
    const m = await p.evaluate(() => { const t = document.querySelector('.tabs'), i = document.getElementById('tabs'); return { need: i.scrollWidth, have: t.clientWidth }; });
    console.log(lang, role, w, m.need <= m.have ? 'fits' : 'OVERFLOW', m.need, m.have); await p.close(); }
  await b.close(); })();
