let margin;

function setup() {
    createCanvas(windowWidth, windowHeight);
    noLoop(); // Draw once. Click to regenerate.
}

function draw() {
    background("#EC6723"); // Canvas background completely black
    
    // Proportional margin based on screen size
    margin = min(windowWidth, windowHeight) * 0.05;
    
    let outerX = margin;
    let outerY = margin;
    let outerW = windowWidth - 2 * margin;
    let outerH = windowHeight - 2 * margin;
    
    noFill();
    noStroke();
    rect(outerX, outerY, outerW, outerH);
    
    // Internal squares should have a fine, white outerstroke, with no fill
    stroke("#F29B6F");
    strokeWeight(3);
    noFill();
    
    divideRect(outerX, outerY, outerW, outerH, 0);
}

function divideRect(x, y, w, h, depth) {
    // Cap depth and minimum size to avoid infinite recursion and unrenderable small boxes
    if (depth >= 3 || w < 20 || h < 20) {
        return;
    }
    
    let cols = 1;
    let rows = 1;
    
    if (h > w) {
        cols = 1;
        rows = floor(random(2, 6));
    } else {
        cols = floor(random(2, 4));
        rows = floor(random(1, 4));
    }
    
    let colRatios = [];
    let sumCols = 0;
    for (let i = 0; i < cols; i++) {
        let r = random(0.5, 2.5);
        colRatios.push(r);
        sumCols += r;
    }
    
    let rowRatios = [];
    let sumRows = 0;
    for (let j = 0; j < rows; j++) {
        let r = random(0.5, 2.5);
        rowRatios.push(r);
        sumRows += r;
    }
    
    let gap = (depth === 0) ? min(windowWidth, windowHeight) * 0.015 : min(windowWidth, windowHeight) * 0.005;
    
    let availableW = w - (cols - 1) * gap;
    if (availableW < 0) availableW = 0;
    
    let colXs = [];
    let currentX = x;
    for (let i = 0; i < cols; i++) {
        let innerW = (colRatios[i] / sumCols) * availableW;
        colXs.push({ start: currentX, w: innerW });
        currentX += innerW + gap;
    }
    
    let availableH = h - (rows - 1) * gap;
    if (availableH < 0) availableH = 0;
    
    let rowYs = [];
    let currentY = y;
    for (let j = 0; j < rows; j++) {
        let innerH = (rowRatios[j] / sumRows) * availableH;
        rowYs.push({ start: currentY, h: innerH });
        currentY += innerH + gap;
    }
    
    // Draw continuous grid lines for this level (spans the entire parent bounding box)
    strokeWeight(1.5);
    for (let i = 0; i < cols; i++) {
        let lx = colXs[i].start;
        let rx = colXs[i].start + colXs[i].w;
        line(lx, y, lx, y + h);
        line(rx, y, rx, y + h);
    }
    
    for (let j = 0; j < rows; j++) {
        let ty = rowYs[j].start;
        let by = rowYs[j].start + rowYs[j].h;
        line(x, ty, x + w, ty);
        line(x, by, x + w, by);
    }
    
    // Recursively subdivide cells
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (random() < 0.55) {
                divideRect(colXs[i].start, rowYs[j].start, colXs[i].w, rowYs[j].h, depth + 1);
            }
        }
    }
}
