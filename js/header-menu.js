/* Copyright (c) 2026 azangoo.com. All rights reserved.
   Copying, reuse, modification or redistribution of this code, or of its calculations,
   is prohibited without written permission. See the Terms and conditions page. */
/* Header controls (language + theme).
   Desktop (>= 900px): the two round <select> icons are replaced by a moon|sun switch and a "Language" pill
   with our own wide dropdown. Phones and small tablets keep the round icon buttons and the native picker.
   The <select> elements always stay in the page and keep firing "change", so lang.js / theme.js are untouched.
   Tooltips: the language control always says "Languages" (every language); the theme control says
   "Theme" in the language of the page. */
(function () {
  'use strict';
  var langSel = document.getElementById('langSelect');
  var themeSel = document.getElementById('themeSelect');
  var menu = null, owner = null, anchor = null;
  var themeBox = null, themeBtns = {}, langBtn = null;

  var SVG = {
    moon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    globe: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
    chev: '<svg class="hm-chev" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>'
  };

  function tr(key, fallback) {
    try { var v = window.AzanLang && window.AzanLang.t(key); if (v && v !== key) return v; } catch (e) {}
    return fallback;
  }
  function finePointer() {
    return !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  }

  function labels() {
    var title = tr('theme_title', 'Theme');
    if (langSel) { langSel.title = 'Languages'; langSel.setAttribute('aria-label', 'Languages'); }
    if (themeSel) { themeSel.title = title; themeSel.setAttribute('aria-label', title); }
    if (langBtn) { langBtn.title = 'Languages'; langBtn.setAttribute('aria-label', 'Languages'); }
    if (themeBox) {
      themeBox.title = title; themeBox.setAttribute('aria-label', title);
      themeBtns.dark.title = tr('theme_dark', 'Dark'); themeBtns.dark.setAttribute('aria-label', themeBtns.dark.title);
      themeBtns.light.title = tr('theme_light', 'Light'); themeBtns.light.setAttribute('aria-label', themeBtns.light.title);
    }
  }

  /* ---------- dropdown ---------- */
  function close(refocus) {
    if (!menu) return;
    document.removeEventListener('mousedown', onDoc, true);
    document.removeEventListener('keydown', onKey, true);
    window.removeEventListener('resize', onAway);
    window.removeEventListener('scroll', onAway, true);
    menu.parentNode && menu.parentNode.removeChild(menu);
    if (anchor) { anchor.setAttribute('aria-expanded', 'false'); anchor.classList.remove('is-open'); if (refocus) anchor.focus(); }
    menu = null; owner = null; anchor = null;
  }
  function onDoc(e) { if (menu && !menu.contains(e.target) && !(anchor && anchor.contains(e.target))) close(false); }
  function onAway() { close(false); }
  function onKey(e) {
    if (!menu) return;
    var items = Array.prototype.slice.call(menu.querySelectorAll('button'));
    var i = items.indexOf(document.activeElement);
    if (e.key === 'Escape') { e.preventDefault(); close(true); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    else if (e.key === 'Tab') { close(false); }
  }
  function currentValue(sel) {
    if (sel === langSel) return (window.AzanLang && window.AzanLang.current && window.AzanLang.current()) || '';
    return sel.value;
  }

  function open(sel, anchorEl) {
    var a = anchorEl || sel;
    if (menu && anchor === a) { close(true); return; }
    close(false);
    var cur = currentValue(sel);
    menu = document.createElement('div');
    menu.className = 'hm-menu';
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('dir', 'ltr');           /* the list itself is fixed; each name sits in its own script */
    var focusBtn = null;
    Array.prototype.forEach.call(sel.options, function (o) {
      if (!o.value) return;                    /* skip the empty "Languages" head option */
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'option');
      b.setAttribute('data-value', o.value);
      if (sel === langSel) b.setAttribute('lang', o.value);
      b.setAttribute('dir', 'auto');
      b.textContent = o.textContent;
      var on = o.value === cur;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      if (on) focusBtn = b;
      b.addEventListener('click', function () {
        var v = o.value;
        close(true);
        sel.value = v;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      });
      menu.appendChild(b);
    });
    document.body.appendChild(menu);
    var r = a.getBoundingClientRect();
    var w = menu.offsetWidth;
    var left = (document.documentElement.dir === 'rtl') ? r.right - w : r.left;
    left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
    menu.style.left = left + 'px';
    menu.style.top = (r.bottom + 6) + 'px';
    owner = sel; anchor = a;
    a.setAttribute('aria-expanded', 'true'); a.classList.add('is-open');
    document.addEventListener('mousedown', onDoc, true);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', onAway);
    window.addEventListener('scroll', onAway, true);
    (focusBtn || menu.querySelector('button')).focus();
  }

  /* small screens / tablets with a mouse: the round select icon opens the same menu */
  function wire(sel) {
    if (!sel) return;
    sel.setAttribute('aria-haspopup', 'listbox');
    sel.setAttribute('aria-expanded', 'false');
    sel.addEventListener('mousedown', function (e) {
      if (e.button !== 0 || !finePointer()) return;   /* touch: native picker */
      e.preventDefault(); sel.focus(); open(sel);
    });
    sel.addEventListener('keydown', function (e) {
      if (!finePointer()) return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(sel); }
    });
  }

  /* ---------- desktop controls (CSS shows them from 900px) ---------- */
  function buildTheme() {
    if (!themeSel || !themeSel.parentNode) return;
    themeBox = document.createElement('div');
    themeBox.className = 'hm-theme';
    themeBox.setAttribute('role', 'radiogroup');
    themeBox.setAttribute('dir', 'ltr');               /* moon on the left, sun on the right in every language */
    [['dark', SVG.moon], ['light', SVG.sun]].forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'hm-seg';
      b.setAttribute('role', 'radio');
      b.setAttribute('data-theme-value', p[0]);
      b.innerHTML = p[1];
      b.addEventListener('click', function () {
        if (themeSel.value === p[0]) return;
        themeSel.value = p[0];
        themeSel.dispatchEvent(new Event('change', { bubbles: true }));
        syncTheme();
      });
      themeBtns[p[0]] = b;
      themeBox.appendChild(b);
    });
    themeSel.parentNode.appendChild(themeBox);
  }
  function syncTheme() {
    if (!themeBox) return;
    var cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    ['dark', 'light'].forEach(function (k) {
      themeBtns[k].setAttribute('aria-checked', k === cur ? 'true' : 'false');
      themeBtns[k].classList.toggle('on', k === cur);
    });
  }
  function buildLang() {
    if (!langSel || !langSel.parentNode) return;
    langBtn = document.createElement('button');
    langBtn.type = 'button';
    langBtn.className = 'hm-lang';
    langBtn.setAttribute('aria-haspopup', 'listbox');
    langBtn.setAttribute('aria-expanded', 'false');
    langBtn.innerHTML = SVG.globe + '<span class="hm-lang-t">Language</span>' + SVG.chev;
    langBtn.addEventListener('click', function () { open(langSel, langBtn); });
    langSel.parentNode.appendChild(langBtn);
  }

  buildTheme(); buildLang(); syncTheme(); labels();
  wire(langSel); wire(themeSel);
  window.addEventListener('azan:langchange', labels);
  /* the theme can also change from "save defaults" / scripts: follow the attribute */
  if (window.MutationObserver) {
    new MutationObserver(syncTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }
})();
