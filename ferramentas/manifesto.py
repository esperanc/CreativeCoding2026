# -*- coding: utf-8 -*-
# Para cada imagem de exemplo: dimensões do canvas e o que envolve o
# trecho mostrado no slide. O sketch final = pre + trecho(indentado) + post.
# Assim o código do slide é, literalmente, o miolo do sketch que gera a imagem.

C = lambda w, h: (w, h)

M = {}

def ex(nome, w, h, pre, post="}\n", indent=2, frag=0):
    M[nome] = dict(w=w, h=h, pre=pre, post=post, indent=indent, frag=frag)

CAB = 'function setup() {\n  createCanvas({w}, {h});\n  background(246);\n'

# --- motivação ---
ex("motiv_manual", 420, 150, CAB + '  noStroke();\n  fill("#2b5fd9");\n\n')
ex("motiv_for",    420, 150, CAB + '  noStroke();\n  fill("#2b5fd9");\n\n')
ex("motiv_dez",    420, 150, CAB + '  noStroke();\n  fill("#2b5fd9");\n\n')

# --- proporções ---
ex("lerp_circulos", 420, 300, CAB + '  noStroke();\n  fill("#2b5fd9");\n\n')
ex("map_tamanhos",  420, 260, CAB + '  noStroke();\n  fill("#2b5fd9");\n\n')
ex("map_barras",    420, 300, CAB + '  noStroke();\n  fill("#2b5fd9");\n\n')

# constrain: o trecho fica dentro de um laço que varre valores fora da faixa
ex("constrain_ex", 420, 300,
   CAB +
   '  noStroke();\n'
   '  // a faixa permitida vai de 110 a 310\n'
   '  fill(226);\n'
   '  rect(110, 40, 200, 220);\n\n'
   '  let n = 13;\n'
   '  for (let i = 0; i < n; i++) {\n'
   '    // o valor sai da faixa 0..100\n'
   '    let v = map(i, 0, n - 1, -40, 140);\n\n',
   post='  }\n\n'
        '  fill(90);\n  textAlign(CENTER, CENTER);\n  textSize(15);\n'
        '  text("sem constrain", 210, 62);\n'
        '  text("com constrain", 210, 248);\n}\n',
   indent=4)

# --- coordenadas ---
ex("grafico_funcao", 420, 260,
   CAB +
   '  // o eixo y = 0 do "mundo"\n'
   '  stroke(185);\n  strokeWeight(1.5);\n'
   '  let y0 = map(0, -1.2, 1.2, height - 20, 20);\n'
   '  line(0, y0, width, y0);\n\n'
   '  noFill();\n  stroke("#2b5fd9");\n  strokeWeight(3);\n\n')

# --- polares: o trecho usa o centro do canvas ---
POLAR = CAB + '  let cx = width / 2;\n  let cy = height / 2;\n\n'
ex("polar_pontos",  380, 380, CAB + '  noStroke();\n  fill("#2b5fd9");\n\n')
ex("polar_raios",   380, 380, POLAR + '  stroke("#20242c");\n  let n = 60;\n\n')
ex("polar_espiral", 380, 380, POLAR + '  noStroke();\n  fill("#2b5fd9");\n\n')
ex("polar_rosacea", 380, 380, POLAR + '  noFill();\n  stroke("#2b5fd9");\n  strokeWeight(2.5);\n\n')
ex("polar_inversa", 380, 380,
   POLAR + '  stroke("#2b5fd9");\n  strokeWeight(3);\n\n'
   '  for (let x = 20; x < width; x += 24) {\n'
   '    for (let y = 20; y < height; y += 24) {\n',
   post='    }\n  }\n}\n', indent=6)

# --- vetores ---
ex("vec_particula", 420, 300, CAB + '  noStroke();\n  fill("#2b5fd9");\n\n')

# --- transformações ---
ex("t_translate", 420, 260,
   CAB +
   '  noFill();\n  strokeWeight(3);\n  stroke("#2b5fd9");\n\n', indent=2, frag=0)
ex("t_rotate", 380, 300, CAB + '  noFill();\n  strokeWeight(3);\n  stroke("#2b5fd9");\n\n')
ex("t_scale",  380, 300, CAB + '  noFill();\n  strokeWeight(2);\n  stroke("#2b5fd9");\n\n')
ex("t_shear",  420, 260,
   'function grade() {\n'
   '  for (let i = 0; i <= 4; i++) {\n'
   '    line(i * 30, 0, i * 30, 120);\n'
   '    line(0, i * 30, 120, i * 30);\n'
   '  }\n}\n\n' + CAB + '  strokeWeight(2.5);\n  stroke("#2b5fd9");\n\n',
   post='\n  noStroke();\n  fill(110);\n  textAlign(CENTER, CENTER);\n  textSize(16);\n'
        '  text("original", 100, 225);\n  text("shearX(0.5)", 300, 225);\n}\n')
ex("pushpop_grade", 400, 400,
   CAB + '  noFill();\n  strokeWeight(2.5);\n  stroke("#2b5fd9");\n\n'
   '  let n = 5;\n  let passo = width / n;\n\n'
   '  for (let i = 0; i < n; i++) {\n'
   '    for (let j = 0; j < n; j++) {\n'
   '      let x = (i + 0.5) * passo;\n'
   '      let y = (j + 0.5) * passo;\n'
   '      let ang = map(i + j, 0, 2 * n - 2, 0, HALF_PI);\n\n',
   post='    }\n  }\n}\n', indent=6)
ex("coords_normalizadas", 460, 280,
   CAB + '  strokeWeight(2);\n  stroke("#2b5fd9");\n\n')
