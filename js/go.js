/* /go/ : a direct link to the prayer times of one place, in one language, for other sites to use.
     /go/?city=Aurora&country=Canada&lang=fa      (or the exact point: /go/?lat=35.689&lng=51.389&lang=fa ; "long" and "lon" also work for lng)
   With a city it looks the place up (our own list per country first, the map search as a fallback) and sends the visitor to
   <lang>/index.html?lat=..&lng=..&city=..&cc=..&go=1  - the "go=1" makes the home page use this place instead of a saved one.
   Without a city it shows a small form that builds such a link. Data: data/go/index.json and data/go/<country>.json
   (made by tools/split-cities.js). The page is noindex and not in the sitemap. */
(function(){
  var LANGS=["fa","en","ur","ar"], NAMES={fa:"فارسی",en:"English",ur:"اردو",ar:"العربية"}, RTL={fa:1,ur:1,ar:1};
  var T={
    fa:{title:"ساخت لینک مستقیم اذان گو",intro:"شهر، کشور و زبان را انتخاب کنید و لینک را روی سایت خود بگذارید. هر کس روی لینک کلیک کند، مستقیم اوقات شرعی همان شهر را به همان زبان می‌بیند.",country:"کشور (به انگلیسی)",city:"شهر (به انگلیسی)",language:"زبان",link:"لینک شما",copy:"کپی",copied:"کپی شد",test:"امتحان لینک",wait:"در حال انتقال به اوقات شرعی…",nf:"این مکان پیدا نشد. به صفحهٔ اصلی بروید و آن را جستجو کنید.",home:"صفحهٔ اصلی",note:"اگر شهر در فهرست ما نباشد، با جستجوی نقشه پیدا می‌شود."},
    en:{title:"Direct link builder",intro:"Choose a city, a country and a language, then put the link on your site. Anyone who clicks it lands straight on the prayer times of that city, in that language.",country:"Country (in English)",city:"City (in English)",language:"Language",link:"Your link",copy:"Copy",copied:"Copied",test:"Test the link",wait:"Taking you to the prayer times…",nf:"We could not find this place. Go to the home page and search for it.",home:"Home page",note:"If the city is not in our list, it is found with the map search."},
    ur:{title:"براہِ راست لنک بنائیں",intro:"شہر، ملک اور زبان منتخب کریں اور لنک اپنی سائٹ پر لگائیں۔ جو بھی اس پر کلک کرے گا وہ سیدھا اسی شہر کے اوقاتِ نماز اسی زبان میں دیکھے گا۔",country:"ملک (انگریزی میں)",city:"شہر (انگریزی میں)",language:"زبان",link:"آپ کا لنک",copy:"کاپی",copied:"کاپی ہو گیا",test:"لنک آزمائیں",wait:"اوقاتِ نماز کی طرف منتقل کیا جا رہا ہے…",nf:"یہ جگہ نہیں ملی۔ مرکزی صفحے پر جا کر اسے تلاش کریں۔",home:"مرکزی صفحہ",note:"اگر شہر ہماری فہرست میں نہ ہو تو نقشے کی تلاش سے مل جاتا ہے۔"},
    ar:{title:"إنشاء رابط مباشر",intro:"اختر المدينة والدولة واللغة ثم ضع الرابط في موقعك. من ينقر عليه يصل مباشرة إلى مواقيت الصلاة لتلك المدينة وبتلك اللغة.",country:"الدولة (بالإنجليزية)",city:"المدينة (بالإنجليزية)",language:"اللغة",link:"رابطك",copy:"نسخ",copied:"تم النسخ",test:"جرّب الرابط",wait:"جارٍ الانتقال إلى مواقيت الصلاة…",nf:"لم يتم العثور على هذا المكان. انتقل إلى الصفحة الرئيسية وابحث عنه.",home:"الصفحة الرئيسية",note:"إذا لم تكن المدينة في قائمتنا فسيتم العثور عليها بالبحث في الخريطة."}
  };
  var ALIAS={usa:"us",america:"us",unitedstatesofamerica:"us",uk:"gb",england:"gb",britain:"gb",greatbritain:"gb",uae:"ae",emirates:"ae",holland:"nl",ksa:"sa"};
  var qs=new URLSearchParams(location.search), card=document.getElementById("goCard");
  var cityQ=(qs.get("city")||"").trim(), countryQ=(qs.get("country")||"").trim();
  var langQ=(qs.get("lang")||"").toLowerCase(), lat=parseFloat(qs.get("lat")), lng=parseFloat(qs.get("lng")||qs.get("long")||qs.get("lon"));

  function detect(){
    var l=((navigator.languages&&navigator.languages[0])||navigator.language||"en").toLowerCase().split("-")[0];
    return LANGS.indexOf(l)>=0?l:"en";
  }
  var ui=LANGS.indexOf(langQ)>=0?langQ:detect();
  function setUi(l){ui=l;document.documentElement.lang=l;document.documentElement.dir=RTL[l]?"rtl":"ltr";document.title=T[l].title}
  function norm(s){
    return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f\u064B-\u0652\u0640]/g,"")
      .replace(/[يى]/g,"ی").replace(/ك/g,"ک").replace(/[أإآ]/g,"ا").replace(/[^a-z0-9\u0600-\u06ff]/g,"");
  }
  function json(url){return fetch(url).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()})}
  function findCountry(list,q){
    var k=norm(q); if(!k)return null; k=ALIAS[k]||k;
    for(var i=0;i<list.length;i++){var c=list[i];
      if(norm(c[0])===k||norm(c[1])===k)return c;
      for(var j=2;j<6;j++)if(c[j]&&norm(c[j])===k)return c;
    }
    return null;
  }
  function findCity(rows,q){
    var k=norm(q), pre=null;
    if(!k)return null;
    for(var i=0;i<rows.length;i++){var r=rows[i];
      for(var j=0;j<4;j++){
        if(!r[j])continue;
        var parts=[r[j]].concat(r[j].split(/[،,(\-]/));
        for(var p=0;p<parts.length;p++){
          var n=norm(parts[p]);
          if(n===k)return r;
          if(!pre&&k.length>=3&&n.indexOf(k)===0)pre=r;
        }
      }
    }
    return pre;
  }
  function target(l,la,ln,name,cc){
    return l+"/index.html?lat="+la+"&lng="+ln+"&city="+encodeURIComponent(name||"")+(cc?"&cc="+cc:"")+"&go=1";
  }
  function fail(){
    card.innerHTML="<p>"+T[ui].nf+"</p><a class=\"btn\" href=\""+(LANGS.indexOf(langQ)>=0?langQ:ui)+"/\">"+T[ui].home+"</a>";
  }

  /* ---------- a link with a city: find the place and go ---------- */
  function resolve(){
    var l=LANGS.indexOf(langQ)>=0?langQ:ui;
    setUi(l);
    card.innerHTML="<p>"+T[l].wait+"</p>";
    if(isFinite(lat)&&isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180){
      location.replace(target(l,lat,lng,cityQ,"")); return;
    }
    var photon=function(){
      var q=cityQ+(countryQ?", "+countryQ:"");
      fetch("https://photon.komoot.io/api/?limit=1&q="+encodeURIComponent(q)).then(function(r){return r.json()}).then(function(d){
        var f=d&&d.features&&d.features[0];
        if(!f)return fail();
        var g=f.geometry.coordinates, p=f.properties||{};
        location.replace(target(l,g[1].toFixed(5),g[0].toFixed(5),cityQ||p.name,(p.countrycode||"").toUpperCase()));
      }).catch(fail);
    };
    json("data/go/index.json").then(function(list){
      var c=findCountry(list,countryQ);
      if(!c)return photon();
      return json("data/go/"+c[1]+".json").then(function(rows){
        var r=findCity(rows,cityQ);
        if(!r)return photon();
        var name=(l==="en"?r[0]:r[{fa:1,ur:2,ar:3}[l]])||r[0];      /* the place name in the language of the page */
        location.replace(target(l,r[4],r[5],name,c[0]));
      });
    }).catch(photon);
  }

  /* ---------- no city: the form that builds the link ---------- */
  function builder(){
    var countries=[],byName={};
    function draw(){
      var t=T[ui];
      card.innerHTML=
        "<select class=\"ui\" id=\"goUi\" aria-label=\"Language\">"+LANGS.map(function(x){return "<option value=\""+x+"\""+(x===ui?" selected":"")+">"+NAMES[x]+"</option>"}).join("")+"</select>"+
        "<h1>"+t.title+"</h1><p>"+t.intro+"</p>"+
        "<label for=\"goCountry\">"+t.country+"</label><input id=\"goCountry\" list=\"goCountries\" autocomplete=\"off\" dir=\"ltr\" placeholder=\"Canada\">"+
        "<datalist id=\"goCountries\">"+countries.map(function(c){return "<option value=\""+c[2]+"\">"}).join("")+"</datalist>"+
        "<label for=\"goCity\">"+t.city+"</label><input id=\"goCity\" list=\"goCities\" autocomplete=\"off\" dir=\"ltr\" placeholder=\"Aurora\"><datalist id=\"goCities\"></datalist>"+
        "<label for=\"goLang\">"+t.language+"</label><select id=\"goLang\">"+LANGS.map(function(x){return "<option value=\""+x+"\">"+NAMES[x]+"</option>"}).join("")+"</select>"+
        "<label for=\"goOut\">"+t.link+"</label><div class=\"row\"><input id=\"goOut\" readonly><button type=\"button\" id=\"goCopy\">"+t.copy+"</button></div>"+
        "<a class=\"btn test\" id=\"goTest\" target=\"_blank\" rel=\"noopener\" href=\"#\">"+t.test+"</a>"+
        "<p class=\"note\">"+t.note+"</p>";
      var ci=document.getElementById("goCountry"),ty=document.getElementById("goCity"),lg=document.getElementById("goLang"),
          out=document.getElementById("goOut"),cp=document.getElementById("goCopy"),ts=document.getElementById("goTest");
      lg.value=ui;
      function update(){
        var base=location.origin+location.pathname;
        var link=(ci.value.trim()&&ty.value.trim())?base+"?city="+encodeURIComponent(ty.value.trim())+"&country="+encodeURIComponent(ci.value.trim())+"&lang="+lg.value:"";
        out.value=link; ts.href=link||"#"; ts.style.visibility=link?"visible":"hidden";
      }
      ci.addEventListener("input",function(){
        var c=byName[norm(ci.value)];
        if(c)json("data/go/"+c[1]+".json").then(function(rows){
          document.getElementById("goCities").innerHTML=rows.slice(0,800).map(function(r){return "<option value=\""+r[0]+"\">"}).join("");
        }).catch(function(){});
        update();
      });
      ty.addEventListener("input",update); lg.addEventListener("change",update);
      cp.addEventListener("click",function(){
        if(!out.value)return;
        var done=function(){cp.textContent=T[ui].copied;setTimeout(function(){cp.textContent=T[ui].copy},1500)};
        if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(out.value).then(done,function(){out.select();document.execCommand("copy");done()});
        else{out.select();document.execCommand("copy");done()}
      });
      document.getElementById("goUi").addEventListener("change",function(e){setUi(e.target.value);draw()});
      update();
    }
    setUi(ui);
    json("data/go/index.json").then(function(list){
      countries=list.slice().sort(function(a,b){return a[2]<b[2]?-1:1});
      countries.forEach(function(c){byName[norm(c[2])]=c});
      draw();
    }).catch(draw);
  }

  if(cityQ||(isFinite(lat)&&isFinite(lng)))resolve(); else builder();
})();
