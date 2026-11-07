/* Copyright (c) 2026 azangoo.com. All rights reserved.
   Copying, reuse, modification or redistribution of this code, or of its calculations,
   is prohibited without written permission. See the Terms and conditions page. */
/* Language support: Persian (default) and English.
   Text lives in one dictionary. Elements in the page are marked with data-i18n (text),
   data-i18n-attr (attribute) or data-i18n-ph (placeholder). The chosen language is kept
   in the browser (separately from the saved defaults). */
(function (root) {
  'use strict';

  var lang = 'fa';

  /* Language registry. To add a language: add its text to D, its names to NAMES, and one line here. */
  var LANGS = [
    { code: 'fa', label: 'فارسی', rtl: true,  digits: 'persian' },
    { code: 'en', label: 'English', rtl: false, digits: 'latin' },
    { code: 'ur', label: 'اردو', rtl: true,  digits: 'persian' },
    { code: 'ar', label: 'العربية', rtl: true, digits: 'arabic' }
  ];
  function info(code) {
    for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === code) return LANGS[i];
    return LANGS[0];
  }

  var D = {
    fa: {
      dua_timer_sahar: 'دعای سحر ماه رمضان ساعت {start} قبل از {adhan} شروع می‌شود.',
      dua_timer_iftar: 'دعای افطار ماه رمضان ساعت {start} قبل از {adhan} شروع می‌شود.',
      adhan_now: 'در حال پخش اذان…', adhan_muted: 'اذان بی‌صدا شروع شد؛ برای شنیدن صدا یک بار روی صفحه بزنید.',
      times_title: 'اوقات شرعی امروز', imsak: 'امساک', fajr: 'اذان صبح', sunrise: 'طلوع آفتاب',
      dhuhr: 'اذان ظهر', sunset: 'غروب آفتاب', maghrib: 'اذان مغرب', midnight: 'نیمه شب',
      fajr_next: 'اذان صبح فردا',
      cal_title: 'تقویم اوقات شرعی', cal_greg: 'میلادی', cal_shamsi: 'شمسی',
      cal_pick: 'انتخاب سال و ماه:', cal_year: '- سال -', cal_month: '- ماه -', cal_ok: 'تایید', cal_prev_m: 'ماه قبل', cal_next_m: 'ماه بعد', cal_prev_y: 'سال قبل', cal_next_y: 'سال بعد',
      cal_pick_ym: 'لطفاً سال و ماه را انتخاب کنید.', cal_need_place: 'ابتدا مکان را روی نقشه انتخاب کنید.',
      cal_no_pdf: 'ساخت PDF در دسترس نیست.', cal_busy: 'در حال ساخت PDF…', cal_done: 'فایل PDF ساخته شد.',
      cal_fail: 'ساخت PDF انجام نشد.',
      search_ph: 'جستجوی شهر یا آدرس…', search_btn: 'جستجو', searching: 'در حال جستجو…',
      not_found: 'مکانی پیدا نشد. نام شهر یا آدرس را دقیق‌تر بنویسید.',
      search_failed: 'جستجو انجام نشد. اتصال اینترنت را بررسی کنید.',
      lat: 'عرض جغرافیایی', lng: 'طول جغرافیایی', city: 'شهر', calc_btn: 'محاسبه اوقات',
      map_hint: 'روی نقشه دابل‌کلیک کنید یا نشانگر را بکشید تا مکان شما عوض شود.',
      map_label: 'نقشه', calc_fail: 'محاسبه اوقات برای این مکان ممکن نیست.',
      zone_fallback: 'منطقهٔ زمانی این مکان پیدا نشد؛ از ساعت دستگاه شما استفاده شد.',
      bad_coords: 'عرض یا طول جغرافیایی معتبر نیست.',
      locating: 'در حال پیدا کردن مکان فعلی…',
      geo_denied: 'موقع فعلی دریافت نشد. روی نقشه دابل‌کلیک کنید یا شهر را جستجو کنید.',
      moon_title: 'رؤیت ماه', moon_now: 'درصد روشنایی هم اکنون', moon_rise: 'طلوع ماه',
      moon_set: 'غروب ماه', moon_sunset: 'درصد روشنایی هنگام غروب',
      moon_visible: 'ماه {cur} در این مکان {len} روز می‌باشد و در غروب روز آخر هلال ماه {next} {illum} و به مدت {dur} دقیقه (فاصله غروب خورشید تا غروب ماه) رؤیت می‌شود.',
      moon_hidden: 'ماه {cur} در این مکان {len} روز می‌باشد. در غروب روز آخر، هلال ماه {next} با {illum} روشنایی قابل رؤیت نیست.',
      moon_start: 'اول ماه {next} در این مکان روز {weekday} {gd} {gm} {gy} برابر {sd} {sm} {sy} می‌باشد.',
      moon_follow_official: 'آغاز یا پایان ماه {cur} با اعلام رسمی ماه کناری آن هماهنگ شده است؛ طول این ماه {len} روز است.',
      moon_odeh: 'رؤیت هلال با معیار عودة (Odeh V-criterion) برآورد می‌شود؛ تخمینی است و اعلام رسمی نیست.',
      privacy_link: 'حریم خصوصی',
      moon_official_same: 'طول ماه {cur} ({len} روز) بر اساس اعلام رسمی تنظیم شده است.',
      moon_official_len: 'طول ماه {cur} بر اساس اعلام رسمی {len} روز تنظیم شد، در حالی که محاسبهٔ نجومی سایت آن را {plen} روز پیش‌بینی کرده بود.',
      moon_official_shift: 'آغاز ماه {cur} بر اساس اعلام رسمی تنظیم شد و {n} روز با محاسبهٔ نجومی سایت تفاوت دارد.',
      moon_why_short: 'هلال غروب روز {d} دیده نمی‌شود؛ پس ماه {cur} {len} روز است.',
      moon_why_30: 'در غروب روز {d} ماه {cur}، ماه {illum} روشن است و فقط {dur} دقیقه بعد از خورشید غروب می‌کند؛ در این شرایط هلال دیده نمی‌شود و به همین دلیل ماه {cur} {len} روز است.',
      moon_why_30_early: 'در غروب روز {d} ماه {cur}، ماه {illum} روشن است و پیش از خورشید غروب می‌کند؛ هلال دیده نمی‌شود و به همین دلیل ماه {cur} {len} روز است.',
      moon_why_29: 'در غروب روز {d} ماه {cur}، ماه {illum} روشن است و {dur} دقیقه بعد از خورشید غروب می‌کند؛ هلال دیده می‌شود و به همین دلیل ماه {cur} {len} روز است.',
      moon_try: 'اگر می‌خواهید امتحان کنید، بهترین زمان غروب {weekday} {gd} {gm}، ساعت {time} (حدود {mins} دقیقه بعد از غروب خورشید)، حدود {alt} درجه بالای افق، {dir} است. {how}',
      moon_try_none: 'در این غروب هلال با هیچ وسیله‌ای قابل مشاهده نیست.',
      moon_best: 'بهترین زمان مشاهدهٔ هلال ماه {next} در این مکان: غروب {weekday} {gd} {gm}، ساعت {time} (حدود {mins} دقیقه بعد از غروب خورشید)، حدود {alt} درجه بالای افق، {dir}. {how}',
      moon_best_naked: 'با چشم غیرمسلح قابل مشاهده است.',
      moon_best_aid: 'با دوربین قابل مشاهده است و احتمال دارد با چشم غیرمسلح هم دیده شود.',
      moon_best_optical: 'فقط با دوربین قابل مشاهده است.',
      moon_best_none: 'در غروب {weekday} {gd} {gm}، هلال ماه {next} در این مکان قابل مشاهده نیست.',
      moon_best_tip: 'برای دیدن هلال، افق در آن جهت باید باز و بدون مانع باشد.',
      moon_alt: 'ماه، {p} درصد روشن',
      dir: 'از جهت {card}، {deg} درجه به سمت {side}',
      qibla: 'جهت قبله: {deg}° از شمال، در جهت عقربه‌های ساعت', qibla_label: 'جهت قبله',
      adhan_title: 'صدای اذان', r_moazen: 'موذن‌زاده اردبیلی', r_abather: 'اباذر الحلواجی', r_sobhdel: 'حسین صبحدل', r_najafi: 'فرید نجفی', r_aghati: 'محمد آقاتی', auto_label: 'پخش خودکار اذان و دعا',
      auto_hint: 'برای پخش خودکار، این صفحه باید باز باشد و یک بار روی آن کلیک کرده باشید.',
      hint_more: 'بیشتر', hint_less: 'کمتر',
      sound_bar: 'برای پخش خودکار اذان و دعا، یک‌بار روی صفحه کلیک کنید',
      sky_sunset: 'ابر هنگام غروب: {c} — {v}',
      sky_now_l: 'ابر و وضعیت هوا در این لحظه', wx_clear: 'صاف', wx_partly: 'نیمه‌ابری', wx_cloudy: 'ابری', wx_fog: 'مه‌آلود', wx_rain: 'ابری و بارانی', wx_snow: 'ابری و برفی', wx_storm: 'ابری همراه با رعدوبرق',
      sky_vis_l: 'دید افق هنگام غروب', sky_night_l: 'ابر امشب (تا نیمه‌شب)', sky_night_l_late: 'ابر الان تا طلوع آفتاب', sky_km: 'کیلومتر', sky_vis_help_label: 'توضیح دید افق', sky_vis_help: '«دید افق» یعنی در هوای همان لحظه تا چند کیلومتر دور را می‌شود واضح دید؛ هرچه عدد بزرگ‌تر باشد هوا شفاف‌تر است و مه، گرد و غبار یا دود کمتری در آن هست. این عدد پیش‌بینی هوای همین مکان برای لحظهٔ غروب خورشید است و ربطی به درصد روشنایی ماه ندارد. مهم‌ترین کاربردش برای دیدن هلال تازه (که باریک است و نزدیک افق دیده می‌شود) در غروبِ آخرین روز ماه قمری است؛ در شب‌های دیگر ماه فقط یک اطلاع از شفافیت هواست. ۱۵ کیلومتر و بیشتر: خوب؛ ۶ تا ۱۴ کیلومتر: متوسط؛ کمتر از ۶ کیلومتر: ضعیف. این فقط پیش‌بینی هواست و حکم رؤیت هلال را تغییر نمی‌دهد.', hadith_title: 'حدیث روز', hadith_close: 'بستن',
      sky_s_good: 'شرایط برای رؤیت هلال مناسب است', sky_s_mid: 'رؤیت هلال ممکن است، اما قطعی نیست', sky_s_bad: 'رؤیت هلال دشوار است',
      sky_v_good: 'خوب', sky_v_mid: 'متوسط', sky_v_bad: 'ضعیف (مه یا گرد و غبار)',
      sky_n_good: 'ماه و ستارگان به‌خوبی دیده می‌شوند', sky_n_mid: 'آسمان نیمه‌ابری است', sky_n_bad: 'آسمان ابری است',
      sky_note: 'این فقط پیش‌بینی وضعیت جوی است؛ حکم رؤیت هلال را تغییر نمی‌دهد و جایگزین رؤیت واقعی نیست.',
      auto_more_text: 'برای اینکه اذان بدون نیاز به کلیک پخش شود، سایت را روی دستگاه نصب کنید (Add to Home Screen یا Install) یا در تنظیمات مرورگر، برای این سایت صدا را روی «اجازه» بگذارید.',
      playing: 'در حال پخش {name}', time_for: 'وقت {name} است. برای پخش، دکمهٔ پخش را بزنید.',
      adhan_fajr: 'اذان صبح', adhan_dhuhr: 'اذان ظهر', adhan_maghrib: 'اذان مغرب',
      save_sub: 'مکان روی نقشه، صدای اذان، پخش خودکار، زبان و تم تیره/روشن در همین مرورگر ذخیره می‌شود.',
      clear_btn: 'حذف تنظیمات ذخیره‌شده', clear_q: 'مکان و تنظیمات ذخیره‌شدهٔ شما از همین مرورگر حذف می‌شود. حذف شود؟', clear_done: 'تنظیمات ذخیره‌شده حذف شد.',
      save_btn: 'ذخیره برای دفعهٔ بعد', save_title: 'ذخیره مکان و تنظیمات', save_q: 'تنظیمات فعلی شما (مکان روی نقشه، صدای اذان، پخش خودکار اذان و دعا، زبان و تم تیره/روشن) در همین مرورگر ذخیره می‌شود و دفعهٔ بعد خودکار بارگذاری خواهد شد. تنظیمات ذخیره‌شدهٔ قبلی شما جایگزین می‌شود. ذخیره شود؟',
      yes: 'بله', no: 'خیر', saved: 'مکان و تنظیمات شما ذخیره شد؛ دفعهٔ بعد خودکار بارگذاری می‌شود.',
      save_fail: 'ذخیره انجام نشد. حافظهٔ مرورگر در دسترس نیست.', no_change: 'تغییری ذخیره نشد.',
      donate_title: 'جهت مشارکت در هزینه های وب سایت اینجا را کلیک کنید', donate: 'کمک مالی',
      copyright: '© 2026 azangoo.com · All rights reserved',
      dua_off_auto: 'پخش خودکار اذان خاموش است', dua_off: 'پخش دعای روزانه خاموش است', dua_nolist: 'فایل دعاها خوانده نشد', dua_nomonth: 'این ماه قمری دعای روزانه ندارد', dua_passed: 'دعای امروز گذشته است',
      dua_timer: 'دعای روز ({day}) ساعت {start} قبل از {adhan} شروع می‌شود.', dua_loading: 'دعای روزانه: در حال آماده‌سازی…',
      dua_opt: 'پخش خودکار دعای روزانه قبل از اذان',
      terms_link: 'شرایط استفاده',
      widget_link: 'افزودن اوقات شرعی به سایت شما',
      city_list_btn: 'فهرست شهرها',
      cities_title: 'شهرهای پرکاربرد', city_aurora: 'آرورا، کانادا', city_tehran: 'تهران، ایران',
      gps_btn: 'موقعیت فعلی من', gps_denied: 'دسترسی به موقعیت داده نشده است. آن را در تنظیمات مرورگر (کنار نشانی سایت) فعال کنید و دوباره تلاش کنید.',
      theme_dark: 'تیره', theme_light: 'روشن', theme_title: 'حالت نمایش (تیره / روشن)',
      official_mark: '(اعلام رسمی)', predicted_mark: '(پیش‌بینی)',
      ram_suhur: 'تا پایان سحر (اذان صبح): {h} ساعت و {m} دقیقه و {s} ثانیه', ram_iftar: 'تا افطار (مغرب): {h} ساعت و {m} دقیقه و {s} ثانیه', ram_remind: 'یادآوری ۱۰ دقیقه قبل از سحر و افطار', ram_remind_suhur: '۱۰ دقیقه تا پایان سحر (اذان صبح) باقی است.', ram_remind_iftar: '۱۰ دقیقه تا افطار باقی است.', ram_iftar_now: 'وقت افطار است.', ram_no_notif: 'برای یادآوری روی اعلان مرورگر، اجازهٔ اعلان را بدهید.',
      loc_text: 'برای نشان دادن اوقات شرعی درست برای محل شما، اجازه می‌دهید موقعیت فعلی‌تان خوانده شود؟ موقعیت فقط در مرورگر شما استفاده می‌شود و به‌عنوان مکان پیش‌فرض‌تان در همین مرورگر ذخیره می‌شود؛ به سرور ما فرستاده نمی‌شود.', loc_yes: 'اجازه می‌دهم', loc_no: 'فعلاً نه', pick_place: 'مکان را روی نقشه دابل‌کلیک کنید یا شهر را جستجو کنید.',
      moon_more: 'اطلاعات بیشتر', moon_less: 'اطلاعات کمتر', moon_sight: 'رؤیت ماه {next}', moon_tab_now: 'رؤیت ماه هم‌اکنون', moon_sight_intro: 'این بخش دربارهٔ هلال نوی ماه {next} است که در غروبِ آخرین روز همین ماه قمری دیده می‌شود؛ ربطی به شکل ماه در این لحظه ندارد.', annual_btn: 'تقویم سالانه', ann_title: 'ماه‌های قمری سال', ann_hijri: 'ماه قمری', ann_greg: 'شروع (میلادی)', ann_shamsi: 'شروع (شمسی)', ann_len: 'طول ماه', ann_days: 'روز',
      months_all: 'همه ماه‌ها', cal_pick_greg: 'انتخاب سال و ماه میلادی:', cal_pick_shamsi: 'انتخاب سال و ماه شمسی:',
      dir_n: 'شمال', dir_s: 'جنوب', dir_e: 'شرق', dir_w: 'غرب',
      asr: 'اذان عصر', isha: 'اذان عشا', adhan_asr: 'اذان عصر', adhan_isha: 'اذان عشا', adhan_fajr_next: 'اذان صبح فردا',
      countdown: 'تا {name}: {h} ساعت و {m} دقیقه و {s} ثانیه باقی‌مانده',
      alert_title: 'نزدیک اذان', alert_until: 'تا {name}', alert_now: 'وقت اذان است',
      about_btn: 'درباره ما',
      about_title: 'دربارهٔ اذان گو',
      about_p1: 'سایت اذان گو را در سال ۲۰۱۱ میلادی راه‌اندازی کردیم؛ آن روزها با نقشهٔ گوگل کار می‌کرد و تا مدت‌ها نیز خوب و بی‌هیچ مشکلی در خدمت شما بود. اما پس از مدتی گوگل دیگر خدمات نقشهٔ خود را در اختیار ما نگذاشت و ارائهٔ اوقات شرعی در اذان گو با مشکل روبه‌رو شد.',
      about_p2: 'امسال، در سال ۲۰۲۶، خداوند منّان بار دیگر بر ما منّت نهاد تا بتوانیم خدمتگزار شما نمازگزاران گرامی باشیم؛ این بار با طراحی تازه، امکانات امروزی، و صفحه‌ای که روی موبایل هم به‌راحتی دیده و استفاده می‌شود.',
      about_p3: 'هدف ما این است که صدای اذان را به خانه، محل کار و هر جای دیگری که هستید برسانیم؛ فرقی نمی‌کند در کدام نقطه از جهان زندگی می‌کنید. برای همین اوقات شرعی را برای مکانی که روی نقشه انتخاب می‌کنید محاسبه می‌کنیم و در کنار آن، جهت قبله، صدای اذان، دعاهای روزانه و ماه رمضان، رؤیت هلال ماه و تقویم را به چهار زبان فارسی، انگلیسی، اردو و عربی در اختیارتان می‌گذاریم.',
      about_calc: 'اوقات شرعی در اذان گو بر پایهٔ محاسبات علمی و با استفاده از طول و عرض جغرافیایی محل اقامت شما محاسبه می‌شود. در روش اذان گو زاویهٔ سپیده‌دم برای فجر با عرض جغرافیایی تغییر می‌کند (از ۱۸ درجه در عرض‌های پایین تا ۱۲ درجه در عرض‌های بالا) و یک زاویهٔ ثابت برای همهٔ نقاط به کار نمی‌رود؛ مغرب و عشاء بر پایهٔ زاویهٔ ۴ و ۱۵ درجه محاسبه می‌شوند. ما این روش را برای شهرهای با عرض‌های جغرافیایی متفاوت مناسب‌تر می‌دانیم.',
      about_moon: 'رؤیت هلال در اذان گو با محاسبهٔ نجومی و برای همان مکانی که انتخاب کرده‌اید برآورد می‌شود. برنامه در غروب روز بیست‌ونهم ماه قمری، موقعیت خورشید و ماه را حساب می‌کند و با معیار عودة (Odeh) بررسی می‌کند که هلال تازه در آن مکان قابل دیدن هست یا نه. این معیار بر پایهٔ ارتفاع ماه از افق و پهنای هلال هنگام غروب است و نتیجه‌اش یکی از چهار حالت است: با چشم غیرمسلح دیده می‌شود؛ با دوربین دیده می‌شود و شاید با چشم هم ممکن باشد؛ فقط با دوربین دیده می‌شود؛ یا با هیچ وسیله‌ای دیده نمی‌شود. اگر هلال با چشم غیرمسلح دیده شود، یا با دوربین دیده شود و احتمال دیدنش با چشم هم باشد (دو حالت اول)، ماه جاری همان روز ۲۹ تمام می‌شود و ۲۹ روز است. اگر فقط با دوربین دیده شود یا با هیچ وسیله‌ای دیده نشود (دو حالت آخر)، ماه ۳۰ روز کامل می‌شود. آغاز ماه بعد هم بر همین پایه نشان داده می‌شود. برنامه بهترین زمان دیدن هلال (حدود چهار نهمِ فاصلهٔ غروب خورشید تا غروب ماه) و همچنین ارتفاع و جهت هلال در آن لحظه را هم می‌گوید.',
      about_moon_note: 'این نتیجه یک برآورد علمی است، نه اعلام رسمی، و ممکن است با اعلام مرجع تقلید یا مرجع رسمی شهر شما تفاوت داشته باشد؛ هر مرجع معیار و روش خودش را دارد و ممکن است رؤیت با چشم را شرط بداند. «دید افق» در کارت ماه فقط وضع هوا را نشان می‌دهد و حکم رؤیت را تغییر نمی‌دهد. برای احکام شرعی مثل آغاز ماه رمضان و عید، به مرجع تقلید خود یا مرجع رسمی محل مراجعه کنید.',
      about_p4: 'اذان گو به هیچ سازمان، نهاد، مؤسسه یا گروهی، دولتی یا غیردولتی، در هیچ نقطه‌ای از جهان وابسته نیست.',
      about_p5: 'امیدواریم توانسته باشیم خدمتی، هرچند کوچک، به نمازگزاران کرده باشیم. بی‌گمان بدون لطف و مرحمت خداوند متعال و توجه حضرت ولی‌عصر (عج)، انجام این کار برای ما میسر نبود. در پایان، از شما نمازگزاران عزیز التماس دعا داریم؛ ما را در هنگام اذان و نماز از دعای خیرتان محروم نفرمایید، و دعا برای تعجیل در فرج مولایمان امام زمان (عج) را هرگز فراموش نکنید.',
      about_p6: 'نظرها و پیشنهادهای شما را از راه «تماس با ما» با آغوش باز می‌شنویم.',
      about_hadith: '«فضیلت اوّل وقت نماز بر آخر وقت، همچون فضیلت آخرت بر دنیاست.»',
      about_hadith_src: 'امام صادق (علیه‌السلام) — ثواب الأعمال، باب فضل الوقت الأول على الآخر',
      contact_btn: 'تماس با ما', contact_text: 'شما می‌توانید با ایمیل زیر جهت هرگونه سوال، پیشنهاد و یا انتقاد با ما در تماس باشید:', copy_btn: 'کپی ایمیل', copied: 'کپی شد', close_btn: 'بستن',
      clock_zone: 'ساعت محلی', lang_toggle: 'English',
      qibla_tag: 'قبله', logo_alt: 'اذان گو', page_title: 'اذان گو - اوقات شرعی، رؤیت هلال و تقویم اوقات شرعی',
      page_desc: 'اوقات شرعی به وقت محلی هر شهر، تقویم قمری و شمسی، رؤیت ماه و پخش اذان',
      pdf_title: 'اوقات شرعی', pdf_note: 'محاسبات ماه قمری بر اساس پیش‌بینی سایت اذان گو می‌باشد و ممکن است با دفاتر مراجع تقلید متفاوت باشد؛ جهت اطلاعات بیشتر با دفتر مرجع تقلید خود تماس بگیرید.', pdf_day: 'روز', pdf_greg: 'میلادی', pdf_shamsi: 'شمسی', pdf_hijri: 'قمری',
      pdf_fajr: 'فجر', pdf_sunrise: 'طلوع', pdf_dhuhr: 'ظهر', pdf_asr: 'عصر', pdf_sunset: 'غروب',
      pdf_maghrib: 'مغرب', pdf_isha: 'عشا', pdf_midnight: 'نیمه‌شب',
 dates_label: 'تاریخ و ساعت', tiles_label: 'تاریخ و ساعت'
    },
    en: {
      dua_timer_sahar: 'Ramadan Sahar dua starts at {start}, before the {adhan}.',
      dua_timer_iftar: 'Ramadan Iftar dua starts at {start}, before the {adhan}.',
      adhan_now: 'Adhan is playing…', adhan_muted: 'The adhan started silently because the browser blocks sound; tap the page once to hear it.',
      times_title: 'Prayer times today', imsak: 'Imsak', fajr: 'Fajr adhan', sunrise: 'Sunrise',
      dhuhr: 'Dhuhr adhan', sunset: 'Sunset', maghrib: 'Maghrib adhan', midnight: 'Midnight',
      fajr_next: 'Tomorrow’s Fajr',
      cal_title: 'Prayer calendar', cal_greg: 'Gregorian', cal_shamsi: 'Solar Hijri',
      cal_pick: 'Choose year and month:', cal_year: '- Year -', cal_month: '- Month -', cal_ok: 'Confirm', cal_prev_m: 'Previous month', cal_next_m: 'Next month', cal_prev_y: 'Previous year', cal_next_y: 'Next year',
      cal_pick_ym: 'Please choose a year and a month.', cal_need_place: 'First choose a place on the map.',
      cal_no_pdf: 'PDF creation is not available.', cal_busy: 'Creating PDF…', cal_done: 'PDF created.',
      cal_fail: 'Could not create the PDF.',
      search_ph: 'Search city or address…', search_btn: 'Search', searching: 'Searching…',
      not_found: 'No place found. Try a more specific city or address.',
      search_failed: 'Search failed. Check your internet connection.',
      lat: 'Latitude', lng: 'Longitude', city: 'City', calc_btn: 'Calculate times',
      map_hint: 'Double-click the map or drag the marker to change the place.',
      map_label: 'Map', calc_fail: 'Could not calculate the times for this place.',
      zone_fallback: 'Time zone of this place was not found; your device time zone is used.',
      bad_coords: 'Invalid latitude or longitude.',
      locating: 'Finding your location…',
      geo_denied: 'Your location is not available. The default place is shown.',
      moon_title: 'Moon sighting', moon_now: 'Illumination now', moon_rise: 'Moonrise',
      moon_set: 'Moonset', moon_sunset: 'Illumination at sunset',
      moon_visible: 'In this place the Hijri month {cur} has {len} days. At sunset on its last day the new crescent of {next} is {illum} illuminated and visible for {dur} minutes (sunset to moonset).',
      moon_hidden: 'In this place the Hijri month {cur} has {len} days. At sunset on its last day the new crescent of {next} ({illum} illuminated) is not visible.',
      moon_start: 'The first day of {next} in this place is {weekday}, {gd} {gm} {gy}, which is {sd} {sm} {sy} (Solar Hijri).',
      moon_follow_official: 'The start or end of {cur} was aligned with the neighbouring official month; this month is {len} days.',
      moon_odeh: 'Crescent visibility is estimated with the Odeh V-criterion; it is an estimate, not an official announcement.',
      privacy_link: 'Privacy',
      moon_official_same: 'The length of {cur} ({len} days) follows the official announcement.',
      moon_official_len: 'The length of {cur} was set to {len} days by the official announcement; the site’s astronomical prediction was {plen} days.',
      moon_official_shift: 'The start of {cur} was set by the official announcement and differs from the site’s astronomical prediction by {n} day(s).',
      moon_why_short: 'The crescent cannot be seen at sunset on day {d}, so {cur} has {len} days.',
      moon_why_30: 'At sunset on day {d} of {cur} the Moon is {illum} illuminated and sets only {dur} minutes after the Sun; the crescent cannot be seen, so {cur} has {len} days.',
      moon_why_30_early: 'At sunset on day {d} of {cur} the Moon is {illum} illuminated and sets before the Sun; the crescent cannot be seen, so {cur} has {len} days.',
      moon_why_29: 'At sunset on day {d} of {cur} the Moon is {illum} illuminated and sets {dur} minutes after the Sun; the crescent is visible, so {cur} has {len} days.',
      moon_try: 'If you want to try anyway, the best time is sunset on {weekday}, {gd} {gm}, at {time} (about {mins} minutes after sunset), about {alt}° above the horizon, {dir}. {how}',
      moon_try_none: 'At this sunset the crescent cannot be seen by any means.',
      moon_best: 'Best time to see the new crescent of {next} in this place: sunset on {weekday}, {gd} {gm}, at {time} (about {mins} minutes after sunset), about {alt}° above the horizon, {dir}. {how}',
      moon_best_naked: 'Visible to the naked eye.',
      moon_best_aid: 'Visible with an optical aid, and possibly to the naked eye.',
      moon_best_optical: 'Visible only with an optical aid.',
      moon_best_none: 'At sunset on {weekday}, {gd} {gm}, the new crescent of {next} is not visible in this place.',
      moon_best_tip: 'You need a clear, unobstructed horizon in that direction.',
      moon_alt: 'Moon, {p}% illuminated',
      dir: '{deg}° {side} of {card}',
      qibla: 'Qibla: {deg}° from north, clockwise', qibla_label: 'Qibla direction',
      adhan_title: 'Adhan sound', r_moazen: 'Moazenzadeh Ardebili', r_abather: 'Abather Alhalwachi', r_sobhdel: 'Hossein Sobhdel', r_najafi: 'Farid Najafi', r_aghati: 'Mohammad Aghati', auto_label: 'Automatic adhan and dua playback',
      auto_hint: 'For automatic playback, keep this page open and click it once.',
      hint_more: 'More', hint_less: 'Less',
      sound_bar: 'For the adhan and dua to play automatically, click the page once',
      sky_sunset: 'Cloud at sunset: {c} — {v}',
      sky_now_l: 'Clouds and weather right now', wx_clear: 'Clear', wx_partly: 'Partly cloudy', wx_cloudy: 'Cloudy', wx_fog: 'Foggy', wx_rain: 'Cloudy and rainy', wx_snow: 'Cloudy and snowy', wx_storm: 'Cloudy with thunderstorms',
      sky_vis_l: 'Horizon visibility at sunset', sky_night_l: 'Cloud tonight (until midnight)', sky_night_l_late: 'Cloud now until sunrise', sky_km: 'km', sky_vis_help_label: 'About horizon visibility', sky_vis_help: 'Horizon visibility is how far you can see clearly through the air at that moment, in kilometres. The bigger the number, the clearer the air; the smaller, the more fog, dust or smoke. It is the weather forecast for this place at sunset and has nothing to do with how much of the Moon is lit. It matters most when you look for the new crescent, which is thin and sits low near the horizon, at sunset on the last day of the Hijri month; on other evenings it is only a note about how clear the air is. 15 km or more: good; 6 to 14 km: medium; under 6 km: poor. This is only a weather forecast; it does not change the crescent ruling.', hadith_title: 'Hadith of the Day', hadith_close: 'Close',
      sky_s_good: 'good conditions to look for the crescent', sky_s_mid: 'the crescent may be visible, but it is not certain', sky_s_bad: 'the crescent will be hard to see',
      sky_v_good: 'good', sky_v_mid: 'moderate', sky_v_bad: 'poor (haze or dust)',
      sky_n_good: 'the moon and stars should be clearly visible', sky_n_mid: 'partly cloudy sky', sky_n_bad: 'cloudy sky',
      sky_note: 'This is only a weather forecast. It does not change the crescent ruling and does not replace actually sighting the moon.',
      auto_more_text: 'For the adhan to play without needing a click, install the site on your device (Add to Home Screen or Install), or in your browser settings set sound to “Allow” for this site.',
      playing: 'Playing {name}', time_for: 'It is time for {name}. Press play.',
      adhan_fajr: 'Fajr adhan', adhan_dhuhr: 'Dhuhr adhan', adhan_maghrib: 'Maghrib adhan',
      save_sub: 'Map location, adhan voice, automatic playback, language and dark/light theme are saved in this browser.',
      clear_btn: 'Delete saved settings', clear_q: 'Your saved place and settings will be removed from this browser. Delete them?', clear_done: 'Saved settings were deleted.',
      save_btn: 'Save for next time', save_title: 'Save place and settings', save_q: 'Your current settings (map location, adhan voice, automatic adhan and dua playback, language, and dark/light theme) will be saved in this browser and loaded automatically next time. Your previously saved settings will be replaced. Save them?',
      yes: 'Yes', no: 'No', saved: 'Your place and settings were saved; they will load automatically next time.',
      save_fail: 'Could not save. Browser storage is not available.', no_change: 'Nothing was saved.',
      donate_title: 'Click here to support the costs of this website', donate: 'Donation',
      copyright: '© 2026 azangoo.com · All rights reserved',
      dua_off_auto: 'Automatic adhan playback is off', dua_off: 'Daily dua playback is off', dua_nolist: 'The dua list could not be read', dua_nomonth: 'This Hijri month has no daily dua', dua_passed: 'Today’s dua has passed',
      dua_timer: 'Dua of the day ({day}) starts at {start}, before the {adhan}.', dua_loading: 'Daily dua: loading…',
      dua_opt: 'Automatic daily dua before the adhan',
      terms_link: 'Terms and conditions',
      widget_link: 'Add prayer times to your website',
      city_list_btn: 'Browse cities',
      cities_title: 'Popular cities', city_aurora: 'Aurora, Canada', city_tehran: 'Tehran, Iran',
      gps_btn: 'Use my current location', gps_denied: 'Location access is blocked. Allow it in your browser settings (next to the site address) and try again.',
      theme_dark: 'Dark', theme_light: 'Light', theme_title: 'Theme (dark / light)',
      official_mark: '(official)', predicted_mark: '(predicted)',
      ram_suhur: 'Until end of suhur (Fajr): {h} h {m} min {s} s', ram_iftar: 'Until iftar (maghrib): {h} h {m} min {s} s', ram_remind: 'Remind me 10 minutes before suhur and iftar', ram_remind_suhur: '10 minutes left until the end of suhur (Fajr).', ram_remind_iftar: '10 minutes left until iftar.', ram_iftar_now: 'It is time for iftar.', ram_no_notif: 'Allow browser notifications to get reminders.',
      loc_text: 'To show the prayer times for your place, may we read your current location? It is used only in your browser and saved there as your default place; it is not sent to our server.', loc_yes: 'Allow', loc_no: 'Not now', pick_place: 'Double-click the map or search for a city to choose a place.',
      moon_more: 'More info', moon_less: 'Less info', moon_sight: '{next} moon sighting', moon_tab_now: 'Moon right now', moon_sight_intro: 'This tab is about the new crescent of {next}, which is looked for at sunset on the last day of the current Hijri month. It is not about how the Moon looks right now.', annual_btn: 'Annual calendar', ann_title: 'Hijri months of the year', ann_hijri: 'Hijri month', ann_greg: 'Start (Gregorian)', ann_shamsi: 'Start (Solar Hijri)', ann_len: 'Length', ann_days: 'days',
      months_all: 'All months', cal_pick_greg: 'Choose year and month (Gregorian):', cal_pick_shamsi: 'Choose year and month (Solar Hijri):',
      dir_n: 'N', dir_s: 'S', dir_e: 'E', dir_w: 'W',
      asr: 'Asr adhan', isha: 'Isha adhan', adhan_asr: 'Asr adhan', adhan_isha: 'Isha adhan', adhan_fajr_next: 'Tomorrow’s Fajr',
      countdown: 'Time until {name}: {h} h {m} min {s} s',
      alert_title: 'Adhan is near', alert_until: 'Until {name}', alert_now: 'It is time for the adhan',
      about_btn: 'About us',
      about_title: 'About Azangoo',
      about_p1: 'We launched Azangoo in 2011, back when it ran on Google Maps, and for a long time it worked well and without any trouble. After a while, however, Google stopped providing us with its map service, and offering prayer times on Azangoo became difficult.',
      about_p2: 'This year, in 2026, by God’s grace we were given the chance once again to serve you, dear worshippers, this time with a fresh design, modern features, and a page that works comfortably on your phone.',
      about_p3: 'Our aim is to bring the sound of the adhan to your home, your workplace and wherever else you may be, no matter where in the world you live. That is why we calculate the prayer times for the place you choose on the map, and alongside them we offer the qibla direction, the sound of the adhan, the daily and Ramadan supplications, the crescent moon sighting and a calendar, in Persian, English, Urdu and Arabic.',
      about_calc: 'Prayer times in Azangoo are calculated from scientific calculations, using the latitude and longitude of your place of residence. In the Azangoo method the twilight angle used for Fajr changes with your latitude (from 18 degrees at low latitudes to 12 degrees at high latitudes), so one fixed angle is not applied to every place; Maghrib and Isha are calculated at 4 and 15 degrees. We consider this method better suited to cities at very different latitudes.',
      about_moon: 'Crescent sighting in Azangoo is estimated by astronomical calculation, for the place you have selected. On the evening of the 29th day of the lunar month, Azangoo calculates the positions of the sun and the moon and uses the Odeh criterion to check whether the new crescent can be seen at that place. The criterion is based on the height of the moon above the horizon and the width of the crescent at sunset, and the result is one of four cases: visible to the naked eye; visible with binoculars or a telescope and perhaps also to the naked eye; visible only with optical aid; or not visible by any means. If the crescent is visible to the naked eye, or visible with optical aid and possibly also to the naked eye (the first two cases), the current month ends on that 29th day and has 29 days. If it is visible only with optical aid or not visible at all (the last two cases), the month completes 30 days. The start of the next month is shown on the same basis. Azangoo also tells you the best time to look for the crescent (about four ninths of the way from sunset to moonset), and the height and direction of the crescent at that moment.',
      about_moon_note: 'This result is a scientific estimate, not an official announcement, and it may differ from the announcement of your religious authority or the official authority of your city; each authority has its own criterion and method, and may require sighting with the naked eye. The horizon visibility on the moon card only shows the weather and does not change the crescent ruling. For religious rulings, such as the start of Ramadan and Eid, refer to your own religious authority or the official authority of your place.',
      about_p4: 'Azangoo is not affiliated with any organization, institution, party or group, governmental or non-governmental, anywhere in the world.',
      about_p5: 'We hope we have been able to render some service, however small, to those who pray. Without the grace and mercy of God Almighty and the care of the Master of the Age, Imam al-Mahdi (may God hasten his relief), this work would not have been possible for us. Finally, we humbly ask for your prayers: please do not deprive us of them at the time of adhan and prayer, and never forget to pray for the hastening of the relief of our master, the Imam of the Age.',
      about_p6: 'Your comments and suggestions are always welcome through “Contact us”.',
      about_hadith: '“The merit of the first part of the prayer time over the last is like the merit of the Hereafter over this world.”',
      about_hadith_src: 'Imam al-Sadiq (peace be upon him) — Thawab al-A‘mal, chapter on the merit of the first time over the last',
      contact_btn: 'Contact us', contact_text: 'For any question, suggestion or feedback you can contact us by email:', copy_btn: 'Copy email', copied: 'Copied', close_btn: 'Close',
      clock_zone: 'Local time', lang_toggle: 'اردو',
      qibla_tag: 'Qibla', logo_alt: 'Azangoo', page_title: 'Azangoo - Prayer Times, Moon Sighting, Prayer Times Calendar',
      page_desc: 'Prayer times for any city by its local time, Hijri and solar calendars, new crescent sighting and adhan playback.',
      pdf_title: 'Prayer times', pdf_note: 'Hijri lunar month calculations are based on the Azangoo site’s own prediction and may differ from the offices of the maraji‘ (sources of emulation); for more information, please contact your marja‘’s office.', pdf_day: 'Day', pdf_greg: 'Gregorian', pdf_shamsi: 'Solar Hijri', pdf_hijri: 'Hijri',
      pdf_fajr: 'Fajr', pdf_sunrise: 'Sunrise', pdf_dhuhr: 'Dhuhr', pdf_asr: 'Asr', pdf_sunset: 'Sunset',
      pdf_maghrib: 'Maghrib', pdf_isha: 'Isha', pdf_midnight: 'Midnight',
 dates_label: 'Date and time', tiles_label: 'Date and time'
    },
    ur: {
      dua_timer_sahar: 'رمضان کی سحری کی دعا {start} پر {adhan} سے پہلے شروع ہوگی۔',
      dua_timer_iftar: 'رمضان کی افطار کی دعا {start} پر {adhan} سے پہلے شروع ہوگی۔',
      adhan_now: 'اذان چل رہی ہے…', adhan_muted: 'براؤزر آواز روک رہا ہے، اس لیے اذان بغیر آواز شروع ہوئی؛ آواز سننے کے لیے صفحے پر ایک بار ٹیپ کریں۔',
      times_title: 'آج کے اوقات نماز', imsak: 'امساک', fajr: 'فجر کی اذان', sunrise: 'طلوع آفتاب',
      dhuhr: 'ظہر کی اذان', sunset: 'غروب آفتاب', maghrib: 'مغرب کی اذان', midnight: 'نصف شب',
      fajr_next: 'کل کی فجر کی اذان',
      cal_title: 'اوقات نماز کا کیلنڈر', cal_greg: 'عیسوی', cal_shamsi: 'شمسی',
      cal_pick: 'سال اور مہینہ منتخب کریں:', cal_year: '- سال -', cal_month: '- مہینہ -', cal_ok: 'تصدیق', cal_prev_m: 'پچھلا مہینہ', cal_next_m: 'اگلا مہینہ', cal_prev_y: 'پچھلا سال', cal_next_y: 'اگلا سال',
      cal_pick_ym: 'براہ کرم سال اور مہینہ منتخب کریں۔', cal_need_place: 'پہلے نقشے پر جگہ منتخب کریں۔',
      cal_no_pdf: 'PDF بنانے کی سہولت دستیاب نہیں ہے۔', cal_busy: 'PDF بنایا جا رہا ہے…', cal_done: 'PDF بن گئی۔',
      cal_fail: 'PDF نہیں بن سکی۔',
      search_ph: 'شہر یا پتہ تلاش کریں…', search_btn: 'تلاش', searching: 'تلاش ہو رہی ہے…',
      not_found: 'کوئی جگہ نہیں ملی۔ شہر کا نام یا پتہ زیادہ واضح لکھیں۔',
      search_failed: 'تلاش ناکام رہی۔ انٹرنیٹ کنکشن چیک کریں۔',
      lat: 'عرض بلد', lng: 'طول بلد', city: 'شہر', calc_btn: 'اوقات معلوم کریں',
      map_hint: 'جگہ بدلنے کے لیے نقشے پر ڈبل کلک کریں یا نشان کو کھینچیں۔',
      map_label: 'نقشہ', calc_fail: 'اس جگہ کے اوقات نہیں نکالے جا سکے۔',
      zone_fallback: 'اس جگہ کا ٹائم زون نہیں ملا؛ آپ کے آلے کا وقت استعمال ہوا۔',
      bad_coords: 'عرض بلد یا طول بلد درست نہیں ہے۔', locating: 'آپ کا مقام تلاش ہو رہا ہے…',
      geo_denied: 'موجودہ مقام دستیاب نہیں۔ پہلے سے طے شدہ جگہ دکھائی جا رہی ہے۔',
      moon_title: 'چاند کا مشاہدہ', moon_now: 'ابھی روشنی کا فیصد', moon_rise: 'چاند کا طلوع',
      moon_set: 'چاند کا غروب', moon_sunset: 'غروب کے وقت روشنی کا فیصد',
      moon_visible: 'اس جگہ ہجری مہینہ {cur} {len} دن کا ہے۔ اس کے آخری دن غروب آفتاب پر {next} کا نیا ہلال {illum} روشن ہے اور {dur} منٹ (غروب آفتاب سے چاند کے غروب تک) نظر آتا ہے۔',
      moon_hidden: 'اس جگہ ہجری مہینہ {cur} {len} دن کا ہے۔ اس کے آخری دن غروب آفتاب پر {next} کا نیا ہلال ({illum} روشن) نظر نہیں آتا۔',
      moon_start: '{next} کا پہلا دن اس جگہ {weekday}، {gd} {gm} {gy} ہے، جو شمسی تاریخ {sd} {sm} {sy} ہے۔',
      moon_follow_official: '{cur} کا آغاز یا اختتام ساتھ والے سرکاری مہینے کے اعلان سے ہم آہنگ کیا گیا ہے؛ اس مہینے کے {len} دن ہیں۔',
      moon_odeh: 'ہلال کی رؤیت کا اندازہ معیارِ عودہ (Odeh V-criterion) سے لگایا جاتا ہے؛ یہ اندازہ ہے، سرکاری اعلان نہیں۔',
      privacy_link: 'رازداری',
      moon_official_same: '{cur} کی لمبائی ({len} دن) سرکاری اعلان کے مطابق ہے۔',
      moon_official_len: '{cur} کی لمبائی سرکاری اعلان کے مطابق {len} دن مقرر ہوئی، جبکہ سائٹ کے فلکیاتی حساب میں یہ {plen} دن تھی۔',
      moon_official_shift: '{cur} کا آغاز سرکاری اعلان کے مطابق مقرر ہوا اور سائٹ کے فلکیاتی حساب سے {n} دن مختلف ہے۔',
      moon_why_short: 'دن {d} کے غروب آفتاب پر ہلال نظر نہیں آتا، اس لیے {cur} کے {len} دن ہیں۔',
      moon_why_30: '{cur} کے دن {d} کے غروب پر چاند {illum} روشن ہے اور سورج کے صرف {dur} منٹ بعد غروب ہوتا ہے؛ ہلال نظر نہیں آتا، اس لیے {cur} کے {len} دن ہیں۔',
      moon_why_30_early: '{cur} کے دن {d} کے غروب پر چاند {illum} روشن ہے اور سورج سے پہلے غروب ہو جاتا ہے؛ ہلال نظر نہیں آتا، اس لیے {cur} کے {len} دن ہیں۔',
      moon_why_29: '{cur} کے دن {d} کے غروب پر چاند {illum} روشن ہے اور سورج کے {dur} منٹ بعد غروب ہوتا ہے؛ ہلال نظر آتا ہے، اس لیے {cur} کے {len} دن ہیں۔',
      moon_try: 'اگر آپ پھر بھی کوشش کرنا چاہیں تو بہترین وقت {weekday} {gd} {gm} کا غروب ہے، {time} بجے (غروب آفتاب کے تقریباً {mins} منٹ بعد)، افق سے تقریباً {alt} درجہ اوپر، {dir}۔ {how}',
      moon_try_none: 'اس غروب پر ہلال کسی بھی ذریعے سے نظر نہیں آتا۔',
      moon_best: '{next} کا ہلال دیکھنے کا بہترین وقت اس جگہ: {weekday} {gd} {gm} کی شام، وقت {time} (غروب آفتاب سے تقریباً {mins} منٹ بعد)، افق سے تقریباً {alt} درجہ اوپر، {dir}۔ {how}',
      moon_best_naked: 'ننگی آنکھ سے نظر آتا ہے۔',
      moon_best_aid: 'دوربین سے نظر آتا ہے اور ممکن ہے ننگی آنکھ سے بھی نظر آ جائے۔',
      moon_best_optical: 'صرف دوربین سے نظر آتا ہے۔',
      moon_best_none: '{weekday} {gd} {gm} کے غروب آفتاب پر {next} کا ہلال اس جگہ نظر نہیں آتا۔',
      moon_best_tip: 'ہلال دیکھنے کے لیے اس سمت میں افق کھلا اور رکاوٹ سے پاک ہونا چاہیے۔',
      moon_alt: 'چاند، {p} فیصد روشن',
      dir: 'جہت {card}، {deg} درجہ {side} کی طرف',
      qibla: 'قبلہ: شمال سے {deg}° گھڑی کی سمت', qibla_label: 'قبلہ کی سمت',
      adhan_title: 'اذان کی آواز', r_moazen: 'موذن زادہ اردبیلی', r_abather: 'اباذر الحلواجی', r_sobhdel: 'حسین صبحدل', r_najafi: 'فرید نجفی', r_aghati: 'محمد آقاتی', auto_label: 'خودکار اذان اور دعا چلائیں',
      auto_hint: 'خودکار پلے کے لیے یہ صفحہ کھلا رہنا چاہیے اور ایک بار اس پر کلک ہونا چاہیے۔',
      hint_more: 'مزید', hint_less: 'کم',
      sound_bar: 'اذان اور دعا خودکار طور پر چلنے کے لیے صفحے پر ایک بار کلک کریں',
      sky_sunset: 'غروب کے وقت بادل: {c} — {v}',
      sky_now_l: 'اس وقت بادل اور موسم', wx_clear: 'صاف', wx_partly: 'جزوی ابر آلود', wx_cloudy: 'ابر آلود', wx_fog: 'دھند', wx_rain: 'ابر آلود اور بارش', wx_snow: 'ابر آلود اور برف باری', wx_storm: 'ابر آلود، گرج چمک کے ساتھ',
      sky_vis_l: 'غروب کے وقت افق پر نظر آنے کی حد', sky_night_l: 'آج رات (آدھی رات تک) بادل', sky_night_l_late: 'ابھی سے طلوعِ آفتاب تک بادل', sky_km: 'کلومیٹر', sky_vis_help_label: 'افق کی نظر آنے کی حد کی وضاحت', sky_vis_help: 'افق کی نظر آنے کی حد سے مراد ہے کہ اس وقت ہوا میں کتنے کلومیٹر دور تک صاف نظر آتا ہے؛ عدد جتنا بڑا ہو ہوا اتنی صاف ہے اور دھند، گرد یا دھواں کم ہے۔ یہ عدد اس جگہ کے غروبِ آفتاب کے وقت کی موسمی پیش گوئی ہے اور چاند کی روشنی کی فیصد سے اس کا کوئی تعلق نہیں۔ اس کی سب سے زیادہ اہمیت ہجری مہینے کے آخری دن غروب کے وقت نئے ہلال کو دیکھنے میں ہے، جو باریک ہوتا ہے اور افق کے قریب نظر آتا ہے؛ مہینے کی دوسری راتوں میں یہ صرف ہوا کی صفائی کی اطلاع ہے۔ ۱۵ کلومیٹر یا زیادہ: اچھی؛ ۶ سے ۱۴ کلومیٹر: درمیانی؛ ۶ کلومیٹر سے کم: کمزور۔ یہ صرف موسم کی پیش گوئی ہے اور ہلال کے فیصلے کو نہیں بدلتی۔', hadith_title: 'آج کی حدیث', hadith_close: 'بند کریں',
      sky_s_good: 'ہلال دیکھنے کے لیے حالات موزوں ہیں', sky_s_mid: 'ہلال نظر آ سکتا ہے مگر یقینی نہیں', sky_s_bad: 'ہلال دیکھنا دشوار ہوگا',
      sky_v_good: 'اچھی', sky_v_mid: 'درمیانی', sky_v_bad: 'کمزور (دھند یا گرد و غبار)',
      sky_n_good: 'چاند اور ستارے صاف نظر آنے چاہئیں', sky_n_mid: 'آسمان جزوی طور پر ابر آلود ہے', sky_n_bad: 'آسمان ابر آلود ہے',
      sky_note: 'یہ صرف موسم کی پیش گوئی ہے؛ یہ ہلال کے حکم کو نہیں بدلتی اور اصل رؤیت کا متبادل نہیں۔',
      auto_more_text: 'اذان بغیر کلک کیے خود بخود چلنے کے لیے سائٹ کو اپنے آلے پر انسٹال کریں (Add to Home Screen یا Install) یا براؤزر کی سیٹنگز میں اس سائٹ کے لیے آواز کو «اجازت دیں» پر رکھیں۔',
      playing: '{name} چل رہی ہے', time_for: '{name} کا وقت ہو گیا ہے۔ چلانے کے لیے پلے دبائیں۔',
      adhan_fajr: 'فجر کی اذان', adhan_dhuhr: 'ظہر کی اذان', adhan_maghrib: 'مغرب کی اذان',
      save_sub: 'نقشے پر مقام، اذان کی آواز، خودکار پلے، زبان اور گہرا/روشن تھیم اسی براؤزر میں محفوظ ہوتے ہیں۔',
      clear_btn: 'محفوظ شدہ ترتیبات حذف کریں', clear_q: 'آپ کا محفوظ مقام اور ترتیبات اس براؤزر سے حذف ہو جائیں گی۔ کیا حذف کریں؟', clear_done: 'محفوظ شدہ ترتیبات حذف ہو گئیں۔',
      save_btn: 'اگلی بار کے لیے محفوظ کریں', save_title: 'مقام اور ترتیبات محفوظ کریں', save_q: 'آپ کی موجودہ ترتیبات (نقشے پر مقام، اذان کی آواز، خودکار اذان اور دعا، زبان اور گہرا/روشن تھیم) اسی براؤزر میں محفوظ ہوں گی اور اگلی بار خودبخود لوڈ ہوں گی۔ پہلے سے محفوظ ترتیبات بدل جائیں گی۔ کیا محفوظ کریں؟',
      yes: 'ہاں', no: 'نہیں', saved: 'آپ کا مقام اور ترتیبات محفوظ ہو گئیں؛ اگلی بار خودبخود لوڈ ہوں گی۔',
      save_fail: 'محفوظ نہیں ہو سکا۔ براؤزر اسٹوریج دستیاب نہیں۔', no_change: 'کچھ محفوظ نہیں کیا گیا۔',
      donate_title: 'اس ویب سائٹ کے اخراجات میں مدد کے لیے یہاں کلک کریں', donate: 'عطیہ',
      copyright: '© 2026 azangoo.com · All rights reserved',
      dua_off_auto: 'خودکار اذان بند ہے', dua_off: 'روزانہ دعا بند ہے', dua_nolist: 'دعاؤں کی فہرست نہیں پڑھی جا سکی', dua_nomonth: 'اس ہجری مہینے میں روزانہ دعا نہیں ہے', dua_passed: 'آج کی دعا گزر چکی ہے',
      dua_timer: 'دن کی دعا ({day}) {start} پر {adhan} سے پہلے شروع ہوگی۔', dua_loading: 'روزانہ دعا: لوڈ ہو رہی ہے…',
      dua_opt: 'اذان سے پہلے روزانہ دعا خودکار چلائیں',
      terms_link: 'شرائط استعمال',
      widget_link: 'اپنی ویب سائٹ پر اوقاتِ نماز لگائیں',
      city_list_btn: 'شہروں کی فہرست',
      cities_title: 'مقبول شہر', city_aurora: 'اورورا، کینیڈا', city_tehran: 'تہران، ایران',
      gps_btn: 'میرا موجودہ مقام', gps_denied: 'مقام تک رسائی بند ہے۔ براؤزر کی ترتیبات میں اجازت دیں (ویب سائٹ کے پتے کے ساتھ) اور دوبارہ کوشش کریں۔',
      theme_dark: 'گہرا', theme_light: 'روشن', theme_title: 'تھیم (گہرا / روشن)',
      official_mark: '(سرکاری اعلان)', predicted_mark: '(پیش گوئی)',
      ram_suhur: 'سحری کے اختتام (فجر) تک: {h} گھنٹے {m} منٹ {s} سیکنڈ', ram_iftar: 'افطار تک: {h} گھنٹے {m} منٹ {s} سیکنڈ', ram_remind: 'سحری اور افطار سے ۱۰ منٹ پہلے یاد دلائیں', ram_remind_suhur: 'سحری کے اختتام میں ۱۰ منٹ باقی ہیں۔', ram_remind_iftar: 'افطار میں ۱۰ منٹ باقی ہیں۔', ram_iftar_now: 'افطار کا وقت ہو گیا ہے۔', ram_no_notif: 'یاد دہانی کے لیے براؤزر کی اطلاعات کی اجازت دیں۔',
      loc_text: 'آپ کی جگہ کے مطابق اوقات نماز دکھانے کے لیے کیا ہم آپ کا موجودہ مقام پڑھ سکتے ہیں؟ یہ صرف آپ کے براؤزر میں استعمال ہوتا ہے اور وہیں آپ کے ڈیفالٹ مقام کے طور پر محفوظ ہو جاتا ہے؛ ہمارے سرور کو نہیں بھیجا جاتا۔', loc_yes: 'اجازت دیں', loc_no: 'ابھی نہیں', pick_place: 'نقشے پر ڈبل کلک کریں یا شہر تلاش کریں۔',
      moon_more: 'مزید معلومات', moon_less: 'کم معلومات', moon_sight: 'ماہِ {next} کی رؤیت', moon_tab_now: 'ابھی کا چاند', moon_sight_intro: 'یہ حصہ {next} کے نئے ہلال کے بارے میں ہے جو موجودہ ہجری مہینے کے آخری دن غروب کے وقت دیکھا جاتا ہے؛ اس لمحے کے چاند کی شکل سے اس کا تعلق نہیں۔', annual_btn: 'سالانہ کیلنڈر', ann_title: 'اس سال کے ہجری مہینے', ann_hijri: 'ہجری مہینہ', ann_greg: 'آغاز (عیسوی)', ann_shamsi: 'آغاز (شمسی)', ann_len: 'مہینے کی لمبائی', ann_days: 'دن',
      months_all: 'تمام مہینے', cal_pick_greg: 'سال اور مہینہ منتخب کریں (عیسوی):', cal_pick_shamsi: 'سال اور مہینہ منتخب کریں (شمسی):',
      dir_n: 'شمال', dir_s: 'جنوب', dir_e: 'مشرق', dir_w: 'مغرب',
      asr: 'عصر کی اذان', isha: 'عشا کی اذان', adhan_asr: 'عصر کی اذان', adhan_isha: 'عشا کی اذان', adhan_fajr_next: 'کل کی فجر کی اذان',
      countdown: '{name} تک: {h} گھنٹے {m} منٹ {s} سیکنڈ باقی',
      alert_title: 'اذان قریب ہے', alert_until: '{name} تک', alert_now: 'اذان کا وقت ہو گیا',
      about_btn: 'ہمارے بارے میں',
      about_title: 'اذان گو کے بارے میں',
      about_p1: 'ہم نے اذان گو کا آغاز ۲۰۱۱ء میں کیا تھا؛ اُس وقت یہ گوگل میپ پر چلتا تھا اور کافی عرصے تک بغیر کسی مشکل کے بخوبی کام کرتا رہا۔ لیکن کچھ عرصے بعد گوگل نے ہمیں اپنی نقشہ سروس دینا بند کر دی اور اذان گو پر اوقاتِ نماز پیش کرنا مشکل ہو گیا۔',
      about_p2: 'اس سال، ۲۰۲۶ء میں، اللہ تعالیٰ نے اپنے فضل و کرم سے ہمیں ایک بار پھر موقع عطا فرمایا کہ ہم آپ محترم نمازیوں کی خدمت کر سکیں؛ اس بار نئے ڈیزائن، جدید سہولتوں اور ایسے صفحے کے ساتھ جو موبائل پر بھی آسانی سے کھلتا اور چلتا ہے۔',
      about_p3: 'ہمارا مقصد یہ ہے کہ اذان کی صدا آپ کے گھر، کام کی جگہ اور جہاں کہیں بھی آپ ہوں، پہنچائیں، چاہے آپ دنیا کے کسی بھی گوشے میں رہتے ہوں۔ اسی لیے ہم نقشے پر آپ کے منتخب کردہ مقام کے اوقاتِ نماز نکالتے ہیں، اور ساتھ ہی قبلے کی سمت، اذان کی آواز، روزانہ اور رمضان کی دعائیں، ہلال کا مشاہدہ اور کیلنڈر فارسی، انگریزی، اردو اور عربی میں فراہم کرتے ہیں۔',
      about_calc: 'اذان گو میں اوقاتِ نماز سائنسی حسابات کی بنیاد پر اور آپ کی رہائش گاہ کے طول بلد اور عرض بلد کو استعمال کرتے ہوئے نکالے جاتے ہیں۔ اذان گو کے طریقے میں فجر کے لیے سپیدۂ سحر کا زاویہ عرض بلد کے ساتھ بدلتا ہے (کم عرض بلد پر ۱۸ درجے سے بلند عرض بلد پر ۱۲ درجے تک) اور تمام مقامات کے لیے ایک ہی مقررہ زاویہ استعمال نہیں کیا جاتا؛ مغرب اور عشاء بالترتیب ۴ اور ۱۵ درجے کے زاویے پر نکالے جاتے ہیں۔ ہم اس طریقے کو مختلف عرض بلد والے شہروں کے لیے زیادہ موزوں سمجھتے ہیں۔',
      about_moon: 'اذان گو میں ہلال کی رؤیت فلکی حساب کے ذریعے اور آپ کے منتخب کردہ مقام ہی کے لیے لگائی جاتی ہے۔ قمری مہینے کے ۲۹ویں دن غروبِ آفتاب کے وقت اذان گو سورج اور چاند کی پوزیشن نکالتا ہے اور معیارِ عودہ (Odeh) کے مطابق دیکھتا ہے کہ اس مقام پر نیا ہلال نظر آ سکتا ہے یا نہیں۔ یہ معیار غروب کے وقت چاند کی افق سے بلندی اور ہلال کی چوڑائی پر مبنی ہے، اور نتیجہ چار صورتوں میں سے ایک ہوتا ہے: ننگی آنکھ سے نظر آتا ہے؛ دوربین سے نظر آتا ہے اور شاید ننگی آنکھ سے بھی ممکن ہو؛ صرف دوربین سے نظر آتا ہے؛ یا کسی بھی ذریعے سے نظر نہیں آتا۔ اگر ہلال ننگی آنکھ سے نظر آئے، یا دوربین سے نظر آئے اور ننگی آنکھ سے بھی اس کا امکان ہو (پہلی دو صورتیں)، تو موجودہ مہینہ اسی ۲۹ تاریخ کو ختم ہو جاتا ہے اور ۲۹ دن کا ہوتا ہے۔ اگر صرف دوربین سے نظر آئے یا کسی ذریعے سے نظر نہ آئے (آخری دو صورتیں)، تو مہینہ پورے ۳۰ دن کا ہوتا ہے۔ اگلے مہینے کا آغاز بھی اسی بنیاد پر دکھایا جاتا ہے۔ اس کے علاوہ ہلال دیکھنے کا بہترین وقت (غروبِ آفتاب سے غروبِ قمر تک کے وقفے کا تقریباً چار نواں حصہ) اور اس لمحے ہلال کی بلندی اور سمت بھی بتائی جاتی ہے۔',
      about_moon_note: 'یہ نتیجہ ایک سائنسی اندازہ ہے، سرکاری اعلان نہیں، اور ہو سکتا ہے آپ کے مرجعِ تقلید یا آپ کے شہر کے سرکاری ادارے کے اعلان سے مختلف ہو؛ ہر مرجع کا اپنا معیار اور طریقہ ہوتا ہے اور وہ ننگی آنکھ سے رؤیت کو شرط قرار دے سکتا ہے۔ چاند کے کارڈ پر «افق کی نمایانی» صرف موسم کی حالت دکھاتی ہے اور رؤیت کے حکم کو تبدیل نہیں کرتی۔ رمضان کے آغاز اور عید جیسے شرعی احکام کے لیے اپنے مرجعِ تقلید یا اپنے مقام کے سرکاری ادارے سے رجوع کریں۔',
      about_p4: 'اذان گو کا دنیا میں کہیں بھی کسی سرکاری یا غیر سرکاری تنظیم، ادارے، جماعت یا گروہ سے کوئی تعلق نہیں ہے۔',
      about_p5: 'ہمیں امید ہے کہ ہم نمازیوں کی کوئی چھوٹی سی خدمت انجام دے سکے ہیں۔ بلاشبہ اللہ تعالیٰ کے لطف و کرم اور حضرت ولیِ عصر (عج) کی توجہ کے بغیر ہمارے لیے یہ کام ممکن نہ تھا۔ آخر میں آپ نمازیوں سے دعا کی درخواست ہے؛ اذان اور نماز کے وقت ہمیں اپنی دعاؤں سے محروم نہ رکھیں، اور ہمارے مولا امامِ زمانہ (عج) کے ظہور میں تعجیل کی دعا کو ہرگز نہ بھولیں۔',
      about_p6: '«ہم سے رابطہ کریں» کے ذریعے آپ کی رائے اور تجاویز ہمارے لیے باعثِ مسرت ہوں گی۔',
      about_hadith: '«نماز کے اول وقت کی فضیلت آخر وقت پر ایسی ہے جیسے آخرت کی فضیلت دنیا پر۔»',
      about_hadith_src: 'امام جعفر صادق (علیہ السلام) — ثواب الأعمال، باب فضل الوقت الأول على الآخر',
      contact_btn: 'ہم سے رابطہ کریں', contact_text: 'کسی بھی سوال، تجویز یا تنقید کے لیے آپ اس ای میل پر ہم سے رابطہ کر سکتے ہیں:', copy_btn: 'ای میل کاپی کریں', copied: 'کاپی ہو گیا', close_btn: 'بند کریں',
      clock_zone: 'مقامی وقت', lang_toggle: 'فارسی',
      qibla_tag: 'قبلہ', logo_alt: 'اذان گو', page_title: 'اذان گو - اوقات نماز، رویت ہلال اور اوقات نماز کا کیلنڈر',
      page_desc: 'ہر شہر کے مقامی وقت کے مطابق اوقات نماز، ہجری اور شمسی کیلنڈر، ہلال کی رویت اور اذان کی آواز۔',
      dates_label: 'تاریخ اور وقت', tiles_label: 'تاریخ اور وقت',
      pdf_title: 'اوقات نماز', pdf_note: 'قمری مہینے کا حساب اذان گو سائٹ کی اپنی پیش گوئی کے مطابق ہے اور ممکن ہے مراجعِ تقلید کے دفاتر سے مختلف ہو؛ مزید معلومات کے لیے اپنے مرجعِ تقلید کے دفتر سے رابطہ کریں۔', pdf_day: 'دن', pdf_greg: 'عیسوی', pdf_shamsi: 'شمسی', pdf_hijri: 'ہجری',
      pdf_fajr: 'فجر', pdf_sunrise: 'طلوع', pdf_dhuhr: 'ظہر', pdf_asr: 'عصر', pdf_sunset: 'غروب',
      pdf_maghrib: 'مغرب', pdf_isha: 'عشا', pdf_midnight: 'نصف شب'
    },
    ar: {
      dua_timer_sahar: 'يبدأ دعاء سحور شهر رمضان في {start} قبل {adhan}.',
      dua_timer_iftar: 'يبدأ دعاء إفطار شهر رمضان في {start} قبل {adhan}.',
      adhan_now: 'جارٍ تشغيل الأذان…', adhan_muted: 'بدأ الأذان بدون صوت لأن المتصفح يمنع الصوت؛ انقر على الصفحة مرة واحدة لسماعه.',
      times_title: 'أوقات الصلاة اليوم',
      imsak: 'الإمساك',
      fajr: 'أذان الفجر',
      sunrise: 'شروق الشمس',
      dhuhr: 'أذان الظهر',
      sunset: 'غروب الشمس',
      maghrib: 'أذان المغرب',
      midnight: 'منتصف الليل',
      fajr_next: 'فجر الغد',
      cal_title: 'تقويم أوقات الصلاة',
      cal_greg: 'ميلادي',
      cal_shamsi: 'شمسي',
      cal_pick: 'اختر السنة والشهر:',
      cal_year: '- السنة -',
      cal_month: '- الشهر -',
      cal_ok: 'تأكيد', cal_prev_m: 'الشهر السابق', cal_next_m: 'الشهر التالي', cal_prev_y: 'السنة السابقة', cal_next_y: 'السنة التالية',
      cal_pick_ym: 'يرجى اختيار السنة والشهر.',
      cal_need_place: 'اختر المكان أولاً على الخريطة.',
      cal_no_pdf: 'إنشاء ملف PDF غير متاح.',
      cal_busy: 'جارٍ إنشاء ملف PDF…',
      cal_done: 'تم إنشاء ملف PDF.',
      cal_fail: 'تعذّر إنشاء ملف PDF.',
      search_ph: 'ابحث عن مدينة أو عنوان…',
      search_btn: 'بحث',
      searching: 'جارٍ البحث…',
      not_found: 'لم يتم العثور على مكان. اكتب اسم المدينة أو العنوان بشكل أدق.',
      search_failed: 'فشل البحث. تحقق من اتصال الإنترنت.',
      lat: 'خط العرض',
      lng: 'خط الطول',
      city: 'المدينة',
      calc_btn: 'احسب الأوقات',
      map_hint: 'انقر نقرًا مزدوجًا على الخريطة أو اسحب المؤشر لتغيير المكان.',
      map_label: 'الخريطة',
      calc_fail: 'تعذّر حساب الأوقات لهذا المكان.',
      zone_fallback: 'لم يُعثر على المنطقة الزمنية لهذا المكان؛ استُخدم توقيت جهازك.',
      bad_coords: 'خط العرض أو الطول غير صالح.',
      locating: 'جارٍ تحديد موقعك…',
      geo_denied: 'موقعك الحالي غير متاح. يُعرض المكان الافتراضي.',
      moon_title: 'رؤية الهلال',
      moon_now: 'نسبة الإضاءة الآن',
      moon_rise: 'طلوع القمر',
      moon_set: 'غروب القمر',
      moon_sunset: 'نسبة الإضاءة عند الغروب',
      moon_visible: 'في هذا المكان يبلغ الشهر الهجري {cur} {len} يومًا. عند غروب الشمس في آخر يوم يُرى هلال {next} بنسبة إضاءة {illum} لمدة {dur} دقيقة (من غروب الشمس إلى غروب القمر).',
      moon_hidden: 'في هذا المكان يبلغ الشهر الهجري {cur} {len} يومًا. عند غروب الشمس في آخر يوم لا يُرى هلال {next} (نسبة إضاءته {illum}).',
      moon_start: 'أول أيام {next} في هذا المكان هو {weekday}، {gd} {gm} {gy}، الموافق {sd} {sm} {sy} (التقويم الشمسي الهجري).',
      moon_follow_official: 'نُسِّق بدء شهر {cur} أو نهايته مع الشهر الرسمي المجاور له؛ ويبلغ طوله {len} يومًا.',
      moon_odeh: 'تُقدَّر رؤية الهلال بمعيار عودة (Odeh V-criterion)؛ وهو تقدير وليس إعلانًا رسميًا.',
      privacy_link: 'الخصوصية',
      moon_official_same: 'طول شهر {cur} ({len} يومًا) وفق الإعلان الرسمي.',
      moon_official_len: 'حُدد طول شهر {cur} بـ {len} يومًا وفق الإعلان الرسمي، بينما كان الحساب الفلكي للموقع يتوقع {plen} يومًا.',
      moon_official_shift: 'حُدد بدء شهر {cur} وفق الإعلان الرسمي ويختلف عن الحساب الفلكي للموقع بمقدار {n} يوم.',
      moon_why_short: 'لا يُرى الهلال عند غروب الشمس في اليوم {d}، لذا يكون شهر {cur} {len} يومًا.',
      moon_why_30: 'عند غروب الشمس في اليوم {d} من {cur} تبلغ إضاءة القمر {illum} ويغرب بعد الشمس بـ {dur} دقيقة فقط؛ لا يُرى الهلال، لذا يكون شهر {cur} {len} يومًا.',
      moon_why_30_early: 'عند غروب الشمس في اليوم {d} من {cur} تبلغ إضاءة القمر {illum} ويغرب قبل الشمس؛ لا يُرى الهلال، لذا يكون شهر {cur} {len} يومًا.',
      moon_why_29: 'عند غروب الشمس في اليوم {d} من {cur} تبلغ إضاءة القمر {illum} ويغرب بعد الشمس بـ {dur} دقيقة؛ يُرى الهلال، لذا يكون شهر {cur} {len} يومًا.',
      moon_try: 'إن أردت المحاولة، فأفضل وقت هو مساء {weekday} {gd} {gm}، الساعة {time} (بعد غروب الشمس بحوالي {mins} دقيقة)، على ارتفاع نحو {alt}° فوق الأفق، {dir}. {how}',
      moon_try_none: 'عند هذا الغروب لا يُرى الهلال بأي وسيلة.',
      moon_best: 'أفضل وقت لرؤية هلال {next} في هذا المكان: مساء {weekday} {gd} {gm}، الساعة {time} (بعد غروب الشمس بحوالي {mins} دقيقة)، على ارتفاع نحو {alt}° فوق الأفق، {dir}. {how}',
      moon_best_naked: 'يُرى بالعين المجردة.',
      moon_best_aid: 'يُرى بالمنظار، وقد يُرى بالعين المجردة.',
      moon_best_optical: 'يُرى بالمنظار فقط.',
      moon_best_none: 'عند غروب الشمس مساء {weekday} {gd} {gm} لا يُرى هلال {next} في هذا المكان.',
      moon_best_tip: 'يلزم أن يكون الأفق في ذلك الاتجاه مفتوحًا وخاليًا من العوائق.',
      moon_alt: 'القمر، مضاء بنسبة {p}%',
      dir: '{deg}° {side} من {card}',
      qibla: 'القبلة: {deg}° من الشمال باتجاه عقارب الساعة',
      qibla_label: 'اتجاه القبلة',
      adhan_title: 'صوت الأذان',
      r_moazen: 'موذن‌زاده أردبيلي',
      r_abather: 'أباذر الحلواجي',
      r_sobhdel: 'حسين صبحدل',
      r_najafi: 'فريد نجفي',
      r_aghati: 'محمد آقاتي',
      auto_label: 'تشغيل الأذان والدعاء تلقائيًا',
      auto_hint: 'للتشغيل التلقائي يجب أن تبقى هذه الصفحة مفتوحة وأن تنقر عليها مرة واحدة.',
      hint_more: 'المزيد', hint_less: 'أقل',
      sound_bar: 'لتشغيل الأذان والدعاء تلقائيًا، انقر على الصفحة مرة واحدة',
      sky_sunset: 'الغيوم عند الغروب: {c} — {v}',
      sky_now_l: 'الغيوم والطقس في هذه اللحظة', wx_clear: 'صافٍ', wx_partly: 'غائم جزئيًا', wx_cloudy: 'غائم', wx_fog: 'ضبابي', wx_rain: 'غائم وماطر', wx_snow: 'غائم وثلجي', wx_storm: 'غائم مع عواصف رعدية',
      sky_vis_l: 'مدى الرؤية عند الأفق وقت الغروب', sky_night_l: 'الغيوم الليلة (حتى منتصف الليل)', sky_night_l_late: 'الغيوم من الآن حتى الشروق', sky_km: 'كم', sky_vis_help_label: 'شرح مدى الرؤية عند الأفق', sky_vis_help: 'مدى الرؤية عند الأفق هو المسافة بالكيلومترات التي يمكن أن ترى فيها بوضوح عبر الهواء في تلك اللحظة؛ كلما كان الرقم أكبر كان الجو أصفى وقلّ الضباب والغبار والدخان. الرقم مأخوذ من توقعات الطقس لهذا المكان وقت غروب الشمس، ولا علاقة له بنسبة إضاءة القمر. تظهر أهميته عند البحث عن الهلال الجديد، وهو رقيق ويظهر قرب الأفق، عند غروب آخر يوم من الشهر الهجري؛ أما في بقية الليالي فهو مجرد معلومة عن صفاء الجو. ١٥ كم فأكثر: جيدة؛ من ٦ إلى ١٤ كم: متوسطة؛ أقل من ٦ كم: ضعيفة. هذا مجرد توقع للطقس ولا يغيّر حكم رؤية الهلال.', hadith_title: 'حديث اليوم', hadith_close: 'إغلاق',
      sky_s_good: 'الظروف مناسبة لرؤية الهلال', sky_s_mid: 'قد يُرى الهلال لكن الأمر غير مؤكد', sky_s_bad: 'رؤية الهلال ستكون صعبة',
      sky_v_good: 'جيد', sky_v_mid: 'متوسط', sky_v_bad: 'ضعيف (ضباب أو غبار)',
      sky_n_good: 'يُتوقع أن يُرى القمر والنجوم بوضوح', sky_n_mid: 'السماء غائمة جزئيًا', sky_n_bad: 'السماء غائمة',
      sky_note: 'هذا مجرد توقع للطقس؛ لا يغيّر حكم رؤية الهلال ولا يغني عن الرؤية الفعلية.',
      auto_more_text: 'لكي يُشغَّل الأذان دون الحاجة إلى النقر، ثبّت الموقع على جهازك (Add to Home Screen أو Install) أو اضبط الصوت على «السماح» لهذا الموقع في إعدادات المتصفح.',
      playing: 'جارٍ تشغيل {name}',
      time_for: 'حان وقت {name}. اضغط على التشغيل.',
      adhan_fajr: 'أذان الفجر',
      adhan_dhuhr: 'أذان الظهر',
      adhan_maghrib: 'أذان المغرب',
      save_sub: 'يُحفظ في هذا المتصفح المكان على الخريطة وصوت الأذان والتشغيل التلقائي واللغة والمظهر الداكن/الفاتح.',
      clear_btn: 'حذف الإعدادات المحفوظة', clear_q: 'سيتم حذف مكانك وإعداداتك المحفوظة من هذا المتصفح. هل تريد الحذف؟', clear_done: 'تم حذف الإعدادات المحفوظة.',
      save_btn: 'حفظ للمرة القادمة', save_title: 'حفظ المكان والإعدادات',
      save_q: 'سيتم حفظ إعداداتك الحالية (المكان على الخريطة، صوت الأذان، التشغيل التلقائي للأذان والدعاء، اللغة، والمظهر الداكن/الفاتح) في هذا المتصفح وتحميلها تلقائيًا في المرة القادمة. ستحل محل إعداداتك المحفوظة سابقًا. هل تريد الحفظ؟',
      yes: 'نعم',
      no: 'لا',
      saved: 'تم حفظ مكانك وإعداداتك، وسيتم تحميلها تلقائيًا في المرة القادمة.',
      save_fail: 'تعذّر الحفظ. مساحة تخزين المتصفح غير متاحة.',
      no_change: 'لم يُحفظ أي شيء.',
      donate_title: 'انقر هنا للمساهمة في تكاليف هذا الموقع',
      donate: 'تبرع',
      copyright: '© 2026 azangoo.com · All rights reserved',
      dua_off_auto: 'التشغيل التلقائي للأذان متوقف', dua_off: 'تشغيل الدعاء اليومي متوقف', dua_nolist: 'تعذّر قراءة قائمة الأدعية', dua_nomonth: 'لا يوجد دعاء يومي في هذا الشهر الهجري', dua_passed: 'انتهى وقت دعاء اليوم',
      dua_timer: 'يبدأ دعاء اليوم ({day}) في {start} قبل {adhan}.', dua_loading: 'الدعاء اليومي: جارٍ التحميل…',
      dua_opt: 'تشغيل الدعاء اليومي تلقائيًا قبل الأذان',
      terms_link: 'شروط الاستخدام',
      widget_link: 'أضف أوقات الصلاة إلى موقعك',
      city_list_btn: 'تصفح المدن',
      cities_title: 'مدن شائعة', city_aurora: 'أورورا، كندا', city_tehran: 'طهران، إيران',
      gps_btn: 'استخدام موقعي الحالي', gps_denied: 'الوصول إلى الموقع محظور. اسمح به من إعدادات المتصفح (بجانب عنوان الموقع) وحاول مرة أخرى.',
      theme_dark: 'داكن', theme_light: 'فاتح', theme_title: 'المظهر (داكن / فاتح)',
      official_mark: '(إعلان رسمي)', predicted_mark: '(توقع)',
      ram_suhur: 'حتى نهاية السحور (الفجر): {h} ساعة و{m} دقيقة و{s} ثانية', ram_iftar: 'حتى الإفطار (المغرب): {h} ساعة و{m} دقيقة و{s} ثانية', ram_remind: 'ذكّرني قبل السحور والإفطار بعشر دقائق', ram_remind_suhur: 'بقي عشر دقائق على انتهاء السحور (الفجر).', ram_remind_iftar: 'بقي عشر دقائق على الإفطار.', ram_iftar_now: 'حان وقت الإفطار.', ram_no_notif: 'اسمح بإشعارات المتصفح لتصلك التذكيرات.',
      loc_text: 'لعرض أوقات الصلاة الصحيحة لمكانك، هل نسمح بقراءة موقعك الحالي؟ يُستخدم الموقع في متصفحك فقط ويُحفظ فيه كمكانك الافتراضي، ولا يُرسل إلى خادمنا.', loc_yes: 'أسمح', loc_no: 'ليس الآن', pick_place: 'انقر نقرًا مزدوجًا على الخريطة أو ابحث عن مدينة لاختيار المكان.',
      moon_more: 'معلومات أكثر', moon_less: 'معلومات أقل', moon_sight: 'رؤية هلال {next}', moon_tab_now: 'القمر الآن', moon_sight_intro: 'هذا القسم عن هلال {next} الجديد الذي يُترصَّد عند غروب آخر يوم من الشهر الهجري الحالي، ولا علاقة له بشكل القمر في هذه اللحظة.', annual_btn: 'التقويم السنوي', ann_title: 'أشهر السنة الهجرية', ann_hijri: 'الشهر الهجري', ann_greg: 'البداية (ميلادي)', ann_shamsi: 'البداية (شمسي)', ann_len: 'طول الشهر', ann_days: 'يوم',
      months_all: 'كل الشهور', cal_pick_greg: 'اختر السنة والشهر (ميلادي):', cal_pick_shamsi: 'اختر السنة والشهر (شمسي):',
      dir_n: 'شمال',
      dir_s: 'جنوب',
      dir_e: 'شرق',
      dir_w: 'غرب',
      countdown: 'حتى {name}: {h} ساعة و{m} دقيقة و{s} ثانية متبقية',
      alert_title: 'اقترب الأذان', alert_until: 'حتى {name}', alert_now: 'حان وقت الأذان',
      about_btn: 'من نحن',
      about_title: 'عن أذان گو',
      about_p1: 'أطلقنا موقع «أذان گو» عام ٢٠١١م، وكان يعمل آنذاك على خرائط غوغل، وظلّ يعمل لفترة طويلة بصورة جيدة ودون أي مشكلة. لكن بعد مدة أوقفت غوغل خدمة الخرائط عنّا، فأصبح تقديم أوقات الصلاة في «أذان گو» أمرًا صعبًا.',
      about_p2: 'وفي هذا العام ٢٠٢٦م، منّ الله المنّان علينا مرة أخرى بأن نكون في خدمتكم أيها المصلّون الكرام، وهذه المرة بتصميم جديد وإمكانات عصرية وصفحة يسهل عرضها واستخدامها على الهاتف المحمول.',
      about_p3: 'هدفنا أن يصل صوت الأذان إلى بيتك ومكان عملك وأينما كنت، أيًّا كانت البقعة التي تعيش فيها من العالم. ولهذا نحسب أوقات الصلاة للمكان الذي تختاره على الخريطة، ونوفّر إلى جانبها اتجاه القبلة وصوت الأذان وأدعية اليوم وأدعية شهر رمضان ورؤية الهلال والتقويم، بأربع لغات: الفارسية والإنجليزية والأردية والعربية.',
      about_calc: 'تُحسب أوقات الصلاة في «أذان گو» على أساس حسابات علمية، وباستخدام خطّ الطول وخطّ العرض لمكان إقامتك. وفي طريقة «أذان گو» تتغيّر زاوية الفجر مع خطّ العرض (من ١٨ درجة عند خطوط العرض المنخفضة إلى ١٢ درجة عند خطوط العرض العالية)، فلا تُطبَّق زاوية ثابتة واحدة على جميع الأماكن؛ ويُحسب المغرب والعشاء عند زاويتي ٤ و١٥ درجة. ونرى أن هذه الطريقة أنسب للمدن المختلفة في خطوط العرض.',
      about_moon: 'تُقدَّر رؤية الهلال في «أذان گو» بالحساب الفلكي وللمكان الذي اخترته بالذات. ففي غروب اليوم التاسع والعشرين من الشهر القمري يحسب «أذان گو» موضعَي الشمس والقمر، ويتحقق بمعيار عودة (Odeh) من إمكان رؤية الهلال الجديد في ذلك المكان. يعتمد هذا المعيار على ارتفاع القمر فوق الأفق وعرض الهلال عند الغروب، وتكون النتيجة إحدى أربع حالات: يُرى بالعين المجرّدة؛ يُرى بالمنظار أو التلسكوب وربما بالعين المجرّدة أيضًا؛ يُرى بالأداة البصرية فقط؛ أو لا يُرى بأي وسيلة. فإذا كان الهلال يُرى بالعين المجرّدة، أو يُرى بالأداة البصرية مع إمكان رؤيته بالعين المجرّدة (الحالتان الأوليان)، انتهى الشهر الحالي في ذلك اليوم التاسع والعشرين وكان تسعة وعشرين يومًا. وإن كان يُرى بالأداة البصرية فقط أو لا يُرى إطلاقًا (الحالتان الأخيرتان)، أتمّ الشهر ثلاثين يومًا. ويُعرض بداية الشهر التالي على الأساس نفسه. كما يبيّن «أذان گو» أفضل وقت لرصد الهلال (نحو أربعة أتساع المسافة الزمنية بين غروب الشمس وغروب القمر) وارتفاع الهلال واتجاهه في تلك اللحظة.',
      about_moon_note: 'هذه النتيجة تقدير علمي وليست إعلانًا رسميًا، وقد تختلف عن إعلان مرجعك الديني أو الجهة الرسمية في مدينتك؛ فلكل جهة معيارها وطريقتها، وقد تشترط الرؤية بالعين المجرّدة. أما «وضوح الأفق» في بطاقة القمر فيُظهر حالة الطقس فقط ولا يغيّر حكم الرؤية. وللأحكام الشرعية كبداية شهر رمضان والعيد، يُرجى الرجوع إلى مرجعك الديني أو الجهة الرسمية في بلدك.',
      about_p4: '«أذان گو» غير تابع لأي جهة أو مؤسسة أو منظمة أو جماعة، حكومية كانت أو غير حكومية، في أي مكان من العالم.',
      about_p5: 'نأمل أن نكون قد قدّمنا خدمة، ولو يسيرة، للمصلّين. ولا شك أنه لولا لطف الله تعالى ورحمته وعناية الحجة المهدي (عجّل الله فرجه الشريف) لما تيسّر لنا هذا العمل. وفي الختام نلتمس منكم أيها المصلّون الأعزاء الدعاء؛ فلا تحرمونا من دعائكم عند الأذان والصلاة، ولا تنسوا الدعاء بتعجيل فرج مولانا إمام الزمان (عجّل الله فرجه الشريف).',
      about_p6: 'يسعدنا أن نسمع آراءكم واقتراحاتكم عبر «اتصل بنا».',
      about_hadith: '',                                   /* the hadith is already in Arabic above this line */
      about_hadith_src: 'الإمام الصادق (عليه السلام) — ثواب الأعمال، باب فضل الوقت الأول على الآخر',
      contact_btn: 'اتصل بنا',
      contact_text: 'لأي سؤال أو اقتراح أو ملاحظة يمكنك التواصل معنا عبر البريد الإلكتروني:',
      copy_btn: 'نسخ البريد',
      copied: 'تم النسخ',
      close_btn: 'إغلاق',
      clock_zone: 'التوقيت المحلي',
      lang_toggle: 'English',
      qibla_tag: 'القبلة',
      logo_alt: 'اذان گو',
      page_title: 'أذان گو - أوقات الصلاة، رؤية الهلال وتقويم أوقات الصلاة',
      page_desc: 'أوقات الصلاة بالتوقيت المحلي لكل مدينة، التقويم الهجري والشمسي، رؤية الهلال وتشغيل الأذان.',
      pdf_title: 'أوقات الصلاة', pdf_note: 'تستند حسابات الشهر القمري إلى تقدير موقع أذان گو، وقد تختلف عن مكاتب مراجع التقليد؛ لمزيد من المعلومات يرجى مراجعة مكتب مرجع التقليد الخاص بكم.',
      pdf_day: 'اليوم',
      pdf_greg: 'ميلادي',
      pdf_shamsi: 'شمسي',
      pdf_hijri: 'هجري',
      pdf_fajr: 'الفجر',
      pdf_sunrise: 'الشروق',
      pdf_dhuhr: 'الظهر',
      pdf_asr: 'العصر',
      pdf_sunset: 'الغروب',
      pdf_maghrib: 'المغرب',
      pdf_isha: 'العشاء',
      pdf_midnight: 'منتصف الليل',
      dates_label: 'التاريخ والوقت',
      tiles_label: 'التاريخ والوقت',
      asr: 'أذان العصر',
      isha: 'أذان العشاء',
      adhan_asr: 'أذان العصر',
      adhan_isha: 'أذان العشاء',
      adhan_fajr_next: 'فجر الغد'
    }
  };

  var NAMES = {
    fa: {
      weekdays: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
      greg: ['ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', 'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'],
      shamsi: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'],
      hijri: ['محرم', 'صفر', 'ربیع‌الاول', 'ربیع‌الثانی', 'جمادی‌الاول', 'جمادی‌الثانی', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذی‌القعده', 'ذی‌الحجه'],
      card: { N: 'شمال', E: 'شرق', S: 'جنوب', W: 'غرب' },
      side: { N: 'شمال', E: 'شرق', S: 'جنوب', W: 'غرب' }
    },
    en: {
      weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      greg: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      shamsi: ['Farvardin', 'Ordibehesht', 'Khordad', 'Tir', 'Mordad', 'Shahrivar', 'Mehr', 'Aban', 'Azar', 'Dey', 'Bahman', 'Esfand'],
      hijri: ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha’ban', 'Ramadan', 'Shawwal', 'Dhu al-Qi’dah', 'Dhu al-Hijjah'],
      card: { N: 'north', E: 'east', S: 'south', W: 'west' },
      side: { N: 'north', E: 'east', S: 'south', W: 'west' }
    },
    ur: {
      weekdays: ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'],
      greg: ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
      shamsi: ['فروردین', 'اردی بہشت', 'خرداد', 'تیر', 'مرداد', 'شہریور', 'مہر', 'آبان', 'آذر', 'دی', 'بہمن', 'اسفند'],
      hijri: ['محرم', 'صفر', 'ربیع الاول', 'ربیع الثانی', 'جمادی الاول', 'جمادی الثانی', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذوالقعدہ', 'ذوالحجہ'],
      card: { N: 'شمال', E: 'مشرق', S: 'جنوب', W: 'مغرب' },
      side: { N: 'شمال', E: 'مشرق', S: 'جنوب', W: 'مغرب' }
    },
    ar: {
      weekdays: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
      greg: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
      shamsi: ['فروردين', 'أرديبهشت', 'خرداد', 'تير', 'مرداد', 'شهريور', 'مهر', 'آبان', 'آذر', 'دي', 'بهمن', 'إسفند'],
      hijri: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'],
      card: { N: 'شمال', E: 'شرق', S: 'جنوب', W: 'غرب' },
      side: { N: 'شمال', E: 'شرق', S: 'جنوب', W: 'غرب' }
    }
  };

  var FA = '۰۱۲۳۴۵۶۷۸۹';
  var AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

  /* read the saved language once D and LANGS exist */
  /* order: language in the saved defaults, then the language the visitor picked before, then the browser's language */
  var LANG_KEY = 'azangoo-lang';
  function rememberChoice(code) { try { localStorage.setItem(LANG_KEY, code); } catch (e) {} }
  function detectLang() {
    try {
      var tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '');
      var list = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || ''];
      var codes = list.map(function (x) { return String(x).toLowerCase().split('-')[0]; });
      if (tz === 'Asia/Tehran' || codes.indexOf('fa') !== -1) return 'fa';   /* Persian anywhere in the list: many Iranians have an English phone */
      for (var i = 0; i < codes.length; i++) if (codes[i] === 'ar' || codes[i] === 'ur' || codes[i] === 'en') return codes[i];
    } catch (e) {}
    return 'en';                                                          /* any other language reads English best */
  }
  var chosen = '';
  try {
    var saved = JSON.parse(localStorage.getItem('azangoo-defaults'));
    if (saved && saved.lang && D[saved.lang]) chosen = saved.lang;
  } catch (e) {}
  if (!chosen) { try { var picked = localStorage.getItem(LANG_KEY); if (picked && D[picked]) chosen = picked; } catch (e) {} }
  lang = chosen || (D[detectLang()] ? detectLang() : 'fa');
  /* a language home page (/en/, /fa/ ...) always opens in its own language */
  try {
    var pageLang = (typeof document !== 'undefined') ? document.documentElement.getAttribute('data-page-lang') : '';
    if (pageLang && D[pageLang]) lang = pageLang;
  } catch (e) {}
  /* after the visitor changes language on a language home page, the address bar follows (a reload then keeps the language) */
  function syncUrl(code) {
    try {
      if (typeof document === 'undefined' || !document.documentElement.getAttribute('data-page-lang')) return;
      var m = /^(.*\/)(fa|en|ur|ar)\/(index\.html)?$/.exec(location.pathname);
      if (!m || !history.replaceState) return;
      history.replaceState(null, '', m[1] + code + '/' + (m[3] || '') + location.search);
      document.documentElement.setAttribute('data-page-lang', code);
    } catch (e) {}
  }

  function t(key, vars) {
    var v = D[lang] && D[lang][key];
    var s = (typeof v === 'string') ? v : (D.fa[key] || key);   /* an empty text is a real value; only a missing key falls back to Persian */
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }
  /* numbers: Persian digits in Persian, plain digits in English */
  function num(x) {
    var s = String(x), dg = info(lang).digits;
    if (dg === 'latin') return s;
    var set = dg === 'arabic' ? AR_DIGITS : FA;
    return s.replace(/\d/g, function (d) { return set[+d]; }).replace(/\./g, '٫');
  }
  /* Persian and Arabic-Indic digits, Persian decimal sign and comma -> plain numbers for parsing */
  function toAscii(s) {
    return String(s).replace(/[۰-۹٠-٩]/g, function (d) {
      var i = FA.indexOf(d); return String(i >= 0 ? i : AR_DIGITS.indexOf(d));
    })
      .replace(/٫/g, '.').replace(/٬|،/g, ',').replace(/[−–]/g, '-').trim();
  }
  function names(kind) { return NAMES[lang][kind]; }
  function percent(x) { return num(x) + (info(lang).digits === 'latin' ? '%' : '٪'); }
  function isRtl() { return info(lang).rtl; }

  function apply() {
    if (typeof document === 'undefined') return;
    var html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', isRtl() ? 'rtl' : 'ltr');
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      /* "attribute:key" - several pairs can be separated by ";" (for example "title:gps_btn;aria-label:gps_btn") */
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var parts = pair.split(':');
        if (parts.length > 1) el.setAttribute(parts[0].trim(), t(parts[1].trim()));
      });
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    });
    /* city links: only the current language, with the city and country in that language */
    document.querySelectorAll('a.city-link').forEach(function (a) {
      a.setAttribute('href', lang + '/prayer-times/' + a.getAttribute('data-country') + '/' + a.getAttribute('data-slug') + '/index.html');
      a.setAttribute('lang', lang);
      a.textContent = a.getAttribute('data-' + lang) || a.getAttribute('data-fa');
    });
    var termsLink = document.querySelector('a.terms-link');
    if (termsLink) termsLink.setAttribute('href', lang + '/terms/index.html');
    var privLink = document.querySelector('a.privacy-link');
    if (privLink) privLink.setAttribute('href', lang + '/privacy/index.html');
    var widgetLink = document.querySelector('a.widget-link');
    if (widgetLink) widgetLink.setAttribute('href', lang + '/widget/index.html');
    var listBtn = document.getElementById('cityListLink');
    if (listBtn) listBtn.setAttribute('href', lang + '/prayer-times/index.html');
    var logo = document.querySelector('img.logo-img');
    if (logo) {
      var key = logo.getAttribute('data-src-' + lang) ? lang : 'fa';   /* Urdu uses the Persian logo */
      logo.setAttribute('src', logo.getAttribute('data-src-' + key));
      logo.setAttribute('srcset', logo.getAttribute('data-srcset-' + key));
    }
    var sel = document.getElementById('langSelect');
    if (sel) {
      if (!sel.options.length) {
        var head = document.createElement('option');          /* always shown as the default text */
        head.value = ''; head.textContent = 'Languages';
        sel.appendChild(head);
        LANGS.forEach(function (x) {
          var o = document.createElement('option');
          o.value = x.code; o.textContent = x.label;
          sel.appendChild(o);
        });
      }
      sel.value = '';
    }
    document.title = t('page_title');
    /* description and share texts follow the language too */
    [['meta[name="description"]', 'page_desc'], ['meta[property="og:title"]', 'page_title'], ['meta[property="og:description"]', 'page_desc'],
     ['meta[name="twitter:title"]', 'page_title'], ['meta[name="twitter:description"]', 'page_desc']].forEach(function (x) {
      var m = document.querySelector(x[0]);
      if (m) m.setAttribute('content', t(x[1]));
    });
  }

  function set(l) {
    lang = D[l] ? l : 'fa';                    /* switching does not save; only the defaults button does */
    apply();
    if (root.dispatchEvent && typeof CustomEvent !== 'undefined') root.dispatchEvent(new CustomEvent('azan:langchange', { detail: { lang: lang } }));
  }

  var api = { t: t, num: num, toAscii: toAscii, names: names, percent: percent, apply: apply, set: set, isRtl: isRtl, langs: LANGS,
              current: function () { return lang; } };
  root.AzanLang = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document !== 'undefined') {
    var wire = function () {
      apply();
      /* one-tap language buttons at the top of the location dialog */
      var pick = document.getElementById('locLang');
      if (pick) {
        LANGS.forEach(function (x) {
          var b = document.createElement('button');
          b.type = 'button'; b.textContent = x.label; b.setAttribute('lang', x.code); b.setAttribute('data-lang', x.code);
          b.addEventListener('click', function () { set(x.code); rememberChoice(x.code); syncUrl(x.code); });
          pick.appendChild(b);
        });
        var mark = function () {
          Array.prototype.forEach.call(pick.children, function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false'); });
        };
        mark();
        root.addEventListener('azan:langchange', mark);
      }
      var sel = document.getElementById('langSelect');
      if (sel) sel.addEventListener('change', function () {
        var chosen = sel.value;
        if (!chosen) return;
        set(chosen);
        rememberChoice(chosen);
        syncUrl(chosen);
        sel.value = chosen;                                     /* show the chosen language for a moment */
        setTimeout(function () { sel.value = ''; }, 1000);      /* then back to the "Languages" text */
      });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
    else wire();
  }
})(typeof window !== 'undefined' ? window : globalThis);
