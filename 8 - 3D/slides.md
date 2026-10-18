::: center
# Programação criativa
## Aula 8 - 3D
:::
---
# Três dimensões

Até aqui o canvas foi uma folha de papel. Nesta aula ele vira uma **janela para um espaço**: as formas ganham profundidade, e o que aparece na tela passa a depender de três coisas que no 2D nem existiam.

- **Câmera** - de onde e com que lente a cena é vista.
- **Luz** - o que dá volume às superfícies; sem ela, uma esfera é um disco.
- **Material** - como cada superfície responde à luz: fosca, brilhante, texturizada.

A aula segue os tutoriais *Coordinates and Transformations* e *Lights, Camera, Materials* do site do p5.js (Pagurek, Slominski e Ferriss), adaptados para o p5.js 2.
---
# Roteiro
:::col
- **O espaço 3D** - `WEBGL`, eixos, a câmera padrão
- **Transformações** - `translate`, `rotateX/Y/Z`, `scale`, hierarquia
- **Formas** - primitivas e malhas de triângulos
:::
:::col
- **Câmera** - `orbitControl`, `camera`, `perspective`, `ortho`
- **Luz** - ambiente, direcional, pontual, refletor
- **Materiais** - brilho, emissão, textura, malhas próprias
:::
---
:::center
# O espaço 3D
:::
---
# `WEBGL`: o terceiro argumento
:::col ratio=65%
```js
function setup() {
  createCanvas(340, 260, WEBGL);
}

function draw() {
  background(246);
  fill("#d9452b");
  box(80);
}
```
O modo 3D se liga no `createCanvas()`. O desenho passa a ser feito pela **placa de vídeo** (GPU), por meio da WebGL, e três coisas mudam de imediato:

- a origem `(0, 0, 0)` fica no **centro** do canvas, não no canto;
- toda função de desenho aceita uma coordenada `z`;
- surgem as funções de câmera, luz e material.
:::
:::col ratio=35%
::img src="primeira_caixa.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeUACwABiRDGKADYeQwAOp0ABCAHEADKUgDcHAAvhwODi8QSiQwoPo+AB3Kk0z7VPjabqCfTXXFQcnFDn8uWfSxgDAYcliADEUAAnBz8sVqmJ7TIGDc4OTbFzA0qIMjUbsYPs1ljuLyYSMaQwnvpBJBsAwubKGF5FFBIIJc-mGFHtMzWemS4YvPwRrnqhhriaC1GQAqgA&name=primeira%20caixa)

A caixa parece um quadrado: a câmera olha para ela exatamente de frente, e só a face da frente aparece. Para ver o volume, é preciso girar a caixa ou mover a câmera.
:::
---
# Os eixos
:::col ratio=42%
- `x` cresce para a **direita** (vermelho);
- `y` cresce para **baixo** (verde) - como no 2D;
- `z` cresce **para fora da tela**, em direção a quem olha (azul).

Ou seja: valores negativos de `z` afastam a forma, positivos a aproximam.

`debugMode()`, chamado no `setup()`, desenha esta grade no plano `xz` e as três setas. É a primeira coisa a ligar quando uma cena 3D não aparece onde deveria.
:::
:::col ratio=58%
::img src="eixos.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBiwapmQQAWVuMAAFABKbAMQT6RQwBgQa4MLz8RkMOAALwY9OMmkMuOu-JgYDggoYpLgDGSMH06gwSGuSIYIylMtgSq5fA5Zgw5IQHBxAEEdAAj9S0nTXdQAc60sF4iiZ9Pt2jATwA3AwDLThvSvAYtIIwLS0hxLGYINoUGBrjJeWYvBSGMBPh4FEsyAJknxDKSACwANgADErykWSwwAOp0ABCAHEADLk92pvjmvik8plpXWYrFpV54oV4dKkcMACMo+bnzxBOJsHz5aVtlHq4YFfH-fXa6L04gAF8OGGI1GYzIoLSAO5JlMyBjVPjabo064RqCk4qFveya76apgFAyFjFB9GuDAKRbO9GQAZRA64gQgz5GVlPgMEJPglk8VDELvG44FJfJd0gw8IGRVFdhgfY1ixbglRhFVgAYJ59CDCAqSLT1-SgKBIEEdjPRI7QsxzZNcTAQwWT4EYqWqDBrifASOBAfcgA&name=eixos)
:::
---
# A câmera padrão
:::col ratio=55%
Sem nenhuma configuração, o p5 posiciona a câmera em `(0, 0, 800)`, olhando para a origem, com o campo de visão vertical ajustado à altura do canvas.

Consequência prática: **no plano `z = 0`, uma unidade vale um pixel**. Um `box(80)` na origem ocupa 80 pixels na tela, como um `square()` de lado 80 no 2D.

- O que está em `z > 0` está mais perto e parece **maior**.
- O que está em `z < 0` está mais longe e parece **menor**.
- O que está atrás da câmera, ou perto demais dela, não aparece.
:::
:::col ratio=45%
Nos exemplos desta aula, o código mostrado fica **dentro do `draw()`**, logo depois de:
```js
background(246);
orbitControl();
```
`orbitControl()` deixa o mouse girar (arrastar), aproximar (roda) e deslocar (botão direito) a câmera. As imagens dos slides são a vista inicial; o link **editar** abre o sketch completo para explorar.
:::
---
:::center
# Transformações
:::
---
# `translate(x, y, z)`
:::col ratio=65%
As transformações da aula 3 continuam valendo, agora com um eixo a mais. `translate` move a **origem**, e tudo o que for desenhado depois parte dela.
```js
fill(255);
stroke(40);

box(50);              // na origem

translate(110, 0, 0);
box(50);              // 110 à direita

translate(0, -90, -300);
box(50);              // 90 acima, 300 atrás
```
Como no 2D, as transformações **se acumulam**: a terceira caixa está em `(110, -90, -300)`.
:::
:::col ratio=35%
::img src="translate3d.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeUACwABiRDGKADYeQwAOp0ABCAHEADKUgDcHAAvhwODi8QSiQwoPo+AB3Kk0z7VPjabqCfTXXFQcnFDn8uWfa76apgFBkIkoc0YKnyyQyBiWMAYL3FfL5e1+4bmoHk7nhw3XODk-JcuUqNPp2QRBgQLSOsCCGBoZV+j0CQz8JbkgCMVaFdfDshuieTqYzbazNa5DAAB5qwP0XXxi7JSxBy3xK0LrABOKflLkpn2NhNJxdt9uOBizhjGsBPXnzrsT-QAQ8aECVEGRqN2MH2ayx3F5MJGNIYT30gkg2AYXNlDC8RQoEgQQfz-BhL20ZlWTfYDDC8fgRh-aoMGuE1-0vEAFSAA&name=translate3d)

A caixa afastada parece menor e mais próxima do centro: é a **perspectiva**. Fora do centro, as laterais das caixas aparecem.
:::
---
# `rotateX`, `rotateY`, `rotateZ`
:::col ratio=65%
Cada uma gira em torno de um eixo, com o ângulo em radianos.
```js
noStroke();
normalMaterial();

push();
translate(-130, 0, 0);
rotateX(QUARTER_PI);
box(70);
pop();

push();
rotateY(QUARTER_PI);
box(70);
pop();

push();
translate(130, 0, 0);
rotateZ(QUARTER_PI);
box(70);
pop();
```
`normalMaterial()` pinta cada face de acordo com a direção para a qual ela aponta - é o jeito mais rápido de enxergar volume sem configurar luz.
:::
:::col ratio=35%
::img src="rotacoes.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWdkABiRDGKxR5DAA6nQAEIAcQAMpSANwcAC+HA4OLxBKJDCg+j4AHcqTTPtU+NpuoJ9NdcVBycV2QA2WWfa76apgFBkIkoM0YKlyyQyBgQa4AZQ91yB3s+Af0TwwAFk+EtPHwvfbfbIvGZJuG-R6BIZ+EtydYAIzlQVllOyM2aJYADXJAEUAKoAQQAShQ6K2APo0ACSFYYNzg5IA7FyB15rhSU5905mB1X4zAqA2W+3Oz3+z7ZEPR+PtwxJ9OfbOM0gs7IcxA80vySWy7z959F0sAFqrtsd7t9ge7scTqcs0VCBkVRXYYH2NYsW4XkYRGGkGCefRBEgbAGC5GVD0UKBIEENCMIYYDtGZVkEJwwwvH4EY0OqDBrmNTDgJAeUgA&name=rotacoes)

- `rotateZ` é o `rotate` do 2D: gira no plano da tela.
- `rotate(ang, [x, y, z])` gira em torno de um **eixo qualquer**.
- `angleMode(DEGREES)` troca radianos por graus; `radians()` converte um valor só.
:::
---
# `scale(x, y, z)` e o pivô
:::col ratio=65%
`scale` estica ou achata, cada eixo com seu fator. Para deformar a partir da **base**, e não do centro, leve a origem até o pivô antes de escalar.
```js
noStroke();
normalMaterial();
rotateX(-0.35);  // vê a cena um pouco de cima

const fatores = [[1, 1], [1.4, 0.55],
                 [0.7, 1.6]];
for (let i = 0; i < 3; i++) {
  const [sl, sa] = fatores[i];
  push();
  translate(-130 + i * 130, 40, 0); // pivô
  scale(sl, sa, sl);
  translate(0, -30, 0);  // base no pivô
  box(60);
  pop();
}
```
:::
:::col ratio=35%
::img src="escala3d.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWdkABiRDGKxR5DAA6nQAEIAcQAMpSANwcAC+HA4OLxBKJDCg+j4AHcqTTPtU+NpuoJ9NdcVBycV2QA2WWfa76apgFBkIkoM0YKlyyQyBgQa4AZQ91yB3s+Af0TwwAFk+EtPHwvfa-WbNEsABrk6xchDlfKy2QRBjJABXDC02gkWjMaAYXnN2muGpgOjATyVfqbEGGDEs8cdEwYwgYAG1RwBGXkTgC6vMnCHZvNz+Xyc8+Kk3W63o9zAHZpwgbTOZz7ZJZHQxyeNfGBhwwuTKGHe8Axyk+wABqT-U2l+2Tdr2o6GBgvKGHwM73v2KCDoYo5gKeG71mYkzhv+DAegIIHxjA2YTuUXIMJ+z4MAAVAw+GCtyy6FsWXgpAAL0h7hJrhIFgXwYEYCmm6YT2-BLOSgrWARNFPk4jgMIaxj+s29HJEx6E3HA5I2lyPEqA2FIaYqEC6ciqK7DA+xrFi3C8jCIw0gwTz6IIkDYA+T5eIoUCQIIjmPgwunaMyrLWW5hhePwIyOdUGDXMaT76fKQA&name=escala3d)

É o "estica e achata" dos desenhos animados: com os fatores variando no tempo, a caixa quica sem sair do chão.

`scale(-1, 1, 1)` espelha a cena em `x` - útil para desenhar algo simétrico desenhando só metade.
:::
---
# A ordem importa: hierarquia
:::col ratio=65%
Cada transformação vale no sistema deixado pela anterior. Girar e **depois** transladar faz o objeto andar na direção já girada - que é exatamente uma órbita.
```js
noStroke();
normalMaterial();
rotateX(-0.5);
const t = 0.9;   // millis() / 1000 anima

sphere(40);               // sol

push();
rotateY(t);               // órbita da terra
translate(150, 0, 0);
sphere(18);               // terra

rotateY(4 * t);           // órbita da lua,
translate(38, 0, 0);      // em volta da terra
sphere(6);                // lua
pop();
```
:::
:::col ratio=35%
::img src="sistema_solar.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWdkABiRDGKth5DAA6nQAEIAcQAMpSANwcAC+HA4OLxBKJDCg+j4AHcqTTPtU+NpuoJ9NdcVBycV2QA2WWfa76apgFBkIkoM0YKlyyQyBgQa4AZQ91yB3s+Af0TwwAFk+EtPHwvfa-WbNEsABrk6xchD5FOybRE4YMXzCBi5gCcMpUEQYaDAGCSbOpjgYAEYuV2GAIwE8lX7DF4pv0OVzZSpJ1Pa23DNcMAPZF4zJNw6nrumYFRySgJ9P9042wBnp0urRQLQJrWfD0CQz8Jbk9v5QWvgt+YcwUft2x7g9Tusrz4Rc+g3eMtw5BgACpSz-A86xPZ1NA1LQMDMPgkRvLUIHvcDyXKWxeTfGsALbGA0AYZJ52Qi9Sy-a9B0-Uc7RI-9SN4dDPi8a4KRTRUIGRVFdhgfY1ixbheRhEYaXrAxBEgbAKxrLxFCgSBBEUrka347RmVZGS1KHfgRkU6oMGuY1tI4EB5SAA&name=sistema%20solar)

A lua não precisa saber onde a terra está: ela é desenhada **no sistema da terra**. É assim que se monta qualquer cena articulada - um braço preso ao ombro, uma mão presa ao braço.

Receita para posicionar um objeto: `translate`, depois `rotate`, depois `scale`.
:::
---
# Simetria por repetição
:::col ratio=65%
Repetir o mesmo desenho girando a cada passo produz simetria radial. Aqui, um círculo de pedras.
```js
noStroke();
normalMaterial();
rotateX(-0.45);

const n = 14;
const passo = TWO_PI / n;
for (let i = 0; i < n; i++) {
  push();
  rotateY(i * passo);
  translate(0, 0, 150);
  box(26, 90, 18);          // pilar
  pop();

  if (i % 2 == 0) {         // lintel sobre
    push();                 // o par i, i+1
    rotateY((i + 0.5) * passo);
    translate(0, -52, 150);
    box(92, 14, 20);
    pop();
  }
}
```
Como o `translate` vem depois do `rotateY`, cada pilar é empurrado para fora **na direção já girada** - de novo, a ordem é o desenho.
:::
:::col ratio=35%
::img src="simetria.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWdkABiRDGKth5DAA6nQAEIAcQAMpSANwcAC+HA4OLxBKJDCg+j4AHcqTTPtU+NpuoJ9NdcVBycV2QA2WWfa76apgFBkIkoM0YKlyyQyBgQa4AZQ91yB3s+Af0TwwAFk+EtPHwvfa-WbNEsABrk6xchDs-IpulE4b+hjCBgARnZPtk2mLvi8rMM1zLDAoQpIAH0aABJJz+msMSyOhjk8a+MCtrkyhiTvAD2cAakX1NpftkXjMk3D67613TMCo5MnACoGI21tcUyoGB6BIZ+EtyYLBRX8lzryobnArTbeQBOV9bFlG9QKcRxzzAfh9E+DdrgpQtdzASxR0nABSPky3LD8aTAlQIl4SAlh4Ztqn6WCVE3bcQLw2jwIYFtG30WdeTARcKwo2Q03jQ9yWPBhFwYXMCwYM8L2bT8bzvCAHx459eWsfJil5N8P0HG9v3Jf9lMrdleWKNTOPPeCdxvRU-XM8zkVRXYYH2NYsW4XkYRGXCnn0QRIGwISZ0bKAoEgQRvOnBhzO0ZlWVwgLDC8fgRm86oMGuY0Zys+UgA&name=simetria)
:::
---
:::center
# Formas
:::
---
# Primitivas 3D
:::col ratio=65%
```js
const formas = [
  () => plane(60),
  () => box(55),
  () => box(70, 35, 20),
  () => sphere(34),
  () => ellipsoid(42, 24, 24),
  () => cylinder(24, 60),
  () => cone(30, 60),
  () => torus(26, 9),
];
noStroke();
normalMaterial();
for (let i = 0; i < formas.length; i++) {
  push();
  translate(-150 + (i % 4) * 100,
            -60 + floor(i / 4) * 120);
  rotateX(-0.5);
  rotateY(0.6);
  formas[i]();
  pop();
}
```
:::
:::col ratio=35%
::img src="primitivas.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWdkABiRDGKth5DAA6nQAEIAcQAMpSANwcAC+HA4OLxBKJDCg+j4AHcqTTPtU+NpuoJ9NdcVBycV2QA2WWfa76apgFBkIkoM0YKlyyQyHRE4YMSyOp6GBjCBgAbU+sj1whYDC8-Ay5JtXMpSJjDDjCZucHJ+XyGazOYYefJAHZBeV8rziunM37Y9T434vFN+uTyuzi03sy2EwMkqFrmBLezinX2VPeyp++GE9oxpBYPordOGGnZypS9oiTAu4Kt4256WUI6zGzijbeQBObcAXR9sgg1wAyh7rkDvZ9X-onhgACyfBLJ4fBevafrBvo2bjL4YDhgwXIygwCF4EGIasgg4xCCgSAoWAADUhHUrSfZeJeSA-n2HoCIY-BLOS1gAIz5FyDCEdmCEAKQMD2DAAFQMMxXI8lmc4SQw1hphxQYYNcjrkghjh8dSQnMfWkFzmamhLAAGkxXIIEWz4qDpIEwFQ5JGXapmyNBoaRmAD7UXOXjXBSWkMIqEA+ciqK7DA+xrFi3C8jCIw0gwTz6IIkDYEhKFeIoUCQIICXId5HDaMyrJRalhhJnwIwJdU8nGihfnykAA&name=primitivas)

Todas são desenhadas **centradas na origem atual**: quem as posiciona são as transformações.

`plane` é plano no `xy`; `cylinder` e `cone` têm o eixo em `y`; `torus` recebe o raio do anel e o do tubo.
:::
---
# Tudo é triângulo
:::col ratio=65%
A GPU só sabe desenhar triângulos. Uma esfera é uma **malha**: pontos no espaço (**vértices**) ligados em triângulos (**faces**). Os últimos argumentos das primitivas controlam quantas divisões ela tem.
```js
fill(235);
stroke(60);
strokeWeight(0.7);
rotateX(0.35);

const det = [6, 12, 24];
for (let i = 0; i < 3; i++) {
  push();
  translate(-140 + i * 140, 0, 0);
  sphere(55, det[i], det[i]);
  pop();
}
```
:::
:::col ratio=35%
::img src="detalhe.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWdkABiRDGKXJ5DAA6nQAEIAcQAMpSANwcAC+HA4OLxBKJDCg+j4AHcqTTPtU+NpuoJ9NdcVBycV2QA2WWfa76apgFBkIkoM0YKlyyQyBiWMAYL3Fcr5e1+4ZmoHkm1c8OySPXIFCmBgQSoclchAAdnjfWumiWAA1MwhQ+G6UThhqNAxhAwANo23kARmKvOtAF0fbJLI6GOTxr4wHWGFyZQwR3gGOUJ2AANTz6m0v2yLxmSbez6yD0CQz8Jbk6wt7kMeeThgAKgYJ8Fd7zCa8U365Py+V5sBQDbAnY-Gm-nYPgwXjXBSeaKhAEHIqiuwwPsaxYtwvIwiMNIME8+iCJA2BjhOXiKFAkCCDh44MBB2jMqyaGEYYXj8CMOHVBg1zGhOUHykAA&name=detalhe)

Mais divisões, superfície mais lisa - e mais trabalho para a GPU. Com centenas de esferas na cena, diminuir o detalhe é a primeira otimização.

O traço (`stroke`) desenha as arestas da malha. Na maioria das cenas 3D, `noStroke()` é o que se quer.
:::
---
:::center
# Câmera
:::
---
# `camera()`
:::col ratio=65%
`camera()` diz **onde está o olho**, **para onde ele olha** e **qual direção é "para cima"** na imagem.
```js
camera(600, -650, 900, // olho
       0, 0, 0,        // alvo
       0, 1, 0);       // "para cima"
noStroke();
normalMaterial();

for (let i = -3; i <= 3; i++) {
  for (let j = -3; j <= 3; j++) {
    const h = 120 - 25 * sqrt(i * i + j * j);
    push();
    translate(i * 55, -h / 2, j * 55);
    box(32, h, 32);
    pop();
  }
}
```
O olho está acima (`y` negativo), à direita (`x` positivo) e à frente (`z` positivo) da cena. O vetor "para cima" `(0, 1, 0)` é o padrão do p5 - estranho à primeira vista, mas coerente com o `y` crescendo para baixo.
:::
:::col ratio=35%
::img src="camera_vista.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWdkABiRDGKth5DAA6nQAEIAcQAMpSANwcAC+HA4OLxBKJDCg+j4AHcqTTPtU+NpuoJ9NdcVBycV2QA2WWfa76apgFBkIkoM0YKlyyQyHR8dRa8k2rmC6w2-KCgCcod5EQY1wwSGunxUacFGd5aZU8b4GGSKb92dkgoAjLyubLi05HAwxF4DFptGAnmJPhBrgBlD3XIHe9uOp4YACyfCWnjz-d9sksjoY5PGvjADGEDGs5RlDGXeFXG63AGp99TaUWGLP9PPFwxYiu13ubzuGPfD8fUyptEThkxb6Xily13y+QMAAVH4ACO+goOSy6gcu+7XiB172qesheGYkxTsWHoCIY-BLNBiH5PkvLWEgTh8ryN6gURyHFjccDkuUxS8kgvJMbR2ZeNcFIcbIip+vx-HIqiuwwPsaxYtwvIwiMNIME8+iCJA2AMFym4NlAUCQIIKlqQw-HaMyrJyVphhePwIwqdUGDXMam5CfKQA&name=camera%20vista)

Chamada no `draw()`, `camera()` reposiciona o olho a cada quadro e **anula** o `orbitControl()`. Para começar de um ponto de vista e ainda poder girar com o mouse, chame `camera()` uma vez só, no `setup()`.

Para alternar entre vários pontos de vista, `createCamera()` cria câmeras independentes e `setCamera()` escolhe a ativa.
:::
---
# Perspectiva e projeção ortográfica
:::col ratio=40%
A mesma cena, três lentes, na ordem da figura:
```js
// campo de visão, proporção,
// planos próximo e distante
perspective(PI / 2, 1, 10, 5000);

perspective(PI / 12, 1, 10, 5000);

ortho();
```
- Campo de visão **largo**: perspectiva exagerada, como uma grande-angular. O olho precisa chegar perto.
- Campo **estreito**: perspectiva achatada, como uma teleobjetiva.
- `ortho()`: sem perspectiva. Linhas paralelas continuam paralelas, e o tamanho não depende da distância.
:::
:::col ratio=60%
::img src="projecoes.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgAQQY6kMTx0Ei02muaAYKH0ACvDLwJEtDEiGFAtBMAI5mGD6NkMLwGLRaKBgfpgTTYDg4+ZGebaFApGAAChoAEknAxiiyEDqAJQsmWGOUK5LKtUagCMWoYOoQuoYMAY130KCQ1yVuoQUscDDIii0XMU+muDAAlwwzJTLPo+OpqmZLJYeToKQwtIYzFovPoAM-ZsBkgBH6hjCAYADk+PSoJnGhBpTyjTB5Skq2mdMWeVpw3xLFXNHyBTH29pnnBhVpo4zHUt9E6CRM0NdvVTYwI3QwlVBrhgMCMGAAva4Uz0cca+QNQYP04QMADaAF0ANwcckQYYMAAyDFvxQADH+L6SBAlhmBALbXDIxgoGYXgegwwCfB4ChLH6EDJFWSoAGxYX+LLFOUeEMAA6nQABCADin66kBsgQNcn7HnBNEqDilhgIIZjDhMKAAIcKqO2CshMEh6BGxKmgefg5p8ljOpu54MGAP4MIBSlyAw5RPkpADUOn2ohMgqJe14IF4ZiTEqyF8EsABiMZxgmSb6EqwAMAA7mAUCukJn4slMHGoL5DAAL66jRnwhRwUXAaB4EKpBJIQHw8GGbI1R8No3SCMGYFQEqxQACxYRFRn0QAytS1xAh6tFpmg1RgIyn6BSgSq2H+pWyCK-QQclGAtYIqAFfk+T4aN41japCBYSyFostYf4ILYXUMOxu5KmIADEADsUAAJzVDAf5iKtclzkqim9Leam9HgDA7dp3R6QZnyyOdm5vh+-Dbk6lj3tY80MBaD6vUZKj8hZSC1W9KjUgIhj8Esl2KCGABUD1EUR1i9Bj+2dXVEM3HASqFQTsOyF41zMYToWRZ85mWat8PvkjypEcUQPWMUO3k0ZwaaEsAAaSoABK4p+tkAPpqmdYAbQRfOU-wGQFQBLK80r-LUzDEAxRwcV9ayMbualnwZVlOXXHlI35KtX2+EgKmK9pENu6xPp8BgMHDskYCGAAt6aPD0fyKshlJN1IZBH5yckN73uaPrWknwPFM+snyZdGjqTd2nKfdWm6fpCGwyZ1yGHeYAPggR2CJAusQ2A-1KgXmpg+7DusipTvJxqmgQEqceV9XGrFKtEOGsaipD9c8dVw+c1zURHUARPKijiWKXY0txT5AwGNQCyR+qSy2MWurp-A2f68hQ6GDGKX4MqM6rruotCA7QfTBn5-39IAtJaX8MYAOmsAn+18GCry1hDTeXYlTY0IkRK0l8sYLQvmgyBMC6bP20KSRuxlMxXgrgvBAEh8qrRiu9LOillJ53UoXfOL0n5NyeIIZU5cR6LwYNYTy3le6agYDpYG+9hHKQxpzKa1gApDV8H3YRFo7Z1RijFZEqJdgwH2GsLE3AWQwn3G5J4+h64QCEmpAUUARRCDMdpGKo50JtjciKI0-ARhCWqBga4WVbEcBACFIAA&name=projecoes)

Nos dois primeiros quadros a câmera foi afastada na medida certa para a caixa da frente ter o mesmo tamanho - o efeito *dolly zoom* do cinema.

O que estiver mais perto que o plano **próximo** ou mais longe que o **distante** é cortado (*clipping*). Quando um objeto some sem motivo aparente, é a primeira coisa a conferir.
:::
---
:::center
# Luz
:::
---
# Sem luz, sem volume
:::col ratio=65%
Uma forma só com `fill()` é pintada de uma cor só, e uma esfera vira um disco. A luz é o que torna o volume legível.
```js
noStroke();
fill("#d9452b");

push();
translate(-110, 0, 0);
sphere(70);        // sem luz
pop();

lights();          // daqui em diante, com luz
push();
translate(110, 0, 0);
sphere(70);
pop();
```
:::
:::col ratio=35%
::img src="sem_e_com_luz.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWdkABiRDGKxR5DAA6nQAEIAcQAMpSANwcAC+HA4OLxBKJDCg+j4AHcqTTPtU+NpuoJ9NdcVBycV2QA2WWfa76apgFBkIkoM0YKlyyQyBgQa4AZQ91yB3s+ljAGC9YgAxFAAJzs-LFapie2+2ReMyTcN+j0CQz8Jbk6wARjLgqrGdkhi8U365IA7FzZSp205HH4YGheGYAF6fLzXCkZz5JQSoNltjvtiIavgARzMYAYPY1YAES152muvYwA6HOaQedkBYgRb4JYrVd5rZ9tfrMEbLZrDGHo59iogyNRuxg+xrFi3C8jCIw0gwTz6IIkDYAwXIyu+ihQJAghwQhDDftozKshBKF1vwIxwdUGDXMaiHfiA8pAA&name=sem%20e%20com%20luz)

`lights()` é um atalho: uma luz ambiente e uma direcional, ambas cinzentas, apontando da câmera para a cena.

As luzes valem para as formas desenhadas **depois** delas, e são apagadas ao fim de cada quadro. Por isso ficam no `draw()`.
:::
---
# Ambiente e direcional
:::col ratio=65%
- `ambientLight(cor)` - claridade igual em todas as direções. Sozinha, também não dá volume; serve para que a sombra não seja preta.
- `directionalLight(cor, dx, dy, dz)` - raios paralelos, todos na direção `(dx, dy, dz)`, como o sol. Não tem posição.
```js
noStroke();
fill(240);
ambientLight(60);
directionalLight(255, 255, 255,
                 1, 1, -1);

push();
translate(-140, 0, 0);
rotateX(-0.5);
rotateY(0.6);
box(80);
pop();

sphere(55);

push();
translate(140, 0, 0);
rotateX(1);
torus(42, 16);
pop();
```
:::
:::col ratio=35%
::img src="direcional.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWdkABiRDGKxR5DAA6nQAEIAcQAMpSANwcAC+HA4OLxBKJDCg+j4AHcqTTPtU+NpuoJ9NdcVBycV2QA2WWfa76apgFBkIkoM0YKlyyQyBgQa4AZQ91yB3s+ljAGC91q59r9fDQzokKElYEEqHJNrjPtkUDA-XxhIgfAwaYzKCt+XyvOK1dr9c+KmbLZbAEZeR2GNY2-HPl4zJNw36PQJDPwluSe9zeYKc58zZolgANKdchD5eOyRd8JZUcnru25hg3ODk2zzv1ea4Uvt+wxeKb9cnVu+yAdDrcMUcQce7mDkm2M4MHOX47iugFfigjqDhyxSdke-Y3sOioQMiqK7DA+xrFi3C8jCIw0gwTz6IIkDYCBMoMF4ij5kIFFclRqHaMyrJEfmD78CMFHVBg1zGkxHAgPKQA&name=direcional)

A direção `(1, 1, -1)` aponta para a direita, para baixo e para longe: a luz vem do alto, da esquerda, de perto de quem olha.

Note que uma direção não é uma posição - por isso as três formas são iluminadas do mesmo lado.
:::
---
# Luz pontual
:::col ratio=65%
`pointLight(cor, x, y, z)` emite em todas as direções a partir de **um ponto**, como uma lâmpada. Cada forma é iluminada do lado que está voltado para ela.
```js
noStroke();
fill(240);
ambientLight(30);
pointLight(230, 70, 40, -100, -90, 90);
pointLight(40, 90, 230, 100, 90, 90);

for (let i = 0; i < 5; i++) {
  push();
  translate(-160 + i * 80, 0, 0);
  sphere(32);
  pop();
}
```
:::
:::col ratio=35%
::img src="pontual.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWdkABiRDGKXJ5DAA6nQAEIAcQAMpSANwcAC+HA4OLxBKJDCg+j4AHcqTTPtU+NpuoJ9NdcVBycV2QA2WWfa76apgFBkIkoM0YKlyyQyBgQa4AZQ91yB3s+ljAGC91q59r9fDQzokKElYEEqHJ5TjPtkXmukFT6czxWzvIA7ILubzrABGAU1gCcgub8bzBYgRYzKA5LcFpcF9b7vNbPojjoY5PGvjADGEDC5MoYs7wDHyS7AAGpN9TaX682ZJuH9wwPQJDPwluS6zauQxN8uGAAqBi2QXvtsqQxeKb9LPFT92wpT9FQgUDkVRXYYH2NYsW4XkYRGGkGCefRBEgbAFyXLxFCgSBBEwxcGFA7RmVZZC8O-fgRkw6oMGuY0l3A+UgA&name=pontual)

Duas lâmpadas perto da fila: uma laranja à esquerda e acima, outra azul à direita e abaixo. Como cada esfera as vê de um ângulo diferente, as manchas de cor mudam de lugar ao longo da fila.

Por padrão a intensidade não cai com a distância; `lightFalloff()` muda isso.
:::
---
# Refletor
:::col ratio=65%
`spotLight(cor, posição, direção, ângulo, concentração)` é uma luz pontual restrita a um **cone**. O ângulo é a abertura do cone; a concentração, o quanto a luz se acumula no centro dele.
```js
noStroke();
rotateX(-0.6);
ambientLight(50);
spotLight(color(255, 240, 210),
          createVector(-200, -300, 200),  // posição
          createVector(200, 340, -200),   // direção
          PI / 6, 10);

fill(240);
push();
translate(0, 40, 0);
rotateX(HALF_PI);
plane(520, 360);     // o chão
pop();

fill("#2b5fd9");
sphere(40);
```
:::
:::col ratio=35%
::img src="refletor.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWdkABiRDGKADYeQwAOp0ABCAHEADKUgDcHAAvhwODi8QSiQwoPo+AB3Kk0z7VPjabqCfTXXFQcnFdn8uWfa76apgFBkIkoc0YKnyyQyBgQa4AZQ91yB3s+5s0SwAGuTrFyEHafbI+GhnRIUFKwIJUOT8lz7X7DF5rpns7ntNcMI7rfl8rybULigBGAtIz4qTsqel8JYANRg+Jr1mKXKF1nKY4bY8pvKcjgYJcMYAA5wBj64drudnv9wcoGujoXlbm8kczufzzVgfrrzd+7edmgASScDH5vNbhc+ljAGC9jaFrIXhmJM4Z+h6AiGPwSzkkKp4MAWyZ9KWvYwLGAASACCUoAGIAPovkBi78Bkeajry5SCnKXYRAw1w6EgG6fCWFLfn6v7-uSYgAMTFNU+SWFAACcYjEcWUz9BySGKhwyKorsMD7GsWLcLyMIjDSDBPPogiQNgiGyouihQJAggGVyRlKnizKslppnFvwIwGdU1YmlZckKkAA&name=refletor)

Repare no que **não** aparece: a sombra da esfera no chão. A iluminação do p5 é calculada forma a forma, e nenhuma forma bloqueia a luz de outra.

Cada forma aceita até cinco luzes de cada tipo.
:::
---
:::center
# Materiais
:::
---
# Brilho: `specularMaterial` e `shininess`
:::col ratio=65%
`fill()` define a cor **difusa**, a que se espalha igual em todas as direções. O **especular** é o reflexo da fonte de luz, que depende de onde o olho está.
```js
noStroke();
ambientLight(50);
pointLight(255, 255, 255, -200, -220, 300);

const brilho = [1, 10, 50, 200];
for (let i = 0; i < 4; i++) {
  push();
  translate(-165 + i * 110, 0, 0);
  fill("#2b5fd9");
  specularMaterial(255);
  shininess(brilho[i]);
  sphere(45);
  pop();
}
```
:::
:::col ratio=35%
::img src="brilho.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWdkABiRDGKXJ5DAA6nQAEIAcQAMpSANwcAC+HA4OLxBKJDCg+j4AHcqTTPtU+NpuoJ9NdcVBycV2QA2WWfa76apgFBkIkoM0YKlyyQyBgQa4AZQ91yB3s+fDQzokKElYEEqHJ+S59r9XmukFj8cTxXy+V5ufzfLzvOs-MFZf5vPKAtTdKJwwY1U8GCQ1wYwgYAG0AIy8nuC5MFgUAXR9sksjoY5PGvjAHYYXJlDHneAY7OXYAA1FvqbS-bIvGZJuGDwwPQJDPwluTrD2bfkGFuVwwAFQMHsD3mClPjlSWMAMC9MQAGJimqfJLCgABOMRUxUPx5m0Mx+H0ABZPglk8PgvULeCVEmSBIAmNlm0AtsuzAEd8NkQwvCmfoOXyGiGHTCl8MVCBOORVFdhgfY1ixbheRhEYaQYJ59EESBsEXZcvEUKBIEEWSlwYTjtGZVlxKUuj+BGWTqgwa5jWXbj5SAA&name=brilho)

`shininess` baixo dá um reflexo largo e difuso, como plástico fosco; alto dá um ponto pequeno e nítido, como verniz.

Sem `specularMaterial()`, não há reflexo, e `shininess()` não tem efeito.
:::
---
# Ambiente e emissão
:::col ratio=65%
- `ambientMaterial(cor)` - a cor com que a superfície responde à **luz ambiente**. Se não for definida, é igual ao `fill`.
- `emissiveMaterial(cor)` - cor que a superfície **emite**, somada ao resultado da iluminação. Não ilumina mais nada.
```js
noStroke();
ambientLight(110);
directionalLight(200, 200, 200, 1, 1, -1);

fill("#d9452b");
push();
translate(-140, 0, 0);
sphere(55);                     // só fill
pop();

push();
ambientMaterial("#2b5fd9");
sphere(55);                     // sombra azul
pop();

push();
translate(140, 0, 0);
fill(60);
emissiveMaterial("#f2b84b");
sphere(55);                     // brilha sozinha
pop();
```
:::
:::col ratio=35%
::img src="ambiente_emissao.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWdkABiRDGKXJ5DAA6nQAEIAcQAMpSANwcAC+HA4OLxBKJDCg+j4AHcqTTPtU+NpuoJ9NdcVBycV2QA2WWfa76apgFBkIkoM0YKlyyQyBgQa4AZQ91yB3s+fDQzokKElYEEqHJAEYk1z7X6oGB+vjCRA+Bg4wmUFaBbz+YLy7yk1XedYk+nPpYwBgvWIAMRQACc7PyxWqYnTsi8Zkm4b9HoEhn4S3Jde5vMFaZ9skMXim-XJ+XyspUu73+5UET8AGeGE2W58vNcKQ2-cPR4OGJHoxAUABZPhLTz58ntvv5SwuwHZc-DXGANy3HcD2gvcj0Ma4oy1J8AC8zAwS9rzHS8RyQMdZAnCAp0-GBk3nBhF0fc8vRtJdPhgNAwDWFIYA-L8wB-dtLD7Wx2X7EBH1XdcSMgmUYLE2Qj2qTwMD0PxrmQyA9Awm8fUVCBkVRXYYH2NYsW4XkYRGGkGCefRBEgbByNErxFEzIRLK5US1O0ZlWWMzNV34EZLOqDBrmNJyOBAeUgA&name=ambiente%20emissao)

`normalMaterial()`, usado nos primeiros exemplos, ignora todas as luzes e todos os outros materiais. É para depurar, não para o resultado final.
:::
---
# Textura
:::col ratio=65%
`texture(img)` cobre a superfície com uma imagem. A foto da aula passada, carregada no `async setup()`:
```js
noStroke();
texture(foto);

push();
translate(-140, 0, 0);
rotateX(-0.4);
rotateY(0.6);
box(90);
pop();

push();
rotateY(-2.8);
sphere(60);
pop();

push();
translate(140, 0, 0);
rotateY(-0.5);
plane(100, 117);
pop();
```
Cada primitiva já sabe como "embrulhar" a imagem: a caixa a repete em cada face, a esfera a enrola como um mapa-múndi.
:::
:::col ratio=35%
::img src="textura.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQKCQGMIGGJgqFwo4UEgzGhqggAO5gbpgdRQMB8BDXfSCRy8-nzIV8SLXNBoXGGVnszmOKAagDsjgAsjAwIZYjAyeoUGTYGSvAYBnEvBL8gAGR1eODWfWG42mjQWk3W-oYO2CMQAbg4418lmuKGuYckED4hhGEG0DEsZhTKDAuL8GjMXgAFABKBjAT4eBRLMgCZKJgsAFnrjqRDGKxWbDAA6nQAEIAcRJRbjsijMbpDD43Oevgw10UAEknoIYAXieSqTShxwAL4cDjpzPZmRQfST4ulz7VPjabqCfTXDNQAvFesANi3MgYYuqYBQZFxKD3hgxZxp8EDXAAyoB1xAiBnxLHAKBmP0BajtcH6fF4ZiTHBn6AQIhj8EsBbWAAjE2LYdo6H6yPemhLAAGiRjoIPWNF9NGfBLFQBYse+w4MDccAFgAnNRAleNchYYZ+WE4exdFcTAPHWKUtjsYYXhTChr7iZhUm4Zh2FILhsj4XiREruRVGUQpnHccxCD5OxXj8BkBakc6LakaRWouQZH67hAyKorsMD7GsWLcC2MIjKWDBPOKkDYAwjohgw1pQEKQgpWlDBBdoNaJvFQqafwIwpdUs43ulQUgNuQA&name=textura)

`texture()` substitui o `fill`, e a luz continua agindo sobre ela. Também servem como textura um `createGraphics()`, um vídeo ou a câmera - qualquer coisa que o `image()` aceite.

`imageLight(img)` faz o caminho inverso: usa uma imagem como **luz** que envolve a cena, e os reflexos dos materiais passam a mostrá-la.
:::
---
:::center
# Malhas próprias
:::
---
# Vértices em 3D
:::col ratio=65%
`beginShape()` e `vertex()` aceitam `z`. Com `TRIANGLE_STRIP`, cada novo vértice forma um triângulo com os dois anteriores - um jeito econômico de descrever uma faixa.
```js
noStroke();
colorMode(HSB);
rotateX(-0.5);

beginShape(TRIANGLE_STRIP);
for (let i = 0; i <= 60; i++) {
  const a = i * TWO_PI / 60;
  const x = 150 * cos(a);
  const z = 150 * sin(a);
  const y = 25 * sin(3 * a);
  fill(i * 6, 70, 95);
  vertex(x, y - 25, z);
  vertex(x, y + 25, z);
}
endShape();
```
:::
:::col ratio=35%
::img src="faixa.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWdkABiRDGKADYeQwAOp0ABCAHEADKUgDcHAAvhwODi8QSiQwoPo+AB3Kk0z7VPjabqCfTXXFQcnFdn8uWfa76apgFBkIkoc0YKnyyQyBgQa4AZQ91yB3rp1wwjoAsrcYOSABKBsX2v3mzRLAAa5OsXIQ+VThpggkggb083JFAASgBJACCADlpXQAPqB6s1mip2SWR0McnjXxgBjCBhc2UMYd4UeCidgADU8+ptL9sm0ROGDC0o+HACoGBRhSQWzQa04GLPPmuN744COGABGfJchj79dsvjdlTriCbgBe95Pi++6GJA5Kfj6Kg6DeDAjPexT5K+fhgeUSEQVeDCWGAGBenuF68gA7EKACcBaQSoyQwPoSxwOScC8nB1h8vkvJ-l+siUdR8B0QxDDzsxrFfkqfoSFAZZ8BWqbCciqK7DA+xrFi3C8jCcHAAwTz6CWEDYGOE5eIoUCQIIunjgwwnaMyrI0pqYCGF4-AjLp1RRiaE7SQqQA&name=faixa)

Um `fill()` **antes de cada vértice** dá uma cor por vértice, e a GPU interpola as cores ao longo dos triângulos.

Aqui a cor vem dos vértices, e não da luz. Para iluminar uma malha própria, ela precisa de **normais** - o assunto do próximo slide.
:::
---
# `buildGeometry()`: um terreno
:::col ratio=65%
```js
let terreno;

function setup() {
  createCanvas(440, 300, WEBGL);
  noiseSeed(4);
  terreno = buildGeometry(() => {
    const n = 40, lado = 8;
    for (let j = 0; j < n; j++) {
      beginShape(TRIANGLE_STRIP);
      for (let i = 0; i <= n; i++) {
        for (const k of [j, j + 1]) {
          const x = (i - n / 2) * lado;
          const y = (k - n / 2) * lado;
          const z = 160 * noise(i * 0.09,
                                k * 0.09) - 80;
          vertex(x, y, z);
        }
      }
      endShape();
    }
  });
  terreno.computeNormals();
}

function draw() {
  background(246);
  orbitControl();
  noStroke();
  ambientLight(70);
  directionalLight(255, 245, 225, 1, 1, -0.6);
  translate(0, 30, 0);
  rotateX(1.05);
  fill(235);
  model(terreno);
}
```
:::
:::col ratio=35%
::img src="terreno.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDjXxLfT9CDXADcHA4ljMEG0KDA1xkxhQZi8AAoAJQMYCfDwKJZkATJPiGJkAFiFAAYkQxyqLxQwAOp0ABCAHEADIskkyBiEsDGADK0ygwvVnzxBOuDGEDGqZjAGCgSpg13UKH0IyZrItLHZn1k2lpwy1FoYYol-Cg5sttg1KgYlmu+gYTJxDFiQdFRJTci1GdiAGpc2yOZqY9UYIJILq9PMmRQAEoASQAggA5VV0AD6urr9ZoxuLKjjCaTGgYYDTGbHeEtEAn+cLPpjsfjib9EADvWulgYAG1YhLU7mGABGAC68-7i50-t8cCDTLH1kDjgYxTZACpeIpiQvL6uAyM716R8ZGfV8GA-MNvwvRc-18AAvIMjwANlFcCtWuHUYHvNDRQQUUAE4kR-S8SNIy9eg-XCCLZR9bHTYiY2SGB9CWOAmTgCURglOC+1IgBfYiBOgiQoErPhq14lQhNkPjJNNCRrn2J0vAsGBm3jJ4MEFPshLJCkqRpGQoH0PgAHcPSLWRqj4bRukEfRrgpQ1iiFJDJPjaowBQMhaRda4MFZaN0N1PygUCz4+DQTyJBQFUwEEVAmQAdlFSSoDAfoDNpPgMDihKUCZYp8nyCUXJKl8iolI8qolaxcLcoKXQEQx+CWJkZSlCVUqChzNCWAANJkjzw-JJMsW0AuKcpRqCtBbgGJl5MJHSOGRVFdhgfY1ixbgJRhADgAYJ59HLCBsAYdMGC8RR0qEc7LqE7Q+QFdkGHSwwvH4EZzuqDBrlsjMhJAPigA&name=terreno)

`buildGeometry()` grava tudo o que for desenhado dentro dela num único `p5.Geometry`, uma vez só, no `setup()`. No `draw()`, `model()` desenha a malha inteira de uma vez - muito mais rápido do que refazê-la a cada quadro.

`computeNormals()` calcula a direção de cada face, que é o que a luz precisa. O resultado facetado vem dela; `computeNormals(SMOOTH)` alisa.
:::
---
# Distorcer uma imagem
:::col ratio=65%
Com `textureMode(NORMAL)`, cada vértice recebe dois números a mais, `u` e `v`, de 0 a 1: **qual ponto da imagem** fica preso a ele. Movendo os vértices e mantendo `u` e `v`, a imagem se deforma junto.
```js
noStroke();
texture(foto);
textureMode(NORMAL);
rotateY(-0.5);
const t = 0;        // millis() / 1000 anima

const nx = 24, ny = 24;
for (let j = 0; j < ny; j++) {
  beginShape(TRIANGLE_STRIP);
  for (let i = 0; i <= nx; i++) {
    for (const k of [j, j + 1]) {
      const u = i / nx, v = k / ny;
      const x = (u - 0.5) * 240;
      const y = (v - 0.5) * 280;
      const z = 25 * sin(8 * u + 3 * t);
      vertex(x, y, z, u, v);
    }
  }
  endShape();
}
```
:::
:::col ratio=35%
::img src="bandeira.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQKCQGMIGGJgqFwo4UEgzGhqggAO5gbpgdRQMB8BDXfSCRy8-nzIV8SLXNBoXGGVnszmOKAagDsjgAsjAwIZYjAyeoUGTYGSvAYBnEvBL8gAGR1eODWfWG42mjQWk3W-oYO2CMQAbg4418lmuKGuYckED4hhGEG0DEsZhTKDAuL8GjMXgAFABKBjAT4eBRLMgCZKJgvlAAsjqRDEbzYYAHU6AAhADiJKLcdkUZjdIYfG5z18GGuigAkk9BDAC8TyVSaYOOABfDgcdOZ7MyKD6CfF0ufap8bTdQT6a4ZqAF4oNgBsm5kDDF1TAKDIuJQd4YMWcafBA1wAMoAdcQLAZ8SxwCgZj9AWI7XO+sjwYh-S6rcy4AHIkESuoAIIDkOfTRnwSxUAW1iOgg+ToToyq+L49KOiGKhcU4jgMGgYAYEkhhnrxACMzqOuOEACnwu4fjieK+BAcBjs+LYQCMqkNuRUb6AwBYRgwsRjhxRlyAwGmcbEADU1klmWH6yNUMCCJA4F6PMBYUESc7EXh-Z0GS4HeXONBMcOYr6YZYAmZxMV4PSylxbZ9mfFxun6Qp+K9NclgMAA2rELbGdZDCiQAuqljncVlvhmGOMW8cpLbJGOvRNSM5HccxikMCp9IFvV1gMPRjEMAAVAwz4cWlNUsQwmkDa1w2jSWk3FLYM3VVxtUMAAXqp+QTX4kAFrYx31aV5THSg4XcckMD6PBBZwC2IwtntLZmC1d2yDu1X-VxEhQO5fCeUx-3-ciqK7DA+xrFi3AtjCmnAHxBiuRA2AjZx1pQEKQjY6Z-3aDWialgwQqGF4-AjNj1QztenFQ1uQA&name=bandeira)

É a mesma grade do terreno, com textura no lugar da luz. Trocando a fórmula de `z` - ou mexendo em `x` e `y` - o retrato ondula, torce, respira.
:::
---
:::center
::img src="showcase_1.png" height=80%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBhkMBQRQwbAMMxPBiCfSEhiwBheTyGJ6GHTXNAMPgYFBmSlMlBgSkEplQa59MwAW6FSIYMFZdOusRgAHOAMfXDg4676FDXCkAQ8sYG0fAQDAAggwnhg9AwAJfm64QTQEklk5IwABefgAz5LtCyGNUzGAMFAAOIwFkafQjAAUAEoEBxxr5tPjCQBuDgcSxmCDaXn2vwaMxeOMMYCfDwKJZkATJPiGaMATgADM3JflW5KAOp0ABCIYAMrGMzIGBBrmBjABlaZQaMARnnw8+GpQSGu0es5QALG2GDu99Z57ZG5Lj6eGPP263m8vR4b1JTowB2TsMaz5ABse9fe7-kv-S8ALvWRfQgYYxwYYQGGKT9JX4IUoJg4oR1A1MaWggMg1DcN1BQKNo1LYQWDLT5ZEsDUGGjJMGDAJDmzTWi5DHRiwAAajY2NSNHFQGAo-QqJo2J6MY4S8BYhhYg4rjyx43jmXA3w4CQ6M6OsSDHBgriACpeEUa5UPk0D7Qgj1oOjYT1JkTTih0vShUMoywIggToKgScUGjOBJTdADgMc+TnN8JAkM-Bg2IYbdimbBhdK8a4AHdo3HScYFU2KGGbBB53KSVhN0rKctjM8EFsWMyKMyreN0p44GjPd53fPonH3cpbwC3ivDMSY4w6lR8IEQx+CWLzJWsEKbJ8kDKv1DAMGjEKSJbBgAH4YO3fIGGJY98mmoybjqhDhQK0riklJB4P0jKstsWy+tkeKSz2lQAF8Kre0cXrvD6sxzPMwALKBKSSmTPmqPhtG6ClrhzOcxAAYkXHL5z4MRpo1aowBQMh7Xw655um8cpzxoFes+Pg0ExiQUAHMBBFQaNd0lbdt0lb9pvc-p-vtdlafpzzinyfJJWKecGu-MasrgoD3yy8oOb5GBuYgXm6YZ18zzFkW3yy58AIQVnMoQT9prQW4BmjFMCVgb6OGRVFdhgfY1ixbhJRhEYy3NAxBEgYkGNpRR3KEf3GI+w0IDrJlgGpScvH4EZiWqDBrkhsO7ZeoA&name=showcase%201)
:::
---
:::center
::img src="showcase_2.png" height=80%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBh0QxeMD6Pg8WAMCaWGBEwwMaqeDB6CBLamGa7VBhQMx8akYMwALwmOmuGGunigXIQHHGvgmBKJGAA3BwOJYzBBtCgwNcZMYUGYvAAKACUDGAnw8CiWZAEyS5+oAnAAGB1Ihj5J0ugDqdAAQgBxAAyhsVMh0fHURP1zoY1mKADYo7GACxRlMu1MMACMaaDnxlhOJDGENLMYAwUF9MGu6hQ+hG+qNhZYJs+sm0WuGDBkReKxQdwZUDEsIoY+qlDDAhYYffHck78vHAGoF8bTSGB22IB3fEWJ445y2VBuO1oi74AFQMCgekgAfRoAEkGBf8v2B4LN759JP4wwFwxiuUDpPgwKCvgOXhmJMRpgSoNYCIY-BLPqX4Xm2hj6nwhouhmP7WAw5S9sBKAuihfiQBhho5muKj4lM-T6omv6ZrYwGGORD5EVhmaxthxRUW+DBeNcBr8SoAC+nxiVREmSBAKpqhqWrskSADuDarrI1R8No3SCPo1yqlA+piAAxBm5nlBmfBiKJIrVGAKBkFqNZCtBnwQNcADKLlAm5IZhvZEgoP6YCCKg+rFPkolCZAwWheFkX5LxCZRtYbqpYBUaZdF1yxSFYUoPq8bYcmLqJS66Vle6+FOqJ+IwNoZj8PoACyfBLJ4xIRfkUWvpMkCQBM6HxqJlilhgEWAaJaC3AM+p5nK0kcMiqK7DA+xrFi3AujCIwmgwTz6IIkDYFO85eIoUCQIIp3TjJ2jWly+1Xfi-AjKd1TCjp84ySAYlAA&name=showcase%202)
:::
---
:::center
::img src="showcase_3.png" height=80%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgAQQgAEuwIYGLAGJZnnA+CTtNcMNdPFBqUidIotGY0AxBGB9IprgwYJyUAyIPyyRyBWA4GKwJYYP0IEsEBxxr4BDBiQBuDgcSxmCDaFBga4yClSvgACl5xpZ-H0ghZJqZhhZFOMLKeRoAXgBKBjAT7VGDciAAZT08wtFAASgBJXEAOQA4gAZOgAfVDMdjNB92pk5IZDAtqoYYAYwgYAAZNWW5JWAIzFGtlgDUrb9AYLslpEGGDC0lfLACoGBQAOokdM0WNOBhNmufHsm-sjCvz2wMUeGSAWp3UrcDhit8nUmB5pfksAYDAWi2esBe48MAAsVcPO4gFr4Pr9AFIGHKAA2KsWSA-IWQATnyC9uwYZJ5SWOArWeflR1pQxvx9Fk12sXgDAdPpUI-Xcf1glR4MQ+AUONQ8MKwnDnztQjrTQvxSN-fNZAAX0+CQoHDPhI1g3jJAgPUDSNE0-A0MwvAtTtPg8BQljIARkmpC1IKrUCGHyHSWXHOgACFU3InQ6QZABZW4YAtAAJUNjPM9ViXXaozGvKAkxga51BQfQRjvP1hBYf1L0sIsSw0BhekrFtejwBhINrbp20UuDZC8MxJgUriKL6a5NCWC1elHKsEHKCCGAAbU-UrsPnFl6O6H0AF1zIos0qQtAB2d8TzKhhmygllymfUqGAAl9Gu6FkG2058hobWxOpULxrnktbRJ4kSdXE-VDWNGQoF5AB3BTwoLao+G0bpBH0a59SgC0xAAYgbT7ygbPgxHMhlqjAFAyBNAK6Tyz5RVDMGgQhgtHuKmAAA0LWsCqqvMtBbNvVzDD2iBkVRXYYH2NYsW4FkYTXYAGCee1IGwatay8RQoEgQRGZbUTtHUg8abZwwvH4EZGeqek7trUSQG4oA&name=showcase%203)
:::
---
# Recapitulando
:::col
**Espaço e transformações**
- `createCanvas(w, h, WEBGL)`
- origem no centro; `y` para baixo, `z` para fora
- câmera padrão em `z = 800`: 1 unidade = 1 pixel em `z = 0`
- `translate`, `rotateX/Y/Z`, `rotate(a, eixo)`, `scale`
- a ordem das transformações é a hierarquia da cena

**Formas**
- `plane`, `box`, `sphere`, `ellipsoid`, `cylinder`, `cone`, `torus`
- `beginShape` + `vertex(x, y, z, u, v)`
- `buildGeometry` + `model` para malhas fixas
:::
:::col
**Câmera**
- `orbitControl()` e `debugMode()` para explorar
- `camera(olho, alvo, cima)`
- `perspective(fov, ...)` e `ortho()`

**Luz**
- `lights`, `ambientLight`, `directionalLight`, `pointLight`, `spotLight`
- vale para o que vem depois; refeita a cada quadro
- sem sombras

**Material**
- `fill`, `specularMaterial` + `shininess`, `ambientMaterial`, `emissiveMaterial`
- `normalMaterial` para depurar
- `texture`, `textureMode(NORMAL)`
:::
---
# Para levar adiante
:::col
Os tutoriais que serviram de base, no site do p5.js:

- **Coordinates and Transformations**
- **Lights, Camera, Materials**
- e, na mesma série, **Custom Geometry** (`loadModel`, `buildGeometry`) e **Introduction to Shaders**, para materiais que as funções prontas não alcançam.

A foto das texturas é a *Moça com Brinco de Pérola*, de Vermeer, a mesma da aula 7.
:::
:::col
Sugestões de exploração:

- Anime o sistema solar com `millis()` e acrescente um planeta com anéis (`torus`).
- Construa uma escultura de caixas que mostre uma figura diferente de cada lado - e gire-a com `orbitControl()`.
- Use o brilho dos pixels de uma imagem como altura de um terreno.
- Coloque uma luz pontual que segue o mouse.
:::
---
:::center
# Obrigado
:::
