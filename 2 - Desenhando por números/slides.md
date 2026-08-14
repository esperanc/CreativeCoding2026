::: center
# Programação criativa
## Aula 2 - P5.js básico
:::
---
# Processing e seus derivados
- Plataforma de programação criativa.
- Criada por Ben Fry e Casey Reas em 2001.
- Originalmente baseada em Java
- Variante JavaScript: [p5.js](https://p5js.org)
  - Criada por Lauren Lee McCarthy em 2013.
  - Manual de referência: https://p5js.org/reference/
  - A partir de agosto de 2026: Versão 2.0
---
# Um _sketch_ p5.js
:::col
É um programa javascript comum mas com algumas funções e variáveis "mágicas" disponíveis.
- Todo _sketch_ p5.js tem pelo menos uma função chamada `setup()`
  - Esta função é executada uma única vez, no início do programa.
  - Tipicamente cria a área de desenho (_canvas_), definindo suas dimensões.
- Frequentemente tem uma função chamada `draw()`
  - Esta função é executada repetidamente, em ciclos chamados "frames".
  - Usada para implementar animações
:::
:::col
```javascript
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  circle(mouseX, mouseY, 40);
}
```
:::
---
# O Canvas
Superfície de desenho criada com a função `createCanvas(width, height, [renderer])`. 
 - width e height são as dimensões do canvas em pixels
 - renderer pode ser:
   - P2D or WEBGL. O padrão é P2D.
   - P2D é o renderer padrão baseado em 2D.
   - WEBGL permite 3D e uso de shaders. 
---
# Sistema de coordenadas
O renderer P2D usa as seguintes convenções:
- A origem (0,0) está no canto superior esquerdo do canvas.
- O eixo x cresce para a direita.
- O eixo y cresce para baixo.
No caso do renderer WEBGL o sistema de coordenadas é diferente:
- A origem (0,0,0) está no centro da tela.
- Os eixos x, y e z crescem para a direita, para cima e para fora da tela, respectivamente.
---
# Algumas primitivas de desenho 2D
- `background(cor)`: pinta todo o canvas com a cor `cor`.
- `point(x, y)`: desenha um ponto em (x, y).
- `line(x1, y1, x2, y2)`: desenha uma linha de (x1, y1) até (x2, y2).
- `rect(x, y, width, height)`: desenha um retângulo com canto superior esquerdo em (x, y), largura width e altura height.
- `ellipse(x, y, width, height)`: desenha uma elipse com centro em (x, y), largura width e altura height.
- `triangle(x1, y1, x2, y2, x3, y3)`: desenha um triângulo com vértices em (x1, y1), (x2, y2) e (x3, y3).
- `circle(x, y, diameter)`: desenha um círculo com centro em (x, y) e diâmetro diameter.
- `square(x, y, size)`: desenha um quadrado com canto superior esquerdo em (x, y) e lado size.
- `quad(x1, y1, x2,y2, x3,y3, x4,y4)`: desenha um quadrilátero com vértices em (x1, y1), (x2, y2), (x3, y3) e (x4, y4).
- `arc(x, y, width, height, start, stop, [mode])`: desenha um arco de elipse
- `bezier(x1, y1, x2,y2, x3,y3, x4,y4)`: desenha uma curva de Bézier
---
:::center
::img src="shapes.png" height=90%
[editar](https://esperanc.github.io/p5front/?repo=https%3A%2F%2Fesperanc.github.io%2FCreativeCoding2026%2Fsketches%2F&project=shapes)
:::
---
# Cores
- 1 número de 0 a 255 => Tom de cinza
- 3 números de 0 a 255 => RGB
- 4 números de 0 a 255 => RGBA
- String com especificação css:
  - Nome de cor: `yellow`, `brown`, etc
  - Hexadecimal: `#ff0000`, `#00ff00`, `#0000ff`
  - RGB: `rgb(255, 0, 0)`, `rgb(0, 255, 0)`, `rgb(0, 0, 255)`
  - RGBA: `rgba(255, 0, 0, 0.5)`, `rgba(0, 255, 0, 0.5)`, `rgba(0, 0, 255, 0.5)`
  - HSL: `hsl(0, 100%, 50%)`, `hsl(120, 100%, 50%)`, `hsl(240, 100%, 50%)`
  - HSLA: `hsla(0, 100%, 50%, 0.5)`, `hsla(120, 100%, 50%, 0.5)`, `hsla(240, 100%, 50%, 0.5)`
---
# Cor de traçado e de preenchimento
- `stroke(cor)`: define a cor de traçado
- `fill(cor)`: define a cor de preenchimento
- `noStroke()`: desabilita o traçado
- `noFill()`: desabilita o preenchimento
- `strokeWeight(espessura)`: define a espessura do traçado
---
:::center
::img src="colored_shapes.png" height=90%
[editar](https://esperanc.github.io/p5front/?repo=https%3A%2F%2Fesperanc.github.io%2FCreativeCoding2026%2Fsketches%2F&project=colored+shapes)
:::
---
# Funções mágicas
São chamadas "automaticamente" segundo certas regras. As mais comuns são:
- `setup()`: Chamada uma única vez no início.
- `draw()`: Chamada repetidamente, por padrão 60 vezes por segundo.
- `mousePressed()`: Chamada uma única vez quando algum botão do mouse é pressionado.
- `mouseReleased()`: Chamada uma única vez quando algum botão do mouse é solto.
- `mouseDragged()`: Chamada repetidamente durante o arraste do mouse com algum botão pressionado.
- `keyPressed()`: Chamada uma única vez quando alguma tecla é pressionada.
- `keyReleased()`: Chamada uma única vez quando alguma tecla é solta.
---
# Variáveis mágicas
- `windowWidth` e `windowHeight`: dimensões da janela em pixels. 
  - Tipicamente usadas para criar um canvas que se adapta ao tamanho da janela.
- `width` e `height`: dimensões da área de desenho em pixels
- `mouseX` e `mouseY`: coordenadas do mouse na área de desenho. 
- `pmouseX` e `pmouseY`: coordenadas do mouse na área de desenho no frame anterior. 
- `mouseButton.left`, `mouseButton.right`, `mouseButton.center`: verdadeiros conforme o botão de mouse pressionado.
- `key` e `keyCode`: contém a tecla pressionada na última chamada de `keyPressed()` ou `keyReleased()`.
  - `key` armazena o caractere da tecla pressionada (se for uma tecla alfanumérica)
  - `keyCode` é usado para teclas especiais (ex: `if (keyCode === UP_ARROW) ...`)
---
:::center
::img src="scribbler.png" height=80%
[editar](https://esperanc.github.io/p5front/?repo=https%3A%2F%2Fesperanc.github.io%2FCreativeCoding2026%2Fsketches%2F&project=scribbler)
:::
---
# Polígonos e linhas poligonais
:::col
- `beginShape()` inicia um polígono
- `vertex(x, y)` define os vértices
- `endShape([mode])` finaliza o polígono
- Mode pode ser: 
  - `CLOSE` para fechar o polígono
  - omita para deixar aberto
:::
:::col
```javascript
beginShape();
vertex(100, 100);
vertex(200, 100);
vertex(200, 200);
vertex(100, 200);
endShape(CLOSE);
```
:::
---
:::center
::img src="polygons.png" height=80%
[editar](https://esperanc.github.io/p5front/?repo=https%3A%2F%2Fesperanc.github.io%2FCreativeCoding2026%2Fsketches%2F&project=polygons)
:::
---
:::center
# A linguagem JavaScript
:::
---
# Variáveis
:::col
- Em JS, variáveis são declaradas com `let`
- É também possível declarar constantes usando `const`.
- Os tipos primitivos de variáveis em JS são:
  - Números: `12`, `3.14`, `Infinity`, `-Infinity`, `NaN`
  - Strings: `"hello"`, `'hello'`
  - Booleanos: `true`, `false`
  - Indefinido: `undefined`
  - Nada (objeto vazio): `null`
:::
:::col
```js
let x = 12;
let y = 3.14;
let z = Infinity;
let w = -Infinity;
let v = NaN;
let s1 = "hello";
let s2 = 'hello';
let b1 = true;
let b2 = false;
let u = undefined;
let n = null;
```
:::
---
# Expressões aritméticas
:::col
Operam sobre números e retornam números
- Operadores:
  - `+` : soma
  - `-` : subtração
  - `*` : multiplicação
  - `/` : divisão
  - `%` : módulo
  - `**` : potência
- Ordem de precedência:
  1. `**`
  2. `*`, `/`, `%`
  3. `+`, `-`
- Pode-se usar também parênteses para alterar a ordem de precedência.
:::
:::col
```js
let x = 2 + 3 * 2; // x = 8
let y = 2 * (3 + x); // y = 22
let z = 3 % 2; // z = 1
let w = 3 ** 2; // w = 9
```
:::
---
# Mostrando valores com `print()`
:::col
Para inspecionar valores enquanto programamos, o p5.js oferece a função `print()`.
- Mostra o valor no _console_ do navegador.
- É equivalente ao `console.log()` do JavaScript.
- Aceita qualquer valor: números, strings, booleanos, arrays, objetos...
:::
:::col
```js
let x = 12;
print(x);            // 12
print("pipoca");     // pipoca

print(3 + 4);        // 7
```
:::
---
# Atribuição
Uma variável pode ter seu valor alterado por uma atribuição na forma `variavel = expressao`;
```js
let x = 1;
let y = 2;
x = x + y; // x vale 3
```
Operadores podem também ser conjugados com atribuição:
```js
x += 2; // x = x + 2
x -= 1; // x = x - 1
x *= 2; // x = x * 2
x /= 2; // x = x / 2
x %= 2; // x = x % 2
x **= 2; // x = x ** 2
```
Existe ainda o operador de incremento `++` e decremento `--`:
```js
let x = 1;
x++; // x = x + 1
x--; // x = x - 1
```
---

# Expressões relacionais
:::col
Operam sobre valores e retornam booleano (`true` ou `false`)
- Operadores:
  - `==` : equivalente a (verifica apenas o valor)
  - `===` : idêntico a (verifica valor e tipo)
  - `!=` : não equivalente a (verifica apenas o valor)
  - `!==` : não idêntico a (verifica valor e tipo)
  - `>` : maior que
  - `<` : menor que
  - `>=` : maior ou igual a
  - `<=` : menor ou igual a
- Se os dois operandos são de tipos diferentes, JS tenta convertê-los para um tipo comum (exceto para `===` e `!==`)
:::
:::col
```js
1 == '1'    // true
1 === '1'   // false
42 > '10'   // true
42 < '100'  // true
```
:::
---
# Expressões lógicas
:::col
- Operadores:
  - `&&` : e
  - `||` : ou
  - `!`  : não
- Se operandos são booleanos, retornam booleanos
- Se algum operando não é booleano, JS usa avaliação de curto-circuito
  - Considera qualquer valor que não seja `false`, `0`, `""`, `null`, `undefined`, `NaN` como verdadeiro
:::
:::col
```js
let x = 2;
let y = 3;
let z = 4;

x > 1 && y < 4;  // true
x > 3 || y < 4;  // true
!(x > 1 && y < 4); // false

100 || 1; // 100
"" || 99 // 99
100 && 1; // 1
!100; // false
```
:::
---
# Strings
:::col
Sequências de caracteres, escritas entre aspas `"..."` ou `'...'`.
- `+` concatena (junta) strings.
- `.length` informa o número de caracteres.
- Índices a partir de `0`; `s[i]` acessa um caractere.
- Métodos úteis: `.toUpperCase()`, `.toLowerCase()`, `.slice()`, `.indexOf()`, `.includes()`.
:::
:::col
```js
let s = "p5.js";

s + " é divertido"; // "p5.js é divertido"
s.length;           // 5
s[0];               // "p"
s.toUpperCase();    // "P5.JS"
s.slice(0, 2);      // "p5"
s.includes("js");   // true
```
:::
---
# _Template strings_
:::col
Strings escritas entre crases `` ` `` permitem:
- Inserir valores de expressões com `${ ... }` (interpolação).
- Escrever texto em várias linhas diretamente.

Muito úteis para montar textos a partir de variáveis.
:::
:::col
```js
let nome = "Ada";
let n = 3;

// interpolação
`Olá, ${nome}!`;        // "Olá, Ada!"
`Total: ${n * 2}`;      // "Total: 6"

// várias linhas
let texto = `linha 1
linha 2`;

print(`Olá ${nome}, 
você tem ${n} projetos`);
```
:::
---
# `if`
:::col
```js
comando 1;
if (condicao) {
   comando 2;
}
comando 3;
```
Se `condicao` é verdadeira, executa 
```
comando 1
comando 2
comando 3
```
Se `condicao` é falsa, executa somente
```
comando 1
comando 3
```
:::
:::col
As chaves `{}` servem para agrupar comandos em blocos. 
- Se um bloco contiver apenas uma instrução, as chaves são opcionais.
```js
let x = 1, y = 2, z = 4;
if (x < y) {
  z = 3;
}
// z é igual a 3
```
Pode ser simplificado como
```js
let x = 1, y = 2, z = 4;
if (x < y) z = 3;
// z é igual a 3
```
:::
---
# `if` e `else`
:::col
```js
comando 1;
if (condicao) {
   comando 2;
} else {
   comando 3;
}
comando 4;
```
Se `condicao` é verdadeira, executa
```
comando 1
comando 2
comando 4
```
Se `condicao` é falsa, executa
```
comando 1
comando 3
comando 4
```
:::
:::col
```js
let x = 1, y = 2, z;
if (x < y) z = 3;
else z = 4;
// z é igual a 3
```

```js
let x = 3, y = 2, z;
if (x < y) z = 3;
else z = 4;
// z é igual a 4
```
:::
---
:::center
::img src="circle_paint.png" height=80%
[editar](https://esperanc.github.io/p5front/?repo=https%3A%2F%2Fesperanc.github.io%2FCreativeCoding2026%2Fsketches%2F&project=circle+paint)
:::
---
# Blocos e escopo
:::col
- Chaves `{}` agrupam vários comandos num único bloco.
- Variáveis declaradas com `let` ou `const` dentro de um bloco só existem dentro dele.
  - Isto se chama _escopo de bloco_.
- Fora do bloco, essas variáveis não são visíveis.
:::
:::col
```js
let x = 1;
{
  let y = 2;
  x = x + y; // x é igual a 3
}
// aqui dentro, y não existe mais
print(x); // 3
```
:::
---
# Repetição com `while`
:::col
Repete um bloco de comandos enquanto uma condição for verdadeira.
```js
while (condicao) {
  comandos;
}
```
- A `condicao` é testada antes de cada repetição.
- Se nunca se tornar falsa, o laço não termina (_loop_ infinito).
:::
:::col
```js
// desenha linhas verticais a cada 20 pixels
let x = 0;
while (x < width) {
  line(x, 0, x, height);
  x = x + 20;
}
```
:::
---
# Repetição com `for`
:::col
Forma compacta de laço que reúne inicialização, condição e atualização.
```js
for (inicio; condicao; passo) {
  comandos;
}
```
- `inicio`: executado uma vez, antes de tudo.
- `condicao`: testada antes de cada repetição.
- `passo`: executado ao fim de cada repetição.
:::
:::col
```js
// mesmo resultado do while anterior
for (let x = 0; x < width; x = x + 20) {
  line(x, 0, x, height);
}
```
:::
---
:::center
::img src="gray_grid.png" height=80%
[editar](https://esperanc.github.io/p5front/?repo=https%3A%2F%2Fesperanc.github.io%2FCreativeCoding2026%2Fsketches%2F&project=gray+grid)
:::
---
# Funções
:::col
Agrupam comandos sob um nome, podendo receber _parâmetros_ e _retornar_ um valor.
- Declaradas com a palavra `function`.
- `return` devolve um valor e encerra a função.
- Funções _seta_ (`=>`) são uma forma mais curta de escrevê-las.
:::
:::col
```js
function media(a, b) {
  return (a + b) / 2;
}

let m = media(4, 10); // m = 7

// função seta equivalente
const media2 = (a,b) => (a + b) / 2;

media2(4,10); // 7
```
:::
---
# Funções embutidas
- Trigonométricas: `sin()`, `cos()`, `tan()`, `atan2()`, `sqrt()`
  - Note que funções trigonométricas assumem ângulos em radianos. Para converter graus para radianos, use `radians(angulo)`.
  - Também estão definidas constantes trigonométricas como `PI`, `HALF_PI`, `TWO_PI` e `TAU`.
- Conversão de ângulos: `radians()`, `degrees()`
- Logarítmicas e exponenciais: `log()`, `exp()`, `pow()`
- Arredondamento: `round()`, `floor()`, `ceil()`
- Valor absoluto: `abs()`
- Máximo e mínimo: `max()`, `min()`
- Aleatórios: `random()`, `noise()`
- Distância euclidiana: `dist()`
- Proporções: `map()`, `constrain()`, `lerp()`
---
:::center
::img src="random_flowers.png" height=80%
[editar](https://esperanc.github.io/p5front/?repo=https%3A%2F%2Fesperanc.github.io%2FCreativeCoding2026%2Fsketches%2F&project=random+flowers)
:::
---
# Arrays
:::col
Uma lista _ordenada_ de valores.
- Criados com colchetes `[]`.
- Cada elemento tem um índice, começando em `0`.
- `.length` informa quantos elementos há.
- `.push()` acrescenta ao fim; `.pop()` remove do fim.
- Podem ser percorridos com `for ... of`.
:::
:::col
```js
let cores = ["red", "green", "blue"];

cores[0];      // "red"
cores.length;  // 3

cores.push("yellow"); // adiciona ao fim
cores[3];      // "yellow"

for (let cor of cores) {
  print(cor);
}
```
:::
---
# Array destructuring
:::col
Extrai valores de arrays para variáveis individuais de forma concisa.
:::
:::col
```js
let cores = ["vermelho", "verde", "azul"];

// sem destructuring
let c1 = cores[0];
let c2 = cores[1];
let c3 = cores[2];

// com destructuring
let [c1, c2, c3] = cores;

c1;      // "vermelho"
c2;      // "verde"
c3;      // "azul"
```
:::
---

# O operador spread (`...`)
:::col
- Expande um array (ou objeto) em seus elementos individuais. 
- Permite passar argumentos de um array para uma função. 
:::
:::col
```js
let a1 = [1,2,3];
let a2 = [...a1, 4, 5]; // a2 é [1, 2, 3, 4, 5]

let args = [0, 100, 20, 30];
line(...args) // desenha uma linha de (0, 100) até (20, 30)
:::
---
:::center
::img src="non_overlapping_flowers.png" height=80%
[editar](https://esperanc.github.io/p5front/?repo=https%3A%2F%2Fesperanc.github.io%2FCreativeCoding2026%2Fsketches%2F&project=non_overlapping_flowers)
:::
---
# Objetos
:::col
Agrupam valores nomeados como pares `chave: valor`.
- Criados com chaves `{}`.
- Acessa-se um valor por `objeto.chave` ou `objeto["chave"]`.
- Servem para representar dados estruturados.
- Podem conter outros objetos e arrays.
:::
:::col
```js
let ponto = { x: 10, y: 20 };

ponto.x;      // 10
ponto["y"];   // 20
ponto.x = 15; // altera o valor

// objetos podem ser aninhados
let circulo = {
  centro: { x: 0, y: 0 },
  raio: 50,
};

circulo.centro.x; // 0
```
:::
---
:::center
::img src="non_overlapping_animated_flowers.png" height=80%
[editar](https://esperanc.github.io/p5front/?repo=https%3A%2F%2Fesperanc.github.io%2FCreativeCoding2026%2Fsketches%2F&project=non_overlapping_animated_flowers)
:::
---
:::center
# Obrigado
:::