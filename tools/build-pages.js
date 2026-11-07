#!/usr/bin/env node
/* Copyright (c) 2026 azangoo.com. All rights reserved.
   Copying, reuse, modification or redistribution of this code, or of its calculations,
   is prohibited without written permission. See the Terms and conditions page. */
/* Builds static city pages (HTML with today's times and the month table) for search engines.
   Usage: node tools/build-pages.js [outputDir]
          HOME_ONLY=1 node tools/build-pages.js [outputDir]   (only the home page of each language, added to the sitemap)
   The calculations are the same modules the interactive page uses (js/*.js). */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = process.argv[2] || ROOT;                       /* the site folder: pages go next to index.html */
const BASE = 'https://www.azangoo.com';
const LANGS = ['fa', 'en', 'ur', 'ar'];
const DIR = { fa: 'rtl', en: 'ltr', ur: 'rtl', ar: 'rtl' };

/* ---------- the shared modules (no network, no browser) ---------- */
delete globalThis.fetch;
globalThis.window = globalThis;
require(path.join(ROOT, 'js/lang.js'));
const OFF = require(path.join(ROOT, 'js/official.js'));
OFF.setData(JSON.parse(fs.readFileSync(path.join(ROOT, 'data/official-months.json'), 'utf8')));
const MOON = require(path.join(ROOT, 'js/moon-info.js'));
const PT = require(path.join(ROOT, 'js/azangoo-prayer-times.js'));
const A = window.AzanLang;

/* ---------- the cities: group 1 of data/cities.json (population above the limit) ---------- */
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/cities.json'), 'utf8'));
const CITIES = DATA.cities.filter(c => c.group === 1 && c.cc !== 'IL').map(c => ({   /* Israel is not published */
  slug: c.slug, countrySlug: c.countrySlug, cc: c.cc, lat: c.lat, lng: c.lng, zone: c.zone,
  name: c.name, country: c.country
}));
const LIMIT = Number(process.env.BUILD_LIMIT || 0);      /* for quick tests: build only the first N cities */
if (LIMIT) CITIES.length = Math.min(CITIES.length, LIMIT);
/* a city has a page in a language when it has a name in that language; English always exists */
const langsOf = (c) => LANGS.filter(l => l === 'en' || !!c.name[l]);

/* ---------- page text (only the parts that are not in the shared dictionary) ---------- */
const TXT = {
  fa: { title: (c, k) => `اوقات شرعی ${c}، ${k} | اذان گو`,
        desc: (c, k) => `اوقات شرعی امروز و جدول ماه در ${c}، ${k}. ماه قمری، رؤیت هلال و زمان اذان به وقت محلی.`,
        intro: (c, k, la, lo, z) => `اوقات شرعی امروز در ${c}، ${k}. محاسبه برای مختصات ${la}، ${lo} و منطقهٔ زمانی ${z}.`,
        h1: (c, k) => `اوقات شرعی ${c}، ${k}`, month: 'جدول ماه', home: 'صفحهٔ اصلی اذان گو',
        open: 'باز کردن صفحه اصلی', note: 'اوقات امروز با ساعت شما به‌روز می‌شوند.' },
  en: { title: (c, k) => `Prayer times in ${c}, ${k} | Azangoo`,
        desc: (c, k) => `Today's prayer times for ${c}, ${k}, in local time.`,
        intro: (c, k, la, lo, z) => `Prayer times today in ${c}, ${k}. Calculated for coordinates ${la}, ${lo} in the ${z} time zone.`,
        h1: (c, k) => `Prayer times in ${c}, ${k}`, month: 'Monthly table', home: 'Azangoo home',
        open: 'Open the main page', note: 'Today’s times update with your clock.' },
  ur: { title: (c, k) => `${c}، ${k} کے اوقات نماز | Azangoo`,
        desc: (c, k) => `${c}، ${k} کے آج کے اوقات نماز اور مہینے کا جدول۔ ہجری مہینہ، چاند کا مشاہدہ اور اذان کے اوقات مقامی وقت کے مطابق۔`,
        intro: (c, k, la, lo, z) => `${c}، ${k} کے آج کے اوقات نماز۔ مقام ${la}، ${lo}، ٹائم زون ${z}۔`,
        h1: (c, k) => `${c}، ${k} کے اوقات نماز`, month: 'مہینے کا جدول', home: 'اذان گو کا صفحہ',
        open: 'مرکزی صفحہ کھولیں', note: 'آج کے اوقات آپ کی گھڑی کے مطابق اپ ڈیٹ ہوتے ہیں۔' },
  ar: { title: (c, k) => `أوقات الصلاة في ${c}، ${k} | Azangoo`,
        desc: (c, k) => `أوقات الصلاة اليوم وجدول الشهر في ${c}، ${k}. الشهر الهجري وتوقيت رؤية الهلال والأذان بالتوقيت المحلي.`,
        intro: (c, k, la, lo, z) => `أوقات الصلاة اليوم في ${c}، ${k}. محسوبة للإحداثيات ${la}، ${lo} والمنطقة الزمنية ${z}.`,
        h1: (c, k) => `أوقات الصلاة في ${c}، ${k}`, month: 'جدول الشهر', home: 'الصفحة الرئيسية',
        open: 'افتح الصفحة الرئيسية', note: 'تتحدث أوقات اليوم حسب ساعتك.' }
};

const CTA = {
  fa: { text: 'تقویم کامل، تغییر مکان و پخش اذان در صفحهٔ اصلی', btn: 'باز کردن صفحه اصلی' },
  en: { text: 'Full calendar, change of place and adhan playback on the main page', btn: 'Open the main page' },
  ur: { text: 'مکمل کیلنڈر، جگہ کی تبدیلی اور اذان کی آواز مرکزی صفحے پر', btn: 'مرکزی صفحہ کھولیں' },
  ar: { text: 'التقويم الكامل وتغيير المكان وتشغيل الأذان في الصفحة الرئيسية', btn: 'افتح الصفحة الرئيسية' }
};
const MORE = {
  fa: { text: 'ماه قمری، رؤیت هلال و تقویم ماه در صفحهٔ اصلی اذان گو هستند.', link: 'مشاهدهٔ ماه قمری و تقویم ماه' },
  en: { text: 'The Hijri month, moon sighting and the monthly calendar are on the Azangoo main page.', link: 'See the Hijri month and monthly calendar' },
  ur: { text: 'ہجری مہینہ، چاند کا مشاہدہ اور مہینے کا کیلنڈر اذان گو کے مرکزی صفحے پر ہیں۔', link: 'ہجری مہینہ اور کیلنڈر دیکھیں' },
  ar: { text: 'الشهر الهجري ورؤية الهلال والتقويم الشهري متوفرة في الصفحة الرئيسية لأذان گو.', link: 'عرض الشهر الهجري والتقويم' }
};
const LIST = {
  fa: { h1: 'اوقات شرعی شهرها', search: 'جستجوی شهر…', all: 'همه‌ی کشورها', countries: 'کشورها', cities: 'شهرها', back: 'فهرست کشورها', desc: 'فهرست کشورها و شهرهایی که اوقات شرعی‌شان در اذان گو هست.' },
  en: { h1: 'Prayer times by city', search: 'Search a city…', all: 'All countries', countries: 'Countries', cities: 'Cities', back: 'All countries', desc: 'Countries and cities with prayer times on Azangoo.' },
  ur: { h1: 'شہروں کے اوقات نماز', search: 'شہر تلاش کریں…', all: 'تمام ممالک', countries: 'ممالک', cities: 'شہر', back: 'تمام ممالک', desc: 'اذان گو پر اوقات نماز والے ممالک اور شہر۔' },
  ar: { h1: 'أوقات الصلاة حسب المدينة', search: 'ابحث عن مدينة…', all: 'كل الدول', countries: 'الدول', cities: 'المدن', back: 'كل الدول', desc: 'الدول والمدن التي تتوفر فيها أوقات الصلاة في أذان گو.' }
};
const LANG_NAMES = { fa: 'فارسی', en: 'English', ur: 'اردو', ar: 'العربية' };
const OTHER_LABEL = { fa: 'زبان‌های دیگر', en: 'Other languages', ur: 'دیگر زبانیں', ar: 'لغات أخرى' };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad2 = (n) => (n < 10 ? '0' : '') + n;
const pathFor = (lang, c) => `${lang}/prayer-times/${c.countrySlug}/${c.slug}/`;
const urlFor = (lang, c) => `${BASE}/${pathFor(lang, c)}`;
/* a page is 4 folders deep (lang/prayer-times/country/city/), so the site root is 4 levels up */
const ROOT_REL = '../../../../';
const linkFor = (lang, c) => ROOT_REL + pathFor(lang, c) + 'index.html';   /* explicit file name: some servers do not open folders */

/* local date and times of a city right now, and the month table */
function cityData(c, lang, now) {
  A.set(lang);
  const off = PT.offsetAt(c.zone, now);
  const local = new Date(now + off * 3600000);
  const y = local.getUTCFullYear(), m = local.getUTCMonth() + 1, d = local.getUTCDate();
  const today = PT.calculateForNow({ latitude: c.lat, longitude: c.lng, zoneName: c.zone, now: now });
  const moon = null;
  const days = 0;
  const rows = [];
  for (let k = 1; k <= days; k++) {
    const tz = PT.offsetAt(c.zone, Date.UTC(y, m - 1, k, 12));
    const t = PT.calculatePrayerTimes({ latitude: c.lat, longitude: c.lng, year: y, month: m, day: k, timeZoneOffsetHours: tz });
    rows.push({ k, fajr: t.fajr, sunrise: t.sunrise, dhuhr: t.dhuhr, sunset: t.sunset, maghrib: t.maghrib, midnight: t.midnight });
  }
  return { y, m, d, today, moon, rows, off };
}

function todayRows(t) {
  const keys = [['fajr', 'fajr'], ['sunrise', 'sunrise'], ['dhuhr', 'dhuhr'], ['sunset', 'sunset'], ['maghrib', 'maghrib'], ['midnight', 'midnight']];
  return keys.filter(k => t[k[0]] !== undefined).map(([key, label]) =>
    `<tr><th scope="row">${esc(A.t(label || key))}</th><td data-t="${key}">${esc(A.num(t[key]))}</td></tr>`).join('\n');
}

function monthTable(data) {
  const head = ['fajr', 'sunrise', 'dhuhr', 'sunset', 'maghrib', 'midnight'].map(k => `<th scope="col">${esc(A.t(k))}</th>`).join('');
  const body = data.rows.map(r =>
    `<tr><th scope="row">${esc(A.num(r.k))} ${esc(A.names('greg')[data.m - 1])}</th>` +
    ['fajr', 'sunrise', 'dhuhr', 'sunset', 'maghrib', 'midnight'].map(k => `<td>${esc(A.num(r[k]))}</td>`).join('') + `</tr>`).join('\n');
  return `<table class="month"><thead><tr><th scope="col">${esc(A.t('pdf_day'))}</th>${head}</tr></thead><tbody>\n${body}\n</tbody></table>`;
}

function schema(c, lang) {
  const name = c.name[lang], country = c.country[lang];
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', '@id': urlFor(lang, c), url: urlFor(lang, c), inLanguage: lang,
        name: TXT[lang].title(name, country), description: TXT[lang].desc(name, country),
        about: { '@id': urlFor(lang, c) + '#place' } },
      { '@type': 'Place', '@id': urlFor(lang, c) + '#place', name: name,
        address: { '@type': 'PostalAddress', addressCountry: c.cc },
        geo: { '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lng } }
    ]
  });
}

function page(c, lang, data, now) {
  const T = TXT[lang], name = c.name[lang], country = c.country[lang];
  const la = c.lat.toFixed(4), lo = c.lng.toFixed(4);
  const alternates = langsOf(c).map(l => `<link rel="alternate" hreflang="${l}" href="${urlFor(l, c)}">`).join('\n');
  const interactive = `${ROOT_REL}${lang}/index.html?lat=${c.lat}&lng=${c.lng}&city=${encodeURIComponent(name)}&cc=${c.cc}`;   /* relative: works on any domain */
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${DIR[lang]}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(T.title(name, country))}</title>
<meta name="description" content="${esc(T.desc(name, country))}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${urlFor(lang, c)}">
${alternates}
<link rel="alternate" hreflang="x-default" href="${urlFor('en', c)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Azangoo">
<meta property="og:title" content="${esc(T.title(name, country))}">
<meta property="og:description" content="${esc(T.desc(name, country))}">
<meta property="og:url" content="${urlFor(lang, c)}">
<meta property="og:image" content="${BASE}/images/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${schema(c, lang)}</script>
<style>
body{font-family:Vazirmatn,Tahoma,sans-serif;margin:0;background:#0b2530;color:#f4ecd8;line-height:1.8}
main{max-width:980px;margin:0 auto;padding:18px}
h1{color:#f0d58a;font-size:1.5rem;margin:8px 0}
h2{color:#f0d58a;font-size:1.1rem;margin:18px 0 8px}
a{color:#f0d58a}
.card{background:rgba(18,56,74,.82);border:1px solid rgba(210,169,75,.45);border-radius:14px;padding:12px 14px;margin:12px 0}
table{width:100%;border-collapse:collapse}
th,td{padding:6px 8px;border-bottom:1px solid rgba(210,169,75,.25);text-align:center}
th[scope=row]{text-align:${DIR[lang] === 'rtl' ? 'right' : 'left'}}
.month{font-size:.9rem}
.wrap{overflow-x:auto}
.links a{margin-inline-end:16px}
.langs-other{margin:8px 0;font-size:.9rem}
.langs-other a{margin-inline-start:4px}
.cta{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;background:rgba(18,56,74,.82);border:1px solid #d2a94b;border-radius:14px;padding:12px 14px;margin:10px 0}
.cta p{margin:0;flex:1 1 260px}
.cta-btn{display:inline-block;background:#d2a94b;color:#0a1a22;font-weight:700;text-decoration:none;padding:10px 18px;border-radius:12px}
@media(max-width:600px){body{line-height:1.7}main{padding:12px}h1{font-size:1.25rem}h2{font-size:1rem}.card{padding:9px 10px;margin:9px 0}th,td{padding:4px 6px;font-size:.88rem}.month{font-size:.8rem}.cta{padding:10px;gap:8px}.cta-btn{padding:8px 14px;font-size:.9rem}.links a{margin-inline-end:10px;font-size:.9rem}}
</style>
</head>
<body>
<main data-lat="${c.lat}" data-lng="${c.lng}" data-zone="${esc(c.zone)}" data-lang="${lang}">
<nav class="links"><a href="${ROOT_REL}${lang}/index.html">${esc(T.home)}</a><a href="../index.html">${esc(LIST[lang].back)}</a><a href="${esc(interactive)}">${esc(T.open)}</a></nav>
<nav class="links terms-nav"><a href="${ROOT_REL}${lang}/terms/index.html">${esc(TERMS_LABEL[lang])}</a><a href="${ROOT_REL}${lang}/privacy/index.html">${esc(PRIVACY_LABEL[lang])}</a><a href="${ROOT_REL}${lang}/widget/index.html">${esc(WIDGET_LABEL[lang])}</a></nav>
<nav class="langs-other" aria-label="${esc(OTHER_LABEL[lang])}"><span>${esc(OTHER_LABEL[lang])}:</span> ${langsOf(c).map(l => l === lang ? `<span aria-current="page">${esc(c.name[l] + (l === 'en' ? ', ' : '، ') + c.country[l])}</span>` : `<a href="${linkFor(l, c)}" lang="${l}" hreflang="${l}">${esc(c.name[l] + (l === 'en' ? ', ' : '، ') + c.country[l])}</a>`).join(' · ')}</nav>
<h1>${esc(T.h1(name, country))}</h1>
<aside class="cta"><p>${esc(CTA[lang].text)}</p><a class="cta-btn" href="${esc(interactive)}">${esc(CTA[lang].btn)}</a></aside>
<p>${esc(T.intro(name, country, la, lo, c.zone))}</p>
<section class="card">
<h2>${esc(A.t('times_title'))}</h2>
<table><tbody>
${todayRows(data.today)}
</tbody></table>
<p>${esc(T.note)}</p>
</section>
<section class="card">
<p>${esc(MORE[lang].text)} <a href="${esc(interactive)}">${esc(MORE[lang].link)}</a></p>
</section>

</main>
<script src="${ROOT_REL}js/azangoo-prayer-times.js"></script>
<script src="${ROOT_REL}js/city.js"></script>
</body>
</html>
`;
}


/* ---------- list pages ---------- */
const countriesOf = (lang) => {
  const map = {};
  for (const c of CITIES) {
    if (!langsOf(c).includes(lang)) continue;
    if (!map[c.countrySlug]) map[c.countrySlug] = { slug: c.countrySlug, cc: c.cc, name: c.country, cities: [] };
    map[c.countrySlug].cities.push(c);
  }
  return Object.values(map).sort((x, y) => (x.name[lang] || x.name.en).localeCompare(y.name[lang] || y.name.en));
};

function listHead(lang, title, desc, rootRel) {
  const L = LIST[lang];
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${DIR[lang]}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index, follow">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${BASE}/images/og-image.png">
<link rel="icon" href="${rootRel}favicon.ico?v=4" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="${rootRel}icons/icon-32.png?v=4">
<style>
body{font-family:Vazirmatn,Tahoma,sans-serif;margin:0;background:#0b2530;color:#f4ecd8;line-height:1.8}
main{max-width:980px;margin:0 auto;padding:18px}
h1{color:#f0d58a;font-size:1.5rem;margin:8px 0}
h2{color:#f0d58a;font-size:1.1rem;margin:16px 0 4px}
a{color:#f0d58a}
.card{background:rgba(18,56,74,.82);border:1px solid rgba(210,169,75,.45);border-radius:14px;padding:12px 14px;margin:12px 0}
.list-tools{display:flex;flex-wrap:wrap;gap:10px;margin:12px 0}
.list-tools input,.list-tools select{font:inherit;padding:9px 12px;border-radius:10px;border:1px solid #d2a94b;background:#fff;color:#13303a;min-width:0}
ul{list-style:none;padding:0;margin:0}
li{padding:6px 0;border-bottom:1px solid rgba(210,169,75,.25)}
.count{opacity:.7;font-size:.85rem}
.home{display:inline-block;margin-bottom:6px}
@media(max-width:600px){body{line-height:1.7}main{padding:12px}h1{font-size:1.25rem}h2{font-size:1rem}.card{padding:9px 10px;margin:9px 0}li{padding:4px 0}.list-tools{gap:8px;margin:8px 0}.list-tools input,.list-tools select{padding:7px 10px}}
</style>
</head>
<body>
<main>
<nav><a class="home" href="${rootRel}${lang}/index.html">${esc(T_HOME[lang])}</a></nav>
<h1>${esc(L.h1)}</h1>
<p>${esc(desc)}</p>
`;
}
const T_HOME = { fa: 'صفحهٔ اصلی اذان گو', en: 'Azangoo home', ur: 'اذان گو کا صفحہ', ar: 'الصفحة الرئيسية' };
const LIST_TAIL = `</main>
<script src="__ROOT__js/lists.js"></script>
</body>
</html>
`;

/* /lang/prayer-times/index.html : all countries, with a search box and a country filter */
function countriesPage(lang) {
  const L = LIST[lang];
  const countries = countriesOf(lang);
  const options = countries.map(k => `<option value="${esc(k.slug)}">${esc(k.name[lang])}</option>`).join('');
  const rows = countries.map(k =>
    `<div class="card country-row" data-filter="${esc(k.name[lang])}" data-country="${esc(k.slug)}">
<h2><a href="${esc(k.slug)}/index.html">${esc(k.name[lang])}</a> <span class="count">(${esc(A.num(k.cities.length))})</span></h2>
</div>`).join('\n');
  const title = L.h1 + ' | ' + 'Azangoo';
  return listHead(lang, title, L.desc, '../../') +
    `<div class="list-tools"><input id="listSearch" type="search" placeholder="${esc(L.search)}" aria-label="${esc(L.search)}">
<select id="listCountry" aria-label="${esc(L.countries)}"><option value="">${esc(L.all)}</option>${options}</select></div>
${rows}
` + LIST_TAIL.replace('__ROOT__', '../../');
}

/* /lang/prayer-times/<country>/index.html : the cities of one country */
function countryPage(lang, k) {
  const L = LIST[lang];
  const name = k.name[lang];
  const items = k.cities.map(c => `<li data-filter="${esc(c.name[lang])}"><a href="${esc(c.slug)}/index.html">${esc(c.name[lang])}</a></li>`).join('');
  const title = `${L.h1}: ${name} | Azangoo`;
  const desc = `${name}: ${L.desc}`;
  return listHead(lang, title, desc, '../../../') +
    `<p><a href="../index.html">${esc(L.back)}</a></p>
<div class="list-tools"><input id="listSearch" type="search" placeholder="${esc(L.search)}" aria-label="${esc(L.search)}"></div>
<section class="card"><h2>${esc(name)} <span class="count">(${esc(A.num(k.cities.length))})</span></h2>
<ul>${items}</ul></section>
` + LIST_TAIL.replace('__ROOT__', '../../../');
}


/* ---------- terms and conditions ---------- */
const TERMS = require(path.join(ROOT, 'tools/terms-text.js'));
const PRIVACY = require(path.join(ROOT, 'tools/privacy-text.js'));
/* the contact e-mail written in the terms and privacy texts comes from data/config.json (contactEmail) */
(function () {
  let mail = 'info.azangoo@gmail.com';
  try { const c = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/config.json'), 'utf8')); if (c && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(c.contactEmail || '').trim())) mail = c.contactEmail.trim(); } catch (e) {}
  const swap = (v) => typeof v === 'string' ? v.split('info.azangoo@gmail.com').join(mail)
    : Array.isArray(v) ? v.map(swap) : (v && typeof v === 'object') ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, swap(x)])) : v;
  for (const L of LANGS) { TERMS[L] = swap(TERMS[L]); PRIVACY[L] = swap(PRIVACY[L]); }
})();
const TERMS_LABEL = { fa: 'شرایط استفاده', en: 'Terms', ur: 'شرائط استعمال', ar: 'شروط الاستخدام' };
const PRIVACY_LABEL = { fa: 'حریم خصوصی', en: 'Privacy', ur: 'رازداری', ar: 'الخصوصية' };
function termsPage(lang) { return textPage(lang, TERMS[lang]); }
function privacyPage(lang) { return textPage(lang, PRIVACY[lang]); }

/* /lang/widget/index.html : the guide of the widget that other websites can add (text in tools/widget-text.js, builder in js/widget-builder.js) */
const WIDGET = require(path.join(ROOT, 'tools/widget-text.js'));
const WIDGET_LABEL = { fa: 'افزودن اوقات شرعی به سایت شما', en: 'Add prayer times to your website', ur: 'اپنی ویب سائٹ پر اوقاتِ نماز لگائیں', ar: 'أضف أوقات الصلاة إلى موقعك' };
const WIDGET_JS = `${BASE}/js/azangoo-widget.js`;
const WIDGET_CSS = `
.wcode{direction:ltr;text-align:left;background:#071a22;border:1px solid rgba(210,169,75,.35);border-radius:10px;padding:10px 12px;overflow:auto;font:13px/1.6 Consolas,monospace;white-space:pre;color:#f4ecd8;margin:8px 0}
.wb-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;align-items:end}
.wb-grid label{display:flex;flex-direction:column;font-size:.85rem;gap:2px}
.wb-grid input,.wb-grid select{font:inherit;padding:7px 9px;border:1px solid #d2a94b;border-radius:8px;background:#fff;color:#13303a;min-width:0}
.wb-grid input[type=color]{padding:2px;height:38px}
.wb-grid .wb-check{flex-direction:row;align-items:center;gap:6px}
.wb-grid .wb-check input{width:auto}
.wb-stage{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start;margin-top:14px}
.wb-pv{flex:1 1 300px;min-width:260px;padding:14px;border-radius:12px;background:rgba(255,255,255,.08)}
.wb-code{flex:1 1 340px}
.wb-code textarea{width:100%;height:200px;direction:ltr;text-align:left;font:12.5px/1.5 Consolas,monospace;border:1px solid #d2a94b;border-radius:8px;padding:8px;background:#071a22;color:#f4ecd8}
.wb-btn{font:inherit;margin-top:8px;padding:8px 16px;border:0;border-radius:10px;background:#d2a94b;color:#0b2530;cursor:pointer;font-weight:700}
.gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
table.opt{border-collapse:collapse;width:100%;table-layout:fixed;font-size:.9rem}
table.opt td{overflow-wrap:anywhere}
table.opt td:first-child{width:36%}
table.opt td{border:1px solid rgba(210,169,75,.3);padding:6px 9px;vertical-align:top}
table.opt td:first-child{direction:ltr;text-align:left;font-family:Consolas,monospace;color:#f0d58a}
.hint{font-size:.85rem;opacity:.8}
@media(max-width:600px){.wcode{font-size:11.5px;padding:8px 10px}.wb-stage{gap:10px;margin-top:10px}.wb-pv{padding:10px}.wb-code textarea{height:160px;font-size:11.5px}.gal{grid-template-columns:1fr;gap:10px}table.opt{font-size:.8rem}table.opt td{padding:5px 6px}}
`;
function widgetPage(lang) {
  const W = WIDGET[lang], U = W.ui;
  const code = (html) => `<pre class="wcode">${esc(html)}</pre>`;
  const cityCode = `<div class="azangoo-widget" data-city="Toronto" data-country="CA" data-lang="${lang}" data-theme="auto"></div>\n<script src="${WIDGET_JS}" async></script>`;
  const coordCode = `<div class="azangoo-widget" data-lat="43.65" data-lng="-79.38" data-timezone="America/Toronto" data-name="Toronto" data-lang="${lang}"></div>\n<script src="${WIDGET_JS}" async></script>`;
  const opt = (v, t, sel) => `<option value="${v}"${sel ? ' selected' : ''}>${esc(t)}</option>`;
  const THEMES = ['auto', 'light', 'night', 'dark', 'emerald', 'ocean', 'sand', 'rose'];
  const WL = { fa: 'فارسی', en: 'English', ur: 'اردو', ar: 'العربية' };
  const lab = (id, text, inner) => `<label>${esc(text)}${inner}</label>`;
  const form = [
    lab('city', U.city, '<input id="b-city" value="Toronto">'),
    lab('cc', U.country, '<input id="b-cc" value="CA" maxlength="2" dir="ltr">'),
    lab('lat', U.lat, '<input id="b-lat" dir="ltr" placeholder="43.65">'),
    lab('lng', U.lng, '<input id="b-lng" dir="ltr" placeholder="-79.38">'),
    lab('tz', U.tz, '<input id="b-tz" dir="ltr" placeholder="America/Toronto">'),
    lab('lang', U.wlang, `<select id="b-lang">${LANGS.map(l => opt(l, WL[l], l === lang)).join('')}</select>`),
    lab('theme', U.theme, `<select id="b-theme">${THEMES.map(t => opt(t, t)).join('')}</select>`),
    lab('layout', U.layout, `<select id="b-layout">${['list', 'grid', 'row'].map(t => opt(t, U.layouts[t])).join('')}</select>`),
    lab('clock', U.clock, `<select id="b-clock">${opt('24', '24')}${opt('12', '12')}</select>`),
    `<label class="wb-check"><input id="b-custom" type="checkbox">${esc(U.custom)}</label>`,
    lab('accent', U.accent, '<input id="b-accent" type="color" value="#1c7f79">'),
    lab('bg', U.bg, '<input id="b-bg" type="color" value="#ffffff">'),
    lab('radius', U.radius, '<input id="b-radius" type="number" min="0" max="40" value="14">')
  ].join('\n');
  const linkCity = `${BASE}/go/?city=Toronto&country=Canada&lang=${lang}`;
  const linkCoord = `${BASE}/go/?lat=43.65&lng=-79.38&lang=${lang}`;
  const linkA = `<a href="${linkCity}" target="_blank" rel="noopener">${W.linkAnchor}</a>`;
  const rows = W.options.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('\n');
  const body = `<p>${esc(W.intro)}</p>
<section class="card"><h2>${esc(W.quickH)}</h2><p>${esc(W.quickP)}</p>
<p class="count">${esc(U.cityCode)}</p>${code(cityCode)}
<p class="count">${esc(U.coordCode)}</p>${code(coordCode)}</section>
<section class="card" id="wb" data-lang="${lang}" data-copied="${esc(U.copied)}"><h2>${esc(W.buildH)}</h2>
<div class="wb-grid">
${form}
</div>
<p class="hint">${esc(U.hint)}</p>
<div class="wb-stage"><div class="wb-pv" id="wb-preview" aria-label="${esc(U.preview)}"></div>
<div class="wb-code"><textarea id="wb-out" readonly aria-label="${esc(U.code)}"></textarea><button class="wb-btn" id="wb-copy" type="button">${esc(U.copy)}</button></div></div></section>
<section class="card"><h2>${esc(W.themesH)}</h2><div class="gal" id="wb-gallery"></div></section>
<section class="card"><h2>${esc(W.optionsH)}</h2><table class="opt">
${rows}
</table></section>
<section class="card"><h2>${esc(W.notesH)}</h2>${W.notes.map(n => `<p>${esc(n)}</p>`).join('\n')}</section>
<section class="card" id="link"><h2>${esc(W.linkH)}</h2><p>${esc(W.linkP)}</p>
<p class="count">${esc(W.linkCityL)}</p>${code(linkCity)}
<p class="count">${esc(W.linkCoordL)}</p>${code(linkCoord)}
<p class="count">${esc(W.linkAnchorL)}</p>${code(linkA)}
<p>${withLinks(esc(W.linkNote)).replace('href="https://www.azangoo.com/go/" target="_blank" rel="noopener noreferrer"', 'href="../../go/"')}</p></section>
<script src="../../js/azangoo-widget.js"></script>
<script src="../../js/widget-builder.js"></script>
`;
  let h = listHead(lang, W.title + ' | Azangoo', W.desc, '../../').replace(`<h1>${esc(LIST[lang].h1)}</h1>`, `<h1>${esc(W.title)}</h1>`);
  h = h.replace('</style>', WIDGET_CSS + '</style>');
  /* listHead already writes the description under the title: the page has its own intro */
  h = h.replace(`<p>${esc(W.desc)}</p>\n`, '');
  return h + body + `</main>\n</body>\n</html>\n`;
}
/* [label](https://address) inside a text paragraph becomes a link that opens in a new tab */
const withLinks = (escaped) => escaped.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
  (m, label, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`);
function textPage(lang, T2) {
  const body = T2.sections.map(s =>
    `<section class="card"><h2>${esc(s.h)}</h2>${s.p.map(p => `<p>${withLinks(esc(p))}</p>`).join('\n')}</section>`).join('\n');
  return listHead(lang, T2.title + ' | Azangoo', T2.desc, '../../').replace(`<h1>${esc(LIST[lang].h1)}</h1>`, `<h1>${esc(T2.title)}</h1>`) +
    `<p>${esc(T2.intro)}</p>\n${body}\n<p class="count">${esc(T2.updated)}</p>\n` +
    `</main>\n</body>\n</html>\n`;
}


/* ---------- the home page in each language: /fa/ /en/ /ur/ /ar/ : the same page as index.html, with its own address,
   title, description and text already in the language (so search engines see the language without running scripts) ---------- */
const OG_LOCALE = { fa: 'fa_IR', en: 'en_US', ur: 'ur_PK', ar: 'ar_SA' };
const setMeta = (h, re, value) => h.replace(re, (m, a, b) => a + esc(value) + b);
function homePage(lang) {
  A.set(lang);
  const T = (k) => A.t(k);
  const url = `${BASE}/${lang}/`;
  let h = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  h = h.replace(/<html lang="[^"]*" dir="[^"]*"/, `<html lang="${lang}" dir="${DIR[lang]}" data-page-lang="${lang}"`);
  h = h.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<base href="../">');      /* the folder is one level deep: css, js, images and data stay at the site root */
  h = h.replace(/<title>[^<]*<\/title>/, `<title>${esc(T('page_title'))}</title>`);
  h = setMeta(h, /(<meta name="description" content=")[^"]*(")/, T('page_desc'));
  h = setMeta(h, /(<meta property="og:title" content=")[^"]*(")/, T('page_title'));
  h = setMeta(h, /(<meta property="og:description" content=")[^"]*(")/, T('page_desc'));
  h = setMeta(h, /(<meta name="twitter:title" content=")[^"]*(")/, T('page_title'));
  h = setMeta(h, /(<meta name="twitter:description" content=")[^"]*(")/, T('page_desc'));
  h = setMeta(h, /(<meta property="og:url" content=")[^"]*(")/, url);
  h = setMeta(h, /(<meta property="og:locale" content=")[^"]*(")/, OG_LOCALE[lang]);
  const alternates = LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${BASE}/${l}/">`).join('\n') +
    `\n<link rel="alternate" hreflang="x-default" href="${BASE}/">`;
  h = h.replace(/<link rel="alternate" hreflang="[^"]*" href="[^"]*">\n?/g, '');   /* the root page already lists them: write the set once */
  h = h.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">\n${alternates}`);
  /* text of the page, the same words the script puts in (data-i18n, data-i18n-attr, data-i18n-ph) */
  h = h.replace(/(<([a-zA-Z0-9]+)\b[^>]*?\sdata-i18n="([^"]+)"[^>]*>)([^<]*)(<\/\2>)/g, (m, open, tag, key, inner, close) => open + esc(T(key)) + close);
  const setAttr = (tag, name, value) => {
    const re = new RegExp(`(\\s${name}=")[^"]*(")`);
    return re.test(tag) ? tag.replace(re, (m, a, b) => a + esc(value) + b) : tag.replace(/>$/, ` ${name}="${esc(value)}">`);
  };
  h = h.replace(/<[a-zA-Z0-9]+\b[^>]*\sdata-i18n-attr="[^"]+"[^>]*>/g, (tag) => {
    const spec = /data-i18n-attr="([^"]+)"/.exec(tag)[1];
    spec.split(';').forEach(pair => { const p = pair.split(':'); if (p.length > 1) tag = setAttr(tag, p[0].trim(), T(p[1].trim())); });
    return tag;
  });
  h = h.replace(/<[a-zA-Z0-9]+\b[^>]*\sdata-i18n-ph="([^"]+)"[^>]*>/g, (tag, key) => setAttr(tag, 'placeholder', T(key)));
  /* links that depend on the language */
  h = h.replace(/(id="cityListLink" href=")[^"]*(")/, `$1${lang}/prayer-times/index.html$2`);
  h = h.replace(/(class="terms-link" href=")[^"]*(")/, `$1${lang}/terms/index.html$2`);
  h = h.replace(/(class="terms-link privacy-link" href=")[^"]*(")/, `$1${lang}/privacy/index.html$2`);
  h = h.replace(/(class="terms-link widget-link" href=")[^"]*(")/, `$1${lang}/widget/index.html$2`);
  return h;
}

/* /fa/index.html /en/index.html /ur/index.html /ar/index.html, written next to the other language pages */
function writeHomePages() {
  const urls = [];
  for (const lang of LANGS) {
    const dir = path.join(OUT, lang);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), homePage(lang), 'utf8');
    urls.push(`${BASE}/${lang}/`);
  }
  return urls;
}
/* sitemap lines for the main page and its four language versions, each listing the others */
function homeSitemapEntries(lastmod) {
  const alts = LANGS.map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${BASE}/${l}/"/>`).join('\n') +
    `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/"/>`;
  return [`${BASE}/`].concat(LANGS.map(l => `${BASE}/${l}/`)).map(u =>
    `  <url>\n    <loc>${u}</loc>\n    <lastmod>${lastmod}</lastmod>\n${alts}\n  </url>`);
}

/* quick mode: only the home pages, added to the existing sitemap (nothing else is rebuilt) */
function buildHomeOnly() {
  const lastmod = new Date().toISOString().slice(0, 10);
  writeHomePages();
  let file = path.join(OUT, 'sitemap.xml');
  let sm = fs.readFileSync(file, 'utf8');
  if (!sm.includes('</urlset>')) { file = path.join(OUT, 'sitemap-1.xml'); sm = fs.readFileSync(file, 'utf8'); }   /* sitemap index: first part */
  if (!sm.includes('xmlns:xhtml')) sm = sm.replace('<urlset ', '<urlset xmlns:xhtml="http://www.w3.org/1999/xhtml" ');
  const fresh = homeSitemapEntries(lastmod).filter(e => !sm.includes(`<loc>${/<loc>([^<]*)<\/loc>/.exec(e)[1]}</loc>`));
  if (fresh.length) sm = sm.replace('</urlset>', fresh.join('\n') + '\n</urlset>');
  fs.writeFileSync(file, sm, 'utf8');
  console.log('home pages written: 4, sitemap lines added:', fresh.length);
}

/* quick mode: only the terms pages, added to the existing sitemap (no city pages are rebuilt) */
function buildTermsOnly() {
  const now = Date.now(), lastmod = new Date(now).toISOString().slice(0, 10);
  const urls = [];
  for (const lang of LANGS) {
    const dir = path.join(OUT, lang, 'terms');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), termsPage(lang), 'utf8');
    urls.push(`${BASE}/${lang}/terms/`);
    const pdir = path.join(OUT, lang, 'privacy');
    fs.mkdirSync(pdir, { recursive: true });
    fs.writeFileSync(path.join(pdir, 'index.html'), privacyPage(lang), 'utf8');
    urls.push(`${BASE}/${lang}/privacy/`);
    const wdir = path.join(OUT, lang, 'widget');
    fs.mkdirSync(wdir, { recursive: true });
    fs.writeFileSync(path.join(wdir, 'index.html'), widgetPage(lang), 'utf8');
    urls.push(`${BASE}/${lang}/widget/`);
  }
  const file = path.join(OUT, 'sitemap.xml');
  let sm = fs.readFileSync(file, 'utf8');
  for (const u of urls) {
    if (sm.includes(`<loc>${u}</loc>`)) continue;
    sm = sm.replace('</urlset>', `  <url>\n    <loc>${u}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>\n</urlset>`);
  }
  fs.writeFileSync(file, sm, 'utf8');
  console.log('terms, privacy and widget pages written:', urls.length);
}

function build() {
  const now = Date.now();
  const urls = [];
  for (const l of LANGS) fs.rmSync(path.join(OUT, l), { recursive: true, force: true });   /* only the language folders */
  let n = 0;
  for (const c of CITIES) {
    for (const lang of langsOf(c)) {
      const data = cityData(c, lang, now);
      const file = path.join(OUT, pathFor(lang, c), 'index.html');
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, page(c, lang, data, now), 'utf8');
      urls.push({ c, lang });
      n++;
      if (n % 1000 === 0) console.log('pages written:', n);
    }
  }
  const listUrls = [];
  for (const lang of LANGS) {
    A.set(lang);
    const dir = path.join(OUT, lang, 'prayer-times');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), countriesPage(lang), 'utf8');
    listUrls.push(`${BASE}/${lang}/prayer-times/`);
    for (const k of countriesOf(lang)) {
      const kd = path.join(dir, k.slug);
      fs.mkdirSync(kd, { recursive: true });
      fs.writeFileSync(path.join(kd, 'index.html'), countryPage(lang, k), 'utf8');
      listUrls.push(`${BASE}/${lang}/prayer-times/${k.slug}/`);
    }
  }
  for (const lang of LANGS) {
    const dir = path.join(OUT, lang, 'terms');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), termsPage(lang), 'utf8');
    listUrls.push(`${BASE}/${lang}/terms/`);
    const pdir = path.join(OUT, lang, 'privacy');
    fs.mkdirSync(pdir, { recursive: true });
    fs.writeFileSync(path.join(pdir, 'index.html'), privacyPage(lang), 'utf8');
    listUrls.push(`${BASE}/${lang}/privacy/`);
    const wdir = path.join(OUT, lang, 'widget');
    fs.mkdirSync(wdir, { recursive: true });
    fs.writeFileSync(path.join(wdir, 'index.html'), widgetPage(lang), 'utf8');
    listUrls.push(`${BASE}/${lang}/widget/`);
  }
  writeHomePages();
  const lastmod = new Date(now).toISOString().slice(0, 10);
  const SITEMAP_HEAD = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
  const entries = urls.map(({ c, lang }) =>
    `  <url>\n    <loc>${urlFor(lang, c)}</loc>\n    <lastmod>${lastmod}</lastmod>\n` +
    langsOf(c).map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${urlFor(l, c)}"/>`).join('\n') + `\n  </url>`)
    .concat(listUrls.map(u => `  <url>\n    <loc>${u}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`))
    .concat(homeSitemapEntries(lastmod));
  /* a sitemap file holds at most 50000 addresses: split and write an index */
  const PART = 45000, parts = [];
  for (let i = 0; i < entries.length; i += PART) parts.push(entries.slice(i, i + PART));
  if (parts.length === 1) {
    fs.writeFileSync(path.join(OUT, 'sitemap.xml'), SITEMAP_HEAD + parts[0].join('\n') + '\n</urlset>\n', 'utf8');
  } else {
    parts.forEach((p, i) => fs.writeFileSync(path.join(OUT, `sitemap-${i + 1}.xml`), SITEMAP_HEAD + p.join('\n') + '\n</urlset>\n', 'utf8'));
    const idx = parts.map((_, i) => `  <sitemap>\n    <loc>${BASE}/sitemap-${i + 1}.xml</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`).join('\n');
    fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${idx}\n</sitemapindex>\n`, 'utf8');
  }
  fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`, 'utf8');
  console.log('done:', urls.length, 'city pages,', listUrls.length, 'list pages, sitemap parts:', parts.length);
}

if (process.env.HOME_ONLY) buildHomeOnly(); else if (process.env.TERMS_ONLY) buildTermsOnly(); else build();
