var clocks = [0,1,2,3,4,5,6,7,8,9];
clocks = clocks.map((x) => x*120);    
colorClock = false;

function setup(){
    createCanvas(windowWidth,windowHeight);
}



function star(x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
        let sx = x + cos(a) * radius2;
        let sy = y + sin(a) * radius2;
        vertex(sx, sy);
        sx = x + cos(a + halfAngle) * radius1;
        sy = y + sin(a + halfAngle) * radius1;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}



function draw(){
    clear();
    translate(width/2, height/2);
    rotate(-HALF_PI);
    

    
    //if  (colorClock) {fill('black')} else {fill('white')};
    star(0,0,clocks[9], clocks[9]*2.5,5);

    //if (!colorClock) {fill('black')} else {fill('white')};
    star(0,0,clocks[8], clocks[8]*2.5,5);

    //if  (colorClock) {fill('black')} else {fill('white')};
    star(0,0,clocks[7], clocks[7]*2.5,5);

    //if (!colorClock) {fill('black')} else {fill('white')};
    star(0,0,clocks[6], clocks[6]*2.5,5);

    //if  (colorClock) {fill('black')} else {fill('white')};
    star(0,0,clocks[5], clocks[5]*2.5,5);

    //if (!colorClock) {fill('black')} else {fill('white')};
    star(0,0,clocks[4], clocks[4]*2.5,5);

    //if  (colorClock) {fill('black')} else {fill('white')};
    star(0,0,clocks[3], clocks[3]*2.5,5);

    //if (!colorClock) {fill('black')} else {fill('white')};
    star(0,0,clocks[2], clocks[2]*2.5,5);

    //if  (colorClock) {fill('black')} else {fill('white')};
    star(0,0,clocks[1], clocks[1]*2.5,5); 

    //if (!colorClock) {fill('black')} else {fill('white')};
    star(0,0,clocks[0], clocks[0]*2.5,5);

    
    clocks = clocks.map((e,i)=>{
        if (e == (i+1)*120) {
            return 120*i;
        }
        return e+1
    });
    if(clocks[0] == 120) colorClock = !colorClock;
}