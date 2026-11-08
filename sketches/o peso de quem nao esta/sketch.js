/* O peso de quem não está — Henrique Kezen V. H. Leite
 * p5.js 2 / WEBGL. Geometria própria: vértices, faces, UVs e normais.
 * Coordenadas: x percorre o banco, y cresce para baixo, z vem para frente.
 */
const BANCO = { meiaLargura: 210, meiaProfundidade: 66, topo: -19, chao: 151 };
let assento, estrutura, tecido, sombra, tela;
let bases = [], velocidades = [], deslocamentos = [], presencas = [];
let nx, nz, verticesTopo, facesTopo, tempo = 0, pausado = false, pronto = false;
let ultimoToque = -100;
const vista = { azimute: .36, elevacao: .57, zoom: 1 };
let olho, alvo, frente, direita, baixo, distancia;
const dedos = new Map();
let gesto = null, pincaAnterior = 0;

function setup() {
  try {
    const host = document.getElementById('cena');
    tela = createCanvas(host.clientWidth, host.clientHeight, WEBGL);
    tela.parent(host);
    pixelDensity(Math.min(window.devicePixelRatio || 1, 1.5));
    frameRate(40); noStroke(); randomSeed(42);
    nx = width < 650 ? 60 : 84;
    nz = width < 650 ? 24 : 32;
    tecido = criarTecido();
    sombra = criarSombra();
    assento = criarAssento();
    estrutura = criarEstrutura();
    instalarControles();
    pronto = true;
    document.getElementById('aviso').textContent = '';
  } catch (erro) {
    document.getElementById('aviso').textContent = 'Não foi possível iniciar WebGL. Recarregue em um navegador com aceleração gráfica.';
    console.error(erro); noLoop();
  }
}

// Uma grade indexada: cada célula compartilha vértices e vira dois triângulos.
// As bordas da grade são costuradas a anéis laterais; não há uma chapa sem espessura.
function criarAssento() {
  const g = new p5.Geometry();
  for (let j = 0; j <= nz; j++) {
    for (let i = 0; i <= nx; i++) {
      const u = 2 * i / nx - 1, v = 2 * j / nz - 1;
      const x = 210 * u * (1 - .045 * Math.pow(v, 10));
      const z = 66 * v * (1 - .06 * Math.pow(u, 10));
      const y = BANCO.topo - 8 * (1 - Math.pow(u, 8)) * (1 - Math.pow(v, 6));
      g.vertices.push(createVector(x, y, z));
      g.uvs.push(i / nx, j / nz);
      bases.push({x, y, z, borda: Math.pow(Math.max(0, (1-u*u)*(1-v*v)), .7)});
      deslocamentos.push(0); velocidades.push(0);
    }
  }
  verticesTopo = g.vertices.length;
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const k = j * (nx+1) + i, d = k + nx+1;
    g.faces.push([k,k+1,d], [k+1,d+1,d]); // normal para cima: y negativo
  }
  facesTopo = g.faces.length;
  const contorno = [];
  for(let i=0;i<nx;i++) contorno.push(i);
  for(let j=0;j<nz;j++) contorno.push(j*(nx+1)+nx);
  for(let i=nx;i>0;i--) contorno.push(nz*(nx+1)+i);
  for(let j=nz;j>0;j--) contorno.push(j*(nx+1));
  let anterior = contorno;
  for (const [y,escala] of [[-10,1.015],[8,1.006],[16,.975]]) {
    const atual=[];
    for (const k of contorno) {
      const b = bases[k]; atual.push(g.vertices.length);
      g.vertices.push(createVector(b.x*escala,y,b.z*escala));
      g.uvs.push((b.x/420+.5), (b.z/132+.5));
    }
    for(let i=0;i<atual.length;i++) {
      const j=(i+1)%atual.length;
      g.faces.push([anterior[i],atual[i],anterior[j]], [anterior[j],atual[i],atual[j]]);
    }
    anterior=atual;
  }
  const centro=g.vertices.length; g.vertices.push(createVector(0,16,0)); g.uvs.push(.5,.5);
  for(let i=0;i<anterior.length;i++)g.faces.push([centro,anterior[(i+1)%anterior.length],anterior[i]]);
  // Vértices já são compartilhados; não há necessidade de soldar ou reindexar a grade.
  g.computeNormals();
  return g;
}

function bloco(x,y,z,a,b,c) {
  push(); translate(x,y,z); box(a,b,c); pop();
}

// Madeira e ferragens ficam prontas no setup: uma única chamada model por quadro.
function criarEstrutura() {
  return buildGeometry(() => {
    fill('#78604b');
    bloco(0,26,0,425,18,132);
    fill('#65503d');
    bloco(0,42,55,389,22,11); bloco(0,42,-55,389,22,11);
    for (const x of [-177,177]) {
      for (const z of [-48,48]) {
        push(); translate(x,98,z); rotateZ(x>0?-.045:.045); rotateX(z>0?.035:-.035);
        fill('#73604b'); box(15,106,16); pop();
        fill('#514a3d'); bloco(x,148,z,16,5,17);
      }
      fill('#68523e'); bloco(x,108,0,10,10,102);
      // Montantes e encosto baixo: o assento permanece visível de cima.
      bloco(x,-43,-63,13,144,13);
    }
    fill('#8c7459'); bloco(0,-105,-65,392,29,12);
    fill('#80684f'); bloco(0,-66,-65,392,24,12);
    fill('#a49273');
    for(const x of [-177,177])for(const y of [-105,-66]) {
      push();translate(x,y,-57.8);sphere(2,8,6);pop();
    }
  });
}

// Textura original gerada uma vez: trama discreta, sem arquivos de imagem externos.
function criarTecido() {
  const g=createGraphics(768,256); g.pixelDensity(1); g.background(151,153,126);
  g.strokeWeight(1);
  for(let y=0;y<256;y+=2){g.stroke(178,177,149,70);g.line(0,y,768,y);}
  for(let x=0;x<768;x+=3){g.stroke(98,107,85,45);g.line(x,0,x,256);}
  for(let i=0;i<13000;i++){
    const tom=random(75,205);g.stroke(tom,tom,tom*.83,random(15,46));g.point(random(768),random(256));
  }
  return g;
}
function criarSombra() {
  const g=createGraphics(512,256);g.pixelDensity(1);g.clear();g.noStroke();
  for(let i=36;i>0;i--){g.fill(55,47,35,3);g.ellipse(256,128,480*i/36,180*i/36);}
  return g;
}

// A chegada é curta e a recuperação longa: a espuma guarda uma memória do peso.
function intensidade(idade,permanencia=5) {
  if(idade<0 || idade>permanencia+16) return 0;
  if(idade<2.5) return suave(idade/2.5);
  if(idade<permanencia+2.5) return 1;
  return 1-suave((idade-permanencia-2.5)/13.5);
}
function suave(t){t=constrain(t,0,1);return t*t*(3-2*t);}
function pesosAtuais() {
  const fase=tempo%36;
  const pesos=[
    {x:-87,z:7,a:intensidade(fase-1,5)},
    {x:81,z:5,a:intensidade(fase-8,7)}
  ];
  presencas=presencas.filter(p=>tempo-p.inicio<22);
  for(const p of presencas)pesos.push({x:p.x,z:p.z,a:intensidade(tempo-p.inicio,5)});
  return pesos.filter(p=>p.a>.0001);
}
function pressao(x,z,p) {
  // Duas áreas largas de apoio e uma ligação suave, em vez de furos pontuais.
  const dx=x-p.x,dz=z-p.z;
  const q1=((dx-13)/25)**2+(dz/30)**2;
  const q2=((dx+13)/25)**2+(dz/30)**2;
  const apoio=.53*Math.exp(-q1*.5)+.53*Math.exp(-q2*.5);
  const coxa=.22*Math.exp(-.5*((dx/31)**2+((dz-20)/24)**2));
  return p.a*(apoio+coxa);
}
function atualizarAssento(dt) {
  const pesos=pesosAtuais();
  const passos=Math.max(1,Math.ceil(dt/(1/90))),h=dt/passos;
  for(let k=0;k<verticesTopo;k++){
    const b=bases[k];let carga=0;
    for(const p of pesos)carga+=pressao(b.x,b.z,p);
    // Saturação mantém as marcas sobrepostas contínuas e impede atravessar a base.
    const destino=31*(1-Math.exp(-carga*1.35))*b.borda;
    for(let s=0;s<passos;s++){
      velocidades[k]+=(32*(destino-deslocamentos[k])-11*velocidades[k])*h;
      deslocamentos[k]+=velocidades[k]*h;
    }
    assento.vertices[k].y=b.y+deslocamentos[k];
  }
  assento.computeNormals();
  // model guarda buffers na GPU. Liberar o anterior força o envio dos vértices
  // atualizados e evita acumular uma geometria diferente a cada quadro.
  freeGeometry(assento);
}

function configurarCamera() {
  alvo=createVector(0,3,0);
  distancia=650*Math.max(1,.98/(width/height))*vista.zoom;
  olho=createVector(Math.sin(vista.azimute)*Math.cos(vista.elevacao)*distancia,
    -Math.sin(vista.elevacao)*distancia,Math.cos(vista.azimute)*Math.cos(vista.elevacao)*distancia).add(alvo);
  frente=p5.Vector.sub(alvo,olho).normalize();
  direita=createVector(Math.cos(vista.azimute),0,-Math.sin(vista.azimute));
  baixo=p5.Vector.cross(frente,direita).normalize();
  camera(olho.x,olho.y,olho.z,alvo.x,alvo.y,alvo.z,0,1,0);
  perspective(PI/3,width/height,10,5000);
}
function draw() {
  if(!pronto)return;
  const dt=pausado?0:Math.min(deltaTime/1000,.25);
  tempo+=dt;
  if(dt>0)atualizarAssento(dt);
  clear(); configurarCamera();
  // Sombra de contato desenhada à mão. As luzes do p5 não projetam sombras.
  push();translate(7,BANCO.chao+2,10);rotateX(HALF_PI);noLights();texture(sombra);plane(555,240);pop();
  ambientLight(115,111,103);
  directionalLight(205,199,181,-.6,.8,-.4);
  directionalLight(65,76,88,.8,.3,.4);
  noStroke();shininess(7);
  push();model(estrutura);pop();
  push();texture(tecido);model(assento);pop();
  desenharCostura();
}
function desenharCostura() {
  // A costura acompanha a borda fixa e ajuda a ler a espessura do estofado.
  push();noFill();stroke(98,103,83);strokeWeight(1.1);beginShape();
  for(let i=0;i<=nx;i++){const p=bases[i];vertex(p.x,-18.5,p.z);}
  for(let j=1;j<=nz;j++){const p=bases[j*(nx+1)+nx];vertex(p.x,-18.5,p.z);}
  for(let i=nx-1;i>=0;i--){const p=bases[nz*(nx+1)+i];vertex(p.x,-18.5,p.z);}
  for(let j=nz-1;j>0;j--){const p=bases[j*(nx+1)];vertex(p.x,-18.5,p.z);}
  endShape(CLOSE);pop();
}

// Ray casting contra os triângulos atuais: o toque segue o assento mesmo com
// a câmera girada e com a superfície já afundada. Algoritmo Möller–Trumbore.
function pontoNoAssento(px,py) {
  const tx=(px/width*2-1)*Math.tan(Math.PI/6)*width/height;
  const ty=(py/height*2-1)*Math.tan(Math.PI/6);
  const raio=frente.copy().add(direita.copy().mult(tx)).add(baixo.copy().mult(ty)).normalize();
  let melhor=Infinity, ponto=null;
  for(let i=0;i<facesTopo;i++){
    const [ia,ib,ic]=assento.faces[i],a=assento.vertices[ia],b=assento.vertices[ib],c=assento.vertices[ic];
    const e1=p5.Vector.sub(b,a),e2=p5.Vector.sub(c,a),h=p5.Vector.cross(raio,e2);
    const det=e1.dot(h);if(Math.abs(det)<1e-7)continue;
    const s=p5.Vector.sub(olho,a),u=s.dot(h)/det;if(u<0||u>1)continue;
    const q=p5.Vector.cross(s,e1),v=raio.dot(q)/det;if(v<0||u+v>1)continue;
    const t=e2.dot(q)/det;
    if(t>0&&t<melhor){melhor=t;ponto=olho.copy().add(raio.copy().mult(t));}
  }
  return ponto;
}
function deixarPresenca(x,y) {
  const p=pontoNoAssento(x,y);
  if(!p)return;
  if(presencas.length>=8)presencas.shift();
  presencas.push({x:constrain(p.x,-177,177),z:constrain(p.z,-34,34),inicio:tempo});
  ultimoToque=tempo;
  document.getElementById('aviso').textContent='';
}
function instalarControles() {
  const c=tela.elt;
  const local=e=>{const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*width/r.width,y:(e.clientY-r.top)*height/r.height};};
  c.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    c.setPointerCapture(e.pointerId);const p=local(e);dedos.set(e.pointerId,p);
    if(dedos.size===1)gesto={id:e.pointerId,inicio:p,anterior:p,arrastou:false};
    else {if(gesto)gesto.arrastou=true;pincaAnterior=distanciaDedos();}
  });
  c.addEventListener('pointermove',e=>{
    if(!dedos.has(e.pointerId))return;
    const p=local(e);dedos.set(e.pointerId,p);
    if(dedos.size===2){const d=distanciaDedos();if(pincaAnterior>0)vista.zoom=constrain(vista.zoom*pincaAnterior/d,.72,1.65);pincaAnterior=d;return;}
    if(!gesto||gesto.id!==e.pointerId)return;
    if(Math.hypot(p.x-gesto.inicio.x,p.y-gesto.inicio.y)>6)gesto.arrastou=true;
    if(gesto.arrastou){vista.azimute-=(p.x-gesto.anterior.x)*.007;vista.elevacao=constrain(vista.elevacao+(p.y-gesto.anterior.y)*.006,.25,1.18);}
    gesto.anterior=p;
  });
  c.addEventListener('pointerup',e=>{
    const p=local(e);
    if(gesto&&gesto.id===e.pointerId&&!gesto.arrastou&&dedos.size===1)deixarPresenca(p.x,p.y);
    dedos.delete(e.pointerId);gesto=null;pincaAnterior=0;
  });
  c.addEventListener('pointercancel',e=>{dedos.delete(e.pointerId);gesto=null;pincaAnterior=0;});
  c.addEventListener('wheel',e=>{e.preventDefault();vista.zoom=constrain(vista.zoom*Math.exp(e.deltaY*.001),.72,1.65);},{passive:false});
  document.getElementById('vista').onclick=()=>Object.assign(vista,{azimute:.36,elevacao:.57,zoom:1});
  document.getElementById('reiniciar').onclick=()=>{
    tempo=0;presencas=[];deslocamentos.fill(0);velocidades.fill(0);
    for(let i=0;i<verticesTopo;i++)assento.vertices[i].y=bases[i].y;
    assento.computeNormals();freeGeometry(assento);
  };
  document.getElementById('pausa').onclick=()=>{
    pausado=!pausado;
    document.getElementById('pausa').textContent=pausado?'Continuar':'Pausar';
    document.getElementById('pausa').setAttribute('aria-pressed',String(pausado));
  };
}
function distanciaDedos(){const [a,b]=[...dedos.values()];return Math.max(1,Math.hypot(a.x-b.x,a.y-b.y));}
function windowResized(){const h=document.getElementById('cena');resizeCanvas(h.clientWidth,h.clientHeight);}
