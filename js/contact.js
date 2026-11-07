/* Copyright (c) 2026 azangoo.com. All rights reserved.
   Copying, reuse, modification or redistribution of this code, or of its calculations,
   is prohibited without written permission. See the Terms and conditions page. */
/* Contact button: opens a small dialog with the email, a mailto link and a copy button. */
(function () {
  'use strict';
  var EMAIL = 'info.azangoo@gmail.com';          /* fallback; data/config.json (contactEmail) replaces it when it can be read */
  function email() {
    var c = window.AzanConfig && window.AzanConfig.contactEmail;
    return (typeof c === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.trim())) ? c.trim() : EMAIL;
  }
  function showEmail() {
    var a = document.querySelector('#contactDlg .contact-mail a'), e = email();
    if (a) { a.setAttribute('href', 'mailto:' + e); a.textContent = e; }
  }
  var dlg = document.getElementById('contactDlg'),
      openBtn = document.getElementById('contactBtn'),
      closeBtn = document.getElementById('closeContact'),
      copyBtn = document.getElementById('copyMail'),
      copyMsg = document.getElementById('copyMsg');
  if (!dlg || !openBtn) return;

  openBtn.addEventListener('click', function () {
    copyMsg.textContent = '';
    showEmail();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  });
  closeBtn.addEventListener('click', function () {
    if (dlg.close) dlg.close(); else dlg.removeAttribute('open');
  });
  copyBtn.addEventListener('click', function () {
    var done = function () { copyMsg.textContent = window.AzanLang.t('copied'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email()).then(done, function () {});
    } else {
      var ta = document.createElement('textarea');
      ta.value = email(); document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) {}
      ta.remove();
    }
  });

  /* About us: a dialog with the story and purpose of the site (the text comes from lang.js) */
  var aboutDlg = document.getElementById('aboutDlg'),
      aboutBtn = document.getElementById('aboutBtn'),
      closeAbout = document.getElementById('closeAbout');
  if (aboutDlg && aboutBtn) {
    aboutBtn.addEventListener('click', function () {
      if (aboutDlg.showModal) aboutDlg.showModal(); else aboutDlg.setAttribute('open', '');
      aboutDlg.scrollTop = 0;
    });
    if (closeAbout) closeAbout.addEventListener('click', function () {
      if (aboutDlg.close) aboutDlg.close(); else aboutDlg.removeAttribute('open');
    });
  }
})();

/* Site settings that the owner may change without touching the code: data/config.json
   { "paypalButtonId": "...", "contactEmail": "..." }: the PayPal donation button and the contact e-mail. The value written in the page stays as the fallback:
   if the file cannot be read, the button works with it. The file is read in the background; the value is put in
   the form at the moment of the click, so the page is never delayed. */
(function () {
  'use strict';
  var cfg = null;
  try {
    if (window.fetch) {
      fetch('data/config.json', { cache: 'no-cache' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { cfg = d; window.AzanConfig = d; })
        .catch(function () { cfg = null; });
    }
  } catch (e) {}
  var form = document.querySelector('form.donate');
  if (!form) return;
  form.addEventListener('submit', function () {
    var id = cfg && typeof cfg.paypalButtonId === 'string' ? cfg.paypalButtonId.trim() : '';
    var input = form.querySelector('input[name="hosted_button_id"]');
    if (id && input) input.value = id;
  });
})();
