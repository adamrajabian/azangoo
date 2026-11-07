/* Copyright (c) 2026 azangoo.com. All rights reserved.
   Copying, reuse, modification or redistribution of this code, or of its calculations,
   is prohibited without written permission. See the Terms and conditions page. */
/* Privacy text for each language (used by tools/build-pages.js). Edit here, then rebuild. */
module.exports = {
  fa: {
    title: 'حریم خصوصی',
    desc: 'حریم خصوصی در اذان گو: موقعیت مکانی، تنظیمات پیش‌فرض و سرویس‌های دیگری که سایت از آن‌ها استفاده می‌کند.',
    intro: 'اذان گو برای کار کردن به کمترین اطلاعات نیاز دارد و اطلاعات شخصی شما را روی سرور خود ذخیره نمی‌کند.',
    sections: [
      { h: 'موقعیت مکانی', p: [
        'موقعیت مکانی شما فقط با اجازهٔ شما از مرورگر خوانده می‌شود و برای محاسبهٔ اوقات و ماه در همان مرورگر استفاده می‌شود. اذان گو آن را روی سرور خود ذخیره نمی‌کند.'
      ] },
      { h: 'تنظیمات پیش‌فرض', p: [
        'مکان، صدای اذان، زبان، پخش خودکار اذان و دعا و پوسته، فقط وقتی دکمهٔ ذخیره را بزنید ذخیره می‌شوند. تنها استثنا اولین بازدید است: زبان صفحه پس از پاسخ شما به پرسش دسترسی به موقعیت (چه اجازه بدهید چه نه) و در صورت اجازه، مکان شما نیز به‌عنوان پیش‌فرض ذخیره می‌شود.',
        'این اطلاعات فقط برای راحتی کار خود شما در حافظهٔ همین مرورگر می‌ماند، به سرور ما فرستاده نمی‌شود و با پاک کردن اطلاعات مرورگر از بین می‌رود.'
      ] },
      { h: 'سرویس‌های دیگر', p: [
        'برای نمایش نقشه و پیدا کردن نام شهر (و در صورت نیاز کشور)، مرورگر شما مستقیم به OpenStreetMap وصل می‌شود و مختصات نقطهٔ انتخاب‌شده یا متن جستجو را برای آن می‌فرستد. اگر این سرویس پاسخ ندهد، همین اطلاعات برای Photon (photon.komoot.io) و تصویر نقشه از CARTO گرفته می‌شود. برای تشخیص منطقهٔ زمانی، مختصات به Open-Meteo یا timeapi.io فرستاده می‌شود. برای نمایش آسمان متناسب با وضعیت هوا و پیش‌بینی ابر و دید افق در کارت ماه، مختصات به Open-Meteo و در صورت پاسخ ندادن آن به MET Norway (api.met.no) فرستاده می‌شود.',
        'کتابخانهٔ نقشه (Leaflet) از unpkg.com (و در صورت در دسترس نبودن، از jsDelivr) و فونت از Google Fonts بارگذاری می‌شود. این سرویس‌ها سیاست حریم خصوصی خودشان را دارند و اذان گو آن‌ها را کنترل نمی‌کند.'
      ] },
      { h: 'تماس', p: [
        'برای پرسش دربارهٔ حریم خصوصی: info.azangoo@gmail.com'
      ] }
    ],
    updated: 'آخرین به‌روزرسانی: اکتبر ۲۰۲۶'
  },
  en: {
    title: 'Privacy',
    desc: 'Privacy at Azangoo: location, saved defaults, and the other services the site uses.',
    intro: 'Azangoo needs very little information to work and does not store your personal information on its server.',
    sections: [
      { h: 'Location', p: [
        'Your location is read from the browser only with your permission and is used in that browser to calculate the times and the month. Azangoo does not store it on its server.'
      ] },
      { h: 'Saved defaults', p: [
        'Place, adhan voice, language, automatic adhan and dua playback and theme are saved only when you press the save button. The only exception is your first visit: after you answer the question about reading your location (whether you allow it or not), the language of the page is saved as a default, and if you allow it, your place is saved too.',
        'This information stays in this browser only, for your own convenience. It is not sent to our server and disappears when you clear the browser data.'
      ] },
      { h: 'Other services', p: [
        'To show the map and find a city name (and, when needed, the country), your browser connects directly to OpenStreetMap and sends it the coordinates of the selected point or the text you search for. If that service does not answer, the same information goes to Photon (photon.komoot.io) and the map pictures are taken from CARTO. To find the time zone, the coordinates are sent to Open-Meteo or timeapi.io. To show the sky that matches the weather, and the cloud and horizon-visibility forecast in the moon card, the coordinates are sent to Open-Meteo or, if it does not answer, to MET Norway (api.met.no).',
        'The map library (Leaflet) is loaded from unpkg.com (or from jsDelivr if unpkg is not available) and the fonts from Google Fonts. These services have their own privacy policies and are not controlled by Azangoo.'
      ] },
      { h: 'Contact', p: [
        'Questions about privacy: info.azangoo@gmail.com'
      ] }
    ],
    updated: 'Last updated: October 2026'
  },
  ur: {
    title: 'رازداری',
    desc: 'اذان گو میں رازداری: مقام، محفوظ شدہ پیش فرض اور دوسری خدمات جو سائٹ استعمال کرتی ہے۔',
    intro: 'اذان گو کو کام کرنے کے لیے بہت کم معلومات درکار ہیں اور آپ کی ذاتی معلومات اپنے سرور پر محفوظ نہیں کرتا۔',
    sections: [
      { h: 'مقام', p: [
        'آپ کا مقام صرف آپ کی اجازت سے براؤزر سے پڑھا جاتا ہے اور اوقات اور مہینے کے حساب کے لیے اسی براؤزر میں استعمال ہوتا ہے۔ اذان گو اسے اپنے سرور پر محفوظ نہیں کرتا۔'
      ] },
      { h: 'محفوظ شدہ پیش فرض', p: [
        'مقام، اذان کی آواز، زبان، اذان اور دعا کا خودکار پلے اور تھیم صرف اسی وقت محفوظ ہوتے ہیں جب آپ محفوظ کرنے کا بٹن دباتے ہیں۔ واحد استثنا پہلی بار آنا ہے: مقام پڑھنے کے سوال کا جواب دینے کے بعد (چاہے اجازت دیں یا نہ دیں) صفحے کی زبان ڈیفالٹ کے طور پر محفوظ ہو جاتی ہے، اور اجازت دینے کی صورت میں آپ کا مقام بھی۔',
        'یہ معلومات صرف آپ کی سہولت کے لیے اسی براؤزر میں رہتی ہیں، ہمارے سرور کو نہیں بھیجی جاتیں اور براؤزر کا ڈیٹا صاف کرنے سے ختم ہو جاتی ہیں۔'
      ] },
      { h: 'دوسری خدمات', p: [
        'نقشہ دکھانے اور شہر کا نام (اور ضرورت پر ملک) معلوم کرنے کے لیے آپ کا براؤزر براہ راست OpenStreetMap سے جڑتا ہے اور منتخب نقطے کے نقاط یا آپ کا تلاش کیا ہوا متن اسے بھیجتا ہے۔ اگر یہ سروس جواب نہ دے تو یہی معلومات Photon (photon.komoot.io) کو بھیجی جاتی ہیں اور نقشے کی تصویریں CARTO سے لی جاتی ہیں۔ ٹائم زون معلوم کرنے کے لیے نقاط Open-Meteo یا timeapi.io کو بھیجے جاتے ہیں۔ موسم کے مطابق آسمان اور چاند کے کارڈ میں بادل اور افق کی نظر آنے کی حد کی پیش گوئی دکھانے کے لیے نقاط Open-Meteo کو اور اس کے جواب نہ دینے پر MET Norway (api.met.no) کو بھیجے جاتے ہیں۔',
        'نقشے کی لائبریری (Leaflet) unpkg.com سے (اور دستیاب نہ ہونے پر jsDelivr سے) اور فونٹ Google Fonts سے لوڈ ہوتے ہیں۔ ان خدمات کی اپنی رازداری کی پالیسی ہے اور اذان گو انہیں کنٹرول نہیں کرتا۔'
      ] },
      { h: 'رابطہ', p: [
        'رازداری سے متعلق سوالات: info.azangoo@gmail.com'
      ] }
    ],
    updated: 'آخری اپ ڈیٹ: اکتوبر 2026'
  },
  ar: {
    title: 'الخصوصية',
    desc: 'الخصوصية في أذان گو: الموقع والإعدادات المحفوظة والخدمات الأخرى التي يستخدمها الموقع.',
    intro: 'يحتاج أذان گو إلى أقل قدر من المعلومات ليعمل، ولا يحفظ معلوماتك الشخصية على خادمه.',
    sections: [
      { h: 'الموقع', p: [
        'لا يُقرأ موقعك من المتصفح إلا بإذنك، ويُستخدم في المتصفح نفسه لحساب الأوقات والشهر. ولا يحفظه أذان گو على خادمه.'
      ] },
      { h: 'الإعدادات المحفوظة', p: [
        'لا تُحفظ الإعدادات (المكان وصوت الأذان واللغة والتشغيل التلقائي للأذان والدعاء والمظهر) إلا عند الضغط على زر الحفظ. والاستثناء الوحيد هو زيارتك الأولى: بعد إجابتك عن سؤال قراءة الموقع (سواء سمحتَ أم لا) تُحفظ لغة الصفحة كإعداد افتراضي، وإن سمحتَ يُحفظ مكانك أيضًا.',
        'تبقى هذه المعلومات في هذا المتصفح فقط لراحتك، ولا تُرسل إلى خادمنا، وتزول بمسح بيانات المتصفح.'
      ] },
      { h: 'خدمات أخرى', p: [
        'لعرض الخريطة ومعرفة اسم المدينة (والبلد عند الحاجة) يتصل متصفحك مباشرة بـ OpenStreetMap ويرسل إليه إحداثيات النقطة المختارة أو نص البحث. وإن لم تستجب هذه الخدمة تُرسل المعلومات نفسها إلى Photon (photon.komoot.io) وتُؤخذ صور الخريطة من CARTO. ولمعرفة المنطقة الزمنية تُرسل الإحداثيات إلى Open-Meteo أو timeapi.io. ولعرض السماء بحسب الطقس وتوقعات الغيوم ومدى الرؤية عند الأفق في بطاقة القمر تُرسل الإحداثيات إلى Open-Meteo، وإن لم يستجب فإلى MET Norway (api.met.no).',
        'تُحمَّل مكتبة الخريطة (Leaflet) من unpkg.com (أو من jsDelivr إن لم يكن متاحًا) والخطوط من Google Fonts. ولهذه الخدمات سياسات خصوصية خاصة بها ولا يتحكم بها أذان گو.'
      ] },
      { h: 'التواصل', p: [
        'للأسئلة حول الخصوصية: info.azangoo@gmail.com'
      ] }
    ],
    updated: 'آخر تحديث: أكتوبر 2026'
  }
};
