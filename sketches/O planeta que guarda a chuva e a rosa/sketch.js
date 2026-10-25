/* O PLANETA QUE GUARDA A CHUVA
 * Henrique Kezen V. H. Leite — p5.js 2.2.3 / WEBGL
 * Todas as formas nascem de primitivas: não há imagens nem modelos externos.
 * +Y aponta para baixo. O planeta fica na origem e a árvore cresce em +Y.
 */
const RAIO = 80;
const gotas = [], reservadas = [], impactos = [];
let mundo, arvore, agua, aguaReservada, estrelas, shaderAgua, tela, tempo = 0;
let ciclo = null, pronto = false;
let etapaRosa = -1, tempoVidaRosa = 0, rosaAtiva = false, estadoAntesDeRecomecar = null;
let redomaAberta = false, aberturaRedoma = 0;
const POSICAO_ROSA = {x: 31, y: -70, z: 27};
const vista = { azimute:.34, elevacao:-.13, distancia:820, foco:0 };
const dedos = new Map();
let gesto = null, compacto = false;

// As gotas estáticas são reunidas em uma malha. Este pequeno shader move
// seus vértices na GPU: cada posição recebe uma fase diferente, sem milhares
// de chamadas de desenho por quadro. A deformação de cada gota é mínima.
const VERTICE_AGUA = `
precision highp float;
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec4 aVertexColor;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform float uTempo;
varying vec3 vNormal;
varying vec3 vVista;
varying vec4 vCor;
void main(){
 vec3 p=aPosition;
 p.x+=1.7*sin(uTempo*.47+p.y*.025+p.z*.013);
 p.y+=2.2*sin(uTempo*.55+p.x*.022+p.z*.018);
 p.z+=1.5*cos(uTempo*.41+p.y*.021+p.x*.014);
 vec4 pos=uModelViewMatrix*vec4(p,1.0);
 vNormal=normalize(uNormalMatrix*aNormal);
 vVista=-pos.xyz;
 vCor=aVertexColor;
 gl_Position=uProjectionMatrix*pos;
}`;
const FRAGMENTO_AGUA = `
precision mediump float;
varying vec3 vNormal;
varying vec3 vVista;
varying vec4 vCor;
void main(){
 vec3 n=normalize(vNormal),v=normalize(vVista);
 vec3 l=normalize(vec3(-.6,-.8,1.0));
 float dif=max(dot(n,l),0.0);
 float rim=pow(1.0-max(dot(n,v),0.0),3.0);
 float brilho=pow(max(dot(n,normalize(l+v)),0.0),35.0);
 vec3 cor=vCor.rgb*(.35+.65*dif)+vec3(.38,.56,.58)*brilho*.65+vec3(.08,.17,.19)*rim;
 gl_FragColor=vec4(cor,1.0);
}`;

function setup(){
  try {
    const host=document.getElementById('universo');
    compacto=host.clientWidth<650;
    tela=createCanvas(host.clientWidth,host.clientHeight,WEBGL);
    tela.parent(host);pixelDensity(1);frameRate(40);noStroke();
    randomSeed(91);noiseSeed(91);
    mundo=buildGeometry(construirPlaneta);
    arvore=buildGeometry(construirArvore);
    construirGotas(compacto?1500:2300);
    agua=buildGeometry(()=>{
      for(const g of gotas){
        if(g.reservada)continue;
        push();translate(g.x,g.y,g.z);fill(...g.cor);
        ellipsoid(g.r,g.r*1.52,g.r,6,4);pop();
      }
    });
    aguaReservada=buildGeometry(()=>{
      for(const g of reservadas){
        push();translate(g.x,g.y,g.z);fill(...g.cor);
        ellipsoid(g.r,g.r*1.52,g.r,6,4);pop();
      }
    });
    estrelas=buildGeometry(()=>{
      for(let i=0;i<115;i++){
        const direcao=p5.Vector.random3D().mult(random(1200,1800));
        push();translate(direcao);fill(random(110,190),random(140,185),190);
        sphere(random(.6,1.8),4,3);pop();
      }
    });
    shaderAgua=createShader(VERTICE_AGUA,FRAGMENTO_AGUA);
    configurarInteracao();
    document.getElementById('chover').onclick=iniciarChuva;
    document.getElementById('voltar').onclick=restaurarVista;
    document.getElementById('rosa').onclick=focarRosa;
    document.getElementById('redoma').onclick=alternarRedoma;
    document.getElementById('chover').disabled=false;
    atualizarBotaoRedoma();
    document.getElementById('estado').textContent='A rosa repousa sob a redoma fechada.';
    pronto=true;
    describe('Um planeta terroso, uma árvore invertida, milhares de gotas suspensas e uma rosa protegida por uma redoma. A redoma começa fechada. Só com a redoma aberta a chuva faz a rosa florescer e, depois, murchar.');
  }catch(e){
    console.error(e);
    document.getElementById('estado').textContent='Não foi possível iniciar o WebGL. Tente um navegador com aceleração gráfica habilitada.';
    noLoop();
  }
}

function construirPlaneta(){
  fill('#957655');sphere(RAIO,28,18);
  const cores=['#9d8262','#b09570','#786d50','#aa8b62','#737659'];
  for(let i=0;i<95;i++){
    const d=p5.Vector.random3D();
    if(d.y<-.52)continue;
    const r=random(6,16);
    push();translate(d.copy().mult(RAIO-r*.25));rotateX(random(TWO_PI));rotateZ(random(TWO_PI));
    fill(random(cores));ellipsoid(r,r*.65,r*1.15,7,5);pop();
  }
  for(let i=0;i<32;i++){
    const a=random(TWO_PI), y=random(-.25,.68);
    const d=createVector(cos(a)*sqrt(1-y*y),y,sin(a)*sqrt(1-y*y));
    push();translate(d.mult(RAIO+1));fill(random(['#7c8460','#6c7858','#93936b']));
    sphere(random(3,7),6,4);pop();
  }
}

function galho(a,b,raio,cor){
  const vetor=p5.Vector.sub(b,a), comprimento=vetor.mag();
  const direcao=vetor.copy().normalize();
  const eixo=createVector(direcao.z,0,-direcao.x);
  push();translate(p5.Vector.add(a,b).mult(.5));
  if(eixo.mag()>0.0001)rotate(acos(constrain(direcao.y,-1,1)),eixo);
  else if(direcao.y<0)rotateX(PI);
  if(Array.isArray(cor))fill(...cor);else fill(cor);
  cylinder(raio,comprimento,8,1);pop();
}

function construirArvore(){
  const base=createVector(0,76,0), junta=createVector(3,110,0);
  for(let i=0;i<7;i++){
    const a=i*TWO_PI/7;
    galho(createVector(cos(a)*28,74,sin(a)*28),junta,2.4,'#66513b');
  }
  galho(base,createVector(8,141,0),6,'#70523a');
  galho(createVector(8,138,0),createVector(-3,180,4),4.2,'#846044');
  const pontas=[];
  for(let i=0;i<9;i++){
    const a=i*2.39996;
    const de=createVector(5,130+i*4,1);
    const meio=createVector(cos(a)*24,168+i*3,sin(a)*24);
    const fim=createVector(cos(a)*43,192+i*2,sin(a)*38);
    galho(de,meio,2.7,'#806045');galho(meio,fim,1.6,'#97754e');
    pontas.push(fim);
  }
  const paleta=['#829582','#657f71','#a3ad87','#b8b98d','#738b79'];
  for(const p of pontas){
    for(let j=0;j<5;j++){
      push();translate(p.x+random(-13,13),p.y+random(-7,18),p.z+random(-12,12));
      rotateY(random(TWO_PI));rotateZ(random(-.5,.5));fill(random(paleta));
      ellipsoid(random(9,17),random(9,15),random(7,13),8,6);pop();
    }
  }
  for(const p of [pontas[1],pontas[4],pontas[7]]){
    push();translate(p.x,p.y+19,p.z+7);fill('#cf9c56');sphere(3.2,8,6);pop();
  }
}

function construirGotas(quantidade){
  for(let i=0;i<quantidade;i++){
    const u=(i+.5)/quantidade, t=PI*u, a=i*2.399963;
    const raio=235*sin(t)*(.52+.62*u)+random(-5,5)*sin(t);
    const g={x:cos(a)*raio,y:-330+640*u,z:sin(a)*raio,
      r:random(.85,2.05),fase:random(TWO_PI),reservada:false,
      cor:random([[69,126,144],[93,154,165],[124,175,177],[57,107,128],[158,192,185]])};
    if(g.y<-100&&g.y>-250&&g.z>5&&abs(g.x)<80&&reservadas.length<110){
      g.reservada=true;reservadas.push(g);
    }
    gotas.push(g);
  }
}

function restaurarVista(){
  vista.azimute=.34;vista.elevacao=-.13;vista.distancia=820;vista.foco=0;
}
function focarRosa(){
  vista.azimute=.42;vista.elevacao=-.37;vista.distancia=345;vista.foco=1;
}
function atualizarBotaoRedoma(){
  const botao=document.getElementById('redoma');
  if(botao)botao.textContent=redomaAberta?'Fechar redoma':'Abrir redoma';
}
function alternarRedoma(){
  redomaAberta=!redomaAberta;
  atualizarBotaoRedoma();
  if(redomaAberta){
    if(!rosaAtiva) document.getElementById('estado').textContent='A redoma foi aberta. Agora a chuva pode tocar a rosa.';
    else document.getElementById('estado').textContent='A redoma foi aberta. A rosa volta a sentir o tempo.';
  }else{
    document.getElementById('estado').textContent='A redoma foi fechada. A rosa fica preservada no estado em que está.';
  }
}

function iniciarChuva(){
  if(ciclo||!pronto)return;
  ciclo={inicio:tempo};
  for(const g of reservadas){
    g.atraso=random(0,1.5);g.duracao=random(1.3,2.3);g.atingiu=false;
    g.origem=createVector(g.x+1.7*sin(tempo*.47+g.y*.025+g.z*.013),
      g.y+2.2*sin(tempo*.55+g.x*.022+g.z*.018),g.z+1.5*cos(tempo*.41+g.y*.021+g.x*.014));
    g.alvo=g.origem.copy().normalize().mult(RAIO+1);
  }
  if(redomaAberta){
    estadoAntesDeRecomecar = estadoRosa();
    tempoVidaRosa=0;rosaAtiva=true;etapaRosa=0;
    document.getElementById('estado').textContent='A chuva toca a rosa aberta. Ela começa a despertar.';
  }else{
    document.getElementById('estado').textContent='A chuva cai do lado de fora, mas a redoma fechada impede qualquer mudança na rosa.';
  }
  document.getElementById('chover').disabled=true;
}

function draw(){
  if(!pronto)return;
  const dt=min(deltaTime,250)/1000;
  tempo+=dt;
  aberturaRedoma=lerp(aberturaRedoma,redomaAberta?1:0,.12);
  if(rosaAtiva && redomaAberta)tempoVidaRosa+=dt;
  clear();
  const alvoX=lerp(compacto?0:-100,POSICAO_ROSA.x,vista.foco);
  const alvoY=lerp(compacto?-18:-10,POSICAO_ROSA.y-24,vista.foco);
  const alvoZ=lerp(0,POSICAO_ROSA.z,vista.foco);
  const distancia=vista.distancia*(compacto?1.12:1);
  perspective(PI/3,width/height,10,5000);
  camera(alvoX+distancia*cos(vista.elevacao)*sin(vista.azimute),
    alvoY+distancia*sin(vista.elevacao),alvoZ+distancia*cos(vista.elevacao)*cos(vista.azimute),
    alvoX,alvoY,alvoZ,0,1,0);
  noStroke();
  push();emissiveMaterial(160);model(estrelas);pop();
  ambientLight(80,90,103);
  directionalLight(228,200,154,-.5,.5,-1);
  directionalLight(91,146,165,.8,-.1,.4);
  pointLight(160,183,183,-170,-160,240);
  push();shininess(8);model(mundo);model(arvore);pop();
  desenharRosaNaRedoma();
  push();shader(shaderAgua);shaderAgua.setUniform('uTempo',tempo);model(agua);
  if(!ciclo)model(aguaReservada);
  pop();resetShader();
  if(ciclo)desenharReservadas();
  desenharImpactos();
  if(ciclo&&tempo-ciclo.inicio>10){
    ciclo=null;document.getElementById('chover').disabled=false;
    if(redomaAberta && rosaAtiva)document.getElementById('estado').textContent='A chuva já passou. A rosa ainda respira ao ar livre.';
    else if(!redomaAberta)document.getElementById('estado').textContent='A chuva passou. A rosa segue igual sob a redoma fechada.';
    else document.getElementById('estado').textContent='A chuva passou.';
  }
  if(rosaAtiva){
    if(tempoVidaRosa>=29 && etapaRosa<3){
      etapaRosa=3;
      document.getElementById('estado').textContent=redomaAberta
        ?'A rosa secou. Talvez outra chuva a faça recomeçar.'
        :'A rosa secou, mas a redoma fechada a conserva nesse instante final.';
    }else if(tempoVidaRosa>=17 && etapaRosa<2){
      etapaRosa=2;
      document.getElementById('estado').textContent='O tempo passa. Com a redoma aberta, a rosa começa a murchar.';
    }else if(tempoVidaRosa>=2 && etapaRosa<1){
      etapaRosa=1;
      document.getElementById('estado').textContent='A rosa desabrocha dentro do pequeno mundo.';
    }
  }
}

function desenharReservadas(){
  const decorrido=ciclo?tempo-ciclo.inicio:0;
  for(const g of reservadas){
    let x=g.x+1.7*sin(tempo*.47+g.y*.025+g.z*.013);
    let y=g.y+2.2*sin(tempo*.55+g.x*.022+g.z*.018);
    let z=g.z+1.5*cos(tempo*.41+g.y*.021+g.x*.014), tamanho=1;
    if(ciclo){
      const queda=(decorrido-g.atraso)/g.duracao;
      if(queda>=0&&queda<1){
        const p=p5.Vector.lerp(g.origem,g.alvo,queda*queda);x=p.x;y=p.y;z=p.z;
      }else if(queda>=1){
        if(!g.atingiu){g.atingiu=true;impactos.push({p:g.alvo.copy(),inicio:tempo});}
        tamanho=constrain((decorrido-6)/4,0,1);
        tamanho=tamanho*tamanho*(3-2*tamanho);
        if(tamanho<=.01)continue;
      }
    }
    push();translate(x,y,z);fill(...g.cor);specularMaterial(165,209,215);shininess(40);
    ellipsoid(g.r*tamanho,g.r*1.52*tamanho,g.r*tamanho,6,4);pop();
  }
}

function desenharImpactos(){
  for(let i=impactos.length-1;i>=0;i--){
    const impacto=impactos[i], idade=tempo-impacto.inicio;
    if(idade>1.15){impactos.splice(i,1);continue;}
    const n=impacto.p.copy().normalize(), eixo=createVector(-n.y,n.x,0);
    push();translate(n.copy().mult(RAIO+1.5));
    if(eixo.mag()>.0001)rotate(acos(constrain(n.z,-1,1)),eixo);
    else if(n.z<0)rotateX(PI);
    fill(126,183,177);ambientMaterial(126,183,177);
    torus(1+idade*9,max(.08,.65*(1-idade/1.15)),12,4);pop();
  }
}

function suavizar(a,b,t){
  const v=constrain((t-a)/(b-a),0,1);
  return v*v*(3-2*v);
}
function estadoRosa(){
  if(!rosaAtiva)return {crescer:0, abrir:0, secar:0, perder:0};
  const idade=tempoVidaRosa;
  const atual={
    crescer:suavizar(.6,5.2,idade),
    abrir:suavizar(2.0,6.3,idade),
    secar:suavizar(17,29,idade),
    perder:suavizar(22,30,idade)
  };
  if(estadoAntesDeRecomecar && idade<1.3){
    const p=suavizar(0,1.3,idade);
    for(const k of Object.keys(atual)) atual[k]=lerp(estadoAntesDeRecomecar[k],atual[k],p);
  }
  return atual;
}
function mesclarCor(saudavel,seca,t){
  return saudavel.map((v,i)=>lerp(v,seca[i],t));
}

function desenharRosaNaRedoma(){
  const normal=createVector(POSICAO_ROSA.x,POSICAO_ROSA.y,POSICAO_ROSA.z).normalize();
  const eixo=createVector(-normal.z,0,normal.x);
  push();
  translate(normal.copy().mult(RAIO+2));
  rotate(acos(constrain(-normal.y,-1,1)),eixo);
  push();translate(0,-1,0);fill(78,64,49);cylinder(25,3,28,1);pop();
  push();translate(0,-3,0);rotateX(HALF_PI);fill(177,138,85);torus(23.3,1.35,30,6);pop();
  desenharFlor(estadoRosa());
  desenharRedomaMovel();
  pop();
}

function desenharFlor(estado){
  const vivo=estado.crescer, abertura=estado.abrir, seco=estado.secar;
  const haste=11+23*vivo-6*seco;
  const curvatura=9*seco;
  const base=createVector(0,-4,0);
  const meio=createVector(1.3+curvatura*.24,-4-haste*.52,0);
  const topo=createVector(curvatura,-4-haste+6*seco,0);
  const caule=mesclarCor([88,126,82],[113,95,67],seco);
  galho(base,meio,1.15+vivo*.32,caule);
  galho(meio,topo,.9+vivo*.15,caule);
  for(let i=0;i<2;i++){
    push();
    translate(lerp(base.x,meio.x,.65),lerp(base.y,meio.y,.65),0);
    rotateY(i*PI+(.35*sin(tempoVidaRosa*.35)));
    rotateZ((i===0?-.7:.7)+seco*.75);
    fill(...mesclarCor([101,146,99],[131,111,74],seco));
    translate(3.3+vivo*1.7,0,0);
    ellipsoid((4+vivo*2)*(1-.35*seco),1.15,2.6,10,6);
    pop();
  }
  push();translate(topo);rotateZ(-.8*seco);
  const corPetala=mesclarCor([201,82,102],[113,83,77],seco);
  const corInterna=mesclarCor([239,147,133],[148,104,92],seco);
  const tamanho=.32+.68*vivo;
  scale(tamanho);
  fill(...mesclarCor([74,112,71],[106,93,64],seco));
  push();translate(0,2,0);cone(4.2,7,8,1);pop();
  for(let i=0;i<5;i++){
    const perda=suavizar(.21+i*.14,.47+i*.14,estado.perder);
    if(perda>.995)continue;
    push();rotateY(TWO_PI*i/5+.24);
    translate(2.3+4.5*abertura,-1-1.6*abertura,0);
    rotateZ(-.15-.7*abertura-.4*seco);
    fill(...corPetala,255*(1-perda));
    ellipsoid(2.7+2.4*abertura,5.6+1.7*abertura,2.8+2*abertura,10,8);
    pop();
  }
  for(let i=0;i<4;i++){
    push();rotateY(TWO_PI*i/4+.6);
    translate(1+2.7*abertura,-1.2,0);
    rotateZ(-.15-.38*abertura+.4*seco);
    fill(...corInterna);
    ellipsoid(2.05+abertura,4.15+abertura,2.1+abertura,9,7);pop();
  }
  push();translate(0,-2.3,0);
  fill(...mesclarCor([230,180,108],[98,91,75],seco));
  sphere(1.9,10,7);pop();
  pop();
  if(estado.perder>.22){
    const d=suavizar(.22,.93,estado.perder);
    push();translate(8*d,-25+21*d,5*d);
    rotateZ(d*2.8);rotateY(d*2.3);
    fill(...mesclarCor([206,91,101],[129,92,76],seco));
    ellipsoid(2.1,4,1.15,9,6);pop();
  }
}

function desenharRedomaMovel(){
  const abrir=aberturaRedoma;
  push();
  translate(-17*abrir,-24*abrir,9*abrir);
  rotateZ(-.55*abrir);
  desenharCampanula();
  pop();
}

function desenharCampanula(){
  push();
  fill(106,171,184,23);
  translate(0,-23,0);
  cylinder(21.5,38,28,1,false,false);
  pop();
  fill(121,183,193,23);
  const partes=6, passos=26, raio=21.5;
  for(let j=0;j<partes;j++){
    const t0=HALF_PI*j/partes, t1=HALF_PI*(j+1)/partes;
    beginShape(TRIANGLE_STRIP);
    for(let i=0;i<=passos;i++){
      const a=TWO_PI*i/passos;
      for(const t of [t0,t1]){
        const s=sin(t),c=cos(t);
        normal(s*cos(a),-c,s*sin(a));
        vertex(raio*s*cos(a),-42-raio*c,raio*s*sin(a));
      }
    }
    endShape();
  }
  push();translate(0,-4.5,0);rotateX(HALF_PI);fill(183,142,87);torus(21.7,.85,30,5);pop();
  push();translate(0,-42,0);rotateX(HALF_PI);fill(154,191,194,90);torus(21.5,.42,30,5);pop();
  noFill();strokeWeight(1);
  for(const ang of [.3,.67,2.85]){
    stroke(196,232,232,ang===.3?120:44);
    beginShape();
    for(let j=0;j<=15;j++){
      const altura=j/15;
      const arco=altura<.65?0:(altura-.65)/.35;
      const r=altura<.65?22:22*cos(arco*HALF_PI);
      const y=altura<.65?-4-altura/.65*38:-42-22*sin(arco*HALF_PI);
      vertex(r*sin(ang),y,r*cos(ang));
    }
    endShape();
  }
  noStroke();
  push();translate(0,-64,0);fill(193,157,102);sphere(2.4,10,8);pop();
}

function configurarInteracao(){
  const c=tela.elt;
  function referencia(){
    const p=[...dedos.values()];
    if(p.length===1)return{x:p[0].x,y:p[0].y,n:1};
    if(p.length>=2)return{d:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),n:2};
    return null;
  }
  c.addEventListener('pointerdown',e=>{dedos.set(e.pointerId,{x:e.clientX,y:e.clientY});c.setPointerCapture(e.pointerId);gesto=referencia();});
  c.addEventListener('pointermove',e=>{
    if(!dedos.has(e.pointerId))return;
    dedos.set(e.pointerId,{x:e.clientX,y:e.clientY});const novo=referencia();
    if(gesto&&novo&&gesto.n===novo.n){
      if(novo.n===1){vista.azimute-=(novo.x-gesto.x)*.006;vista.elevacao=constrain(vista.elevacao-(novo.y-gesto.y)*.005,-1.1,1.1);}
      else if(novo.d>0)vista.distancia=constrain(vista.distancia*gesto.d/novo.d,vista.foco?230:620,1400);
    }
    gesto=novo;
  });
  for(const evento of ['pointerup','pointercancel','lostpointercapture'])c.addEventListener(evento,e=>{dedos.delete(e.pointerId);gesto=referencia();});
  c.addEventListener('wheel',e=>{e.preventDefault();vista.distancia=constrain(vista.distancia*exp(e.deltaY*.001),vista.foco?230:620,1400);},{passive:false});
  c.addEventListener('contextmenu',e=>e.preventDefault());
}
function windowResized(){
  const host=document.getElementById('universo');compacto=host.clientWidth<650;
  resizeCanvas(host.clientWidth,host.clientHeight);
}
