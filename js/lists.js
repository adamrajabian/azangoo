/* Copyright (c) 2026 azangoo.com. All rights reserved.
   Copying, reuse, modification or redistribution of this code, or of its calculations,
   is prohibited without written permission. See the Terms and conditions page. */
/* City lists: a search box and a country filter. All links are already in the HTML;
   this script only hides the rows that do not match, so search engines see every link. */
(function () {
  'use strict';
  var search = document.getElementById('listSearch');
  var country = document.getElementById('listCountry');
  var rows = document.querySelectorAll('[data-filter]');
  if (!rows.length) return;

  function apply() {
    var q = search ? search.value.trim().toLowerCase() : '';
    var c = country ? country.value : '';
    rows.forEach(function (row) {
      var text = (row.getAttribute('data-filter') || '').toLowerCase();
      var okText = !q || text.indexOf(q) !== -1;
      var okCountry = !c || row.getAttribute('data-country') === c;
      row.hidden = !(okText && okCountry);
    });
  }
  if (search) search.addEventListener('input', apply);
  if (country) country.addEventListener('change', apply);
})();
