/* Copyright (c) 2026 azangoo.com. All rights reserved.
   Copying, reuse, modification or redistribution of this code, or of its calculations,
   is prohibited without written permission. See the Terms and conditions page. */
(function(){
  /* clock and dates: always the local time of the selected place.
     lastOffset (hours from UTC) starts as the device offset and is replaced when a place is found. */
  var lastOffset=-new Date().getTimezoneOffset()/60,shownDay="",onNewDay=null;
  var lastZone=null,zoneChecked=0;   /* IANA zone of the selected place: the offset is re-derived from it, so DST changes are never missed */
  var pad=function(n){return n<10?"0"+n:n};
  var clockEl=document.getElementById("clock"),zoneEl=document.getElementById("d-zone"),weekEl=document.getElementById("d-week");

  var fPersian=new Intl.DateTimeFormat("en-u-ca-persian-nu-latn",{year:"numeric",month:"numeric",day:"numeric",timeZone:"UTC"});
  var fHijri=new Intl.DateTimeFormat("en-u-ca-islamic-tbla-nu-latn",{year:"numeric",month:"numeric",day:"numeric",timeZone:"UTC"});
  var num=function(x){return window.AzanLang.num(x)};
  function partsOf(fmt,d){var p={};fmt.formatToParts(d).forEach(function(x){if(x.type!=="literal")p[x.type]=+x.value});return p}

  function showDate(prefix,day,month,year){
    document.getElementById(prefix+"-day").textContent=num(day);
    document.getElementById(prefix+"-my").textContent=month+" "+num(year);
  }
  function zoneLabel(h){
    var a=Math.abs(h),hh=Math.floor(a),mm=Math.round((a-hh)*60);
    return "UTC"+(h<0?"\u2212":"+")+hh+(mm?":"+pad(mm):"");
  }

  function tick(skipNewDay){
    if(lastZone&&window.AzangooPrayerTimes&&Date.now()-zoneChecked>30000){
      zoneChecked=Date.now();
      try{var zo=AzangooPrayerTimes.offsetAt(lastZone,Date.now());if(isFinite(zo))lastOffset=zo}catch(e){}
    }
    var A=window.AzanLang, d=new Date(Date.now()+lastOffset*3600000);
    clockEl.textContent=num(pad(d.getUTCHours())+":"+pad(d.getUTCMinutes())+":"+pad(d.getUTCSeconds()));
    zoneEl.textContent=A.t("clock_zone")+" \u00B7 "+num(zoneLabel(lastOffset));
    var key=d.getUTCFullYear()+"-"+d.getUTCMonth()+"-"+d.getUTCDate()+"-"+A.current(),first=!shownDay;
    if(key!==shownDay){
      shownDay=key;
      weekEl.textContent=A.names("weekdays")[d.getUTCDay()];
      var sh=partsOf(fPersian,d), hj=partsOf(fHijri,d);
      showDate("d-j",sh.day,A.names("shamsi")[sh.month-1],sh.year);
      showDate("d-h",hj.day,A.names("hijri")[hj.month-1],hj.year);
      showDate("d-g",d.getUTCDate(),A.names("greg")[d.getUTCMonth()],d.getUTCFullYear());
      if(!first&&!skipNewDay&&onNewDay)onNewDay();     /* a new day began at that place: recalculate the times */
    }
  }
  tick();
  setInterval(tick,1000);
  window.addEventListener("azan:langchange",function(){
    shownDay="";tick(true);paintTimes();showPlace();
    var pp=marker.getLatLng();
    latEl.value=window.AzanLang.num(pp.lat.toFixed(6));
    lngEl.value=window.AzanLang.num(pp.lng.toFixed(6));
    if(typeof updateQibla==="function")updateQibla();      /* Qibla sentence and map label follow the language */
    if(typeof qTag!=="undefined"&&qTag){
      qTag.setIcon(L.divIcon({className:"qibla-tag",html:"\uD83D\uDD4B "+window.AzanLang.t("qibla_tag"),iconSize:[76,26],iconAnchor:[38,13]}));
    }
  });

  /* the hint under the adhan player: one button ("more" / "less") shows or hides the extra advice about playing without a click */
  (function(){
    var btn=document.getElementById("autoMoreBtn"),more=document.getElementById("autoMore");
    if(!btn||!more)return;
    btn.addEventListener("click",function(){
      var open=more.hidden;                                   /* hidden now = will be open */
      more.hidden=!open;
      var key=open?"hint_less":"hint_more";
      btn.setAttribute("data-i18n",key);
      btn.textContent=window.AzanLang.t(key);
      btn.setAttribute("aria-expanded",open?"true":"false");
    });
  })();

  /* the small "?" buttons: each one opens its explanation (named in aria-controls) as a small popup next to the button,
     with a close button in its corner */
  (function(){
    var openBtn=null,openPop=null;
    function place(btn,pop){
      var r=btn.getBoundingClientRect(),vw=document.documentElement.clientWidth,vh=window.innerHeight,m=10;
      pop.style.maxWidth=Math.min(320,vw-2*m)+"px";
      var w=pop.offsetWidth,h=pop.offsetHeight;
      var left=r.left+r.width/2-w/2;                          /* centred on the button, kept inside the screen */
      left=Math.max(m,Math.min(left,vw-w-m));
      var top=r.bottom+8;
      if(top+h>vh-m&&r.top-h-8>m)top=r.top-h-8;               /* no room below: open above the button */
      top=Math.max(m,Math.min(top,vh-h-m));
      pop.style.left=left+"px";pop.style.top=top+"px";
    }
    function close(){
      if(!openPop)return;
      openPop.hidden=true;
      openBtn.setAttribute("aria-expanded","false");
      openBtn=openPop=null;
    }
    function open(btn,pop){
      close();
      pop.hidden=false;
      btn.setAttribute("aria-expanded","true");
      openBtn=btn;openPop=pop;
      place(btn,pop);
    }
    Array.prototype.forEach.call(document.querySelectorAll(".help-btn"),function(btn){
      var tip=document.getElementById(btn.getAttribute("aria-controls"));
      if(!tip)return;
      /* the popup: a box with a close button and the explanation; it lives in <body>, because its position is relative to the screen */
      var pop=document.createElement("div");
      pop.className="help-pop";pop.hidden=true;pop.setAttribute("role","tooltip");
      var x=document.createElement("button");
      x.type="button";x.className="help-close";x.textContent="\u00D7";
      var lbl=window.AzanLang.t("close_btn");
      x.setAttribute("aria-label",lbl);x.title=lbl;
      x.addEventListener("click",function(e){e.stopPropagation();var b=openBtn;close();if(b)b.focus();});
      tip.hidden=false;                                        /* the box itself is shown or hidden now, not the text inside it */
      pop.appendChild(x);pop.appendChild(tip);
      document.body.appendChild(pop);
      btn._pop=pop;
      btn.addEventListener("click",function(e){
        e.stopPropagation();
        if(openPop===pop)close();else open(btn,pop);
      });
    });
    document.addEventListener("click",function(e){            /* a tap anywhere else closes it */
      if(openPop&&!openPop.contains(e.target))close();
    });
    document.addEventListener("keydown",function(e){
      if(e.key==="Escape"&&openPop){var b=openBtn;close();b.focus();}
    });
    document.addEventListener("help-close",close);            /* sent when the row of the open explanation loses its data */
    window.addEventListener("resize",function(){ if(openPop)place(openBtn,openPop); });
    window.addEventListener("scroll",function(){ if(openPop)place(openBtn,openPop); },true);
  })();

  if(!window.L)return;

  /* map */
  var placed=false;                                    /* true once a place is chosen (saved, GPS, search, map or typed) */
  var fallback=[20,0];
  var map=L.map("map").setView(fallback,2);
  /* map tiles: OpenStreetMap first; when its tiles keep failing (server down, limit reached) the same map is drawn from the
     CARTO basemap, which is also made from OpenStreetMap data */
  /* on desktop the map changes its height with the columns; Leaflet must be told, or part of the map stays grey */
  if(window.ResizeObserver)new ResizeObserver(function(){ map.invalidateSize(); }).observe(document.getElementById("map"));
  var tilesMain=L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{
    maxZoom:19,attribution:"&copy; OpenStreetMap contributors"
  }).addTo(map);
  var tileOk=0, tileFail=0, tileBackup=false;
  tilesMain.on("tileload",function(){tileOk++});
  tilesMain.on("tileerror",function(){
    tileFail++;
    if(tileBackup||tileFail<3||tileFail<=tileOk)return;      /* a few lost tiles are normal; switch only when most fail */
    tileBackup=true;
    map.removeLayer(tilesMain);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",{
      subdomains:"abcd",maxZoom:19,attribution:"&copy; OpenStreetMap contributors &copy; CARTO"
    }).addTo(map);
  });
  var marker=L.marker(fallback,{draggable:true,opacity:0}).addTo(map);

  var latEl=document.getElementById("lat"),
      lngEl=document.getElementById("lng"),
      cityEl=document.getElementById("city"),
      msgEl=document.getElementById("msg");
  var NOMINATIM="https://nominatim.openstreetmap.org/", PHOTON="https://photon.komoot.io/";

  /* ---- finding a place by name or by point ----
     Nominatim (OpenStreetMap) first; when it fails (limit reached, server down, no answer in 7 seconds) or has nothing, Photon
     (photon.komoot.io, also OpenStreetMap data) is asked. Photon's answer is turned into the shape of a Nominatim answer, so the
     rest of the page does not care which one answered. A service that fails is skipped for 5 minutes. */
  var geoDownUntil={};
  function photonShape(f){
    var p=(f&&f.properties)||{}, c=(f&&f.geometry&&f.geometry.coordinates)||[];
    return {lat:c[1],lon:c[0],name:p.name||"",namedetails:{},
      address:{city:(p.type==="city"?p.name:p.city)||undefined,county:p.county,state:p.state,country_code:String(p.countrycode||"").toLowerCase()}};
  }
  function geoTry(list,empty){
    var i=0;
    function next(err){
      while(i<list.length){
        var s=list[i++];
        if(geoDownUntil[s.id]>Date.now())continue;
        return (function(s){
          return fetchJson(s.url).then(function(d){
            var r=s.conv(d);
            return s.miss(r)?next(err):r;                    /* an empty answer: ask the next service, the first is not marked as down */
          },function(e){ geoDownUntil[s.id]=Date.now()+300000; return next(e); });
        })(s);
      }
      return err?Promise.reject(err):Promise.resolve(empty);
    }
    return next();
  }
  function geoSearch(q,lang){
    return geoTry([
      {id:"nominatim",url:NOMINATIM+"search?format=jsonv2&limit=1&addressdetails=1&namedetails=1&accept-language="+encodeURIComponent(lang)+"&q="+encodeURIComponent(q),
       conv:function(d){return d||[]},miss:function(r){return !r.length}},
      {id:"photon",url:PHOTON+"api/?limit=1&q="+encodeURIComponent(q)+(lang==="en"?"&lang=en":""),
       conv:function(d){return ((d&&d.features)||[]).slice(0,1).map(photonShape)},miss:function(r){return !r.length}}
    ],[]);
  }
  function geoReverse(ll,lang,zoom){                          /* zoom 10 = the city; 3 = only the country is needed */
    return geoTry([
      {id:"nominatim",url:NOMINATIM+"reverse?format=jsonv2&zoom="+zoom+(zoom>5?"&namedetails=1":"&addressdetails=1")+"&accept-language="+encodeURIComponent(lang)+"&lat="+ll.lat+"&lon="+ll.lng,
       conv:function(d){return d&&!d.error?d:null},miss:function(r){return !r}},
      {id:"photon",url:PHOTON+"reverse?limit=1&lat="+ll.lat+"&lon="+ll.lng+(zoom>5?"&layer=city&layer=locality":"")+(lang==="en"?"&lang=en":""),
       conv:function(d){var f=d&&d.features&&d.features[0];return f?photonShape(f):null},miss:function(r){return !r}}
    ],null);
  }

  /* qibla: a line from the marker along the direction of the Kaaba */
  var KAABA=L.latLng(21.4225,39.8262),RAD=Math.PI/180;
  var qCase=L.polyline([],{color:"#0b2530",weight:8,opacity:.75}).addTo(map);
  var qLine=L.polyline([],{color:"#f0d58a",weight:4}).addTo(map);
  var qTag=L.marker(KAABA,{
    icon:L.divIcon({className:"qibla-tag",html:"\uD83D\uDD4B "+window.AzanLang.t("qibla_tag"),iconSize:[76,26],iconAnchor:[38,13]}),
    interactive:false,keyboard:false
  }).addTo(map);
  var qiblaEl=document.getElementById("qibla");

  function bearing(a,b){
    var f1=a.lat*RAD,f2=b.lat*RAD,dl=(b.lng-a.lng)*RAD;
    var y=Math.sin(dl)*Math.cos(f2),
        x=Math.cos(f1)*Math.sin(f2)-Math.sin(f1)*Math.cos(f2)*Math.cos(dl);
    return (Math.atan2(y,x)/RAD+360)%360;
  }
  function destination(a,brg,dist){
    var d=dist/6371008.8,t=brg*RAD,f1=a.lat*RAD,l1=a.lng*RAD;
    var f2=Math.asin(Math.sin(f1)*Math.cos(d)+Math.cos(f1)*Math.sin(d)*Math.cos(t));
    var l2=l1+Math.atan2(Math.sin(t)*Math.sin(d)*Math.cos(f1),Math.cos(d)-Math.sin(f1)*Math.sin(f2));
    return L.latLng(f2/RAD,((l2/RAD+540)%360)-180);
  }
  function updateQibla(){
    if(!placed){qiblaEl.textContent="";return}
    var p=marker.getLatLng(),b=bearing(p,KAABA);
    var bounds=map.getBounds();
    var len=map.distance(bounds.getNorthWest(),bounds.getNorthEast())*0.4;   /* 40% of the visible width */
    var end=p.distanceTo(KAABA)<len?KAABA:destination(p,b,len);
    qCase.setLatLngs([p,end]);
    qLine.setLatLngs([p,end]);
    qTag.setLatLng(end);
    qiblaEl.textContent=window.AzanLang.t("qibla",{deg:window.AzanLang.num(Math.round(b))});
  }

  function say(t){msgEl.textContent=t||""}

  /* Country of the selected place, used only for official months that are limited to some countries ("regions" in
     data/official-months.json). Nothing is requested when the file has no such months. A place whose country cannot
     be found uses the site's own prediction. */
  var regionSeq=0, regionCache={};
  function regionKey(ll){return ll.lat.toFixed(1)+","+ll.lng.toFixed(1)}
  function rememberRegion(ll,cc){if(cc)regionCache[regionKey(ll)]=String(cc).toUpperCase()}
  function findRegion(ll){
    var O=window.AzanOfficial;
    if(!O||!O.needsRegion)return;
    O.onReady(function(){
      var id=++regionSeq;
      if(!O.needsRegion()){O.setRegion(null);return}
      var cc=regionCache[regionKey(ll)];
      if(cc){O.setRegion(cc);return}
      O.setRegion(null);                                    /* unknown until the lookup answers */
      geoReverse(ll,"en",3)
        .then(function(d){
          if(id!==regionSeq)return;                         /* a newer place replaced this one */
          var c=d&&d.address&&d.address.country_code;
          if(c){rememberRegion(ll,c);O.setRegion(c)}
        })
        .catch(function(){});
    });
  }

  function setPos(ll,zoom){
    resetPlayback();                                        /* a new place: whatever adhan or dua is playing stops and starts over for the new place */
    placed=true;
    findRegion(ll);
    marker.setOpacity(1);
    marker.setLatLng(ll);
    if(zoom)map.setView(ll,zoom);
    latEl.value=window.AzanLang.num(ll.lat.toFixed(6));
    lngEl.value=window.AzanLang.num(ll.lng.toFixed(6));
    updateQibla();
    showPlace();
    recalc();
  }

  /* find the city name for a point */
  /* name of a found place in the language of the page: the place's own name in that language first (namedetails),
     then the address parts that the lookup returned in that language */
  function placeName(d,fallback){
    var L=window.AzanLang.current(), nd=(d&&d.namedetails)||{}, a=(d&&d.address)||{};
    return nd["name:"+L]||a.city||a.town||a.village||a.county||a.state||fallback||"";
  }

  /* the search box is emptied, then filled with the name that was found, in the language of the page */
  var qEl=document.getElementById("q"), revSeq=0;
  function reverse(ll,toSearchBox,done){
    var id=++revSeq;
    if(toSearchBox)qEl.value="";
    geoReverse(ll,window.AzanLang.current(),10)
      .then(function(d){
        if(id!==revSeq)return;                              /* a newer place replaced this one */
        var name=placeName(d,"");
        cityEl.value=name;
        if(toSearchBox)qEl.value=name;
        if(done)done(name);
        showPlace();
      })
      .catch(function(){});
  }

  /* when the language is changed, the place name is read again in the new language */
  window.addEventListener("azan:langchange",function(){
    if(!placed)return;
    var old=cityEl.value, ll=marker.getLatLng(), sameInBox=(qEl.value&&qEl.value===old);
    reverse(ll,false,function(name){ if(sameInBox)qEl.value=name; });
  });

  /* double click on the map or drag the marker */
  marker.on("drag",updateQibla);
  map.on("zoomend resize",updateQibla);
  updateQibla();
  map.doubleClickZoom.disable();          /* double click now picks a place instead of zooming */
  map.on("dblclick",function(e){setPos(e.latlng);reverse(e.latlng,true)});
  marker.on("dragend",function(){var ll=marker.getLatLng();setPos(ll);reverse(ll,true)});

  /* the verse slideshow (js/ayah.js) lies over the map; using the search or the GPS button brings the map back */
  function showMapNow(){ if(window.AzanStage)window.AzanStage.showMap(); }

  /* search box */
  document.getElementById("searchForm").addEventListener("submit",function(e){
    e.preventDefault();
    var q=document.getElementById("q").value.trim();
    if(!q)return;
    showMapNow();
    say(window.AzanLang.t("searching"));
    geoSearch(q,window.AzanLang.current())
      .then(function(list){
        if(!list||!list.length){say(window.AzanLang.t("not_found"));return}
        var p=list[0],ll=L.latLng(parseFloat(p.lat),parseFloat(p.lon)),a=p.address||{};
        rememberRegion(ll,a.country_code);
        setPos(ll,14);
        cityEl.value=placeName(p,p.name||q);
        showPlace();
        say("");
      })
      .catch(function(){say(window.AzanLang.t("search_failed"))});
  });

  /* ---- prayer times (js/azangoo-prayer-times.js) ---- */
  var timeEls={},placeEl=document.getElementById("place");
  Array.prototype.forEach.call(document.querySelectorAll("[data-t]"),function(e){timeEls[e.getAttribute("data-t")]=e});
  var seq=0,lastTimes=null;
  function paintTimes(){
    if(!lastTimes)return;
    for(var k in timeEls)timeEls[k].textContent=window.AzanLang.num(lastTimes[k]);
    markNext();
  }

  function showPlace(){
    var A=window.AzanLang, p=marker.getLatLng();
    if(!placed){placeEl.textContent=A.t("pick_place");return}
    var ns=p.lat>=0?A.t("dir_n"):A.t("dir_s"), ew=p.lng>=0?A.t("dir_e"):A.t("dir_w");
    placeEl.textContent=(cityEl.value?cityEl.value+" \u00B7 ":"")+
      A.num(Math.abs(p.lat).toFixed(4))+" "+ns+", "+A.num(Math.abs(p.lng).toFixed(4))+" "+ew;
  }

  /* zone name and current UTC offset of the selected point.
     Tries Open-Meteo, then timeapi.io (both free, no key). A service that fails is skipped for 5 minutes. */
  function fetchJson(url){
    var ctl=window.AbortController?new AbortController():null;
    var timer=setTimeout(function(){if(ctl)ctl.abort()},7000);
    return fetch(url,ctl?{signal:ctl.signal}:{}).then(function(r){
      clearTimeout(timer);
      if(!r.ok)throw new Error("http "+r.status);
      return r.json();
    },function(err){clearTimeout(timer);throw err});
  }

  var zoneServices=[
    {
      name:"open-meteo",
      url:function(ll){return "https://api.open-meteo.com/v1/forecast?latitude="+ll.lat.toFixed(4)+"&longitude="+ll.lng.toFixed(4)+"&daily=sunrise&forecast_days=1&timezone=auto"},
      parse:function(d){
        if(typeof d.utc_offset_seconds!=="number"||!d.timezone)throw new Error("no zone");
        return {h:d.utc_offset_seconds/3600,zone:d.timezone};
      }
    },
    {
      name:"timeapi",
      url:function(ll){return "https://timeapi.io/api/TimeZone/coordinate?latitude="+ll.lat.toFixed(4)+"&longitude="+ll.lng.toFixed(4)},
      parse:function(d){
        if(!d.timeZone)throw new Error("no zone");
        var h=d.currentUtcOffset&&typeof d.currentUtcOffset.seconds==="number"?d.currentUtcOffset.seconds/3600:null;
        return {h:h,zone:d.timeZone};
      }
    }
  ];
  var zoneDownUntil={};

  /* resolves {h, zone, ok}; zone is null when only the device offset is known */
  function getOffset(ll){
    var i=0;
    function next(){
      if(i>=zoneServices.length)return Promise.resolve({h:-new Date().getTimezoneOffset()/60,zone:null,ok:false});
      var s=zoneServices[i++];
      if(zoneDownUntil[s.name]>Date.now())return next();
      return fetchJson(s.url(ll))
        .then(function(d){var r=s.parse(d);return {h:r.h,zone:r.zone,ok:true}})
        .catch(function(){zoneDownUntil[s.name]=Date.now()+300000;return next()});
    }
    return next();
  }

  function ymd(ms){var d=new Date(ms);return {year:d.getUTCFullYear(),month:d.getUTCMonth()+1,day:d.getUTCDate()}}

  var zoneKnown=false, lastRecalc=0;
  function recalc(){
    if(!window.AzangooPrayerTimes)return;
    if(!placed){for(var k0 in timeEls)timeEls[k0].textContent="—";lastTimes=null;return}
    var ll=marker.getLatLng(),id=++seq;
    getOffset(ll).then(function(o){
      if(id!==seq)return;                                   /* a newer position replaced this one */
      lastZone=o.zone||null;zoneChecked=Date.now();
      if(o.zone&&window.AzangooPrayerTimes){                /* the zone name is exact; the service's offset number may be stale or wrong */
        try{var zr=AzangooPrayerTimes.offsetAt(o.zone,Date.now());if(isFinite(zr))o.h=zr}catch(e){}
      }
      var r;
      try{
        r=AzangooPrayerTimes.calculateForNow({
          latitude:ll.lat,longitude:ll.lng,zoneName:o.zone,fallbackOffsetHours:o.h,now:Date.now()
        });
      }catch(err){say(window.AzanLang.t("calc_fail"));return}
      lastTimes={fajr:r.fajr,fajrNext:r.nextfajr,sunrise:r.sunrise,dhuhr:r.dhuhr,sunset:r.sunset,
                 maghrib:r.maghrib,midnight:r.midnight,fajrNext:r.nextfajr};
      lastOffset=o.h;
      zoneKnown=!!o.ok;
      lastRecalc=Date.now();
      paintTimes();
      markNext();
      updateMoonSky();
      loadWeather(ll);                                      /* asynchronous: the sky is already drawn, the weather is added when it arrives */
      updateSkyOutlook();                                   /* the forecast of this place may already be here (asked less than 15 minutes ago) */
      if(window.MoonInfo)MoonInfo.update(ll.lat,ll.lng,o.h);
      window.AzanPlace={latitude:ll.lat,longitude:ll.lng,zoneName:o.zone,fallbackOffsetHours:o.h};
      tick(true);
      if(!o.ok)say(window.AzanLang.t("zone_fallback"));
    });
  }

  /* highlight the next adhan (fajr, dhuhr, maghrib, then tomorrow's fajr),
     using the local time of the selected place */
  var adhans=["fajr","dhuhr","maghrib","fajrNext"];
  function toMin(s){var m=/^(\d{1,2}):(\d\d)$/.exec(s);return m?(+m[1])*60+(+m[2]):null}
  function markNext(){
    if(!lastTimes)return;
    var n=new Date(Date.now()+lastOffset*3600000),now=n.getUTCHours()*60+n.getUTCMinutes();
    var prev=-1,next=null;
    adhans.forEach(function(k){
      var m=toMin(lastTimes[k]);
      if(m===null)return;
      while(m<prev)m+=1440;                 /* tomorrow's fajr comes after maghrib */
      prev=m;
      if(next===null&&m>now)next=k;
    });
    for(var k in timeEls)timeEls[k].parentNode.classList.toggle("next",k===next);
  }
  setInterval(markNext,30000);

  /* the sky behind the moon picture: sunrise, day, sunset or night, by the local time of the selected place.
     "sunrise" and "sunset" last SKY_SPAN minutes before and after the real sunrise / sunset (not the maghrib adhan). */
  var SKY_SPAN=30;
  function skyState(now,sr,ss){
    if(ss<sr)ss+=1440;                                      /* sunset after midnight (far north or south) */
    for(var d=-1440;d<=1440;d+=1440){
      var n=now+d;
      if(Math.abs(n-sr)<=SKY_SPAN)return "sunrise";
      if(Math.abs(n-ss)<=SKY_SPAN)return "sunset";
      if(n>sr+SKY_SPAN&&n<ss-SKY_SPAN)return "day";
    }
    return "night";
  }
  function updateMoonSky(){
    var box=document.querySelector(".moon");
    if(!box)return;
    var sr=lastTimes?toMin(lastTimes.sunrise):null, ss=lastTimes?toMin(lastTimes.sunset):null;
    if(sr===null||ss===null){box.setAttribute("data-sky","night");box.removeAttribute("data-wx");return}   /* no place or no sunrise / sunset: the starry sky */
    var n=new Date(Date.now()+lastOffset*3600000);
    box.setAttribute("data-sky",skyState(n.getUTCHours()*60+n.getUTCMinutes(),sr,ss));
    /* the weather picture (partly / cloudy / fog / rain / snow / storm) is added on top of the sky state; clear weather,
       an unknown weather or a weather of another place keeps the plain sky of the line above */
    var wx=wxPicture();
    if(wx&&wx!=="clear")box.setAttribute("data-wx",wx); else box.removeAttribute("data-wx");
  }
  /* the weather of the picture comes from the same hourly forecast as the "cloud tonight" line (the hour that is now):
     rain, snow, storm and fog come from the weather code of that hour; clear / partly / cloudy come from its cloud cover,
     with the same limits as the words of the card (under 25% clear, up to 60% partly cloudy, above that cloudy).
     Without an hourly forecast the weather code of this moment is used. */
  function wxPicture(){
    var h=wxHours.length?hourAt(Date.now()):null;
    if(!h)return wxNow;
    var k=h.wx;
    if(k&&k!=="clear"&&k!=="partly"&&k!=="cloudy")return k;
    if(h.cloud!==null)return h.cloud<25?"clear":(h.cloud<=60?"partly":"cloudy");
    return k||wxNow;
  }

  /* ---- weather for the sky picture ----
     After the sky has been drawn, the weather of the selected place is asked from two free services that need no key:
     1) Open-Meteo, 2) MET Norway (api.met.no). The second one is asked only if the first gave nothing usable.
     If neither gives a value, nothing changes and the sky stays as it was. A service that fails is skipped for 5 minutes. */
  var wxNow=null, wxKey="", wxAt=0, wxSeq=0, wxDownUntil={}, wxHours=[];   /* wxHours: hourly cloud cover (%) and visibility (m) of the place */
  function wxFromWmo(c){                                    /* WMO weather code of Open-Meteo */
    if(typeof c!=="number")return null;
    if(c===0||c===1)return "clear";
    if(c===2)return "partly";
    if(c===3)return "cloudy";
    if(c===45||c===48)return "fog";
    if(c>=95&&c<=99)return "storm";
    if((c>=71&&c<=77)||c===85||c===86)return "snow";
    if((c>=51&&c<=67)||(c>=80&&c<=82))return "rain";
    return null;
  }
  function wxFromMet(sym){                                  /* symbol_code of MET Norway, e.g. "lightrain_day" */
    if(typeof sym!=="string")return null;
    sym=sym.replace(/_(day|night|polartwilight)$/,"");
    if(/thunder/.test(sym))return "storm";
    if(/snow/.test(sym))return "snow";
    if(/sleet|rain|drizzle|shower/.test(sym))return "rain";
    if(sym==="fog")return "fog";
    if(sym==="cloudy")return "cloudy";
    if(sym==="partlycloudy")return "partly";
    if(sym==="clearsky"||sym==="fair")return "clear";
    return null;
  }
  var wxServices=[
    {
      name:"open-meteo",
      url:function(ll){return "https://api.open-meteo.com/v1/forecast?latitude="+ll.lat.toFixed(4)+"&longitude="+ll.lng.toFixed(4)+"&current=weather_code&hourly=cloud_cover,visibility,weather_code&forecast_days=2&timezone=auto"},
      parse:function(d){return wxFromWmo(d&&d.current&&d.current.weather_code)},
      hours:function(d){                                    /* local times of the place -> real time (ms) */
        var h=d&&d.hourly, off=(d&&+d.utc_offset_seconds)||0, out=[];
        if(!h||!h.time)return out;
        var cc=h.cloud_cover||[], vv=h.visibility||[], wc=h.weather_code||[];
        for(var i=0;i<h.time.length;i++){
          var t=Date.parse(h.time[i]+"Z")-off*1000;
          if(isFinite(t))out.push({t:t,cloud:typeof cc[i]==="number"?cc[i]:null,vis:typeof vv[i]==="number"?vv[i]:null,wx:wxFromWmo(wc[i])});
        }
        return out;
      }
    },
    {
      name:"met-no",
      url:function(ll){return "https://api.met.no/weatherapi/locationforecast/2.0/compact?lat="+ll.lat.toFixed(4)+"&lon="+ll.lng.toFixed(4)},
      parse:function(d){
        var t=d&&d.properties&&d.properties.timeseries&&d.properties.timeseries[0], x=t&&t.data, sym=null;
        ["next_1_hours","next_6_hours","next_12_hours"].forEach(function(k){
          if(sym===null&&x&&x[k]&&x[k].summary)sym=x[k].summary.symbol_code;
        });
        return wxFromMet(sym);
      },
      hours:function(d){                                    /* MET Norway has no visibility, only the cloud cover */
        var ts=d&&d.properties&&d.properties.timeseries, out=[];
        (ts||[]).forEach(function(x){
          var t=Date.parse(x.time), c=x.data&&x.data.instant&&x.data.instant.details&&x.data.instant.details.cloud_area_fraction;
          var sy=x.data&&x.data.next_1_hours&&x.data.next_1_hours.summary&&x.data.next_1_hours.summary.symbol_code;
          if(isFinite(t)&&typeof c==="number")out.push({t:t,cloud:c,vis:null,wx:wxFromMet(sy)});
        });
        return out;
      }
    }
  ];
  function loadWeather(ll){
    var key=ll.lat.toFixed(1)+","+ll.lng.toFixed(1);
    if(key===wxKey&&Date.now()-wxAt<15*60*1000)return;       /* same place, asked less than 15 minutes ago */
    if(key!==wxKey){wxNow=null;wxHours=[];updateMoonSky();updateSkyOutlook()}              /* another place: the old weather is not shown for it */
    wxKey=key;wxAt=Date.now();
    var id=++wxSeq, i=0;
    function next(){
      if(id!==wxSeq)return;                                  /* a newer place replaced this one */
      if(i>=wxServices.length){wxAt=0;return}                /* nothing usable: the sky stays as it is, and the next calculation asks again */
      var s=wxServices[i++];
      if(wxDownUntil[s.name]>Date.now())return next();
      fetchJson(s.url(ll)).then(function(d){
        var w=s.parse(d);
        if(!w)throw new Error("no weather");
        if(id!==wxSeq)return;
        wxNow=w;try{wxHours=s.hours?s.hours(d):[]}catch(e){wxHours=[]}updateMoonSky();updateSkyOutlook();
      }).catch(function(){wxDownUntil[s.name]=Date.now()+300000;next()});
    }
    next();
  }
  setInterval(function(){updateMoonSky();updateSkyOutlook()},30000);
  window.addEventListener("azan:langchange",function(){updateMoonSky();updateSkyOutlook()});
  /* the page stays open: the weather (picture and sentence) is asked again every 30 minutes */
  setInterval(function(){ if(placed){wxAt=0;loadWeather(marker.getLatLng())} },30*60*1000);

  /* ---- sky outlook in the moon card ----
     from the hourly forecast of the place: the cloud cover at sunset (only on the evenings that matter for the new crescent,
     the 29th and 30th of the Hijri month), the visibility at the horizon at sunset, and the average cloud cover tonight until midnight.
     It is only a weather forecast: the crescent ruling is not changed by it. */
  function hourAt(t){                                        /* the forecast hour nearest to time t (ms), within 45 minutes */
    var best=null,bd=45*60000+1;
    wxHours.forEach(function(h){var dd=Math.abs(h.t-t); if(dd<bd){bd=dd;best=h}});
    return best;
  }
  /* horizon visibility at sunset (km) with its "?" explanation: the last row of the "Moon right now" tab.
     Not every weather source gives visibility (MET Norway does not): then the row stays hidden. */
  function setHoriz(h){
    var dt=document.getElementById("mHorizDt"), dd=document.getElementById("mHoriz");
    if(!dt||!dd)return;
    var A=window.AzanLang;
    if(!h||h.vis===null||h.vis===undefined||!isFinite(h.vis)){
      if(!dt.hidden){dt.hidden=true;dd.hidden=true;document.dispatchEvent(new Event("help-close"))}
      return;
    }
    var km=h.vis/1000, kmTxt=km>=10?String(Math.round(km)):String(Math.round(km*10)/10);
    var k=km>=15?"good":(km>=6?"mid":"bad");
    dd.textContent=A.num(kmTxt)+" "+A.t("sky_km")+" \u2014 "+A.t("sky_v_"+k);
    dd.style.direction="inherit";dd.style.textAlign="left";   /* this row is a sentence, not a bare number: the words follow the page direction but the line starts at the same left edge as the numbers above it */
    dt.hidden=false;dd.hidden=false;
  }
  function updateSkyOutlook(){
    var box=document.getElementById("moonSky");
    if(!box)return;
    var A=window.AzanLang, sS=document.getElementById("skySunset"), sNote=document.getElementById("skyNote");
    sS.textContent="";sNote.textContent="";
    var sm=lastTimes?toMin(lastTimes.sunset):null;
    if(sm===null||!wxHours.length){box.hidden=true;setHoriz(null);return}
    var d=new Date(Date.now()+lastOffset*3600000);
    var midnight=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())-lastOffset*3600000;   /* local midnight, real time */
    var sunsetT=midnight+sm*60000, endT=midnight+86400000, now=Date.now();
    var h=hourAt(sunsetT);
    var mi=window.MoonInfo&&window.MoonInfo.current?window.MoonInfo.current():null;
    /* 1) cloud at sunset: only on the evenings of the 29th and 30th, when the new crescent is looked for (in the "more info" part) */
    if(h&&h.cloud!==null&&mi&&mi.hijriDay>=29){
      var c=Math.round(h.cloud), k=c<25?"good":(c<=60?"mid":"bad");
      sS.textContent=A.t("sky_sunset",{c:A.percent(String(c)),v:A.t("sky_s_"+k)});
      sNote.textContent=A.t("sky_note");
    }
    box.hidden=!sS.textContent;        /* only the cloud at sunset (29th/30th) is in this box */
    setHoriz(h);                        /* horizon visibility at sunset: last row of the "Moon right now" tab */
  }

  /* countdown to the next adhan (fajr, dhuhr, maghrib, tomorrow's fajr) */
  var cdEl=document.getElementById("countdown");
  var COUNT=[["fajr","adhan_fajr"],["dhuhr","adhan_dhuhr"],["maghrib","adhan_maghrib"],["fajrNext","adhan_fajr_next"]];
  /* tells the hadith bar which adhan is next, so it can show the "adhan is near" alert */
  var alertPrev=null,startedKey="",startedAt=0;
  function emitNext(d){try{window.dispatchEvent(new CustomEvent("azan:nextadhan",{detail:d}))}catch(e){}}
  function updateCountdown(){
    if(!lastTimes||!cdEl)return;
    markNext();                                      /* highlight moves to the next adhan the moment one starts */
    var d=new Date(Date.now()+lastOffset*3600000);
    var nowS=d.getUTCHours()*3600+d.getUTCMinutes()*60+d.getUTCSeconds();
    var prev=-1,next=null,nextS=0;
    COUNT.forEach(function(x){
      var m=toMin(lastTimes[x[0]]);
      if(m===null)return;
      var s=m*60;
      while(s<prev)s+=86400;                         /* after maghrib, tomorrow's fajr comes next */
      prev=s;
      if(next===null&&s>nowS){next=x;nextS=s}
    });
    /* while the adhan is playing (from its start or from the middle) the line says so;
       the moment it ends, the countdown to the next adhan comes back */
    var playing=!!(player&&!player.paused&&!player.ended);
    var A=window.AzanLang, rem=next?nextS-nowS:0;
    /* the target changes the moment an adhan time arrives: remember WHICH adhan it was, so the alert says "it is time" for that
       one (not for the next one), for the few seconds after it and for as long as the adhan plays (at most 10 minutes) */
    if(next&&alertPrev&&alertPrev.key!==next[0]&&alertPrev.rem<=5){startedKey=alertPrev.key;startedAt=Date.now()}
    if(next)alertPrev={key:next[0],rem:rem};
    var since=Date.now()-startedAt;
    if(startedKey&&since<10*60*1000&&(playing||since<8000))emitNext({now:true,key:startedKey});
    else if(next)emitNext({key:next[0],rem:rem});
    else emitNext({rem:-1});
    if(playing){cdEl.textContent=A.t("adhan_now");return}
    if(!next){cdEl.textContent="";return}
    cdEl.textContent=A.t("countdown",{
      name:A.t(next[1]),
      h:A.num(Math.floor(rem/3600)),
      m:A.num(Math.floor(rem%3600/60)),
      s:A.num(rem%60)
    });
  }
  setInterval(function(){
    if(!placed)return;
    if(!zoneKnown||Date.now()-lastRecalc>300000)recalc();
  },60000);
  /* when the whole page (fonts, map, scripts) has finished loading, calculate once more */
  window.addEventListener("load",function(){
    if(placed)recalc();
  });
  document.addEventListener("visibilitychange",function(){
    if(!document.hidden&&placed)recalc();
  });
  setInterval(updateCountdown,1000);
  updateCountdown();
  window.addEventListener("azan:langchange",updateCountdown);

  /* Ramadan (Hijri month 9): countdown to the end of suhur (Fajr) and iftar (maghrib), with an optional reminder */
  var ramBox=document.getElementById("ramadanBox"),
      ramSuhur=document.getElementById("ramSuhur"),
      ramIftar=document.getElementById("ramIftar"),
      ramRemind=document.getElementById("ramRemind"),
      ramMsg=document.getElementById("ramMsg");
  var ramFired={};
  function nextAt(hm,nowS){                       /* next time of day (seconds) after nowS */
    var m=toMin(hm);
    if(m===null)return null;
    var s=m*60;
    while(s<=nowS)s+=86400;
    return s;
  }
  function hms(rem){
    var A=window.AzanLang;
    return {h:A.num(Math.floor(rem/3600)),m:A.num(Math.floor(rem%3600/60)),s:A.num(rem%60)};
  }
  function remindOnce(key,text){
    if(ramFired[key])return;
    ramFired[key]=true;
    ramMsg.textContent=text;
    if(window.Notification&&Notification.permission==="granted"){
      try{new Notification(text,{icon:"images/logo-azangoo-120.png"})}catch(e){}
    }
  }
  function updateRamadan(){
    if(!ramBox||!lastTimes){if(ramBox)ramBox.hidden=true;return}
    var A=window.AzanLang, d=new Date(Date.now()+lastOffset*3600000);
    var ramadan=hijriMonthOf(d)===9;
    ramBox.hidden=!ramadan;
    if(!ramadan)return;
    var nowS=d.getUTCHours()*3600+d.getUTCMinutes()*60+d.getUTCSeconds();
    var sT=nextAt(lastTimes.fajr,nowS), iT=nextAt(lastTimes.maghrib,nowS);   /* suhur ends at the Fajr adhan */
    if(sT!==null)ramSuhur.textContent=A.t("ram_suhur",hms(sT-nowS));
    if(iT!==null)ramIftar.textContent=A.t("ram_iftar",hms(iT-nowS));
    if(!ramRemind.checked)return;
    var day=d.getUTCFullYear()+"-"+d.getUTCMonth()+"-"+d.getUTCDate();
    if(sT!==null&&sT-nowS<=600)remindOnce(day+"-suhur",A.t("ram_remind_suhur"));
    if(iT!==null&&iT-nowS<=600&&iT-nowS>0)remindOnce(day+"-iftar10",A.t("ram_remind_iftar"));
    var mS=toMin(lastTimes.maghrib);
    if(mS!==null&&nowS>=mS*60&&nowS<mS*60+60)remindOnce(day+"-iftar",A.t("ram_iftar_now"));
  }
  if(ramRemind){
    ramRemind.addEventListener("change",function(){
      var A=window.AzanLang;
      if(!ramRemind.checked){ramMsg.textContent="";return}
      if(window.Notification&&Notification.permission==="default")Notification.requestPermission();
      ramMsg.textContent=(window.Notification&&Notification.permission==="granted")?"":A.t("ram_no_notif");
    });
  }
  /* daily dua before the adhan: data/doa.json says which Hijri months have it (daily = "1");
     the file for the weekday is played so that it ends one second before the adhan.
     The adhan itself is played by the normal adhan check at its minute. */
  var DUA_FILES=["audio/doa/doa-sun.mp3","audio/doa/doa-mon.mp3","audio/doa/doa-tue.mp3","audio/doa/doa-wed.mp3",
                 "audio/doa/doa-thu.mp3","audio/doa/doa-fri.mp3","audio/doa/doa-sat.mp3"];   /* index = getDay() */
  var doaList=null, doaFired={};
  var playEpoch=0;                                           /* raised when the place changes; late callbacks of the old playback check it */
  /* new place (search, map, GPS, typed coordinates): stop the adhan and every dua that is playing, forget what was already
     played today, and wait for the new times, so everything is judged again for the new place */
  function resetPlayback(){
    playEpoch++;
    try{
      [typeof player!=="undefined"?player:null,dailyPlayer,ramPlayer,typeof duaPlayer!=="undefined"?duaPlayer:null].forEach(function(a){
        if(!a)return;
        a.pause();
        try{a.currentTime=0}catch(e){}
        a.muted=false;
      });
    if(typeof mutedAuto!=="undefined")mutedAuto=false;
    ramMutedAuto=false; ramChain=false; ramCur=null;
    RAM_LIST.forEach(function(S){S.busy=false});
    doaFired={};
    if(typeof played!=="undefined")played="";
    if(typeof pendingAfter!=="undefined")pendingAfter=null;
    if(typeof adhanMsg!=="undefined"&&adhanMsg)adhanMsg.textContent="";
    }catch(e){}
    lastTimes=null;                                          /* the checks wait until the times of the new place are ready */
  }
  var dailyPlayer=new Audio();
  dailyPlayer.preload="auto";
  var nextDuaPlayer=new Audio();
  nextDuaPlayer.preload="metadata";

  /* Ramadan duas (flag "ramadan" per Hijri month in data/doa.json). Each kind has a folder of files that are played one after
     another in the order of their names, and the last file ends 1 second before the adhan:
       sahar = before the fajr adhan,  iftar = before the maghrib adhan.
     There is a folder for Persian pages (fa) and one for all other languages (ar):
       audio/doa/ramadan/dua-sahar-fa, dua-sahar-ar, dua-eftar-fa, dua-eftar-ar
     Where the flag is on, the Ramadan dua replaces the daily dua before fajr and before maghrib (dhuhr keeps the daily dua).
     The lengths (seconds) are listed here so that the start time is known before the browser has loaded the files; the real
     length is used as soon as the browser reports it. When a file is added or replaced, its length must be changed here too.
     One player plays a whole set; the other audio objects only read the lengths (and warm the cache shortly before the start).
     A person who arrives in the middle hears the rest, from that point. */
  var RAM_POOL={
    sahar:{fa:{dir:"audio/doa/ramadan/dua-sahar-fa/",files:[["Dua-Sahar-A.mp3",317.44],["Dua-Sahar-B.mp3",292.467],["Dua-Sahar-C.mp3",234.005],["Dua-Sahar-D.mp3",334.472],["Dua-Sahar-E.mp3",298.58],["Dua-Sahar-F.mp3",5.695],["Dua-Sahar-G.mp3",319.425],["Dua-Sahar-H.mp3",404.01]]},
           ar:{dir:"audio/doa/ramadan/dua-sahar-ar/",files:[["Dua-Sahar-ar-501.mp3",43.285],["Dua-Sahar-ar-502.mp3",181.29],["Dua-Sahar-ar-503.mp3",120.398],["Dua-Sahar-ar-504.mp3",120.895],["Dua-Sahar-ar-505.mp3",125.179],["Dua-Sahar-ar-506.mp3",126.798],["Dua-Sahar-ar-507.mp3",77.871]]}},
    iftar:{fa:{dir:"audio/doa/ramadan/dua-eftar-fa/",files:[["Dua-Eftar-A.mp3",62.433],["Dua-Eftar-B.mp3",164.441],["Dua-Eftar-C.mp3",134.635],["Dua-Eftar-D.mp3",158.093],["Dua-Eftar-E.mp3",135.393],["Dua-Eftar-F.mp3",56.764],["Dua-Eftar-G.mp3",143.099],["Dua-Eftar-H.mp3",78.811],["Dua-Eftar-I.mp3",69.721]]},
           ar:{dir:"audio/doa/ramadan/dua-eftar-ar/",files:[["Dua-Eftar-ar-601.mp3",159.843],["Dua-Eftar-ar-602.mp3",158.772],["Dua-Eftar-ar-603.mp3",164.376],["Dua-Eftar-ar-604.mp3",152.372],["Dua-Eftar-ar-605.mp3",133.277],["Dua-Eftar-ar-606.mp3",139.154],["Dua-Eftar-ar-607.mp3",78.89],["Dua-Eftar-ar-608.mp3",69.721]]}}
  };
  var RAM_SETS={
    sahar:{name:"sahar",kind:"fajr",timerKey:"dua_timer_sahar",files:[],fallback:[]},
    iftar:{name:"iftar",kind:"maghrib",timerKey:"dua_timer_iftar",files:[],fallback:[]}
  };
  var RAM_LIST=[RAM_SETS.sahar,RAM_SETS.iftar];
  /* the files for the language of the page */
  function ramPick(name){
    var pool=RAM_POOL[name][window.AzanLang.current()==="fa"?"fa":"ar"];
    return {files:pool.files.map(function(f){return pool.dir+f[0]}),durs:pool.files.map(function(f){return f[1]})};
  }
  function ramSelect(S){
    if(ramCur===S&&ramChain)return;                          /* never change the files of a set that is playing */
    var p=ramPick(S.name);
    if(S.files.join("|")===p.files.join("|"))return;
    S.files=p.files; S.fallback=p.durs;
    S.pre=null; S.warm=false;                                /* other files: read their lengths again */
  }
  RAM_LIST.forEach(function(S){S.pre=null;S.warm=false;S.busy=false;ramSelect(S)});
  var ramPlayer=new Audio();
  ramPlayer.preload="auto";
  var ramLoadSec=0;                                          /* measured loading time of a file, used to plan the next one */
  var ramCur=null, ramIdx=0, ramChain=false;                 /* the set that is playing, the file in it, and whether the next file follows */
  function ramPrepare(S){
    if(S.pre)return;
    S.pre=S.files.map(function(f){var a=new Audio();a.preload="metadata";a.src=f;return a});
  }
  function ramWarmUp(S){
    if(S.warm||!S.pre)return;
    S.warm=true;
    S.pre.forEach(function(a){a.preload="auto";try{a.load()}catch(e){}});
  }
  function ramDurations(S){
    return S.files.map(function(f,i){
      var d=S.pre&&S.pre[i]?S.pre[i].duration:NaN;
      return (isFinite(d)&&d>0)?d:S.fallback[i];
    });
  }
  function ramTotal(S){return ramDurations(S).reduce(function(a,b){return a+b},0)}
  /* play file number idx of set S from offset seconds; done(true|false) tells whether it started */
  function playRamAt(S,idx,off,done){
    ramCur=S; ramIdx=idx;
    var f=S.files[idx], settled=false, timer=null, t0=Date.now(), ep=playEpoch;
    function finish(ok){
      if(settled)return;
      settled=true;
      clearTimeout(timer);
      ramPlayer.removeEventListener("loadedmetadata",go);
      ramPlayer.removeEventListener("error",fail);
      if(done)done(ok);
    }
    function fail(){finish(false)}
    function go(){
      ramPlayer.removeEventListener("loadedmetadata",go);
      if(ep!==playEpoch){finish(false);return}                /* the place changed while the file was loading */
      try{ramPlayer.currentTime=off||0}catch(e){}
      ramPlayer.muted=false;
      if(idx>0||off===0)ramLoadSec=Math.min(5,Math.max(0,(Date.now()-t0)/1000));   /* how long a change of file takes to start */
      var p=null;
      try{p=ramPlayer.play()}catch(e){p=null}
      if(p&&p.then)p.then(function(){finish(true)}).catch(function(){
        if(ep!==playEpoch){finish(false);return}              /* stopped because the place changed: not a refusal */
        /* sound is refused until the person touches the page: like the adhan, start silently (always allowed) and
           unmute on the first touch, so the dua is already running at the right place of the clock */
        ramPlayer.muted=true;
        var q=null;
        try{q=ramPlayer.play()}catch(e){q=null}
        if(q&&q.then)q.then(function(){ramMutedAuto=true;finish(true)}).catch(function(){ramPlayer.muted=false;fail()});
        else{ramPlayer.muted=false;fail()}
      });
      else finish(p!==null);
    }
    if(ramPlayer.getAttribute("data-file")!==f){ramPlayer.setAttribute("data-file",f);ramPlayer.src=f}
    ramPlayer.addEventListener("error",fail);
    timer=setTimeout(fail,8000);                              /* file missing or very slow: the caller tries again */
    if(ramPlayer.readyState>=1)go(); else ramPlayer.addEventListener("loadedmetadata",go);
  }
  var ramMutedAuto=false;
  function unmuteRamOnTouch(){
    if(!ramMutedAuto)return;
    ramMutedAuto=false;
    ramPlayer.muted=false;
  }
  ["click","touchstart","keydown"].forEach(function(ev){ document.addEventListener(ev,unmuteRamOnTouch,{passive:true}); });
  function localNowMs(){
    var d=new Date(Date.now()+lastOffset*3600000);
    return d.getUTCHours()*3600000+d.getUTCMinutes()*60000+d.getUTCSeconds()*1000+d.getUTCMilliseconds();
  }
  /* when a file ends the next one follows at once. Every change of file costs a little loading time, so the next file is
     placed by the clock (the last file must end 1 second before the adhan): if it is late, it starts a little inside the file */
  ramPlayer.addEventListener("ended",function(){
    if(!ramChain||!ramCur)return;
    var S=ramCur, idx=ramIdx+1, off=0;
    if(idx>=S.files.length){ramChain=false;return}
    if(S.endMs!=null){
      var durs=ramDurations(S), rest=0;
      for(var j=idx;j<durs.length;j++)rest+=durs[j];
      var late=(localNowMs()-(S.endMs-rest*1000))/1000+ramLoadSec;
      if(late>0){
        off=late;
        while(idx<durs.length-1&&off>=durs[idx]){off-=durs[idx];idx++}
        if(off>=durs[idx]-0.5){ramChain=false;return}        /* the adhan time has come: nothing is left to play */
      }
    }
    playRamAt(S,idx,off,function(ok){
      if(ok)return;
      ramChain=false;
      if(S.key)doaFired[S.key]=false;                          /* the checker starts the dua again from the place of the clock */
    });
  });

  /* the monthly flags are read from the server (data/doa.json) and re-read every 30 minutes,
     so a change in the file is picked up without touching the code. If it cannot be read, nothing is played. */
  function loadDoaList(){
    try{
      fetch("data/doa.json?_="+Date.now(),{cache:"no-store"})
        .then(function(r){ if(!r.ok)throw new Error("doa "+r.status); return r.json(); })
        .then(function(list){ if(Array.isArray(list))doaList=list; })
        .catch(function(){ /* keep the last good list; if there never was one, doaList stays null */ });
    }catch(e){}
  }
  loadDoaList();
  setInterval(loadDoaList,30*60*1000);
  setTimeout(function(){ if(!doaList)loadDoaList(); },5000);   /* quick retry if the first read failed */

  /* 0) the monthly flag: daily = "1" means on for that Hijri month, "0" means off */
  function dailyOn(d){
    if(!doaList)return false;
    var m=hijriMonthOf(d), rec=null;
    for(var i=0;i<doaList.length;i++){ if(+doaList[i].order===m){rec=doaList[i];break} }
    return !!rec&&String(rec.daily)==="1";
  }
  /* the Ramadan flag of the Hijri month: ramadan = "1" means the Ramadan dua is used before maghrib */
  function ramadanOn(d){
    if(!doaList)return false;
    var m=hijriMonthOf(d), rec=null;
    for(var i=0;i<doaList.length;i++){ if(+doaList[i].order===m){rec=doaList[i];break} }
    return !!rec&&String(rec.ramadan)==="1";
  }
  /* 2/3) the user's switch: the "automatic adhan and dua" box (saved default if any, otherwise on) */
  function userWantsDua(){ return !!autoEl&&autoEl.checked; }

  /* browsers block sound until the person has touched the page once: unlock both players on the first touch */
  var SILENT_WAV="data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSADAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";
  var audioUnlocked=false;
  function unlockAudio(){
    if(audioUnlocked)return;
    audioUnlocked=true;
    [dailyPlayer,ramPlayer,player].forEach(function(a){
      if(!a.paused)return;                                   /* never interrupt a sound that is already playing */
      try{
        var temp=false;
        if(!a.getAttribute("src")&&!a.getAttribute("data-file")&&!a.src){ a.src=SILENT_WAV; temp=true; }   /* a player without a file can not be unlocked */
        a.muted=true;
        var p=a.play();
        var back=function(){
          if(temp){
            if(a.getAttribute("data-file"))return;           /* a real file was set meanwhile: leave it alone */
            a.pause(); a.muted=false; a.removeAttribute("src"); try{a.load()}catch(e){}
            return;
          }
          a.pause(); a.currentTime=0; a.muted=false;
        };
        if(p&&p.then)p.then(back).catch(function(){ a.muted=false; }); else back();
      }catch(e){ a.muted=false; }
    });
  }
  ["click","touchstart","keydown"].forEach(function(ev){ document.addEventListener(ev,unlockAudio,{once:true,passive:true}); });

  /* the daily dua; kinds = the adhans it is played before */
  function checkDailyDua(nowMs,day,kinds){
    var now=new Date(Date.now()+lastOffset*3600000);
    var file=DUA_FILES[now.getUTCDay()];
    if(!file)return;
    if(dailyPlayer.getAttribute("data-file")!==file){
      dailyPlayer.setAttribute("data-file",file);
      dailyPlayer.src=file;
      dailyPlayer.load();
    }
    /* 3) flag on but the user's switch is off: nothing is played */
    if(!userWantsDua())return;
    var dur=dailyPlayer.duration;
    if(!isFinite(dur)||dur<=0)return;                        /* the length is not known yet */
    if(!dailyPlayer.paused)return;                           /* already playing */
    kinds.forEach(function(k){
      var m=toMin(lastTimes[k]);
      if(m===null)return;
      /* 4) the dua ends 1 second before the adhan, which starts at the beginning of its minute */
      var endMs=m*60000-1000, startMs=endMs-dur*1000;
      var key=day+k+"dua";
      if(doaFired[key]||!dailyPlayer.paused)return;
      /* from the start of the dua until half a second before its end: a person who arrives in the middle
         hears it from that point; if the browser blocks the sound it is retried until the dua is over */
      if(nowMs>=startMs&&nowMs<endMs-500){
        try{ dailyPlayer.currentTime=Math.max(0,(nowMs-startMs)/1000); }catch(e){}
        var ep=playEpoch, p=dailyPlayer.play();
        if(p&&p.then)p.then(function(){ if(ep===playEpoch)doaFired[key]=true; }).catch(function(){});
        else doaFired[key]=true;
      }
    });
  }
  /* a Ramadan dua (set S) before its adhan: the files in a row; someone who arrives in the middle hears the rest */
  function checkRamSet(S,nowMs,day){
    ramSelect(S);                                            /* the files for the language of the page */
    ramPrepare(S);
    var m=toMin(lastTimes[S.kind]);
    if(m===null)return;
    var endMs=m*60000-1000, startMs=endMs-ramTotal(S)*1000;
    if(nowMs<endMs&&startMs-nowMs<20*60000)ramWarmUp(S);     /* fetch the files shortly before they are needed */
    var key=day+S.kind+"ramdua";
    if(doaFired[key]||S.busy)return;
    if(nowMs>=startMs&&nowMs<endMs-500){
      var pos=(nowMs-startMs)/1000, durs=ramDurations(S), i=0;
      while(i<durs.length-1&&pos>=durs[i]){pos-=durs[i];i++}
      S.busy=true; S.key=key; S.endMs=endMs;
      playRamAt(S,i,pos,function(ok){
        S.busy=false;
        if(ok){doaFired[key]=true;ramChain=true}
      });
    }
  }
  function checkRamadanDua(nowMs,day){
    if(!userWantsDua())return;                              /* the user's automatic adhan and dua switch */
    RAM_LIST.forEach(function(S){checkRamSet(S,nowMs,day)});
  }
  function checkDua(){
    if(!lastTimes||!doaList)return;
    var now=new Date(Date.now()+lastOffset*3600000);
    var dayOn=dailyOn(now), ramOn=ramadanOn(now);
    /* 1) both flags off: nothing is loaded or played */
    if(!dayOn&&!ramOn)return;
    var nowMs=now.getUTCHours()*3600000+now.getUTCMinutes()*60000+now.getUTCSeconds()*1000+now.getUTCMilliseconds();
    var day=now.getUTCFullYear()+"-"+now.getUTCMonth()+"-"+now.getUTCDate();
    /* where the Ramadan dua is on, it replaces the daily dua before fajr and before maghrib (dhuhr keeps the daily dua) */
    if(dayOn)checkDailyDua(nowMs,day,ramOn?["dhuhr"]:["fajr","dhuhr","maghrib"]);
    if(ramOn)checkRamadanDua(nowMs,day);
  }
  setInterval(checkDua,250);
  /* timer: when the daily dua starts before the next adhan (fajr, dhuhr, maghrib) */
  var duaTimerEl=document.getElementById("duaTimer");
  function hhmmss(s){
    /* whole seconds only: no milliseconds or fractions */
    s=Math.floor(s);
    var A=window.AzanLang, h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60;
    return A.num((h<10?"0":"")+h)+":"+A.num((m<10?"0":"")+m)+":"+A.num((x<10?"0":"")+x);
  }
  function updateDuaTimer(){
    if(!duaTimerEl)return;
    var A=window.AzanLang;
    /* the line is shown only when a dua will be played; otherwise it stays empty */
    /* if the dua list cannot be read, say so (this is the only message); otherwise a flag that is off stays silent */
    if(lastTimes&&autoEl.checked&&!doaList){duaTimerEl.textContent=A.t("dua_nolist");return}
    if(!lastTimes||!autoEl.checked||!doaList){duaTimerEl.textContent="";return}
    var d=new Date(Date.now()+lastOffset*3600000);
    var dayOn=dailyOn(d), ramOn=ramadanOn(d);
    if((!dayOn&&!ramOn)||!userWantsDua()){duaTimerEl.textContent="";return}
    var nowS=d.getUTCHours()*3600+d.getUTCMinutes()*60+d.getUTCSeconds();
    var best=null;
    /* one line: which dua, at what time it starts, and before which adhan (no countdown) */
    function show(start,key,wd,kind){
      duaTimerEl.textContent=A.t(key,{day:A.names("weekdays")[wd],start:hhmmss(start%86400),adhan:A.t("adhan_"+kind)});
    }
    if(dayOn){
      var dur=dailyPlayer.duration;
      if(!isFinite(dur)||dur<=0){duaTimerEl.textContent=A.t("dua_loading");return}
      (ramOn?["dhuhr"]:["fajr","dhuhr","maghrib"]).forEach(function(k){
        var m=toMin(lastTimes[k]);
        if(m===null)return;
        var start=m*60-1-dur;
        if(start>nowS&&(best===null||start<best.start))best={start:start,key:"dua_timer",wd:d.getUTCDay(),kind:k};
      });
    }
    if(ramOn){
      RAM_LIST.forEach(function(S){
        ramSelect(S);
        ramPrepare(S);
        var mm=toMin(lastTimes[S.kind]);
        if(mm===null)return;
        var rs=mm*60-1-ramTotal(S);
        if(rs>nowS&&(best===null||rs<best.start))best={start:rs,key:S.timerKey,wd:d.getUTCDay(),kind:S.kind};
      });
    }
    if(best){show(best.start,best.key,best.wd,best.kind);return}
    /* today is over: tomorrow's dua before tomorrow's Fajr (the Ramadan Sahar dua or the daily dua), if tomorrow's month has one */
    var d2=new Date(d.getTime()+86400000), fn=toMin(lastTimes.fajrNext);
    if(fn===null){duaTimerEl.textContent="";return}
    if(ramadanOn(d2)){
      ramSelect(RAM_SETS.sahar);
      ramPrepare(RAM_SETS.sahar);
      show(fn*60-1-ramTotal(RAM_SETS.sahar)+86400,RAM_SETS.sahar.timerKey,d2.getUTCDay(),"fajr");
      return;
    }
    if(!dailyOn(d2)){duaTimerEl.textContent="";return}
    var tf=DUA_FILES[d2.getUTCDay()];
    if(nextDuaPlayer.getAttribute("data-file")!==tf){
      nextDuaPlayer.setAttribute("data-file",tf);
      nextDuaPlayer.src=tf;
      nextDuaPlayer.load();
    }
    var durT=nextDuaPlayer.duration;
    if(!isFinite(durT)||durT<=0){duaTimerEl.textContent=A.t("dua_loading");return}
    show(fn*60-1-durT+86400,"dua_timer",d2.getUTCDay(),"fajr");
  }
  setInterval(updateDuaTimer,1000);

  setInterval(updateRamadan,1000);

  updateRamadan();
  if(window.AzanOfficial)AzanOfficial.onReady(updateRamadan);
  if(window.AzanOfficial&&AzanOfficial.onChange)AzanOfficial.onChange(updateRamadan);
  window.addEventListener("azan:langchange",updateRamadan);

  /* "محاسبه اوقات" button: use the typed latitude and longitude */
  document.querySelector(".coords").addEventListener("submit",function(e){
    e.preventDefault();
    var lat=parseFloat(window.AzanLang.toAscii(latEl.value)),lng=parseFloat(window.AzanLang.toAscii(lngEl.value));
    if(!(lat>=-90&&lat<=90&&lng>=-180&&lng<=180)){say(window.AzanLang.t("bad_coords"));return}
    say("");
    var ll=L.latLng(lat,lng);
    setPos(ll,15);
    reverse(ll,true);
  });

  /* ---- adhan sound: plays by itself at fajr, dhuhr and maghrib of the selected place ---- */
  var player=document.getElementById("adhanPlayer"),
      autoEl=document.getElementById("autoAdhan"),
      adhanMsg=document.getElementById("adhanMsg"),
      voices=document.querySelectorAll("input[name=r]"),
      played="";

  /* saved defaults: written only by the "ذخیره پیش‌فرض‌ها" button, read on every visit */
  var DEF_KEY="azangoo-defaults";
  var defaults=null;
  try{defaults=JSON.parse(localStorage.getItem(DEF_KEY))}catch(e){defaults=null}

  /* ---------- calculation method ----------
     AzanGoo is chosen and shown first; the other methods of the language open under "Other methods". The choice is applied at once,
     and the save button keeps it (defaults.method) like the other settings. Until it is saved a small "not saved" mark shows on the save card. */
  var refreshMethodUi=function(){};
  (function(){
    var PT=window.AzangooPrayerTimes,A=window.AzanLang,card=document.getElementById("methodCard");
    if(!PT||!card)return;
    PT.setMethod(defaults&&defaults.method);                       /* before the first calculation */
    var listEl=document.getElementById("methodList"),moreBtn=document.getElementById("methodMore"),othersEl=document.getElementById("methodOthers"),
        moonNote=document.getElementById("methodMoonNote"),withEl=document.getElementById("calcWithName"),
        unsavedEl=document.getElementById("unsaved"),changeLink=document.getElementById("calcChange");
    var esc=function(x){return String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")};
    var n=function(x){return A.num(x)};
    function savedId(){try{var c=JSON.parse(localStorage.getItem(DEF_KEY));return PT.methodOf(c&&c.method)}catch(e){return "azangoo"}}
    function hint(id){
      var M=PT.METHODS[id];
      if(id==="azangoo")return A.t("m_azangoo_hint",{1:n(18),2:n(12),3:n(4),4:n(15)});
      if(M.seasonal)return A.t("m_hint_seasonal",{1:n(M.fajr),2:n(M.maghrib)});
      if(M.ishaMin!=null)return A.t("m_hint_makkah",{1:n(M.fajr),2:n(M.ishaMin),3:n(120)});
      if(M.maghrib!=null)return A.t("m_hint_angles",{1:n(M.fajr),2:n(M.maghrib),3:n(M.isha)});
      return A.t("m_hint_sunset",{1:n(M.fajr),2:n(M.isha)});
    }
    function row(id){
      var on=id===PT.getMethod();
      return '<label class="method-row'+(on?' on':'')+'"><input type="radio" name="calcMethod" value="'+id+'"'+(on?' checked':'')+'>'+
        '<span class="method-text"><b>'+esc(A.t("m_"+id))+'</b><small>'+esc(hint(id))+
        (id==="azangoo"?' <a href="#" class="method-details">'+esc(A.t("m_more_details"))+'</a>':'')+'</small></span></label>';
    }
    function setMore(open){othersEl.hidden=!open;moreBtn.setAttribute("aria-expanded",open?"true":"false")}
    function renderRows(){
      var ids=PT.methodsFor(A.current()),cur=PT.getMethod();
      if(ids.indexOf(cur)<0)ids.push(cur);                       /* a saved method that this language does not list stays visible: the choice is never lost */
      listEl.innerHTML=row("azangoo");
      othersEl.innerHTML=ids.filter(function(id){return id!=="azangoo"}).map(row).join("");
      if(cur!=="azangoo")setMore(true);
    }
    function paintState(){
      var cur=PT.getMethod();
      withEl.textContent=A.t("m_"+cur);
      moonNote.hidden=cur!=="moonsighting";
      var dirty=cur!==savedId();
      unsavedEl.hidden=!dirty;
      var sv=unsavedEl.closest(".card");if(sv)sv.classList.toggle("is-dirty",dirty);
    }
    refreshMethodUi=paintState;
    renderRows();setMore(PT.getMethod()!=="azangoo");paintState();
    moreBtn.addEventListener("click",function(){setMore(othersEl.hidden)});
    card.addEventListener("change",function(e){
      var t=e.target;if(!t||t.name!=="calcMethod")return;
      PT.setMethod(t.value);
      Array.prototype.forEach.call(card.querySelectorAll(".method-row"),function(r){r.classList.toggle("on",r.querySelector("input").checked)});
      paintState();
      recalc();                                                  /* the times change at once */
      window.dispatchEvent(new CustomEvent("azan:methodchange",{detail:{method:t.value}}));
    });
    card.addEventListener("click",function(e){
      var d=e.target.closest&&e.target.closest(".method-details");
      if(!d)return;
      e.preventDefault();e.stopPropagation();
      var dlg=document.getElementById("aboutDlg");
      if(dlg){if(dlg.showModal)dlg.showModal();else dlg.setAttribute("open","")}
    });
    if(changeLink)changeLink.addEventListener("click",function(e){
      e.preventDefault();
      if(PT.getMethod()!=="azangoo")setMore(true);
      var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      card.scrollIntoView({behavior:reduce?"auto":"smooth",block:"center"});
      var cur=card.querySelector('input[name="calcMethod"]:checked');if(cur)cur.focus({preventScroll:true});
    });
    window.addEventListener("azan:langchange",function(){renderRows();paintState()});
  })();

  /* voice and auto-play: saved values if there are any, otherwise the values in the page */
  if(defaults&&defaults.voice){
    var voiceExists=false;
    Array.prototype.forEach.call(voices,function(r){ if(r.value===defaults.voice)voiceExists=true; });
    /* a saved voice that was removed from the site (e.g. an old reciter) is ignored: the page default stays */
    if(voiceExists)Array.prototype.forEach.call(voices,function(r){r.checked=(r.value===defaults.voice)});
  }
  if(defaults&&typeof defaults.auto==="boolean")autoEl.checked=defaults.auto;

  /* the thin moving bar "tap the page once": shown while the automatic adhan is on and the page has not been touched yet
     (browsers keep the sound locked until then); the first tap, click or key press removes it, and so does turning the switch off */
  (function(){
    var bar=document.getElementById("soundBar");
    if(!bar)return;
    function hideBar(){ bar.hidden=true; }
    if(autoEl.checked)bar.hidden=false;
    ["click","touchstart","keydown"].forEach(function(ev){ document.addEventListener(ev,hideBar,{once:true,passive:true}); });
    autoEl.addEventListener("change",function(){ if(!autoEl.checked)hideBar(); });
  })();
  Array.prototype.forEach.call(voices,function(r){
    r.addEventListener("change",function(){player.src=r.value});
    if(r.checked)player.src=r.value;
  });

  /* the save button */
  var saveBtn=document.getElementById("saveDefaults"),
      saveMsg=document.getElementById("saveMsg");
  var confirmDlg=document.getElementById("saveDlg");
  /* the "delete saved settings" link: shown only while something is saved in this browser */
  var clearBtn=document.getElementById("clearDefaults"), clearDlg=document.getElementById("clearDlg");
  function hasSaved(){ try{ return !!localStorage.getItem(DEF_KEY); }catch(e){ return false; } }
  function refreshClear(){ if(clearBtn)clearBtn.hidden=!hasSaved(); }
  refreshClear();
  function doSave(){
    var voice=null;
    Array.prototype.forEach.call(voices,function(r){if(r.checked)voice=r.value});
    var ll=marker.getLatLng();
    var data={place:{lat:ll.lat,lng:ll.lng,city:cityEl.value||""},voice:voice,auto:autoEl.checked,lang:window.AzanLang.current(),theme:window.AzanTheme?window.AzanTheme.current():"dark"};
    if(window.AzangooPrayerTimes)data.method=window.AzangooPrayerTimes.getMethod();
    try{
      localStorage.setItem(DEF_KEY,JSON.stringify(data));
      saveMsg.textContent=window.AzanLang.t("saved");
      refreshClear();
      refreshMethodUi();
    }catch(e){saveMsg.textContent=window.AzanLang.t("save_fail");}
  }
  /* saving asks first, in a small pop-up */
  function closeSaveDlg(){ if(confirmDlg.close)confirmDlg.close(); else confirmDlg.removeAttribute("open"); }
  if(saveBtn&&confirmDlg){
    saveBtn.addEventListener("click",function(){
      saveMsg.textContent="";
      if(confirmDlg.showModal)confirmDlg.showModal(); else confirmDlg.setAttribute("open","");
    });
    document.getElementById("saveYes").addEventListener("click",function(){
      closeSaveDlg();
      doSave();
    });
    document.getElementById("saveNo").addEventListener("click",function(){
      closeSaveDlg();
      saveMsg.textContent=window.AzanLang.t("no_change");
    });
  }

  if(clearBtn&&clearDlg){
    function closeClearDlg(){ if(clearDlg.close)clearDlg.close(); else clearDlg.removeAttribute("open"); }
    clearBtn.addEventListener("click",function(){
      saveMsg.textContent="";
      if(clearDlg.showModal)clearDlg.showModal(); else clearDlg.setAttribute("open","");
    });
    document.getElementById("clearYes").addEventListener("click",function(){
      closeClearDlg();
      try{ localStorage.removeItem(DEF_KEY); }catch(e){}
      saveMsg.textContent=window.AzanLang.t("clear_done");
      refreshClear();
      refreshMethodUi();
    });
    document.getElementById("clearNo").addEventListener("click",closeClearDlg);
  }

  /* after-adhan dua (Eftar_after_Azan.mp3): after the fajr adhan and after the maghrib adhan, in the months where the "ramadan" flag is on
     (the Sahar dua still plays before fajr; dhuhr has no dua after it) */
  var duaPlayer=new Audio();
  var pendingAfter=null;
  /* Hijri month number of a local date (d has the local date in its UTC fields); official list first */
  function hijriMonthOf(d){
    var ymd=d.getUTCFullYear()+"-"+pad(d.getUTCMonth()+1)+"-"+pad(d.getUTCDate());
    var e=window.AzanOfficial?window.AzanOfficial.covering(ymd):null;
    return e?+e.hijriMonth:partsOf(fHijri,d).month;
  }
  player.addEventListener("ended",function(){
    mutedAuto=false; player.muted=false;
    adhanMsg.textContent="";
    var kind=pendingAfter;
    pendingAfter=null;
    if(!kind)return;
    /* after the fajr or maghrib adhan: the dua file, always exactly 1 second after the adhan ends, when the "ramadan" flag of the
       Hijri month in data/doa.json is 1 and the automatic adhan and dua switch is on. */
    var ep=playEpoch;
    setTimeout(function(){
      if(ep!==playEpoch)return;                               /* the place changed meanwhile */
      if(!autoEl.checked)return;
      if(!ramadanOn(new Date(Date.now()+lastOffset*3600000)))return;
      var f="audio/doa/ramadan/Eftar_after_Azan.mp3";
      if(duaPlayer.getAttribute("data-file")!==f){duaPlayer.setAttribute("data-file",f);duaPlayer.src=f;}
      try{duaPlayer.currentTime=0}catch(e){}
      var p=duaPlayer.play();
      if(p&&p.catch)p.catch(function(){});                    /* file missing or playback blocked */
    },1000);
  });

  player.preload="auto";
  /* The browser may block sound until the person has touched the page. In that case the adhan is started
     silently (always allowed) at the right position, and the first touch anywhere turns the sound on. */
  var mutedAuto=false, mutedName="";
  /* the dua file is loaded while the fajr or maghrib adhan plays, so it can start on time after it */
  function prepareAfter(kind){
    if((kind!=="maghrib"&&kind!=="fajr")||!autoEl.checked)return;
    if(!ramadanOn(new Date(Date.now()+lastOffset*3600000)))return;
    var f="audio/doa/ramadan/Eftar_after_Azan.mp3";
    if(duaPlayer.getAttribute("data-file")!==f){
      duaPlayer.setAttribute("data-file",f);duaPlayer.preload="auto";duaPlayer.src=f;
      try{duaPlayer.load()}catch(e){}
    }
  }
  function playAdhan(name,key,kind,offset){
    if(!player.paused)return;                                  /* already playing */
    try{ player.currentTime=offset||0; }catch(e){}
    player.muted=false;
    var ep=playEpoch, p=player.play();
    function ok(){ if(ep!==playEpoch)return; played=key; pendingAfter=kind; prepareAfter(kind); adhanMsg.textContent=window.AzanLang.t("playing",{name:name}); updateCountdown(); }
    function silent(){
      played=key; pendingAfter=kind; prepareAfter(kind); mutedAuto=true; mutedName=name;
      adhanMsg.textContent=window.AzanLang.t("adhan_muted");
      updateCountdown();
    }
    function blocked(){
      if(ep!==playEpoch)return;                                /* stopped because the place changed: not a refusal */
      player.muted=true;
      var q;
      try{ q=player.play(); }catch(e){ q=null; }
      if(q&&q.then)q.then(silent).catch(function(){            /* even silent playback was refused: retried on the next tick */
        player.muted=false;
        adhanMsg.textContent=window.AzanLang.t("time_for",{name:name});
      });
      else if(q===undefined)silent();
      else{ player.muted=false; adhanMsg.textContent=window.AzanLang.t("time_for",{name:name}); }
    }
    if(p&&p.then)p.then(ok).catch(blocked);
    else ok();
  }
  function unmuteOnTouch(){
    if(!mutedAuto)return;
    mutedAuto=false;
    player.muted=false;
    if(!player.paused)adhanMsg.textContent=window.AzanLang.t("playing",{name:mutedName});
  }
  ["click","touchstart","keydown"].forEach(function(ev){ document.addEventListener(ev,unmuteOnTouch,{passive:true}); });
  /* the countdown line follows the player at once, without waiting for the next second */
  ["play","playing","pause","ended","emptied"].forEach(function(ev){ player.addEventListener(ev,function(){ updateCountdown(); }); });

  function checkAdhan(){
    if(!lastTimes||!autoEl.checked)return;
    var d=new Date(Date.now()+lastOffset*3600000),
        nowMs=d.getUTCHours()*3600000+d.getUTCMinutes()*60000+d.getUTCSeconds()*1000+d.getUTCMilliseconds(),
        day=d.getUTCFullYear()+"-"+d.getUTCMonth()+"-"+d.getUTCDate(),
        dur=player.duration;
    [["fajr","adhan_fajr"],["dhuhr","adhan_dhuhr"],["maghrib","adhan_maghrib"]].forEach(function(x){
      var m=toMin(lastTimes[x[0]]);
      if(m===null)return;
      var key=day+x[0];
      if(played===key||!player.paused)return;
      var startMs=m*60000;
      /* from the start of the adhan until the end of the recording: a person who arrives in the middle hears it from that point */
      var len=(isFinite(dur)&&dur>0)?dur*1000-500:2500;
      if(nowMs>=startMs&&nowMs<startMs+len){
        playAdhan(window.AzanLang.t(x[1]),key,(x[0]==="maghrib"||x[0]==="fajr")?x[0]:null,(nowMs-startMs)/1000);
      }
    });
  }
  setInterval(checkAdhan,250);

  onNewDay=recalc;
  showPlace();
  recalc();

  /* permission: explain first, then ask the browser only if the user agrees */
  var locDlg=document.getElementById("locDlg"),
      locYes=document.getElementById("locYes"),
      locNo=document.getElementById("locNo");
  /* first visit, without asking again: whatever the answer to the location question is (yes or no), the language of the page
     goes into the defaults; when the location is allowed, the place goes in too. The entry is marked autoPlace, so the place
     can be completed with the city name that is found a moment later, and so the "save defaults" button (which writes a full
     entry) always replaces it. A real saved entry (without the mark) is never touched. */
  var firstVisit=false;
  function canAutoSave(){
    try{ var cur=JSON.parse(localStorage.getItem(DEF_KEY)); return !cur||!!cur.autoPlace; }catch(e){ return true; }
  }
  function saveAuto(patch){
    try{
      if(!canAutoSave())return;
      var cur=JSON.parse(localStorage.getItem(DEF_KEY))||{};
      for(var k in patch)cur[k]=patch[k];
      cur.autoPlace=true;
      localStorage.setItem(DEF_KEY,JSON.stringify(cur));
      refreshClear();
    }catch(e){}
  }
  function saveAutoLang(){ if(firstVisit)saveAuto({lang:window.AzanLang.current()}); }
  function saveAutoPlace(ll,name){ saveAuto({place:{lat:ll.lat,lng:ll.lng,city:name||""}}); }
  function requestGps(){
    if(!navigator.geolocation){say(window.AzanLang.t("geo_denied"));return}
    say(window.AzanLang.t("locating"));
    navigator.geolocation.getCurrentPosition(function(pos){
      var ll=L.latLng(pos.coords.latitude,pos.coords.longitude);
      var auto=firstVisit&&canAutoSave();
      setPos(ll,14);
      if(auto){ firstVisit=false; saveAutoPlace(ll,""); }
      reverse(ll,true,auto?function(name){ var p=marker.getLatLng(); if(Math.abs(p.lat-ll.lat)<1e-9&&Math.abs(p.lng-ll.lng)<1e-9)saveAutoPlace(ll,name); }:null);
      say("");
    },function(err){
      say(window.AzanLang.t(err&&err.code===1?"gps_denied":"geo_denied"));
    },{timeout:10000,maximumAge:300000});
  }
  function askLocation(){
    if(!locDlg){requestGps();return}
    locDlg.showModal?locDlg.showModal():locDlg.setAttribute("open","");
  }
  var gpsBtn=document.getElementById("gpsBtn");
  if(gpsBtn)gpsBtn.addEventListener("click",function(){ showMapNow(); requestGps(); });
  if(locYes)locYes.addEventListener("click",function(){
    if(locDlg.close)locDlg.close();else locDlg.removeAttribute("open");
    saveAutoLang();
    showMapNow();
    requestGps();
  });
  if(locNo)locNo.addEventListener("click",function(){
    if(locDlg.close)locDlg.close();else locDlg.removeAttribute("open");
    saveAutoLang();
    say(window.AzanLang.t("pick_place"));
  });
  if(locDlg)locDlg.addEventListener("cancel",saveAutoLang);          /* closed with Esc: counts as an answer too */
  if(!placed&&timeEls){for(var k1 in timeEls)timeEls[k1].textContent="—";}

  /* start: saved place if there is one; otherwise ask permission and use the current location */
  var qs=new URLSearchParams(window.location.search||"");
  var qLat=parseFloat(qs.get("lat")), qLng=parseFloat(qs.get("lng")||qs.get("long")||qs.get("lon"));
  var qOk=isFinite(qLat)&&isFinite(qLng)&&Math.abs(qLat)<=90&&Math.abs(qLng)<=180;
  var forced=qOk&&qs.get("go")==="1";       /* a link made by the /go/ page: this place beats the saved one */
  if(!forced&&defaults&&defaults.place&&isFinite(defaults.place.lat)&&isFinite(defaults.place.lng)){   /* saved defaults first */
    cityEl.value=defaults.place.city||"";
    setPos(L.latLng(defaults.place.lat,defaults.place.lng),15);
    reverse(L.latLng(defaults.place.lat,defaults.place.lng));   /* name in the language of the page */
  }else if(qOk){   /* link from a city page (when there are no defaults) or from /go/ */
    cityEl.value=qs.get("city")||"";
    rememberRegion(L.latLng(qLat,qLng),qs.get("cc"));   /* the city page already knows the country */
    setPos(L.latLng(qLat,qLng),15);
    if(!cityEl.value)reverse(L.latLng(qLat,qLng));      /* no name in the link: look it up, in the language of the page */
    try{ if(window.history&&history.replaceState) history.replaceState(null,"",window.location.pathname); }catch(e){}
  }else{
    showPlace();
    firstVisit=true;
    /* location already allowed for this site: use it straight away, without the explanation window */
    if(navigator.permissions&&navigator.permissions.query){
      navigator.permissions.query({name:"geolocation"}).then(function(st){
        if(st.state==="granted"){ saveAutoLang(); requestGps(); } else askLocation();
      },function(){ askLocation(); });
    }else askLocation();
  }
})();
