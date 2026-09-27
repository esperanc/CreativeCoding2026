// CULTURA EMERGENTE — Paulo Vitor Couto
// Uma rede nasce do comportamento local de agentes independentes.

let simulation;
let paused = false;
let seed = 1;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  seed = Math.floor(Math.random() * 2 ** 30);
  restart(seed);
}

function draw() {
  if (!paused) {
    advanceSimulation(drawingContext, simulation, 4);
    drawLiveAgents(drawingContext, simulation);
  }
  drawStatus(drawingContext, simulation, paused);
}

function restart(value) {
  seed = value;
  simulation = createSimulation(width, height, seed);
  drawBase(drawingContext, simulation);
  paused = false;
}

function mousePressed() {
  if (!simulation) return;
  const dx = mouseX - simulation.cx;
  const dy = mouseY - simulation.cy;
  if (dx * dx + dy * dy < simulation.radius * simulation.radius * 0.88) {
    addNutrient(simulation, mouseX, mouseY, 1.15);
    drawNutrient(drawingContext, mouseX, mouseY, simulation.unit, 1.15);
  }
}

function keyPressed() {
  if (key === 'p' || key === 'P') paused = !paused;
  if (key === 'r' || key === 'R') restart(Math.floor(Math.random() * 2 ** 30));
  if (key === 's' || key === 'S') saveCanvas('cultura-emergente', 'png');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  restart(seed);
}

function randomGenerator(value) {
  let state = (value >>> 0) || 1;
  return function () {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

function createSimulation(w, h, value) {
  const rand = randomGenerator(value);
  const unit = Math.max(8, Math.min(w, h) / 70);
  const header = Math.max(104, h * 0.16);
  const footer = Math.max(55, h * 0.075);
  const radius = Math.max(80, Math.min(w * 0.43, (h - header - footer) * 0.48));
  const cx = w / 2;
  const cy = header + (h - header - footer) / 2;
  const cell = Math.max(4, Math.round(unit * 0.42));
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  const signal = new Float32Array(cols * rows);
  const scratch = new Float32Array(cols * rows);
  const nutrients = [];

  const count = Math.max(10, Math.min(18, Math.round(radius / 34)));
  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const distance = radius * (0.30 + rand() * 0.56);
    nutrients.push({
      x: cx + Math.cos(angle) * distance,
      y: cy + Math.sin(angle) * distance,
      strength: 0.72 + rand() * 0.55
    });
  }

  const agents = [];
  const colonies = 5;
  for (let c = 0; c < colonies; c++) {
    const baseAngle = c * Math.PI * 2 / colonies + rand() * 0.35;
    const sx = cx + Math.cos(baseAngle) * radius * 0.16;
    const sy = cy + Math.sin(baseAngle) * radius * 0.16;
    for (let i = 0; i < 34; i++) {
      const angle = baseAngle + (rand() - 0.5) * 2.3;
      agents.push({x: sx + (rand()-.5)*5, y: sy + (rand()-.5)*5,
        angle, energy: 0.72 + rand() * 0.25, age: 0, family: c});
    }
  }

  return {w, h, cx, cy, radius, unit, cell, cols, rows, signal, scratch,
    nutrients, agents, rand, frame: 0, births: 0, deaths: 0, seed: value};
}

function drawBase(ctx, sim) {
  const {w,h,cx,cy,radius,unit,rand} = sim;
  ctx.save();
  ctx.setTransform(1,0,0,1,0,0);
  ctx.fillStyle = '#e9e1ce';
  ctx.fillRect(0,0,w,h);

  // Textura do papel de laboratório.
  for (let i=0; i<Math.min(4300,w*h/180); i++) {
    const x=rand()*w, y=rand()*h;
    ctx.fillStyle=i%3?'rgba(82,66,43,.035)':'rgba(255,255,244,.26)';
    ctx.fillRect(x,y,.5+rand()*1.4,.5+rand()*1.2);
  }

  ctx.strokeStyle='#9e8f74';ctx.lineWidth=1;
  ctx.strokeRect(18.5,18.5,w-37,h-37);
  ctx.strokeRect(24.5,24.5,w-49,h-49);

  label(ctx,'LABORATÓRIO DE SISTEMAS VIVOS',44,48,Math.max(10,unit*.82),'#6d604a','bold');
  label(ctx,'CULTURA EMERGENTE',44,82,Math.max(25,unit*2.6),'#27281f','normal');
  label(ctx,'AGENTES LOCAIS  /  PADRÕES COLETIVOS',44,108,Math.max(10,unit*.82),'#786b53','normal');
  label(ctx,'AMOSTRA '+String(sim.seed%9000+1000),w-44,48,Math.max(10,unit*.82),'#6d604a','bold','right');
  label(ctx,'R: REINICIAR   P: PAUSAR   S: SALVAR',w-44,78,Math.max(9,unit*.72),'#786b53','normal','right');

  // Placa de cultura com três anéis e leve profundidade.
  ctx.fillStyle='rgba(67,63,46,.16)';
  ctx.beginPath();ctx.arc(cx+unit*.6,cy+unit*.8,radius+unit*.45,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#141f1a';
  ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#867c63';ctx.lineWidth=unit*.75;
  ctx.beginPath();ctx.arc(cx,cy,radius+unit*.35,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='rgba(241,232,203,.45)';ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(cx,cy,radius-unit*.45,0,Math.PI*2);ctx.stroke();

  sim.nutrients.forEach(n=>drawNutrient(ctx,n.x,n.y,unit,n.strength));

  const footerY=h-40;
  ctx.strokeStyle='#9e8f74';ctx.lineWidth=1;segment(ctx,44,footerY-19,w-44,footerY-19);
  label(ctx,'CLIQUE NA PLACA PARA ADICIONAR NUTRIENTE',44,footerY,Math.max(9,unit*.72),'#675a45','normal');
  label(ctx,'REDE NÃO PREDEFINIDA',w-44,footerY,Math.max(9,unit*.72),'#675a45','bold','right');
  ctx.restore();
}

function drawNutrient(ctx,x,y,unit,strength) {
  ctx.save();
  ctx.fillStyle='rgba(221,174,69,.10)';circle(ctx,x,y,unit*2.1*strength);ctx.fill();
  ctx.strokeStyle='rgba(225,185,83,.32)';ctx.lineWidth=1;circle(ctx,x,y,unit*1.2*strength);ctx.stroke();
  ctx.fillStyle='#d9a943';circle(ctx,x,y,Math.max(2.2,unit*.24)*strength);ctx.fill();
  ctx.restore();
}

function addNutrient(sim,x,y,strength) {
  sim.nutrients.push({x,y,strength});
}

function circle(ctx,x,y,r) {ctx.beginPath();ctx.arc(x,y,Math.max(.01,r),0,Math.PI*2);}
function segment(ctx,x1,y1,x2,y2) {ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
function label(ctx,value,x,y,size,color,weight='normal',align='left') {
  ctx.fillStyle=color;ctx.font=`${weight} ${size}px Georgia, serif`;ctx.textAlign=align;ctx.fillText(value,x,y);
}

function signalAt(sim,x,y) {
  const gx=Math.floor(x/sim.cell),gy=Math.floor(y/sim.cell);
  if(gx<0||gy<0||gx>=sim.cols||gy>=sim.rows)return -50;
  let value=sim.signal[gy*sim.cols+gx]*.62;
  for(const n of sim.nutrients) {
    if(n.strength<=.03)continue;
    const dx=n.x-x,dy=n.y-y;
    value+=n.strength*52000/(dx*dx+dy*dy+240);
  }
  return value;
}

function deposit(sim,x,y,amount) {
  const gx=Math.floor(x/sim.cell),gy=Math.floor(y/sim.cell);
  if(gx>=0&&gy>=0&&gx<sim.cols&&gy<sim.rows) {
    const index=gy*sim.cols+gx;
    sim.signal[index]=Math.min(24,sim.signal[index]+amount);
  }
}

function diffuse(sim) {
  const {cols,rows,signal,scratch}=sim;
  for(let y=1;y<rows-1;y++)for(let x=1;x<cols-1;x++){
    const i=y*cols+x;
    scratch[i]=(signal[i]*4+signal[i-1]+signal[i+1]+signal[i-cols]+signal[i+cols])/8*.982;
  }
  const temp=sim.signal;sim.signal=sim.scratch;sim.scratch=temp;
}

function advanceSimulation(ctx,sim,steps) {
  const sensorDistance=Math.max(7,sim.unit*.72);
  const sensorAngle=.58;
  const speed=Math.max(.78,sim.unit*.105);
  const next=[];
  ctx.save();
  ctx.beginPath();ctx.arc(sim.cx,sim.cy,sim.radius-sim.unit*.6,0,Math.PI*2);ctx.clip();

  for(let pass=0;pass<steps;pass++) {
    next.length=0;
    for(const a of sim.agents) {
      const oldX=a.x,oldY=a.y;
      const readings=[-sensorAngle,0,sensorAngle].map(offset=>{
        const angle=a.angle+offset;
        return signalAt(sim,a.x+Math.cos(angle)*sensorDistance,a.y+Math.sin(angle)*sensorDistance);
      });
      const current=signalAt(sim,a.x,a.y);
      let choice=1;
      if(readings[0]>readings[choice])choice=0;
      if(readings[2]>readings[choice])choice=2;
      a.angle+=(choice-1)*(.22+sim.rand()*.25)+(sim.rand()-.5)*.20;
      if(current>7)a.angle+=(sim.rand()-.5)*.90;

      a.x+=Math.cos(a.angle)*speed;
      a.y+=Math.sin(a.angle)*speed;
      a.age++;
      a.energy-=.00055;

      const dcx=a.x-sim.cx,dcy=a.y-sim.cy;
      if(dcx*dcx+dcy*dcy>Math.pow(sim.radius-sim.unit*.8,2)) {
        a.angle=Math.atan2(sim.cy-a.y,sim.cx-a.x)+(sim.rand()-.5)*.45;
        a.x=oldX;a.y=oldY;a.energy-=.012;
      }

      let fed=false;
      for(const nutrient of sim.nutrients) {
        if(nutrient.strength<=.03)continue;
        const dx=nutrient.x-a.x,dy=nutrient.y-a.y;
        if(dx*dx+dy*dy<Math.pow(sim.unit*1.25,2)) {
          nutrient.strength=Math.max(0,nutrient.strength-.00045);
          a.energy=Math.min(1.15,a.energy+.006);
          fed=true;
        }
      }

      deposit(sim,a.x,a.y,1.0+(fed?.65:0));
      const families=['rgba(133,205,154,.21)','rgba(112,190,166,.18)','rgba(184,211,139,.17)'];
      ctx.strokeStyle=families[a.family%families.length];
      ctx.lineWidth=Math.max(.5,sim.unit*(fed?.12:.075));
      segment(ctx,oldX,oldY,a.x,a.y);

      if(fed && sim.agents.length+next.length<520 && sim.rand()<.020) {
        const turn=(sim.rand()<.5?-1:1)*(.48+sim.rand()*.42);
        next.push({x:a.x,y:a.y,angle:a.angle+turn,energy:.58+sim.rand()*.28,age:0,family:a.family});
        sim.births++;
      }
      if(a.energy>0 && a.age<4100)next.push(a); else sim.deaths++;
    }
    sim.agents=next.slice();
    sim.frame++;
    if(sim.frame%3===0)diffuse(sim);
  }
  ctx.restore();
}

function drawLiveAgents(ctx,sim) {
  ctx.save();
  ctx.fillStyle='rgba(235,224,159,.50)';
  const stride=Math.max(1,Math.floor(sim.agents.length/80));
  for(let i=0;i<sim.agents.length;i+=stride){const a=sim.agents[i];circle(ctx,a.x,a.y,Math.max(.7,sim.unit*.075));ctx.fill();}
  ctx.restore();
}

function drawStatus(ctx,sim,isPaused) {
  const boxW=Math.min(265,sim.w*.38),boxH=Math.max(30,sim.unit*2.3);
  const x=sim.w-boxW-38,y=sim.h-boxH-52;
  ctx.save();ctx.fillStyle='rgba(233,225,206,.92)';ctx.fillRect(x,y,boxW,boxH);
  ctx.strokeStyle='#a09276';ctx.strokeRect(x+.5,y+.5,boxW-1,boxH-1);
  const size=Math.max(9,sim.unit*.70);
  label(ctx,isPaused?'PAUSADA':'EM CRESCIMENTO',x+12,y+boxH*.42,size,isPaused?'#8a5d42':'#4b7056','bold');
  label(ctx,`${sim.agents.length} agentes  ·  ${sim.births} ramificações`,x+12,y+boxH*.76,size*.88,'#675a45');
  ctx.restore();
}

if(typeof module!=='undefined'&&module.exports) {
  module.exports={createSimulation,drawBase,advanceSimulation,drawLiveAgents,drawStatus};
}
