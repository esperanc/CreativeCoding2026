/**
 * Renders text using Herhey fonts and the p5.brush library
 */

let font;
let tgui,bgui;
let canvas;
let tips;

async function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  
  await loadHershey();
  
  GuiBlock.labelWidth = "6em"
  tgui = new GuiBlock("Text");
  tgui.addSelect("font", Object.keys(hershey), "scriptc")
  tgui.addColor("background", "#f6f1e8")
  tgui.addColor("text_color", "#0000ff")
  tgui.addText("text", "p5Front")
  tgui.addNumber("size", 1,20,5,1)
  tgui.addNumber("char_sep", -5,20,1,1)
  tgui.change(makeFont)
  makeFont()
  
  tips = {
    circle: (_m) => {
        _m.noFill();
        _m.stroke(0,255);
        _m.rotate(45);
        _m.circle(0,0,50);
    },
    rect: (_m) => {
        _m.noFill();
        _m.stroke(0,255);
        _m.rotate(45);
        _m.rect(-25,-25,50);
    },
  }
  
  
  bgui = new GuiBlock("Brush");
  bgui.position (280,10)
  bgui.addSelect("type", ["default", "spray", "marker", "custom"], "default")
  bgui.addSelect("custom_tip", ["circle", "rect"], "circle")
  bgui.addNumber("weight", 1,50,1,1)
  bgui.addNumber("scatter", 0,20,5,0.1)
  bgui.addNumber("sharpness", 0,1,0.5,0.1)
  bgui.addNumber("grain", 0,1,0.5,0.1)
  bgui.addNumber("opacity", 0,255,200,1)
  bgui.addNumber("spacing", 0.2,2,0.5,0.1)
  bgui.addSelect("pressure", ["none","start","middle","end"],"none")
  bgui.change(makeBrush)
  makeBrush()
  
  brush.scaleBrushes(1);
  
}

function makeFont() {
  font = new HersheyFont(tgui.font, tgui.char_sep)
}

function makeBrush() {
  brush.add("myBrush", {
    type:    bgui.type,
    weight:  bgui.weight,
    scatter: bgui.scatter,
    sharpness: bgui.sharpness,
    grain:     bgui.grain,
    opacity: bgui.opacity,
    spacing: bgui.spacing,
    noise:   0.55,
    pressure: ({none:[2,2],
      start: [2,1],
      end: [1,2],
      middle:[1,2,1]
    })[bgui.pressure],
    rotate:  "natural",
    markerTip: bgui.type === "custom",
    tip: tips[bgui.custom_tip]
  });

}

let x0,y0,w,h;

function keyPressed() {
  if (key == "s" || key == "S") {
    let [[xmin,xmax],[ymin,ymax]] = font.textBox(tgui.text);
    const margin = 4 + bgui.weight
    xmin -= margin
    xmax += margin
    ymin -= margin
    ymax += margin
    let f = tgui.size;
    let [w,h] = [(xmax-xmin)*f,(ymax-ymin)*f]
    let [x0,y0] = [-w/2, -h/2];
    if (xmin<0) {
      x0 += xmin*f;
      w += -xmin*f;
    }
    // let dim = [x0,y0,w,h].map(x=>x*tgui.size);
    // dim[0] += width/2;
    // dim[1] += height/2;
    let img = get(x0+width/2,y0+height/2,w,h);
    print ([img.width,img.height]);
    img.save("hershey.png")
  }
}

function draw() {
  canvas.style("background",tgui.background)
  background (tgui.background)
  clear();
  
  brush.set("myBrush", tgui.text_color, 1.);
  
  noFill()
  let txt = tgui.text;
  let bbox = font.textBox(txt);
  let [w,h] = [bbox[0][1]-bbox[0][0],bbox[1][1]-bbox[1][0]];
  let [x0,y0] = [-w/2, -h/2];
  const factor = tgui.size
  for (let s of font.textStrokes(txt,x0,y0)) {
    let news = s.map (([x,y])=>[x*factor,y*factor])
    while (news.length < 3) news.push (news.at(-1))
    brush.spline (news, 0.5)
  }
  
}