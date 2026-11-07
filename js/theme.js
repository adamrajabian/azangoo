/* Copyright (c) 2026 azangoo.com. All rights reserved.
   Copying, reuse, modification or redistribution of this code, or of its calculations,
   is prohibited without written permission. See the Terms and conditions page. */
/* Theme switch: dark (default) or light. Chosen here it lasts for this visit;
   "save defaults" stores it together with the place, voice and language. */
(function () {
  'use strict';
  var sel = document.getElementById('themeSelect');
  function set(t) {
    document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
    if (sel) sel.value = t === 'light' ? 'light' : 'dark';
  }
  if (sel) {
    sel.value = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    sel.addEventListener('change', function () { set(sel.value); });
  }
  window.AzanTheme = { current: function () { return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }, set: set };
})();
