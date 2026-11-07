/* Copyright (c) 2026 azangoo.com. All rights reserved.
   Copying, reuse, modification or redistribution of this code, or of its calculations,
   is prohibited without written permission. See the Terms and conditions page. */
/* Calendar card: month stepper (arrows for month and year, year can also be typed), "all months" box, and the PDF button.
   The Solar Hijri tab is shown only on the Persian page; other languages use the Gregorian calendar only. */
(function () {
  'use strict';
  var A = window.AzanLang;
  var LIMITS = { shamsi: [1300, 1500], greg: [1920, 2100] };   /* typed or stepped years stay inside these */
  var mode = 'shamsi';
  var faMode = 'shamsi';                   /* the tab last used on the Persian page */
  var state = { shamsi: [1405, 1], greg: [2026, 1] };          /* [year, month] of each calendar, set to today below */
  var allMonths = false;

  var yearEl = document.getElementById('calYear'),
      monthNameEl = document.getElementById('calMonthName'),
      allEl = document.getElementById('calAll'),
      msgEl = document.getElementById('calMsg'),
      form = document.getElementById('panel-cal'),
      tabsBox = document.querySelector('.calendar .tabs'),
      btn = {
        py: document.getElementById('calPrevYear'), pm: document.getElementById('calPrevMonth'),
        nm: document.getElementById('calNextMonth'), ny: document.getElementById('calNextYear')
      },
      tabs = { greg: document.getElementById('tab-greg'), shamsi: document.getElementById('tab-sol') };
  if (!yearEl || !monthNameEl || !btn.py) return;

  /* today's month in both calendars (the browser's own calendar data, no conversion formulas) */
  (function today() {
    var now = new Date();
    state.greg = [now.getFullYear(), now.getMonth() + 1];
    try {
      var p = new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', { year: 'numeric', month: 'numeric' }).formatToParts(now), y = 0, m = 0;
      p.forEach(function (x) { if (x.type === 'year') y = parseInt(x.value, 10); if (x.type === 'month') m = parseInt(x.value, 10); });
      if (y && m) state.shamsi = [y, m];
    } catch (e) { /* keep the default */ }
  })();

  function clampYear(y) { var r = LIMITS[mode]; return Math.max(r[0], Math.min(r[1], y)); }

  function render() {
    var s = state[mode], r = LIMITS[mode];
    yearEl.value = A.num(s[0]);
    monthNameEl.textContent = A.names(mode === 'greg' ? 'greg' : 'shamsi')[s[1] - 1];
    monthNameEl.classList.toggle('dim', allMonths);
    if (allEl) allEl.checked = allMonths;
    btn.py.disabled = s[0] <= r[0];
    btn.ny.disabled = s[0] >= r[1];
    btn.pm.disabled = allMonths || (s[0] <= r[0] && s[1] === 1);
    btn.nm.disabled = allMonths || (s[0] >= r[1] && s[1] === 12);
    btn.py.setAttribute('aria-label', A.t('cal_prev_y')); btn.py.title = A.t('cal_prev_y');
    btn.ny.setAttribute('aria-label', A.t('cal_next_y')); btn.ny.title = A.t('cal_next_y');
    btn.pm.setAttribute('aria-label', A.t('cal_prev_m')); btn.pm.title = A.t('cal_prev_m');
    btn.nm.setAttribute('aria-label', A.t('cal_next_m')); btn.nm.title = A.t('cal_next_m');
    yearEl.setAttribute('aria-label', A.t('cal_year'));
    var allText = document.getElementById('calAllText');
    if (allText) allText.textContent = A.t('months_all');
    var el = document.getElementById('calLabel');            /* the label names the calendar in use */
    if (el) el.textContent = A.t(mode === 'greg' ? 'cal_pick_greg' : 'cal_pick_shamsi');
    refreshAnnual();
  }

  function stepMonth(d) {
    var s = state[mode], y = s[0], m = s[1] + d;
    if (m > 12) { m = 1; y++; } else if (m < 1) { m = 12; y--; }
    if (y < LIMITS[mode][0] || y > LIMITS[mode][1]) return;
    state[mode] = [y, m]; msgEl.textContent = ''; render();
  }
  function stepYear(d) {
    var y = state[mode][0] + d;
    if (y < LIMITS[mode][0] || y > LIMITS[mode][1]) return;
    state[mode][0] = y; msgEl.textContent = ''; render();
  }
  /* a typed year: digits of any language are accepted; anything else puts the old year back */
  function commitYear() {
    var v = parseInt(A.toAscii(yearEl.value).replace(/[^0-9]/g, ''), 10);
    if (!v) { msgEl.textContent = A.t('cal_pick_ym'); render(); return false; }
    state[mode][0] = clampYear(v); msgEl.textContent = ''; render();
    return true;
  }

  btn.py.addEventListener('click', function () { stepYear(-1); });
  btn.ny.addEventListener('click', function () { stepYear(1); });
  btn.pm.addEventListener('click', function () { stepMonth(-1); });
  btn.nm.addEventListener('click', function () { stepMonth(1); });
  yearEl.addEventListener('change', commitYear);
  yearEl.addEventListener('focus', function () { try { yearEl.select(); } catch (e) {} });
  if (allEl) allEl.addEventListener('change', function () { allMonths = allEl.checked; render(); });

  function setMode(m) {
    mode = m;
    Object.keys(tabs).forEach(function (k) {
      var on = k === m;
      tabs[k].classList.toggle('active', on);
      tabs[k].setAttribute('aria-selected', on ? 'true' : 'false');
    });
    msgEl.textContent = '';
    render();
  }
  Object.keys(tabs).forEach(function (k) {
    tabs[k].addEventListener('click', function () { if (k === mode) return; faMode = k; setMode(k); });
  });

  /* Persian page: both tabs. Other languages: Gregorian only, tabs hidden */
  function syncLang() {
    var fa = A.current() === 'fa';
    if (tabsBox) tabsBox.hidden = !fa;
    setMode(fa ? faMode : 'greg');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!commitYear()) return;
    var place = window.AzanPlace;
    if (!place) { msgEl.textContent = A.t('cal_need_place'); return; }
    if (!window.AzanPdf) { msgEl.textContent = A.t('cal_no_pdf'); return; }
    var year = state[mode][0], month = allMonths ? 0 : state[mode][1];
    window.CalendarPick = { mode: mode, year: year, month: month };
    msgEl.textContent = A.t('cal_busy');
    var city = (document.getElementById('city') || {}).value || '';
    window.AzanPdf.generate({ mode: mode, year: year, month: month, place: place, city: city })
      .then(function () { msgEl.textContent = A.t('cal_done'); })
      .catch(function (err) { msgEl.textContent = A.t('cal_fail'); console.error(err); });
  });

  /* annual calendar: the Hijri months of the chosen year for the chosen place */
  var annualBtn = document.getElementById('annualBtn'), annualBox = document.getElementById('annualBox');
  var annualYear = null;
  function offsetNow(place) {
    if (place.zoneName && window.AzangooPrayerTimes) return window.AzangooPrayerTimes.offsetAt(place.zoneName, Date.now());
    return place.fallbackOffsetHours;
  }
  function renderAnnual() {
    if (!annualBox) return;
    var place = window.AzanPlace;
    if (!place || !window.MoonInfo) { annualBox.innerHTML = '<p class="msg">' + A.t('cal_need_place') + '</p>'; return; }
    var year = annualYear || state[mode][0];
    var rows = window.MoonInfo.yearMonths(mode, year, place.latitude, place.longitude, offsetNow(place));
    var html = '<p class="annual-title">' + A.t('ann_title') + ' ' + A.num(year) + '</p>' +
      '<div class="annual-scroll"><table class="annual"><thead><tr>' +
      '<th>' + A.t('ann_hijri') + '</th><th>' + A.t('ann_greg') + '</th><th>' + A.t('ann_shamsi') + '</th><th>' + A.t('ann_len') + '</th>' +
      '</tr></thead><tbody>';
    rows.forEach(function (r) {
      html += '<tr><td>' + r.hijriName + ' ' + A.num(r.hijriYear) + (r.official ? ' ' + A.t('official_mark') : '') + '</td>' +
        '<td>' + A.num(r.greg.d) + ' ' + A.names('greg')[r.greg.m - 1] + ' ' + A.num(r.greg.y) + '</td>' +
        '<td>' + A.num(r.shamsi.d) + ' ' + A.names('shamsi')[r.shamsi.m - 1] + ' ' + A.num(r.shamsi.y) + '</td>' +
        '<td>' + A.num(r.len) + ' ' + A.t('ann_days') + '</td></tr>';
    });
    annualBox.innerHTML = html + '</tbody></table></div>';
  }
  function refreshAnnual() { annualYear = null; if (annualBox && annualBox.innerHTML) renderAnnual(); }
  /* one button opens and closes the annual calendar: open -> close it, closed -> open it */
  if (annualBtn) annualBtn.addEventListener('click', function () {
    if (annualBox && annualBox.innerHTML) {
      annualBox.innerHTML = '';
      annualBtn.setAttribute('aria-expanded', 'false');
      return;
    }
    annualBtn.setAttribute('aria-expanded', 'true');
    annualYear = null;
    renderAnnual();
  });
  window.addEventListener('azan:langchange', function () { if (annualBox && annualBox.innerHTML) renderAnnual(); });
  window.addEventListener('azan:langchange', syncLang);
  syncLang();
})();
