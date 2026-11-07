/* Copyright (c) 2026 azangoo.com. All rights reserved.
   Copying, reuse, modification or redistribution of this code, or of its calculations,
   is prohibited without written permission. See the Terms and conditions page. */
/* Official Hijri months (set by the site owner in data/official-months.json).
   If a month is listed there, the site shows the official start and length and marks it as official.
   Months that are not listed use the site's own prediction.
   A listed month may carry "regions": ["CA","US"] (two-letter country codes). It then applies only to places in those
   countries; a month without "regions" applies everywhere. The page finds the country of the selected place and tells
   this module with setRegion(). While the country is unknown (null), months limited to regions are not used, so the
   site's own prediction shows. If two listed months cover the same day, the one that names the place's country wins. */
(function (root) {
  'use strict';
  var DAY = 86400000;
  var data = null, ready = false, waiting = [];
  var region = null, ver = 0, listeners = [];

  function dayMs(s) { var p = String(s).split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }

  function hasRegions(m) { return !!(m && m.regions && m.regions.length); }
  /* does this listed month apply to the selected place? */
  function applies(m) {
    if (!hasRegions(m)) return true;
    if (!region) return false;
    for (var i = 0; i < m.regions.length; i++) if (String(m.regions[i]).toUpperCase() === region) return true;
    return false;
  }

  /* the listed month that covers a local date (YYYY-MM-DD), or null */
  function covering(ymd) {
    if (!data || !data.months || !ymd) return null;
    var t = dayMs(ymd), best = null;
    for (var i = 0; i < data.months.length; i++) {
      var m = data.months[i], s = dayMs(m.start);
      if (!(t >= s && t < s + (+m.length) * DAY) || !applies(m)) continue;
      if (hasRegions(m)) return m;                        /* a month that names the country beats a general one */
      if (!best) best = m;
    }
    return best;
  }

  function onReady(f) { if (ready) f(); else waiting.push(f); }

  function changed() { ver++; listeners.slice().forEach(function (f) { try { f(); } catch (e) {} }); }

  function load(url) {
    if (typeof fetch === 'undefined') { ready = true; return; }
    fetch(url, { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { data = d; })
      .catch(function () { data = null; })
      .then(function () { ready = true; ver++; waiting.splice(0).forEach(function (f) { f(); }); });
  }

  /* the listed months that apply to the selected place */
  function all() { return (data && data.months) ? data.months.filter(applies) : []; }
  function setData(d) { data = d; ready = true; ver++; waiting.splice(0).forEach(function (f) { f(); }); }

  /* true when some listed month is limited to countries (only then is the country of the place worth looking up) */
  function needsRegion() { return !!(data && data.months && data.months.some(hasRegions)); }
  /* country code of the selected place (null = unknown); listeners are called when it changes the result */
  function setRegion(cc) {
    var next = cc ? String(cc).toUpperCase() : null;
    if (next === region) return;
    region = next;
    if (needsRegion()) changed(); else ver++;
  }
  function onChange(f) { listeners.push(f); }
  function version() { return ver; }

  var api = { load: load, covering: covering, onReady: onReady, dayMs: dayMs, all: all, setData: setData,
              needsRegion: needsRegion, setRegion: setRegion, onChange: onChange, version: version };
  if (root) root.AzanOfficial = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') load('data/official-months.json');
})(typeof window !== 'undefined' ? window : globalThis);
