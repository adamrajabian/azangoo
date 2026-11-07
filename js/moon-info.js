/* Copyright (c) 2026 azangoo.com. All rights reserved.
   Copying, reuse, modification or redistribution of this code, or of its calculations,
   is prohibited without written permission. See the Terms and conditions page. */
/* Moon for the selected place: illumination, moonrise and moonset with directions,
   sunset data, and whether the new crescent is visible (which decides 29 or 30 days).
   Astronomy: Meeus, "Astronomical Algorithms" ch. 47 (moon position to about 0.01 degree, new moon times to about 1 minute).
   Crescent visibility: Odeh V-criterion (M. Sh. Odeh, Experimental Astronomy 18, 2004, 39-64). This is an estimate, not an official sighting. */
(function (root) {
  "use strict";
  var RAD = Math.PI / 180, DEG = 180 / Math.PI, DAY = 86400000, MIN = 60000;
  var VISIBLE = 2.0;     /* Odeh V at or above this counts as visible (optical aid at the low end) */
  var MOON_K = 0.2725;   /* moon radius / earth radius: semidiameter = K x horizontal parallax */
  var H0_MOON = 0;       /* moon rise and set: altitude threshold is applied in moonAt */
  var H0_SUN = -0.8333;  /* sunset altitude with refraction and semidiameter, degrees */

  /* Meeus, Astronomical Algorithms ch. 47, table 47.A (longitude, 1e-6 degree) and 47.B (latitude): [D, M, M', F, coefficient] */
  var MT = [[0,0,1,0,6288774],[2,0,-1,0,1274027],[2,0,0,0,658314],[0,0,2,0,213618],[0,1,0,0,-185116],
    [0,0,0,2,-114332],[2,0,-2,0,58793],[2,-1,-1,0,57066],[2,0,1,0,53322],[2,-1,0,0,45758],
    [0,1,-1,0,-40923],[1,0,0,0,-34720],[0,1,1,0,-30383],[2,0,0,-2,15327],[0,0,1,2,-12528],
    [0,0,1,-2,10980],[4,0,-1,0,10675],[0,0,3,0,10034],[4,0,-2,0,8548],[2,1,-1,0,-7888],
    [2,1,0,0,-6766],[1,0,-1,0,-5163],[1,1,0,0,4987],[2,-1,1,0,4036],[2,0,2,0,3994],
    [4,0,0,0,3861],[2,0,-3,0,3665],[0,1,-2,0,-2689],[2,0,-1,2,-2602],[2,-1,-2,0,2390]];
  var BT = [[0,0,0,1,5128122],[0,0,1,1,280602],[0,0,1,-1,277693],[2,0,0,-1,173237],[2,0,-1,1,55413],
    [2,0,-1,-1,46271],[2,0,0,1,32573],[0,0,2,1,17198],[2,0,1,-1,9266],[0,0,2,-1,8822],
    [2,-1,0,-1,8216],[2,0,-2,-1,4324],[2,0,1,1,4200],[2,1,0,-1,-3359],[2,-1,-1,1,2463],
    [2,-1,0,1,2211],[2,-1,-1,-1,2065],[0,1,-1,-1,-1870],[4,0,-1,-1,1828],[0,1,0,1,-1794]];

  function norm(a) { a = a % 360; return a < 0 ? a + 360 : a; }
  function wrap(a) { a = norm(a); return a > 180 ? a - 360 : a; }
  function clamp(x) { return x > 1 ? 1 : (x < -1 ? -1 : x); }
  function cen(ms) { return (ms / DAY + 2440587.5 - 2451545) / 36525; }
  function p2(n) { return n < 10 ? "0" + n : "" + n; }
  var FA = "۰۱۲۳۴۵۶۷۸۹";
  function fa(s) { return root.AzanLang ? root.AzanLang.num(s) : String(s); }

  function eqFromEcl(lon, lat, t) {
    var e = (23.439291 - 0.0130042 * t) * RAD, l = lon * RAD, b = lat * RAD;
    var ra = Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l)) * DEG;
    var dec = Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l)) * DEG;
    return { ra: norm(ra), dec: dec };
  }

  /* Moon position: the same truncated series as the old site (Astronomy.cs, MoonRiseSet).
     Gives right ascension, declination and distance (Earth radii). */
  function moonSeries(jd) {
    var t = jd - 2451545;
    var l = 0.606434 + 0.036601 * t, mm = 0.374897 + 0.036292 * t, f = 0.259091 + 0.036748 * t,
        d = 0.827362 + 0.033863 * t, n = 0.347343 - 1.470939e-4 * t, g = 0.993126 + 2.737778e-3 * t;
    var p2 = 2 * Math.PI;
    l = (l - Math.floor(l)) * p2; mm = (mm - Math.floor(mm)) * p2; f = (f - Math.floor(f)) * p2;
    d = (d - Math.floor(d)) * p2; n = (n - Math.floor(n)) * p2; g = (g - Math.floor(g)) * p2;
    var v = 0.39558 * Math.sin(f + n) + 0.082 * Math.sin(f) + 0.03257 * Math.sin(mm - f - n) + 0.01092 * Math.sin(mm + f + n) + 6.66e-03 * Math.sin(mm - f) - 6.44e-03 * Math.sin(mm + f - 2 * d + n) - 3.31e-03 * Math.sin(f - 2 * d + n) - 3.04e-03 * Math.sin(f - 2 * d) - 2.4e-03 * Math.sin(mm - f - 2 * d - n) + 2.26e-03 * Math.sin(mm + f) - 1.08e-03 * Math.sin(mm + f - 2 * d) - 7.9e-04 * Math.sin(f - n) + 7.8e-04 * Math.sin(f + 2 * d + n);
    var u = 1 - 0.10828 * Math.cos(mm) - 0.0188 * Math.cos(mm - 2 * d) - 0.01479 * Math.cos(2 * d) + 1.81e-03 * Math.cos(2 * mm - 2 * d) - 1.47e-03 * Math.cos(2 * mm) - 1.05e-03 * Math.cos(2 * d - g) - 7.5e-04 * Math.cos(mm - 2 * d + g);
    var w = 0.10478 * Math.sin(mm) - 0.04105 * Math.sin(2 * f + 2 * n) - 0.0213 * Math.sin(mm - 2 * d) - 0.01779 * Math.sin(2 * f + n) + 0.01774 * Math.sin(n) + 9.87e-03 * Math.sin(2 * d) - 3.38e-03 * Math.sin(mm - 2 * f - 2 * n) - 3.09e-03 * Math.sin(g) - 1.9e-03 * Math.sin(2 * f) - 1.44e-03 * Math.sin(mm + n) - 1.44e-03 * Math.sin(mm - 2 * f - n) - 1.13e-03 * Math.sin(mm + 2 * f + 2 * n) - 9.4e-04 * Math.sin(mm - 2 * d + g) - 9.2e-04 * Math.sin(2 * mm - 2 * d);
    var s = w / Math.sqrt(u - v * v);
    var ra = l + Math.atan(s / Math.sqrt(1 - s * s));
    var s2 = v / Math.sqrt(u);
    var dec = Math.atan(s2 / Math.sqrt(1 - s2 * s2));
    return { ra: norm(ra * DEG), dec: dec * DEG, dist: 60.40974 * Math.sqrt(u) };
  }
  var DELTA_T = 69000;                                  /* TT - UT in ms (about 69 s in 2026) */
  function moonEcl(ms) {
    var t = cen(ms + DELTA_T), t2 = t * t, t3 = t2 * t, t4 = t3 * t;
    var Lp = 218.3164477 + 481267.88123421 * t - 0.0015786 * t2 + t3 / 538841 - t4 / 65194000;
    var D = (297.8501921 + 445267.1114034 * t - 0.0018819 * t2 + t3 / 545868 - t4 / 113065000) * RAD;
    var M = (357.5291092 + 35999.0502909 * t - 0.0001536 * t2 + t3 / 24490000) * RAD;
    var Mp = (134.9633964 + 477198.8675055 * t + 0.0087414 * t2 + t3 / 69699 - t4 / 14712000) * RAD;
    var F = (93.2720950 + 483202.0175233 * t - 0.0036539 * t2 - t3 / 3526000 + t4 / 863310000) * RAD;
    var A1 = (119.75 + 131.849 * t) * RAD, A2 = (53.09 + 479264.290 * t) * RAD, A3 = (313.45 + 481266.484 * t) * RAD;
    var E = 1 - 0.002516 * t - 0.0000074 * t2, LpR = Lp * RAD;
    function sum(tab, useSin) {
      var r = 0;
      for (var i = 0; i < tab.length; i++) {
        var q = tab[i], arg = q[0] * D + q[1] * M + q[2] * Mp + q[3] * F, m = Math.abs(q[1]);
        r += q[4] * (m === 1 ? E : (m === 2 ? E * E : 1)) * Math.sin(arg);
      }
      return r;
    }
    var sl = sum(MT) + 3958 * Math.sin(A1) + 1962 * Math.sin(LpR - F) + 318 * Math.sin(A2);
    var sb = sum(BT) - 2235 * Math.sin(LpR) + 382 * Math.sin(A3) + 175 * Math.sin(A1 - F) + 175 * Math.sin(A1 + F) +
             127 * Math.sin(LpR - Mp) - 115 * Math.sin(LpR + Mp);
    var lon = norm(Lp + sl / 1e6 - 0.004777 * Math.sin((125.04452 - 1934.136261 * t) * RAD));   /* apparent: nutation in longitude */
    var lat = sb / 1e6;
    var s = moonSeries(ms / DAY + 2440587.5);             /* distance only */
    return { lon: lon, lat: lat, par: Math.asin(1 / s.dist) * DEG, dist: s.dist, eq: eqFromEcl(lon, lat, cen(ms)) };
  }

  function sunEcl(ms) {
    var t = cen(ms), M = (357.52911 + 35999.05029 * t) * RAD;
    var C = (1.914602 - 0.004817 * t) * Math.sin(M) + (0.019993 - 0.000101 * t) * Math.sin(2 * M) +
            0.000289 * Math.sin(3 * M);
    var lon = norm(280.46646 + 36000.76983 * t + C - 0.00569 - 0.00478 * Math.sin((125.04 - 1934.136 * t) * RAD));
    return { lon: lon, eq: eqFromEcl(lon, 0, t) };
  }

  function sep(a, b) {
    return Math.acos(clamp(Math.sin(a.dec * RAD) * Math.sin(b.dec * RAD) +
      Math.cos(a.dec * RAD) * Math.cos(b.dec * RAD) * Math.cos((a.ra - b.ra) * RAD))) * DEG;
  }

  /* altitude and azimuth (azimuth from north, eastward) of an equatorial position */
  function horiz(eq, ms, lat, lng) {
    var jd = ms / DAY + 2440587.5, t = (jd - 2451545) / 36525;
    var gmst = norm(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * t * t - t * t * t / 38710000);
    var H = norm(gmst + lng - eq.ra) * RAD, p = lat * RAD, d = eq.dec * RAD;
    var alt = Math.asin(clamp(Math.sin(p) * Math.sin(d) + Math.cos(p) * Math.cos(d) * Math.cos(H))) * DEG;
    var az = norm(Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(p) - Math.tan(d) * Math.cos(p)) * DEG + 180);
    return { alt: alt, az: az };
  }
  function moonAt(ms, lat, lng) {
    var m = moonEcl(ms), h = horiz(m.eq, ms, lat, lng);
    h.geo = h.alt;                                     /* altitude of the Moon's centre seen from the centre of the Earth */
    h.alt -= (41.685 / m.dist - 0.567);                /* old code: rise and set when this is 0 (includes parallax) */
    h.lon = m.lon; h.eq = m.eq; h.dist = m.dist;
    return h;
  }
  function sunAt(ms, lat, lng) {
    var s = sunEcl(ms), h = horiz(s.eq, ms, lat, lng);
    h.lon = s.lon; h.eq = s.eq;
    return h;
  }

  /* times where f(t) crosses h0; each item: {t, rising} */
  function crossings(f, h0, t0, t1) {
    var out = [], a = t0, fa = f(a) - h0;
    while (a < t1) {
      var b = Math.min(a + 10 * MIN, t1), fb = f(b) - h0;
      if ((fa < 0) !== (fb < 0)) {
        var lo = a, hi = b, fl = fa;
        while (hi - lo > MIN) {
          var m = (lo + hi) / 2, fm = f(m) - h0;
          if ((fl < 0) === (fm < 0)) { lo = m; fl = fm; } else { hi = m; }
        }
        out.push({ t: (lo + hi) / 2, rising: fb > 0 });
      }
      a = b; fa = fb;
    }
    return out;
  }

  /* start of the local day (UTC ms) that contains ms, for a fixed offset in hours */
  function dayStart(ms, off) {
    var d = new Date(ms + off * 3600000);
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - off * 3600000;
  }

  /* sunset of the local day that starts at `day`, with moon data at that moment */
  function evening(day, lat, lng) {
    var ss = crossings(function (x) { return sunAt(x, lat, lng).alt; }, H0_SUN, day, day + DAY)
      .filter(function (e) { return !e.rising; })[0];
    if (!ss) return null;
    var t = ss.t, mA = moonAt(t, lat, lng), sA = sunAt(t, lat, lng);
    var age = wrap(mA.lon - sA.lon);
    var arcl = sep(sA.eq, mA.eq);
    /* Odeh uses what an observer on the ground sees: the topocentric altitude of the Moon's centre (parallax taken off,
       no refraction, like the Sun's altitude) and the topocentric semidiameter */
    var hp = Math.asin(1 / mA.dist);                                 /* horizontal parallax, radians */
    var topoAlt = mA.geo - hp * DEG * Math.cos(mA.geo * RAD);
    var sd = MOON_K * hp * DEG * 60 * (1 + Math.sin(mA.geo * RAD) * Math.sin(hp));   /* semidiameter, arcminutes */
    var W = sd * (1 - Math.cos(arcl * RAD));                         /* crescent width, arcminutes */
    var V = (topoAlt - sA.alt) - (-0.1018 * W * W * W + 0.7319 * W * W - 6.3226 * W + 7.1651);
    var dur = 0;
    if (mA.alt > H0_MOON) {
      var set = crossings(function (x) { return moonAt(x, lat, lng).alt; }, H0_MOON, t, t + 12 * 3600000)
        .filter(function (e) { return !e.rising; })[0];
      if (set) dur = Math.round((set.t - t) / MIN);                 /* sunset to moonset, minutes */
    }
    return {
      t: t, age: age, V: age > 0 ? V : -99,
      visible: age > 0 && V >= VISIBLE,
      illum: (1 - Math.cos(arcl * RAD)) / 2 * 100,
      dur: dur
    };
  }

  function elong(ms) { return wrap(moonEcl(ms).lon - sunEcl(ms).lon); }

  /* last new moon (conjunction) at or before ms */
  function lastConjunction(ms) {
    var step = DAY / 2, a = ms - 45 * DAY, fa = elong(a), found = null;
    for (var b = a + step; ; b += step) {
      if (b > ms) b = ms;
      var fb = elong(b);
      if (fa < 0 && fb >= 0 && fb - fa < 90) {
        var lo = a, hi = b;
        while (hi - lo > MIN) {
          var mid = (lo + hi) / 2;
          if (elong(mid) < 0) lo = mid; else hi = mid;
        }
        found = (lo + hi) / 2;
      }
      a = b; fa = fb;
      if (b === ms) break;
    }
    return found;
  }

  /* Month rule: an evening E starts the next month when the new crescent is visible on E by the
     Odeh criterion (V >= VISIBLE, computed at sunset in evening()). The evenings E and E+1 are
     checked in turn, E being the evening of the day of the conjunction; if neither is visible,
     the third evening (E+2) starts the month without a check. dayEvent() below gives the
     illumination and the sunset-to-moonset time that the page shows. This replaces the
     old site's rule (illumination >= 0.56% and moonset more than 20 minutes after sunset). */
  function dayEvent(day, lat, lng) {
    var setE = crossings(function (x) { return moonAt(x, lat, lng).alt; }, H0_MOON, day, day + DAY)
      .filter(function (e) { return !e.rising; })[0];
    var sunE = crossings(function (x) { return sunAt(x, lat, lng).alt; }, H0_SUN, day, day + DAY)
      .filter(function (e) { return !e.rising; })[0];
    var t = setE ? setE.t : day + DAY - MIN;                 /* no moonset that day: end of day */
    var s = sunEcl(t), m = moonEcl(t);
    return {
      t: t,
      illum: (1 - Math.cos(sep(s.eq, m.eq) * RAD)) / 2 * 100,
      lag: (setE && sunE) ? (setE.t - sunE.t) / MIN : -1
    };
  }
  function passes(day, lat, lng) {
    var e = evening(day, lat, lng);
    return !!(e && e.visible);
  }
  /* local midnight of the first day of the month that follows evening E0 */
  function monthStartAfter(E0, lat, lng) {
    if (passes(E0, lat, lng)) return E0 + DAY;
    if (passes(E0 + DAY, lat, lng)) return E0 + 2 * DAY;
    return E0 + 3 * DAY;
  }
  /* Month starts for one place, as one chain so that every month length is the gap between two
     neighbouring starts. Each start comes from its own new moon (monthStartAfter on the evening of
     the conjunction day). A month is 29 or 30 days: if the raw start would give a different gap
     (the third-evening fallback at high latitudes can give 28 or 31), the start is moved to the
     nearest day that keeps the month at 29 or 30. The chain begins a year before the date asked for,
     so it has settled onto the raw starts long before any month that is shown. */
  var chains = {};
  /* Official months (data/official-months.json) are fixed points of the chain: the start and the end of a listed
     month. When the prediction puts a month start within 2 days of such a point, it is moved onto the point.
     This is what makes the month after an official month begin on the day the official month ends (and the
     month before it end on the day the official month begins), and the months after that follow on from there. */
  var SNAP = 2 * DAY;
  function forcedPoints(off) {
    var OFF = root.AzanOfficial, out = [];
    if (!OFF || !OFF.all) return out;
    OFF.all().forEach(function (e) {
      var s0 = OFF.dayMs(e.start) - off * 3600000;
      out.push(s0, s0 + (+e.length) * DAY);
    });
    return out;
  }
  function snapTo(raw, forced) {
    var best = raw, bd = SNAP + 1;
    for (var i = 0; i < forced.length; i++) {
      var d = Math.abs(raw - forced[i]);
      if (d <= SNAP && d < bd) { best = forced[i]; bd = d; }
    }
    return best;
  }
  function extendChain(ch, lat, lng, off, untilMs, forced) {
    var guard = 0;
    while (ch.c !== null && guard++ < 400 && (!ch.s.length || ch.s[ch.s.length - 1] <= untilMs)) {
      var raw = monthStartAfter(dayStart(ch.c, off), lat, lng), n = ch.s.length;
      if (n) { var p = ch.s[n - 1]; raw = Math.max(p + 29 * DAY, Math.min(p + 30 * DAY, raw)); raw = snapTo(raw, forced); }
      ch.s.push(raw);
      var nc = lastConjunction(ch.c + 35 * DAY);
      ch.c = (nc === null || nc <= ch.c) ? null : nc;
    }
  }
  /* pure = the site's own prediction, without the official months */
  function monthChain(lat, lng, off, refMs, untilMs, pure) {
    var ay = new Date(refMs).getUTCFullYear() - 1, OFF = root.AzanOfficial;
    var key = [lat.toFixed(3), lng.toFixed(3), off, ay, pure ? "p" : (OFF && OFF.version ? OFF.version() : 0)].join("|");
    var ch = chains[key];
    if (!ch) ch = chains[key] = { c: lastConjunction(Date.UTC(ay, 0, 1)), s: [] };
    extendChain(ch, lat, lng, off, untilMs, pure ? [] : forcedPoints(off));
    return ch.s;
  }
  /* first day of the current Hijri month (the latest start that is not in the future) and of the next one */
  function currentMonth(now, lat, lng, off, pure) {
    var st = monthChain(lat, lng, off, now, now + 2 * DAY, pure), cur = null, next = null;
    for (var i = 0; i < st.length; i++) {
      if (st[i] <= now) cur = st[i];
      else { next = st[i]; break; }
    }
    return cur === null ? null : { start: cur, next: next };
  }

  /* Hijri month name from its number, in the page language */
  var hijriNum = new Intl.DateTimeFormat("en-u-ca-islamic-tbla-nu-latn", { month: "numeric", timeZone: "UTC" });
  function hijriName(ms, off) {
    var m = +hijriNum.formatToParts(new Date(dayStart(ms, off) + 12 * 3600000))
      .filter(function (x) { return x.type === "month"; })[0].value;
    return root.AzanLang.names("hijri")[m - 1];
  }

  function hm(ms, off) {
    var d = new Date(ms + off * 3600000);
    return fa(p2(d.getUTCHours()) + ":" + p2(d.getUTCMinutes()));
  }

  /* direction from the north point: "22° south of east" (en) / "از جهت شرق، ۲۲ درجه به سمت جنوب" (fa) */
  function dirText(az) {
    var card, dev, side;
    if (az >= 45 && az < 135)      { card = "E"; dev = Math.abs(az - 90);  side = az < 90 ? "N" : "S"; }
    else if (az >= 135 && az < 225) { card = "S"; dev = Math.abs(az - 180); side = az < 180 ? "E" : "W"; }
    else if (az >= 225 && az < 315) { card = "W"; dev = Math.abs(az - 270); side = az < 270 ? "S" : "N"; }
    else {
      card = "N";
      if (az >= 315) { dev = 360 - az; side = "W"; } else { dev = az; side = "E"; }
    }
    var names = root.AzanLang.names("card"), sides = root.AzanLang.names("side");
    return root.AzanLang.t("dir", { card: names[card], deg: fa(Math.round(dev)), side: sides[side] });
  }

  function imageName(p, waxing) {
    var k = Math.round(p);
    if (k <= 0) return "Moon00.gif";
    if (k >= 100) return "Moon100.gif";
    return "Moon" + (waxing ? "R" : "L") + p2(k) + ".gif";
  }

  var persianNum = new Intl.DateTimeFormat("en-u-ca-persian-nu-latn", { year: "numeric", month: "numeric", day: "numeric", timeZone: "UTC" });

  /* "first day of the next Hijri month" line */
  function buildStartText(o) {
    if (!o.nextStart) return "";
    var A = root.AzanLang, g = new Date(o.nextStart), p = {};
    persianNum.formatToParts(g).forEach(function (x) { if (x.type !== "literal") p[x.type] = +x.value; });
    return A.t("moon_start", {
      next: o.next, weekday: A.names("weekdays")[g.getUTCDay()],
      gd: fa(g.getUTCDate()), gm: A.names("greg")[g.getUTCMonth()], gy: fa(g.getUTCFullYear()),
      sd: fa(p.day), sm: A.names("shamsi")[p.month - 1], sy: fa(p.year)
    });
  }

  function buildText(o) {
    if (!o.last) return "";
    var A = root.AzanLang, illum = A.percent(o.last.illum.toFixed(2));
    if (o.last.visible) {
      return A.t("moon_visible", { cur: o.cur, len: fa(o.len), next: o.next, illum: illum, dur: fa(o.last.dur) });
    }
    return A.t("moon_hidden", { cur: o.cur, len: fa(o.len), next: o.next, illum: illum });
  }

  /* The "why" line under the moon card.
     - official month (listed in data/official-months.json): says the month follows the official announcement,
       and how it differs from the site's own prediction when it does;
     - predicted month: why it has 29 or 30 days (the crescent of the evening of day 29 is visible or not); for 30 days also the best moment to try. */
  function buildWhy(o, entry, start, nextStart, lat, lng, off, now) {
    var A = root.AzanLang;
    if (entry) {
      var pm = null;
      try { pm = currentMonth(now, lat, lng, off, true); } catch (e) { pm = null; }
      if (pm && pm.next && Math.abs(start - pm.start) <= 2 * DAY) {
        var plen = Math.round((pm.next - pm.start) / DAY), n = Math.round(Math.abs(start - pm.start) / DAY);
        if (plen !== o.len) return A.t("moon_official_len", { cur: o.cur, len: fa(o.len), plen: fa(plen) });
        if (pm.start !== start) return A.t("moon_official_shift", { cur: o.cur, n: fa(n) });
      }
      return A.t("moon_official_same", { cur: o.cur, len: fa(o.len) });
    }
    /* a predicted month whose start or end was moved onto an official month next to it */
    var pure = null;
    try { pure = currentMonth(now, lat, lng, off, true); } catch (e) { pure = null; }
    if (pure && pure.next && (pure.start !== start || pure.next !== nextStart)) {
      return A.t("moon_follow_official", { cur: o.cur, len: fa(o.len) });
    }
    /* predicted month: why it has 29 or 30 days, judged by the sunset of day 29 */
    var A2 = root.AzanLang;
    if (o.len === 30) {
      var ev = evening(nextStart - 2 * DAY, lat, lng);       /* sunset of day 29 */
      if (!ev || ev.visible) return "";
      var v30 = { cur: o.cur, len: fa(o.len), d: fa(29), illum: A2.percent(ev.illum.toFixed(2)), dur: fa(ev.dur) };
      return A2.t(ev.dur > 0 ? "moon_why_30" : "moon_why_30_early", v30) + tryText(ev, lat, lng, off, now);
    }
    if (o.len === 29) {
      var ev9 = evening(nextStart - DAY, lat, lng);           /* sunset of day 29 = the last day */
      if (!ev9 || !ev9.visible) return "";
      return A2.t("moon_why_29", { cur: o.cur, len: fa(o.len), d: fa(29), illum: A2.percent(ev9.illum.toFixed(2)), dur: fa(ev9.dur) });
    }
    return "";
  }

  /* for a 30-day month: the best moment to try to see the crescent on the evening of day 29 anyway
     (same moment as in buildBest: 4/9 of the way from sunset to moonset); nothing once that moment has passed */
  function tryText(ev, lat, lng, off, now) {
    var A = root.AzanLang, bt = null, m = null;
    if (ev.age > 0 && ev.dur > 0) { bt = ev.t + (4 / 9) * ev.dur * MIN; m = moonAt(bt, lat, lng); }
    if (now > (bt !== null ? bt : ev.t)) return "";
    if (bt === null || ev.V < -0.96) return " " + A.t("moon_try_none");
    var g = new Date(ev.t + off * 3600000);
    return " " + A.t("moon_try", {
      weekday: A.names("weekdays")[g.getUTCDay()], gd: fa(g.getUTCDate()), gm: A.names("greg")[g.getUTCMonth()],
      time: hm(bt, off), mins: fa(Math.round((bt - ev.t) / MIN)), alt: fa(Math.max(1, Math.round(m.alt))), dir: dirText(m.az),
      how: A.t(ev.V >= 5.65 ? "moon_best_naked" : (ev.V >= 2 ? "moon_best_aid" : "moon_best_optical"))
    });
  }

  /* Best time and place to see the next new crescent: the evening of the last day of the month (the evening the
     month-start rule looks at). The best moment is 4/9 of the way from sunset to moonset (Yallop); the text gives
     that time, the height of the Moon above the horizon and its direction, and how it can be seen (Odeh zones:
     V >= 5.65 naked eye, V >= 2 optical aid and possibly naked eye, V >= -0.96 optical aid only, below: not visible).
     Nothing is shown once that moment has passed. */
  function buildBest(o, nextStart, lat, lng, off, now) {
    var A = root.AzanLang, ev = evening(nextStart - DAY, lat, lng);
    if (!ev) return "";
    var bt = null, m = null;
    if (ev.age > 0 && ev.dur > 0) { bt = ev.t + (4 / 9) * ev.dur * MIN; m = moonAt(bt, lat, lng); }
    if (now > (bt !== null ? bt : ev.t)) return "";
    var g = new Date(ev.t + off * 3600000);
    var vars = { next: o.next, weekday: A.names("weekdays")[g.getUTCDay()], gd: fa(g.getUTCDate()), gm: A.names("greg")[g.getUTCMonth()] };
    if (bt === null || ev.V < -0.96) return A.t("moon_best_none", vars);
    vars.time = hm(bt, off);
    vars.mins = fa(Math.round((bt - ev.t) / MIN));
    vars.alt = fa(Math.max(1, Math.round(m.alt)));
    vars.dir = dirText(m.az);
    vars.how = A.t(ev.V >= 5.65 ? "moon_best_naked" : (ev.V >= 2 ? "moon_best_aid" : "moon_best_optical"));
    return A.t("moon_best", vars) + " " + A.t("moon_best_tip");
  }

  /* local calendar date (YYYY-MM-DD) of an instant at a fixed offset */
  function ymdOf(ms, off) {
    var d = new Date(ms + off * 3600000);
    return d.getUTCFullYear() + "-" + p2(d.getUTCMonth() + 1) + "-" + p2(d.getUTCDate());
  }

  function compute(lat, lng, off, now) {
    var sEcl = sunEcl(now), mEcl = moonEcl(now);
    var illumNow = (1 - Math.cos(sep(sEcl.eq, mEcl.eq) * RAD)) / 2 * 100;
    var waxing = wrap(mEcl.lon - sEcl.lon) > 0;
    var out = { illumNow: illumNow, waxing: waxing, img: imageName(illumNow, waxing), rise: null, set: null,
                sunsetIllum: null, text: "" };

    var td = dayStart(now, off);
    crossings(function (x) { return moonAt(x, lat, lng).alt; }, H0_MOON, td, td + DAY).forEach(function (e) {
      if (e.rising && !out.rise) out.rise = { t: e.t, az: moonAt(e.t, lat, lng).az };
      if (!e.rising && !out.set) out.set = { t: e.t, az: moonAt(e.t, lat, lng).az };
    });

    var today = evening(td, lat, lng);
    if (today) out.sunsetIllum = today.illum;

    var OFF = root.AzanOfficial, names = root.AzanLang.names("hijri");
    var entry = OFF ? OFF.covering(ymdOf(now, off)) : null;          /* official month, if the owner listed it */
    var cm = entry ? null : currentMonth(now, lat, lng, off);
    var start = entry ? OFF.dayMs(entry.start) - off * 3600000 : (cm ? cm.start : null);
    if (start !== null && !entry && cm.next === null) start = null;
    if (start !== null) {
      var nextStart = entry ? start + (+entry.length) * DAY : cm.next;
      var lastEve = nextStart - DAY;                                 /* evening of the last day */
      var lastEv = dayEvent(lastEve, lat, lng);
      out.len = Math.round((nextStart - start) / DAY);
      out.last = {
        visible: passes(lastEve, lat, lng),
        illum: lastEv.illum,
        dur: Math.max(0, Math.round(lastEv.lag))
      };
      out.cur = entry ? names[(+entry.hijriMonth - 1 + 12) % 12] : hijriName(start, off);
      out.next = entry ? names[(+entry.hijriMonth) % 12] : hijriName(nextStart, off);
      out.nextStart = nextStart;
      out.official = !!entry;
      /* today's Hijri date, from the same start day as the moon card */
      out.hijriDay = Math.round((dayStart(now, off) - start) / DAY) + 1;
      out.hijriYear = entry ? +entry.hijriYear : +hijriYearFmt.formatToParts(new Date(start + 12 * 3600000 + off * 3600000))
        .filter(function (x) { return x.type === "year"; })[0].value;
      out.text = buildText(out);
      out.startText = buildStartText(out) + " " + root.AzanLang.t(entry ? "official_mark" : "predicted_mark");
      out.whyText = buildWhy(out, entry, start, nextStart, lat, lng, off, now);
      out.bestText = buildBest(out, nextStart, lat, lng, off, now);
    }
    return out;
  }

  /* ---- page ---- */
  var state = null, lastOut = null;
  function put(id, t) { var e = document.getElementById(id); if (e) e.textContent = t; }
  function render() {
    if (!state || typeof document === "undefined") return;
    var o;
    try { o = compute(state.lat, state.lng, state.off, Date.now()); }
    catch (err) { return; }
    lastOut = o;
    put("mNow", root.AzanLang.percent(o.illumNow.toFixed(2)));
    put("mRise", o.rise ? hm(o.rise.t, state.off) : "—");
    put("mRiseDir", o.rise ? dirText(o.rise.az) : "");
    put("mSet", o.set ? hm(o.set.t, state.off) : "—");
    put("mSetDir", o.set ? dirText(o.set.az) : "");
    put("mSunset", o.sunsetIllum !== null ? root.AzanLang.percent(o.sunsetIllum.toFixed(2)) : "—");
    put("mText", o.text);
    if (o.hijriDay) {
      put("d-h-day", root.AzanLang.num(o.hijriDay));
      put("d-h-my", o.cur + " " + root.AzanLang.num(o.hijriYear));
    }
    put("mStart", o.startText || "");
    put("mWhy", o.whyText || "");
    put("mBest", o.bestText || "");
    put("mIntro", o.next ? root.AzanLang.t("moon_sight_intro", { next: o.next }) : "");
    arrangeMessages();
    var img = document.getElementById("moonImg");
    if (img) {
      var src = "images/moon/" + o.img;
      if (img.getAttribute("src") !== src) img.setAttribute("src", src);
      img.alt = root.AzanLang.t("moon_alt", { p: fa(o.illumNow.toFixed(1)) });
    }
  }
  /* the card has two tabs: "the Moon right now" (the numbers) and "<next month> sighting" (every explanation: the main messages, the start
     of the month, why, the best time, the weather outlook and the note about the criterion). The second tab shows only when there is
     something behind it. */
  function arrangeMessages() {
    var tabs = document.getElementById("moonTabs");
    if (!tabs) return;
    var extra = ["mText", "mStart", "mWhy", "mBest", "mNote"].some(function (id) { var e = document.getElementById(id); return e && e.textContent; });
    tabs.hidden = !extra;
    if (!extra) showTab("now");
    setTabLabels();
    fitClip();
  }
  function setTabLabels() {
    var b = document.getElementById("mtab-next");
    if (!b) return;
    /* the second tab always names the next month ("Ramadan sighting"); without a known next month the old "more info" text is used */
    var nx = lastOut && lastOut.next;
    b.textContent = nx ? root.AzanLang.t("moon_sight", { next: nx }) : root.AzanLang.t("moon_more");
  }
  function showTab(which) {
    var now = document.getElementById("moonPanelNow"), more = document.getElementById("moonMore");
    var tn = document.getElementById("mtab-now"), tx = document.getElementById("mtab-next");
    if (!now || !more || !tn || !tx) return;
    var isNow = which === "now";
    if (!isNow && !now.hidden && now.offsetHeight) nowH = now.offsetHeight; /* remember how tall the first tab is */
    if (!isNow && more.hidden) clipOpen = false; /* the second tab always opens closed */
    now.hidden = !isNow; more.hidden = isNow;
    tn.classList.toggle("active", isNow); tx.classList.toggle("active", !isNow);
    tn.setAttribute("aria-selected", isNow ? "true" : "false");
    tx.setAttribute("aria-selected", isNow ? "false" : "true");
    fitClip();
  }
  /* the second tab is as tall as the first one; more text than fits is cut and can be opened / closed by the person */
  var nowH = 0, clipOpen = false;
  function fitClip() {
    var more = document.getElementById("moonMore"), clip = document.getElementById("moonClip"), btn = document.getElementById("moonToggle");
    if (!more || !clip || !btn || more.hidden) return;
    var nowEl = document.getElementById("moonPanelNow");
    if (nowEl && !nowEl.hidden && nowEl.offsetHeight) nowH = nowEl.offsetHeight; /* the first tab is shorter now: always follow its real height */
    var limit = Math.max(120, (nowH || 260) - 44);
    clip.style.maxHeight = "none";
    var full = clip.scrollHeight;
    if (full <= limit + 12) { /* it fits: no cut, no button */
      clip.classList.remove("is-clipped"); btn.hidden = true; return;
    }
    btn.hidden = false;
    clip.classList.toggle("is-clipped", !clipOpen);
    clip.style.maxHeight = clipOpen ? "none" : limit + "px";
    btn.setAttribute("aria-expanded", clipOpen ? "true" : "false");
    btn.textContent = root.AzanLang.t(clipOpen ? "moon_less" : "moon_more");
  }
  if (typeof document !== "undefined") {
    var tgl = document.getElementById("moonToggle");
    if (tgl) tgl.addEventListener("click", function () { clipOpen = !clipOpen; fitClip(); });
    if (typeof window !== "undefined" && window.addEventListener) window.addEventListener("resize", fitClip);
  }
  if (typeof document !== "undefined") {
    var tabNow = document.getElementById("mtab-now"), tabNext = document.getElementById("mtab-next");
    if (tabNow) tabNow.addEventListener("click", function () { showTab("now"); });
    if (tabNext) tabNext.addEventListener("click", function () { showTab("next"); });
  }
  function update(lat, lng, off) { state = { lat: lat, lng: lng, off: off }; render(); }
  if (typeof window !== "undefined" && window.addEventListener) window.addEventListener("azan:langchange", render);
  if (root && root.AzanOfficial && root.AzanOfficial.onReady) root.AzanOfficial.onReady(render);
  if (root && root.AzanOfficial && root.AzanOfficial.onChange) root.AzanOfficial.onChange(render);
  if (typeof document !== "undefined") setInterval(render, 5 * MIN);

  /* Hijri months that start in [fromMs, toMs) for this place, with their lengths (same rule as above) */
  var hijriYearFmt = new Intl.DateTimeFormat("en-u-ca-islamic-tbla-nu-latn", { year: "numeric", timeZone: "UTC" });
  function monthsBetween(fromMs, toMs, lat, lng, off) {
    var OFF = root.AzanOfficial, names = root.AzanLang.names("hijri");
    var offList = OFF ? OFF.all() : [];
    function fieldsOf(s) {
      var local = new Date(s + 12 * 3600000 + off * 3600000), sh = {};
      persianNum.formatToParts(local).forEach(function (x) { if (x.type !== "literal") sh[x.type] = +x.value; });
      return {
        greg: { d: local.getUTCDate(), m: local.getUTCMonth() + 1, y: local.getUTCFullYear() },
        shamsi: { d: sh.day, m: sh.month, y: sh.year }
      };
    }
    var items = [];
    /* 1. months the owner listed (official) */
    offList.forEach(function (e) {
      var s = OFF.dayMs(e.start) - off * 3600000;
      if (s < fromMs || s >= toMs) return;
      items.push(Object.assign({ start: s, len: +e.length, hijriName: names[(+e.hijriMonth - 1 + 12) % 12],
        hijriYear: +e.hijriYear, official: true }, fieldsOf(s)));
    });
    /* 2. predicted months that are not inside an official month */
    var starts = monthChain(lat, lng, off, fromMs, toMs + 70 * DAY);
    starts.forEach(function (s, idx) {
      if (s < fromMs || s >= toMs || idx + 1 >= starts.length) return;
      var inOfficial = offList.some(function (e) {
        var a0 = OFF.dayMs(e.start) - off * 3600000;
        return s >= a0 && s < a0 + (+e.length) * DAY;
      });
      if (inOfficial) return;
      var nextStart = starts[idx + 1];
      items.push(Object.assign({ start: s, len: Math.round((nextStart - s) / DAY),
        hijriName: hijriName(s, off),
        hijriYear: +hijriYearFmt.formatToParts(new Date(s + 12 * 3600000 + off * 3600000))
          .filter(function (x) { return x.type === "year"; })[0].value,
        official: false }, fieldsOf(s)));
    });
    items.sort(function (x, y) { return x.start - y.start; });
    return items;
  }
  /* the Hijri months of a year: Gregorian year for the Gregorian calendar, Solar Hijri year otherwise */
  function yearMonths(mode, year, lat, lng, off) {
    var y = mode === "greg" ? year : year + 621;                  /* Solar Hijri year starts on 21 March */
    var from = mode === "greg" ? Date.UTC(y, 0, 1, 12) : Date.UTC(y, 2, 21, 12);
    var to = mode === "greg" ? Date.UTC(y + 1, 0, 1, 12) : Date.UTC(y + 1, 2, 21, 12);
    return monthsBetween(dayStart(from, off), dayStart(to, off), lat, lng, off);
  }

  var api = { update: update, compute: compute, render: render, yearMonths: yearMonths, current: function () { return lastOut; } };
  if (root) root.MoonInfo = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this));
