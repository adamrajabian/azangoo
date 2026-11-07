#!/usr/bin/env node
/* Copyright (c) 2026 azangoo.com. All rights reserved.
   Copying, reuse, modification or redistribution of this code, or of its calculations,
   is prohibited without written permission. See the Terms and conditions page. */
/* Step 1: builds data/cities.json from GeoNames files.
   Usage:
     node tools/import-cities.js --cities cities15000.txt --countries countryInfo.txt \
        [--altnames alternateNamesV2.txt] [--min-pop 100000] [--out data/cities.json]
   Files come from https://download.geonames.org/export/dump/ (license CC BY 4.0: credit GeoNames in the site).
   Group 1 = population >= min-pop (default 100000). Group 2 = 15000..min-pop. Other cities are not published. */
'use strict';
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : def; };
const CITIES = opt('cities');
const COUNTRIES = opt('countries');
const ALTNAMES = opt('altnames');
const MIN_POP = Number(opt('min-pop', 100000));
const OUT = opt('out', path.join(__dirname, '..', 'data', 'cities.json'));
const LANG_CODES = ['fa', 'en', 'ur', 'ar'];

if (!CITIES) { console.error('Missing --cities <file>'); process.exit(1); }

function slugify(s) {
  return String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'city';
}

async function readLines(file, onLine) {
  const rl = readline.createInterface({ input: fs.createReadStream(file, 'utf8'), crlfDelay: Infinity });
  for await (const line of rl) { if (line && line[0] !== '#') onLine(line.split('\t')); }
}

(async () => {
  /* country names (English) */
  const countryName = {};
  if (COUNTRIES) {
    await readLines(COUNTRIES, (c) => { if (c[0] && c[4]) countryName[c[0]] = { en: c[4], geo: c[16] }; });
  }

  /* alternate names for the four languages, preferred ones only */
  const alt = {};
  if (ALTNAMES) {
    await readLines(ALTNAMES, (c) => {
      const lang = c[2], id = c[1];
      if (!LANG_CODES.includes(lang) || !c[3]) return;
      alt[id] = alt[id] || {};
      alt[id][lang] = alt[id][lang] || { name: null, preferred: false };
      const slot = alt[id][lang];
      /* a preferred name wins; otherwise the first usable name is kept */
      if (c[4] === '1' && !slot.preferred) { slot.name = c[3]; slot.preferred = true; }
      else if (!slot.name) { slot.name = c[3]; }
    });
  }

  /* cities */
  const all = [];
  await readLines(CITIES, (c) => {
    const pop = Number(c[14] || 0);
    if (!c[0] || pop < 15000) return;                                // only places with a real population
    all.push({
      id: c[0], name: c[1], ascii: c[2], lat: Number(c[4]), lng: Number(c[5]),
      cc: c[8], pop: pop, zone: c[17] || ''
    });
  });

  const cities = [];
  for (const r of all) {
    if (!r.zone || !isFinite(r.lat) || !isFinite(r.lng)) continue;   // a city needs coordinates and an IANA zone
    const group = r.pop >= MIN_POP ? 1 : 2;
    const names = { en: r.ascii || r.name };
    for (const l of ['fa', 'ur', 'ar']) if (alt[r.id] && alt[r.id][l] && alt[r.id][l].name) names[l] = alt[r.id][l].name;
    const cinfo = countryName[r.cc] || { en: r.cc };
    const country = { en: cinfo.en };
    for (const l of ['fa', 'ur', 'ar']) {
      const g = cinfo.geo && alt[cinfo.geo] && alt[cinfo.geo][l];
      if (g && g.name) country[l] = g.name;
    }
    cities.push({
      id: r.id, group: group, cc: r.cc, country: country,
      name: names, slug: slugify(names.en), countrySlug: slugify(cinfo.en),
      lat: +r.lat.toFixed(6), lng: +r.lng.toFixed(6), zone: r.zone, pop: r.pop
    });
  }

  /* unique URLs: the same slug in the same country gets the GeoNames id appended */
  const seen = {};
  for (const c of cities) {
    const key = c.countrySlug + '/' + c.slug;
    if (seen[key]) c.slug = c.slug + '-' + c.id; else seen[key] = true;
  }

  cities.sort((a, b) => b.pop - a.pop);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ source: 'GeoNames (CC BY 4.0)', minPop: MIN_POP, count: cities.length, cities }, null, 1), 'utf8');

  const g1 = cities.filter(c => c.group === 1).length;
  console.log(`read ${all.length} places, kept ${cities.length} (group 1: ${g1}, group 2: ${cities.length - g1})`);
  console.log('wrote', OUT);
})().catch(e => { console.error(e); process.exit(1); });
