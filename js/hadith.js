/* Hadith of the day.
   A thin ticker under the date tiles shows today's hadith in the page language; tapping it opens the full text
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
  var cache={},shownKey="",lastFocus=null;

  function dayIndex(){
    var d=new Date();
    var doy=Math.round((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-Date.UTC(d.getFullYear(),0,0))/864e5);   /* 1..366 */
    return (doy-1)%366;
  }
  function load(lang){
    if(cache[lang])return cache[lang];
    cache[lang]=fetch("data/hadith-"+lang+".json").then(function(r){
      if(!r.ok)throw new Error(r.status);
      return r.json();
    }).catch(function(){cache[lang]=null;return null});
    return cache[lang];
  }
  function show(){
    var lang=window.AzanLang?window.AzanLang.current():"fa",i=dayIndex(),key=lang+":"+i;
    if(key===shownKey)return;
    load(lang).then(function(list){
      if(!list||!list.length){if(!alertOn)bar.hidden=true;return}
      var h=list[i%list.length];
      shownKey=key;
      track.setAttribute("lang",lang);
      track.textContent=h.n+(h.n?": ":"")+(h.t||h.a||"");
      el.n.textContent=h.n||"";
      el.a.textContent=h.a||"";
      el.t.textContent=h.t||"";
      el.s.textContent=h.s||"";
      el.t.setAttribute("lang",lang);
      if(!alertOn)bar.hidden=false;
      /* about 50 pixels a second, whatever the length of the text */
      requestAnimationFrame(function(){
        var w=track.scrollWidth||800;
        track.style.setProperty("--hadith-dur",Math.max(20,Math.min(150,Math.round(w/50)))+"s");
      });
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
