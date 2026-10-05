const STEPS = [
  { parts: [{ c: "木", dx: 0, pinyin: "mù", meaning: "tree" }],
    fused: "木", fusedPinyin: "mù", fusedMeaning: "tree" },

  { parts: [{ c: "木", dx: -40, pinyin: "mù", meaning: "tree" },
            { c: "木", dx: 40,  pinyin: "mù", meaning: "tree" }],
    fused: "林", fusedPinyin: "lín", fusedMeaning: "grove — two trees together" },

  { parts: [{ c: "木", dx: -55, pinyin: "mù", meaning: "tree" },
            { c: "木", dx: 0,   pinyin: "mù", meaning: "tree" },
            { c: "木", dx: 55,  pinyin: "mù", meaning: "tree" }],
    fused: "森", fusedPinyin: "sēn", fusedMeaning: "forest — three trees" },

  { parts: [{ c: "日", dx: -45, pinyin: "rì",  meaning: "sun" },
            { c: "月", dx: 45,  pinyin: "yuè", meaning: "moon" }],
    fused: "明", fusedPinyin: "míng", fusedMeaning: "bright — sun and moon together" },

  { parts: [{ c: "人", dx: -45, pinyin: "rén", meaning: "person" },
            { c: "木", dx: 45,  pinyin: "mù",  meaning: "tree" }],
    fused: "休", fusedPinyin: "xiū", fusedMeaning: "rest — a person leaning on a tree" },

  { parts: [{ c: "女", dx: -45, pinyin: "nǚ", meaning: "woman" },
            { c: "子", dx: 45,  pinyin: "zǐ", meaning: "child" }],
    fused: "好", fusedPinyin: "hǎo", fusedMeaning: "good — a woman with a child" },

  { parts: [{ c: "日", dx: -55, pinyin: "rì",  meaning: "sun" },
            { c: "本", dx: 55,  pinyin: "běn", meaning: "origin / root" }],
    fused: null, summaryPinyin: "Rìběn", summaryMeaning: "Japan — \"origin of the sun\"" },

  { parts: [{ c: "中", dx: -55, pinyin: "zhōng", meaning: "middle" },
            { c: "国", dx: 55,  pinyin: "guó",   meaning: "country / kingdom" }],
    fused: null, summaryPinyin: "Zhōngguó", summaryMeaning: "China — \"the middle kingdom\"" }
];

// timing, in frames (60 frames ~ 1 second) 
const FLY_END = 90;          // parts arrive
const HOLD_PARTS_END = 210;  // hold, so each part's own caption can be read
const FUSE_END = 270;        // (fused steps) crossfade to the fused glyph
const SUMMARY_END = 260;     // (word-pair steps) final caption fades in
const STEP_FRAMES = 430;     // total length of one step
const OUT_START = STEP_FRAMES - 50;

let stepIndex = 0;
let stepStart = 0;
let starts = [];
let fontReady = false;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  try {
    await document.fonts.load('700 140px "Noto Serif SC"');
    await document.fonts.load('600 32px "Noto Sans"');
    await document.fonts.ready;
  } catch (e) {
    // if the font API isn't available, we still draw with the fallback font
  }
  fontReady = true;
  newStarts();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  advanceStep();
}

function newStarts() {
  starts = STEPS[stepIndex].parts.map(() => {
    let a = random(TWO_PI);
    let r = max(width, height) * 0.7;
    return { x: cos(a) * r, y: sin(a) * r };
  });
}

function advanceStep() {
  stepIndex = (stepIndex + 1) % STEPS.length;
  stepStart = frameCount;
  newStarts();
}

function easeOutCubic(t) {
  return 1 - pow(1 - t, 3);
}

function draw() {
  background(245, 238, 224);
  if (!fontReady) return;

  let elapsed = frameCount - stepStart;
  if (elapsed >= STEP_FRAMES) {
    advanceStep();
    elapsed = 0;
  }

  let step = STEPS[stepIndex];
  let cx = width / 2, cy = height / 2 - height * 0.05;

  let flyT = constrain(elapsed / FLY_END, 0, 1);
  let fuseT = constrain((elapsed - HOLD_PARTS_END) / (FUSE_END - HOLD_PARTS_END), 0, 1);
  let summaryT = constrain((elapsed - HOLD_PARTS_END) / (SUMMARY_END - HOLD_PARTS_END), 0, 1);
  let outT = constrain((elapsed - OUT_START) / (STEP_FRAMES - OUT_START), 0, 1);
  let globalAlpha = 1 - outT;

  let partSize = min(width, height) * 0.15;
  let fusedSize = min(width, height) * 0.24;
  let partCapSize = min(width, height) * 0.022;
  let mainCapSize = min(width, height) * 0.034;

  // the parts, each carrying its own caption underneath 
  let partsAlpha = step.fused ? (1 - fuseT) : 1;
  if (partsAlpha > 0.01) {
    for (let i = 0; i < step.parts.length; i++) {
      let p = step.parts[i];
      let s = starts[i];
      let ex = easeOutCubic(flyT);
      let x = lerp(cx + s.x, cx + p.dx * (partSize / 90), ex);
      let y = lerp(cy + s.y, cy, ex);

      textFont("Noto Serif SC");
      textSize(partSize);
      fill(70, 55, 45, 255 * partsAlpha * globalAlpha);
      text(p.c, x, y);

      // the caption fades in only once the part is close to arriving, and travels with it
      // captions alternate onto two rows so they never collide, even when their characters sit close together
      let capAlpha = constrain(map(ex, 0.7, 1, 0, 1), 0, 1);
      let row = i % 2;
      textFont("Noto Sans");
      textSize(partCapSize);
      fill(70, 55, 45, 255 * capAlpha * partsAlpha * globalAlpha);
      text(p.pinyin + " — " + p.meaning, x, y + partSize * 0.62 + row * partCapSize * 1.6);
    }
  }

  // the fused character, crossfading in once the parts have arrived
  if (step.fused) {
    let a = fuseT;
    if (a > 0.01) {
      textFont("Noto Serif SC");
      textSize(fusedSize);
      fill(120, 25, 25, 255 * a * globalAlpha);
      text(step.fused, cx, cy);

      textFont("Noto Sans");
      textSize(mainCapSize);
      fill(70, 55, 45, 255 * a * globalAlpha);
      text(step.fusedPinyin + "  —  " + step.fusedMeaning, cx, cy + fusedSize * 0.62);
    }
  } else if (summaryT > 0.01) {
    // two-character words : a final combined caption, below everything
    let capY = cy + partSize * 0.62 + partCapSize * 4.2;
    textFont("Noto Sans");
    textSize(mainCapSize);
    fill(120, 25, 25, 255 * summaryT * globalAlpha);
    text(step.summaryPinyin + "  —  " + step.summaryMeaning, cx, capY);
  }
}
