/* Splits data/cities.json (13 MB) into small files for the /go/ link page, so a visitor only downloads one country.
   Run:  node tools/split-cities.js
   Writes data/go/index.json   -> [ [cc, countrySlug, en, fa, ur, ar], ... ]   (the countries)
          data/go/<slug>.json  -> [ [en, fa, ur, ar, lat, lng, population], ... ] biggest cities first
   Israel is left out, as in the city pages. */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const DATA = JSON.parse(fs.readFileSync(path.join(root, 'data', 'cities.json'), 'utf8'));
const out = path.join(root, 'data', 'go');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const byCountry = {};
DATA.cities.filter(c => c.cc !== 'IL').forEach(c => {
  const k = c.countrySlug;
  (byCountry[k] = byCountry[k] || { c, rows: [] }).rows.push([
    c.name.en || '', c.name.fa || '', c.name.ur || '', c.name.ar || '',
    +c.lat.toFixed(5), +c.lng.toFixed(5), c.pop || 0]);
});
const index = [];
Object.keys(byCountry).sort().forEach(k => {
  const { c, rows } = byCountry[k];
  rows.sort((a, b) => b[6] - a[6]);
  fs.writeFileSync(path.join(out, k + '.json'), JSON.stringify(rows));
  index.push([c.cc, k, c.country.en || '', c.country.fa || '', c.country.ur || '', c.country.ar || '']);
});
fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify(index));
console.log('countries:', index.length, 'cities:', Object.values(byCountry).reduce((n, x) => n + x.rows.length, 0));
