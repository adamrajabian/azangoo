/* Copyright (c) 2026 azangoo.com. All rights reserved.
   Azangoo prayer-times widget. A website owner may show the prayer times of a city on their own page by loading
   THIS file from the Azangoo site (see widget-demo.html). Copying, hosting elsewhere, modifying or redistributing
   this code, or its calculations, is prohibited without written permission. See the Terms and conditions page.

   Use:
     <div class="azangoo-widget" data-city="Toronto" data-lang="en" data-theme="auto"></div>
     <script src="https://arajabian.github.io/azangoo/js/azangoo-widget.js" async></script>
   or with coordinates:
     <div class="azangoo-widget" data-lat="43.65" data-lng="-79.38" data-name="Toronto" data-timezone="America/Toronto"></div>

   Options (all as data- attributes, or as keys of the object given to AzangooWidget.render):
     city, country   a city name (and an optional two-letter country code, e.g. "CA") that is looked up once and remembered
     lat, lng        coordinates (use these instead of city)
     name            the name written in the widget (default: the city name)
     timezone        IANA zone, e.g. "America/Toronto". With lat + lng + timezone the widget makes no request at all
     lang            fa | en | ur | ar            (default en)
     theme           auto | light | night | dark | emerald | ocean | sand | rose   (default auto)
     layout          list | grid | row            (default list)
     show            comma list of: fajr,sunrise,dhuhr,sunset,maghrib,midnight   (default: all)
     clock           24 | 12                      (default 24)
     digits          native | latin               (default native: Persian digits for fa / ur, Arabic-Indic for ar)
     next            1 | 0   mark the next adhan  (default 1)
     width           max width, e.g. "340px"      (default 360px)
     accent, bg, color, radius, font, size   your own look: any CSS color / length / font family
   The same look can also be set with CSS variables on the div: --azw-accent, --azw-bg, --azw-color, --azw-radius, --azw-font, --azw-size. */
(function (root) {
  'use strict';
  if (root.AzangooWidget) return;

  var SCRIPT = document.currentScript;
  if (!SCRIPT) {
    var all = document.getElementsByTagName('script');
    for (var i = all.length - 1; i >= 0; i--) { if (/azangoo-widget\.js/.test(all[i].src || '')) { SCRIPT = all[i]; break; } }
  }
  var SRC = (SCRIPT && SCRIPT.src) || '';
  var BASE = SRC ? SRC.replace(/js\/azangoo-widget\.js.*$/, '') : 'https://arajabian.github.io/azangoo/';
  var VER = (SRC.match(/[?&]v=([\w.-]+)/) || [])[1] || '';

  /* ---------- texts ---------- */
  var LANGS = {
    fa: { rtl: true,  brand: 'اذان‌گو', err: 'اوقات شرعی بارگذاری نشد', loc: 'شهر پیدا نشد', locale: 'fa-IR', am: 'ق.ظ', pm: 'ب.ظ', digits: '۰۱۲۳۴۵۶۷۸۹',
          n: { fajr: 'فجر', sunrise: 'طلوع', dhuhr: 'ظهر', sunset: 'غروب', maghrib: 'مغرب', midnight: 'نیمه‌شب' } },
    en: { rtl: false, brand: 'Azangoo', err: 'Could not load prayer times', loc: 'City not found', locale: 'en', am: 'AM', pm: 'PM', digits: '0123456789',
          n: { fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr', sunset: 'Sunset', maghrib: 'Maghrib', midnight: 'Midnight' } },
    ur: { rtl: true,  brand: 'اذان گو', err: 'اوقاتِ نماز لوڈ نہیں ہو سکے', loc: 'شہر نہیں ملا', locale: 'ur', am: 'صبح', pm: 'شام', digits: '۰۱۲۳۴۵۶۷۸۹',
          n: { fajr: 'فجر', sunrise: 'طلوع', dhuhr: 'ظہر', sunset: 'غروب', maghrib: 'مغرب', midnight: 'نصف شب' } },
    ar: { rtl: true,  brand: 'أذان غو', err: 'تعذّر تحميل أوقات الصلاة', loc: 'لم يتم العثور على المدينة', locale: 'ar', am: 'ص', pm: 'م', digits: '٠١٢٣٤٥٦٧٨٩',
          n: { fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر', sunset: 'الغروب', maghrib: 'المغرب', midnight: 'منتصف الليل' } }
  };
  var ORDER = ['fajr', 'sunrise', 'dhuhr', 'sunset', 'maghrib', 'midnight'];
  var NEXT_KEYS = ['fajr', 'sunrise', 'dhuhr', 'sunset', 'maghrib'];

  /* ---------- look ---------- */
  var CSS = [
    ':host{display:block}',
    '*{box-sizing:border-box;margin:0;padding:0}',
    '.w{--_bg:#fff;--_fg:#13303a;--_mut:rgba(19,48,58,.6);--_acc:#1c7f79;--_line:rgba(19,48,58,.12);--_hl:rgba(28,127,121,.12);--_hlfg:#0f5f5a;',
    '  --bg:var(--azw-bg,var(--_bg));--fg:var(--azw-color,var(--_fg));--acc:var(--azw-accent,var(--_acc));',
    '  font-family:var(--azw-font,inherit);font-size:var(--azw-size,15px);line-height:1.6;color:var(--fg);background:var(--bg);',
    '  border:1px solid var(--_line);border-radius:var(--azw-radius,14px);padding:14px 16px;max-width:var(--azw-width,360px);width:100%;overflow:hidden}',
    '.t-light{}',
    '.t-night{--_bg:#0b2530;--_fg:#f4ecd8;--_mut:rgba(244,236,216,.62);--_acc:#d2a94b;--_line:rgba(210,169,75,.38);--_hl:rgba(210,169,75,.18);--_hlfg:#f0d58a}',
    '.t-dark{--_bg:#16181d;--_fg:#e8eaed;--_mut:rgba(232,234,237,.6);--_acc:#8ab4f8;--_line:rgba(255,255,255,.14);--_hl:rgba(138,180,248,.16);--_hlfg:#aecbfa}',
    '.t-emerald{--_bg:#0f3d2e;--_fg:#e9f7ef;--_mut:rgba(233,247,239,.64);--_acc:#5fd3a0;--_line:rgba(95,211,160,.35);--_hl:rgba(95,211,160,.18);--_hlfg:#9be8c4}',
    '.t-ocean{--_bg:#0d2f55;--_fg:#eaf3ff;--_mut:rgba(234,243,255,.64);--_acc:#6cb8ff;--_line:rgba(108,184,255,.35);--_hl:rgba(108,184,255,.18);--_hlfg:#a9d5ff}',
    '.t-sand{--_bg:#f6efe0;--_fg:#3b2f1e;--_mut:rgba(59,47,30,.6);--_acc:#a8741a;--_line:rgba(168,116,26,.3);--_hl:rgba(168,116,26,.14);--_hlfg:#7d5410}',
    '.t-rose{--_bg:#fff1f3;--_fg:#4a1f2a;--_mut:rgba(74,31,42,.6);--_acc:#c2415d;--_line:rgba(194,65,93,.25);--_hl:rgba(194,65,93,.12);--_hlfg:#9c2c46}',
    '@media (prefers-color-scheme:dark){.t-auto{--_bg:#0b2530;--_fg:#f4ecd8;--_mut:rgba(244,236,216,.62);--_acc:#d2a94b;--_line:rgba(210,169,75,.38);--_hl:rgba(210,169,75,.18);--_hlfg:#f0d58a}}',
    '.hd{display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit}',
    '.hd img{width:34px;height:34px;border-radius:8px;flex:none;display:block}',
    '.ttl{min-width:0;display:flex;flex-direction:column}',
    '.brand{font-weight:700;color:var(--acc);font-size:.8em;letter-spacing:.02em}',
    '.city{font-weight:700;font-size:1.12em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.date{color:var(--_mut);font-size:.82em;margin-top:6px}',
    '.list{list-style:none;margin-top:10px}',
    '.it{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:7px 10px;border-radius:9px;border-top:1px solid var(--_line)}',
    '.it:first-child{border-top-color:transparent}',
    '.nm{color:var(--_mut)}',
    '.tm{font-weight:700;font-variant-numeric:tabular-nums;direction:ltr;unicode-bidi:isolate}',
    '.it.nx{background:var(--_hl);border-top-color:transparent}',
    '.it.nx .nm,.it.nx .tm{color:var(--_hlfg)}',
    '.it.nx+.it{border-top-color:transparent}',
    '.l-grid .list{display:grid;grid-template-columns:repeat(auto-fit,minmax(104px,1fr));gap:8px}',
    '.l-grid .it{flex-direction:column;justify-content:center;text-align:center;gap:2px;padding:9px 6px;border:1px solid var(--_line)}',
    '.l-grid .it.nx{border-color:transparent}',
    '.l-row{max-width:var(--azw-width,720px)}',
    '.l-row .main{display:flex;flex-wrap:wrap;align-items:center;gap:10px 18px}',
    '.l-row .hd{flex:none}',
    '.l-row .list{display:flex;flex-wrap:wrap;gap:6px;margin-top:0;flex:1 1 300px}',
    '.l-row .it{flex:1 1 74px;flex-direction:column;justify-content:center;text-align:center;gap:0;padding:6px 6px;border:0}',
    '.l-row .date{margin-top:8px}',
    '.ft{margin-top:10px;font-size:.74em;text-align:center}',
    '.ft a{color:var(--_mut);text-decoration:none}',
    '.ft a:hover{color:var(--acc)}',
    '.msg{margin-top:10px;color:var(--_mut);font-size:.9em}'
  ].join('\n');

  /* ---------- helpers ---------- */
  function lsGet(k) { try { var v = root.localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function lsSet(k, v) { try { root.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage may be blocked */ } }

  function getJson(url) {
    var ctl = root.AbortController ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, 7000) : null;
    return fetch(url, ctl ? { signal: ctl.signal } : {}).then(function (r) {
      if (timer) clearTimeout(timer);
      if (!r.ok) throw new Error('http ' + r.status);
      return r.json();
    }, function (e) { if (timer) clearTimeout(timer); throw e; });
  }

  var libQueue = null;
  function withLib(cb) {
    if (root.AzangooPrayerTimes) return cb(null, root.AzangooPrayerTimes);
    if (libQueue) { libQueue.push(cb); return; }
    libQueue = [cb];
    var s = document.createElement('script');
    s.src = BASE + 'js/azangoo-prayer-times.js' + (VER ? '?v=' + encodeURIComponent(VER) : '');
    s.onload = function () { var q = libQueue; libQueue = null; q.forEach(function (f) { f(null, root.AzangooPrayerTimes); }); };
    s.onerror = function () { var q = libQueue; libQueue = null; q.forEach(function (f) { f(new Error('lib')); }); };
    document.head.appendChild(s);
  }

  /* the time zone of a place: given, remembered, or asked (Open-Meteo, then timeapi.io) */
  function zoneOf(lat, lng) {
    var key = 'azw:tz:' + lat.toFixed(1) + ',' + lng.toFixed(1);
    var c = lsGet(key);
    if (c && c.z) return Promise.resolve(c.z);
    var q = 'latitude=' + lat.toFixed(4) + '&longitude=' + lng.toFixed(4);
    return getJson('https://api.open-meteo.com/v1/forecast?' + q + '&current=temperature_2m&timezone=auto')
      .then(function (d) { if (!d || !d.timezone) throw new Error('none'); return d.timezone; })
      .catch(function () {
        return getJson('https://timeapi.io/api/TimeZone/coordinate?latitude=' + lat.toFixed(4) + '&longitude=' + lng.toFixed(4))
          .then(function (d) { if (!d || !d.timeZone) throw new Error('none'); return d.timeZone; });
      })
      .then(function (z) { lsSet(key, { z: z }); return z; });
  }

  /* a city name -> coordinates, zone and name. Looked up once, then remembered for 60 days */
  function findCity(name, cc, lang) {
    var key = 'azw:city:' + lang + ':' + String(name).toLowerCase() + ':' + (cc || '');
    var c = lsGet(key);
    if (c && c.lat != null && Date.now() - (c.at || 0) < 60 * 86400000) return Promise.resolve(c);
    var url = 'https://geocoding-api.open-meteo.com/v1/search?count=1&format=json&language=' + encodeURIComponent(lang) +
              '&name=' + encodeURIComponent(name) + (cc ? '&countryCode=' + encodeURIComponent(cc) : '');
    return getJson(url).then(function (d) {
      var r = d && d.results && d.results[0];
      if (!r) { var e = new Error('nocity'); e.code = 'nocity'; throw e; }
      var out = { lat: r.latitude, lng: r.longitude, zone: r.timezone, name: r.name, at: Date.now() };
      lsSet(key, out);
      return out;
    });
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function toMin(t) { var p = String(t).split(':'); return (+p[0]) * 60 + (+p[1]); }
  function digits(s, L, mode) {
    if (mode === 'latin') return s;
    return String(s).replace(/\d/g, function (d) { return L.digits[+d]; });
  }
  function fmtTime(t, L, clock, dg) {
    var m = toMin(t), h = Math.floor(m / 60) % 24, mm = m % 60, out;
    if (clock === '12') {
      var ap = h >= 12 ? L.pm : L.am, h12 = h % 12 === 0 ? 12 : h % 12;
      out = h12 + ':' + pad(mm);
      return digits(out, L, dg) + ' ' + ap;
    }
    return digits(pad(h) + ':' + pad(mm), L, dg);
  }

  /* ---------- the widget ---------- */
  function readOptions(el, given) {
    var o = {}, ds = el && el.dataset ? el.dataset : {};
    ['city', 'country', 'lat', 'lng', 'name', 'timezone', 'lang', 'theme', 'layout', 'show', 'clock', 'digits', 'next', 'width',
     'accent', 'bg', 'color', 'radius', 'font', 'size'].forEach(function (k) {
      if (given && given[k] != null) o[k] = given[k]; else if (ds[k] != null) o[k] = ds[k];
    });
    return o;
  }

  function render(el, given) {
    if (!el || el.__azw) return;
    el.__azw = true;
    var o = readOptions(el, given);
    var lang = LANGS[o.lang] ? o.lang : 'en', L = LANGS[lang];
    var theme = /^(auto|light|night|dark|emerald|ocean|sand|rose)$/.test(o.theme) ? o.theme : 'auto';
    var layout = /^(list|grid|row)$/.test(o.layout) ? o.layout : 'list';
    var clock = o.clock === '12' ? '12' : '24';
    var dg = o.digits === 'latin' ? 'latin' : 'native';
    var showNext = o.next !== '0' && o.next !== 'false';
    var wanted = ',' + String(o.show || '').toLowerCase().replace(/\s/g, '') + ',';
    var show = ORDER.filter(function (k) { return !o.show || wanted.indexOf(',' + k + ',') >= 0; });
    if (!show.length) show = ORDER.slice();

    var host = el;
    var rootEl = el.attachShadow ? el.attachShadow({ mode: 'open' }) : el;
    if (o.accent) host.style.setProperty('--azw-accent', o.accent);
    if (o.bg) host.style.setProperty('--azw-bg', o.bg);
    if (o.color) host.style.setProperty('--azw-color', o.color);
    if (o.radius) host.style.setProperty('--azw-radius', /^\d+$/.test(o.radius) ? o.radius + 'px' : o.radius);
    if (o.font) host.style.setProperty('--azw-font', o.font);
    if (o.size) host.style.setProperty('--azw-size', /^\d+$/.test(o.size) ? o.size + 'px' : o.size);
    if (o.width) host.style.setProperty('--azw-width', /^\d+$/.test(o.width) ? o.width + 'px' : o.width);

    var style = document.createElement('style');
    style.textContent = CSS;
    var box = document.createElement('div');
    box.className = 'w t-' + theme + ' l-' + layout;
    box.setAttribute('dir', L.rtl ? 'rtl' : 'ltr');
    box.setAttribute('lang', lang);
    rootEl.appendChild(style);
    rootEl.appendChild(box);

    function message(text) {
      box.innerHTML = '';
      box.appendChild(header('', null));
      var m = document.createElement('div'); m.className = 'msg'; m.textContent = text; box.appendChild(m);
      box.appendChild(footer());
    }
    var siteLink = BASE + lang + '/index.html';
    function header(city, place) {
      var a = document.createElement('a');
      a.className = 'hd'; a.target = '_blank'; a.rel = 'noopener';
      a.href = place ? siteLink + '?lat=' + place.lat + '&lng=' + place.lng + (city ? '&city=' + encodeURIComponent(city) : '') : siteLink;
      var img = document.createElement('img'); img.src = BASE + 'icons/icon-192.png'; img.alt = 'Azangoo'; img.width = 34; img.height = 34;
      var t = document.createElement('div'); t.className = 'ttl';
      var b = document.createElement('span'); b.className = 'brand'; b.textContent = L.brand;
      t.appendChild(b);
      if (city) { var c = document.createElement('span'); c.className = 'city'; c.textContent = city; t.appendChild(c); }
      a.appendChild(img); a.appendChild(t);
      return a;
    }
    function footer() {
      var f = document.createElement('div'); f.className = 'ft';
      var a = document.createElement('a'); a.href = siteLink; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'azangoo.com';
      f.appendChild(a);
      return f;
    }

    function start(place, P) {
      var zone = place.zone, name = o.name || place.name || '';
      var timer = null;
      function draw() {
        var now = Date.now();
        var t = P.calculateForNow({ latitude: place.lat, longitude: place.lng, zoneName: zone, now: now });
        var tz = zone === 'Africa/Cairo' ? P.baseOffset(zone, now) : P.offsetAt(zone, now);
        var nowMin = Math.floor((now / 60000 + tz * 60) % 1440 + 1440) % 1440;
        var nx = null;
        if (showNext) {
          for (var i = 0; i < NEXT_KEYS.length; i++) {
            var k = NEXT_KEYS[i];
            if (show.indexOf(k) >= 0 && t[k] && toMin(t[k]) > nowMin) { nx = k; break; }
          }
          if (!nx && show.indexOf('fajr') >= 0) nx = 'fajr';
        }
        box.innerHTML = '';
        var main = document.createElement('div'); main.className = 'main';
        main.appendChild(header(name, place));
        var dateEl = null;
        try {
          var parts = String(t.localDate).split('-');
          var d = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2], 12));
          var f = new Intl.DateTimeFormat(L.locale + '-u-nu-latn', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
          var txt = f.format(d);
          if (lang !== 'en') {                                   /* one fixed order for the right-to-left languages: weekday, day month year */
            var pt = {};
            f.formatToParts(d).forEach(function (x) { pt[x.type] = x.value; });
            txt = pt.weekday + (lang === 'fa' ? ' ' : '، ') + pt.day + ' ' + pt.month + ' ' + pt.year;
          }
          dateEl = document.createElement('div'); dateEl.className = 'date'; dateEl.textContent = digits(txt, L, dg);
        } catch (e) { dateEl = null; }
        var ul = document.createElement('ul'); ul.className = 'list';
        show.forEach(function (k) {
          if (!t[k]) return;
          var li = document.createElement('li'); li.className = 'it' + (k === nx ? ' nx' : '');
          var n = document.createElement('span'); n.className = 'nm'; n.textContent = L.n[k];
          var v = document.createElement('span'); v.className = 'tm'; v.textContent = fmtTime(t[k], L, clock, dg);
          li.appendChild(n); li.appendChild(v); ul.appendChild(li);
        });
        if (layout === 'row') { main.appendChild(ul); box.appendChild(main); if (dateEl) box.appendChild(dateEl); }
        else { box.appendChild(main); if (dateEl) box.appendChild(dateEl); box.appendChild(ul); }
        box.appendChild(footer());
      }
      draw();
      /* the marked adhan and the date follow the clock */
      timer = setInterval(function () { if (!document.body.contains(host)) { clearInterval(timer); return; } draw(); }, 60 * 1000);
    }

    /* 1) what place is it? */
    var lat = parseFloat(o.lat), lng = parseFloat(o.lng);
    var placeP;
    if (isFinite(lat) && isFinite(lng)) {
      placeP = (o.timezone ? Promise.resolve(o.timezone) : zoneOf(lat, lng)).then(function (z) { return { lat: lat, lng: lng, zone: z, name: '' }; });
    } else if (o.city) {
      placeP = findCity(o.city, o.country, lang).then(function (c) {
        return { lat: c.lat, lng: c.lng, zone: o.timezone || c.zone, name: c.name || o.city };
      });
    } else {
      message(L.loc);
      return;
    }
    /* 2) then the calculation (the library is loaded from the Azangoo site when the page does not have it) */
    placeP.then(function (place) {
      withLib(function (err, P) {
        if (err || !P) { message(L.err); return; }
        try { start(place, P); } catch (e) { message(L.err); }
      });
    }).catch(function (e) { message(e && e.code === 'nocity' ? L.loc : L.err); });
  }

  function init(scope) {
    var list = (scope || document).querySelectorAll('.azangoo-widget, [data-azangoo]');
    for (var i = 0; i < list.length; i++) render(list[i]);
  }

  root.AzangooWidget = { render: render, init: init, base: BASE };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); });
  else init();
})(window);
