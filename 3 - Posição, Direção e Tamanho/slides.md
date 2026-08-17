::: center
# Programação criativa
## Aula 3 - Posição, direção e tamanho
:::
---
# O problema de hoje
Na aula passada aprendemos a desenhar **uma** forma: `circle`, `rect`, `line`...

Hoje o assunto é **onde**, **para onde** e **de que tamanho** — quando as formas são muitas e precisam ter relação umas com as outras.
:::col
- Proporções: `lerp`, `map`, `constrain`, `norm`
- Sistemas de coordenadas
- Coordenadas polares
:::
:::col
- Vetores (`p5.Vector`)
- Transformações afins
- `push()` e `pop()`
:::
---
# Cinco círculos numa reta
:::col ratio=65%
A primeira tentativa costuma ser escrever cada forma na mão.
- Funciona.
- Mas os números não dizem nada sobre a **ideia** do desenho.
- Mudar qualquer coisa exige reescrever tudo.
```js
circle(60, 75, 44);
circle(135, 75, 44);
circle(210, 75, 44);
circle(285, 75, 44);
circle(360, 75, 44);
```
:::
:::col ratio=35%
::img src="motiv_manual.png" width=100%
:::
---
# O mesmo, com um laço
:::col ratio=65%
O `for` já elimina a repetição, mas os números `60` e `75` continuam sendo "números mágicos".
- De onde saiu o `75`?
- Do fato de que 5 círculos entre 60 e 360 ficam espaçados de 75 em 75.
- Essa conta foi feita **na nossa cabeça**, não no programa.
```js
for (let i = 0; i < 5; i++) {
  circle(60 + i * 75, 75, 44);
}
```
:::
:::col ratio=35%
::img src="motiv_for.png" width=100%
:::
---
# E se forem 12? E entre dois pontos quaisquer?
:::col ratio=65%
Queremos escrever o desenho em termos de **proporções**: "o i-ésimo círculo está a uma fração `t` do caminho entre o início e o fim".
```js
let n = 12;
for (let i = 0; i < n; i++) {
  // t vai de 0 a 1
  let t = i / (n - 1);
  let x = lerp(40, 380, t);
  circle(x, 75, 34);
}
```
Trocar `n` por qualquer outro número simplesmente funciona.
:::
:::col ratio=35%
::img src="motiv_dez.png" width=100%
:::
---
# Interpolação linear: `lerp()`
:::col ratio=45%
`lerp(a, b, t)` devolve o valor que está a uma fração `t` do caminho de `a` até `b`:

$$\mathrm{lerp}(a,b,t) = a + t\,(b - a)$$

- `t = 0` devolve `a`
- `t = 1` devolve `b`
- `t = 0.5` devolve o meio
- `t` fora de `0..1` **extrapola**: `lerp(0, 10, 2)` é `20`
:::
:::col ratio=55%
::img src="lerp_ideia.png" width=100%
:::
---
# `lerp()` serve para qualquer grandeza
:::col ratio=65%
Aqui `lerp` é usado três vezes: para o `x`, para o `y` e para o diâmetro.
```js
// pontos inicial e final
let ax = 50, ay = 250;
let bx = 370, by = 60;
let n = 9;

for (let i = 0; i < n; i++) {
  let t = i / (n - 1);
  circle(lerp(ax, bx, t),
         lerp(ay, by, t),
         lerp(12, 56, t));
}
```
:::
:::col ratio=35%
::img src="lerp_circulos.png" width=100%
:::
---
# `map()`: trocar de faixa
:::col ratio=45%
`map(valor, origem1, origem2, destino1, destino2)` transporta um número de uma faixa para outra, mantendo a proporção.

É a função mais usada da aula: quase todo dado que vira desenho passa por ela.
- índice do laço → posição na tela
- temperatura → altura de uma barra
- distância → tamanho ou cor
:::
:::col ratio=55%
::img src="map_ideia.png" width=100%
:::
---
# `map()` na prática
:::col ratio=65%
Um mesmo índice `i` alimenta duas faixas diferentes: uma de posições, outra de tamanhos.
```js
let n = 10;
for (let i = 0; i < n; i++) {
  let x = map(i, 0, n-1, 40, 380);
  let d = map(i, 0, n-1, 10, 70);
  circle(x, 130, d);
}
```
Note que a faixa de origem (`0` a `n-1`) não tem nada a ver com pixels.
:::
:::col ratio=35%
::img src="map_tamanhos.png" width=100%
:::
---
# Faixa de destino invertida
:::col ratio=65%
Nada obriga `destino1` a ser menor que `destino2`. Inverter a faixa é justamente o que resolve o "y cresce para baixo" do canvas.
```js
let dados =
  [12, 30, 25, 44, 18, 37, 8];
let n = dados.length;

for (let i = 0; i < n; i++) {
  let x = map(i, 0, n,
              30, width - 30);
  // 0 embaixo, 50 em cima
  let y = map(dados[i], 0, 50,
              height - 40, 30);
  rect(x, y, 38, height - 40 - y);
}
```
:::
:::col ratio=35%
::img src="map_barras.png" width=100%
:::
---
# `constrain()`: manter dentro dos limites
:::col ratio=65%
`constrain(valor, minimo, maximo)` devolve o valor "aparado": nunca menor que `minimo`, nunca maior que `maximo`.

`map()` **extrapola** por padrão. Se o valor de entrada sair da faixa esperada, o resultado sai junto.
```js
let x = map(v, 0, 100, 110, 310);

// pode escapar da faixa
circle(x, 105, 22);

// fica preso nas bordas
circle(constrain(x, 110, 310),
       205, 22);
```
:::
:::col ratio=35%
::img src="constrain_ex.png" width=100%
:::
---
# As quatro funções são a mesma ideia
:::col
- `norm(v, a, b)` leva a faixa `a..b` para `0..1`.
- `lerp(c, d, t)` leva `0..1` para a faixa `c..d`.
- `map` é a composição das duas:
```js
map(v, a, b, c, d)
// equivale a
lerp(c, d, norm(v, a, b))
```
:::
:::col
`map()` aceita ainda um sexto argumento que já limita o resultado à faixa de destino:
```js
map(2, 0, 1, 0, 100);
// 200 — extrapolou

map(2, 0, 1, 0, 100, true);
// 100 — limitado
```
- Extrapolar é útil (movimento que continua além do fim).
- Limitar é útil (barra que não pode furar a moldura).
- O erro é não decidir qual dos dois se quer.
:::
---
:::center
::img src="nested_rects.png" height=80%
[editar](https://esperanc.github.io/p5front/?repo=https%3A%2F%2Fesperanc.github.io%2FCreativeCoding2026%2Fsketches%2F&project=nested+rects)
:::
---
:::center
# Sistemas de coordenadas
:::
---
# O que é um sistema de coordenadas
:::col ratio=45%
É o combinado que dá sentido a um par de números:
- onde fica a **origem** `(0,0)`;
- para onde apontam os **eixos**;
- qual é a **unidade** de cada eixo.

O par `(120, 70)` não significa nada sozinho — só significa alguma coisa dentro de um sistema.

No canvas do p5: origem no canto superior esquerdo, `x` para a direita, `y` **para baixo**, unidade em pixels.
:::
:::col ratio=55%
::img src="coord_sistemas.png" width=100%
:::
---
# Do "mundo" para a tela
:::col ratio=65%
Muitos desenhos são naturais em outras unidades: segundos, graus, reais, radianos.

A receita é sempre a mesma: pense no sistema que for conveniente e use `map()` para levá-lo até os pixels.
```js
for (let i = 0; i <= 200; i++) {
  // coordenada do mundo
  let x = map(i, 0, 200,
              -TWO_PI, TWO_PI);
  let y = sin(x);

  // mundo → tela
  vertex(
    map(x, -TWO_PI, TWO_PI,
        20, width - 20),
    map(y, -1.2, 1.2,
        height - 20, 20));
}
```
:::
:::col ratio=35%
::img src="grafico_funcao.png" width=100%
:::
---
# Coordenadas normalizadas
:::col ratio=65%
Um caso especial muito útil: descrever o desenho em coordenadas de `0` a `1` e só no fim decidir onde ele vai parar.

O desenho fica independente do tamanho do canvas e pode ser reaproveitado.
```js
function padrao(x0, y0, x1, y1) {
  for (let i = 0; i <= 10; i++) {
    let u = i / 10; // 0 a 1
    line(map(u, 0, 1, x0, x1), y0,
      x1, map(u, 0, 1, y0, y1));
  }
}

padrao(20, 20, 240, 240);
padrao(270, 110, 420, 240);
```
:::
:::col ratio=35%
::img src="coords_normalizadas.png" width=100%
:::
---
:::center
# Coordenadas polares
:::
---
# Quando `x` e `y` atrapalham
:::col
Como distribuir 12 marcas igualmente ao redor de um círculo usando só `x` e `y`?

Difícil: cada marca tem um par de coordenadas sem relação aparente com a anterior.

Mas em termos de **raio** e **ângulo** o problema é trivial: o raio é sempre o mesmo e o ângulo avança de um doze avos de volta por vez.
:::
:::col
Um ponto pode ser descrito por:
- **distância até a origem** (o raio `r`);
- **ângulo** em relação ao eixo `x`.

A conversão para o par `(x, y)` é:

$$x = x_c + r\cos(\theta)$$
$$y = y_c + r\sin(\theta)$$
:::
---
:::center
::img src="polar_ideia.png" height=75%
:::
---
# Distribuindo pontos num círculo
:::col ratio=65%
```js
let cx = width / 2;
let cy = height / 2;
let r = 140;
let n = 12;

for (let i = 0; i < n; i++) {
  let ang = i * TWO_PI / n;
  let x = cx + r * cos(ang);
  let y = cy + r * sin(ang);
  circle(x, y, 34);
}
```
- `sin` e `cos` esperam **radianos**: uma volta inteira é `TWO_PI`.
- `angleMode(DEGREES)` faz as funções de ângulo trabalharem em graus.
- `radians()` e `degrees()` convertem valores avulsos.
:::
:::col ratio=35%
::img src="polar_pontos.png" width=100%
:::
---
# Variando o raio
:::col ratio=65%
Como o raio é apenas mais um número, ele pode depender do índice.
```js
for (let i = 0; i < n; i++) {
  let ang = i * TWO_PI / n;

  // a cada 5 marcas,
  // um raio mais longo
  let marca = i % 5 === 0;
  let r0 = marca ? 120 : 150;
  strokeWeight(marca ? 4 : 1.5);

  line(cx + r0 * cos(ang),
       cy + r0 * sin(ang),
       cx + 170 * cos(ang),
       cy + 170 * sin(ang));
}
```
:::
:::col ratio=35%
::img src="polar_raios.png" width=100%
:::
---
# Espirais: ângulo e raio crescem juntos
:::col ratio=65%
```js
for (let i = 0; i < 260; i++) {
  let ang = i * 0.28; // ângulo
  let r = i * 0.68;   // raio
  let d = map(i, 0, 260, 3, 14);
  circle(cx + r * cos(ang),
         cy + r * sin(ang), d);
}
```
Mudar as duas constantes `0.28` e `0.68` muda completamente a espiral — vale a pena experimentar.
:::
:::col ratio=35%
::img src="polar_espiral.png" width=100%
:::
---
# `r` como função do ângulo
:::col ratio=65%
Fazendo o raio depender do ângulo por uma função periódica, saem rosáceas.
```js
beginShape();
for (let ang = 0;
     ang <= TWO_PI;
     ang += 0.01) {
  let r = 160 * cos(5 * ang);
  vertex(cx + r * cos(ang),
         cy + r * sin(ang));
}
endShape(CLOSE);
```
Troque o `5` por outros inteiros e veja quantas pétalas aparecem.
:::
:::col ratio=35%
::img src="polar_rosacea.png" width=100%
:::
---
# O caminho de volta: cartesiano → polar
:::col ratio=65%
- `atan2(y, x)` devolve o ângulo do ponto `(x, y)`. **Atenção à ordem: o `y` vem primeiro.**
- `dist(x1, y1, x2, y2)` devolve a distância entre dois pontos.
```js
// para cada ponto (x, y)
// de uma grade:
let ang = atan2(y - cy, x - cx);
let r = dist(x, y, cx, cy);
let c = map(r, 0, 200, 3, 14);

line(x, y,
     x + c * cos(ang),
     y + c * sin(ang));
```
:::
:::col ratio=35%
::img src="polar_inversa.png" width=100%
:::
---
:::center
::img src="polar_showcase.png" height=80%
[editar](https://esperanc.github.io/p5front/?repo=https%3A%2F%2Fesperanc.github.io%2FCreativeCoding2026%2Fsketches%2F&project=polar+flower)
:::
---
:::center
# Escalares e vetores
:::
---
# Escalar e vetor
:::col ratio=45%
- Um **escalar** é um número só: um raio, um ângulo, um tempo, uma espessura.
- Um **vetor**, em 2D, são dois números tomados em conjunto: quanto andar em `x` e quanto andar em `y`.

Tudo o que fizemos até agora podia ser feito com escalares soltos. Vetores são uma forma de guardar e manipular esses pares como **uma coisa só**.
:::
:::col ratio=55%
::img src="escalar_vetor.png" width=100%
:::
---
# Ponto e vetor não são a mesma coisa
:::col ratio=45%
- Um **ponto** diz *onde* algo está. Faz sentido perguntar "onde fica o ponto A".
- Um **vetor** diz *quanto e para onde*. Não tem lugar: o mesmo vetor desenhado em dois lugares continua sendo o mesmo vetor.

Operações que fazem sentido:
- ponto − ponto = vetor (`B − A` é o deslocamento de A até B)
- ponto + vetor = ponto (andar a partir de um lugar)
- vetor + vetor = vetor

Somar dois pontos, por outro lado, não significa nada.
:::
:::col ratio=55%
::img src="ponto_vetor.png" width=100%
:::
---
# A classe `p5.Vector`
:::col ratio=65%
Criada com `createVector(x, y)`. As componentes ficam em `.x`, `.y` e `.z` (a terceira existe sempre, e vale `0` em 2D).
```js
let v = createVector(120, -70);

v.x;   // 120
v.y;   // -70
v.z;   // 0

v.set(10, 20);  // muda tudo
v.array();      // [10, 20, 0]

// em p5 2.x, print aceita
// um argumento só
print(v.x);
```
:::
:::col ratio=35%
Um `p5.Vector` pode representar coisas bem diferentes, e o sentido depende do uso:
- uma **posição** (usado como ponto)
- um **deslocamento**
- uma **velocidade** ou **aceleração**
- uma **direção** (quando tem comprimento 1)
:::
---
# Soma e subtração
:::col ratio=65%
```js
let v = createVector(150, -40);
let w = createVector(60, -140);

// estáticas: devolvem
// um vetor novo
let s = p5.Vector.add(v, w);
let d = p5.Vector.sub(v, w);

// de instância: alteram v
v.add(w);
v.sub(w);
```
`v − w` é o vetor que vai da ponta de `w` até a ponta de `v`. É assim que se obtém "o caminho daqui até ali".
:::
:::col ratio=35%
::img src="vec_soma.png" width=100%
:::
---
# Multiplicação e divisão por escalar
:::col ratio=65%
```js
let v = createVector(90, -50);

p5.Vector.mult(v, 2);   // dobro
p5.Vector.mult(v, 0.5); // metade
p5.Vector.mult(v, -1);  // inverte
p5.Vector.div(v, 2);    // metade

v.mult(0.5);   // altera v
```
Multiplicar por escalar muda **o tamanho** do vetor e, se o escalar for negativo, **inverte o sentido** — mas nunca muda a reta em que ele está.
:::
:::col ratio=35%
::img src="vec_mult.png" width=100%
:::
---
# Tamanho: `mag`, `normalize`, `setMag`, `limit`
:::col ratio=65%
```js
v.mag();    // comprimento
v.magSq();  // comprimento ao
            // quadrado (evita
            // a raiz: é rápido)

v.normalize(); // comprimento 1
v.setMag(120); // fixa em 120
v.limit(50);   // encurta se
               // passar de 50
```
- `mag()` e `magSq()` apenas **consultam**.
- `normalize()`, `setMag()` e `limit()` **alteram** o vetor.
- Um vetor de comprimento 1 é chamado de **unitário**: é pura direção, pronto para ser multiplicado pelo tamanho que se quiser.
:::
:::col ratio=35%
::img src="vec_mag.png" width=100%
:::
---
# Direção: `heading`, `rotate`, `fromAngle`
:::col ratio=65%
```js
// comprimento 140,
// apontando para a direita
let v = p5.Vector.fromAngle(0);
v.setMag(140);

v.heading();   // ângulo do vetor
v.setHeading(PI / 4);
v.rotate(TWO_PI / 16);

// direção aleatória, mag 1
p5.Vector.random2D();
```
- `heading()` devolve o ângulo do vetor; `setHeading()` muda a direção mantendo o comprimento.
- `rotate()` gira o vetor de um ângulo dado.
- É a mesma ideia das coordenadas polares, empacotada em métodos.
:::
:::col ratio=35%
::img src="vec_direcao.png" width=100%
:::
---
# Produto escalar e produto vetorial
:::col ratio=65%
```js
v.dot(w);          // um escalar
v.angleBetween(w); // o ângulo
v.cross(w);        // um vetor
```
$$\mathbf{v}\cdot\mathbf{w} = |\mathbf{v}|\,|\mathbf{w}|\cos(\theta)$$

- O **sinal** do produto escalar já responde "estão apontando mais ou menos para o mesmo lado?".
- Se os dois forem unitários, `dot` é diretamente o cosseno do ângulo.
- Em 2D, `angleBetween` devolve um ângulo **com sinal**.
- `cross` em 2D devolve um vetor só com componente `z`; o sinal desse `z` diz para que lado se gira de `v` para `w`.
:::
:::col ratio=35%
::img src="vec_dot.png" width=100%
:::
---
# Outros métodos que vale conhecer
:::col
- `v.copy()` — uma cópia independente
- `v.equals(w)` — compara componentes
- `v.dist(w)` — distância entre dois pontos
- `v.reflect(n)` — reflete numa superfície de normal `n` (ricochete)
- `v.rem(x, y)` — resto da divisão, componente a componente
:::
:::col
- `p5.Vector.lerp(v, w, t)` — interpolação, exatamente como o `lerp` de números
- `p5.Vector.slerp(v, w, t)` — interpolação **pelo ângulo**, mantendo o comprimento
- `p5.Vector.fromAngle(a)` — vetor unitário num dado ângulo
- `p5.Vector.random2D()` — direção aleatória

Quase todos existem nas duas formas: de instância (altera) e estática (devolve um novo).
:::
---
# Cuidado: quem altera e quem devolve
:::col ratio=55%
```js
let v = createVector(1, 0);
let w = createVector(0, 1);

v.add(w);
// v agora é (1, 1)

let s = p5.Vector.add(v, w);
// s é novo; v não muda

// a receita segura:
let u = v.copy().normalize();
let m = v.copy().setMag(120);
```
:::
:::col ratio=45%
Esta é a fonte mais comum de bugs com vetores.
- `v.add(w)` **altera** `v`.
- `p5.Vector.add(v, w)` devolve um vetor **novo** e não mexe em `v` nem em `w`.
- Sem o `copy()`, `v` teria perdido o comprimento original.

Isso vale para `add`, `sub`, `mult`, `div`, `normalize`, `setMag`, `limit`, `rotate`, `setHeading` e `rem`.
:::
---
# Aplicação: posição, velocidade, aceleração
:::col ratio=65%
Três vetores e duas somas — a base de praticamente toda animação com movimento.
```js
let pos = createVector(30, 260);
let vel = createVector(4.2, -8);
// gravidade
let acc = createVector(0, 0.16);

for (let i = 0; i < 190; i++) {
  // acc muda a velocidade
  vel.add(acc);
  // vel muda a posição
  pos.add(vel);
  circle(pos.x, pos.y, 11);
}
```
Num sketch animado, as duas somas ficariam dentro de `draw()`.
:::
:::col ratio=35%
::img src="vec_particula.png" width=100%
:::
---
:::center
::img src="vec_campo.png" height=80%
[editar](https://esperanc.github.io/p5front/?repo=https%3A%2F%2Fesperanc.github.io%2FCreativeCoding2026%2Fsketches%2F&project=vector+field)
:::
---
:::center
# Transformações afins
:::
---
# Mover o sistema, não o desenho
:::col ratio=45%
Até agora, para pôr uma forma em outro lugar, mudávamos as coordenadas de cada ponto dela.

As transformações fazem o contrário: o desenho continua descrito do mesmo jeito, e o que se move é o **sistema de coordenadas** em que ele é interpretado.

São chamadas **afins** porque preservam retas e paralelismo: uma reta continua reta, e retas paralelas continuam paralelas.
:::
:::col ratio=55%
::img src="transform_ideia.png" width=100%
:::
---
# `translate(x, y)`
:::col ratio=65%
Desloca a origem do sistema de coordenadas.
```js
function forma() {
  rect(0, 0, 70, 45);
  circle(0, 0, 16);
}

translate(40, 40);
forma();

// a origem se move
translate(120, 60);
forma();  // outro lugar

// e se move de novo
translate(120, 60);
forma();
```
As transformações **se acumulam**: o segundo `translate` parte de onde o primeiro parou.
:::
:::col ratio=35%
::img src="t_translate.png" width=100%
:::
---
# `rotate(angulo)`
:::col ratio=65%
Gira o sistema de coordenadas **em torno da origem** — e não em torno do centro da forma.

Para girar em torno de um ponto, leve a origem até lá primeiro com `translate`.
```js
translate(width/2, height/2);

for (let i = 0; i < 9; i++) {
  rect(0, 0, 130, 40);
  rotate(TWO_PI / 9);
}
```
O ângulo é em radianos (ou graus, se você tiver chamado `angleMode(DEGREES)`). Como o eixo `y` aponta para baixo, ângulos positivos giram no sentido horário.
:::
:::col ratio=35%
::img src="t_rotate.png" width=100%
:::
---
# `scale(fator)`
:::col ratio=65%
Muda a unidade dos eixos. Com dois argumentos, `scale(sx, sy)` escala cada eixo separadamente.
```js
translate(40, 40);

for (let i = 0; i < 6; i++) {
  rect(0, 0, 50, 34);
  scale(1.35);
}
```
Repare que **a espessura do traço escala junto**: os retângulos maiores têm contorno mais grosso, mesmo sem nenhuma chamada a `strokeWeight`.
:::
:::col ratio=35%
::img src="t_scale.png" width=100%
:::
---
# `shearX()` e `shearY()`
:::col ratio=65%
Inclinam o sistema, transformando retângulos em paralelogramos.
```js
push();
translate(40, 70);
grade();     // original
pop();

push();
translate(220, 70);
shearX(0.5); // inclina em x
grade();
pop();
```
Note que o paralelismo se manteve — é isso que faz da inclinação uma transformação afim.
:::
:::col ratio=35%
::img src="t_shear.png" width=100%
:::
---
# A ordem importa
:::col ratio=65%
Transformações não comutam. Os dois trechos abaixo produzem resultados diferentes:
```js
// à esquerda
translate(60, 0);
rotate(QUARTER_PI);

// à direita
rotate(QUARTER_PI);
translate(60, 0);
```
Uma leitura que ajuda: cada transformação vale **no sistema deixado pela anterior**. No segundo caso, o `translate(60, 0)` anda 60 na direção do `x` **já girado**.
:::
:::col ratio=35%
::img src="t_ordem.png" width=100%
:::
---
# Por baixo do capô
:::col
Toda sequência de translações, rotações, escalas e inclinações equivale a uma única transformação da forma:

$$\begin{bmatrix} x' \\ y' \end{bmatrix} = \begin{bmatrix} a & c \\ b & d \end{bmatrix} \begin{bmatrix} x \\ y \end{bmatrix} + \begin{bmatrix} e \\ f \end{bmatrix}$$

Uma parte linear (a matriz, que cuida de girar, escalar e inclinar) e uma translação.
:::
:::col
O p5 mantém essa transformação corrente e oferece acesso direto a ela:
- `applyMatrix(a, b, c, d, e, f)` combina a matriz dada com a corrente.
- `resetMatrix()` devolve o sistema ao estado original do canvas.

Na prática, quase nunca se escreve a matriz na mão: `translate`, `rotate` e `scale` são mais legíveis e cobrem quase todos os casos.
:::
---
# `push()` e `pop()`
:::col ratio=45%
As transformações se acumulam e valem até o fim do `draw()`. Para aplicar uma transformação **só a um pedaço** do desenho, é preciso poder voltar atrás.
- `push()` guarda o estado atual numa pilha.
- `pop()` restaura o último estado guardado.
- Podem ser aninhados à vontade, desde que cada `push()` tenha o seu `pop()`.

Além do sistema de coordenadas, eles guardam também o **estilo**: `fill`, `stroke`, `strokeWeight`, `rectMode`, `textSize`, etc.
:::
:::col ratio=55%
::img src="pushpop_ideia.png" width=100%
:::
---
# Com e sem `push()`/`pop()`
:::col
Dentro dos dois laços que percorrem a grade, para cada célula de centro `(x, y)` e ângulo `ang`:
```js
push();          // guarda
translate(x, y);
rotate(ang);
rect(-26, -26, 52, 52);
rect(-16, -16, 32, 32);
pop();           // volta
```
::img src="pushpop_grade.png" width=68%
:::
:::col
O mesmo código sem `push()` e `pop()`: cada `translate` parte de onde o anterior deixou, os deslocamentos se somam e o desenho foge do canvas.
::img src="pushpop_sem.png" width=68%
:::
---
:::center
::img src="transform_showcase.png" height=80%
[editar](https://esperanc.github.io/p5front/?repo=https%3A%2F%2Fesperanc.github.io%2FCreativeCoding2026%2Fsketches%2F&project=transform+mosaic)
:::
---
# Recapitulando
:::col
**Proporções**
- `lerp(a, b, t)` — caminha de `a` a `b`
- `map(v, a, b, c, d)` — troca de faixa
- `constrain(v, min, max)` — apara
- `norm(v, a, b)` — normaliza para `0..1`

**Coordenadas**
- todo par de números precisa de um sistema
- polares: raio e ângulo, com `cos`/`sin`
- de volta: `atan2` e `dist`
:::
:::col
**Vetores**
- `createVector`, `add`, `sub`, `mult`, `div`
- `mag`, `normalize`, `setMag`, `limit`
- `heading`, `rotate`, `fromAngle`
- `dot`, `cross`, `angleBetween`
- de instância altera; estática devolve nova

**Transformações**
- `translate`, `rotate`, `scale`, `shearX/Y`
- acumulam, e a ordem importa
- `push()`/`pop()` delimitam o efeito
:::
---
:::center
# Obrigado
:::
