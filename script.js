const screens=[...document.querySelectorAll(".screen")];
const app=document.getElementById("app"),progress=document.getElementById("progress");
let current=0,tx=0,ty=0;

function show(i,dir=1){
  if(i===current)return;
  const old=screens[current];
  app.dataset.dir=dir>0?"next":"prev";
  old.classList.remove("active");old.classList.add("leaving");
  setTimeout(()=>old.classList.remove("leaving"),520);
  current=i;screens[i].classList.remove("leaving");screens[i].classList.add("active");
  document.body.classList.toggle("at-gate",i===0);
  progress.style.setProperty("--p",`${(i/(screens.length-1))*100}%`);
  const c=screens[i].classList;
  c.contains("wishes")?startWishes():stopWishes();
  c.contains("sky-screen")?resetSky():stopSky();
  c.contains("final-screen")?startRain():stopRain();
}
function go(d){
  if(current===0)return;
  const t=current+d;
  if(t<1||t>=screens.length)return;
  show(t,d);
}
document.querySelectorAll("[data-next]").forEach(b=>b.addEventListener("click",()=>go(1)));
document.getElementById("restart").addEventListener("click",()=>{confetti(40);show(1,-1)});
document.addEventListener("keydown",e=>{
  if(e.key==="ArrowRight"||e.key===" ")go(1);
  if(e.key==="ArrowLeft")go(-1);
});
document.addEventListener("touchstart",e=>{tx=e.changedTouches[0].clientX;ty=e.changedTouches[0].clientY},{passive:true});
document.addEventListener("touchend",e=>{
  const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;
  if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy))go(dx<0?1:-1);
},{passive:true});

/* ---------- Gate: open surprise + start music ---------- */
document.getElementById("openBtn").addEventListener("click",()=>{
  startMusic();
  show(1,1);
  setTimeout(()=>confetti(80),350);
});

/* ---------- Cake ---------- */
const cake=document.getElementById("cake"),wishBtn=document.getElementById("wishBtn"),wishResult=document.getElementById("wishResult");
let blown=false;
function blow(){
  if(blown)return;blown=true;
  cake.classList.add("out","bounce");
  [104,138,172].forEach((l,i)=>{
    for(let k=0;k<2;k++){
      const p=document.createElement("span");p.className="puff";
      p.style.left=(l-2)+"px";p.style.setProperty("--dx",((Math.random()-.5)*50)+"px");
      p.style.animationDelay=(k*.2+i*.05)+"s";cake.appendChild(p);
      setTimeout(()=>p.remove(),2200);
    }
  });
  wishBtn.textContent="🎉 Wish Made!";
  wishResult.textContent="May all your little wishes come true, Divyanshu! ❤️";
  confetti(90);setTimeout(()=>confetti(50),500);
}
wishBtn.addEventListener("click",blow);
cake.addEventListener("click",blow);

/* ---------- Family wishes: ek-ek karke ---------- */
const cards=[...document.querySelectorAll(".wcard")],wdots=document.getElementById("wdots"),wNext=document.getElementById("wNext"),wcount=document.getElementById("wcount");
cards.forEach(()=>wdots.appendChild(document.createElement("i")));
let wi=0;
function setWish(i){
  wi=Math.max(0,Math.min(i,cards.length-1));
  cards.forEach((c,k)=>c.classList.toggle("on",k===wi));
  [...wdots.children].forEach((d,k)=>d.classList.toggle("on",k===wi));
  wcount.textContent=`Wish ${wi+1} of ${cards.length}`;
  wNext.textContent=wi===cards.length-1?"🎆 Sky show dekho":"Next wish →";
}
function nextWish(){wi===cards.length-1?(confetti(40),go(1)):setWish(wi+1)}
function startWishes(){setWish(0)}
function stopWishes(){}
wNext.addEventListener("click",nextWish);
document.getElementById("wishStage").addEventListener("click",()=>{if(wi<cards.length-1)setWish(wi+1)});

/* ---------- Sky show ---------- */
const skyBox=document.getElementById("skyBox"),skyCv=document.getElementById("skyCv"),skyHint=document.getElementById("skyHint");
const SC=["#ff6b9d","#ffd36e","#7ed9ff","#9bf0a5","#c9a8f0","#ff9a5b","#ffffff"];
let sparks=[],shoots=[],skyRaf=null,skyAuto=null,skyOn=false,skyT=0;
function fit(){skyCv.width=skyBox.clientWidth;skyCv.height=skyBox.clientHeight}
function burst(x,y){
  const col=SC[Math.floor(Math.random()*SC.length)],col2=SC[Math.floor(Math.random()*SC.length)],n=46;
  for(let i=0;i<n;i++){
    const a=i/n*6.283,v=1.5+Math.random()*2.6;
    sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1,c:i%2?col:col2,r:2.4});
  }
  if(Math.random()<.4)for(let i=0;i<6;i++)sparks.push({x,y,vx:(Math.random()-.5)*3,vy:-Math.random()*3-1,l:1,e:["⭐","💖","🎈","✨"][i%4]});
}
function skyLoop(){
  const c=skyCv.getContext("2d");c.clearRect(0,0,skyCv.width,skyCv.height);skyT++;
  c.fillStyle="#fff";
  for(let i=0;i<40;i++){c.globalAlpha=.4+.4*Math.sin(skyT/20+i);c.fillRect((i*83)%skyCv.width,(i*47)%(skyCv.height*.7),2,2)}
  sparks.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;p.vy+=.035;p.vx*=.99;p.l-=.011;
    c.globalAlpha=Math.max(p.l,0);
    if(p.e){c.font="18px serif";c.fillText(p.e,p.x,p.y)}
    else{c.fillStyle=p.c;c.shadowColor=p.c;c.shadowBlur=8;c.beginPath();c.arc(p.x,p.y,p.r,0,6.283);c.fill();c.shadowBlur=0}
  });
  sparks=sparks.filter(p=>p.l>0);
  if(skyOn&&Math.random()<.012)shoots.push({x:Math.random()*skyCv.width*.6,y:Math.random()*60,l:1});
  shoots.forEach(s=>{s.x+=7;s.y+=3.5;s.l-=.03;c.globalAlpha=Math.max(s.l,0);c.strokeStyle="#fff";c.lineWidth=2;c.beginPath();c.moveTo(s.x,s.y);c.lineTo(s.x-30,s.y-15);c.stroke()});
  shoots=shoots.filter(s=>s.l>0);
  c.globalAlpha=1;
  skyRaf=requestAnimationFrame(skyLoop);
}
function startSky(){
  if(skyOn){return}
  skyOn=true;fit();skyBox.classList.add("show");
  skyHint.textContent="Aur dhamaka ke liye aasmaan par tap karte raho 🎆";
  confetti(50);
  let n=0;burst(skyCv.width*.5,skyCv.height*.35);
  skyAuto=setInterval(()=>{burst(skyCv.width*(.15+Math.random()*.7),skyCv.height*(.12+Math.random()*.4));if(++n>14){clearInterval(skyAuto)}},700);
  if(!skyRaf)skyLoop();
}
function stopSky(){
  clearInterval(skyAuto);cancelAnimationFrame(skyRaf);skyRaf=null;sparks=[];shoots=[];skyOn=false;
}
function resetSky(){
  stopSky();skyBox.classList.remove("show");
  skyHint.textContent="Aasmaan par tap karo — sky show shuru hoga ✨";
}
skyBox.addEventListener("click",e=>{
  if(!skyOn){startSky();return}
  const r=skyBox.getBoundingClientRect();burst(e.clientX-r.left,e.clientY-r.top);
});
skyBox.addEventListener("keydown",e=>{if(e.key==="Enter"){e.stopPropagation();skyOn?burst(skyCv.width/2,skyCv.height/3):startSky()}});

/* ---------- Confetti & sparkles ---------- */
const COLORS=["#f5a3c0","#ffd36e","#8fd3ee","#b9e5a8","#c9a8f0","#ff9a8b"],EMO=["🎈","✨","💙","⭐","🧸"];
function piece(cls){
  const el=document.createElement("span");el.className="cf "+cls;
  if(Math.random()<.22){el.textContent=EMO[Math.floor(Math.random()*EMO.length)];el.style.fontSize="1.4rem"}
  else{const s=6+Math.random()*8;el.style.width=s+"px";el.style.height=(Math.random()<.5?s:s*1.8)+"px";
    el.style.background=COLORS[Math.floor(Math.random()*COLORS.length)];el.style.borderRadius=Math.random()<.4?"50%":"2px"}
  el.style.setProperty("--x",((Math.random()-.5)*(cls==="rain"?30:110))+"vw");
  return el;
}
function confetti(n=60){
  for(let i=0;i<n;i++){
    const el=piece("burst"),d=2.2+Math.random()*1.4;
    el.style.left=(42+Math.random()*16)+"vw";el.style.top=(48+Math.random()*8)+"vh";
    el.style.setProperty("--up",-(20+Math.random()*35)+"vh");el.style.setProperty("--d",d+"s");
    el.style.animationDelay=(Math.random()*.25)+"s";
    document.body.appendChild(el);setTimeout(()=>el.remove(),(d+.5)*1000);
  }
}
let rainT=null;
function startRain(){
  confetti(70);stopRain();
  rainT=setInterval(()=>{
    for(let i=0;i<3;i++){
      const el=piece("rain"),d=3.5+Math.random()*2.5;
      el.style.left=Math.random()*100+"vw";el.style.setProperty("--d",d+"s");
      document.body.appendChild(el);setTimeout(()=>el.remove(),d*1000+100);
    }
  },380);
}
function stopRain(){clearInterval(rainT)}
document.addEventListener("pointerdown",e=>{
  for(let i=0;i<6;i++){
    const s=document.createElement("span");s.className="spark";s.textContent=Math.random()<.5?"✦":"✧";
    s.style.left=e.clientX+"px";s.style.top=e.clientY+"px";s.style.fontSize=(10+Math.random()*12)+"px";
    const a=Math.random()*6.28,r=30+Math.random()*40;
    s.style.setProperty("--x",Math.cos(a)*r+"px");s.style.setProperty("--y",Math.sin(a)*r+"px");
    document.body.appendChild(s);setTimeout(()=>s.remove(),850);
  }
});

/* ---------- Floating balloons / clouds ---------- */
(function(){
  const f=document.getElementById("floaties"),E=["🎈","🎈","☁️","⭐","🧸","🎈"];
  for(let i=0;i<9;i++){
    const s=document.createElement("span");s.textContent=E[i%E.length];
    s.style.left=(Math.random()*92)+"vw";s.style.fontSize=(1.2+Math.random()*1.3)+"rem";
    s.style.setProperty("--sw",((Math.random()-.5)*14)+"vw");
    s.style.animationDuration=(16+Math.random()*14)+"s";s.style.animationDelay=-(Math.random()*24)+"s";
    f.appendChild(s);
  }
})();

/* ---------- Music: own mp3 (assets/birthday-song.mp3) or built-in music-box Happy Birthday ---------- */
const song=document.getElementById("song"),musicBtn=document.getElementById("musicBtn");
let ctx=null,synthT=null,mode=null,playing=false;
const N={G4:392,A4:440,B4:493.88,C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99,C3:130.81,G2:98,F3:174.61};
const MELODY=[["G4",.75],["G4",.25],["A4",1],["G4",1],["C5",1],["B4",2],
["G4",.75],["G4",.25],["A4",1],["G4",1],["D5",1],["C5",2],
["G4",.75],["G4",.25],["G5",1],["E5",1],["C5",1],["B4",1],["A4",1],
["F5",.75],["F5",.25],["E5",1],["C5",1],["D5",1],["C5",2]];
const BASS=["C3","C3","C3","G2","C3","F3","F3","C3"];
function note(f,t,d,v){
  const g=ctx.createGain(),o=ctx.createOscillator(),o2=ctx.createOscillator(),g2=ctx.createGain();
  o.type="sine";o.frequency.value=f;o2.type="triangle";o2.frequency.value=f*2;g2.gain.value=.22;
  o.connect(g);o2.connect(g2);g2.connect(g);g.connect(ctx.destination);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.012);
  g.gain.exponentialRampToValueAtTime(.001,t+d+.9);
  o.start(t);o2.start(t);o.stop(t+d+1);o2.stop(t+d+1);
}
function loop(){
  const B=.52;let t=ctx.currentTime+.15;
  MELODY.forEach(([n,b])=>{note(N[n],t,b*B,.16);t+=b*B});
  BASS.forEach((n,i)=>note(N[n],ctx.currentTime+.15+i*3*B,3*B*.9,.09));
  synthT=setTimeout(loop,(24*B+2)*1000);
}
function startSynth(){
  if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();
  ctx.resume();mode="synth";loop();
}
function stopSynth(){clearTimeout(synthT);if(ctx){ctx.close();ctx=null}}
function setBtn(){musicBtn.classList.toggle("on",playing);musicBtn.classList.toggle("off",!playing);musicBtn.textContent=playing?"🎵":"🔇"}
function startMusic(){
  playing=true;setBtn();
  if(mode==="synth"){startSynth();return}
  song.play().then(()=>{mode="file"}).catch(()=>{if(playing)startSynth()});
}
function stopMusic(){
  playing=false;setBtn();
  if(mode==="file")song.pause();else stopSynth();
}
musicBtn.addEventListener("click",()=>playing?stopMusic():startMusic());
setBtn();musicBtn.classList.remove("on");
progress.style.setProperty("--p","0%");
