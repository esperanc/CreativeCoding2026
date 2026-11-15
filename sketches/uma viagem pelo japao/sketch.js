// ============================================================
// Uma viagem pelo Japão
// A traveler, seen from behind, walks through Kyoto, Tokyo,
// Nara and Osaka. Each city is a small 3D world with its own song.
// p5.js 2.x, WEBGL mode.
// ============================================================

// ---------- Settings ----------

const FADE = 4;           // seconds of transition between cities
const MIN_CITY = 12;      // shortest and longest a city can last (seconds).
const MAX_CITY = 36;      // Past ~36s she would walk through Nara's temple.

// ---------- Music ----------
// Each city plays only one piece of its song (the chorus), and the city
// lasts exactly as long as that piece. Write the times as 'm:ss', the way
// they show up on YouTube or Spotify.
// To find the times, use the tuner: set TUNE below to a city name.
const SONGS = {
  Tokyo: { file: 'tokyo.mp3', title: 'Meiko - Fantasy',               from: '1:51', to: '2:15' },
  Kyoto: { file: 'kyoto.mp3', title: 'Narpy - Cherry Blossoms',       from: '0:02', to: '0:26' },
  Nara:  { file: 'nara.mp3',  title: 'Ghibli - Always With Me',       from: '1:00', to: '1:24' },
  Osaka: { file: 'osaka.mp3', title: 'Miki Matsubara - Stay With Me', from: '1:01', to: '1:25' },
};

// Tuner: put a city name here (e.g. 'Osaka') to open a screen for picking
// that song's chorus instead of playing the film. Set it back to null when done.
const TUNE = null;
const WALK_SPEED = 18;    // world units per second (the traveler is ~21 units tall)
const NEAR = 4;           // camera clipping planes (the fog shader needs them too)
const FAR = 3000;

const JP_SERIF = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif CJK JP", "Noto Serif JP", serif';
const JP_SANS = '"Hiragino Sans", "Yu Gothic", "Noto Sans CJK JP", "Noto Sans JP", sans-serif';
const LATIN_SERIF = 'Georgia, "Times New Roman", serif';

// Palettes
const VERMILION = [214, 74, 34];
const MAPLE = [[196, 58, 40], [222, 96, 46], [234, 142, 58], [168, 40, 42]];
const GINKGO = [[236, 194, 58], [246, 214, 90], [222, 170, 40]];
const NEON = [[255, 70, 160], [60, 220, 255], [255, 210, 70], [150, 100, 255], [90, 255, 170], [255, 120, 60]];
const WARM_WINDOWS = [[255, 214, 150], [255, 236, 190], [190, 220, 255]];
const TOKYO_WORDS = ['ラーメン', 'カラオケ', '居酒屋', '寿司', 'ゲーム', '喫茶', 'ホテル', '焼肉'];
const OSAKA_WORDS = ['たこ焼き', 'お好み焼', '串カツ', 'ふぐ', '道頓堀', '居酒屋', '食堂'];

let cities = [];
let fbA, fbB;     // each city is drawn into its own framebuffer
let post;         // shader that adds sky, fog, the transition and the film look
let ui;           // 2D layer for titles (text is simpler in 2D)
let started = false;
let startTime = 0;

// ---------- Setup and main loop ----------

function setup() {
  createCanvas(960, 540, WEBGL);
  fbA = createFramebuffer();
  fbB = createFramebuffer();
  ui = createGraphics(width, height);
  post = createShader(POST_VERT, POST_FRAG);

  // Order of the trip: reorder this array to change it
  cities = [makeTokyo(), makeKyoto(), makeNara(), makeOsaka()];

  // Timeline: each city starts where the previous one ended
  let t0 = 0;
  for (let c of cities) {
    let cfg = SONGS[c.name];
    c.song = makeSong(cfg.file);
    c.songFrom = toSeconds(cfg.from);
    let len = toSeconds(cfg.to) - c.songFrom;
    if (len < MIN_CITY || len > MAX_CITY) {
      console.warn(`${c.name}: o trecho tem ${len}s, vou usar entre ${MIN_CITY} e ${MAX_CITY}s`);
    }
    c.duration = constrain(len, MIN_CITY, MAX_CITY);
    c.t0 = t0;
    t0 += c.duration;
  }
}

// '1:05' -> 65. Also accepts '1:05.5' for half seconds.
function toSeconds(mmss) {
  let parts = String(mmss).split(':').map(Number);
  let secs = parts[0] * 60 + parts[1];
  if (parts.length !== 2 || isNaN(secs)) {
    console.warn('Tempo inválido: "' + mmss + '". Use o formato m:ss, por exemplo 1:05');
    return 0;
  }
  return secs;
}

function draw() {
  if (TUNE) {
    drawTuner();
    return;
  }
  let last = cities[cities.length - 1];
  let total = last.t0 + last.duration;
  let elapsed = started ? (millis() - startTime) / 1000 : 0;

  // Which city are we in? The last one whose start time has passed
  let i = 0;
  while (i < cities.length - 1 && elapsed >= cities[i + 1].t0) i++;
  let cur = cities[i];
  let next = cities[i + 1];
  let local = elapsed - cur.t0; // seconds into this city

  // 0..1 during the last FADE seconds of a city
  let fade = constrain(map(local, cur.duration - FADE, cur.duration, 0, 1), 0, 1);

  renderCity(fbA, cur, local);
  if (next && fade > 0) {
    // The next city starts a few seconds "early" (negative time), so the
    // walk is already moving when it appears and continues without a jump
    renderCity(fbB, next, local - cur.duration);
  }

  let black = 0;
  if (!started) black = 0.45;   // dim the first frame behind the start card
  else if (!next) black = fade; // last city fades to black

  composite(cur, next && fade > 0 ? next : null, fade, black);

  if (started) updateMusic(i, elapsed, next ? fade : 0, next ? 0 : fade);
  drawUI(i, local, elapsed >= total);
}

// Draws one city (scene + traveler + particles) into a framebuffer
function renderCity(fb, city, t) {
  let z = -WALK_SPEED * t; // the traveler walks toward -z

  fb.begin();
  drawingContext.enable(drawingContext.DEPTH_TEST);
  background(0);
  perspective(PI / 3.3, width / height, NEAR, FAR);
  camera(0, -15, z + 44, 0, -12, z - 100, 0, 1, 0);

  noLights();
  city.lights();
  city.draw(z, t);

  noLights();     // a city may turn lights off for glowing things,
  city.lights();  // so the traveler gets the city's light again
  drawTraveler(z);
  drawParticles(city, z, t);
  fb.end();
}

// Combines the framebuffers on screen through the post shader
function composite(a, b, fade, black) {
  drawingContext.disable(drawingContext.DEPTH_TEST);
  shader(post);
  post.setUniform('texA', fbA.color);
  post.setUniform('depthA', fbA.depth);
  post.setUniform('texB', fbB.color);
  post.setUniform('depthB', fbB.depth);
  setSky('A', a.sky);
  setSky('B', (b || a).sky);
  post.setUniform('mixAmt', b ? fade : 0);
  post.setUniform('black', black);
  post.setUniform('time', millis() / 1000);
  post.setUniform('res', [width, height]);
  post.setUniform('near', NEAR);
  post.setUniform('far', FAR);
  noStroke();
  plane(1, 1); // the vertex shader stretches it over the whole screen
  resetShader();
}

function setSky(s, sky) {
  post.setUniform('top' + s, sky.top);
  post.setUniform('hor' + s, sky.hor);
  post.setUniform('sunCol' + s, sky.sunCol);
  post.setUniform('sunPos' + s, sky.sunPos);
  post.setUniform('fog' + s, sky.fog);
  post.setUniform('stars' + s, sky.stars);
}

// ---------- Music ----------
// Songs are played with the Web Audio API instead of <audio>.
// Each mp3 is downloaded and decoded into memory once, so the song can
// start at any second instantly. With <audio>, jumping to 1:02 only works
// if the server allows it, and many don't: the song goes back to 0:00.

let audioCtx;
let missingSongs = [];

function makeSong(path) {
  if (!audioCtx) audioCtx = new AudioContext();
  let song = { path, buffer: null, source: null, gain: null };
  fetch(path)
    .then((r) => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.arrayBuffer();
    })
    .then((data) => audioCtx.decodeAudioData(data))
    .then((buffer) => {
      song.buffer = buffer;
    })
    .catch((err) => {
      // Shown on the start screen and in the console
      missingSongs.push(path);
      console.warn('Música não carregou: ' + path, err);
    });
  return song;
}

// Start playing from a given second
function startSong(song, offset) {
  if (offset >= song.buffer.duration) {
    console.warn(song.path + ': o trecho começa depois do fim da música');
    return;
  }
  song.gain = audioCtx.createGain();
  song.gain.connect(audioCtx.destination);
  song.source = audioCtx.createBufferSource(); // a source plays once, so a new one each time
  song.source.buffer = song.buffer;
  song.source.connect(song.gain);
  song.source.start(0, offset);
  song.startedAt = audioCtx.currentTime - offset; // so position = audioCtx.currentTime - startedAt
}

function stopSong(song) {
  if (!song.source) return;
  song.source.stop();
  song.source.disconnect();
  song.gain.disconnect();
  song.source = null;
}

// Browsers only allow audio after a user gesture,
// so the click that starts the film also turns sound on
function mousePressed() {
  if (TUNE) {
    tunerClick();
    return;
  }
  if (started) return;
  started = true;
  startTime = millis();
  audioCtx.resume();
}

// The current song fades out while the next one fades in.
// Each song is in sync with the film: when city k starts, its song
// is exactly at 'from'. So the next song starts FADE seconds before its
// chorus, and those seconds of lead-in are what you hear fading in.
function updateMusic(i, elapsed, crossfade, fadeOut) {
  for (let k = 0; k < cities.length; k++) {
    let c = cities[k];
    let song = c.song;
    if (!song.buffer) continue; // still loading (or missing)

    let v = 0;
    if (k === i) v = (1 - crossfade) * (1 - fadeOut);
    if (k === i + 1) v = crossfade;

    if (v === 0) {
      stopSong(song);
      continue;
    }
    let wanted = max(0, c.songFrom + (elapsed - c.t0)); // where the song should be now
    if (!song.source) {
      startSong(song, wanted);
    } else if (abs(audioCtx.currentTime - song.startedAt - wanted) > 0.5) {
      stopSong(song); // out of sync with the film: restart at the right spot
      startSong(song, wanted);
    }
    if (song.gain) song.gain.gain.value = v;
  }
}

// ---------- Tuner (only used when TUNE is set) ----------
// Shows the whole song as a waveform so the chorus is easy to spot
// (it is usually the loudest, densest part). Mark the start and end,
// listen to it the way the film will play it, then copy the line into SONGS.

let tuner = null;

function setupTuner() {
  let city = cities.find((c) => c.name === TUNE);
  if (!city) return { error: 'Não existe cidade chamada "' + TUNE + '"' };
  let cfg = SONGS[TUNE];
  return {
    city, cfg, song: city.song,
    from: toSeconds(cfg.from), to: toSeconds(cfg.to),
    pos: 0,           // where the playhead is while paused
    playing: false,
    peaks: null,      // waveform, computed once the mp3 is loaded
  };
}

// Loudest sample in each slice of the song: one value per column on screen
function computePeaks(buffer, n) {
  let data = buffer.getChannelData(0);
  let chunk = floor(data.length / n);
  let peaks = [];
  for (let k = 0; k < n; k++) {
    let m = 0;
    for (let j = k * chunk; j < (k + 1) * chunk; j += 16) m = max(m, abs(data[j]));
    peaks.push(m);
  }
  return peaks;
}

function tunerPos() {
  if (!tuner.playing) return tuner.pos;
  return audioCtx.currentTime - tuner.song.startedAt;
}

function tunerPlay(at) {
  stopSong(tuner.song);
  audioCtx.resume();
  tuner.pos = constrain(at, 0, tuner.song.buffer.duration - 0.1);
  startSong(tuner.song, tuner.pos);
  tuner.playing = true;
}

function tunerPause() {
  tuner.pos = tunerPos();
  stopSong(tuner.song);
  tuner.playing = false;
}

// Plays the piece exactly like the film: fades in during the FADE seconds
// before 'from', and fades out during the last FADE seconds before 'to'
function tunerPreview() {
  let start = max(0, tuner.from - FADE);
  tunerPlay(start);
  let g = tuner.song.gain.gain;
  let now = audioCtx.currentTime;
  let toAt = now + (tuner.to - start);
  g.setValueAtTime(0, now);
  g.linearRampToValueAtTime(1, now + (tuner.from - start));
  g.setValueAtTime(1, toAt - FADE);
  g.linearRampToValueAtTime(0, toAt);
  tuner.stopAt = tuner.to;
}

// Waveform area on screen
const TX = 40, TW = 880, TY = 190, TH = 150;

function tunerClick() {
  if (!tuner || !tuner.song.buffer) return;
  audioCtx.resume();
  if (mouseY > TY - 20 && mouseY < TY + TH + 20 && mouseX > TX && mouseX < TX + TW) {
    let t = map(mouseX, TX, TX + TW, 0, tuner.song.buffer.duration);
    tuner.stopAt = null;
    if (tuner.playing) tunerPlay(t);
    else tuner.pos = t;
  }
}

function keyPressed() {
  if (!TUNE || !tuner || !tuner.song.buffer) return;
  let jump = keyIsDown(SHIFT) ? 5 : 1;
  let k = key.toLowerCase();
  tuner.stopAt = null;
  if (key === ' ') tuner.playing ? tunerPause() : tunerPlay(tunerPos());
  else if (key === 'ArrowLeft') jumpTuner(-jump);
  else if (key === 'ArrowRight') jumpTuner(jump);
  else if (k === 'i') tuner.from = round(tunerPos() * 10) / 10; // mark start
  else if (k === 'o') tuner.to = round(tunerPos() * 10) / 10;   // mark end
  else if (k === 'p') tunerPreview();
  else if (k === 'c') {
    navigator.clipboard.writeText(tunerLine()).catch(() => {});
    console.log(tunerLine());
  }
  return false; // keeps the page from scrolling with space and arrows
}

function jumpTuner(d) {
  let t = tunerPos() + d;
  if (tuner.playing) tunerPlay(t);
  else tuner.pos = constrain(t, 0, tuner.song.buffer.duration);
}

// 62.5 -> '1:02.5'
function formatTime(secs) {
  let m = floor(secs / 60);
  let sec = secs - m * 60;
  let txt = sec.toFixed(1);
  if (sec < 10) txt = '0' + txt;
  return m + ':' + txt.replace('.0', '');
}

function tunerLine() {
  let c = tuner.cfg;
  return `${TUNE}: { file: '${c.file}', title: '${c.title}', from: '${formatTime(tuner.from)}', to: '${formatTime(tuner.to)}' },`;
}

function drawTuner() {
  if (!tuner) tuner = setupTuner();
  background(18, 16, 26);
  ui.clear();
  ui.push();
  ui.noStroke();
  ui.textFont(LATIN_SERIF);
  ui.textAlign(LEFT, BASELINE);

  if (tuner.error) {
    ui.fill(255, 150, 130);
    ui.textSize(18);
    ui.text(tuner.error + '. Use: ' + cities.map((c) => "'" + c.name + "'").join(', '), TX, 80);
    ui.pop();
    image(ui, -width / 2, -height / 2, width, height);
    return;
  }

  ui.fill(255);
  ui.textSize(24);
  ui.text('Ajuste da música: ' + TUNE, TX, 56);
  ui.fill(255, 160);
  ui.textSize(14);
  ui.text(tuner.cfg.title + '  ·  ' + tuner.cfg.file, TX, 80);

  let buf = tuner.song.buffer;
  if (!buf) {
    ui.fill(255, 200);
    ui.textSize(16);
    let msg = missingSongs.includes(tuner.cfg.file) ? 'Não achei o arquivo ' + tuner.cfg.file : 'carregando a música...';
    ui.text(msg, TX, 140);
    ui.pop();
    image(ui, -width / 2, -height / 2, width, height);
    return;
  }
  if (!tuner.peaks) tuner.peaks = computePeaks(buf, TW / 2);

  let dur = buf.duration;
  let pos = tunerPos();
  if (tuner.playing && tuner.stopAt && pos >= tuner.stopAt) tunerPause(); // end of preview
  if (tuner.playing && pos >= dur - 0.1) tunerPause();
  let xOf = (t) => map(t, 0, dur, TX, TX + TW);

  // Big clock
  ui.fill(255);
  ui.textSize(40);
  ui.text(formatTime(pos), TX, 140);
  ui.fill(255, 120);
  ui.textSize(16);
  ui.text(' / ' + formatTime(dur) + (tuner.playing ? '   ▶' : '   ❚❚'), TX + 130, 140);

  // Shaded areas: full volume (strong), fades (soft)
  ui.fill(255, 170, 80, 40);
  ui.rect(xOf(max(0, tuner.from - FADE)), TY, xOf(tuner.from) - xOf(max(0, tuner.from - FADE)), TH);
  ui.rect(xOf(tuner.to - FADE), TY, xOf(tuner.to) - xOf(tuner.to - FADE), TH);
  ui.fill(255, 170, 80, 80);
  ui.rect(xOf(tuner.from), TY, max(0, xOf(tuner.to - FADE) - xOf(tuner.from)), TH);

  // Waveform: one bar every 2 pixels
  let mid = TY + TH / 2;
  for (let k = 0; k < tuner.peaks.length; k++) {
    let x = TX + k * 2;
    let t = map(x, TX, TX + TW, 0, dur);
    let inside = t >= tuner.from && t <= tuner.to;
    ui.fill(inside ? color(255, 200, 130) : color(150, 150, 175));
    let h = max(1, tuner.peaks[k] * TH * 0.95);
    ui.rect(x, mid - h / 2, 1.4, h);
  }

  // Markers
  ui.textSize(12);
  ui.textAlign(CENTER, BASELINE);
  for (let [t, label] of [[tuner.from, 'início ' + formatTime(tuner.from)], [tuner.to, 'fim ' + formatTime(tuner.to)]]) {
    ui.fill(255, 200, 130);
    ui.rect(xOf(t) - 1, TY - 6, 2, TH + 12);
    ui.text(label, xOf(t), TY - 12);
  }
  ui.fill(255);
  ui.rect(xOf(pos) - 1, TY - 4, 2, TH + 8); // playhead

  // How long the city will last
  let len = tuner.to - tuner.from;
  ui.textAlign(LEFT, BASELINE);
  ui.textSize(13);
  ui.fill(len < MIN_CITY || len > MAX_CITY ? color(255, 150, 130) : color(255, 160));
  ui.text(`trecho: ${len.toFixed(1)}s (a cidade aceita de ${MIN_CITY} a ${MAX_CITY}s)`, TX, TY + TH + 30);

  // Instructions
  ui.fill(255, 200);
  ui.textSize(14);
  ui.text('espaço: tocar / pausar      ← →: voltar / avançar 1s (shift: 5s)      clique na onda: pular', TX, 418);
  ui.text('I: marcar início      O: marcar fim      P: ouvir como vai ficar no filme      C: copiar a linha', TX, 442);

  // The line to paste into SONGS
  ui.fill(255, 120);
  ui.textSize(12);
  ui.text('Cole esta linha na tabela SONGS (e depois volte TUNE para null):', TX, 482);
  ui.fill(255, 220, 160);
  ui.textFont('Menlo, Consolas, monospace');
  ui.textSize(12);
  ui.text(tunerLine(), TX, 504);

  ui.pop();
  image(ui, -width / 2, -height / 2, width, height);
}

// ---------- Titles (2D layer) ----------

function drawUI(i, local, ended) {
  ui.clear();
  ui.push();
  ui.drawingContext.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ui.drawingContext.shadowBlur = 18;
  ui.noStroke();
  if (!started) drawStartCard();
  else if (ended) drawEndCard();
  else drawCityTitle(cities[i], i, local);
  ui.pop();
  image(ui, -width / 2, -height / 2, width, height);
}

function drawStartCard() {
  let cx = width / 2, cy = height / 2;
  ui.textAlign(CENTER, CENTER);
  ui.fill(255, 220);
  ui.textFont(JP_SERIF);
  ui.textSize(18);
  ui.text(cities.map((c) => c.kanji).join('  ·  '), cx, cy - 58);
  ui.fill(255);
  ui.textFont(LATIN_SERIF);
  ui.textSize(42);
  ui.text('Uma viagem pelo Japão', cx, cy - 8);
  let pulse = 0.55 + 0.45 * sin(millis() / 400);
  ui.fill(255, 200 * pulse);
  ui.textSize(13);
  ui.text('clique para começar', cx, cy + 46);
  if (missingSongs.length > 0) {
    ui.fill(255, 150, 130);
    ui.textSize(11);
    ui.text('sem arquivo: ' + missingSongs.join(', '), cx, height * 0.86);
  }
}

function drawEndCard() {
  ui.textAlign(CENTER, CENTER);
  ui.fill(255);
  ui.textFont(JP_SERIF);
  ui.textSize(64);
  ui.text('終', width / 2, height / 2 - 14);
  ui.fill(255, 170);
  ui.textFont(LATIN_SERIF);
  ui.textSize(13);
  ui.text('f i m', width / 2, height / 2 + 42);
}

function drawCityTitle(city, i, local) {
  // Fades in from 0.8s to 2s, holds, fades out from 5.5s to 7s
  let a = min(map(local, 0.8, 2, 0, 1, true), map(local, 5.5, 7, 1, 0, true));
  if (a <= 0) return;
  let x = 60;
  let y = height * 0.09 + 78 + (1 - a) * 10; // drifts up as it appears

  ui.textAlign(LEFT, BASELINE);
  ui.fill(255, 255 * a);
  ui.textFont(JP_SERIF);
  ui.textSize(56);
  ui.text(city.kanji, x, y);

  ui.textFont(LATIN_SERIF);
  ui.textSize(14);
  ui.text(city.name.toUpperCase().split('').join(' '), x + 3, y + 32);
  ui.fill(255, 150 * a);
  ui.textSize(11);
  ui.text(`${i + 1} / ${cities.length}`, x + 3, y + 54);
}

// ---------- Traveler ----------
// Built from the hips up. Every part is drawn inside push/pop with
// translate to its joint first, so rotating it swings it around that joint
// (thigh around the hip, shin around the knee, forearm around the elbow).

const SKIN = [236, 196, 166];
const HAIR = [44, 31, 28];
const HAIR_LIGHT = [72, 50, 40];
const COAT = [46, 98, 104];
const COAT_DARK = [34, 74, 80];
const JEANS = [48, 56, 82];
const PACK = [214, 160, 64];
const PACK_DARK = [176, 126, 46];

function drawTraveler(z) {
  let phase = (-z / 18) * TWO_PI;           // one gait cycle every 18 units walked
  let bob = (1 + cos(2 * phase)) * 0.16;    // body rises as the legs pass each other
  let sway = sin(phase) * 0.12;             // weight shifts from one foot to the other
  let look = sin(-z / 70) * 0.25;           // now and then she looks around the city

  noStroke();
  push();
  translate(sway, -bob, z);
  rotateZ(-sway * 0.15);

  for (let side of [-1, 1]) drawLeg(side, phase);

  // Coat: an 8-sided cone, flattened front to back, wider at the hem
  push();
  translate(0, -7.2, 0);
  scale(1, 1, 0.62);
  taper(3.4, 2.7, 8.7, 8, COAT);
  pop();
  fill(...COAT);
  push(); translate(0, -15.6, 0); ellipsoid(3.5, 1.3, 1.8, 10, 6); pop(); // shoulders
  fill(...COAT_DARK);
  boxAt(0, -11.2, 0, 6.3, 0.6, 3.95);  // belt
  boxAt(0, -8.2, 2.05, 0.25, 2, 0.1);  // back slit of the coat

  for (let side of [-1, 1]) drawArm(side, phase);

  fill(...SKIN);
  push(); translate(0, -17.2, 0); cylinder(0.8, 1.8, 8, 1); pop(); // neck

  drawBackpack(phase);
  drawScarf(phase);

  // Head and hair turn together when she looks around
  push();
  translate(0, -19, 0);
  rotateY(look);
  drawHair(phase);
  pop();

  pop();
}

function drawLeg(side, phase) {
  let thigh = -0.42 * sin(phase) * side;                     // negative = forward
  let swinging = max(0, cos(phase) * side);                  // 1 while the leg travels forward
  let knee = 0.08 + 0.75 * swinging;                         // bend the knee to lift the foot

  push();
  translate(side * 1.25, -8.4, 0);   // hip joint
  rotateX(thigh);
  fill(...JEANS);
  push(); translate(0, 2.1, 0); box(2.1, 4.4, 2.2); pop();

  translate(0, 4.2, 0);              // knee joint
  rotateX(knee);
  push(); translate(0, 1.8, 0); box(1.9, 3.8, 2.0); pop();

  translate(0, 3.6, 0);              // ankle: keep the foot closer to flat
  rotateX(-(thigh + knee) * 0.7);
  fill(245, 242, 236);
  boxAt(0, 0.25, -0.5, 2.1, 0.8, 3.3); // white sneaker
  fill(70, 70, 76);
  boxAt(0, 0.62, -0.5, 2.2, 0.22, 3.4); // sole
  pop();
}

function drawArm(side, phase) {
  let swing = 0.38 * sin(phase) * side;            // opposite to the leg on the same side
  let elbow = -0.3 - 0.25 * max(0, -sin(phase) * side); // bends more when the arm swings forward

  push();
  translate(side * 3.45, -15.5, 0);  // shoulder joint
  rotateZ(side * 0.09);              // slightly away from the body
  rotateX(swing);
  fill(...COAT);
  push(); translate(0, 1.8, 0); cylinder(0.8, 3.8, 8, 1); pop();

  translate(0, 3.6, 0);              // elbow joint
  rotateX(elbow);
  push(); translate(0, 1.6, 0); cylinder(0.72, 3.4, 8, 1); pop();
  fill(...COAT_DARK);
  push(); translate(0, 3.2, 0); cylinder(0.78, 0.5, 8, 1); pop(); // cuff
  fill(...SKIN);
  push(); translate(0, 3.9, 0); ellipsoid(0.62, 0.8, 0.5, 8, 6); pop(); // hand
  pop();
}

// Sits low on the back so the hair can fall over its top
function drawBackpack(phase) {
  fill(...PACK);
  boxAt(0, -10.4, 2.85, 4.8, 5.2, 2.2);
  push(); translate(0, -13, 2.85); ellipsoid(2.3, 0.45, 1.05, 10, 6); pop(); // rounded top
  fill(...PACK_DARK);
  boxAt(0, -12.2, 3.98, 4.9, 1.6, 0.12);   // flap
  boxAt(0, -9.3, 4.15, 3.4, 2.2, 0.5);     // front pocket
  fill(60, 50, 40);
  boxAt(0, -10.4, 4.42, 3.0, 0.12, 0.05);  // zipper
  fill(150, 200, 220);
  push(); translate(2.7, -10, 2.8); cylinder(0.55, 2.4, 8, 1); pop(); // water bottle

  // Omamori charm hanging from the backpack, swinging with each step
  push();
  translate(-1.8, -7.9, 4.1);
  rotateZ(sin(phase * 2 + 1) * 0.45);
  rotateX(sin(phase * 2) * 0.25);
  fill(240, 230, 210);
  boxAt(0, 0.6, 0, 0.08, 1.2, 0.08); // string
  fill(200, 40, 50);
  boxAt(0, 1.7, 0, 0.8, 1.1, 0.2);   // little pouch
  fill(230, 190, 80);
  boxAt(0, 1.5, 0.12, 0.5, 0.15, 0.05); // gold embroidery
  pop();
}

function drawScarf(phase) {
  fill(178, 60, 50);
  push();
  translate(0, -16.9, 0);
  rotateX(HALF_PI);
  torus(1.5, 0.7, 12, 6);
  pop();
}

// Loose hair, drawn relative to the center of the head
function drawHair(phase) {
  fill(...HAIR);
  push(); translate(0, -0.1, 0.1); ellipsoid(2.45, 2.6, 2.45, 14, 10); pop(); // top of the head
  push(); translate(0, 1.8, 1.3); ellipsoid(2.7, 3.3, 1.5, 12, 8); pop();     // volume at the nape

  // Strands: each one hangs from the back of the head, wider at the root
  // and narrower at the tip, and moves a little out of sync with the others
  for (let k = 0; k < 13; k++) {
    let u = map(k, 0, 12, -1, 1);                        // -1 = left edge, 1 = right edge
    let len = 7.2 - abs(u) * 0.8 + sin(k * 2.3) * 0.5;   // uneven ends look natural
    let move = sin(phase * 2 + k * 0.6) * 0.05;
    push();
    translate(u * 2.2, -0.6 + abs(u) * 0.8, 0.9 + (1 - u * u) * 0.9);
    rotateZ(u * 0.2 + move * 0.5);    // open toward the shoulders, so the sides show beside the backpack
    // the middle strands lean back more, to lie over the top of the backpack
    rotateX(0.16 + (1 - abs(u)) * 0.12 + move);
    fill(...(k % 4 === 1 ? HAIR_LIGHT : HAIR));
    boxAt(0, len * 0.3, 0, 1.05, len * 0.6, 0.75);
    boxAt(0, len * 0.78, 0, 0.7, len * 0.4, 0.55);
    pop();
  }
}

// ---------- Falling leaves ----------

function makeLeaves(n, palette) {
  let arr = [];
  for (let k = 0; k < n; k++) {
    arr.push({
      x: random(-32, 32), y: random(45), z: random(140),
      fall: random(2.5, 5), sway: random(0.6, 1.4), spin: random(1, 3),
      phase: random(TWO_PI), size: random(0.6, 1.1), col: random(palette),
    });
  }
  return arr;
}

function drawParticles(city, z, t) {
  if (!city.particles) return;
  noStroke();
  for (let p of city.particles) {
    // Each leaf stays fixed in the world; once it is behind the camera
    // it reappears 140 units ahead (wrap with a positive modulo)
    let zz = z + 30 - posMod(z + 30 - p.z, 140);
    let y = -45 + posMod(p.y + t * p.fall, 45);
    let x = p.x + sin(t * p.sway + p.phase) * 2;
    push();
    translate(x, y, zz);
    rotateX(t * p.spin + p.phase);
    rotateY(t * p.spin * 0.7);
    fill(...p.col);
    plane(p.size, p.size * 0.7);
    pop();
  }
}

// ============================================================
// Cities
// Each city has: name, kanji, song, sky settings for the shader,
// lights(), and draw(z, t) where z is the traveler position.
// ============================================================

// ---------- Kyoto: Fushimi Inari, a tunnel of torii in autumn ----------

function makeKyoto() {
  randomSeed(11);
  let trees = [];
  for (let k = 0; k < 150; k++) {
    trees.push({
      x: random([-1, 1]) * random(11, 70), z: random(140, -1000),
      s: random(0.7, 1.4), cols: [random(MAPLE), random(MAPLE), random(MAPLE)],
      cedar: random() < 0.25,
    });
  }
  let hills = [];
  for (let k = 0; k < 10; k++) {
    hills.push({
      x: random([-1, 1]) * random(160, 520), z: random(-500, -1700),
      rx: random(150, 300), ry: random(60, 140), col: random([[58, 82, 58], [72, 90, 60], [96, 70, 50]]),
    });
  }

  return {
    name: 'Kyoto', kanji: '京都',
    sky: { top: [0.42, 0.52, 0.72], hor: [1.0, 0.84, 0.66], sunCol: [1.0, 0.76, 0.48], sunPos: [0.5, 0.62], fog: 0.0055, stars: 0 },
    particles: makeLeaves(150, MAPLE),

    lights() {
      ambientLight(135, 118, 108);
      directionalLight(255, 214, 170, -0.35, 0.6, -0.7);
      directionalLight(80, 80, 120, 0.5, 0.3, 0.6);
    },

    draw(z, t) {
      noStroke();
      groundPlane(0, 0, z - 1200, 4000, 3000, [74, 92, 56]);
      groundPlane(-0.05, 0, z - 1200, 11, 3000, [150, 138, 120]); // path

      for (let h of hills) {
        fill(...h.col);
        push();
        translate(h.x, 0, h.z);
        ellipsoid(h.rx, h.ry, h.rx * 0.7, 8, 5);
        pop();
      }

      // Gates every 6.5 units, generated around the traveler
      let sp = 6.5;
      for (let k = floor((z + 60) / sp); k * sp > z - 520; k--) drawTorii(k * sp, k);

      for (let k = floor((z + 60) / 26); k * 26 > z - 400; k--) {
        stoneLantern(k % 2 === 0 ? -10 : 10, k * 26 - 3);
      }

      for (let tr of trees) {
        if (tr.z > z + 70 || tr.z < z - 900) continue;
        if (tr.cedar) drawCedar(tr);
        else drawRoundTree(tr);
      }
    },
  };
}

// The lower beam must clear the traveler's head (top of the head is at y = -21.6)
function drawTorii(gz, k) {
  let h = 28 + noise(k * 0.37) * 2; // tiny variation from gate to gate
  let px = 6.4;                      // pillar distance from the center
  push();
  translate(0, 0, gz);
  for (let s of [-1, 1]) {
    fill(...VERMILION);
    push();
    translate(s * px, -h / 2, 0);
    cylinder(0.85, h, 12, 1);
    pop();
    fill(25);
    push();
    translate(s * px, -1.2, 0);
    cylinder(1.0, 2.4, 12, 1); // black base
    pop();
  }
  fill(...VERMILION);
  boxAt(0, -h + 3.4, 0, 15.4, 0.9, 0.9);  // lower beam (nuki), about 2 units above her head
  boxAt(0, -h - 0.2, 0, 15.2, 1.1, 1.3);  // upper beam
  fill(28);
  boxAt(0, -h - 1.2, 0, 15.6, 1.1, 1.8);  // black top (kasagi)
  for (let s of [-1, 1]) {
    push();
    translate(s * 8.8, -h - 1.5, 0);
    rotateZ(s * -0.18); // ends curve upward
    box(3, 1.1, 1.8);
    pop();
  }
  pop();
}

// ---------- Tokyo: neon street at night, Tokyo Tower at the end ----------

function makeTokyo() {
  randomSeed(23);
  let facades = [];
  for (let k = 0; k < 6; k++) {
    facades.push(makeFacade([random(18, 34), random(18, 30), random(30, 46)], WARM_WINDOWS, random(0.25, 0.5)));
  }
  let signTex = TOKYO_WORDS.map((w, k) => makeSign(w, NEON[k % NEON.length]));

  let buildings = [];
  let signs = [];
  for (let side of [-1, 1]) {
    let bz = 140;
    while (bz > -1000) {
      let d = random(14, 30);
      let w = random(18, 34);
      let h = random(30, 130);
      buildings.push({ x: side * (15 + w / 2), z: bz - d / 2, w, h, d, tex: floor(random(facades.length)) });
      if (random() < 0.85) {
        let s = random(signTex);
        let sh = 3.4 * s.ratio;
        signs.push({ x: side * 13.2, y: -(9 + sh / 2 + random(0, 14)), z: bz - random(2, d - 2), s, sh });
      }
      bz -= d + random(0.5, 3);
      if (random() < 0.08) bz -= 16; // a cross street
    }
  }
  let skyline = [];
  for (let k = 0; k < 120; k++) {
    let w = random(25, 60);
    skyline.push({ x: random([-1, 1]) * random(60, 420), z: random(-100, -1700), w, d: w, h: random(60, 260), tex: floor(random(facades.length)) });
  }

  return {
    name: 'Tokyo', kanji: '東京',
    sky: { top: [0.02, 0.03, 0.10], hor: [0.30, 0.15, 0.36], sunCol: [0.55, 0.6, 0.75], sunPos: [0.82, 0.83], fog: 0.0007, stars: 1 },
    particles: null,

    lights() {
      ambientLight(70, 60, 95);
      directionalLight(255, 110, 200, 0.7, 0.3, -0.6);  // pink neon from the left
      directionalLight(80, 200, 255, -0.7, 0.2, -0.5);  // cyan neon from the right
    },

    draw(z, t) {
      noLights(); // at night everything here "glows" with its own color
      noStroke();
      groundPlane(0, 0, z - 1200, 4000, 3000, [16, 16, 22]);
      groundPlane(-0.03, 0, z - 1200, 30, 3000, [44, 42, 52]); // sidewalks
      groundPlane(-0.06, 0, z - 1200, 20, 3000, [28, 28, 36]); // road

      fill(200, 200, 210);
      for (let k = floor((z + 60) / 10); k * 10 > z - 600; k--) boxAt(0, -0.1, k * 10, 0.4, 0.05, 4);
      for (let k = floor((z + 60) / 140); k * 140 > z - 800; k--) {
        for (let x = -9; x <= 9; x += 2.25) boxAt(x, -0.12, k * 140 - 20, 1.2, 0.05, 6); // crosswalk
      }

      for (let b of skyline) drawTexturedBox(b, facades);
      for (let b of buildings) {
        if (b.z > z + 120 || b.z < z - 1300) continue;
        drawTexturedBox(b, facades);
      }

      for (let s of signs) {
        if (s.z > z + 80 || s.z < z - 700) continue;
        push();
        translate(s.x, s.y, s.z);
        texture(s.s.img);
        plane(3.4, s.sh);
        pop();
      }

      // Street lamps
      for (let k = floor((z + 60) / 24); k * 24 > z - 600; k--) {
        for (let side of [-1, 1]) {
          fill(30, 30, 36);
          push();
          translate(side * 11, -6, k * 24);
          cylinder(0.25, 12, 6, 1);
          pop();
          fill(255, 226, 170);
          boxAt(side * 10.5, -12.2, k * 24, 1.2, 0.35, 0.6);
        }
      }

      drawTokyoTower(0, -1150, t);
    },
  };
}

function drawTokyoTower(x, z, t) {
  let orange = [255, 118, 40];
  let white = [255, 225, 190];
  push();
  translate(x, 0, z);
  taper(36, 15, 70, 4, orange);
  push(); translate(0, -70, 0); taper(17, 17, 8, 4, white); pop();  // main deck
  push(); translate(0, -78, 0); taper(14, 7, 62, 4, orange); pop();
  push(); translate(0, -140, 0); taper(8, 8, 5, 4, white); pop();   // top deck
  push(); translate(0, -145, 0); taper(7, 4.5, 16, 4, orange); pop();
  push(); translate(0, -161, 0); taper(4.5, 3, 12, 4, white); pop();
  push(); translate(0, -173, 0); taper(3, 1.5, 14, 4, orange); pop();
  fill(255, 240, 220);
  push(); translate(0, -202, 0); cylinder(0.7, 30, 6, 1); pop();       // antenna
  // Blinking light on top
  fill(255, 60, 60, 120 + 135 * (sin(t * 3) > 0 ? 1 : 0));
  push(); translate(0, -218, 0); sphere(1.6, 8, 6); pop();
  pop();
}

// ---------- Nara: deer, the Nandaimon gate and Todai-ji ----------

function makeNara() {
  randomSeed(37);
  let ginkgo = [];
  for (let k = 0; k < 50; k++) {
    ginkgo.push({ x: random([-1, 1]) * random(14, 45), z: random(140, -650), s: random(0.8, 1.3), cols: [random(GINKGO), random(GINKGO), random(GINKGO)] });
  }
  let cedars = [];
  for (let k = 0; k < 90; k++) {
    cedars.push({ x: random([-1, 1]) * random(50, 260), z: random(60, -1200), s: random(1.2, 2.4) });
  }
  let deer = [];
  for (let k = 0; k < 14; k++) {
    deer.push({ x: random([-1, 1]) * random(9, 38), z: random(30, -600), rot: random(TWO_PI), phase: random(TWO_PI), s: random(0.85, 1.1) });
  }

  return {
    name: 'Nara', kanji: '奈良',
    sky: { top: [0.38, 0.60, 0.88], hor: [0.88, 0.92, 0.92], sunCol: [1.0, 0.94, 0.80], sunPos: [0.2, 0.86], fog: 0.0011, stars: 0 },
    particles: makeLeaves(110, GINKGO),

    lights() {
      ambientLight(150, 150, 145);
      directionalLight(255, 244, 220, 0.5, 0.7, -0.5);
    },

    draw(z, t) {
      noStroke();
      groundPlane(0, 0, z - 1200, 4000, 3000, [106, 138, 74]);
      groundPlane(-0.05, 0, z - 1200, 16, 3000, [196, 186, 160]); // gravel path

      for (let k = floor((z + 60) / 22); k * 22 > z - 600; k--) {
        let lz = k * 22;
        if (lz < -235 && lz > -265) continue; // no lanterns inside the gate
        stoneLantern(-10.5, lz);
        stoneLantern(10.5, lz);
      }

      drawNandaimon(-250);
      drawDaibutsuden(-760);
      drawPagoda(-110, -520);

      for (let c of cedars) if (c.z < z + 80) drawCedar(c);
      for (let g of ginkgo) if (g.z < z + 80) drawRoundTree(g);
      for (let d of deer) drawDeer(d, t, z);
    },
  };
}

function drawNandaimon(gz) {
  let wood = [96, 66, 48];
  let tile = [64, 66, 68];
  push();
  translate(0, 0, gz);
  fill(...wood);
  for (let sx of [-21, -11, 11, 21]) {
    for (let sz of [-6, 6]) {
      push();
      translate(sx, -11, sz);
      cylinder(0.9, 22, 10, 1);
      pop();
    }
  }
  boxAt(0, -22.5, 0, 48, 1.5, 14);
  fill(...tile);
  push(); translate(0, -23, 0); hipRoof(62, 26, 10); pop();
  fill(...wood);
  boxAt(0, -31, 0, 44, 7, 13);
  fill(...tile);
  push(); translate(0, -34, 0); hipRoof(64, 28, 13); pop();
  pop();
}

function drawDaibutsuden(hz) {
  let wood = [92, 60, 44];
  let plaster = [236, 228, 212];
  let tile = [60, 64, 68];
  push();
  translate(0, 0, hz);
  fill(170, 164, 150);
  boxAt(0, -1.5, 0, 180, 3, 115); // stone platform

  fill(...plaster);
  boxAt(0, -14, 0, 150, 22, 90);
  fill(...wood);
  for (let x = -72; x <= 72; x += 12) boxAt(x, -14, 45.3, 1.6, 22, 0.6);
  boxAt(0, -24.3, 45.3, 150, 1.4, 0.6);
  boxAt(0, -4, 45.3, 150, 1.4, 0.6);
  fill(...tile);
  push(); translate(0, -25, 0); hipRoof(176, 112, 14); pop();

  fill(...plaster);
  boxAt(0, -40, 0, 118, 18, 68);
  fill(...wood);
  for (let x = -54; x <= 54; x += 12) boxAt(x, -40, 34.3, 1.4, 18, 0.6);
  fill(40, 30, 28);
  boxAt(0, -41, 34.4, 20, 8, 0.6); // window where the Buddha looks out
  fill(...tile);
  push(); translate(0, -49, 0); hipRoof(150, 94, 24); pop();

  fill(214, 170, 70); // golden ornaments (shibi) at the ends of the ridge
  boxAt(-37, -75, 0, 2.5, 4.5, 3.5);
  boxAt(37, -75, 0, 2.5, 4.5, 3.5);
  pop();
}

function drawPagoda(px, pz) {
  push();
  translate(px, 0, pz);
  fill(160, 154, 140);
  boxAt(0, -1.5, 0, 30, 3, 30);
  for (let i = 0; i < 5; i++) {
    let w = 18 - i * 2.4;
    let y0 = -3 - i * 11;
    fill(84, 56, 42);
    boxAt(0, y0 - 4, 0, w, 8, w);
    fill(58, 60, 62);
    push(); translate(0, y0 - 8, 0); hipRoof(w + 11, w + 11, 3.6); pop();
  }
  fill(190, 150, 70);
  push(); translate(0, -67, 0); cylinder(0.5, 22, 8, 1); pop();
  for (let k = 0; k < 6; k++) {
    push(); translate(0, -60 - k * 2.2, 0); cylinder(1.3, 0.4, 10, 1); pop();
  }
  pop();
}

function drawDeer(d, t, zT) {
  // Nara deer bow when someone walks by
  let dz = abs(d.z - zT);
  let bow = abs(d.x) < 18 ? constrain(map(dz, 24, 8, 0, 1), 0, 1) : 0;
  let graze = max(0, sin(t * 0.6 + d.phase));
  let head = -0.2 + 1.1 * max(bow, graze * 0.9);
  let brown = [156, 104, 62];

  push();
  translate(d.x, 0, d.z);
  rotateY(d.rot);
  scale(d.s);
  fill(...brown);
  push(); translate(0, -6.2, 0); ellipsoid(3.6, 2.1, 1.7, 10, 8); pop();
  for (let lx of [-2.4, 2.4]) {
    for (let lz of [-0.9, 0.9]) boxAt(lx, -2.6, lz, 0.55, 5.2, 0.55);
  }
  fill(240, 232, 220);
  boxAt(-3.7, -6.6, 0, 0.6, 1.2, 1.2); // white tail

  push(); // neck and head rotate together from the shoulders
  translate(2.8, -7.2, 0);
  rotateZ(head);
  fill(...brown);
  push(); translate(0.9, -1.6, 0); rotateZ(0.45); box(1.2, 3.6, 1.1); pop();
  push(); translate(2.1, -3.3, 0); ellipsoid(1.5, 0.9, 0.85, 8, 6); pop();
  boxAt(1.6, -4.1, 0.8, 0.4, 0.9, 0.3); // ears
  boxAt(1.6, -4.1, -0.8, 0.4, 0.9, 0.3);
  pop();
  pop();
}

// ---------- Osaka: Dotonbori canal at dusk ----------
// Layout (x across, z along the walk):
//   x < -7      shops on the traveler's side: lit fronts, noren, lanterns
//   x = -4..4   promenade where she walks
//   x = 5..40   the canal (reflections, river boat, bridge)
//   x > 41      the far bank: billboards, a giant octopus, an oval ferris wheel

const WATER_Y = 2.5; // water surface sits a bit below the promenade (y = 0)
const BANNERS = ['たこ焼', 'お好み焼', 'ラーメン', '串カツ', 'うどん', '寿司', '焼鳥', 'かに'];

function makeOsaka() {
  randomSeed(53);
  let facades = [];
  for (let k = 0; k < 6; k++) {
    facades.push(makeFacade([random(40, 60), random(30, 44), random(46, 62)], WARM_WINDOWS, random(0.3, 0.55)));
  }
  let signTex = OSAKA_WORDS.map((w, k) => makeSign(w, NEON[(k + 2) % NEON.length]));
  let bannerTex = BANNERS.map((w, k) => makeBanner(w, NEON[k % NEON.length]));

  // Traveler's side: one shop per building
  let left = [], signs = [], shops = [];
  let bz = 140;
  while (bz > -900) {
    let d = random(12, 22), w = random(16, 30), h = random(24, 80);
    left.push({ x: -(7 + w / 2), z: bz - d / 2, w, h, d, tex: floor(random(facades.length)) });
    shops.push({
      z: bz - d / 2, d,
      banner: random(bannerTex),
      noren: random([[40, 52, 110], [150, 40, 40], [30, 30, 34], [220, 210, 190]]),
      lanterns: random() < 0.7,
      stack: floor(random(2, 5)),    // how many light boxes stacked up the facade
      stackCols: [random(NEON), random(NEON), random(NEON), random(NEON)],
    });
    if (random() < 0.8) {
      let sgn = random(signTex);
      let sh = 3.2 * sgn.ratio;
      signs.push({ x: -5.6, y: -(10 + sh / 2 + random(0, 10)), z: bz - random(2, d - 2), s: sgn, sh });
    }
    bz -= d + random(0.3, 1.2);
  }

  // Far bank: tall buildings, each with a billboard and neon edges
  let right = [], boards = [];
  bz = 140;
  while (bz > -900) {
    let d = random(14, 26), w = random(18, 34), h = random(40, 110);
    right.push({ x: 42 + w / 2, z: bz - d / 2, w, h, d, tex: floor(random(facades.length)) });
    boards.push({
      z: bz - d / 2, y: -random(14, h * 0.6), w: d * 0.82, h: random(9, 16),
      col: random(NEON), col2: random(NEON), speed: random(0.5, 2), phase: random(TWO_PI),
      edge: random(NEON), top: -h,
    });
    bz -= d + random(0.3, 1.2);
  }

  // People standing on the bridge (just silhouettes)
  let people = [];
  for (let k = 0; k < 14; k++) people.push({ x: random(7, 38), dz: random(-2.5, 2.5), h: random(0.9, 1.1) });

  // Water streaks: short lines of colored light under the signs
  let streaks = [];
  for (let k = 0; k < 120; k++) {
    streaks.push({ x: random(6, 39), z: random(140, -900), w: random(1.5, 5), col: random(NEON), speed: random(0.4, 1.2), phase: random(TWO_PI) });
  }

  return {
    name: 'Osaka', kanji: '大阪',
    sky: { top: [0.16, 0.11, 0.32], hor: [0.98, 0.50, 0.42], sunCol: [1.0, 0.52, 0.30], sunPos: [0.66, 0.52], fog: 0.0014, stars: 0.4 },
    particles: null,

    lights() {
      ambientLight(110, 80, 110);
      directionalLight(255, 150, 110, -0.7, 0.3, -0.5);
      directionalLight(90, 120, 255, 0.6, 0.3, -0.4);
    },

    // Everything on the canal and the far bank. It is drawn twice:
    // once normally and once upside down as the reflection.
    drawMirrored(z, t) {
      for (let b of right) if (b.z < z + 120 && b.z > z - 900) drawTexturedBox(b, facades);
      for (let b of boards) {
        if (b.z > z + 120 || b.z < z - 900) continue;
        drawBillboard(b, t);
      }
      drawOctopus(40.5, -22, -130, t);
      drawOvalWheel(41.2, -52, -380, t);
      drawPufferfish(39.5, -16, -560, t);
      drawArchBridge(-330, t, people);
      drawRiverBoat(23, -470 + t * 9, t);
    },

    draw(z, t) {
      noLights(); // at dusk everything here glows with its own color
      noStroke();
      // Ground on both banks (the canal between them stays open)
      groundPlane(0, -997.5, z - 1200, 2005, 3000, [52, 44, 54]);
      groundPlane(0, 1040, z - 1200, 2000, 3000, [52, 44, 54]);
      groundPlane(-0.05, 0, z - 1200, 8, 3000, [96, 86, 92]); // promenade
      fill(70, 62, 66);
      boxAt(5, 1.25, z - 1200, 0.6, 2.5, 3000);  // canal walls
      boxAt(40, 1.25, z - 1200, 0.6, 2.5, 3000);
      fill(60, 50, 56);
      for (let k = floor((z + 60) / 3); k * 3 > z - 300; k--) boxAt(4.6, -1.2, k * 3, 0.3, 2.4, 0.3); // railing posts
      fill(255, 214, 160);
      boxAt(4.6, -2.4, z - 120, 0.3, 0.3, 360); // glowing handrail

      for (let b of left) if (b.z < z + 120 && b.z > z - 900) drawTexturedBox(b, facades);
      for (let sh of shops) {
        if (sh.z > z + 120 || sh.z < z - 700) continue;
        drawShopFront(sh, t);
      }
      for (let sg of signs) {
        if (sg.z > z + 80 || sg.z < z - 600) continue;
        push();
        translate(sg.x, sg.y, sg.z);
        texture(sg.s.img);
        plane(3.2, sg.sh);
        pop();
      }

      this.drawMirrored(z, t);

      // Reflection: the same things flipped upside down below the water,
      // shifted a tiny bit over time so it shimmers
      push();
      translate(sin(t * 1.7) * 0.25, 2 * WATER_Y, 0);
      scale(1, -1.03, 1);
      this.drawMirrored(z, t);
      pop();

      // Water: a dark, see-through surface over the reflection
      fill(16, 20, 46, 170);
      push();
      translate(22.5, WATER_Y, z - 1200);
      rotateX(HALF_PI);
      plane(35, 3000);
      pop();

      // Colored light streaks drifting and flickering on the water
      for (let st of streaks) {
        if (st.z > z + 60 || st.z < z - 500) continue;
        let a = 50 + 50 * sin(t * 3 * st.speed + st.phase);
        fill(st.col[0], st.col[1], st.col[2], a);
        boxAt(st.x + sin(t * st.speed + st.phase) * 1.5, WATER_Y - 0.05, st.z, st.w, 0.02, 0.25);
      }
    },
  };
}

// Shop on the traveler's side: lit front, noren curtain, a banner,
// red lanterns under the eave and stacked light boxes going up
function drawShopFront(sh, t) {
  let fx = -6.95; // facade plane
  push();
  translate(fx, 0, sh.z);
  rotateY(HALF_PI); // now local x runs along the street, +z points to the promenade

  fill(255, 206, 140);
  push(); translate(0, -3.2, 0.02); plane(sh.d * 0.82, 5.6); pop(); // warm shop window

  fill(...sh.noren); // noren: three panels with gaps
  let nw = sh.d * 0.82 / 3;
  for (let k = -1; k <= 1; k++) {
    push(); translate(k * nw, -5.2, 0.6); plane(nw * 0.92, 1.8); pop();
  }

  fill(30, 26, 30); // eave
  push(); translate(0, -6.8, 0.9); box(sh.d * 0.95, 0.35, 1.8); pop();

  push(); // banner above the eave
  translate(0, -8.4, 0.25);
  texture(sh.banner.img);
  let bw = min(sh.d * 0.7, 9);
  plane(bw, bw * sh.banner.ratio);
  pop();

  if (sh.lanterns) { // red chochin hanging from the eave
    for (let x = -sh.d * 0.4; x <= sh.d * 0.4; x += 2.2) {
      fill(230, 60, 46);
      push(); translate(x, -5.9, 1.6); ellipsoid(0.5, 0.7, 0.5, 8, 6); pop();
      fill(255, 210, 160);
      push(); translate(x, -5.9, 1.6); box(1.06, 0.14, 0.14); pop();
    }
  }

  for (let k = 0; k < sh.stack; k++) { // light boxes stacked up the facade
    let c = sh.stackCols[k];
    let on = 0.8 + 0.2 * sin(t * 2 + k + sh.z); // gentle flicker
    fill(c[0] * on, c[1] * on, c[2] * on);
    push(); translate(sh.d * 0.25, -12 - k * 4, 0.35); box(2.6, 2.6, 0.6); pop();
    fill(255, 250, 240, 220);
    push(); translate(sh.d * 0.25, -12 - k * 4, 0.7); plane(1.8, 0.35); pop();
  }
  pop();
}

// Billboard facing the canal, with moving light bands and a neon frame
function drawBillboard(b, t) {
  let k = 0.75 + 0.25 * sin(t * b.speed * 3 + b.phase); // pulse
  push();
  translate(41.7, b.y, b.z);
  rotateY(-HALF_PI);
  fill(b.col[0] * k, b.col[1] * k, b.col[2] * k);
  plane(b.w, b.h);
  // Bands sliding across the board, like an animated LED screen
  fill(b.col2[0], b.col2[1], b.col2[2], 200);
  for (let i = 0; i < 3; i++) {
    let u = posMod(t * 0.25 * b.speed + i / 3, 1); // 0..1 across the board
    push();
    translate((u - 0.5) * b.w * 0.85, 0, 0.05);
    plane(b.w * 0.08, b.h * 0.8);
    pop();
  }
  fill(255, 255, 255, 170 * k);
  push(); translate(0, b.h * 0.28, 0.08); plane(b.w * 0.6, b.h * 0.1); pop();
  // Neon frame
  fill(...b.edge);
  push(); translate(0, -b.h / 2 - 0.3, 0.1); box(b.w + 0.6, 0.35, 0.2); pop();
  push(); translate(0, b.h / 2 + 0.3, 0.1); box(b.w + 0.6, 0.35, 0.2); pop();
  pop();
  // Vertical neon tube along the building corner, up to the roof
  fill(...b.edge);
  let len = -b.top - 4;
  boxAt(41.5, b.top / 2 - 2, b.z + b.w * 0.6, 0.3, len, 0.3);
}

// Giant octopus sign: a head and 8 waving tentacles
function drawOctopus(x, y, z, t) {
  push();
  translate(x, y, z);
  rotateY(-HALF_PI * 0.65); // face the canal and the camera
  scale(1.7);
  fill(236, 86, 70);
  push(); translate(0, -2, 0); ellipsoid(4.2, 5, 3.8, 14, 10); pop(); // head
  fill(255);
  push(); translate(0, -1.3, 3.6); box(8.6, 1.1, 0.6); pop();         // headband
  for (let s of [-1, 1]) {                                              // eyes
    fill(255);
    push(); translate(s * 1.6, 1.4, 3.3); sphere(1.1, 10, 8); pop();
    fill(20);
    let look = sin(t * 0.8) * 0.3; // the pupils look around
    push(); translate(s * 1.6 + look, 1.5, 4.3); sphere(0.5, 8, 6); pop();
  }
  for (let i = 0; i < 8; i++) {
    let ang = map(i, 0, 7, 0.12, 0.88) * PI; // fan of directions, pointing down
    let px = cos(ang) * 3, py = 2.5 + sin(ang) * 1.5;
    for (let sgm = 0; sgm < 6; sgm++) {
      // each segment turns a little more, so the tentacle curls and waves
      ang += sin(t * 2 + i * 0.9 + sgm * 0.5) * 0.18;
      px += cos(ang) * 1.5;
      py += sin(ang) * 1.5;
      fill(236 - sgm * 6, 86 + sgm * 4, 70);
      push(); translate(px, py, 0.5); sphere(1.15 - sgm * 0.13, 8, 6); pop();
    }
  }
  pop();
}

// Oval ferris wheel on the side of a building, gondolas going around
function drawOvalWheel(x, y, z, t) {
  let rx = 9, ry = 14;
  push();
  translate(x, y, z);
  rotateY(-HALF_PI * 0.75);
  fill(40, 34, 46);
  box(6, ry * 2 + 10, 3); // tower behind it
  let n = 56;
  for (let i = 0; i < n; i++) {
    let a = (i / n) * TWO_PI;
    let lit = (i + floor(t * 12)) % 8 < 5; // lights chasing around the rim
    fill(lit ? color(255, 220, 90) : color(120, 90, 40));
    push(); translate(cos(a) * rx, sin(a) * ry, 2); box(0.9, 0.9, 0.5); pop();
  }
  for (let i = 0; i < 16; i++) {
    let a = (i / 16) * TWO_PI + t * 0.15;
    fill(...NEON[i % NEON.length]);
    push(); translate(cos(a) * rx, sin(a) * ry + 1, 2.8); box(1.4, 1.8, 1.4); pop();
  }
  pop();
}

// Pufferfish lantern: a round body covered in little spikes
function drawPufferfish(x, y, z, t) {
  push();
  translate(x, y + sin(t * 1.3) * 0.4, z);
  rotateY(-HALF_PI + sin(t * 0.7) * 0.25);
  fill(250, 210, 120);
  sphere(3.2, 14, 10);
  fill(220, 150, 70);
  for (let i = 0; i < 26; i++) {
    let a = i * 2.39996;               // golden angle spreads the spikes evenly
    let yy = map(i, 0, 25, -0.9, 0.9);
    let r = sqrt(1 - yy * yy);
    push();
    translate(cos(a) * r * 3.2, yy * 3.2, sin(a) * r * 3.2);
    box(0.4, 0.4, 0.4);
    pop();
  }
  fill(20);
  push(); translate(-1.2, -0.6, 2.9); sphere(0.45, 8, 6); pop();
  push(); translate(1.2, -0.6, 2.9); sphere(0.45, 8, 6); pop();
  fill(240, 120, 90);
  push(); translate(0, 3.3, -1); rotateX(0.5); box(2.4, 0.4, 1.6); pop(); // fin
  pop();
}

// Arched bridge across the canal, with people on it
function drawArchBridge(bzz, t, people) {
  let segs = 16;
  let lift = (u) => -2.5 - sin(u * PI) * 3.5; // height of the deck along the arch
  for (let i = 0; i < segs; i++) {
    let u0 = i / segs, u1 = (i + 1) / segs;
    let x0 = lerp(5, 40, u0), x1 = lerp(5, 40, u1);
    let y = (lift(u0) + lift(u1)) / 2;
    fill(58, 52, 62);
    boxAt((x0 + x1) / 2, y, bzz, x1 - x0 + 0.2, 1.4, 9);
    fill(255, 220, 160); // lights along the railing
    boxAt((x0 + x1) / 2, y - 1.8, bzz + 4.4, 0.5, 0.5, 0.5);
    fill(40, 36, 44);
    boxAt((x0 + x1) / 2, y - 1.1, bzz + 4.4, x1 - x0 + 0.2, 0.25, 0.3);
  }
  for (let p of people) {
    let y = lift((p.x - 5) / 35) - 0.7;
    fill(26, 22, 30);
    boxAt(p.x, y - 2 * p.h, bzz + p.dz, 0.9, 3.4 * p.h, 0.7);
    push(); translate(p.x, y - 4.2 * p.h, bzz + p.dz); sphere(0.55, 8, 6); pop();
  }
}

// River cruise boat drifting toward the camera
function drawRiverBoat(x, z, t) {
  push();
  translate(x, WATER_Y - 0.6 + sin(t * 1.5) * 0.1, z);
  fill(36, 40, 60);
  box(5, 1.6, 16);
  fill(230, 230, 236);
  boxAt(0, -1.4, -1, 4.4, 1.4, 11);
  fill(255, 220, 160); // warm windows on the cabin
  for (let k = -4; k <= 3; k++) boxAt(0, -1.5, k * 1.3 - 0.5, 4.5, 0.6, 0.8);
  fill(36, 40, 60);
  boxAt(0, -2.3, -1, 4.8, 0.3, 11.6);
  for (let k = 0; k < 9; k++) { // string of bulbs from bow to stern
    fill(...NEON[k % NEON.length]);
    boxAt(0, -3.2 - sin((k / 8) * PI) * 0.8, -7 + k * 1.75, 0.35, 0.35, 0.35);
  }
  pop();
}

// Horizontal shop sign
function makeBanner(word, col) {
  let chars = [...word];
  let g = createGraphics(40 * chars.length + 28, 60);
  g.pixelDensity(2);
  g.background(250, 244, 230);
  g.noStroke();
  g.fill(...col);
  g.rect(0, 0, g.width, 7);
  g.rect(0, g.height - 7, g.width, 7);
  g.fill(30, 24, 26);
  g.textFont(JP_SANS);
  g.textStyle(BOLD);
  g.textAlign(CENTER, CENTER);
  g.textSize(34);
  g.text(word, g.width / 2, g.height / 2 + 1);
  let img = g.get();
  let ratio = g.height / g.width;
  g.remove();
  return { img, ratio };
}

// ============================================================
// Shared building blocks
// ============================================================

function boxAt(x, y, z, w, h, d) {
  push();
  translate(x, y, z);
  box(w, h, d);
  pop();
}

// A flat rectangle lying on the ground (y is "down" in p5)
function groundPlane(y, x, z, w, d, col) {
  fill(...col);
  push();
  translate(x, y, z);
  rotateX(HALF_PI);
  plane(w, d);
  pop();
}

// A building: a plain box, with the window texture on the two faces
// we actually see (toward the street and toward the camera)
function drawTexturedBox(b, facades) {
  let f = facades[b.tex];
  let side = b.x > 0 ? -1 : 1; // which way is the street
  push();
  translate(b.x, -b.h / 2, b.z);
  fill(...f.wall);
  box(b.w, b.h, b.d);
  push();
  translate(side * (b.w / 2 + 0.05), 0, 0);
  rotateY(HALF_PI);
  texture(f.img);
  plane(b.d, b.h);
  pop();
  translate(0, 0, b.d / 2 + 0.05);
  texture(f.img);
  plane(b.w, b.h);
  pop();
}

function stoneLantern(x, z) {
  let stone = [150, 146, 136];
  fill(...stone);
  boxAt(x, -0.6, z, 2.2, 1.2, 2.2);
  push(); translate(x, -3.2, z); cylinder(0.45, 4.2, 8, 1); pop();
  boxAt(x, -5.5, z, 2.2, 0.6, 2.2);
  fill(255, 214, 140);
  boxAt(x, -6.6, z, 1.4, 1.6, 1.4); // the light
  fill(...stone);
  push(); translate(x, -7.4, z); hipRoof(3, 3, 1.5); pop();
}

function drawRoundTree(tr) {
  push();
  translate(tr.x, 0, tr.z);
  scale(tr.s);
  fill(70, 48, 38);
  push(); translate(0, -5, 0); cylinder(0.7, 10, 6, 1); pop();
  fill(...tr.cols[0]);
  push(); translate(0, -13, 0); sphere(6, 7, 5); pop();
  fill(...tr.cols[1]);
  push(); translate(3.5, -11, 1.5); sphere(4.2, 6, 4); pop();
  fill(...tr.cols[2]);
  push(); translate(-3.2, -11.5, -1.2); sphere(4.6, 6, 4); pop();
  pop();
}

function drawCedar(tr) {
  let needles = [44, 74, 52]; // not "green": that name belongs to p5
  push();
  translate(tr.x, 0, tr.z);
  scale(tr.s);
  fill(70, 48, 38);
  push(); translate(0, -4, 0); cylinder(0.6, 8, 6, 1); pop();
  push(); translate(0, -5, 0); taper(6, 0, 14, 7, needles); pop();
  push(); translate(0, -11, 0); taper(4.8, 0, 12, 7, needles); pop();
  push(); translate(0, -17, 0); taper(3.4, 0, 10, 7, needles); pop();
  pop();
}

// Japanese hip roof: eaves at y = 0, ridge at y = -h.
// The middle ring sits lower than a straight slope would,
// which gives the curved, sagging profile of temple roofs.
function hipRoof(w, d, h) {
  let rl = max(w / 2 - d * 0.4, 0); // half length of the ridge
  let mx = lerp(w / 2, rl, 0.5), mz = d / 4, my = -h * 0.38;
  let A = [-w / 2, 0, d / 2], B = [w / 2, 0, d / 2], C = [w / 2, 0, -d / 2], D = [-w / 2, 0, -d / 2];
  let MA = [-mx, my, mz], MB = [mx, my, mz], MC = [mx, my, -mz], MD = [-mx, my, -mz];
  let R1 = [-rl, -h, 0], R2 = [rl, -h, 0];
  let ctr = [0, -h * 0.3, 0];

  beginShape(TRIANGLES);
  quadFace(A, B, MB, MA, ctr); quadFace(MA, MB, R2, R1, ctr); // front
  quadFace(C, D, MD, MC, ctr); quadFace(MC, MD, R1, R2, ctr); // back
  quadFace(B, C, MC, MB, ctr); tri(MB, MC, R2, ctr);          // right
  quadFace(D, A, MA, MD, ctr); tri(MD, MA, R1, ctr);          // left
  quadFace(A, D, C, B, [0, -h, 0]);                          // underside
  endShape();
}

// A cone with a flat top (rt = 0 makes a pyramid). Base at y = 0.
// col is used with fake shading, so it also looks 3D without lights.
function taper(rb, rt, h, sides, col) {
  let ctr = [0, -h / 2, 0];
  beginShape(TRIANGLES);
  for (let k = 0; k < sides; k++) {
    let a0 = (k / sides) * TWO_PI + PI / sides;
    let a1 = ((k + 1) / sides) * TWO_PI + PI / sides;
    let shadeK = 0.72 + 0.28 * cos((a0 + a1) / 2 - 0.8); // brighter on one side
    fill(col[0] * shadeK, col[1] * shadeK, col[2] * shadeK);
    let b0 = [cos(a0) * rb, 0, sin(a0) * rb], b1 = [cos(a1) * rb, 0, sin(a1) * rb];
    let t0 = [cos(a0) * rt, -h, sin(a0) * rt], t1 = [cos(a1) * rt, -h, sin(a1) * rt];
    quadFace(b0, b1, t1, t0, ctr);
  }
  endShape();
}

// One triangle with a normal pointing away from ctr (needed for lighting)
function tri(a, b, c, ctr) {
  let ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
  let vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  let mx = (a[0] + b[0] + c[0]) / 3 - ctr[0];
  let my = (a[1] + b[1] + c[1]) / 3 - ctr[1];
  let mz = (a[2] + b[2] + c[2]) / 3 - ctr[2];
  if (nx * mx + ny * my + nz * mz < 0) { nx = -nx; ny = -ny; nz = -nz; }
  let len = Math.hypot(nx, ny, nz) || 1;
  normal(nx / len, ny / len, nz / len);
  vertex(...a);
  vertex(...b);
  vertex(...c);
}

function quadFace(a, b, c, d, ctr) {
  tri(a, b, c, ctr);
  tri(a, c, d, ctr);
}

// Building texture: a wall with a grid of lit and dark windows.
// Drawn once in 2D, then reused as an image on many boxes.
function makeFacade(wall, glow, prob) {
  let g = createGraphics(64, 256);
  g.pixelDensity(1);
  g.background(...wall);
  g.noStroke();
  for (let r = 0; r < 24; r++) {
    for (let c = 0; c < 5; c++) {
      if (random() < prob) g.fill(...random(glow));
      else g.fill(wall[0] * 0.6, wall[1] * 0.6, wall[2] * 0.6);
      g.rect(c * 12.8 + 3, r * 10.67 + 3, 6.8, 5.5);
    }
  }
  let img = g.get();
  g.remove();
  return { img, wall };
}

// Vertical neon sign with one character per cell
function makeSign(word, col) {
  let chars = [...word];
  let cell = 48;
  let g = createGraphics(cell, cell * chars.length + 16);
  g.pixelDensity(2);
  g.background(14, 12, 22);
  g.drawingContext.shadowColor = `rgb(${col[0]}, ${col[1]}, ${col[2]})`;
  g.drawingContext.shadowBlur = 10;
  g.noFill();
  g.stroke(...col);
  g.strokeWeight(3);
  g.rect(4, 4, g.width - 8, g.height - 8, 4);
  g.noStroke();
  g.fill(lerp(col[0], 255, 0.6), lerp(col[1], 255, 0.6), lerp(col[2], 255, 0.6));
  g.textFont(JP_SANS);
  g.textStyle(BOLD);
  g.textAlign(CENTER, CENTER);
  g.textSize(32);
  chars.forEach((c, k) => g.text(c, cell / 2, 8 + cell * k + cell / 2));
  let img = g.get();
  let ratio = g.height / g.width;
  g.remove();
  return { img, ratio };
}

function posMod(a, m) {
  return ((a % m) + m) % m;
}

// ============================================================
// Post-processing shader
// For each city it paints the sky where nothing was drawn,
// fades distant things into the haze (fog from the depth buffer),
// and blends the next city in from far to near during a transition.
// Then it adds contrast, vignette, film grain and letterbox bars.
// ============================================================

const POST_VERT = `
precision highp float;
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vUv;
void main() {
  vUv = aTexCoord;
  gl_Position = vec4(aPosition.xy * 2.0, 0.0, 1.0);
}
`;

const POST_FRAG = `
precision highp float;
varying vec2 vUv;

uniform sampler2D texA;
uniform sampler2D depthA;
uniform sampler2D texB;
uniform sampler2D depthB;
uniform vec3 topA; uniform vec3 horA; uniform vec3 sunColA; uniform vec2 sunPosA;
uniform float fogA; uniform float starsA;
uniform vec3 topB; uniform vec3 horB; uniform vec3 sunColB; uniform vec2 sunPosB;
uniform float fogB; uniform float starsB;
uniform float mixAmt;
uniform float black;
uniform float time;
uniform vec2 res;
uniform float near;
uniform float far;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// Depth buffer values are not linear; this turns them back into distance
float linearDepth(float d) {
  float zn = d * 2.0 - 1.0;
  return 2.0 * near * far / (far + near - zn * (far - near));
}

vec3 shade(sampler2D tex, sampler2D dep, vec3 top, vec3 hor, vec3 sunCol,
           vec2 sunPos, float fog, float stars, out float dist) {
  vec2 tuv = vec2(vUv.x, 1.0 - vUv.y);   // framebuffer images are stored top-down
  vec3 col = texture2D(tex, tuv).rgb;
  float d = texture2D(dep, tuv).r;

  vec2 q = (vUv - sunPos) * vec2(res.x / res.y, 1.0);
  float r = length(q);
  float glow = exp(-r * 5.0) * 0.55 + exp(-r * 22.0) * 0.6;
  float disc = smoothstep(0.042, 0.036, r);

  float h = clamp((vUv.y - 0.5) / 0.5, 0.0, 1.0);
  vec3 sky = mix(hor, top, pow(h, 0.6));

  if (d > 0.99999) {   // nothing drawn here: sky
    dist = far;
    float star = step(0.9975, hash(floor(vUv * res))) * stars * smoothstep(0.1, 0.5, h);
    return sky + sunCol * (glow + disc) + star;
  }
  dist = linearDepth(d);
  float f = 1.0 - exp(-fog * dist);          // more distance, more haze
  vec3 fogCol = hor + sunCol * glow * 0.5;   // haze is brighter near the sun
  return mix(col, fogCol, f);
}

void main() {
  float distA;
  float distB;
  vec3 col = shade(texA, depthA, topA, horA, sunColA, sunPosA, fogA, starsA, distA);

  if (mixAmt > 0.0) {
    vec3 b = shade(texB, depthB, topB, horB, sunColB, sunPosB, fogB, starsB, distB);
    // Far pixels switch first, near ones last: the new city
    // appears on the horizon and comes toward the traveler
    float edge = 1.0 - clamp(distA / 600.0, 0.0, 1.0);
    float w = smoothstep(edge - 0.2, edge + 0.2, mixAmt * 1.4 - 0.2);
    col = mix(col, b, w);
  }

  col = clamp(col, 0.0, 1.0);
  col = mix(col, col * col * (3.0 - 2.0 * col), 0.2);              // gentle contrast
  vec2 c = vUv - 0.5;
  col *= 1.0 - dot(c, c) * 0.9;                                     // vignette
  col += (hash(vUv * res + fract(time) * 97.0) - 0.5) * 0.035;      // film grain
  if (vUv.y < 0.09 || vUv.y > 0.91) col = vec3(0.0);                // letterbox
  col *= 1.0 - black;
  gl_FragColor = vec4(col, 1.0);
}
`;