// PROVA DE QUE ESTIVE AQUI — Paulo Vitor Couto
// A imagem da impressão digital é formada por frases, não por linhas.

let caseSeed = 271828;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(24);
  caseSeed = Math.floor(Math.random() * 2 ** 30);
}

function draw() {
  renderScene(drawingContext, width, height, millis() / 1000, mouseX, mouseY, caseSeed);
}

function mousePressed() {
  caseSeed = Math.floor(Math.random() * 2 ** 30);
}

function keyPressed() {
  if (key === 'r' || key === 'R') caseSeed = Math.floor(Math.random() * 2 ** 30);
  if (key === 's' || key === 'S') saveCanvas('prova-de-que-estive-aqui', 'png');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function rng(value) {
  let state = (value >>> 0) || 1;
  return function () {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

function write(ctx, value, x, y, size, color, weight='normal', align='left', family='Courier New') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "${family}", monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(value, x, y);
}

function typedRule(ctx, x, y, chars, color='#796f60') {
  write(ctx, '─'.repeat(chars), x, y, 11, color);
}

function fingerprint(ctx, cx, cy, time, pointer, rand, phraseIndex) {
  const phrases = [
    'EU ESTAVA AQUI · ',
    'A MEMÓRIA DEIXA RASTROS · ',
    'MEU NOME NÃO CABE NA TARJA · ',
    'TODA AUSÊNCIA TEM UMA FORMA · ',
    'LEIA O QUE TENTARAM APAGAR · '
  ];
  const phrase = phrases[phraseIndex % phrases.length];
  let charIndex = Math.floor(rand() * phrase.length);

  for (let ring = 0; ring < 18; ring++) {
    const rx = 19 + ring * 9.7;
    const ry = 25 + ring * 13.0;
    const driftX = Math.sin(ring * .67 + phraseIndex) * 8;
    const driftY = Math.cos(ring * .43) * 5;
    const gapCenter = -Math.PI / 2 + Math.sin(ring * .48) * .37;
    const gapWidth = .20 + (ring % 4) * .035;
    const step = .085 + ring * .0008;

    for (let angle = -Math.PI; angle <= Math.PI; angle += step) {
      const gapDistance = Math.abs(Math.atan2(Math.sin(angle-gapCenter), Math.cos(angle-gapCenter)));
      if (gapDistance < gapWidth && ring > 4) continue;
      if (ring > 12 && angle > 2.10 && angle < 2.42) continue;

      // Uma pequena deformação impede que as cristas pareçam elipses perfeitas.
      const ripple = 1 + .018 * Math.sin(angle * 7 + ring * .8);
      const x = cx + driftX + Math.cos(angle) * rx * ripple;
      const y = cy + driftY + Math.sin(angle) * ry * ripple;
      const dx = x - pointer.x, dy = y - pointer.y;
      const distance = Math.sqrt(dx*dx + dy*dy);
      const illuminated = Math.max(0, 1 - distance / 94);
      const glyph = phrase[charIndex++ % phrase.length];
      const tangent = Math.atan2(Math.cos(angle) * ry, -Math.sin(angle) * rx);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(tangent);
      const pulse = .5 + .5 * Math.sin(time * 1.7 + ring * .8);
      const size = 6.3 + illuminated * 4.8;
      const normalAlpha = .34 + ring / 45;
      const color = illuminated > .05
        ? `rgba(151,47,35,${.38 + illuminated * .62})`
        : `rgba(47,42,34,${normalAlpha + pulse * .025})`;
      write(ctx, glyph, 0, 0, size, color, illuminated > .62 ? 'bold' : 'normal', 'center');
      ctx.restore();
    }
  }

  // Singularidades centrais também são texto e ajudam a leitura biométrica.
  for (let i=0; i<30; i++) {
    const angle=i*.61, radius=2+i*.48;
    const x=cx+Math.cos(angle)*radius, y=cy+Math.sin(angle)*radius*.74;
    write(ctx, phrase[(charIndex+i)%phrase.length],x,y,6.5,'rgba(47,42,34,.60)','normal','center');
  }
}

function redactedLine(ctx, hidden, x, y, charCount, pointer, time, index) {
  const step = 8.4;
  const content = hidden.padEnd(charCount, ' ').slice(0, charCount);
  const leak = Math.sin(time * .72 + index * 2.1) > .965;
  for (let i=0; i<charCount; i++) {
    const px=x+i*step;
    const dx=px-pointer.x,dy=y-pointer.y;
    const lit=dx*dx+dy*dy<82*82;
    const reveal=lit || (leak && (i+index)%4===0);
    const glyph=reveal ? content[i] : '█';
    const color=reveal ? '#9a372b' : '#292820';
    write(ctx,glyph,px,y,11,color,reveal?'bold':'normal');
  }
}

function lensMarks(ctx, x, y, visible) {
  if (!visible) return;
  const marks='＋  investigação  ＋';
  for(let i=0;i<32;i++){
    const a=i*Math.PI*2/32;
    const glyph=marks[i%marks.length];
    ctx.save();ctx.translate(x+Math.cos(a)*94,y+Math.sin(a)*94);ctx.rotate(a+Math.PI/2);
    write(ctx,glyph,0,0,7,'rgba(154,55,43,.50)','normal','center');ctx.restore();
  }
}

function renderScene(ctx, w, h, time, mouseX, mouseY, seed) {
  const designW=1200,designH=800;
  const scale=Math.min(w/designW,h/designH);
  const ox=(w-designW*scale)/2,oy=(h-designH*scale)/2;
  const rand=rng(seed);
  const localPointer={x:(mouseX-ox)/scale,y:(mouseY-oy)/scale};
  const pointerInside=localPointer.x>=95&&localPointer.x<=1105&&localPointer.y>=43&&localPointer.y<=757;
  const pointer=pointerInside?localPointer:{x:-500,y:-500};

  ctx.save();ctx.setTransform(1,0,0,1,0,0);
  ctx.fillStyle='#17201d';ctx.fillRect(0,0,w,h);
  // A mesa recebe uma textura de caracteres quase invisíveis.
  ctx.fillStyle='rgba(220,211,188,.045)';ctx.font='9px monospace';
  for(let i=0;i<Math.min(700,w*h/1200);i++)ctx.fillText(rand()>.5?'·':':',rand()*w,rand()*h);
  ctx.setTransform(scale,0,0,scale,ox,oy);

  ctx.shadowColor='rgba(0,0,0,.38)';ctx.shadowBlur=24;ctx.shadowOffsetY=11;
  ctx.fillStyle='#e7dfcc';ctx.fillRect(95,43,1010,714);
  ctx.shadowColor='transparent';

  // Marca d'água feita com texto.
  ctx.save();ctx.translate(605,424);ctx.rotate(-.12);
  write(ctx,'CONFIDENCIAL',0,0,82,'rgba(118,50,39,.055)','bold','center','Arial');ctx.restore();

  write(ctx,'ARQUIVO NACIONAL DE VESTÍGIOS',128,81,10,'#665e50','bold');
  write(ctx,'PROCESSO  '+String(seed%900000+100000),1070,81,10,'#665e50','bold','right');
  typedRule(ctx,128,100,87,'#8f8573');
  write(ctx,'PROVA DE QUE',128,145,34,'#282820','bold','left','Arial');
  write(ctx,'ESTIVE AQUI',128,181,34,'#282820','bold','left','Arial');
  write(ctx,'RELATÓRIO DE OCORRÊNCIA TIPOGRÁFICA',128,209,11,'#746b5c');

  const labels=['DATA','LOCAL','CLASSIFICAÇÃO','ESTADO DO ARQUIVO'];
  const values=['02.OUT.2026','NÃO DECLARADO','IDENTIDADE / RASTRO','PARCIALMENTE LEGÍVEL'];
  labels.forEach((label,i)=>{
    const y=259+i*38;
    write(ctx,label,128,y,8,'#8a7e6a','bold');
    write(ctx,values[i],128,y+15,11,'#3b3930');
  });

  typedRule(ctx,128,430,45,'#9c907c');
  write(ctx,'TRANSCRIÇÃO DO DEPOIMENTO',128,452,10,'#665e50','bold');
  write(ctx,'A testemunha afirma que reconheceu a própria',128,482,10,'#4b473c');
  redactedLine(ctx,'MEMÓRIA ANTES MESMO DE LER O NOME',128,505,38,pointer,time,0);
  write(ctx,'Não havia fotografia no envelope. Havia apenas',128,532,10,'#4b473c');
  redactedLine(ctx,'UMA MARCA QUE PARECIA RESPIRAR NO PAPEL',128,555,39,pointer,time,1);
  write(ctx,'Quando perguntada sobre o ocorrido, respondeu:',128,582,10,'#4b473c');
  redactedLine(ctx,'SE ME APAGARAM POR QUE AINDA DEIXO RASTROS',128,605,40,pointer,time,2);

  typedRule(ctx,128,652,45,'#9c907c');
  write(ctx,'PARECER',128,675,9,'#8a7e6a','bold');
  write(ctx,'O documento apresenta persistência semântica.',128,695,10,'#4b473c');
  write(ctx,'A censura não eliminou a presença examinada.',128,713,10,'#4b473c');

  // Divisor composto por caracteres, sem linha geométrica.
  for(let y=115;y<718;y+=12)write(ctx,'│',574,y,10,'rgba(111,102,86,.55)','normal','center');

  write(ctx,'EVIDÊNCIA BIOMÉTRICA / TIPO 07',605,126,10,'#665e50','bold');
  write(ctx,'AS CRISTAS ABAIXO SÃO FRASES',1070,126,9,'#8a7e6a','normal','right');
  fingerprint(ctx,835,411,time,pointer,rand,seed%5);
  write(ctx,'MOVA A LUZ SOBRE AS CRISTAS PARA LER',835,706,9,'#7d725f','normal','center');

  // Código de barras puramente tipográfico.
  const bars='I|IlI||I|I||lII|Il|I|||I|lI|';
  write(ctx,bars,605,742,12,'#312f28');
  write(ctx,'CLIQUE: NOVO CASO   R: REABRIR   S: SALVAR',1070,740,8,'#6f6657','normal','right');
  lensMarks(ctx,pointer.x,pointer.y,pointerInside);

  ctx.restore();
  return {scale,ox,oy,pointerInside};
}

if(typeof module!=='undefined'&&module.exports) module.exports={renderScene};
