const $ = id => document.getElementById(id);
const state = { names: [], filter: "all", favorites: new Set(), statuses: new Map() };
const vocab = {
 aesthetic: ["luna","velvet","aura","muse","ivory","celeste","bloom","dream","pearl","serene","daisy","opal","cloud","glow","silk","honey","flora","mist","moon","dawn"],
 minimal: ["nora","milo","navi","elio","lumi","aris","noa","sora","lino","rue","eden","sol","vivi","cleo","niko","mira"],
 premium: ["monarch","maison","royal","prime","noble","golden","regal","estate","lux","crown","rare","legacy","select","grand"],
 soft: ["mellow","hush","willow","mellow","bunny","peach","sugar","cloudy","lilac","poppy","maple","mimi","berry","coco","dove"],
 tech: ["pixel","neural","cyber","quant","nova","byte","orbit","matrix","flux","vector","echo","zenith","logic","crypto"],
 random: ["vex","zyra","qiro","aevon","xeno","zuno","kyro","vyne","orix","zeph","qova","lyrix","azur","nyxo"]
};
const tails = ["ly","ify","ora","verse","wave","core","lab","zone","club","daily","world","space","studio","room","hq","diary","mode","era","nest","works"];
const alphabet = "abcdefghijklmnopqrstuvwxyz";
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function clean(s){return s.toLowerCase().replace(/[^a-z0-9_]/g,"").replace(/^[^a-z]+/,"").replace(/_+/g,"_").replace(/_$/,"")}
function makeName(style,min,max,keyword,digits,underscore){
  const words=vocab[style]||vocab.random; let word;
  if(keyword){const k=clean(keyword); word=Math.random()<.58?k+pick(tails):pick(words)+k;}
  else {const a=pick(words); word=Math.random()<.42?a+pick(tails):a+pick(words);}
  if(Math.random()<.17) word=pick(words)+pick(words);
  if(digits && Math.random()<.35) word+=String(Math.floor(10+Math.random()*989));
  if(underscore && Math.random()<.25) {const i=Math.max(1,Math.min(word.length-1,Math.floor(word.length/2)));word=word.slice(0,i)+"_"+word.slice(i);}
  word=clean(word);
  if(word.length<min) word+=pick(tails);
  if(word.length>max) word=word.slice(0,max);
  if(word.length<5) word=(word+pick(words)).slice(0,Math.max(5,min));
  return word;
}
function generate(){
  const style=$("style").value, max=Number($("length").value), min=5, keyword=$("keyword").value.trim();
  const digits=$("digits").checked, underscore=$("underscore").checked, set=new Set();
  let attempts=0;
  while(set.size<1000 && attempts<30000){set.add(makeName(style,min,max,keyword,digits,underscore));attempts++;}
  state.names=[...set].slice(0,1000);state.statuses.clear();state.filter="all";
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.filter==="all"));
  $("subhead").textContent=`Создано ${state.names.length.toLocaleString("ru-RU")} уникальных вариантов`;
  $("check").disabled=false;$("copyAll").disabled=false;render();
}
function render(){
  const available=[...state.statuses.values()].filter(x=>x==="available").length;
  const taken=[...state.statuses.values()].filter(x=>x==="taken").length;
  $("total").textContent=state.names.length.toLocaleString("ru-RU");$("available").textContent=state.statuses.size?available:"—";$("taken").textContent=state.statuses.size?taken:"—";$("favoritesCount").textContent=state.favorites.size;$("allCount").textContent=state.names.length;
  let shown=state.names.filter(n=>state.filter==="favorites"?state.favorites.has(n):state.filter==="available"?state.statuses.get(n)==="available":true);
  $("showing").textContent=`Показано ${shown.length.toLocaleString("ru-RU")} из ${state.names.length.toLocaleString("ru-RU")}`;
  const list=$("list");
  if(!shown.length){list.innerHTML='<div class="empty"><div class="empty-icon">⌕</div><b>Пока ничего нет</b><span>Сгенерируй варианты или добавь ники в избранное</span></div>';return;}
  list.innerHTML=shown.slice(0,250).map(n=>{
    const status=state.statuses.get(n)||"unchecked", label={unchecked:"Не проверен",available:"Свободен",taken:"Занят",unknown:"Неизвестно"}[status];
    return `<div class="name-row"><span class="name"><span class="at">@</span>${n}</span><span class="status ${status}">${label}</span><button class="mini-btn ${state.favorites.has(n)?"fav":""}" data-fav="${n}" title="Избранное">${state.favorites.has(n)?"★":"☆"}</button><button class="mini-btn copy" data-copy="${n}" title="Копировать">⧉</button></div>`;
  }).join("");
}
$("list").addEventListener("click",e=>{
 const f=e.target.closest("[data-fav]"),c=e.target.closest("[data-copy]");
 if(f){const n=f.dataset.fav;state.favorites.has(n)?state.favorites.delete(n):state.favorites.add(n);render();}
 if(c){navigator.clipboard?.writeText("@"+c.dataset.copy);c.textContent="✓";setTimeout(()=>c.textContent="⧉",900);}
});
$("generate").onclick=generate;
$("length").oninput=()=>{$("lengthValue").textContent="5–"+$("length").value};
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{state.filter=b.dataset.filter;document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));render();});
$("copyAll").onclick=()=>{const names=state.names.filter(n=>state.filter==="favorites"?state.favorites.has(n):state.filter==="available"?state.statuses.get(n)==="available":true).map(n=>"@"+n).join("\n");navigator.clipboard?.writeText(names);$("copyAll").textContent="Скопировано ✓";setTimeout(()=>$("copyAll").textContent="Копировать список",1300);};
async function refreshStatus(){try{const r=await fetch("/api/status");const d=await r.json();$("apiStatus").textContent=d.connected?"Telegram подключён":d.checkerConfigured?"API настроен":"Нужна настройка API";}catch{$("apiStatus").textContent="Сервер не запущен";}}
$("check").onclick=async()=>{
 if(!state.names.length)return;
 $("check").disabled=true;$("check").textContent="Проверяем…";
 const batches=[];for(let i=0;i<state.names.length;i+=20)batches.push(state.names.slice(i,i+100));
 try{
  for(let i=0;i<batches.length;i++){
   $("check").textContent=`Проверяем ${Math.min((i+1)*20,state.names.length)} / ${state.names.length}`;
   const r=await fetch("/api/check",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({usernames:batches[i]})});
   const d=await r.json();if(!r.ok)throw new Error(d.error||"Ошибка проверки");
   for(const item of d.results||[])state.statuses.set(item.username,item.status);
   render();
  }
  $("subhead").textContent="Проверка завершена. Перепроверь понравившиеся имена перед регистрацией.";
 }catch(e){alert(e.message+"\n\nПроверь настройки Telegram API и запусти сервер.");}
 finally{$("check").disabled=false;$("check").textContent="Проверить в Telegram ↗";refreshStatus();}
};
refreshStatus();