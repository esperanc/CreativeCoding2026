function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);

     

/*

    */
}

function draw() {
    background(246);
    orbitControl();
    const scaler = 10;
    noStroke();
    lights();
    for(let i = 0; i<16; i++){
        for(let j = 0; j<16; j++){
            for(let k = 0; k<16; k++){
                push();
                fill(16*i,16*j,16*k);
                translate(scaler*(16*i-128),scaler*(128-j*16),scaler*(-k*16));
                box(32);
                pop();
            }
        }
    }
}
