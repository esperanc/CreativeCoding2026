let base;
let sword; 
let inner;
let outter;
let head;
let resizeFactor;
let neckAxis = 0.5;
let shoulderx = 0.47;
let shouldery = 0.61;
let midscreen = 0.5;
let outterRelength = 45;
let innerPivotX = 403;
let innerPivotY = 505;
let state = 'alive'
let frameCount = 0;
let targetValue = 50;
let slash;
let yay;
let victory;

let audioUnlocked = false;

function mousePressed() {
  if (!audioUnlocked) {
    audioUnlocked = true;

    slash.play();
    slash.pause();
    slash.currentTime = 0;

    yay.play();
    yay.pause();
    yay.currentTime = 0;

    victory.play();
    victory.pause();
    victory.currentTime = 0;
  }
}

function transformBlock(img,tx,ty,sx,sy,rx,nx,ny){
  push();
  translate(tx,ty);
  scale(sx,sy);
  rotate(rx)
  image(img,-nx,-ny);
  pop(); 
}

async function setup() {
  [base,sword,inner,outter,head] = await Promise.all([await 
   loadImage('base.png'),
   loadImage('sword.png'),
   loadImage('innerplussword.png'),
   loadImage('outter.png'),
   loadImage('head.png'),
   ]);
  [slash, yay, victory] =  [
   new Audio('slash.mp3'),
   new Audio('yay.mp3'),
   new Audio('victory.mp3')];
  
  slash.currentTime = 0;
  yay.currentTime = 0;
  victory.currentTime = 0;

  console.log("sword:", sword);
  console.log("sword dimensions:", sword.width, sword.height);
  let height = 841; 
  let width =  960; 
  let defaultHeight = windowHeight; 
  let defaultWidth = windowWidth;
  createCanvas(defaultWidth, defaultHeight);
  let proportion = width/height;
  let defaultProportion = defaultWidth/defaultHeight;
  if(defaultProportion < proportion){
    base.resize(defaultWidth,0);
    resizeFactor = defaultWidth/width;
  }
  else{
    base.resize(0,defaultHeight);
    resizeFactor = defaultHeight/height;
  }
  console.log(`${base.width} x ${base.height}`);
  console.log(`Scale: ${resizeFactor}`);
  
  sword.resize(sword.width*resizeFactor,0);
  inner.resize(inner.width*resizeFactor,0);
  outter.resize(outter.width*resizeFactor,0);
  head.resize(head.width*resizeFactor,0);

  innerPivotX *= resizeFactor;
  innerPivotY *= resizeFactor;
}

function draw() {
  let mx = mouseX;
  let my = mouseY;
  let mr = dist(mx, my, base.width*midscreen, base.height*midscreen)
  let mdx = (mx-base.width*midscreen)/mr;
  let mdy = (my-base.height*midscreen)/mr;
  let elbowx = base.width*shoulderx + mdx*outterRelength*resizeFactor;
  let elbowy = base.height*shouldery + mdy*outterRelength*resizeFactor;
  background(220);
  image(base, 0, 0);
  //image(sword,0,0);
  transformBlock(inner,elbowx,elbowy,1,1,atan2(-mdy, -mdx)*1.3,innerPivotX,innerPivotY);
  //image(inner,0,0);
  transformBlock(outter,base.width*shoulderx,base.height*shouldery,1,1,atan2(-mdy, -mdx),base.width*shoulderx,base.height*shouldery);
  if(mx<base.width*midscreen && state == 'alive'){
    transformBlock(head,base.width,0,-1,1,0,0,0);
  }
  else if(state == 'alive'){
    image(head,0,0);
  }
  if(state == 'dying'){
    transformBlock(head,base.width*0.5,base.height*(0.6+(frameCount*0.3/targetValue)),1,1,frameCount,base.width*0.5,base.height*0.6);
    frameCount ++;
    if(frameCount>targetValue){
      state = 'dead';
      yay.play();
      victory.play()
    }
  }
  if(state == 'dead'){
    transformBlock(head,base.width*0.5,base.height*(0.6+(frameCount*0.3/targetValue)),1,1,frameCount,base.width*0.5,base.height*0.6);
    textFont('UnifrakturCook');
    textSize(floor(height*resizeFactor/3));
    fill(255);
    textAlign(CENTER, CENTER);
    fill(random(255), random(255), random(255));

    text("HAPPY\nSep 11", width / 2, height / 2);
  }

  if(mdx<0.01 && mdx>-0.01 && state == 'alive'){
    state = 'dying';
    slash.play();
  }
  
  //circle(base.width/2,base.height*.6,5);
  //console.log(state)
}

//outter arm axis(0.47,0.605)
//elbow pos(0.42,0.6)
//head axis(0.5,0.6)
//point(0.47,0.605)