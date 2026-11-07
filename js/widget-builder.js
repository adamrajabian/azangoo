/* Copyright (c) 2026 azangoo.com. All rights reserved.
   Copying, reuse, modification or redistribution of this code, or of its calculations,
   is prohibited without written permission. See the Terms and conditions page. */
/* The code builder and the theme gallery of the widget guide page (/lang/widget/). Needs js/azangoo-widget.js. */
(function () {
  'use strict';
  var box = document.getElementById('wb');
  if (!box || !window.AzangooWidget) return;
  var lang = box.getAttribute('data-lang') || 'en';
  var copiedText = box.getAttribute('data-copied') || 'OK';
  var URL = window.AzangooWidget.base + 'js/azangoo-widget.js';

  /* the examples written in the page name the public address; show the address this site is really served from */
  Array.prototype.forEach.call(document.querySelectorAll('pre.wcode'), function (p) {
    p.textContent = p.textContent.replace('https://www.azangoo.com/js/azangoo-widget.js', URL);
  });

  /* theme gallery: every theme with a different place, names in the language of the page */
  var PLACES = [
    { lat: '21.4225', lng: '39.8262', tz: 'Asia/Riyadh',    n: { fa: 'مکه', en: 'Makkah', ur: 'مکہ', ar: 'مكة المكرمة' } },
    { lat: '35.6892', lng: '51.389',  tz: 'Asia/Tehran',    n: { fa: 'تهران', en: 'Tehran', ur: 'تہران', ar: 'طهران' } },
    { lat: '41.0082', lng: '28.9784', tz: 'Europe/Istanbul', n: { fa: 'استانبول', en: 'Istanbul', ur: 'استنبول', ar: 'إسطنبول' } },
    { lat: '31.5497', lng: '74.3436', tz: 'Asia/Karachi',   n: { fa: 'لاهور', en: 'Lahore', ur: 'لاہور', ar: 'لاهور' } }
  ];
  var THEMES = ['auto', 'light', 'night', 'dark', 'emerald', 'ocean', 'sand', 'rose'];
  var gal = document.getElementById('wb-gallery');
  if (gal) {
    THEMES.forEach(function (t, i) {
      var p = PLACES[i % PLACES.length], d = document.createElement('div');
      d.className = 'azangoo-widget';
      d.setAttribute('data-lat', p.lat); d.setAttribute('data-lng', p.lng); d.setAttribute('data-timezone', p.tz);
      d.setAttribute('data-name', p.n[lang] || p.n.en); d.setAttribute('data-lang', lang);
      d.setAttribute('data-theme', t); d.setAttribute('data-show', 'fajr,sunrise,dhuhr,maghrib');
      gal.appendChild(d);
    });
    window.AzangooWidget.init(gal);
  }

  /* the builder */
  function el(id) { return document.getElementById('b-' + id); }
  function val(id) { return el(id).value.trim(); }
  function attrs() {
    var a = [], lat = val('lat'), lng = val('lng');
    if (lat && lng) {
      a.push(['lat', lat], ['lng', lng]);
      if (val('city')) a.push(['name', val('city')]);
    } else {
      a.push(['city', val('city')]);
      if (val('cc')) a.push(['country', val('cc').toUpperCase()]);
    }
    if (val('tz')) a.push(['timezone', val('tz')]);
    a.push(['lang', val('lang')], ['theme', val('theme')], ['layout', val('layout')]);
    if (val('clock') === '12') a.push(['clock', '12']);
    if (el('custom').checked) a.push(['accent', val('accent')], ['bg', val('bg')], ['radius', val('radius')]);
    return a;
  }
  function update() {
    var a = attrs(), pv = document.getElementById('wb-preview');
    pv.innerHTML = '';
    var d = document.createElement('div');
    d.className = 'azangoo-widget';
    a.forEach(function (x) { d.setAttribute('data-' + x[0], x[1]); });
    pv.appendChild(d);
    window.AzangooWidget.render(d);
    document.getElementById('wb-out').value =
      '<div class="azangoo-widget"\n' + a.map(function (x) { return '     data-' + x[0] + '="' + x[1].replace(/"/g, '&quot;') + '"'; }).join('\n') +
      '></div>\n<script src="' + URL + '" async></' + 'script>';
  }
  var timer = null;
  function later() { clearTimeout(timer); timer = setTimeout(update, 350); }
  ['city', 'cc', 'lat', 'lng', 'tz', 'lang', 'theme', 'layout', 'clock', 'accent', 'bg', 'radius', 'custom'].forEach(function (k) {
    el(k).addEventListener('input', later); el(k).addEventListener('change', later);
  });
  var copy = document.getElementById('wb-copy'), copyLabel = copy.textContent;
  copy.addEventListener('click', function () {
    var out = document.getElementById('wb-out');
    out.select();
    function done() { copy.textContent = copiedText; setTimeout(function () { copy.textContent = copyLabel; }, 1500); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(out.value).then(done, function () { document.execCommand('copy'); done(); });
    else { try { document.execCommand('copy'); } catch (e) { /* the text stays selected */ } done(); }
  });
  update();
})();
