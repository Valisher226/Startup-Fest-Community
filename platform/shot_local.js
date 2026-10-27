// screenshot local build routes with puppeteer: node shot_local.js <index.html> <outprefix> <lang> <role> <routes...>
const puppeteer = require('../site/node_modules/puppeteer-core');
const [,, file, out, lang, role, ...routes] = process.argv;
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--allow-file-access-from-files'] });
  for (const [i, r] of routes.entries()) { const [route0, w = '1440', h = '1000'] = r.split('@'); const [route, q = ''] = route0.split('?'); const filt = Object.fromEntries(new URLSearchParams(q));
    const p = await b.newPage(); await p.setViewport({ width: +w, height: +h });
    await p.goto('file://' + file + '#/home'); await p.evaluate((l, ro, f) => { SF.S.lang = SF.lang = l; if (ro === 'out') SF.S.session = null; else if (SF.loginAs) SF.loginAs(ro); else SF.S.role = ro; Object.assign(SF.S.filters, f); SF.save(); }, lang, role, filt);
    await p.goto('file://' + file + '#/' + route); await p.evaluate(() => SF.render()); await new Promise(r => setTimeout(r, 1200));
    await p.screenshot({ path: `${out}_${i}.png`, fullPage: false }); await p.close(); }
  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });
