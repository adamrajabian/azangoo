/* Copyright (c) 2026 azangoo.com. All rights reserved.
   Copying, reuse, modification or redistribution of this code, or of its calculations,
   is prohibited without written permission. See the Terms and conditions page. */
/* Monthly prayer-time PDF.
   Builds one row per day (Gregorian, Solar Hijri and Hijri dates plus the prayer times of the
   selected place), renders the table with html2canvas and writes it to a PDF with jsPDF.
   Requires: js/azangoo-prayer-times.js. jsPDF and html2canvas are loaded only when a PDF is made. */
(function (root) {
  'use strict';

  function fa(s) { return window.AzanLang.num(s); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  var fmtPersian = new Intl.DateTimeFormat('en-u-ca-persian-nu-latn', { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' });
  var fmtHijri = new Intl.DateTimeFormat('en-u-ca-islamic-tbla-nu-latn', { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' });

  function parts(fmt, ms) {
    var p = {};
    fmt.formatToParts(new Date(ms)).forEach(function (x) { if (x.type !== 'literal') p[x.type] = +x.value; });
    return p;
  }

  // Gregorian days of a Gregorian month
  function gregorianMonthDays(year, month) {
    var n = new Date(Date.UTC(year, month, 0)).getUTCDate(), out = [];
    for (var d = 1; d <= n; d++) out.push({ gy: year, gm: month, gd: d, ms: Date.UTC(year, month - 1, d, 12) });
    return out;
  }

  // Gregorian days that fall in a Solar Hijri month (found with Intl, no conversion formulas)
  function shamsiMonthDays(year, month) {
    var g0 = Date.UTC(year + 621 - 1, 0, 1, 12), g1 = Date.UTC(year + 621 + 1, 11, 31, 12), out = [];
    for (var ms = g0; ms <= g1; ms += 86400000) {
      var p = parts(fmtPersian, ms);
      if (p.year === year && p.month === month) {
        var g = new Date(ms);
        out.push({ gy: g.getUTCFullYear(), gm: g.getUTCMonth() + 1, gd: g.getUTCDate(), ms: ms });
      }
    }
    return out;
  }

  // one row per day
  /* Hijri date of a day: the official list when it covers the day, otherwise the calendar's own value */
  function hijriLabel(d, hj) {
    var OFF = window.AzanOfficial, A = window.AzanLang;
    var ymd = d.gy + '-' + pad2(d.gm) + '-' + pad2(d.gd);
    var e = OFF ? OFF.covering(ymd) : null;
    if (e) {
      var idx = Math.round((Date.UTC(d.gy, d.gm - 1, d.gd) - OFF.dayMs(e.start)) / 86400000) + 1;
      return fa(idx) + ' ' + A.names('hijri')[(+e.hijriMonth - 1 + 12) % 12] + ' ' + fa(e.hijriYear);
    }
    return hj.day + ' ' + A.names('hijri')[hj.month - 1] + ' ' + hj.year;
  }

  function buildRows(mode, year, month, place) {
    var days = mode === 'greg' ? gregorianMonthDays(year, month) : shamsiMonthDays(year, month);
    var P = root.AzangooPrayerTimes;
    return days.map(function (d) {
      var tz = place.zoneName ? P.offsetAt(place.zoneName, d.ms) : place.fallbackOffsetHours;
      var t = P.calculatePrayerTimes({
        latitude: place.latitude, longitude: place.longitude,
        year: d.gy, month: d.gm, day: d.gd, timeZoneOffsetHours: tz
      });
      var sh = parts(fmtPersian, d.ms), hj = parts(fmtHijri, d.ms);
      return {
        weekday: window.AzanLang.names('weekdays')[new Date(d.ms).getUTCDay()],
        greg: d.gd + ' ' + window.AzanLang.names('greg')[d.gm - 1] + ' ' + d.gy,
        shamsi: sh.day + ' ' + window.AzanLang.names('shamsi')[sh.month - 1] + ' ' + sh.year,
        hijri: hijriLabel(d, hj),
        fajr: t.fajr, sunrise: t.sunrise, dhuhr: t.dhuhr,
        sunset: t.sunset, maghrib: t.maghrib, midnight: t.midnight
      };
    });
  }

  function monthTitle(mode, year, month) {
    return (window.AzanLang.names(mode === 'greg' ? 'greg' : 'shamsi')[month - 1]) + ' ' + fa(year);
  }

  /* small logo at the top of the PDF (the same logo in every language) */
  function logoSrc() {
    return 'images/azangoo-logo-448.webp';                  /* the same logo as the main page, in every language (larger file for a sharp print) */
  }

  function tableHtml(rows, title, subtitle) {
    var head = '<tr><th>' + window.AzanLang.t('pdf_day') + '</th><th>' + window.AzanLang.t('pdf_greg') + '</th><th>' + window.AzanLang.t('pdf_shamsi') + '</th><th>' + window.AzanLang.t('pdf_hijri') + '</th>' +
      '<th>' + window.AzanLang.t('pdf_fajr') + '</th><th>' + window.AzanLang.t('pdf_sunrise') + '</th><th>' + window.AzanLang.t('pdf_dhuhr') + '</th><th>' + window.AzanLang.t('pdf_sunset') + '</th><th>' + window.AzanLang.t('pdf_maghrib') + '</th><th>' + window.AzanLang.t('pdf_midnight') + '</th></tr>';
    var body = rows.map(function (r) {
      return '<tr><td>' + r.weekday + '</td><td>' + fa(r.greg) + '</td><td>' + fa(r.shamsi) + '</td><td>' + fa(r.hijri) + '</td>' +
        '<td>' + fa(r.fajr) + '</td><td>' + fa(r.sunrise) + '</td><td>' + fa(r.dhuhr) + '</td>' +
        '<td>' + fa(r.sunset) + '</td><td>' + fa(r.maghrib) + '</td><td>' + fa(r.midnight) + '</td></tr>';
    }).join('');
    var dir = window.AzanLang.isRtl() ? 'rtl' : 'ltr';
    return '<div style="font-family:Vazirmatn,Tahoma,sans-serif;direction:' + dir + ';color:#000;background:#fff;padding:18px;width:1000px">' +
      '<div style="text-align:center;margin-bottom:10px">' +
      /* the same logo as the main page (it carries the site name, so no frame or caption is added) */
      '<img src="' + logoSrc() + '" alt="' + window.AzanLang.t('logo_alt') + '" style="display:block;width:auto;height:130px;margin:0 auto 4px">' +
      '<div style="font-size:18px;font-weight:700;margin-top:4px">' + title + '</div>' +
      '<div style="font-size:13px;margin-top:4px">' + subtitle + '</div></div>' +
      '<table style="width:100%;border-collapse:collapse;font-size:12px;text-align:center">' +
      '<thead style="background:#e8dcc0">' + head.replace(/<th>/g, '<th style="border:1px solid #888;padding:5px 3px">') + '</thead>' +
      '<tbody>' + body.replace(/<td>/g, '<td style="border:1px solid #888;padding:4px 3px">') + '</tbody></table></div>';
  }

  /* the PDF libraries are loaded the first time a PDF is made, not with the page */
  var LIBS = [
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
  ];
  var libsReady = null;
  function loadScript(url) {
    return new Promise(function (ok, fail) {
      var s = document.createElement('script');
      s.src = url; s.async = true;
      s.onload = ok; s.onerror = function () { fail(new Error('could not load ' + url)); };
      document.head.appendChild(s);
    });
  }
  function ensureLibs() {
    if (root.jspdf && root.html2canvas) return Promise.resolve();
    if (!libsReady) libsReady = Promise.all(LIBS.map(loadScript));
    return libsReady;
  }

  function newPdf() {
    var jsPDF = root.jspdf && root.jspdf.jsPDF;
    if (!jsPDF) throw new Error('jsPDF is not loaded');
    return new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  }

  /* the small note at the bottom of every page, drawn like the table (with the page font, so it works in every language) */
  function renderNote() {
    var A = window.AzanLang, dir = A.isRtl() ? 'rtl' : 'ltr';
    var box = document.createElement('div');
    box.style.cssText = 'position:fixed;left:-10000px;top:0;';
    box.innerHTML = '<div style="font-family:Vazirmatn,Tahoma,sans-serif;direction:' + dir + ';color:#555;background:#fff;width:1000px;padding:6px 18px;' +
      'box-sizing:border-box;text-align:center;font-size:11px;line-height:1.7;border-top:1px solid #c9982f">' + A.t('pdf_note') + '</div>';
    document.body.appendChild(box);
    return root.html2canvas(box.firstChild, { scale: 2, backgroundColor: '#ffffff' }).finally(function () { box.remove(); });
  }

  /* add one rendered month to the PDF, on as many A4 pages as it needs; the note goes at the bottom of each page */
  function addCanvas(pdf, canvas, startNewPage, note) {
    var margin = 8, pageW = 210, pageH = 297;
    var printW = pageW - 2 * margin, ratio = printW / canvas.width;
    var noteH = note ? note.height * (printW / note.width) : 0;       /* height of the note on the page, mm */
    var pagePx = (pageH - 2 * margin - (note ? noteH + 3 : 0)) / ratio, y = 0, first = true;
    while (y < canvas.height) {
      var h = Math.min(pagePx, canvas.height - y);
      var part = document.createElement('canvas');
      part.width = canvas.width; part.height = h;
      part.getContext('2d').drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
      if (!first || startNewPage) pdf.addPage();
      pdf.addImage(part.toDataURL('image/jpeg', 0.92), 'JPEG', margin, margin, printW, h * ratio);
      if (note) pdf.addImage(note.toDataURL('image/jpeg', 0.92), 'JPEG', margin, pageH - margin - noteH, printW, noteH);
      first = false;
      y += pagePx;
    }
  }

  function renderMonth(mode, year, month, place, city) {
    var rows = buildRows(mode, year, month, place);
    var title = window.AzanLang.t('pdf_title') + ' ' + monthTitle(mode, year, month);
    var subtitle = (city ? city + ' · ' : '') + fa(place.latitude.toFixed(4)) +
      (window.AzanLang.isRtl() ? '، ' : ', ') + fa(place.longitude.toFixed(4)) +
      (place.zoneName ? ' · ' + place.zoneName : '');
    var box = document.createElement('div');
    box.style.cssText = 'position:fixed;left:-10000px;top:0;';
    box.innerHTML = tableHtml(rows, title, subtitle);
    document.body.appendChild(box);
    var img = box.querySelector('img');
    var ready = (!img || img.complete) ? Promise.resolve() : new Promise(function (ok) {
      img.onload = ok; img.onerror = ok;
    });
    return ready.then(function () {
      return root.html2canvas(box.firstChild, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
    }).finally(function () { box.remove(); });
  }

  /**
   * opts: { mode: 'greg'|'shamsi', year, month, place: {latitude, longitude, zoneName, fallbackOffsetHours}, city }
   * returns a promise that resolves when the file is saved
   */
  function generate(opts) {
    var p = opts.place, kind = opts.mode === 'greg' ? 'gregorian' : 'shamsi';
    var months = opts.month === 0 ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : [opts.month];
    var fileName = 'prayer-times-' + kind + '-' + opts.year + (opts.month === 0 ? '-all' : '-' + pad2(opts.month)) + '.pdf';
    var pdf = null, note = null, chain = ensureLibs().then(function () { pdf = newPdf(); return renderNote(); }).then(function (c) { note = c; });
    months.forEach(function (m, i) {
      chain = chain.then(function () {
        return renderMonth(opts.mode, opts.year, m, p, opts.city).then(function (canvas) {
          addCanvas(pdf, canvas, i > 0, note);
        });
      });
    });
    return chain.then(function () { pdf.save(fileName); });
  }

  var api = { generate: generate, buildRows: buildRows, shamsiMonthDays: shamsiMonthDays, gregorianMonthDays: gregorianMonthDays };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.AzanPdf = api;
})(typeof window !== 'undefined' ? window : globalThis);
