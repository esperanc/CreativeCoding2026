function setup() {
  createCanvas(windowWidth, windowHeight);
  let colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];

  let myRand = Math.random();
  let idx = Math.floor(myRand*7);
  let radius = new Array();
  
  for (let i=6; i>-1; i--){
    let newRadius = ((i + Math.random()) * Math.random() * 100);
    radius = radius.concat(newRadius);
  }
  
  radius = radius.sort(function(a, b){return a-b});

  for (let i=6; i>-1; i--){
    fill(colors[(idx + i)%7]);
    let newRand = Math.random();
    circle(myRand * windowWidth,
          myRand* windowHeight,
          radius[i]);
  }
}