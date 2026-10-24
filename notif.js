import {getApps,getApp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getFirestore,collection,doc,getDoc,setDoc,onSnapshot} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

var CASA={"williamcdc.santos@gmail.com":"Will","beatrizs143@gmail.com":"Bea"};
var TIPOS={compromisso:"Compromisso",tarefa:"Tarefa",lista:"Lista",aviso:"Aviso"};
function boot(){if(!getApps().length){setTimeout(boot,100);return}start(getApp())}
function start(app){
 var auth=getAuth(app),db=getFirestore(app),me=null,unsub=null,sent={};
 function topicDe(e){return getDoc(doc(db,"usuarios",e)).then(function(s){return s.exists()?s.data().topic:null})}
 function enviar(t,title,msg){return fetch("https://ntfy.sh/",{method:"POST",body:JSON.stringify({topic:t,title:title,message:msg,click:location.origin+location.pathname})})}
 function avisar(d){
  topicDe(d.para).then(function(t){
   if(!t)return;
   var q="";if(d.data){var p=d.data.split("-");q=p[2]+"/"+p[1]+(d.hora?" às "+d.hora:"")}
   return enviar(t,CASA[d.de]+" enviou: "+TIPOS[d.tipo],d.titulo+(q?"\n"+q:""));
  }).catch(function(){});
 }
 onAuthStateChanged(auth,function(u){
  if(unsub){unsub();unsub=null}
  var em=u&&u.email?u.email.toLowerCase():null;
  me=em&&CASA[em]?em:null;
  if(!me)return;
  unsub=onSnapshot(collection(db,"itens"),function(snap){
   snap.docChanges().forEach(function(ch){
    var d=ch.doc.data();
    if(ch.type==="added"&&ch.doc.metadata.hasPendingWrites&&d.de===me&&!sent[ch.doc.id]){sent[ch.doc.id]=1;avisar(d)}
   });
  },function(){});
 });
 function rand(){var a=new Uint8Array(12);crypto.getRandomValues(a);return Array.from(a).map(function(b){return b.toString(36).padStart(2,"0")}).join("")}
 function draw(o,t){
  var h='<div style="max-width:480px;margin:0 auto"><div class="top"><h2>Avisos no celular</h2><button class="small" id="nx">Fechar</button></div>';
  if(!t){
   h+='<p class="muted">Quando alguém mandar algo para você, chega um aviso no celular. Usamos o app gratuito ntfy.</p><button class="primary" style="width:100%" id="na">Ativar avisos</button>';
  }else{
   h+='<p>1. Instale o app <b>ntfy</b> (Play Store ou App Store).</p><p>2. Toque em "Abrir no ntfy". Se não funcionar, copie o código, abra o ntfy, toque em + e cole.</p><p>3. Toque em "Enviar teste".</p>'+
   '<input type="text" readonly value="'+t+'" style="margin:10px 0"><div style="display:flex;flex-direction:column;gap:10px"><a class="btn primary" style="text-align:center;text-decoration:none" href="ntfy://ntfy.sh/'+t+'">Abrir no ntfy</a><button id="nc">Copiar código</button><button id="nt2">Enviar teste</button></div>';
  }
  o.innerHTML=h+"</div>";
  o.querySelector("#nx").onclick=function(){o.remove()};
  var a=o.querySelector("#na");
  if(a)a.onclick=function(){var n=rand();setDoc(doc(db,"usuarios",me),{topic:"casa-"+n}).then(function(){draw(o,"casa-"+n)}).catch(function(){alert("Não foi possível salvar. Confira as regras do Firebase.")})};
  var c=o.querySelector("#nc");
  if(c)c.onclick=function(){navigator.clipboard.writeText(t).then(function(){c.textContent="Copiado"}).catch(function(){})};
  var x=o.querySelector("#nt2");
  if(x)x.onclick=function(){enviar(t,"Teste","Os avisos estão funcionando.");x.textContent="Teste enviado"};
 }
 function abrir(){
  var o=document.createElement("div");
  o.style.cssText="position:fixed;inset:0;z-index:50;background:var(--bg);color:var(--ink);overflow:auto;padding:calc(22px + env(safe-area-inset-top,0px)) 18px 40px";
  document.body.appendChild(o);
  topicDe(me).then(function(t){draw(o,t)}).catch(function(){draw(o,null)});
 }
 new MutationObserver(function(){
  var top=document.querySelector("#app .top"),sair=top&&top.querySelector("button[data-act=sair]");
  if(!sair||top.querySelector("#sino"))return;
  var w=document.createElement("div"),b=document.createElement("button");
  w.style.cssText="display:flex;gap:8px";
  b.id="sino";b.className="small";b.textContent="🔔";b.setAttribute("aria-label","Avisos");
  b.onclick=abrir;
  sair.replaceWith(w);w.append(b,sair);
 }).observe(document.getElementById("app")||document.body,{childList:true,subtree:true});
}
boot();
