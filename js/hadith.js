/* Hadith of the day and verse of the day.
   A thin ticker under the date tiles shows today's hadith in the page language, then (after the text has gone by once) the
   verse of the day, then the hadith again; tapping it opens the full text
   (narrator, Arabic text, translation, source) in a dialog. The ticker pauses on hover and stops moving for people who
   asked their device for less motion (see the CSS).
   Data: data/hadith-<lang>.json, one file per language, 366 entries, each { n: narrator, a: Arabic text, t: translation,
   s: source } (a or t may be missing). The entry for a day is chosen by the day of the year, so every year repeats. */
(function(){
  var bar=document.getElementById("hadithBar");
  if(!bar||!window.fetch)return;
  var track=document.getElementById("hadithTrack"),open=document.getElementById("hadithOpen"),
      modal=document.getElementById("hadithModal"),close=document.getElementById("hadithClose"),
      el={n:document.getElementById("hadithN"),a:document.getElementById("hadithA"),t:document.getElementById("hadithT"),s:document.getElementById("hadithS")};
  var cache={},shownKey="",lastFocus=null,items=[],cur=0,rotT=0,reqId=0;
  var tag=bar.querySelector(".hadith-tag"),modalT=document.getElementById("hadithModalT");
  var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  var QS=new URLSearchParams(location.search);

  function p2(n){return (n<10?"0":"")+n}
  function dayIndex(){
    var d=new Date();
    var doy=Math.round((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-Date.UTC(d.getFullYear(),0,0))/864e5);   /* 1..366 */
    return (doy-1)%366;
  }
  function getJson(url){
    if(cache[url])return cache[url];
    cache[url]=fetch(url).then(function(r){
      if(!r.ok)throw new Error(r.status);
      return r.json();
    }).catch(function(){cache[url]=null;return null});
    return cache[url];
  }
  function load(lang){return getJson("data/hadith-"+lang+".json")}

  /* ---- the verse of the day shares this bar: the bar shows the hadith, then the verse, one after the other ----
     Data: data/ayah/<lang>-<MM>.json (days: { "MM-DD": [ entry per year ] }, an entry is a list of units { r, a, t, tl }),
     surah names: data/surahs.json. ?date=2026-06-25 shows the verse of that date (test only). */
  function testDate(){
    var m=/^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(QS.get("date")||"");
    return m?new Date(+m[1],+m[2]-1,+m[3]):null;
  }
  function refLabel(r,surahs,lang){
    var A=window.AzanLang;
    if(!r)return "";
    var m=/^(\d+):(.+)$/.exec(r);
    if(!m||r.indexOf(";")>-1||!surahs)return A.t("ayah_quran",{r:A.num(r)});
    var names=lang==="fa"?surahs.fa:(lang==="en"?surahs.en:surahs.ar),c=+m[1];
    return A.t(/[–-]/.test(m[2])?"ayah_ref_many":"ayah_ref_one",{s:names[c-1]||c,c:A.num(c),v:A.num(m[2])});
  }
  function ayahItem(lang,d){
    var mm=p2(d.getMonth()+1);
    return Promise.all([getJson("data/ayah/"+lang+"-"+mm+".json"),getJson("data/surahs.json")]).then(function(r){
      var doc=r[0],e=doc&&doc.days&&doc.days[mm+"-"+p2(d.getDate())];
      if(!e||!e.length||!window.AzanLang)return null;
      var units=e[d.getFullYear()%e.length];
      if(!units||!units.length)return null;
      var refs=[],ar=[],tr=[],tl=lang;
      units.forEach(function(u){
        if(u.r)refs.push(refLabel(u.r,r[1],lang));
        if(u.a)ar.push(u.a);
        if(u.t)tr.push(u.t);
        if(u.tl)tl=u.tl;
      });
      return {tag:"ayah_title",n:refs.join(lang==="en"?", ":"، "),a:ar.join(" "),t:tr.join(" "),s:"",lang:tl};
    });
  }
  /* put item number cur on the bar and in the dialog */
  function render(){
    var it=items[cur],A=window.AzanLang;
    if(!it)return;
    if(A){
      var ti=A.t(it.tag);
      tag.textContent=ti;bar.setAttribute("aria-label",ti);
      if(modalT)modalT.textContent=ti;
    }
    track.setAttribute("lang",it.lang);
    track.textContent=it.n+(it.n?": ":"")+(it.t||it.a||"");
    el.n.textContent=it.n||"";
    el.a.textContent=it.a||"";
    el.t.textContent=it.t||"";
    el.s.textContent=it.s||"";
    el.t.setAttribute("lang",it.lang);
    /* about 50 pixels a second, whatever the length of the text */
    requestAnimationFrame(function(){
      var w=track.scrollWidth||800;
      track.style.setProperty("--hadith-dur",Math.max(20,Math.min(150,Math.round(w/50)))+"s");
    });
  }
  function next(){
    if(items.length<2||!modal.hidden)return;           /* never change the text under someone who is reading it */
    cur=(cur+1)%items.length;
    render();
  }
  /* the next text starts when the moving text has gone by once; with reduced motion nothing moves, so a timer is used */
  track.addEventListener("animationiteration",function(){if(!reduce)next()});
  function show(){
    var A=window.AzanLang,lang=A?A.current():"fa",dt=testDate()||new Date(),i=dayIndex(),key=lang+":"+i+":"+dt.getMonth()+"-"+dt.getDate();
    if(key===shownKey)return;
    var tok=++reqId;
    Promise.all([load(lang),ayahItem(lang,dt).catch(function(){return null})]).then(function(r){
      if(tok!==reqId)return;
      var list=r[0],out=[];
      if(list&&list.length){
        var h=list[i%list.length];
        out.push({tag:"hadith_title",n:h.n||"",a:h.a||"",t:h.t||"",s:h.s||"",lang:lang});
      }
      if(r[1])out.push(r[1]);
      if(!out.length){if(!alertOn)bar.hidden=true;return}
      shownKey=key;items=out;cur=0;
      render();
      if(!alertOn)bar.hidden=false;
      clearInterval(rotT);
      if(reduce&&items.length>1)rotT=setInterval(next,12000);
    });
  }
  function openDialog(){
    lastFocus=document.activeElement;
    modal.hidden=false;
    document.documentElement.classList.add("hadith-open");
    close.focus();
  }
  function closeDialog(){
    modal.hidden=true;
    document.documentElement.classList.remove("hadith-open");
    if(lastFocus&&lastFocus.focus)lastFocus.focus();
  }
  open.addEventListener("click",openDialog);
  close.addEventListener("click",closeDialog);
  modal.addEventListener("click",function(e){if(e.target===modal)closeDialog()});
  document.addEventListener("keydown",function(e){
    if(modal.hidden)return;
    if(e.key==="Escape")closeDialog();
    else if(e.key==="Tab"){e.preventDefault();close.focus()}     /* the close button is the only thing to focus */
  });
  /* ---- "adhan is near" alert: for the last 15 minutes before an adhan the bar shows a green strip with a live countdown ---- */
  var NAME={fajr:"adhan_fajr",dhuhr:"adhan_dhuhr",maghrib:"adhan_maghrib",fajrNext:"adhan_fajr"},
      LIMIT=15*60,alertOn=false,alertKey="",alertLang="";
  var al=document.createElement("button");
  al.type="button";al.className="adhan-alert";al.hidden=true;
  al.innerHTML='<span class="aa-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg></span>'+
    '<span class="aa-text"><b class="aa-name"></b><span class="aa-title"></span></span><time class="aa-time" dir="ltr"></time>';
  bar.appendChild(al);
  var aaName=al.querySelector(".aa-name"),aaTitle=al.querySelector(".aa-title"),aaTime=al.querySelector(".aa-time");
  al.addEventListener("click",function(){if(shownKey)openDialog()});     /* the hadith is still one tap away */
  function pad2(n){return (n<10?"0":"")+n}
  function alertUpdate(e){
    var d=(e&&e.detail)||{},A=window.AzanLang;
    if(!A)return;
    var now=!!d.now,rem=d.rem,on=now||(rem>0&&rem<=LIMIT);
    if(!on){
      if(alertOn){alertOn=false;al.hidden=true;bar.classList.remove("is-alert","is-last");bar.hidden=!shownKey}
      return;
    }
    if(!alertOn){alertOn=true;al.hidden=false;bar.hidden=false;bar.classList.add("is-alert")}
    var lang=A.current();
    if(alertKey!==d.key+"|"+now||alertLang!==lang){
      alertKey=d.key+"|"+now;alertLang=lang;
      var pn=NAME[d.key]?A.t(NAME[d.key]):"";
      if(now){aaName.textContent=pn;aaTitle.textContent=A.t("alert_now")}
      else{aaName.textContent=A.t("alert_until",{name:pn});aaTitle.textContent=""}      /* "until Maghrib adhan" */
      al.classList.toggle("is-now",now);
      al.setAttribute("aria-label",aaTitle.textContent?aaTitle.textContent+" "+aaName.textContent:aaName.textContent);
    }
    if(now){aaTime.textContent="";bar.classList.remove("is-last");return}
    aaTime.textContent=A.num(pad2(Math.floor(rem/60))+":"+pad2(rem%60));
    bar.classList.toggle("is-last",rem<=60);          /* the last minute turns amber */
  }
  window.addEventListener("azan:nextadhan",alertUpdate);
  window.addEventListener("azan:langchange",function(){alertKey=""});
  window.addEventListener("azan:langchange",show);
  setInterval(show,10*60*1000);                                    /* a new day began */
  show();
})();
