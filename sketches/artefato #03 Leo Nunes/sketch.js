let animation = 0
let loopSize = 7
let n = 7
let radius = 25

function setup() {
  createCanvas(windowWidth, windowHeight);
  noCursor()
}

function draw() {
    background(220);
  let twidth = windowWidth
  let theight = windowHeight
  let mx = mouseX
  let my = mouseY
  for (let i=0;i<n;i++){
    let correction = norm(animation%loopSize,0,loopSize)
    let factor = constrain((i-correction)/n,0,1)
    rect(mx*factor,my*factor,twidth*(1-factor),theight*(1-factor),radius*factor)
  }
  line(mx,my,0,0)
  line(mx,my,0,theight)
  line(mx,my,twidth,theight)
  line(mx,my,twidth,0)
  line(mx,my,twidth,theight/2)
  line(mx,my,0,theight/2)
  line(mx,my,twidth/2,theight)
  line(mx,my,twidth/2,0)
  circle(mouseX,mouseY,radius)
  animation++
}