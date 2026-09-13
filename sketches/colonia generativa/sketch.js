
let seed;
let rooms = [];
let corridors = [];
let machines = [];
let plants = [];
let dupes = [];
let pipes = [];
let particles = [];
let rocks = [];

const W = 1200;
const H = 720;
const TILE = 32;

function setup() {
    createCanvas(W, H);
    pixelDensity(1);

    seed = floor(random(99999999));
    randomSeed(seed);
    noiseSeed(seed);

    generateColony();
}

function draw() {
    background("#101a20");

    drawRockBackground();
    drawCave();
    drawRooms();
    drawCorridors();
    drawPipes();
    drawMachines();
    drawPlants();
    drawDuplicants();
    drawAtmosphere();
    drawHUD();
}

// ============================================================
// GERAÇÃO
// ============================================================

function generateColony() {
    rooms = [];
    corridors = [];
    machines = [];
    plants = [];
    dupes = [];
    pipes = [];
    particles = [];
    rocks = [];

    // Salas principais
    let attempts = 0;

    while (rooms.length < 13 && attempts < 400) {
        attempts++;

        let rw = floor(random(4, 10)) * TILE;
        let rh = floor(random(3, 6)) * TILE;

        let rx = floor(random(1, 34)) * TILE;
        let ry = floor(random(4, 19)) * TILE;

        let candidate = {
            x: rx,
            y: ry,
            w: rw,
            h: rh
        };

        let valid = true;

        for (let r of rooms) {
            if (rectsOverlap(candidate, r, 22)) {
                valid = false;
                break;
            }
        }

        if (valid) {
            rooms.push(candidate);
        }
    }

    // Ordena por posição para facilitar a aparência de colônia construída
    rooms.sort((a, b) => a.x - b.x);

    // Conecta salas
    for (let i = 1; i < rooms.length; i++) {
        let a = rooms[i - 1];
        let b = rooms[i];

        let ax = a.x + a.w / 2;
        let ay = a.y + a.h / 2;
        let bx = b.x + b.w / 2;
        let by = b.y + b.h / 2;

        if (random() < 0.5) {
            corridors.push({
                x1: ax,
                y1: ay,
                x2: bx,
                y2: ay
            });

            corridors.push({
                x1: bx,
                y1: ay,
                x2: bx,
                y2: by
            });
        } else {
            corridors.push({
                x1: ax,
                y1: ay,
                x2: ax,
                y2: by
            });

            corridors.push({
                x1: ax,
                y1: by,
                x2: bx,
                y2: by
            });
        }
    }

    // Algumas conexões extras
    for (let i = 0; i < 4; i++) {
        let a = random(rooms);
        let b = random(rooms);

        corridors.push({
            x1: a.x + a.w / 2,
            y1: a.y + a.h / 2,
            x2: b.x + b.w / 2,
            y2: b.y + b.h / 2
        });
    }

    generateContents();
    generateRocks();
    generateAtmosphereParticles();
}

function generateContents() {
    // Máquinas
    for (let r of rooms) {
        let amount = floor(random(1, 4));

        for (let i = 0; i < amount; i++) {
            let mw = random([45, 55, 65, 75]);
            let mh = random([42, 50, 60]);

            let x = random(r.x + 15, r.x + r.w - mw - 15);
            let y = random(r.y + 15, r.y + r.h - mh - 20);

            machines.push({
                x,
                y,
                w: mw,
                h: mh,
                type: random([
                    "O2",
                    "POWER",
                    "WATER",
                    "BATTERY",
                    "FOOD",
                    "LAB",
                    "FILTER",
                    "GENERATOR"
                ]),
                color: random([
                    "#667a7d",
                    "#566a70",
                    "#718184",
                    "#5d7478"
                ])
            });
        }

        // Plantas
        if (random() < 0.65) {
            let amount = floor(random(1, 4));

            for (let i = 0; i < amount; i++) {
                plants.push({
                    x: random(r.x + 20, r.x + r.w - 20),
                    y: r.y + r.h - 25,
                    type: random(["meal", "reed", "berry", "flower"])
                });
            }
        }

        // Duplicantes
        if (random() < 0.85) {
            dupes.push({
                x: random(r.x + 20, r.x + r.w - 20),
                y: random(r.y + 25, r.y + r.h - 35),
                color: random([
                    "#d56b3c",
                    "#e0b53e",
                    "#62a9c0",
                    "#8b72bc",
                    "#69aa62"
                ]),
                phase: random(TWO_PI)
            });
        }
    }

    // Tubulações
    for (let i = 0; i < rooms.length - 1; i++) {
        let a = rooms[i];
        let b = rooms[i + 1];

        pipes.push({
            x1: a.x + a.w / 2,
            y1: a.y + a.h,
            x2: b.x + b.w / 2,
            y2: b.y + b.h,
            color: random(["#d2ad4c", "#429bc2", "#b3b54b"])
        });
    }
}

function generateRocks() {
    for (let i = 0; i < 250; i++) {
        rocks.push({
            x: random(width),
            y: random(70, height),
            size: random(5, 28),
            tone: random([
                "#24363c",
                "#2b4045",
                "#31494d",
                "#203137",
                "#385055"
            ])
        });
    }
}

function generateAtmosphereParticles() {
    for (let i = 0; i < 90; i++) {
        particles.push({
            x: random(width),
            y: random(80, height - 55),
            size: random(1, 5),
            speed: random(0.1, 0.7),
            alpha: random(40, 130)
        });
    }
}

// ============================================================
// FUNDO ROCHOSO
// ============================================================

function drawRockBackground() {
    noStroke();

    for (let y = 70; y < H; y += 4) {
        let c = lerpColor(
            color("#1a2a31"),
            color("#0b151b"),
            map(y, 70, H, 0, 1)
        );

        fill(c);
        rect(0, y, W, 4);
    }

    // Veios minerais
    for (let i = 0; i < 45; i++) {
        let x = random(W);
        let y = random(100, H - 50);

        stroke(random([
            "#334d51",
            "#40575a",
            "#2d464b"
        ]));
        strokeWeight(random(1, 3));

        line(
            x,
            y,
            x + random(-25, 25),
            y + random(8, 30)
        );
    }

    noStroke();

    for (let r of rocks) {
        fill(r.tone);
        ellipse(r.x, r.y, r.size, r.size * random(0.5, 1));

        fill(255, 255, 255, 8);
        ellipse(
            r.x - r.size * 0.2,
            r.y - r.size * 0.15,
            r.size * 0.25,
            r.size * 0.15
        );
    }
}

// ============================================================
// CAVERNA
// ============================================================

function drawCave() {
    // Bordas superiores e inferiores
    noStroke();

    fill("#25383e");

    beginShape();
    vertex(0, 70);
    vertex(75, 82);
    vertex(135, 68);
    vertex(210, 94);
    vertex(285, 72);
    vertex(365, 91);
    vertex(440, 66);
    vertex(525, 88);
    vertex(610, 69);
    vertex(700, 95);
    vertex(780, 73);
    vertex(870, 90);
    vertex(955, 67);
    vertex(1050, 93);
    vertex(1200, 70);
    vertex(1200, 0);
    vertex(0, 0);
    endShape(CLOSE);

    fill("#1d3036");

    beginShape();
    vertex(0, 645);
    vertex(90, 620);
    vertex(175, 650);
    vertex(260, 615);
    vertex(350, 650);
    vertex(440, 625);
    vertex(530, 650);
    vertex(620, 610);
    vertex(720, 650);
    vertex(815, 620);
    vertex(905, 650);
    vertex(1010, 615);
    vertex(1100, 650);
    vertex(1200, 620);
    vertex(1200, 720);
    vertex(0, 720);
    endShape(CLOSE);
}

// ============================================================
// SALAS
// ============================================================

function drawRooms() {
    for (let r of rooms) {
        // interior
        fill("#14252c");
        stroke("#536a6d");
        strokeWeight(5);

        rect(r.x, r.y, r.w, r.h, 3);

        // iluminação interior
        noStroke();
        fill(100, 170, 165, 8);
        rect(r.x + 5, r.y + 5, r.w - 10, r.h - 10);

        // piso
        stroke("#718182");
        strokeWeight(2);

        line(
            r.x,
            r.y + r.h - 17,
            r.x + r.w,
            r.y + r.h - 17
        );

        for (
            let x = r.x;
            x <= r.x + r.w;
            x += TILE
        ) {
            line(
                x,
                r.y + r.h - 17,
                x,
                r.y + r.h
            );
        }

        // placas das paredes
        noStroke();
        fill("#a6b1a9");

        for (
            let x = r.x + 12;
            x < r.x + r.w;
            x += 38
        ) {
            circle(x, r.y + 2, 3);
            circle(x, r.y + r.h - 2, 3);
        }

        for (
            let y = r.y + 18;
            y < r.y + r.h;
            y += 38
        ) {
            circle(r.x + 2, y, 3);
            circle(r.x + r.w - 2, y, 3);
        }
    }
}

// ============================================================
// CORREDORES
// ============================================================

function drawCorridors() {
    for (let c of corridors) {
        stroke("#637779");
        strokeWeight(25);
        line(c.x1, c.y1, c.x2, c.y2);

        stroke("#17272d");
        strokeWeight(17);
        line(c.x1, c.y1, c.x2, c.y2);

        // iluminação
        stroke(100, 180, 175, 25);
        strokeWeight(3);
        line(c.x1, c.y1, c.x2, c.y2);
    }
}

// ============================================================
// TUBOS
// ============================================================

function drawPipes() {
    for (let p of pipes) {
        noFill();

        stroke("#172025");
        strokeWeight(10);
        line(p.x1, p.y1, p.x2, p.y2);

        stroke(p.color);
        strokeWeight(5);

        // caminho ortogonal
        let midX = (p.x1 + p.x2) / 2;

        beginShape();
        vertex(p.x1, p.y1);
        vertex(midX, p.y1);
        vertex(midX, p.y2);
        vertex(p.x2, p.y2);
        endShape();

        // junções
        noStroke();
        fill(p.color);

        circle(p.x1, p.y1, 11);
        circle(p.x2, p.y2, 11);
    }
}

// ============================================================
// MÁQUINAS
// ============================================================

function drawMachines() {
    for (let m of machines) {
        drawMachine(m);
    }
}

function drawMachine(m) {
    // sombra
    noStroke();
    fill(0, 0, 0, 80);
    rect(m.x + 4, m.y + 5, m.w, m.h, 5);

    // corpo
    fill(m.color);
    stroke("#182428");
    strokeWeight(3);
    rect(m.x, m.y, m.w, m.h, 5);

    // topo
    fill("#26363a");
    rect(m.x + 6, m.y + 6, m.w - 12, 18, 3);

    // texto
    fill("#d0d6cd");
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(8);
    textStyle(BOLD);
    text(machineLabel(m.type), m.x + m.w / 2, m.y + 15);
    textStyle(NORMAL);

    // painel
    fill("#1a282d");
    rect(
        m.x + 9,
        m.y + 30,
        m.w - 18,
        m.h - 38,
        3
    );

    // componentes
    fill("#6cc66b");
    circle(m.x + 17, m.y + m.h - 12, 6);

    fill("#d5aa43");
    circle(m.x + 31, m.y + m.h - 12, 6);

    fill("#4b9fc0");
    circle(m.x + 45, m.y + m.h - 12, 6);

    // visor
    fill(random() > 0.1 ? "#75c879" : "#cf6949");
    rect(
        m.x + m.w - 25,
        m.y + m.h - 18,
        12,
        5,
        2
    );
}

function machineLabel(type) {
    let labels = {
        O2: "OXYGEN",
        POWER: "POWER",
        WATER: "WATER",
        BATTERY: "BATTERY",
        FOOD: "FOOD",
        LAB: "RESEARCH",
        FILTER: "FILTER",
        GENERATOR: "GENERATOR"
    };

    return labels[type];
}

// ============================================================
// PLANTAS
// ============================================================

function drawPlants() {
    for (let p of plants) {
        push();
        translate(p.x, p.y);

        // vaso
        fill("#755a40");
        stroke("#382d26");
        strokeWeight(2);
        rect(-12, 0, 24, 17, 3);

        stroke("#4e9656");
        strokeWeight(4);

        line(0, 0, 0, -25);

        noStroke();

        if (p.type === "flower") {
            fill("#b66ca8");
            circle(-6, -24, 9);
            circle(6, -24, 9);
            fill("#e0c84d");
            circle(0, -24, 6);
        } else {
            fill(random([
                "#54a75d",
                "#6abf61",
                "#438e53"
            ]));

            ellipse(-7, -17, 17, 9);
            ellipse(8, -23, 18, 9);
            ellipse(-5, -29, 14, 8);
        }

        pop();
    }
}

// ============================================================
// DUPLICANTES
// ============================================================

function drawDuplicants() {
    for (let d of dupes) {
        d.x += sin(frameCount * 0.018 + d.phase) * 0.18;

        let bob =
        sin(frameCount * 0.07 + d.phase) * 1.2;

        push();
        translate(d.x, d.y + bob);

        // sombra
        noStroke();
        fill(0, 0, 0, 80);
        ellipse(0, 18, 24, 7);

        // mochila
        fill("#344b50");
        rect(-17, -8, 8, 21, 3);

        // pernas
        stroke("#222b2e");
        strokeWeight(5);
        line(-5, 5, -7, 17);
        line(5, 5, 7, 17);

        // corpo
        noStroke();
        fill(d.color);
        rect(-12, -12, 24, 22, 6);

        // pescoço
        fill("#e3ad78");
        rect(-5, -16, 10, 7, 3);

        // cabeça
        fill("#edbd82");
        ellipse(0, -22, 21, 22);

        // cabelo
        fill("#382b27");
        arc(0, -25, 21, 17, PI, TWO_PI);

        // olhos
        fill("#1e2527");
        ellipse(-4, -22, 2.5, 3);
        ellipse(4, -22, 2.5, 3);

        // sorriso
        noFill();
        stroke("#a75e4b");
        strokeWeight(1);
        arc(0, -18, 6, 4, 0, PI);

        pop();
    }
}

// ============================================================
// ATMOSFERA
// ============================================================

function drawAtmosphere() {
    noStroke();

    for (let p of particles) {
        fill(110, 200, 210, p.alpha);

        circle(
            p.x,
            p.y,
            p.size
        );

        p.y -= p.speed;

        if (p.y < 80) {
            p.y = H - 55;
            p.x = random(W);
        }
    }
}

// ============================================================
// HUD
// ============================================================

function drawHUD() {
    // Barra superior
    noStroke();
    fill("#19272d");
    rect(0, 0, W, 70);

    // separador
    stroke("#52686a");
    strokeWeight(2);
    line(0, 69, W, 69);

    // título
    noStroke();
    fill("#e2c04b");
    textAlign(LEFT, CENTER);
    textStyle(BOLD);
    textSize(22);
    text("COLONY", 20, 24);

    fill("#819393");
    textStyle(NORMAL);
    textSize(10);
    text("SECTOR " + nf(floor(seed % 99), 2), 22, 48);

    // status
    hudBox(170, "OXYGEN", "BREATHABLE", "#67c4c8");
    hudBox(325, "POWER", nf(random(1.1, 3.9), 1, 1) + " kW", "#dfb641");
    hudBox(480, "TEMP", nf(random(18, 28), 1, 1) + " °C", "#df7953");
    hudBox(635, "FOOD", floor(random(1800, 4200)) + " kcal", "#72b85a");
    hudBox(790, "DUPES", dupes.length + " / " + floor(random(7, 11)), "#a77dc2");

    // alerta
    fill("#422d27");
    stroke("#8e5141");
    strokeWeight(1);
    rect(950, 12, 230, 45, 4);

    noStroke();
    fill("#e1815d");
    textSize(10);
    textAlign(LEFT, CENTER);
    text("! SYSTEM STATUS", 965, 24);

    fill("#bdc0aa");
    textSize(9);
    text(random([
        "LOW FOOD RESERVE",
        "OXYGEN FLOW NOMINAL",
        "HIGH CO2 DETECTED",
        "POWER GRID STABLE"
    ]), 965, 42);

    // Barra inferior
    fill("#172329");
    stroke("#53676a");
    strokeWeight(2);
    rect(0, H - 50, W, 50);

    noStroke();
    textAlign(LEFT, CENTER);
    textSize(11);

    let buttons = [
        ["BUILD", 20],
        ["OXYGEN", 100],
        ["POWER", 190],
        ["PLUMBING", 275],
        ["FOOD", 390],
        ["RESEARCH", 465],
        ["DECOR", 580],
        ["STORAGE", 670]
    ];

    for (let b of buttons) {
        fill("#9aaba8");
        text(b[0], b[1], H - 25);
    }

    // ferramenta selecionada
    fill("#d6b84e");
    rect(18, H - 6, 50, 3);

    // ciclo
    textAlign(RIGHT, CENTER);
    fill("#a9b8b4");

    let cycle = floor(seed % 300) + 80;

    text(
        "CYCLE " +
        cycle +
        "   |   " +
        nf(hour(), 2) +
        ":" +
        nf(minute(), 2),
        W - 20,
        H - 25
    );
}

function hudBox(x, title, value, color) {
    fill("#233238");
    stroke("#4c6265");
    strokeWeight(1);
    rect(x, 11, 145, 47, 4);

    noStroke();
    textAlign(LEFT, TOP);

    fill("#879997");
    textSize(8);
    text(title, x + 9, 7 + 11);

    fill(color);
    textSize(12);
    text(value, x + 9, 31);
}

// ============================================================
// UTILITÁRIO
// ============================================================

function rectsOverlap(a, b, padding) {
    return !(
        a.x + a.w + padding < b.x ||
        a.x > b.x + b.w + padding ||
        a.y + a.h + padding < b.y ||
        a.y > b.y + b.h + padding
    );
}

// ============================================================
// INTERAÇÃO
// ============================================================

function mousePressed() {
    // Clique cria pequenas bolhas/partículas
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: mouseX + random(-12, 12),
            y: mouseY + random(-8, 8),
            size: random(2, 6),
            speed: random(0.2, 0.8),
            alpha: random(80, 170)
        });
    }
}

function keyPressed() {
    // R = gera uma colônia completamente nova
    if (key === "r" || key === "R") {
        seed = floor(random(99999999));
        randomSeed(seed);
        noiseSeed(seed);
        generateColony();
    }

    // Espaço = pausa
    if (key === " ") {
        if (isLooping()) noLoop();
        else loop();
    }
}
