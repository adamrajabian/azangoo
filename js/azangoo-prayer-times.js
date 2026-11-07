/* Copyright (c) 2026 azangoo.com. All rights reserved.
   Copying, reuse, modification or redistribution of this code, or of its calculations,
   is prohibited without written permission. See the Terms and conditions page. */
/*
 * AzanGoo prayer-time module: a line-by-line port of the legacy PrayerTimes.cs
 * (praytimes.org algorithm with the AzanGoo settings), including its date and
 * time-zone rules. No server or external library is needed.
 *
 * Settings from the C# code (dynamicA method):
 *   fajr    = latitude-based angle (table below), rounded to 4 decimals
 *   imsak   = fajr - 10 min
 *   sunrise / sunset = 0.833 degrees (plus elevation term)
 *   maghrib = 4 degrees below the horizon (as shown on the live site)
 *   isha    = 15 degrees below the horizon
 *   asr     = Standard (shadow factor 1)
 *   highLats = NightMiddle, midnight = Jafari (sunset + half of sunset..fajr)
 *
 * Time-zone rules from TimeZoneCalulate.cs:
 *   - the calendar date is taken at the zone's standard (base) offset;
 *   - the time offset is the zone's offset right now (DST-aware);
 *   - Egypt uses the base offset only;
 *   - Iran (Asia/Tehran) gets its hard-coded -1/+1 hour on 20-21 March and 20-21 September.
 */
(function (root) {
  'use strict';

  const DEG = Math.PI / 180;
  const sin = d => Math.sin(d * DEG);
  const cos = d => Math.cos(d * DEG);
  const tan = d => Math.tan(d * DEG);
  const acos = x => Math.acos(x) / DEG;
  const asin = x => Math.asin(x) / DEG;
  const atan2 = (y, x) => Math.atan2(y, x) / DEG;
  const arccot = x => Math.atan(1 / x) / DEG;

  // C# DMath.Fix: a - b*floor(a/b), plus b when negative
  function fix(a, b) {
    a = a - b * Math.floor(a / b);
    return a < 0 ? a + b : a;
  }
  const fixAngle = a => fix(a, 360);
  const fixHour = a => fix(a, 24);
  const timeDiff = (t1, t2) => fixHour(t2 - t1);
  const pad2 = n => (n < 10 ? '0' : '') + n;

  // C# Julian(year, month, day)
  function julian(year, month, day) {
    if (month <= 2) { year -= 1; month += 12; }
    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
  }

  // C# SunPosition (US Naval Observatory approximation)
  function sunPosition(jd) {
    const D = jd - 2451545.0;
    const g = fixAngle(357.529 + 0.98560028 * D);
    const q = fixAngle(280.459 + 0.98564736 * D);
    const L = fixAngle(q + 1.915 * sin(g) + 0.020 * sin(2 * g));
    const e = 23.439 - 0.00000036 * D;
    const RA = atan2(cos(e) * sin(L), cos(L)) / 15;
    return {
      equation: q / 15 - fixHour(RA),
      declination: asin(sin(e) * sin(L))
    };
  }

  // C# GetFajrDegree: interpolation table by absolute latitude
  function fajrAngleForLatitude(latitude) {
    const pts = [[12.0, 60.5], [13.2, 51.3], [15.0, 43.5], [16.0, 40.7], [17.7, 32.6], [18.0, 25.3]];
    const a = Math.abs(latitude);
    if (a >= pts[0][1]) return pts[0][0];
    if (a <= pts[5][1]) return pts[5][0];
    for (let i = 0; i < 5; i++) {
      const up = pts[i], down = pts[i + 1];
      if (a <= up[1] && a >= down[1]) {
        return down[0] - ((a - down[1]) * (down[0] - up[0]) / (up[1] - down[1]));
      }
    }
    return pts[5][0];
  }

  // C# GetFormattedTime("24h"): round to the minute, then HH:MM
  function formatTime(hours) {
    if (!Number.isFinite(hours)) return '-----';
    const t = fixHour(hours + 0.5 / 60);
    const h = Math.floor(t);
    const m = Math.floor((t - h) * 60);
    return pad2(h) + ':' + pad2(m);
  }
  // C# Tools.GetWithNoZero
  const noZero = s => (s.charAt(0) === '0' ? s.substring(1) : s);

  // compute one day's times at the given local date and time-zone offset (hours)
  function computeDay(latitude, longitude, elevation, year, month, day, tz) {
    const jd = julian(year, month, day) - longitude / (15 * 24);
    const fajrAngle = Number(fajrAngleForLatitude(latitude).toFixed(4));
    const riseSet = 0.833 + 0.0347 * Math.sqrt(elevation);

    const midDay = t => fixHour(12 - sunPosition(jd + t).equation);
    const sunAngleTime = (angle, t, dir) => {
      const decl = sunPosition(jd + t).declination;
      const noon = midDay(t);
      const t1 = acos((-sin(angle) - sin(decl) * sin(latitude)) / (cos(decl) * cos(latitude)));
      const hours = t1 / 15;
      return noon + (dir === 'ccw' ? -hours : hours);
    };
    const asrTime = (factor, t) => {
      const decl = sunPosition(jd + t).declination;
      const angle = -arccot(factor + tan(Math.abs(latitude - decl)));
      return sunAngleTime(angle, t, '');
    };

    // ComputePrayerTimes (default times in hours, converted to fractions of a day)
    const T = {
      imsak: sunAngleTime(10, 5 / 24, 'ccw'),
      fajr: sunAngleTime(fajrAngle, 5 / 24, 'ccw'),
      sunrise: sunAngleTime(riseSet, 6 / 24, 'ccw'),
      dhuhr: midDay(12 / 24),
      asr: asrTime(1, 13 / 24),
      sunset: sunAngleTime(riseSet, 18 / 24, ''),
      maghrib: sunAngleTime(4, 18 / 24, ''),
      isha: sunAngleTime(15, 18 / 24, '')
    };

    // AdjustTimes: time zone and longitude
    const adj = tz - longitude / 15;
    for (const k of Object.keys(T)) T[k] += adj;

    // AdjustHighLats (NightMiddle: half of the night)
    const night = timeDiff(T.sunset, T.sunrise);
    const portion = 0.5 * night;
    const adjustHL = (time, base, dir) => {
      const diff = dir === 'ccw' ? timeDiff(time, base) : timeDiff(base, time);
      return (Number.isNaN(time) || diff > portion) ? base + (dir === 'ccw' ? -portion : portion) : time;
    };
    T.imsak = adjustHL(T.imsak, T.sunrise, 'ccw');
    T.fajr = adjustHL(T.fajr, T.sunrise, 'ccw');
    T.isha = adjustHL(T.isha, T.sunset, '');
    T.maghrib = adjustHL(T.maghrib, T.sunset, '');

    // imsak is "10 min" before fajr
    T.imsak = T.fajr - 10 / 60;
    // midnight (Jafari): sunset + half of (sunset to fajr)
    T.midnight = T.sunset + timeDiff(T.sunset, T.fajr) / 2;

    return {
      imsak: noZero(formatTime(T.imsak)),
      fajr: noZero(formatTime(T.fajr)),
      sunrise: noZero(formatTime(T.sunrise)),
      dhuhr: formatTime(T.dhuhr),
      asr: formatTime(T.asr),
      sunset: formatTime(T.sunset),
      maghrib: formatTime(T.maghrib),
      isha: formatTime(T.isha),
      midnight: noZero(formatTime(T.midnight)),
      timeZoneNumber: tz,
      fajrAngle: fajrAngle
    };
  }

  /**
   * Prayer times for an explicit local date.
   * @param {Object} o
   * @param {number} o.latitude
   * @param {number} o.longitude
   * @param {number} o.year, o.month, o.day   calendar date at the location
   * @param {number} o.timeZoneOffsetHours    UTC offset in hours for that date
   * @param {number} [o.elevationMeters=0]
   * @returns the C# output keys plus nextfajr (fajr of the next day, same offset)
   */
  function calculatePrayerTimes(o) {
    const lat = Number(o.latitude), lng = Number(o.longitude), tz = Number(o.timeZoneOffsetHours);
    const elev = Number(o.elevationMeters || 0);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) throw new Error('latitude must be between -90 and 90');
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) throw new Error('longitude must be between -180 and 180');
    if (!Number.isFinite(tz)) throw new Error('timeZoneOffsetHours is required');

    const y = Number(o.year), m = Number(o.month), d = Number(o.day);
    const res = computeDay(lat, lng, elev, y, m, d, tz);
    const next = new Date(Date.UTC(y, m - 1, d + 1));
    const nextDay = computeDay(lat, lng, elev, next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate(), tz);
    res.nextfajr = nextDay.fajr;
    res.localDate = y + '-' + pad2(m) + '-' + pad2(d);
    return res;
  }

  // offset in hours of an IANA zone at an instant (DST-aware)
  const partsFormat = zone => new Intl.DateTimeFormat('en-US', {
    timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric'
  });
  function offsetAt(zone, ms) {
    const p = {};
    partsFormat(zone).formatToParts(new Date(ms)).forEach(x => { if (x.type !== 'literal') p[x.type] = +x.value; });
    const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    return (asUtc - Math.floor(ms / 1000) * 1000) / 3600000;
  }
  // C# BaseUtcOffset (standard time): the smaller of January and July offsets
  function baseOffset(zone, ms) {
    const y = new Date(ms).getUTCFullYear();
    return Math.min(offsetAt(zone, Date.UTC(y, 0, 1)), offsetAt(zone, Date.UTC(y, 6, 1)));
  }

  /**
   * Prayer times for right now at a location, with the same date and time-zone
   * rules as the C# GetTimes(DateTime, coords, pTzid) path.
   * @param {Object} o
   * @param {number} o.latitude, o.longitude
   * @param {string} [o.zoneName]  IANA zone, e.g. "America/Toronto"
   * @param {number} [o.fallbackOffsetHours]  used when no zone name is known
   * @param {number} [o.now]  ms timestamp (default: now)
   */
  function calculateForNow(o) {
    const now = o.now != null ? o.now : Date.now();
    const zone = o.zoneName || null;
    let base, tz;
    if (zone) {
      base = baseOffset(zone, now);
      tz = zone === 'Africa/Cairo' ? base : offsetAt(zone, now);   // Egypt: base offset only
    } else {
      base = Number(o.fallbackOffsetHours);
      tz = base;
    }
    // the calendar date is the date at the base (standard) offset
    const dt = new Date(now + base * 3600000);
    const y = dt.getUTCFullYear(), m = dt.getUTCMonth() + 1, d = dt.getUTCDate();
    if (zone === 'Asia/Tehran') {                                  // Iran hard-coded adjustment
      const key = pad2(d) + pad2(m);
      if (key === '2003' || key === '2103') tz -= 1;
      else if (key === '2009' || key === '2109') tz += 1;
    }
    return calculatePrayerTimes({
      latitude: o.latitude, longitude: o.longitude, year: y, month: m, day: d,
      timeZoneOffsetHours: tz, elevationMeters: o.elevationMeters || 0
    });
  }

  const api = { calculatePrayerTimes, calculateForNow, fajrAngleForLatitude, offsetAt, baseOffset };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.AzangooPrayerTimes = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
