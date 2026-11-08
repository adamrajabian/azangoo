#!/usr/bin/env node
/* Copyright (c) 2026 azangoo.com. All rights reserved.
   Checks of the calculation methods (js/azangoo-prayer-times.js). The assertions are the ones of the Android app tests
   (CalcMethodTest, SeasonalFajrTest, AsrTimeTest), so the site and the app agree. Run: node tools/test-methods.js */
'use strict';
const path = require('path');
const assert = require('assert');
const PT = require(path.join(__dirname, '../js/azangoo-prayer-times.js'));

const min = s => { const m = /^(\d{1,2}):(\d\d)$/.exec(s); return +m[1] * 60 + +m[2]; };
let n = 0;
const test = (name, fn) => { fn(); n++; console.log('ok  ' + name); };
const TEHRAN = { latitude: 35.69439, longitude: 51.42151, zone: 'Asia/Tehran' };
const TORONTO = { latitude: 43.6532, longitude: -79.3832, zone: 'America/Toronto' };
const KARACHI = { latitude: 24.8607, longitude: 67.0011, zone: 'Asia/Karachi' };
const MECCA = { latitude: 21.4225, longitude: 39.8262, zone: 'Asia/Riyadh' };

/* the local calendar date and the offset of the zone at noon of that date */
function day(method, place, y, m, d, asr) {
  const noon = Date.UTC(y, m - 1, d, 12);
  const tz = PT.offsetAt(place.zone, noon);
  const r = PT.calculatePrayerTimes({ latitude: place.latitude, longitude: place.longitude, year: y, month: m, day: d, timeZoneOffsetHours: tz, method, asrFactor: asr });
  const o = {}; for (const k of ['fajr', 'sunrise', 'dhuhr', 'asr', 'sunset', 'maghrib', 'isha', 'midnight']) o[k] = min(r[k]); return o;
}

test('azangoo is the default; unknown ids fall back to it', () => {
  assert.strictEqual(PT.getMethod(), 'azangoo');
  assert.strictEqual(PT.methodOf('something old'), 'azangoo');
  assert.strictEqual(PT.methodOf(null), 'azangoo');
  assert.strictEqual(PT.methodOf('mwl'), 'mwl');
  assert.deepStrictEqual(day(undefined, TEHRAN, 2026, 11, 3), day('azangoo', TEHRAN, 2026, 11, 3));
});

test('lists per language: AzanGoo first, as in the app', () => {
  for (const l of ['fa', 'en', 'ar', 'ur', 'xx']) {
    const list = PT.methodsFor(l);
    assert.strictEqual(list[0], 'azangoo');
    assert.strictEqual(new Set(list).size, list.length);
  }
  assert.deepStrictEqual(PT.methodsFor('en'), PT.METHOD_IDS);
  assert.deepStrictEqual(PT.methodsFor('fa'), ['azangoo', 'jafari', 'tehran', 'moonsighting']);
  assert.ok(PT.methodsFor('ur').includes('karachi'));
  assert.ok(PT.methodsFor('ar').includes('makkah'));
});

test('Fajr follows the angle', () => {
  const f = m => day(m, TEHRAN, 2026, 11, 3).fajr;
  assert.ok(f('egypt') <= f('makkah'));
  assert.ok(f('makkah') <= f('mwl'));
  assert.strictEqual(f('mwl'), f('karachi'));
  assert.ok(f('mwl') <= f('tehran'));
  assert.ok(f('tehran') <= f('azangoo'));
  assert.ok(f('azangoo') <= f('jafari'));
  assert.ok(f('jafari') <= f('isna'));
  assert.ok(f('egypt') < f('azangoo'));
  assert.ok(f('azangoo') < f('isna'));
});

test('Jafari shares Maghrib with AzanGoo, not Fajr and Isha', () => {
  const a = day('azangoo', TEHRAN, 2026, 11, 3), j = day('jafari', TEHRAN, 2026, 11, 3);
  assert.strictEqual(a.maghrib, j.maghrib);
  assert.ok(a.isha > j.isha);
  assert.ok(j.midnight >= a.midnight);
  assert.notStrictEqual(a.fajr, j.fajr);
  assert.ok(day('tehran', TEHRAN, 2026, 11, 3).maghrib >= a.maghrib);
});

test('Sunni methods pray Maghrib at sunset; AzanGoo after it', () => {
  for (const m of ['mwl', 'isna', 'egypt', 'karachi', 'makkah']) {
    const t = day(m, TEHRAN, 2026, 11, 3); assert.strictEqual(t.sunset, t.maghrib, m);
  }
  const a = day('azangoo', TEHRAN, 2026, 11, 3); assert.ok(a.maghrib > a.sunset);
});

test('midnight: sunset to sunrise for MWL is later than Jafari (sunset to Fajr)', () => {
  assert.ok(day('mwl', TEHRAN, 2026, 11, 3).midnight > day('jafari', TEHRAN, 2026, 11, 3).midnight);
});

test('Umm al-Qura: Isha 90 minutes after Maghrib, 120 in Ramadan', () => {
  const nrm = day('makkah', MECCA, 2026, 11, 3);
  assert.ok(nrm.isha - nrm.maghrib >= 89 && nrm.isha - nrm.maghrib <= 90, 'normal ' + (nrm.isha - nrm.maghrib));
  const ram = day('makkah', MECCA, 2026, 3, 1);                 // 13 Ramadan 1447
  assert.ok(ram.isha - ram.maghrib >= 119 && ram.isha - ram.maghrib <= 120, 'ramadan ' + (ram.isha - ram.maghrib));
});

test('Dhuhr, sunrise, sunset and Asr do not depend on the method', () => {
  const a = day('azangoo', TEHRAN, 2026, 11, 3);
  for (const m of PT.METHOD_IDS) {
    const t = day(m, TEHRAN, 2026, 11, 3);
    for (const k of ['dhuhr', 'sunrise', 'sunset', 'asr']) assert.strictEqual(t[k], a[k], m + ' ' + k);
  }
});

test('Hanafi Asr is later and nothing else moves', () => {
  const s = day('azangoo', KARACHI, 2026, 11, 3, 1), h = day('azangoo', KARACHI, 2026, 11, 3, 2);
  assert.ok(h.asr > s.asr && h.asr - s.asr >= 20 && h.asr - s.asr <= 120);
  for (const k of ['fajr', 'sunrise', 'dhuhr', 'sunset', 'maghrib', 'isha']) assert.strictEqual(s[k], h[k], k);
});

test('Moonsighting: published seasonal minutes (Toronto)', () => {
  const f = (m, d) => PT.seasonalFajrMinutes(TORONTO.latitude, 2026, m, d);
  const near = (a, b) => assert.ok(Math.abs(a - b) <= 0.01, a + ' vs ' + b);
  near(f(12, 21), 97.739); near(f(1, 1), 96.856); near(f(3, 20), 90.590);
  near(f(6, 21), 112.912); near(f(9, 22), 90.429); near(f(11, 7), 94.125);
  const i = (m, d) => PT.seasonalIshaMinutes(TORONTO.latitude, 2026, m, d);
  near(i(12, 21), 95.319); near(i(3, 20), 77.038); near(i(6, 21), 79.608); near(i(9, 22), 76.627); near(i(11, 7), 86.076);
  assert.strictEqual(PT.seasonalIshaMinutes(0, 2026, 5, 5), 75);
});

test('Moonsighting: the equator is 75 minutes; the south is half a year apart; the year closes', () => {
  for (let m = 1; m <= 12; m++) assert.strictEqual(PT.seasonalFajrMinutes(0, 2026, m, 15), 75);
  assert.ok(Math.abs(PT.seasonalFajrMinutes(43.6532, 2026, 12, 21) - PT.seasonalFajrMinutes(-43.6532, 2026, 6, 21)) < 1e-9);
  assert.ok(Math.abs(PT.seasonalFajrMinutes(43.6532, 2026, 12, 20) - PT.seasonalFajrMinutes(43.6532, 2026, 12, 21)) < 0.5);
  assert.ok(Math.abs(PT.seasonalFajrMinutes(43.6532, 2026, 12, 31) - PT.seasonalFajrMinutes(43.6532, 2027, 1, 1)) < 0.5);
});

test('Moonsighting all year in Toronto: Fajr not earlier than 18 degrees, Isha not later, Maghrib like AzanGoo', () => {
  for (let k = 0; k < 365; k++) {
    const dt = new Date(Date.UTC(2026, 0, 1 + k)), y = 2026, m = dt.getUTCMonth() + 1, d = dt.getUTCDate();
    const mo = day('moonsighting', TORONTO, y, m, d), mwl = day('mwl', TORONTO, y, m, d), ka = day('karachi', TORONTO, y, m, d), az = day('azangoo', TORONTO, y, m, d);
    assert.ok(mo.fajr >= mwl.fajr && mo.fajr < mo.sunrise, 'fajr ' + y + '-' + m + '-' + d);
    assert.ok(mo.isha <= ka.isha, 'isha ' + m + '-' + d);
    assert.strictEqual(mo.maghrib, az.maghrib);
    assert.ok(mo.maghrib > mo.sunset && mo.isha > mo.maghrib);
    assert.strictEqual(mo.sunrise, mwl.sunrise); assert.strictEqual(mo.dhuhr, mwl.dhuhr);
  }
});

test('Moonsighting Fajr gap follows the season in Toronto', () => {
  const gap = (m, d) => { const t = day('moonsighting', TORONTO, 2026, m, d); return t.sunrise - t.fajr; };
  assert.ok(gap(6, 21) >= 108 && gap(6, 21) <= 116);
  assert.ok(gap(12, 21) >= 94 && gap(12, 21) <= 101);
  assert.ok(gap(3, 20) >= 87 && gap(3, 20) <= 94);
});

test('setMethod changes the default of calculateForNow; the old call without method stays AzanGoo', () => {
  const now = Date.UTC(2026, 10, 3, 9, 0);
  const o = { latitude: TEHRAN.latitude, longitude: TEHRAN.longitude, zoneName: TEHRAN.zone, now };
  const a = PT.calculateForNow(o).fajr;
  PT.setMethod('isna'); const b = PT.calculateForNow(o).fajr; PT.setMethod('azangoo');
  assert.notStrictEqual(a, b);
  assert.strictEqual(PT.calculateForNow(o).fajr, a);
  assert.strictEqual(PT.calculateForNow(Object.assign({ method: 'isna' }, o)).fajr, b);
});

console.log('\n' + n + ' tests passed');
