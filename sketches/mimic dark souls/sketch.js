
/*
 MIMIC — DARK SOULS
 p5.js 2 / WEBGL

 ESPACO — Despertar / adormecer
 MOUSE — Girar camera
 SCROLL — Zoom
 R — Restaurar camera
 H — Ocultar interface
*/

let progresso=0, origem=0, destino=0, inicio=0, animando=false;
const DURACAO=2800;
let painel, botao, statusTexto, hudVisivel=true;

const C={
  madeira:[79,47,31], madeiraClara:[109,69,44],
  madeiraEscura:[38,24,21], ferro:[72,70,68],
  ferroClaro:[121,113,101], bronze:[149,108,64],
  pele:[101,83,74], peleClara:[133,109,92],
  peleEscura:[57,46,43], osso:[221,206,175],
  boca:[25,7,15], gengiva:[119,41,54],
  lingua:[166,60,83], linguaClara:[198,89,105],
  pedra:[76,75,73], pedraClara:[96,93,88],
  pedraEscura:[48,48,49], musgo:[47,63,46]
};

function setup(){
  createCanvas(windowWidth,windowHeight,WEBGL);
  pixelDensity(1);
  noStroke();
  cameraInicial();
  criarInterface();
}

function cameraInicial(){
  camera(345,-175,650,0,-15,-45,0,1,0);
}

function criarInterface(){
  painel=createDiv();
  painel.position(18,18);
  painel.style("width","238px");
  painel.style("padding","20px 21px 18px");
  painel.style("box-sizing","border-box");
  painel.style("background","rgba(11,12,15,0.91)");
  painel.style("border","1px solid #69513b");
  painel.style("border-top","2px solid #b18a5b");
  painel.style("box-shadow","0 8px 30px rgba(0,0,0,0.55)");
  painel.style("font-family","Georgia,serif");
  painel.style("color","#e5d8c3");
  painel.style("user-select","none");

  let titulo=createDiv("M I M I C");
  titulo.parent(painel);
  titulo.style("font-size","24px");
  titulo.style("letter-spacing","2px");
  titulo.style("font-weight","bold");
  titulo.style("text-align","center");
  titulo.style("color","#e6cfaa");

  let subtitulo=createDiv("THE HUNGRY CHEST");
  subtitulo.parent(painel);
  subtitulo.style("font-family","monospace");
  subtitulo.style("font-size","9px");
  subtitulo.style("letter-spacing","2px");
  subtitulo.style("text-align","center");
  subtitulo.style("color","#9b8468");
  subtitulo.style("margin-top","7px");

  let linha=createDiv("");
  linha.parent(painel);
  linha.style("height","1px");
  linha.style("margin","17px 0 14px");
  linha.style("background","linear-gradient(to right,transparent,#90704b,transparent)");

  statusTexto=createDiv("●  ADORMECIDO");
  statusTexto.parent(painel);
  statusTexto.style("font-family","monospace");
  statusTexto.style("font-size","11px");
  statusTexto.style("letter-spacing","1px");
  statusTexto.style("text-align","center");
  statusTexto.style("color","#b7a38a");
  statusTexto.style("margin-bottom","17px");

  botao=createButton("DESPERTAR");
  botao.parent(painel);
  botao.style("width","100%");
  botao.style("padding","12px 8px");
  botao.style("font-family","Georgia,serif");
  botao.style("font-size","13px");
  botao.style("font-weight","bold");
  botao.style("letter-spacing","2px");
  botao.style("color","#f2dfc3");
  botao.style("background","#56362c");
  botao.style("border","1px solid #a67b50");
  botao.style("cursor","pointer");
  botao.style("transition","background 0.15s");
  botao.mouseOver(()=>botao.style("background","#754b36"));
  botao.mouseOut(()=>botao.style("background","#56362c"));
  botao.mousePressed(alternar);

  let controles=createDiv(
    '<div style="color:#b99a70;letter-spacing:2px;margin-bottom:11px;font-size:10px">CONTROLES</div>'+
    '<div class="mimic-control"><span>Despertar / dormir</span><b>ESPAÇO</b></div>'+
    '<div class="mimic-control"><span>Girar câmera</span><b>MOUSE</b></div>'+
    '<div class="mimic-control"><span>Zoom</span><b>SCROLL</b></div>'+
    '<div class="mimic-control"><span>Restaurar câmera</span><b>R</b></div>'+
    '<div class="mimic-control"><span>Ocultar menu</span><b>H</b></div>'
  );
  controles.parent(painel);
  controles.style("margin-top","20px");
  controles.style("font-family","monospace");
  controles.style("font-size","10px");
  controles.style("color","#a99d8c");
  controles.style("line-height","2");

  // Estilos internos do painel
  let css=createElement("style",`
    .mimic-control {
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:8px;
    }
    .mimic-control b {
      color:#d8b888;
      font-size:9px;
      font-weight:normal;
      white-space:nowrap;
    }
  `);
  css.parent(painel);

  let rodape=createDiv("V 9.3  ·  DARK FANTASY");
  rodape.parent(painel);
  rodape.style("margin-top","16px");
  rodape.style("padding-top","12px");
  rodape.style("border-top","1px solid #44382e");
  rodape.style("font-family","monospace");
  rodape.style("font-size","9px");
  rodape.style("letter-spacing","1px");
  rodape.style("text-align","center");
  rodape.style("color","#71695f");
}

function alternar(){
  origem=progresso;
  destino=destino===0?1:0;
  inicio=millis();
  animando=true;
  botao.html(destino===1?"ADORMECER":"DESPERTAR");
}

function atualizarInterface(){
  if(animando){
    statusTexto.html("◈  TRANSFORMANDO");
    statusTexto.style("color","#d8ae70");
  }else if(progresso>.999){
    statusTexto.html("●  DESPERTO");
    statusTexto.style("color","#b96559");
  }else{
    statusTexto.html("●  ADORMECIDO");
    statusTexto.style("color","#b7a38a");
  }
}

function suave(t){
  t=constrain(t,0,1);
  return t*t*(3-2*t);
}
function fase(t,a,b){return suave((t-a)/(b-a));}
function pico(t,a,b,c){return fase(t,a,b)*(1-fase(t,b,c));}
function hash(n){
  let x=Math.sin(n*127.1+31.7)*43758.5453;
  return x-Math.floor(x);
}

function atualizar(){
  if(!animando)return;
  let t=constrain((millis()-inicio)/DURACAO,0,1);
  progresso=lerp(origem,destino,suave(t));
  if(t>=1){
    progresso=destino;
    animando=false;
  }
}

function cor(c){ambientMaterial(c[0],c[1],c[2]);}

function cubo(x,y,z,w,h,d,c){
  push();
  translate(x,y,z);
  cor(c);
  box(w,h,d);
  pop();
}

function bola(x,y,z,rx,ry,rz,c){
  push();
  translate(x,y,z);
  cor(c);
  ellipsoid(max(.01,rx),max(.01,ry),max(.01,rz),8,6);
  pop();
}

function V(x,y,z){return createVector(x,y,z);}

function osso(a,b,raio,c){
  if(raio<.01)return;
  let dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z;
  let len=Math.sqrt(dx*dx+dy*dy+dz*dz);
  if(len<.001)return;
  push();
  translate((a.x+b.x)*.5,(a.y+b.y)*.5,(a.z+b.z)*.5);
  let ang=Math.acos(constrain(dy/len,-1,1));
  let ax=dz,az=-dx,m=Math.sqrt(ax*ax+az*az);
  if(m>.0001)rotate(ang,[ax/m,0,az/m]);
  else if(dy<0)rotateZ(PI);
  cor(c);
  cylinder(raio,len,7,1);
  pop();
}

function presa(x,y,z,r,h,dir){
  if(r<.01||h<.01)return;
  push();
  translate(x,y,z);
  cor(C.osso);
  beginShape(TRIANGLES);
  const partes=4,lados=6;
  for(let i=0;i<partes;i++){
    let u=i/partes,v=(i+1)/partes;
    let r1=r*(1-u),r2=r*(1-v);
    for(let j=0;j<lados;j++){
      let a=TWO_PI*j/lados,b=TWO_PI*(j+1)/lados;
      let x1=cos(a)*r1,z1=sin(a)*r1-h*.25*u*u;
      let x2=cos(b)*r1,z2=sin(b)*r1-h*.25*u*u;
      let x3=cos(a)*r2,z3=sin(a)*r2-h*.25*v*v;
      let x4=cos(b)*r2,z4=sin(b)*r2-h*.25*v*v;
      vertex(x1,dir*h*u,z1);
      vertex(x2,dir*h*u,z2);
      vertex(x3,dir*h*v,z3);
      vertex(x2,dir*h*u,z2);
      vertex(x4,dir*h*v,z4);
      vertex(x3,dir*h*v,z3);
    }
  }
  endShape();
  pop();
}

function draw(){
  background(12,13,18);
  atualizar();
  atualizarInterface();

  perspective(PI/3,width/height,1,4000);
  ambientLight(103,101,105);
  directionalLight(178,175,166,-.5,-.8,-.5);
  directionalLight(100,113,140,.7,-.3,.6);
  pointLight(165,94,51,-280,-190,-240);
  pointLight(165,94,51,280,-190,-240);

  orbitControl(1,1,.7);
  masmorra();

  let t=progresso;
  let levantar=fase(t,.08,.62);
  let pernas=fase(t,.06,.65);
  let bracos=fase(t,.20,.76);
  let boca=fase(t,.46,.86);
  let lingua=fase(t,.72,1);

  let idle=(!animando&&progresso>.999)?1:0;
  let tempo=millis()*.001;
  let respirar=sin(tempo*1.65)*idle;
  let oscilar=sin(tempo*.9)*idle;

  let altura=140-140*levantar
    +9*pico(t,.02,.10,.22)
    +respirar*2;

  let inclinacao=
    -.13*pico(t,.05,.20,.43)
    +.09*pico(t,.39,.62,.83)
    +respirar*.01;

  if(pernas>.001)desenharPernas(altura,pernas,respirar);
  if(bracos>.001)desenharBracos(
    altura,bracos,respirar,oscilar,idle,tempo
  );

  push();
  translate(0,altura,0);
  rotateX(inclinacao);
  bau(boca);
  tampa(boca,respirar);
  if(lingua>.001)desenharLingua(lingua,respirar,oscilar);
  pop();
}

// ==================================================
// MASMORRA
// ==================================================

function masmorra(){
  cubo(0,215,-60,900,20,800,C.pedraEscura);

  for(let ix=-4;ix<=4;ix++){
    for(let iz=-4;iz<=4;iz++){
      let n=hash(ix*43+iz*71);
      let x=ix*103+(iz%2)*16,z=iz*94-60;
      cubo(x,203+n,z,100,8,91,[
        63+n*13,63+n*12,64+n*11
      ]);
      if(n>.78)cubo(x+12,198,z,2,1,28,C.pedraEscura);
    }
  }

  for(let row=0;row<6;row++){
    for(let col=0;col<9;col++){
      let n=hash(row*21+col*13);
      cubo(
        -400+col*100+(row%2)*18,
        150-row*82,-445,97,79,25,
        [59+n*14,59+n*13,61+n*12]
      );
    }
  }

  for(let s of [-1,1]){
    for(let row=0;row<5;row++){
      for(let col=0;col<4;col++){
        let n=hash(row*33+col*7+s*9);
        cubo(
          s*445,150-row*95,-420+col*105,
          25,92,102,
          [59+n*12,59+n*12,61+n*11]
        );
      }
    }

    let x=s*315;
    cubo(x,-20,-365,75,440,75,C.pedra);
    cubo(x,-245,-365,95,25,95,C.pedraClara);
    cubo(x,200,-365,105,25,105,C.pedraEscura);

    for(let i=0;i<4;i++){
      cubo(x,-170+i*95,-365,80,7,80,C.pedraEscura);
    }

    tocha(x-s*25,-125,-310);
    corrente(s*230,-285,-418);
  }

  for(let i=0;i<=10;i++){
    let a=PI+PI*i/10;
    push();
    translate(cos(a)*190,-150+sin(a)*135,-422);
    rotateZ(a+HALF_PI);
    cubo(0,0,0,45,32,38,C.pedraClara);
    pop();
  }

  cubo(0,198,0,330,18,260,C.pedra);
  cubo(0,188,0,345,8,275,C.pedraClara);

  for(let i=0;i<8;i++){
    let x=-160+hash(i*7)*320;
    let z=-110+hash(i*17)*220;
    bola(x,182,z,5,1.2,4,C.musgo);
  }
}

function tocha(x,y,z){
  cubo(x,y+27,z,9,65,9,C.ferro);
  cubo(x,y+5,z,25,7,25,C.ferro);

  push();
  translate(x,y-10,z);
  cor(C.bronze);
  cylinder(15,19,8,1);
  pop();

  push();
  translate(x,y-35,z);
  rotateZ(PI);
  cor([247,134,52]);
  cone(12,37,7,1);
  pop();

  push();
  translate(x,y-30,z);
  rotateZ(PI);
  cor([255,209,112]);
  cone(5,22,7,1);
  pop();
}

function corrente(x,y,z){
  for(let i=0;i<6;i++){
    push();
    translate(x,y+i*17,z);
    rotateZ(i%2?HALF_PI:0);
    noFill();
    stroke(80,78,75);
    strokeWeight(3);
    torus(7,2,7,5);
    noStroke();
    pop();
  }
}

// ==================================================
// PERNAS
// ==================================================

function desenharPernas(altura,t,respirar){
  for(let s of [-1,1]){
    let quadril=V(s*43,altura+34,-14);
    let joelho=V(
      s*(45+65*t),
      lerp(altura+42,103,t)+respirar*.6,
      -23-8*sin(PI*t)
    );
    let tornozelo=V(s*84,177,22);

    osso(quadril,joelho,11*t,C.pele);
    osso(joelho,tornozelo,8*t,C.pele);

    let meio=p5.Vector.lerp(quadril,joelho,.48);
    bola(meio.x,meio.y,meio.z,14*t,19*t,12*t,C.pele);
    bola(
      joelho.x,joelho.y,joelho.z+5,
      12*t,11*t,11*t,C.peleClara
    );

    osso(
      V(meio.x+s*6,meio.y,meio.z+8),
      V(joelho.x,joelho.y+7,joelho.z+6),
      2.3*t,C.peleClara
    );

    bola(tornozelo.x,184,42,17*t,9*t,30*t,C.pele);

    for(let i=-1;i<=1;i++){
      let x=tornozelo.x+i*10;
      osso(
        V(x,187,55),V(x+i*3,188,78),3*t,C.pele
      );
      presa(x+i*3,188,78,3.5*t,15*t,1);
    }
  }
}

// ==================================================
// BRACOS
// ==================================================

function desenharBracos(altura,t,respirar,oscilar,idle,tempo){
  let ombroT=fase(t,0,.5);
  let cotoveloT=fase(t,.15,.78);
  let maoT=fase(t,.35,1);

  for(let s of [-1,1]){
    let ombro=V(s*105,altura-22,-5);
    let cotovelo=V(
      s*lerp(108,171,ombroT),
      altura+lerp(10,55,cotoveloT)+respirar*.7,
      lerp(-5,0,cotoveloT)
    );
    let pulso=V(
      s*lerp(112,196,maoT)+s*oscilar*1.4,
      altura+lerp(20,126,maoT)+respirar,
      55*maoT
    );

    osso(ombro,cotovelo,12*t,C.pele);
    osso(cotovelo,pulso,7*t,C.pele);

    let meio=p5.Vector.lerp(ombro,cotovelo,.5);
    bola(meio.x,meio.y,meio.z,14*t,20*t,12*t,C.pele);
    bola(
      cotovelo.x,cotovelo.y,cotovelo.z,
      10*t,10*t,10*t,C.peleClara
    );

    osso(
      V(ombro.x,ombro.y+6,ombro.z+7),
      V(cotovelo.x,cotovelo.y,cotovelo.z+8),
      2.2*t,C.peleClara
    );

    bola(
      pulso.x,pulso.y+10,pulso.z,
      14*t,19*t,10*t,C.pele
    );

    for(let i=0;i<4;i++){
      let off=(i-1.5)*8;
      let abrir=fase(t,.45+i*.04,.9);
      let flexao=sin(tempo*1.4+i*1.7+s)*idle*2.5;

      let a=V(pulso.x+off,pulso.y+20,pulso.z+3);
      let b=V(
        pulso.x+off*(1+.4*abrir),
        pulso.y+20+19*abrir,
        pulso.z+13*abrir
      );
      let c=V(
        pulso.x+off*(1+.7*abrir),
        pulso.y+20+29*abrir+flexao,
        pulso.z+28*abrir
      );

      osso(a,b,3*t,C.pele);
      osso(b,c,2*t,C.peleEscura);
      presa(c.x,c.y,c.z,2.7*t,13*abrir,1);
    }
  }
}

// ==================================================
// MADEIRA E CORPO
// ==================================================

function tabua(y,id){
  let n=hash(id*19);
  cubo(0,y,68,194,19,5,[
    75+n*25,44+n*16,29+n*10
  ]);
  cubo(0,y+9.5,71,195,1.2,1.2,C.madeiraEscura);

  for(let i=0;i<3;i++){
    cubo(
      sin(i*2.1+id)*7,y-6+i*6,71.2,
      105+hash(i+id)*55,.7,.7,C.madeiraEscura
    );
  }

  if(n>.35){
    cubo(35,y+2,71.6,35,1.3,1,C.madeiraEscura);
  }
}

function bau(abertura){
  cubo(0,0,0,210,90,132,C.madeira);

  for(let i=0;i<4;i++){
    tabua(-31+i*21,i+1);
  }

  for(let s of [-1,1]){
    cubo(s*105,0,0,8,94,137,C.madeiraEscura);

    for(let i=0;i<4;i++){
      cubo(
        s*110,-31+i*21,0,4,19,123,
        i%2===0?C.madeira:C.madeiraClara
      );
    }

    for(let z of [-49,49]){
      cubo(s*114,0,z,6,99,12,C.ferro);
    }
  }

  cubo(0,45,0,224,11,147,C.ferro);
  cubo(0,-45,0,224,10,147,C.ferro);

  for(let x of [-83,83]){
    cubo(x,0,76,14,99,8,C.ferro);

    for(let y of [-31,-10,11,32]){
      bola(x,y,82,3.5,3.5,2,C.bronze);
    }
  }

  for(let x of [-101,101]){
    for(let y of [-39,39]){
      cubo(x,y,76,22,13,9,C.ferroClaro);
    }
  }

  cubo(0,-1,80,35,43,9,C.bronze);
  cubo(0,-1,86,26,34,3,C.ferro);
  bola(0,-8,89,6,6,2,C.madeiraEscura);
  cubo(0,0,90,5,15,2,C.madeiraEscura);

  if(abertura>.001){
    cubo(0,-49,0,196,6,121,C.boca);
    cubo(0,-54,54,188,10,19,C.gengiva);

    for(let i=0;i<15;i++){
      let x=-91+i*13;
      presa(
        x,-57,62,4*abertura,
        (16+10*hash(i*13+2))*abertura,-1
      );
    }

    for(let s of [-1,1]){
      for(let i=0;i<4;i++){
        presa(
          s*94,-57,-42+i*27,
          4*abertura,20*abertura,-1
        );
      }
    }
  }
}

// ==================================================
// TAMPA
// ==================================================

function tampa(t,respirar){
  push();
  translate(0,-47,-66);

  let angulo=
    fase(t,0,.23)*.10
    +fase(t,.18,1)*1.43
    +.055*pico(t,.70,.87,1)
    +respirar*.014;

  rotateX(angulo);
  translate(0,-13,66);

  cubo(0,0,0,218,27,140,C.madeira);

  for(let i=0;i<5;i++){
    let x=-84+i*42;
    let n=hash(i*31+8);

    cubo(x,-16,0,39,5,133,[
      77+n*26,45+n*17,29+n*12
    ]);
    cubo(x,-19,0,1,.8,100,C.madeiraEscura);
  }

  for(let x of [-85,85]){
    cubo(x,-20,0,14,9,148,C.ferro);
  }

  cubo(0,-13,71,226,12,12,C.ferro);
  cubo(0,-13,-71,226,12,12,C.ferro);

  for(let x of [-84,84]){
    for(let z of [-50,0,50]){
      bola(x,-26,z,3,2,3,C.bronze);
    }
  }

  cubo(0,-2,78,34,35,8,C.bronze);
  cubo(0,-1,84,8,17,3,C.madeiraEscura);

  if(t>.001){
    cubo(0,15,0,202,6,123,C.boca);
    cubo(0,19,54,190,10,19,C.gengiva);

    for(let i=0;i<15;i++){
      let x=-91+i*13;
      presa(
        x,24,62,4*t,
        (18+11*hash(i*17+5))*t,1
      );
    }

    for(let s of [-1,1]){
      presa(s*84,24,60,7*t,43*t,1);
    }
  }

  pop();
}

// ==================================================
// LINGUA
// ==================================================

function centroLingua(u,respirar,oscilar){
  return V(
    14*sin(u*PI)+oscilar*u*3,
    -49-24*sin(u*PI)+105*pow(u,2.4)+respirar*u*1.5,
    20+165*u
  );
}

function raioLingua(u){
  let r=23*(1-.65*u);
  if(u>.85)r*=map(u,.85,1,1,.08);
  return max(.3,r);
}

function pontoLingua(u,a,respirar,oscilar){
  let p=centroLingua(u,respirar,oscilar);
  let p1=centroLingua(min(1,u+.003),respirar,oscilar);
  let p0=centroLingua(max(0,u-.003),respirar,oscilar);

  let tangente=p5.Vector.sub(p1,p0).normalize();
  let vertical=tangente.copy().cross(V(1,0,0)).normalize();
  let r=raioLingua(u);

  return V(
    p.x+cos(a)*r+vertical.x*sin(a)*r*.42,
    p.y+vertical.y*sin(a)*r*.42,
    p.z+vertical.z*sin(a)*r*.42
  );
}

function desenharLingua(t,respirar,oscilar){
  if(t<.001)return;

  cor(C.lingua);
  beginShape(TRIANGLES);

  const segmentos=22,lados=8;

  for(let i=0;i<segmentos;i++){
    let u=i/segmentos;
    if(u>=t)break;
    let v=min((i+1)/segmentos,t);

    for(let j=0;j<lados;j++){
      let a=TWO_PI*j/lados,b=TWO_PI*(j+1)/lados;
      let p1=pontoLingua(u,a,respirar,oscilar);
      let p2=pontoLingua(u,b,respirar,oscilar);
      let p3=pontoLingua(v,a,respirar,oscilar);
      let p4=pontoLingua(v,b,respirar,oscilar);

      vertex(p1.x,p1.y,p1.z);
      vertex(p2.x,p2.y,p2.z);
      vertex(p3.x,p3.y,p3.z);

      vertex(p2.x,p2.y,p2.z);
      vertex(p4.x,p4.y,p4.z);
      vertex(p3.x,p3.y,p3.z);
    }
  }

  endShape();

  for(let i=2;i<=12*t;i++){
    let u=i/12;
    let p=centroLingua(u,respirar,oscilar);
    bola(
      p.x,p.y-3,p.z+raioLingua(u)*.6,
      2,1,2,C.linguaClara
    );
  }
}

// ==================================================
// CONTROLES
// ==================================================

function keyPressed(){
  if(key===" "){
    alternar();
    return false;
  }

  if(key==="r"||key==="R"){
    cameraInicial();
  }

  if(key==="h"||key==="H"){
    hudVisivel=!hudVisivel;
    if(hudVisivel)painel.show();
    else painel.hide();
  }
}

function windowResized(){
  resizeCanvas(windowWidth,windowHeight);
}
