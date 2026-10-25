::: center
# Programação criativa
## Aula 9 - Modelagem 3D
:::
---
# Modelagem 3D

Na aula passada a malha já vinha pronta: `box()`, `sphere()`, `torus()`. Aqui a **malha é o assunto**.

- Toda forma 3D no p5 é um `p5.Geometry`: uma lista de pontos, uma lista de triângulos que os costura, e informação extra sobre luz e textura.
- Há três maneiras de obter uma: **construir com código**, **descrever ponto a ponto** ou **importar** de um arquivo feito em outro programa.

Referência: o tutorial **Custom Geometry** do p5.js e as páginas de `buildGeometry`, `p5.Geometry`, `loadModel` e `model` na referência oficial.
---
# Roteiro
:::col
- **Vértices, faces e normais** - a anatomia de uma malha
- **Construir com código** - `buildGeometry()` e por que ela existe
:::
:::col
- **A malha na mão** - `p5.Geometry`, normais, coordenadas de textura
- **Importar e exportar** - OBJ e STL, de ida e de volta
:::
---
:::center
# Vértices, faces e normais
:::
---
# A anatomia de uma malha
:::col ratio=42%
Um `p5.Geometry` guarda quatro listas paralelas:

- **`vertices`** - os pontos, como `p5.Vector`.
- **`faces`** - triângulos, cada um como três **índices** da lista de vértices.
- **`vertexNormals`** - para cada vértice, a direção "para fora". É o que a luz usa.
- **`uvs`** - para cada vértice, dois números de 0 a 1: que ponto da textura fica preso ali.

Guardar faces como índices, e não como coordenadas repetidas, é o que permite a um vértice pertencer a vários triângulos ao mesmo tempo - e é por isso que a iluminação consegue ser contínua através das emendas.
:::
:::col ratio=58%
::img src="anatomia.png" width=100%
:::
---
:::center
# Construir com código
:::
---
# `buildGeometry()`
:::col ratio=65%
Recebe uma função que desenha, e devolve tudo o que foi desenhado ali dentro empacotado num único `p5.Geometry`.
```js
let peca;

function setup() {
  createCanvas(360, 300, WEBGL);
  peca = buildGeometry(() => {
    box(70);
    push();
    translate(0, -60, 0);
    sphere(34);
    pop();
    push();
    translate(0, 58, 0);
    rotateZ(HALF_PI);
    cylinder(16, 70);
    pop();
  });
  peca.computeNormals();
}

function draw() {
  background(246);
  orbitControl();
  noStroke();
  ambientLight(80);
  directionalLight(255, 246, 232,
                   -0.4, 0.5, -1);
  rotateX(-0.45);
  rotateY(0.6);
  fill("#2b5fd9");
  model(peca);
}
```
:::
:::col ratio=35%
::img src="construir.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDjXzzbR8ADcHA4ljMEG0KDA1xkxhQZi8AAoAJQMYCfDwKJZkATJPiGBnlABsAAYkQxysLRQwAOp0ABCAHEADJMokyBh4rTCBjVMxgDBQBUwa7qFD6EYM5kMYQsVmfWQ3OAMgDswtV9o1ZkmzLVKgYZoEhn4SwZUusIrFbt9KkMXim-QFABZ3erZF5royU36vF6kD6PQGIEG+CGpflbJGsyp9NdNEsAFoMgASAEElQAxAD6NAAklXZNoxpBYPoGQBGQVi139jUZ-PqgC+Vc1+xNOaWADlrvonhh+SmF8SIKTyZTqQwoPo+AB3K1s9XVPjabqCGtkqAM4qJwVV7fVMAoGQ1JmtcGDzrIEDXAAyiBQLgQwfBoP+EgoEqYCCKgDK2FGnxQGA-QUlSEB8BgaEYSgn75PkYpfpODDFOUxRIh6fqsWx1jCggiaRgg1EMNYY5VjWdYwAAGgyHFcfkQm1iWMBUKGCA-tGlj6mBYgAMTFNU+SWFAACcYhVmgtwDAymoHhwyKorsMD7GsWLcGKMIjKyDBPPogiQNgDDCgSGqKHhQg+X5DCHuSPJ8m5eGxvwIw+dUGDXM+-nhSAC5AA&name=construir)

Três primitivas e duas transformações viram **uma** malha. Depois disso elas não existem mais em separado: há um objeto só, com uma lista de vértices.
:::
---
# Por que isso existe
:::col ratio=65%
Porque construir é caro e desenhar é barato. Dentro do `draw()`, cada `box()` refaz a malha do zero, 60 vezes por segundo. Com `buildGeometry()` a conta é feita **uma vez**, no `setup()`.
```js
let arvore;

function setup() {
  createCanvas(420, 320, WEBGL);
  randomSeed(9);
  arvore = buildGeometry(() => {
    for (let i = 0; i < 160; i++) {
      push();
      translate(random(-90, 90),
                random(-90, 90),
                random(-90, 90));
      rotateY(random(TWO_PI));
      box(random(5, 16));
      pop();
    }
  });
  arvore.computeNormals();
}

function draw() {
  background(246);
  orbitControl();
  noStroke();
  ambientLight(90);
  directionalLight(255, 246, 232,
                   -0.4, 0.5, -1);
  fill("#e2632a");
  model(arvore);
}
```
:::
:::col ratio=35%
::img src="muitas_caixas.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDjXwGZLXfoAbg4HEsZgg2hQYGuMmMKDMXgAFABKBjAT4eBRLMgCZJ8QyMgAsxQADEiGOVReKAOp0ABCAHEADLM4kyPoCKDXNAAZWmUEZAE5VZ88QSYAxhAxqmYwBgoAqYNqNPoRoyWZaWGzPrJLASGIycQwwJaGCLCcG5AwAIwANnDwYA1InWez1SoGF4zJMWWqM7IUPoBIZ+EtGUXoNrGdZDWKGLXmUiffmW7IK1q0NXa+KG03062W+2qzW6w2Tf229dNEsqOXNVWKNKSAB9GgASWZ45bNzgc8rnfy4rjm7z+a81yZW5UAF9Pter2b+vttVmlgA5AlPDAC8e3yQQMkKSpGkGCgIsAHcPTTWRqj4bRukEfRrnJA1ikFWMrwJaowBQMgaULa4MFzT4IGuHUCKBYj1T4NBsIkFAlTAQRUCNEUrygMB+kpakID4DBGOYlBGWKfJDwYNDY3FYpJT7Ac5NkawRQQQVxSUsTrGjK9LDtIixAAYhgYpY0lPgxCvNBbgGRlHxgX8OGRVFdhgfY1ixbhxRhEY2QYJ59EESBsDDCMvEUDihEChM-20Xl+W8jjDC8fgRkC6oMGueCIz-EBryAA&name=muitas%20caixas)

160 caixas desenhadas como **um** objeto. A diferença não aparece numa imagem parada, mas aparece no número de quadros por segundo assim que a cena cresce.
:::
---
# Duas notas de versão
:::col
No p5.js 1 havia um par `beginGeometry()` / `endGeometry()`, que gravava tudo desenhado entre as duas chamadas. **No p5.js 2 esse par não existe mais**: ficou só `buildGeometry()`, que recebe a função.

Se você encontrar código antigo assim:
```js
// p5.js 1, não existe mais
beginGeometry();
box(50);
const g = endGeometry();
```
a tradução é direta:
```js
// p5.js 2
const g = buildGeometry(
  () => box(50));
```
:::
:::col
O tutorial oficial, em alguns pontos, chama o cálculo de normais de `calculateNormals()`. No p5.js 2 o nome é **`computeNormals()`**; `calculateNormals` não existe.

E uma regra que vale para tudo nesta aula: **`buildGeometry()` só funciona dentro de um sketch `WEBGL`**, porque é o renderizador 3D que sabe gravar vértices.

Quando uma malha deixa de ser usada - porque foi reconstruída, por exemplo - vale liberar a memória de vídeo dela:
```js
freeGeometry(antiga);
```
Sem isso, uma malha reconstruída a cada quadro vaza memória da GPU.
:::
---
:::center
::img src="showcase_1.png" height=80%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBjVMxgDBQADiMGu6hQ+hG2AYZieOjAUEUMAYkCWYH0WhgaAYAEczHwKdcGE8MHpDAgONprhBhgwaABBAAydAo8oYwgYAG0xABiYoABmKABZitoxEiGLritV8pYoABOc2WkA6mDFABs5WKfCduu09u0UWKYgAugBuDjjXwoa76fqGdVa8McDiWMwQbQoMDSvwaMxeAAUAEoGMBPh4FEsyAJknxDAX7fr9Rb8k2LQB1OgAISJiqLEZkfQEUDJAGVplACwBGADs-c+EGuYGM45gk-K88HlljDALUYYvQ1+rDB7kDCNJ+6AGoryWy4PZDG4xMEF4zJMC3iCcTSeTKQXi3VFhS0+FQGG3fRd33MBE2PFkz1sOCwBvO9QLAnRpVlOBEw5aAyQLawvWbBgiM3dCVClGVfAALxw4d8OsYoDQtJj9TI8iMKohgZA1RdlxgAtsIAKgYfUECbI0GCvA8LVokSxIk9jyMo2UkETA0pIYLxrgAdwLCAWLKEsRPKJsBw4rT3yQYtzI4ikBEMfglkEi0p1MhhrCYJwGGKWSlPQm44ALXCRzQadfJItiLSQC0QvwqcItMot-LA7TCxShgAF80My5LbMfWN401boQ32Mk3yWAA5WMRXrdjsogBrU3TTNsxkKAOT01DB2qPhtG6QR9GudNJ2Nd12NjaowBQMhpUFDAbIXa5R0FIFFsHPg0CmiQUEVMBBFQBt8nYqB2RgVrpT4DA9oOlAC2KfJ8hYo13RYr0LWsMSntEhAZw+sTxtsobNCWAANAixJNdjgYFGAqALL7jtsp94wQCC6D66yCxQC1uhLYRgOAcCCQWhVlVVYqQ37YVbgGbHqdygcGuRVFdhgfY1ixbgLRhEZS2FAxBEgak4K8RRTqEEWTwa7QazrfnTsMLx+CpXEMGufrpY4EBMqAA&name=showcase%201)
:::
---
:::center
# A malha na mão
:::
---
# `p5.Geometry`: pontos e triângulos
:::col ratio=65%
No nível mais baixo, uma malha são duas listas. Esta descreve um tetraedro: quatro pontos e quatro triângulos.
```js
let tetra;

function setup() {
  createCanvas(340, 300, WEBGL);
  tetra = new p5.Geometry();
  const s = 85;
  tetra.vertices.push(
    createVector(0, -s, 0),
    createVector(s, s * 0.6, s),
    createVector(-s, s * 0.6, s),
    createVector(0, s * 0.6, -s));
  tetra.faces.push(
    [0, 1, 2], [0, 2, 3],
    [0, 3, 1], [1, 3, 2]);
  tetra.computeNormals();
}

function draw() {
  background(246);
  orbitControl();
  noStroke();
  ambientLight(80);
  directionalLight(255, 246, 232,
                   -0.4, 0.5, -1);
  fill("#1f7a63");
  model(tetra);
}
```
:::
:::col ratio=35%
::img src="tetraedro.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDjXxLFD6PgAbg4HEsZgg2hQYGuMmMKDMXgAFABKBjAT4eBRLMgCZJ8QyM8oAFgADEiGOURWKGAB1OgAIQA4gAZZnEmQMPEEhjCBgZADuDAKCEVMGu6nxIxZ6tk2hpwz8OoYtnyNs1GgJCGSMH0VO0EwQXjMk0Zn1t-T4SwAajBKdd9IzpdZDOKRcykWGdBHo7GUPHGSnHQAqBgihAANnFhnTmc5kZgMbjCeTVYYJbLlb8NY14a5Ddz+elhjbpYr4uTzLVny1fAQlj4-sMgeDSFDPYYAG1pQBGcXFAC64q3e-F5UPmePEvF28Pm93V4YB6nGpn+3NQaWADl408MALnwAviSEBkhSVI0gwUAEvqLJsp81QLt0gj6Nc5JQIyxRCuWz6yPG1RgCgZA0vi1wYNanwQNcADKJFAuRGp8Gg+ESCgypgIIqCMrYaZulAYD9JS1IQHwGBsRxKAYfk+R7lhe7lMUGbrioykqSo1hlkKqYINJDDWNuOEMJYYAYGRYgAMTbpYADsfDluUYgGWgtwDIyM6ARwyKorsMD7GsWLcOKMIjGyDBPPogiQNgpaEkaih8UIUUijFQEUry-IhXxhhePwIxRdUGDXNo3TJR5AFAA&name=tetraedro)

Cada face é um trio de **índices**, não de coordenadas. O vértice 0 - a ponta de cima - aparece em três faces, mas está guardado uma vez só.
:::
---
# A ordem dos índices
:::col ratio=45%
`[0, 1, 2]` e `[0, 2, 1]` descrevem o mesmo triângulo no espaço, mas **não** a mesma face.

A ordem define o sentido de giro visto de fora, e é dela que sai a direção da normal - ou seja, para que lado a face encara a luz.

A convenção do p5 é a mesma do OpenGL: vértices em sentido **anti-horário** quando vistos de fora.

Com a ordem trocada, a face vira do avesso: ela some quando vista de fora, e a iluminação acende pelo lado errado.
:::
:::col ratio=55%
::img src="orientacao.png" width=100%
:::
---
# Normais: `computeNormals()`
:::col ratio=65%
A normal é a direção perpendicular à superfície num ponto. Sem ela a luz não tem como decidir o brilho.
```js
// facetado: uma direção por face
malha.computeNormals();
malha.computeNormals(FLAT);

// suave: a média das faces vizinhas
malha.computeNormals(SMOOTH);
```
`FLAT` é o padrão. A diferença só aparece onde um vértice é compartilhado por faces de inclinações diferentes.
:::
:::col ratio=35%
::img src="normais.png" width=100%

À esquerda `FLAT`, à direita `SMOOTH`. A malha é exatamente a mesma: muda só o que foi guardado em `vertexNormals`.
:::
---
# O detalhe que explica os dois
:::col
`SMOOTH` precisa que vértices na mesma posição sejam **o mesmo vértice**, para poder somar as faces que chegam nele. Por isso ele começa **fundindo** os vértices repetidos.

Dá para ver na contagem: a faixa do cilindro ao lado nasce com 38 vértices, porque o primeiro e o último se repetem para fechar a volta.

- `computeNormals(FLAT)` deixa 38.
- `computeNormals(SMOOTH)` deixa 36, costurando a emenda.
:::
:::col
É isso que faz a emenda desaparecer no cilindro suave: ela deixou de existir.

A escolha não é de gosto, é de **intenção**:

- um objeto facetado - um cristal, um origami, um dado - pede `FLAT`;
- uma superfície curva aproximada por triângulos - um terreno, uma esfera, um tecido - pede `SMOOTH`, senão cada triângulo aparece.

E há o caso misto, um cilindro com tampas: ali você quer a lateral suave e as bordas vivas. Esse é o limite do que as duas funções resolvem sozinhas.
:::
---
# Normais na mão: `normal()`
:::col ratio=65%
Dentro de um `beginShape()`, `normal()` fixa a direção do **próximo** vértice - do mesmo jeito que `fill()` fixa a cor.
```js
let cone;

function setup() {
  createCanvas(340, 300, WEBGL);
  cone = buildGeometry(() => {
    beginShape(TRIANGLE_FAN);
    normal(0, -1, 0);
    vertex(0, -90, 0);
    for (let i = 0; i <= 24; i++) {
      const a = i * TWO_PI / 24;
      const x = cos(a), z = sin(a);
      normal(x, 0.4, z);
      vertex(x * 80, 70, z * 80);
    }
    endShape();
  });
}

function draw() {
  background(246);
  orbitControl();
  noStroke();
  ambientLight(80);
  directionalLight(255, 246, 232,
                   -0.4, 0.5, -1);
  fill("#8b3a62");
  model(cone);
}
```
:::
:::col ratio=35%
::img src="normal_mao.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDjXzaa4ZADcHA4ljMEG0KDA+L8GjMXgAFABKBjAT4eBRLMgCZJ8Qz08oAFgADEiGOUhSKGAB1OgAIQA4gAZRlEmQ6fEwBjCBjVMxgDBQeUwa7qFD6Eb0plalgsz6yaowQSQADKenm9IoACUAJIAQQAckq6AB9ABiAZVdoYEGu+ieGHpkusAEZRULI2rZMkYPolnBE6LrABOSXp1UqBiWWMMek4hhgLUMIUE+tybXFAUtsAAam7zNZmZUeIgwwYWm1DYAVAwKFKSMGaN6nAwO+WK+qR744I28Xy+IzRQAvRuGSD0-drisxuN8BNwNMIAVHjPrhjZ3Pwenb6e2SUAdklY8fzLKMAF8owkKBXT4d0XwYUCM3AyQIFJclKWpKB9D4AB3K0B3tPhtG6QR9GuMkoHpDsADY4NjaowBQMh8TNa4EzgmNnRYoEmTXPg0HoiQUEVMBBFQelfzgqAwH6CkqQgW9hNElBKPyfJRWo9TymKJEo1fPTZGsIVHwfNSGBTODLH1BMxAAYlsapyj4KjijEOC0FuAZ6WHGBEI4ZFUV2GB9jWLFuFFGERhZBgnn0J0IGwJsWy8RQpKEBLm3gjhtG5XkoqkwwvH4EYEuqDBriIlskJAUCgA&name=normal%20mao)

Aqui as normais apontam para fora do eixo, e não para fora da face: o cone fica liso de lado, sem precisar de `SMOOTH`.
:::
---
# Coordenadas de textura
:::col ratio=65%
`uvs` é uma lista **plana** de números: dois por vértice, de 0 a 1. É o endereço, na imagem, do ponto que fica preso àquele vértice.
```js
const n = 16;
sup = new p5.Geometry();

for (let j = 0; j <= n; j++) {
  for (let i = 0; i <= n; i++) {
    const u = i / n, v = j / n;
    const z = 40 * sin(u * 6)
                 * cos(v * 5);
    sup.vertices.push(createVector(
      (u - 0.5) * 230,
      (v - 0.5) * 230, z));
    sup.uvs.push(u, v);
  }
}
for (let j = 0; j < n; j++) {
  for (let i = 0; i < n; i++) {
    const k = j * (n + 1) + i;
    const d = k + n + 1;
    sup.faces.push(
      [k, k + 1, d],
      [k + 1, d + 1, d]);
  }
}
sup.computeNormals(SMOOTH);
```
:::
:::col ratio=35%
::img src="superficie_uv.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDjX5mLxIhhLOAAbg4HEsZgg2hQYGuMmMKDxAAoAJQMYCfDwKJZkATJPiGJnlABsAAYCeViuKGAB1OgAIQA4gAZFmkmSE+AMYQ6fp8JaK-R8LxIMAHJlS6WWtWfIkIap8bTdQT6a6UqBMsQAYksooUUGFYhtGrtEGuAGUUK6gaz1bI7ZYwBgMJ6QF7itV8pYoABOINxhiWa76BhMnEMEbahii4kVuQMS21ysAah1xXybI5GtkRZLZY0DDgVZrg-rjdHrYbHfZnxUDDAllLTKZQ+bFbZjinbIApA3tcIdaK2Xb+tSVwSRgT21eOwXZABfT6PjXaOnDBgyHUARmFBcMeKrDIAHcGAKBBFRga51CjEZYzJDVe1LctYmHWsULwHUIDQ5tm07WdC2LJCBzAVD5zkTDazAHC8O7FRXwgd8zCrEjNwgAlkirFDWLvOi318AAvKsABZRQYAAqPxICZJiJOFFl8LnRSlIk19BQ4iTbwUvw8QQZIYH0GltAmBAvDMSYmS5fUYAANRgali09Wi52khhrGrBBpwk4pynFLTZCZDi3NFDy2S8nyCX4llgyU-8vAQMxkkMEyzKQaT2OilRnwfT5EP7XwUMPND6ywhhYmomdaNy8sSMKsi8A-Sjyq7JT6PfXodRQiSmRkNcvzZNcwB42RWt8KAq16NceoYL8hu0uLLEdYzTPMvyGAAbW6AkJumgkoAAXSRVaNoYXrdpOnaGH2jLso1LK5v2KDTKWAA5YsngwQVwwAWRIEgKAACWDZ9yUpalaRkKAjSA1kKtkB0nRdN1oAtIS5ILYtqjAFAyDpKNrhTDKw0jaMYDgjU+DQTGJBQZUwEEVAmS-HyMqgMBTxpOk+AwWn6ZQC18nyK9UavSUCWsYKhIJYLBdcvqC1dTQlgADSZcWEDR21ljMfomSJDKiUZfovtuUnnpIAAlL6AEFVQLNATZTWKgY4ZFUV2GB9jWLFuAJGFK2ABgnn0QRIGwatay8RRWaEMOR2fbQ+QFdlLrAQwvH4EYw+qDBridWtnxAe8gA&name=superficie%20uv)

A conta `j * (n + 1) + i` é a mesma da aula 7: uma grade bidimensional guardada numa lista.

Cada célula vira **dois** triângulos.
:::
---
# Sólido de revolução
:::col ratio=65%
A mesma grade, enrolada: um perfil desenhado em duas dimensões, girado em torno do eixo `y`. É a receita de todo vaso, copo e garrafa.
```js
vaso = new p5.Geometry();
const nu = 36, nv = 22;

for (let j = 0; j <= nv; j++) {
  const t = j / nv;
  const r = 34
          + 30 * sin(t * PI * 2.2);
  const y = (t - 0.5) * 185;
  for (let i = 0; i <= nu; i++) {
    const a = i * TWO_PI / nu;
    const p = createVector(
      r * cos(a), y, r * sin(a));
    vaso.vertices.push(p);
    vaso.uvs.push(i / nu, t);
  }
}
for (let j = 0; j < nv; j++) {
  for (let i = 0; i < nu; i++) {
    const k = j * (nu + 1) + i;
    const d = k + nu + 1;
    vaso.faces.push(
      [k, d, k + 1],
      [k + 1, d, d + 1]);
  }
}
vaso.computeNormals(SMOOTH);
```
:::
:::col ratio=35%
::img src="revolucao.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDjXzJPiGa4Abg4HEsZgg2hQYGuMmMKDMXgAFABKBjAT4eBRLMgCPGGRnlAAsAAYkQxysVRQwAOp0ABCAHEADLM4kyBh864MYQMDIAdwYBQQCpg13UKH0IxZatk2hpw11Zm14oAbGKIMlncVimrPpZrvoGIycQxYs7hYTQ3IdR7I7EANTx1ns9W2+2+Xw6sOOXXJG0qO0QB2BnVCz4qCsqePi4UMABUfkgjN8DZoAEl6wxSsVVeWdOmGCNnc2GNYGMKEPlWQ2AIy2fL52T+wPBjQMMDhyMbvAxsxbxPJvtpou+LQ6jcNijSkgAfXbTkdi4LA68zs5fCWADUYJSA4yjyogYNna-J8MyYojGKQGNhAjJgb2qYqJqCDJDA+hUtoEwIF4ZiTIyXgIZWGr4tcCBmMkhjYbhSCMhuOYQGYYooIRKgAL6fOx6rLkGIZhjqEZRnguZxgebJ9txq6+Bu-FbnIj7rqJKZEYWDq9FmnaMgxDDVjOrLVmAT7Hg6UDOr01ZaTphnEQSCCWHwmGUTheEAbIADa3RilAYpmQwM4ALpIi5DDudpvmeZ5oX+SxsicTFnzIXaaA4UsAByAZPBg-IAMoALIkCQFAABIIZxpLkpS1IyFA+h8HqLJieq1T2d0gj6Nc5JQIyxSCi6LEBtUYAoGQNIWtcGDWp8EDXFlo1AhN6p8GgA0SCgSpgIIqCMvOLFQGA-QVTSfAYGtG0oF1+T5GK3Vul2EpitYE6CmKE6XaOun5m1mhLAAGoyD0IOUU75pYYAYONYgAMTFNU+SWFAACcYgsWgtwDIymolRwyKorsMD7GsWLcGKMJDsADBPPogiQNg46Rl4ii7UINMCZx2i8vibIMLthhePwIw09UGDXNo3SRpxICsUAA&name=revolucao)

`r` é o perfil: troque a fórmula e o vaso muda de silhueta. `nu` controla quantas fatias tem a volta, `nv` quantos anéis tem a altura.
:::
---
:::center
::img src="showcase_2.png" height=80%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgFBAAcRg13UKH0I2wDDMTwYlj4aDASS0sD8Znm+ksYG0YAmSMpaFxBjpGn01wYzKgYEsMH6EG0fAQHHGvieGD0hgYwgYAG0ALoAbg4HEsZllKDA1xkhlZ0o5XJgAApugBKBjAT7aC3DBiCDUMDIAd1x9UJxOFI3tToNMh0nt8Mk15QALFHZJZrvoGPalQxYr6AAx6nNyTUQQuxADU5ZdbujqfTmezYHzhabeBLLcr1c+KhjEC9Zl9TccfoYACoGBQAOokAD6NAAkime72vclfbnhzJx1PZwulz2PX3fBnNYnigxywwAIwANjHMcMjvvyUj3ZUggQyWlZu0EwQXjMSZ7Q8BQlgANRgbQUHTe03x7e0M0vK9bHvD1HzMJ0XXHND7RfJE4JUZD70MSB7Qwi9rzzYjSN6cc8II2QEIoojsOudDMOoiBcMw19a3fBAzGSQx-0ApB7SHP1eQ3P1eJ7ABfT4FOjNMMyzDQi01AsizwP0y07V03xUht1KbTSWzkXSGDAfSa2XFdfC0TVc3He0ZCQl1LzAfcVEPL0oF9LRLzc69vNkD9aV-YSAKArU+F5KBeUC68dV5WLmPi+LmJ1WSVCU2Q8u9fZiQApYADl0xVR8AGUAFkSBICgAAkcv6FAzH0GRBCjJSjRNKDzUtDRWQjAzoxAvgljIARkj4R8AE48zzXl8kW3lJzoAAhfEABkcqMtTfF6TVikLXo2wYG9Tv0lU1REoCrTZW1uUdTDusNCBjVNAaxX0Ph-RG2yGGqPhtG6QQRRNKB7WKRMbxy9NqjAFAyAtUlrgwCMlwga4qrRoFMc+OlEYkFBtrAQRUHtWw8xyiV+n6i0+AwMmKZQaH8nyXkYZvLnymKXlrDzBBE15IWeYYawrxyrxrkgUnycpq9iiW68AHYVeKDnRYF4obxVvmaaXEVNCWAANe1BYQWxihy9wmYdK8ED5nKbtmhAVLoEGxPtNBeWdDUWFGntorEnLZFJARDH4JZ7SfawGBt+8r3KcWVcNwyGQx3oAFIE4YAB+BgxAAYmKap8ksKA5ocCkS5gXW+b4MQw4YNBbgGH2W5lrwCejOTeKU5FUV2GB9jWLFuF5GERldVuDEESAKS0rxFAlIQl8LJS5QgGb1WAMUwEMLx+HJIGMGuUHN44EA5KAA&name=showcase%202)
:::
---
:::center
# Importar modelos
:::
---
# `loadModel()` e `model()`
:::col ratio=65%
```js
let bule;

async function setup() {
  createCanvas(400, 320, WEBGL);
  bule = await loadModel(URL_BULE,
                         true);
}

function draw() {
  background(246);
  orbitControl();
  noStroke();
  ambientLight(80);
  directionalLight(255, 246, 232,
                   -0.4, 0.5, -1);
  fill("#2b5fd9");
  model(bule);
}
```
:::
:::col ratio=35%
Como `loadImage()` e `loadFont()`, `loadModel()` é **assíncrono**: `setup()` precisa ser `async` e a chamada precisa de `await`.

O p5 lê dois formatos de texto: **OBJ** e **STL**. O tipo é deduzido da extensão do endereço.

O segundo argumento, `true`, é o `normalize` - e tem uma pegadinha de tamanho que o próximo slide desmonta.

Um modelo não traz cor nem material: `loadModel()` devolve só a geometria, e o `fill()` é seu.
:::
---
# `normalize` e a escala de chegada
:::col ratio=50%
Modelos vêm em unidades arbitrárias: o bule deste exemplo mede 6 unidades de ponta a ponta; o disco de teste da biblioteca three.js mede 1.
```js
// sem normalize
x: -3.0 a 3.4
y:  0.0 a 3.1

// com normalize
x: -100 a 100
y:  -49 a 49
```
`normalize` **não** leva para a faixa de 0 a 1: ele redimensiona para caber numa caixa de cerca de **200 unidades**, centrada na origem.
:::
:::col ratio=50%
Sabendo disso, a escala fica previsível: um modelo normalizado já tem o tamanho de um `box(200)`, e quase sempre não precisa de `scale()` nenhum.

E a pegadinha de verdade:
```js
// funciona
await loadModel(url);
await loadModel(url, true);
await loadModel(url, {
  normalize: true,
  fileType: ".obj",
});

// quebra
await loadModel(url, {
  normalize: true,
});
// TypeError em fileType
```
Passando um objeto de opções, **inclua sempre `fileType`**. Com a forma posicional o problema não aparece.
:::
---
# O formato OBJ por dentro
:::col ratio=52%
OBJ é texto puro, uma instrução por linha. Para uma malha simples bastam duas letras:
```
v  0 -1  0
v  1  1  1
v -1  1  1
v  0  1 -1
f 1 2 3
f 1 3 4
f 1 4 2
f 2 4 3
```
`v` declara um vértice; `f` declara uma face, listando índices de vértices.
:::
:::col ratio=48%
Três detalhes que pegam quem escreve OBJ na mão:

- os índices começam em **1**, e não em 0;
- `vt` declara coordenadas de textura e `vn`, normais; quando existem, a face vira `f 1/1/1 2/2/2 3/3/3`;
- uma face pode ter mais de três vértices, e quem lê o arquivo se encarrega de dividir em triângulos.

O formato aceita ainda materiais, num arquivo `.mtl` à parte - que o p5 **não** lê.
:::
---
# Um OBJ escrito aqui mesmo
:::col ratio=65%
`loadModel()` aceita qualquer endereço - inclusive um criado na hora a partir de texto. Dá para ver o formato funcionando sem baixar nada.
```js
let malha;

const OBJ = `
v 0 -90 0
v 85 50 85
v -85 50 85
v 0 50 -85
f 1 2 3
f 1 3 4
f 1 4 2
f 2 4 3
`;

async function setup() {
  createCanvas(340, 300, WEBGL);
  const url = URL.createObjectURL(
    new Blob([OBJ]));
  malha = await loadModel(url,
    { fileType: ".obj" });
  malha.computeNormals();
}

function draw() {
  background(246);
  orbitControl();
  noStroke();
  ambientLight(80);
  directionalLight(255, 246, 232,
                   -0.4, 0.5, -1);
  fill("#1f7a63");
  model(malha);
}
```
:::
:::col ratio=35%
::img src="obj_mao.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDjXxPDB6ADcHA42muEGGDBIACEAFIMYQMAAGHGSDAADAxrABODlslkMWz5Bj5DmC-l2IUigX5fkcqUSjiWBgARgYxQY5UVKo1DAALFrVbq1Vr1UbNRBGUTJBA+IYRhBtAxLGYHSgwGS-BozF4ABQASgYwE+HgUSzIAmStp95V1bKRGrZcYYAHU6FSAOIAGT9VtkpPJvjM+h4DIAqgAlTP7fp8JYkaqxGDaFAVzM+z6yDIAdwYVIw12qPoA2tSaQBdP05z54vT0hh8LvPXz9xQAWVuAx9RYwSI7gadYHGFBG82wDDECAHsQcAF8pzIGDO+PtrmgvBYYAA5a76PGGf1WjexIQM6rrujIUD6Au-qBp81R8No3SCPo1wulAPrFLqABs96yD+1RgCgZBkigKEYABnwQNcADKpHXECFEPnwaAERIKCZmAgioD6thsrhDBQGA-TNuBfAYBxXEoBh+T5PGmFYXJ5TFLuD4qGp6nqdYbIILq8babJnLKvxliHuRYgAMTKpYADsfBYZqID8WgG7kU+95ARAyKorsMD7GsWLcPGMIjPuTz6IIkBnmyBIMF4iiCUIUUxR52gRra+6CYYXj8CMZ7VP2iHJRwIA3kAA&name=obj%20mao)

Como o endereço de um blob não tem extensão, aqui o `fileType` é obrigatório - é a única pista que o p5 tem.

E como este OBJ não declara `vn`, a malha chega **sem normais**: sem o `computeNormals()` ela sai preta, porque a luz não tem com o que trabalhar.
:::
---
# O formato STL por dentro
:::col ratio=52%
STL descreve só triângulos soltos, cada um com a sua normal declarada:
```
solid tetra
facet normal 0 0 1
 outer loop
  vertex 0 -90 0
  vertex 85 50 85
  vertex -85 50 85
 endloop
endfacet
...
endsolid tetra
```
Não há índices: **cada triângulo repete os seus três vértices por extenso**.
:::
:::col ratio=48%
A consequência é direta: um STL é maior que o OBJ equivalente, e os vértices chegam duplicados - o que faz toda malha importada de STL parecer facetada até você chamar `computeNormals(SMOOTH)`.

Em compensação, é um formato **simples e sem ambiguidade**, e por isso virou o padrão da impressão 3D.

Existe também uma variante binária do STL, bem menor, que o p5 também lê.

E o que STL não tem: cor, textura, coordenadas `uv`, nomes de peças. Só triângulos.
:::
---
# OBJ ou STL

| | OBJ | STL |
|---|---|---|
| vértices | por índice | repetidos |
| textura (`uv`) | sim | não |
| normais | opcionais | uma por triângulo |
| materiais | em `.mtl`, que o p5 ignora | não existem |
| uso típico | troca entre programas | impressão 3D |

Para trazer de fora e **texturizar**, OBJ. Para mandar a uma impressora, STL.
---
# De cabeça para baixo
:::col ratio=48%
O p5 herdou do canvas 2D um eixo `y` que cresce **para baixo**. Quase todo modelo pronto assume o contrário: `y` (ou `z`) crescendo **para cima**.

O resultado é que um arquivo importado quase sempre chega virado - e a correção é **uma rotação**, não uma reflexão:
```js
// modelo com y para cima
rotateX(PI);

// modelo com z para cima
// (o padrão do Blender)
rotateX(HALF_PI);
```
`scale(1, -1, 1)` também põe o modelo em pé, mas **inverte as normais** junto: a luz passa a vir do lado errado, e o objeto fica escuro em cima e claro embaixo.
:::
:::col ratio=52%
::img src="eixo_y.png" width=100%
:::
---
# Um modelo de verdade
:::col ratio=65%
O bule de Utah, de 1975, é o modelo de teste mais antigo da computação gráfica - e está no repositório do próprio p5.js.
```js
let bule;

const URL_BULE =
  "https://cdn.jsdelivr.net/gh/" +
  "processing/p5.js@v1.9.0/test/" +
  "unit/assets/teapot.obj";

async function setup() {
  createCanvas(400, 330, WEBGL);
  bule = await loadModel(URL_BULE,
                         true);
  bule.computeNormals(SMOOTH);
}

function draw() {
  background(246);
  orbitControl();
  noStroke();
  ambientLight(70);
  directionalLight(255, 246, 232,
                   -0.4, 0.5, -1);
  rotateX(-0.4);
  rotateY(0.6);
  rotateX(PI);  // y para cima
  fill("#c9ccd2");
  specularMaterial("#e8e8ea");
  shininess(28);
  model(bule);
}
```
:::
:::col ratio=35%
::img src="bule.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDjXzVMzjADcHA42muEGGDAAqgAlAAyAH0AEKU2mMUQyBhiYKhcKRaINRIpNIZFaCJCOBwAak+Yi8+mu2gmhkggjqDUKyQAjAgAJwIAAMjiWwwlG2lHLEZggYBWfDWGkMRoUXmuKAQ12qsTERMkEDtIwg2gYlit2hQYDJfg0Zi8AAoAJQMYCfDwKJZkATJO2xgAs+v1SIY5XKBYYAHU6IyAOK0+M+2R48YMYQMPgAd2evgw10UAFlbgNYzSGczWUjPipJ1Pp1OUPozDA659GzB9tc0F4LDAAHLXfRPDCGWMAZV7JBIFAAEkuIABfYkQEOB8ORqD6dsJpPLvjabqCeVWlAsbFDmABsN6yHu1Q2mQZJztcGAJvWDAQNcx7wUCSGfHwaDQRIKC0mAYooLGADs+oQQwUBgP0YYRn6GCEcRwH5PkhYgaB7HlMU44cjO-GyNY+oIDmhbCWxDDWJqlHypoSwABqxkJIkya6fBLFQsbCeByGyepMCKTQACSdayBEDAjAwXgGFo2hgE8nyWGAGCIWIADE2g6toUTFGIlGGPM2j4gYvb6Z4fCuSAbkwLYMUKH5yGTJAkBKsBtiUWgA6ISuN73hAyKorsq4HIYWLcIWMKWcADBPPogiQNgDD6gSVmKNRQiNc1DB5domZ2kmVFgAF-AjI11Tdr+LV5SAt5AA&name=bule)

São 1202 vértices. O `computeNormals(SMOOTH)` é o que tira o facetado do arquivo e deixa a curva contínua - e o `rotateX(PI)` é o que põe o bule em pé.
:::
---
# Pintar depois
:::col ratio=65%
Como o arquivo não traz material, tudo o que a aula 8 ensinou sobre cor, luz e textura se aplica ao modelo importado.
```js
const acabamentos = [
  () => fill("#e2632a"),
  () => {
    fill("#c9ccd2");
    specularMaterial(255);
    shininess(60);
  },
  () => normalMaterial(),
];

for (let i = 0; i < 3; i++) {
  push();
  translate((i - 1) * 140, 0, 0);
  rotateX(-0.4);
  rotateY(0.6);
  rotateX(PI);
  acabamentos[i]();
  scale(0.78);
  model(bule);
  pop();
}
```
Já a **textura** só funciona se o arquivo trouxer `vt`. Sem coordenadas de textura a imagem não sabe onde se prender, e o p5 pinta o modelo com a cor média dela.
:::
:::col ratio=35%
::img src="bule_pintado.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAQgSSYxhAwxMFQuFItEGokUmkMitBEg8vprtoJoZIII6g1CskAIwIACcCAADI4lsNHGYIGAVnw1hpDEqFF5rigENdqrExABuDjjXzVMzjS2SCBakYQbQMSxq7QoMC4vwaMxeAAUAEoGMBPh4FEsyAJklrAwAWABs8qRDGKKbTAHU6BSAOIk4MO2S28YMOl8ADuz18GGuigAsrcBoHieSqTS0yh9GYYEXPqWYPtrmgvBYYAA5a76J4YQyBgDKDZIJAoAAl+xAAL4cDge13e31QfRVkNhgd8bTdQT8tVQQPFZOb2TT6oasi47vXDAh4sMCDXAuX5Ar+nx8Ggb4SCgJJgDyKCBrY+TPgwUBgP0Xo+k6GAwXBD75PkaaPkmhHlMUabWPKCAJmmlEEQw1iSpuEa4vil58NU4FQdchjlgwADanyyGewgsO6YAYD+YgAMQwBmpF8GIwZIoJDDCaJ4YyCosiWOJkkgFJ2gytoUTFIpf5aYY8zaHaBgNnwSyeHwP7FPhyEWUgkCQEKgYpm5DBbspmlCaGIn-tOs52Q5YBOSGgWyAAug6nyWNOqnWgwYC8fK5oZXIDDlDlYAANRFaGGlaWOkygUFDDdgIhj8EsgaBpl1gMIxDAAFTtQmqYMH18p+fymhLAAGoGFFUUNhr2TAVCBpRSbTSNMDjTQACSflsRx6gQCg3F8WA8XVRZ2hOTAC0IAA7LYfloM2P6Dn5BpBshO7bhwyKorsQ4HIYWLcGmMIjGGDBPPogiQNg-U5V4iioUI0PZf5HBnRAcY8cAKFgJZ-AjND1R1leOXvSAW5AA&name=bule%20pintado)
:::
---
# Medir o que chegou
:::col ratio=62%
```js
function medir(g) {
  const v = g.vertices;
  const eixo = (k) => {
    const n = v.map((p) => p[k]);
    return [min(n), max(n)];
  };
  print("vértices:", v.length);
  print("faces:", g.faces.length);
  print("x:", eixo("x"));
  print("y:", eixo("y"));
  print("z:", eixo("z"));
}
```
E, já que `vertices` é uma lista de `p5.Vector`, dá para **editar** a malha depois de carregada:
```js
for (const p of bule.vertices) {
  p.y += 12 * sin(p.x * 0.05);
}
bule.computeNormals(SMOOTH);
```
:::
:::col ratio=38%
Antes de posicionar um modelo desconhecido, vale olhar o que veio. As duas listas são dados comuns de JavaScript.

`medir()` responde às três perguntas que aparecem sempre: o modelo é grande ou pequeno demais, está centrado na origem, e a malha é pesada o bastante para doer.

Mexendo nos pontos e recalculando as normais, qualquer modelo importado vira matéria-prima - e não só um objeto pronto para pôr na cena.
:::
---
# Construir ou importar?
:::col
**Construir no código** quando a forma é **descritível por uma regra**: uma grade, uma revolução, uma repetição, uma deformação paramétrica.

A vantagem não é a forma em si, é o que vem junto: a forma passa a ter **parâmetros**. Trocar um número gera uma família inteira de peças, e isso é o que a aula toda vem perseguindo.
:::
:::col
**Importar** quando a forma vem da mão de alguém: uma escultura, um personagem, uma peça escaneada, um modelo baixado.

Modelar à mão num programa próprio e trazer pronto é quase sempre mais rápido do que descrever a mesma coisa em código.

E vale lembrar que os dois caminhos se encontram: um modelo importado é um `p5.Geometry` como qualquer outro, com `vertices` que você pode mexer e `faces` que você pode percorrer.
:::
---
:::center
::img src="showcase_3.png" height=80%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgkBhoW4Da4MMBoLzXfSaKDE7TXAn4vhLTx8axeTxPbAMCDXZIwBjVMzjQxIrk8vmwSwUp60iYIDg4vEGACOZhSxJgAHJ+c84IpiWYngxeQAvADcDD4hh01y8YEtfj4xMsMDAmitWi8BhQYH0DCg9qSw0tcogtIgwwYAFUAEoAGQA+gAhSOxxjCBhiYKhcKRaINRIpNIZFaCJB5fTXbQTQyQQR1BqFZIARgQAE4EAAGRxLYaOMwQV2OS3GFCGbsKckoBDXaqxMSmjjjXwCoUMdMAbQAugvJBBLP3tN7rjIJVK+AAKaqWmAi7oASgYwE+YYjgjXXJgAHcGAUEABxGA6Q0fQRnPO8d1kF9fEsd8O07DsABYGAAagYXoACoGDgjsO3yfIIOtcNfD4Ml33yFC0IYTDygQAA2AjJV9c8oJ-Bhrhgq9jAQXlKTAKtDAfJ8ZBUFioHfbkwGMc8vAQOAqIYGDUIwhh8hFGSRnkyw1IQY1NIfawsIQfDPlkQRuJgXj+IQLwzEmZj+kZGAADUYEPClzxMlQZLk1CxMwkivHk0piiRTzZHUii-ItUjMOC0LhJUH8dMi+SAqCso73Az4AF9PkYhhmOPCNLD4Ks2I468EBK-iHzM6rZRsuz1wQFr6s3LLhLM2kyQsGAADkzwwQxzwAZQAWRIEgKAACQ62R+hQMx9BkQQd1y3dLRGUMFIPI8ZBHMwvDAx9nwcpYyAEZJLXPVscJFfI7oYAB1OhEz-WM5tFSSYBG6YoHPWxPpYzi+XTPhP2eXwMGuRQxsJDBzxjBNk1TEUUH0MwYE+-LzyXSj0w7c1ejwBhWyJ5DkIfFcGtspBz1PfQnkva9b0ytaOA4fdQz2v19HB46hNkK9tG6QQK37f7igQ2jPopapXTIY90euBHPu5EblaBMCCJI+WJBQWMwFLFAAY7T6oB9Vy9r4DBDeN89ijwkUpdo53yhChhrDghCRTg1TPabT6K00JYAA1zy9hBynyT7qcMKqKToUq6fPQRWbXFgToSn9ae1zz0YEQx+CWc9z16ABSBhyk9hhA6Ch6RXPSxofc3pHCr-Ta4fTCmydrDPvm64Q5gKhzzgmWCMH4fw5oABJAeFLADAEfGfQvEV6H9EKzePJAABiYpqnySwoFbMQ7xFWkd7EPeYGKWj3b4c-bycBhAYX9wbZgMe6OKBeCUSKnBe5IjqfWyh1dayJUS7BgPsNYWJuAihhBpYADJ9CCEgJyQmP5FAWyEFg8061tCXXtKgi2hgvD8BGJyao0MRaEI4CAbKQA&name=showcase%203)
:::
---
# Exportar: `saveObj()` e `saveStl()`
:::col ratio=56%
O caminho de volta também existe. Qualquer `p5.Geometry` sabe se gravar em disco:
```js
function keyPressed() {
  if (key === "o") {
    malha.saveObj("peca.obj");
  }
  if (key === "s") {
    malha.saveStl("peca.stl");
  }
}
```
Os dois baixam um arquivo, como `saveCanvas()`. `saveStl()` aceita ainda `{ binary: true }`, que gera a variante compacta.
:::
:::col ratio=44%
Com isso o p5 entra num fluxo de trabalho maior:

- gerar a forma por código aqui, exportar em **STL** e mandar para uma impressora 3D;
- exportar em **OBJ**, abrir no Blender para dar acabamento, e trazer de volta;
- gerar centenas de variações de uma peça num laço e salvar todas.

É a mesma ideia da aula 1: o programa não é o desenho, é a **fábrica** do desenho - e aqui a fábrica produz objetos.
:::
---
# Recapitulando
:::col
**A malha**
- `vertices`, `faces`, `vertexNormals`, `uvs`
- face é um trio de **índices**, em sentido anti-horário
- `computeNormals()` é `FLAT`; `SMOOTH` funde vértices repetidos
- `normal()` fixa a direção do próximo vértice

**Construir**
- `buildGeometry(fn)` grava o desenho numa malha
- construa no `setup()`, desenhe no `draw()`
- `beginGeometry()` não existe mais no p5 2
- `freeGeometry()` libera a memória de vídeo
:::
:::col
**Importar**
- `loadModel()` é assíncrono; `model()` desenha
- OBJ tem índices e `uv`; STL só tem triângulos
- `normalize` leva para uma caixa de ~200 unidades
- com objeto de opções, **sempre** passe `fileType`
- material e cor não vêm no arquivo
- o `y` do p5 aponta para baixo: quase todo modelo pede `rotateX(PI)`

**Exportar**
- `saveObj()` e `saveStl()`
- STL para impressão, OBJ para outros programas
:::
---
# Para levar adiante
:::col
As referências desta aula, no site do p5.js: o tutorial **Custom Geometry** e as páginas de `buildGeometry()`, `p5.Geometry`, `loadModel()`, `model()` e `freeGeometry()`.

O bule é o *Utah teapot*, modelado por Martin Newell em 1975, e vive no repositório de testes do p5.js.

O passo seguinte natural é o **shader**: quando nem material nem luz dão o acabamento que você quer, é o programa de fragmento que decide a cor de cada pixel da malha.
:::
:::col
Sugestões de exploração:

- Gere os cinco sólidos platônicos como `p5.Geometry` e compare o facetado com o suave.
- Construa uma peça por código, exporte em STL e abra num fatiador de impressão 3D.
- Carregue um modelo e desloque os vértices com `noise()` ao longo do tempo.
- Monte um sólido de revolução: um perfil desenhado em 2D, girado em torno do eixo y.
:::
---
:::center
# Obrigado
:::
