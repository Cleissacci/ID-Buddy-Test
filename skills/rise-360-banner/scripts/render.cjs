#!/usr/bin/env node
// Render a banner HTML page to PNG at 1x and 2x.
//   node render.cjs banner.html OUT_BASENAME WIDTH HEIGHT
// Writes OUT_BASENAME_<W>x<H>.png and OUT_BASENAME_<2W>x<2H>@2x.png.
// Finds Playwright globally or locally; uses the preinstalled Chromium if
// PLAYWRIGHT_BROWSERS_PATH is set (never runs `playwright install`).
const path = require('path');
function loadPlaywright() {
  const tries = ['playwright', '/opt/node22/lib/node_modules/playwright'];
  try { tries.push(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); } catch (e) {}
  for (const t of tries) { try { return require(t); } catch (e) {} }
  throw new Error('Playwright not found. Install it (npm i -g playwright) or point NODE_PATH at it.');
}
(async () => {
  const [, , input, base, w, h] = process.argv;
  if (!input || !base || !w || !h) { console.error('usage: render.cjs banner.html OUT_BASENAME WIDTH HEIGHT'); process.exit(1); }
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  for (const scale of [1, 2]) {
    const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: scale });
    await page.goto('file://' + path.resolve(input));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);
    const fam = await page.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family).join(', '));
    const out = scale === 1 ? `${base}_${w}x${h}.png` : `${base}_${w * 2}x${h * 2}@2x.png`;
    await page.screenshot({ path: out, clip: { x: 0, y: 0, width: +w, height: +h } });
    console.log(`Wrote ${out}  (fonts loaded: ${fam || 'NONE - fallback font used'})`);
    await page.close();
  }
  await browser.close();
})();
