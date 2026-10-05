/* Lembro com o que sobrou | p5.js 2.x, sem imagens ou geometria de fontes.
   Uma letra é um objeto único. transfer() move esse objeto; nunca o copia.
   Origem é imutável; traits e scars guardam o percurso até o reinício explícito. */
'use strict';
const DEFINITIONS = [
  {name:'O ROSTO', sense:'visual', phrase:'teu rosto ficava perto. eu não sabia que perto também acaba.', note:'um contorno ainda reconhece você'},
  {name:'A VOZ', sense:'sonora', phrase:'tua voz dizia fica. entre uma palavra e outra cabia a casa inteira.', note:'o silêncio tem o tamanho de uma sílaba'},
  {name:'O CALOR', sense:'térmica', phrase:'era morna a tua mão. o frio só chegou depois que esqueci a hora.', note:'uma presença alguns graus acima da ausência'},
  {name:'O TOQUE', sense:'tátil', phrase:'a manga áspera roçava meu braço. ainda sinto onde já não encostas.', note:'a pele lembra antes do nome'}
];
const COLORS = [[45,63,70],[81,102,127],[168,77,48],[104,108,73]];
const memories = []; const letters = [];
let selected=0, held=false, dragging=null, hoverLetter=null, paused=false, clock=0, lastRecovery=-1000, moves=0;
let boardW=0, boardH=0, mobile=false, pointer={x:-100,y:-100}, nextId=0;
const $ = id => document.getElementById(id);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function samplePaths(paths, count){
  const segments=[]; let total=0;
  for(const path of paths) for(let i=1;i<path.length;i++){
    const a=path[i-1],b=path[i],d=Math.hypot(b[0]-a[0],b[1]-a[1]);
    segments.push({a,b,start:total,d});total+=d;
  }
  return Array.from({length:count},(_,i)=>{
    const at=(i+.5)/count*total;const s=segments.find(s=>at<=s.start+s.d)||segments.at(-1);
    const f=(at-s.start)/s.d;return {x:s.a[0]+(s.b[0]-s.a[0])*f,y:s.a[1]+(s.b[1]-s.a[1])*f};
  });
}
function form(kind,n){
  if(kind===0)return samplePaths([
    [[-.08,-.93],[-.43,-.88],[-.63,-.6],[-.65,-.1],[-.51,.47],[-.23,.82],[.08,.95],[.35,.72],[.56,.26],[.61,-.3],[.46,-.73],[.1,-.92],[-.08,-.93]],
    [[-.46,-.22],[-.31,-.31],[-.14,-.22]],[[.11,-.24],[.27,-.3],[.43,-.21]],
    [[.01,-.15],[-.06,.23],[.11,.28]],[[ -.23,.5],[0,.55],[.25,.46]]
  ],n);
  if(kind===1) return Array.from({length:n},(_,i)=>{const u=i/(n-1);return{x:(u*2-1)*.98,y:Math.sin(u*Math.PI*17)*(.25+.5*Math.sin(u*Math.PI))};});
  if(kind===2) return Array.from({length:n},(_,i)=>{const u=i/(n-1),a=u*Math.PI*7,r=.15+.73*u;return{x:Math.cos(a)*r,y:Math.sin(a)*r};});
  const paths=[];for(let k=0;k<5;k++){const r=.3+k*.15;const path=[];for(let j=0;j<=30;j++){const a=-.35+j/30*Math.PI*1.78;path.push([Math.cos(a)*r*.85,Math.sin(a)*r]);}paths.push(path);}return samplePaths(paths,n);
}
function build(){
  memories.length=0;letters.length=0;nextId=0;moves=0;clock=0;dragging=null;held=false;
  DEFINITIONS.forEach((def,m)=>{
    const chars=Array.from(def.phrase);const n=chars.filter(c=>c!==' ').length;const points=form(m,n);let j=0;
    const memory={...def,id:m,slots:[],phraseSlots:[],el:document.createElement('article')};
    chars.forEach(char=>{if(char===' '){memory.phraseSlots.push(null);return;}const pos=points[j++];const slot={...pos,want:char,m,token:null,base:true};memory.slots.push(slot);memory.phraseSlots.push(slot);});
    // Lugares periféricos acolhem letras deslocadas sem criar novos recursos.
    for(let k=0;k<30;k++){const a=k/30*Math.PI*2;memory.slots.push({x:Math.cos(a)*1.09,y:Math.sin(a)*1.04,want:null,m,token:null,base:false});}
    memory.el.className='memory';memory.el.innerHTML=`<button class="memory-head" aria-label="Selecionar ${def.name.toLowerCase()}"><span class="number">0${m+1}</span><strong>${def.name}</strong><span class="condition"></span></button><p class="transcription"></p>`;
    memory.el.querySelector('button').onclick=()=>choose(m);memories.push(memory);
    memory.slots.filter(s=>s.base).forEach((slot,i)=>{if(i%5===1)return;const token={id:nextId++,char:slot.want,origin:m,home:slot,slot,traits:[0,0,0,0],scars:0,x:0,y:0,phase:i*.73,settled:false};token.traits[m]=1;slot.token=token;letters.push(token);});
  });
  $('memories').replaceChildren(...memories.map(m=>m.el));
  // A demanda (211 posições) excede o estoque (169 letras). Nenhuma interação cria letras.
  // Algumas letras já começam abrigadas em outra lembrança.
  for(const memory of memories){const displaced=memory.slots.filter((s,i)=>s.base&&s.token&&i%13===0).map(s=>s.token);for(const token of displaced){const dest=memories[(memory.id+1)%4].slots.find(s=>!s.base&&!s.token);token.slot.token=null;dest.token=token;token.slot=dest;token.traits[dest.m]=.16;}}
  $('pool').textContent=letters.length;choose(0);layout();updateText();
}
function choose(m){selected=m;memories.forEach(mem=>{mem.el.classList.toggle('active',mem.id===m);mem.el.querySelector('button').setAttribute('aria-pressed',String(mem.id===m));});$('recover').setAttribute('aria-label',`Reconstruir ${DEFINITIONS[m].name.toLowerCase()}`);updateText();}
function layout(){
  if(!memories.length)return;
  boardW=$('stage').clientWidth;mobile=boardW<620;boardH=mobile?1460:690;$('stage').style.height=boardH+'px';
  memories.forEach((m,i)=>{
    const col=mobile?0:i%2,row=mobile?i:Math.floor(i/2),w=mobile?boardW:boardW/2;
    m.box={x:col*w,y:row*(mobile?365:345),w,h:mobile?365:345};
    m.cx=m.box.x+w/2;m.cy=m.box.y+150;m.sx=Math.min(w*.34,160);m.sy=91;
    Object.assign(m.el.style,{left:(m.box.x+14)+'px',top:(m.box.y+14)+'px',width:(w-28)+'px'});
    m.el.querySelector('.transcription').style.top='247px';
  });
}
function targetFor(slot){const m=memories[slot.m];return{x:m.cx+slot.x*m.sx,y:m.cy+slot.y*m.sy};}
function transfer(token,dest,announce=true){
  if(!token||!dest||dest.token||token.slot===dest)return false;
  const source=token.slot,from=source.m;source.token=null;dest.token=token;token.slot=dest;
  if(from!==dest.m){token.scars++;token.traits[dest.m]=Math.min(1,token.traits[dest.m]+.25);token.traits[from]=Math.min(1,token.traits[from]+.12);moves++;}
  if(announce&&from!==dest.m){
    const messages=[['O rosto reaprende seu próprio contorno.','Agora o rosto gagueja com letras da voz.','O rosto se aquece com o que a mão perdeu.','O rosto resiste: aprendeu a ser toque.'],['A voz guarda uma distância entre os olhos.','A voz volta, mas não no mesmo ritmo.','Agora a voz é lembrada em temperatura.','A voz se agarra àquilo que tenta dizer.'],['O calor ganha um contorno que não era seu.','A distância entre duas mãos adquire ritmo.','O calor retorna com outra demora.','A temperatura encontra uma superfície.'],['O toque conserva a posição de um rosto.','A pele começa a gaguejar.','O toque sobe como ar morno.','A pele reencontra uma letra, com cicatrizes.']];
    $('event').textContent=messages[dest.m][token.origin];
  }
  updateText();return true;
}
function recover(){
  const memory=memories[selected];const gaps=memory.slots.filter(s=>s.base&&!s.token);
  if(!gaps.length){$('event').textContent='A frase está inteira. Isso não significa que voltou a ser a mesma.';return false;}
  // Prioriza a letra correta, mas só usa unidades que realmente existem.
  let dest,token;
  for(const gap of gaps){const candidates=letters.filter(t=>t.char===gap.want&&t.slot.m!==selected&&t!==dragging);if(candidates.length){dest=gap;token=candidates.sort((a,b)=>Number(a.slot.base)-Number(b.slot.base)||a.scars-b.scars)[0];break;}}
  if(!token){for(const gap of gaps){token=letters.find(t=>t.slot.m===selected&&!t.slot.base&&t.char===gap.want&&t!==dragging);if(token){dest=gap;break;}}}
  if(!token){dest=gaps[0];token=letters.filter(t=>t.slot.m!==selected&&t!==dragging).sort((a,b)=>Number(a.slot.base)-Number(b.slot.base))[0];}
  return transfer(token,dest);
}
function goHome(token){
  if(!token||token.slot===token.home)return;
  const occupied=token.home.token;
  if(occupied){$('event').textContent='O lugar de origem está ocupado. Abra espaço retirando a outra letra.';return;}
  transfer(token,token.home);$('event').textContent='A letra voltou. O caminho ficou nela.';
}
function updateText(){
  if(!memories.length)return;
  memories.forEach(m=>{
    const base=m.slots.filter(s=>s.base),present=base.filter(s=>s.token).length;
    m.el.querySelector('.condition').textContent=`${present}/${base.length}`;
    const p=m.el.querySelector('.transcription');p.replaceChildren();
    for(const slot of m.phraseSlots){if(!slot){p.append(' ');continue;}if(slot.token)p.append(slot.want);else{const gap=document.createElement('span');gap.className='gap';gap.textContent='·';p.append(gap);}}
    const note=document.createElement('span');note.className='memory-note';const borrowed=letters.filter(t=>t.slot.m===m.id&&t.origin!==m.id).length;
    note.textContent=borrowed?`${borrowed} letras de outras lembranças · ${m.note}`:m.note;p.append(note);
  });
  $('scar-count').textContent=letters.filter(t=>t.scars>0).length;
  $('recover').disabled=!memories[selected].slots.some(s=>s.base&&!s.token);
  if($('recover').disabled)setHeld(false);
}
function nearest(x,y,r=23){let found=null,best=r;for(const t of letters){const d=Math.hypot(t.x-x,t.y-y);if(d<best){best=d;found=t;}}return found;}
function setHeld(value){held=value;$('recover').classList.toggle('is-held',value);}
function release(){
  if(dragging){
    const memory=memories.find(m=>pointer.x>=m.box.x&&pointer.x<m.box.x+m.box.w&&pointer.y>=m.box.y&&pointer.y<m.box.y+m.box.h);
    if(memory&&memory.id!==dragging.slot.m){const available=memory.slots.filter(s=>!s.token).sort((a,b)=>{const p=targetFor(a),q=targetFor(b);return Math.hypot(p.x-pointer.x,p.y-pointer.y)-Math.hypot(q.x-pointer.x,q.y-pointer.y);});if(available[0])transfer(dragging,available[0]);else $('event').textContent='Esta lembrança não tem espaço. Retire uma letra primeiro.';}
    dragging=null;
  }
  setHeld(false);
}
function setup(){
  const canvas=createCanvas($('stage').clientWidth,690);canvas.parent('canvas-host');pixelDensity(Math.min(window.devicePixelRatio||1,2));textFont('Georgia');textAlign(CENTER,CENTER);noStroke();
  paused=reduced;$('pause').textContent=paused?'Retomar movimento':'Pausar movimento';$('pause').setAttribute('aria-pressed',String(paused));
  build();resizeCanvas(boardW,boardH);document.body.classList.add('ready');
  const el=canvas.elt;el.setAttribute('aria-label','Lembranças construídas com letras. Use os botões ou as teclas de 1 a 4 e espaço para redistribuir os caracteres.');
  const locate=e=>{const r=el.getBoundingClientRect();pointer={x:(e.clientX-r.left)*width/r.width,y:(e.clientY-r.top)*height/r.height};};
  el.addEventListener('pointerdown',e=>{if(e.button!==0)return;locate(e);dragging=nearest(pointer.x,pointer.y);if(dragging){el.setPointerCapture(e.pointerId);e.preventDefault();}else{const m=memories.find(m=>pointer.x>=m.box.x&&pointer.x<m.box.x+m.box.w&&pointer.y>=m.box.y&&pointer.y<m.box.y+m.box.h);if(m)choose(m.id);}});
  el.addEventListener('pointermove',e=>{locate(e);hoverLetter=nearest(pointer.x,pointer.y);el.style.cursor=dragging?'grabbing':hoverLetter?'grab':'default';});
  el.addEventListener('pointerup',e=>{locate(e);release();});el.addEventListener('pointercancel',()=>{dragging=null;setHeld(false);});el.addEventListener('dblclick',e=>{locate(e);goHome(nearest(pointer.x,pointer.y));});
  $('recover').addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();setHeld(true);recover();lastRecovery=performance.now();$('recover').setPointerCapture(e.pointerId);});
  $('recover').addEventListener('pointerup',()=>setHeld(false));$('recover').addEventListener('pointercancel',()=>setHeld(false));
  $('recover').addEventListener('click',e=>{if(e.detail===0)recover();});
  window.addEventListener('keydown',e=>{if(e.target.matches('input,textarea,select')||e.altKey||e.ctrlKey||e.metaKey)return;if(['1','2','3','4'].includes(e.key))choose(Number(e.key)-1);if(e.code==='Space'&&!e.target.matches('button,summary')){e.preventDefault();if(!held){setHeld(true);recover();lastRecovery=performance.now();}}if(e.key==='Escape'){dragging=null;setHeld(false);}});
  // Espaço no botão tem repetição sustentada sem interferir em outros botões.
  $('recover').addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();if(!held){setHeld(true);recover();lastRecovery=performance.now();}}});
  window.addEventListener('keyup',e=>{if(e.code==='Space')setHeld(false);});window.addEventListener('blur',()=>{dragging=null;setHeld(false);});
  $('pause').onclick=()=>{paused=!paused;$('pause').textContent=paused?'Retomar movimento':'Pausar movimento';$('pause').setAttribute('aria-pressed',String(paused));};
  $('reset').onclick=()=>{build();$('event').textContent='Outra memória começa. O mesmo limite, outras escolhas.';};
  describe('Quatro imagens compostas exclusivamente por letras: rosto, onda de voz, espiral de calor e impressão de toque. Transferir letras abre lacunas nas frases e mistura movimentos sensoriais.');
}
function draw(){
  background('#efece4');if(!memories.length)return;
  if(!paused)clock+=Math.min(deltaTime,50)/1000;
  if(held&&performance.now()-lastRecovery>240){recover();lastRecovery=performance.now();}
  const dt=Math.min(deltaTime,50)/16.67;
  for(const m of memories){
    const base=m.slots.filter(s=>s.base),remaining=base.filter(s=>s.token).length/base.length;
    m.loss=1-remaining;
    // A ausência continua legível: vírgulas e pontos são sinais de vazio, não letras utilizáveis.
    for(const s of base){if(s.token)continue;const p=targetFor(s);fill(170,157,143,paused?65:55+20*Math.sin(clock+s.x));textSize(9);text('·',p.x,p.y);}
  }
  for(const token of letters){
    const m=memories[token.slot.m],t=clock,ph=token.phase,traits=token.traits;
    const p=targetFor(token.slot);
    // Com menos letras, o conjunto aproxima-se: redistribuição espacial dos recursos restantes.
    let tx=m.cx+(p.x-m.cx)*(1-m.loss*.19),ty=m.cy+(p.y-m.cy)*(1-m.loss*.12);
    // Uma letra visual carrega um desvio em direção às relações de posição da origem.
    if(token.slot.m!==0&&traits[0]){tx+=token.home.x*13*traits[0];ty+=token.home.y*9*traits[0];}
    const beat=Math.sin(t*4+Math.floor(ph/2));const stutter=Math.floor(t*6+ph)%7<2;
    tx+=traits[1]*(stutter?-3:2)*Math.sin(ph);ty+=traits[1]*beat*4;
    tx+=traits[2]*Math.sin(t*.9+ph)*4;ty-=traits[2]*(Math.sin(t*1.2+ph)*7+2);
    if(token===dragging){tx=pointer.x;ty=pointer.y;}
    if(!token.settled){token.x=tx;token.y=ty;token.settled=true;}
    const spring=token===dragging?(.38-.23*traits[3]):(.17-.09*traits[3]);const blend=1-Math.pow(1-spring,dt);
    token.x+=(tx-token.x)*blend;token.y+=(ty-token.y)*blend;
    const c=COLORS[token.origin],heat=traits[2];const r=c[0]*(1-heat*.3)+168*heat*.3,g=c[1]*(1-heat*.3)+77*heat*.3,b=c[2]*(1-heat*.3)+48*heat*.3;
    push();translate(token.x,token.y);
    const squish=traits[3]*(.09*Math.sin(t*1.8+ph)+(token===dragging?.22:0));scale(1+squish,1-squish);
    rotate(token.slot.m===2?Math.sin(t*.8+ph)*.11:0);
    textSize((mobile?16:18)+(token===hoverLetter?4:0)+traits[1]*beat*1.3);
    if(traits[1]>.2){fill(r,g,b,35*traits[1]);text(token.char,-6*traits[1],0);}
    if(token.scars>0){fill(r,g,b,Math.min(55,15+token.scars*7));text(token.char,2,3);}
    fill(r,g,b,traits[1]>.5&&stutter?145:230);text(token.char,0,0);pop();
  }
}
function windowResized(){layout();resizeCanvas(boardW,boardH);letters.forEach(t=>{t.settled=false;});}
// Estado inspecionável para verificar conservação e percurso sem depender da animação.
window.memoryArtwork={memories,letters,recover,choose,transfer,goHome,get moves(){return moves;}};
window.addEventListener('load',()=>{if(typeof window.p5==='undefined')$('loading').textContent='Não foi possível carregar p5.js pelo CDN. Verifique sua conexão e recarregue a página.';});
