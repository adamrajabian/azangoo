/* The slideshow in the middle of the page: pictures of the Hijri day's occasion (data/events.json, images/events/), the daily
   Ramadan dua picture, or the default pictures, followed by the verse of the day. What follows describes the verse part.
   Verse of the day.
   In the middle of the page a slideshow sits over the map, in the same frame (so it has the same size and the map is never
   resized). It shows the verse (Arabic text + translation) for today's date. A long text is split over several slides,
   the slides move on by themselves, and they can be paused, swiped, or stepped with the arrow buttons.
   The map comes back when the person uses the GPS button or the search (js/azan.js calls AzanStage.showMap()), or taps
   the "Map" button; after a minute without any use of the map the slides come back.
   If the data cannot be loaded, nothing here is shown and the map stays as it was.
   Data: data/ayah/<lang>-<MM>.json, one file per language and month. { days: { "MM-DD": [ entry, ... ] }, about: [unit] }
   An entry is a list of units { r: "39:53", a: Arabic, t: translation, tl: language of t if it is not the page language }.
   When a date has several entries (the source covers more than one year) the year chooses between them; a date with no
   entry shows "about". Surah names: data/surahs.json. */
(function () {
  "use strict";
  var stage = document.getElementById("stage");
  if (!stage || !window.fetch) return;
  var frame = stage.parentNode, mapEl = document.getElementById("map"), mapBack = document.getElementById("mapBack");
  var A = window.AzanLang;
  if (!A) return;

  var IDLE_MS = 60 * 1000;            /* the slides return after this long without any use of the map */
  var TIERS = [[2.3, 1.28], [2.05, 1.16], [1.8, 1.08], [1.55, 1.0], [1.35, .95], [1.2, .9], [1.1, .86]];   /* font sizes in rem: [Arabic, translation] */
  var SHOW_VERSE = true;              /* false: only the pictures (the verse is still shown if there are no pictures) */
  var IMG_MS = 8000, IMG_DIR = "images/events/";
  var cache = {}, surahs = null;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var S = { doc: null, key: "", pages: [], i: 0, userPaused: reduce, hover: false, mapMode: false, timer: 0, idle: 0, resizeT: 0 };

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function t(k, v) { return A.t(k, v); }
  function hasMap() { return !!window.L; }

  /* ---------- structure ---------- */
  var ICON = {
    star: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.4 6.1 6.1 2.4-6.1 2.4L12 19.5l-2.4-6.1-6.1-2.4 6.1-2.4z"/></svg>',
    prev: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
    next: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    pause: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>',
    play: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6.5-5.4-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.6 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.4"/></svg>'
  };
  stage.setAttribute("role", "region");
  stage.setAttribute("aria-roledescription", "carousel");
  stage.tabIndex = 0;
  stage.innerHTML =
    '<div class="stage-bg" id="stBg" aria-hidden="true"></div>' +
    '<div class="stage-pattern" aria-hidden="true"></div>' +
    '<div class="st-test" id="stTest" hidden></div>' +
    '<div class="st-head">' + ICON.star + '<span id="stTitle"></span></div>' +
    '<div class="st-body" id="stBody"><div class="slide measure" aria-hidden="true"><div class="slide-box" id="stMeasure"></div></div></div>' +
    '<div class="st-prog" id="stProg" aria-hidden="true"><i></i></div>' +
    '<div class="st-foot">' +
      '<button type="button" class="st-btn st-flip" id="stPrev">' + ICON.prev + '</button>' +
      '<div class="st-dots" id="stDots"></div>' +
      '<button type="button" class="st-btn st-flip" id="stNext">' + ICON.next + '</button>' +
      '<button type="button" class="st-btn" id="stPause"></button>' +
      '<button type="button" class="st-mapbtn" id="stMap">' + ICON.pin + '<span id="stMapTxt"></span></button>' +
    '</div>';
  var el = {
    title: document.getElementById("stTitle"), body: document.getElementById("stBody"), measure: document.getElementById("stMeasure"),
    prog: document.getElementById("stProg"), dots: document.getElementById("stDots"), prev: document.getElementById("stPrev"),
    next: document.getElementById("stNext"), pause: document.getElementById("stPause"), map: document.getElementById("stMap"),
    mapTxt: document.getElementById("stMapTxt"), test: document.getElementById("stTest"), bg: document.getElementById("stBg")
  };
  if (mapBack) mapBack.innerHTML = ICON.star + '<span id="mapBackTxt"></span>';

  function labels() {
    stage.setAttribute("aria-label", t("st_slides"));
    el.prev.setAttribute("aria-label", t("st_prev")); el.prev.title = t("st_prev");
    el.next.setAttribute("aria-label", t("st_next")); el.next.title = t("st_next");
    el.mapTxt.textContent = t("st_map");
    el.map.setAttribute("aria-label", t("st_map")); el.map.title = t("st_map");
    var bt = document.getElementById("mapBackTxt");
    if (bt) bt.textContent = t("st_slides");
    if (mapBack) mapBack.setAttribute("aria-label", t("st_slides"));
    pauseUi();
  }
  function pauseUi() {
    el.pause.innerHTML = S.userPaused ? ICON.play : ICON.pause;
    var l = t(S.userPaused ? "st_play" : "st_pause");
    el.pause.setAttribute("aria-label", l); el.pause.title = l;
    el.pause.setAttribute("aria-pressed", S.userPaused ? "true" : "false");
  }

  /* ---------- data ---------- */
  function getJson(url) {
    if (!cache[url]) cache[url] = fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .catch(function () { cache[url] = null; return null; });
    return cache[url];
  }
  function dayKey(d) { return pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  /* today's Hijri month and day: the official list of the site when it covers the day, otherwise the calendar's own value
     (the same rule as the date shown at the top of the page) */
  var fHijri = new Intl.DateTimeFormat("en-u-ca-islamic-tbla-nu-latn", { month: "numeric", day: "numeric", timeZone: "UTC" });
  function hijriToday(n) {
    var cur = window.MoonInfo && window.MoonInfo.current ? window.MoonInfo.current() : null;     /* the date shown in the date tile */
    if (cur && cur.hijriDay && cur.hijriMonth) return { m: cur.hijriMonth, d: cur.hijriDay };
    var u = Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
    var ymd = n.getFullYear() + "-" + pad(n.getMonth() + 1) + "-" + pad(n.getDate());
    var O = window.AzanOfficial, e = (O && O.covering) ? O.covering(ymd) : null;
    if (e && O.dayMs) return { m: ((+e.hijriMonth - 1 + 12) % 12) + 1, d: Math.round((u - O.dayMs(e.start)) / 86400000) + 1 };
    var o = {};
    fHijri.formatToParts(new Date(u)).forEach(function (x) { if (x.type !== "literal") o[x.type] = +x.value; });
    return { m: o.month, d: o.day };
  }
  /* occasions whose day depends on the start of a lunar month: their caption carries a small note that the date follows the
     lunar-month forecast of the site */
  /* the picture slides of today: the occasion of the day, the Ramadan dua of the day, the occasions of the whole month,
     and the default pictures when there is nothing else */
  function imagePages(ev, h, lang) {
    if (!ev) return [];
    var out = [], mName = A.names("hijri")[h.m - 1], key = pad(h.m) + "-";
    function add(e, kind, extra) { var o = { img: e, kind: kind }; for (var k in extra) o[k] = extra[k]; out.push(o); }
    (ev.events[key + pad(h.d)] || []).forEach(function (e) {
      var ti = ev.titles && ev.titles[e.s];
      add(e, "day", { title: ti ? (ti[lang] || ti.fa) : "", date: A.num(h.d) + " " + mName });
    });
    if (h.m === 9) {
      var dua = ev.dua && ev.dua[pad(h.d)];
      var di = dua && (dua[lang === "fa" ? "fa" : "en"] || dua.fa || dua.en);
      if (di) add(di, "dua", { n: h.d });
    }
    (ev.events[key + "00"] || []).forEach(function (e) { add(e, "month", { m: mName }); });
    if (!out.length) (ev.defaults || []).forEach(function (e) { add(e, "default", {}); });
    return out;
  }
  /* test mode, only for the person who opens such a link (nothing is stored, other visitors are not affected):
       ?hijri=1-10          shows the pictures of 10 Muharram (month-day, month 1 = Muharram ... 12 = Dhu al-Hijjah)
       ?date=2026-06-25     shows the verse of that Gregorian date (and the Hijri date that goes with it)
     both can be used together, and the page language is the one of the page you open (fa, en, ur, ar) */
  var QS = new URLSearchParams(location.search), TEST = "";
  function testDate() {
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(QS.get("date") || "");
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  function testHijri() {
    var m = /^(\d{1,2})-(\d{1,2})$/.exec(QS.get("hijri") || "");
    return (m && +m[1] >= 1 && +m[1] <= 12 && +m[2] >= 1 && +m[2] <= 30) ? { m: +m[1], d: +m[2] } : null;
  }
  function load() {
    var td = testDate(), th = testHijri();
    var d = td || new Date(), lang = A.current(), h = th || hijriToday(d);
    TEST = (td || th) ? ("TEST " + (td ? pad(td.getMonth() + 1) + "/" + pad(td.getDate()) + " " : "") + (th ? "hijri " + th.m + "-" + th.d : "")) : "";
    return Promise.all([getJson("data/ayah/" + lang + "-" + pad(d.getMonth() + 1) + ".json"), surahs ? 0 : getJson("data/surahs.json"), getJson("data/events.json")])
      .then(function (r) {
        if (r[1]) surahs = r[1];
        var doc = r[0], units = null, aboutShown = false;
        if (doc && doc.days) {
          var e = doc.days[dayKey(d)];
          if (e && e.length) units = e[d.getFullYear() % e.length];
          else { units = doc.about || []; aboutShown = !!(units[0] && !units[0].a); }
          if (!units.length) units = null;
        }
        var imgs = imagePages(r[2], h, lang);
        if (!units && !imgs.length) return null;
        return { units: units || [], imgs: imgs, aboutShown: aboutShown, key: lang + ":" + dayKey(d) + ":" + h.m + "-" + h.d };
      });
  }

  /* ---------- text of a slide ---------- */
  function refLabel(r) {
    if (!r) return "";
    var m = /^(\d+):(.+)$/.exec(r);
    if (!m || r.indexOf(";") > -1 || !surahs) return t("ayah_quran", { r: A.num(r) });
    var L = A.current(), names = L === "fa" ? surahs.fa : (L === "en" ? surahs.en : surahs.ar), c = +m[1];
    return t(/[–-]/.test(m[2]) ? "ayah_ref_many" : "ayah_ref_one", { s: names[c - 1] || c, c: A.num(c), v: A.num(m[2]) });
  }
  /* the head line, caption and alt text of a slide */
  function headOf(pg) {
    if (!pg.img) return t(pg.about ? "ayah_about_title" : "ayah_title");
    if (pg.kind === "day") return t("ev_today");
    if (pg.kind === "dua") return t("ev_dua", { n: A.num(pg.n) });
    if (pg.kind === "month") return t("ev_month", { m: pg.m });
    return t("ev_default");
  }
  function fillImage(box, pg) {
    box.textContent = "";
    var w = pg.img.w, h = pg.img.h, hasCap = pg.kind === "day" && pg.title;
    var aw = el.body.clientWidth - 6, ah = el.body.clientHeight - (hasCap ? 54 : 6);
    var sc = Math.max(0.1, Math.min(aw / w, ah / h, 1.6));              /* small pictures are enlarged a little, never stretched to fill */
    var card = document.createElement("figure"), im = document.createElement("img");
    card.className = "img-card"; card.style.width = Math.round(w * sc) + "px"; card.style.height = Math.round(h * sc) + "px";
    im.src = IMG_DIR + pg.img.f; im.width = w; im.height = h; im.alt = pg.title || headOf(pg); im.decoding = "async";
    im.addEventListener("error", function () { card.classList.add("broken"); });
    card.appendChild(im); box.appendChild(card);
    if (hasCap) {
      var cap = document.createElement("div"); cap.className = "img-cap";
      var d1 = document.createElement("span"); d1.className = "img-date"; d1.textContent = pg.date;
      var d2 = document.createElement("span"); d2.className = "img-title"; d2.textContent = pg.title;
      cap.appendChild(d1); cap.appendChild(d2); box.appendChild(cap);
    }
  }
  function fill(box, pg) {
    if (pg.img) { fillImage(box, pg); return; }
    box.textContent = "";
    function add(tag, cls, text, lang, dir) {
      var n = document.createElement(tag); n.className = cls; n.textContent = text;
      if (lang) { n.setAttribute("lang", lang); n.setAttribute("dir", dir || "rtl"); }
      box.appendChild(n); return n;
    }
    if (pg.r) add("span", "slide-ref", refLabel(pg.r));
    if (pg.a) add("p", "slide-ar", pg.a, "ar", "rtl");
    if (pg.a && pg.t) add("span", "slide-orn", "").setAttribute("aria-hidden", "true");
    if (pg.t) { var l = pg.tl || A.current(); add("p", "slide-tr", pg.t, l, l === "en" ? "ltr" : "rtl"); }
    box.style.setProperty("--ar", pg.tier[0] + "rem");
    box.style.setProperty("--tr", pg.tier[1] + "rem");
  }
  function fits(pg) {
    fill(el.measure, pg);
    return el.measure.offsetHeight <= el.body.clientHeight - 6;
  }
  /* cut a long text into pieces that each fit one slide; pieces end at a sentence end when there is one near the limit */
  function chunk(text, mk) {
    var words = text.split(/\s+/), out = [], i = 0;
    while (i < words.length) {
      var lo = 1, hi = words.length - i, best = 1;
      while (lo <= hi) {
        var mid = (lo + hi) >> 1;
        if (fits(mk(words.slice(i, i + mid).join(" ")))) { best = mid; lo = mid + 1; } else hi = mid - 1;
      }
      if (i + best < words.length) {
        for (var j = best; j >= Math.ceil(best * 0.6); j--) if (/[.!?؟۔؛:;»”"]$/.test(words[i + j - 1])) { best = j; break; }
      }
      out.push(words.slice(i, i + best).join(" ")); i += best;
    }
    return out;
  }
  function paginate(units) {
    var pages = [];
    units.forEach(function (u) {
      var k, whole;
      for (k = 0; k < TIERS.length; k++) {
        whole = { r: u.r, a: u.a, t: u.t, tl: u.tl, tier: TIERS[k] };
        if (fits(whole)) { pages.push(whole); return; }
      }
      var tier = TIERS[4];
      if (u.a) chunk(u.a, function (s) { return { r: u.r, a: s, tier: tier }; }).forEach(function (s) { pages.push({ r: u.r, a: s, tier: tier }); });
      if (u.t) chunk(u.t, function (s) { return { r: u.r, t: s, tl: u.tl, tier: tier }; }).forEach(function (s) { pages.push({ r: u.r, t: s, tl: u.tl, tier: tier }); });
    });
    return pages;
  }

  /* ---------- showing the slides ---------- */
  function dur(pg) {
    if (pg.img) return IMG_MS;
    var n = (pg.a ? pg.a.length * 0.8 : 0) + (pg.t ? pg.t.length : 0);
    return Math.max(7000, Math.min(20000, 5000 + n * 40));
  }
  function canPlay() { return !S.userPaused && !S.hover && !S.mapMode && !document.hidden && S.pages.length > 1; }
  function schedule() {
    clearTimeout(S.timer);
    el.prog.classList.remove("run");
    if (!canPlay()) { stage.classList.add("paused"); return; }
    stage.classList.remove("paused");
    var d = dur(S.pages[S.i]);
    el.prog.style.setProperty("--dur", d + "ms");
    void el.prog.offsetWidth;                                   /* restart the bar */
    el.prog.classList.add("run");
    S.timer = setTimeout(function () { go(S.i + 1, true); }, d);
  }
  function drawDots() {
    var n = S.pages.length;
    el.dots.textContent = "";
    var many = n > 12;
    if (many) { var c = document.createElement("span"); c.id = "stCount"; el.dots.appendChild(c); return; }
    S.pages.forEach(function (p, i) {
      var b = document.createElement("button"); b.type = "button"; b.className = "st-dot";
      b.setAttribute("aria-label", t("st_page", { n: A.num(i + 1), total: A.num(n) }));
      b.addEventListener("click", function () { manual(i); });
      el.dots.appendChild(b);
    });
  }
  function go(i, auto) {
    var n = S.pages.length;
    if (!n) return;
    S.i = ((i % n) + n) % n;
    Array.prototype.slice.call(el.body.children).forEach(function (c) { if (!c.classList.contains("measure")) el.body.removeChild(c); });
    var s = document.createElement("div"), box = document.createElement("div");
    s.className = "slide in"; box.className = "slide-box"; s.appendChild(box);
    var pg = S.pages[S.i];
    fill(box, pg);
    el.body.appendChild(s);
    el.title.textContent = headOf(pg);
    if (pg.img) { el.bg.style.backgroundImage = "url(" + IMG_DIR + pg.img.f + ")"; stage.classList.add("has-img"); }
    else stage.classList.remove("has-img");
    var nx = S.pages[(S.i + 1) % n];
    if (nx && nx.img && n > 1) (new Image()).src = IMG_DIR + nx.img.f;
    var label = t("st_page", { n: A.num(S.i + 1), total: A.num(n) });
    s.setAttribute("role", "group"); s.setAttribute("aria-roledescription", "slide"); s.setAttribute("aria-label", label);
    var dots = el.dots.children;
    if (n > 12) { var c = document.getElementById("stCount"); if (c) c.textContent = label; }
    else for (var k = 0; k < dots.length; k++) dots[k].setAttribute("aria-current", k === S.i ? "true" : "false");
    el.body.setAttribute("aria-live", auto ? "off" : "polite");
    schedule();
  }
  function build(keepUnit) {
    if (!S.doc) return;
    labels();
    el.test.hidden = !TEST; el.test.textContent = TEST;
    var cur = S.pages[S.i], verse = [];
    if (SHOW_VERSE || !S.doc.imgs.length) {
      verse = paginate(S.doc.units);
      verse.forEach(function (v) { v.about = S.doc.aboutShown; });
    }
    S.pages = S.doc.imgs.concat(verse);
    var start = 0;
    function same(a, b) { return a.img ? (b.img && a.img.f === b.img.f) : (!b.img && a.r === b.r && (a.a || "").slice(0, 8) === (b.a || "").slice(0, 8) && (a.t || "").slice(0, 8) === (b.t || "").slice(0, 8)); }
    if (keepUnit && cur) for (var k = 0; k < S.pages.length; k++) if (same(S.pages[k], cur)) { start = k; break; }
    var multi = S.pages.length > 1;
    el.prev.hidden = el.next.hidden = el.pause.hidden = el.dots.hidden = !multi;
    el.map.hidden = !hasMap();
    drawDots();
    go(start);
  }
  function refresh(keepUnit) {
    return load().then(function (r) {
      if (!r) return;
      var changed = !S.doc || S.doc.key !== r.key;
      S.doc = r;
      if (stage.hidden) { stage.hidden = false; stage.classList.add("fade-in"); }
      syncNotes();
      if (changed || !keepUnit) build(keepUnit);
    });
  }

  /* ---------- map <-> slides ---------- */
  /* the Qibla sentence and the "double-click the map" hint under the frame are about the map: they show only while the map is shown */
  var qiblaNote = document.getElementById("qibla"), mapHint = qiblaNote && qiblaNote.nextElementSibling;
  function syncNotes() {
    var slides = !stage.hidden && !S.mapMode;
    if (qiblaNote) qiblaNote.hidden = slides;
    if (mapHint && mapHint.classList.contains("hint")) mapHint.hidden = slides;
    /* one general sentence under the frame for all the occasion slides (dates follow the lunar-month forecast) */
    var evNote = document.getElementById("slidesNote");
    if (evNote) evNote.hidden = !(slides && S.doc && S.doc.imgs.some(function (p) { return p.kind !== "default"; }));
  }
  function setInert(node, on) {
    if (!node) return;
    node.inert = on;
    if (on) node.setAttribute("aria-hidden", "true"); else node.removeAttribute("aria-hidden");
  }
  function armIdle() {
    clearTimeout(S.idle);
    if (S.mapMode) S.idle = setTimeout(showSlides, IDLE_MS);
  }
  function showMap(focus) {
    if (!hasMap() || stage.hidden) return;
    var wasIn = stage.contains(document.activeElement);
    S.mapMode = true;
    frame.classList.add("is-map");
    syncNotes();
    setInert(stage, true); setInert(mapEl, false);
    clearTimeout(S.timer); el.prog.classList.remove("run");
    armIdle();
    if (wasIn && mapBack) mapBack.focus({ preventScroll: true });
  }
  function showSlides() {
    var wasIn = frame.contains(document.activeElement) && document.activeElement !== document.body && document.activeElement.id === "mapBack";
    S.mapMode = false;
    clearTimeout(S.idle);
    frame.classList.remove("is-map");
    syncNotes();
    setInert(stage, false); if (hasMap()) setInert(mapEl, true);
    schedule();
    if (wasIn) el.map.focus({ preventScroll: true });
  }
  window.AzanStage = { showMap: showMap, showSlides: showSlides, isMap: function () { return S.mapMode; } };

  /* ---------- controls ---------- */
  /* a step made by the person always restarts the autoplay, even if the mouse is still over the slides */
  function manual(i) { S.hover = false; go(i); }
  el.prev.addEventListener("click", function () { manual(S.i - 1); });
  el.next.addEventListener("click", function () { manual(S.i + 1); });
  el.pause.addEventListener("click", function () { S.userPaused = !S.userPaused; pauseUi(); schedule(); });
  el.map.addEventListener("click", function () { showMap(); });
  if (mapBack) mapBack.addEventListener("click", showSlides);
  function pausedNow(on) { S.hover = on; schedule(); }
  /* autoplay waits while a mouse is over the slides or the keyboard focus is in them; a finger or a tap never pauses it
     (a tap leaves a "hover" and the focus behind, which used to stop the autoplay for good) */
  stage.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") pausedNow(true); });
  stage.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") pausedNow(false); });
  stage.addEventListener("focusin", function (e) { if (e.target.matches && e.target.matches(":focus-visible")) pausedNow(true); });
  stage.addEventListener("focusout", function () { pausedNow(false); });
  stage.addEventListener("keydown", function (e) {
    var rtl = document.documentElement.dir === "rtl";
    if (e.key === "ArrowLeft") { manual(S.i + (rtl ? 1 : -1)); e.preventDefault(); }
    else if (e.key === "ArrowRight") { manual(S.i + (rtl ? -1 : 1)); e.preventDefault(); }
  });
  /* swipe: a finger moving towards the start of the line goes to the next slide */
  var sx = null, sy = 0;
  el.body.addEventListener("pointerdown", function (e) { sx = e.clientX; sy = e.clientY; });
  el.body.addEventListener("pointerup", function (e) {
    if (sx === null) return;
    var dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
    var rtl = document.documentElement.dir === "rtl";
    manual(S.i + ((dx > 0) === rtl ? 1 : -1));
  });
  el.body.addEventListener("pointercancel", function () { sx = null; });

  /* any use of the map keeps it on screen */
  ["pointerdown", "wheel", "keydown", "touchstart"].forEach(function (n) {
    frame.addEventListener(n, function () { if (S.mapMode) armIdle(); }, { capture: true, passive: true });
  });
  var q = document.getElementById("q");
  if (q) ["input", "focus"].forEach(function (n) { q.addEventListener(n, function () { if (S.mapMode) armIdle(); }); });
  document.addEventListener("visibilitychange", schedule);

  /* ---------- lifecycle ---------- */
  if (window.AzanOfficial && AzanOfficial.onChange) AzanOfficial.onChange(function () { refresh(true); });
  window.addEventListener("azan:hijri", function () { refresh(true); });               /* the moon card has a new Hijri date */
  window.addEventListener("azan:langchange", function () { S.doc = null; refresh(false); });
  setInterval(function () { refresh(true); }, 10 * 60 * 1000);                   /* a new day began */
  if (window.ResizeObserver) {
    var lastW = 0, lastH = 0;
    new ResizeObserver(function () {
      var w = el.body.clientWidth, h = el.body.clientHeight;
      if (!S.doc || stage.hidden || (w === lastW && h === lastH)) { lastW = w; lastH = h; return; }
      lastW = w; lastH = h;
      clearTimeout(S.resizeT);
      S.resizeT = setTimeout(function () { build(true); }, 250);
    }).observe(el.body);
  }
  function begin() {
    if (hasMap()) setInert(mapEl, true);
    refresh(false);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (S.doc) build(true); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", begin); else begin();
})();
