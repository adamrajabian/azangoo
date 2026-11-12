/* Splits a "lunar events" file (months[1-12].days[1-30|last|extra].events[]) into one small file per month, so the page
   only downloads the month it needs.
   Run:  node tools/split-lunar-events.js <source.json> <lang>      e.g.  node tools/split-lunar-events.js lunar_events_fa.json fa
   Writes data/lunar-events/<lang>-<M>.json   (M = 1 Muharram ... 12 Dhu al-Hijjah)   { name, intro, days, honorifics? }  (honorifics: the meaning of the abbreviations like (PBUH), shown under the full text)
   A language without these files simply keeps the default pictures (js/ayah.js). */
const fs = require('fs'), path = require('path');
const [src, lang] = process.argv.slice(2);
if (!src || !/^[a-z]{2}$/.test(lang || '')) { console.error('usage: node tools/split-lunar-events.js <source.json> <lang: fa|en|ur|ar>'); process.exit(1); }
const root = path.join(__dirname, '..'), out = path.join(root, 'data', 'lunar-events');
const data = JSON.parse(fs.readFileSync(src, 'utf8'));
fs.mkdirSync(out, { recursive: true });
let n = 0;
for (let m = 1; m <= 12; m++) {
  const mo = data.months && data.months[String(m)];
  if (!mo) continue;
  fs.writeFileSync(path.join(out, lang + '-' + m + '.json'), JSON.stringify(Object.assign({ name: mo.name || '', intro: mo.intro || '', days: mo.days || {} }, (data.meta && data.meta.honorifics_key) ? { honorifics: data.meta.honorifics_key } : {})));
  n++;
}
console.log('wrote ' + n + ' files to data/lunar-events/ for ' + lang);
