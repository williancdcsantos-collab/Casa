
import {getApps,getApp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getFirestore,collection,onSnapshot} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

var CASA={"williamcdc.santos@gmail.com":"Will","beatrizs143@gmail.com":"Bea"};
function boot(){if(!getApps().length){setTimeout(boot,100);return}start(getApp())}
function start(app){
 var db=getFirestore(app),auth=getAuth(app),M={},unsub=null;
 function p2(n){return String(n).padStart(2,"0")}
 function day(d){return d.getFullYear()+p2(d.getMonth()+1)+p2(d.getDate())}
 function fmt(d){return day(d)+"T"+p2(d.getHours())+p2(d.getMinutes())+"00"}
 function link(x){
  var p=x.data.split("-"),det=[],dates;
  if(x.nota)det.push(x.nota);
  (x.itens||[]).forEach(function(i){det.push("- "+i.t)});
  det.push("Enviado por "+CASA[x.de]+" pelo app Casa");
  if(x.hora){
   var h=x.hora.split(":"),ini=new Date(+p[0],+p[1]-1,+p[2],+h[0],+h[1]),fim=new Date(ini.getTime()+3600000);
   dates=fmt(ini)+"/"+fmt(fim);
  }else{
   dates=day(new Date(+p[0],+p[1]-1,+p[2]))+"/"+day(new Date(+p[0],+p[1]-1,+p[2]+1));
  }
  return "https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent(x.titulo)+"&dates="+dates+"&details="+encodeURIComponent(det.join("\n"));
 }
 function marca(){
  document.querySelectorAll("#app .card").forEach(function(c){
   if(c.querySelector(".ag"))return;
   var b=c.querySelector("[data-id]"),x=b&&M[b.dataset.id],f=c.querySelector(".foot");
   if(!x||!x.data||!f)return;
   var a=document.createElement("a");
   a.className="btn small ag";a.textContent="Adicionar à agenda";
   a.target="_blank";a.rel="noopener";a.href=link(x);a.style.textDecoration="none";
   f.appendChild(a);
  });
 }
 onAuthStateChanged(auth,function(u){
  if(unsub){unsub();unsub=null}
  M={};
  var em=u&&u.email?u.email.toLowerCase():null;
  if(!em||!CASA[em])return;
  unsub=onSnapshot(collection(db,"itens"),function(s){
   M={};
   s.docs.forEach(function(d){var o=d.data();o.id=d.id;M[o.id]=o});
   marca();
  },function(){});
 });
 new MutationObserver(marca).observe(document.getElementById("app")||document.body,{childList:true,subtree:true});
}
boot();
