function setup() {
    createCanvas(windowWidth,windowHeight);
    //background(220);
    
}

function keyReleased(){
    fill(random(255),random(255),random(255));
    textSize(random(height));
    text(key, random(-height/4,height), random(-width/4,width));
    }

