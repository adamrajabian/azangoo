/* Copyright (c) 2026 azangoo.com. All rights reserved.
   Copying, reuse, modification or redistribution of this code, or of its calculations,
   is prohibited without written permission. See the Terms and conditions page. */
/* City pages: the times are written at build time, then recalculated here for the visitor's current day.
   Needs js/azangoo-prayer-times.js. The page still shows the built values if this script does not run. */
(function () {
  'use strict';
  var main = document.querySelector('main[data-lat][data-lng][data-zone]');
  if (!main || !window.AzangooPrayerTimes) return;

  var lang = main.getAttribute('data-lang') || 'en';
  var DIGITS = { fa: '۰۱۲۳۴۵۶۷۸۹', ur: '۰۱۲۳۴۵۶۷۸۹', ar: '٠١٢٣٤٥٦٧٨٩', en: '0123456789' };
  function fmt(s) {
    var set = DIGITS[lang] || DIGITS.en;
    return String(s).replace(/\d/g, function (d) { return set[+d]; });
  }

  function update() {
    var t = window.AzangooPrayerTimes.calculateForNow({
      latitude: parseFloat(main.getAttribute('data-lat')),
      longitude: parseFloat(main.getAttribute('data-lng')),
      zoneName: main.getAttribute('data-zone'),
      now: Date.now()
    });
    document.querySelectorAll('td[data-t]').forEach(function (cell) {
      var key = cell.getAttribute('data-t');
      if (t[key]) cell.textContent = fmt(t[key]);
    });
  }

  /* the link back to the main page is named "main page" in every language */
  var MAIN_LABEL = { fa: 'باز کردن صفحه اصلی', en: 'Open the main page', ur: 'مرکزی صفحہ کھولیں', ar: 'افتح الصفحة الرئيسية' };
  var label = MAIN_LABEL[document.documentElement.lang] || MAIN_LABEL.en;
  document.querySelectorAll('a[href*="index.html?lat="]').forEach(function (a) { a.textContent = label; });

  update();
  /* recalculate after midnight and every few minutes, so a long-open page stays right */
  setInterval(update, 5 * 60 * 1000);
})();
