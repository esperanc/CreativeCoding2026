::: center
# Programação criativa
## Aula 10 - Shaders
:::
---
# Shaders

Até aqui, todo desenho foi feito pela CPU: um laço percorre pixels, formas ou agentes, **um de cada vez**, e você manda desenhar.

Um **shader** é um programa que roda na placa de vídeo e calcula a cor de **um** pixel. A GPU executa esse mesmo programa para todos os pixels **ao mesmo tempo**.

A mudança não é de velocidade, é de **ponto de vista**: em vez de descrever um percurso, você descreve uma **função**.

Vemos aqui o suficiente de GLSL para ler e corrigir um shader, e o assunto principal é o que dá para fazer com isso - inclusive junto com uma IA. O pipeline gráfico em detalhe e os campos de distância estão na aula **7 - Shaders** de Computação Visual.
---
# Roteiro
:::col
- **Pensar em paralelo** - o modelo mental, e o que ele proíbe
- **A linguagem GLSL** - tipos, classes de variáveis, o vocabulário
- **As três portas** - filtros, hooks e o shader inteiro
:::
:::col
- **Escrevendo com uma IA** - o que pedir, o que conferir, o que corrigir
- **Depuração visual** - como enxergar o que o código está fazendo
:::

A referência de base é o tutorial **Intro to GLSL** do p5.js, mais a documentação de `createFilterShader`, `createShader` e dos *shader hooks*.
---
:::center
# Pensar em paralelo
:::
---
# O laço que não existe
:::col ratio=42%
Na aula 7 percorremos a imagem assim:
```js
for (y...) {
  for (x...) {
    // calcula a cor
  }
}
```
Um shader elimina os dois laços. Você escreve só o **miolo**, e a pergunta muda de forma:

- antes: *"para cada pixel, faça isto"*
- agora: *"dado este pixel, qual é a cor?"*

É a diferença entre uma receita e uma fórmula.
:::
:::col ratio=58%
::img src="paralelo.png" width=100%
:::
---
# As três regras do paralelo
:::col
Como todos os pixels são calculados ao mesmo tempo, três coisas deixam de existir:

**1. Não há ordem.** Nenhum pixel é calculado antes ou depois de outro. Não dá para "desenhar por cima".

**2. Não há vizinhos.** Um pixel não sabe o que o pixel ao lado decidiu. Para olhar a vizinhança, é preciso ler uma **textura** já pronta.

**3. Não há memória.** Cada execução começa do zero. Não existe variável que sobreviva de um pixel para o outro, nem de um quadro para o outro.
:::
:::col
Parece uma lista de limitações, e é. Mas é também o que torna o shader rápido: sem ordem, sem vizinhos e sem memória, nada precisa esperar por nada.

O que sobra é um conjunto bem pequeno de entradas:

- a **posição** do pixel;
- valores **iguais para todos os pixels**, mandados pela CPU - os *uniforms*;
- valores **interpolados** entre os vértices - os *varyings*;
- **texturas**, que você pode amostrar em qualquer ponto.

Saber que só isso existe é metade do trabalho de pedir um shader a alguém - humano ou não.
:::
---
# As três portas do p5
:::col ratio=42%
O p5.js 2 oferece três maneiras de usar um shader, e elas custam esforços muito diferentes.

**Filtro** - você escreve só a cor final a partir da imagem do canvas. É a porta mais barata.

**Hook** - você substitui **um pedaço** do shader que o p5 já usa, deixando luz, material e câmera no lugar.

**Shader próprio** - você escreve os dois programas inteiros e assume tudo.

A ordem desta aula é essa, e a recomendação é essa: comece pela porta mais barata que resolva o problema.
:::
:::col ratio=58%
::img src="tres_portas.png" width=100%
:::
---
:::center
# A linguagem GLSL
:::
---
# O que é GLSL
:::col ratio=45%
**GL Shading Language**: uma linguagem à parte, parecida com C, que **não roda no navegador**. O código vai como **texto** para o driver de vídeo, que o compila na hora, para aquela placa.

É por isso que um shader no p5 mora dentro de uma *template string*, e é por isso que um erro de sintaxe só aparece quando o sketch roda.

Todo shader tem uma declaração de **precisão** e uma função `main()` que não recebe nem devolve nada: ela **escreve numa variável global**.

- o vertex shader escreve `gl_Position`
- o fragment shader escreve `gl_FragColor`
:::
:::col ratio=55%
```glsl
// lowp, mediump ou highp
precision highp float;

void main() {
  gl_FragColor =
    vec4(1.0, 0.4, 0.1, 1.0);
}
```
**Duas versões convivem.** WebGL 1 usa GLSL ES 1.00; WebGL 2 usa GLSL ES 3.00, que troca `varying`/`attribute` por `in`/`out` e `gl_FragColor` por uma saída declarada.

O p5.js 2 aceita as duas e define macros (`IN`, `OUT`, `TEXTURE`) que funcionam nos dois casos. Nesta aula usamos GLSL ES 1.00, que é o que você vai encontrar na maior parte do código pronto.
:::
---
# Os dois programas
:::col ratio=45%
Um shader completo são **dois** programas que trabalham em sequência.

O **vertex shader** roda uma vez por vértice e decide **onde** cada ponto cai na tela.

O **fragment shader** roda uma vez por pixel coberto e decide **qual cor** ele tem.

Os dois são compilados juntos: um *shader program* exige o par. No p5, `createFilterShader()` e os hooks escondem um deles, mas ele está sempre lá.

Em programação criativa, quase todo o trabalho está no fragment shader. O vertex costuma ser o padrão, copiado sem cerimônia.
:::
:::col ratio=55%
::img src="dois_programas.png" width=100%
:::
---
# As três classes de variáveis
:::col ratio=46%
Tudo o que entra num shader cai em uma de três categorias, e a diferença entre elas é **o que varia**.

**`uniform`** - vem da CPU e vale o mesmo para **todos** os vértices e todos os pixels do desenho. É o canal normal para tempo, tamanho do canvas, cores, texturas.

**`attribute`** - vem da CPU e tem um valor **por vértice**. Só existe no vertex shader. É a geometria: posição, normal, coordenada de textura.

**`varying`** - é escrito pelo vertex shader e lido pelo fragment shader, já **interpolado** entre os três vértices do triângulo. É o único caminho do primeiro programa para o segundo.
:::
:::col ratio=54%
::img src="classes_var.png" width=100%
:::
---
# Tipos
:::col ratio=46%
| tipo | o que é |
|---|---|
| `float` | número real |
| `vec2` `vec3` `vec4` | vetores de 2, 3 e 4 floats |
| `mat2` `mat3` `mat4` | matrizes quadradas |
| `bool` `int` | booleano e inteiro |
| `ivec2` ... | vetores de inteiros |
| `sampler2D` | uma textura |

Vetores e matrizes operam **componente a componente**, sem laço: `a + b`, `a * 0.5`, `mat * v`.
:::
:::col ratio=54%
**A regra que mais pega gente**

GLSL é estritamente tipada e **não converte nada sozinha**. `1` é um `int` e `1.0` é um `float`; misturar os dois é erro de compilação.
```glsl
float x = 1;       // ERRO
float y = 1.0;     // ok
vec3 c = vec3(1);  // ERRO
vec3 d = vec3(1.); // ok

// converta na mão:
float n = float(i);
int   k = int(n);
```
Metade dos erros de compilação de um shader recém-escrito - por você ou por uma IA - é um ponto faltando.
:::
---
# `vec`: coordenadas, cores e swizzle
:::col ratio=45%
Um `vec4` não tem um significado fixo: pode ser um ponto, um vetor, ou uma cor. Por isso os componentes têm **três conjuntos de nomes**, intercambiáveis:

- `x`, `y`, `z`, `w` - geometria
- `r`, `g`, `b`, `a` - cor
- `s`, `t`, `p`, `q` - textura

Cores em GLSL vão de **0 a 1**, não de 0 a 255.

Pondo vários nomes depois do ponto - o **swizzle** - você monta vetores novos em qualquer ordem, e isso vale também do lado esquerdo de uma atribuição.
:::
:::col ratio=55%
```glsl
vec4 v = vec4(1., 2., 3., 1.);

float a = v.x;   // 1.0
float b = v.g;   // 2.0
vec2  u = v.rg;  // (1., 2.)
vec3  w = v.zyx; // (3.,2.,1.)

// construtores
vec3 cinza = vec3(0.5);
vec4 cor = vec4(cinza, 1.0);

// swizzle à esquerda
cor.rgb *= 0.8;
cor.a = 1.0;
```
`vec3(0.5)` preenche os três componentes; `vec4(v3, 1.0)` concatena. São os dois atalhos que mais aparecem.
:::
---
# As funções embutidas
:::col
A biblioteca padrão é pequena e é a mesma em qualquer GPU. Estas são as que realmente aparecem:

| função | serve para |
|---|---|
| `mix(a, b, t)` | interpolar, como o `lerp` |
| `clamp(x, a, b)` | prender numa faixa |
| `step(a, x)` | corte duro |
| `smoothstep(a, b, x)` | corte suave |
| `fract(x)` | parte fracionária: repete |
| `abs`, `floor`, `mod`, `pow` | como no p5 |
:::
:::col
| função | serve para |
|---|---|
| `length(v)` | distância até a origem |
| `distance(a, b)` | distância entre pontos |
| `normalize(v)` | vetor de comprimento 1 |
| `dot(a, b)` | projeção, e brilho de cinza |
| `cross(a, b)` | normal de um plano |
| `texture2D(t, uv)` | ler uma textura |

Todas aceitam vetores e trabalham componente a componente.

`smoothstep` e `fract` são as duas que mais rendem: uma faz bordas limpas, a outra faz padrões que se repetem.
:::
---
# O que o p5 já declara
:::col ratio=50%
Quando você escreve um shader para o p5, uma parte dos nomes já vem preenchida. Não os declare de novo, e não os renomeie.

**Attributes** (vertex shader)

| nome | o que é |
|---|---|
| `vec3 aPosition` | posição do vértice |
| `vec3 aNormal` | normal do vértice |
| `vec2 aTexCoord` | coordenada de textura |
| `vec4 aVertexColor` | cor por vértice |
:::
:::col ratio=50%
**Uniforms**

| nome | o que é |
|---|---|
| `mat4 uModelViewMatrix` | modelo e câmera |
| `mat4 uProjectionMatrix` | projeção |
| `mat3 uNormalMatrix` | transforma normais |
| `sampler2D tex0` | o canvas, nos filtros |

Os nomes exatos estão em **webgl_mode_architecture.md**, nos documentos de contribuição do p5.js. Vale manter a página aberta quando você estiver conferindo um shader que veio pronto.
:::
---
# Onde o pixel está
:::col ratio=65%
A coordenada que o fragmento recebe, `vTexCoord`, vai de **0 a 1** nos dois eixos - e não em pixels.
```glsl
vec2 uv = vTexCoord;
// uv.x: 0 na esquerda, 1 na direita
// uv.y: 0 em cima,     1 embaixo
```
Isso é bom: o shader fica independente do tamanho do canvas. Mas traz uma pegadinha constante.

Se o canvas não for quadrado, um círculo desenhado com `length(uv - 0.5)` sai **ovalado**, porque uma unidade em `x` não mede o mesmo que uma unidade em `y`.

A correção é sempre a mesma, e é a primeira coisa a conferir num shader que veio pronto:
```glsl
uniform vec2 uTamanho;
// ...
vec2 p = uv - 0.5;
p.x *= uTamanho.x / uTamanho.y;
float d = length(p);
```
:::
:::col ratio=35%
::img src="coordenadas.png" width=100%
:::
---
:::center
# A porta mais barata: filtros
:::
---
# `createFilterShader()`
:::col ratio=65%
Um filtro recebe o canvas já desenhado como textura e devolve uma cor. Você não escreve vertex shader nenhum: o p5 cuida disso.
```js
const SRC = `
precision highp float;
varying vec2 vTexCoord;
uniform sampler2D tex0;

void main() {
  vec2 uv = vTexCoord;
  vec4 c = texture2D(tex0, uv);
  float g = dot(c.rgb,
    vec3(0.222, 0.707, 0.071));
  gl_FragColor = vec4(vec3(g), 1.0);
}`;

let filtro;

function setup() {
  createCanvas(420, 300, WEBGL);
  pixelDensity(1);
  filtro = createFilterShader(SRC);
}

function draw() {
  background("#f0ead6");
  cena();
  filter(filtro);
}
```
:::
:::col ratio=35%
::img src="filtro_cinza.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMADKACUyAxhAwAAYcLz9bRgQxgXFMMCCJBeBiWDDXPgoADcHGSBhGkEEDGSMG0xTFFHgZGu130UH5EDMEDAlgVaD8fDQXnG+mKRAYSzgAAZlQLrmAoAx3hAABQASgYwE+4slDDMyTJ0tl8sVytk7oALDofSaUGZ+ob7SbTUjPclHYGOVyeQxReSoNcUPbtAh9IJqkjPkGJeV7aaysVigmqwB2U31usIJsARkdyc+ggwAH0AGL6PiCOVc-Q+kP290VwSOhNt1tdiAAXwpFog418ljAGBQ+mu68squ0KEZMmMka8Tpdnw8CiWZAEgsM9uDxXjDHKpo-AHU6AAhABxAAZJdZC8MA4AGIgJAZUZ7Q7FNt13fcfTvHkYH7Hcln0Ak9FgfR7WJMgl2XDgOCPCATzPBgoCHAB3a9XRkBhqj4bRukEfdVSge0xAAYksU0FCgAA2MQwJ0CQ+CdJDsJgQjkL3a5SPIiBKOopltGkpjPgga4CWUoFZM+HVqjACQUGAllUHtABOfJJKgMBaVPXE+AwazWVzYp8nyBNimDUSAvKWsGGsKtgxbfzwsQz4vDMSYTJYvcBEMfglntaxGzrOtJP3TQlgADSyqtHN5PocwwqhKwQUTJOQjA+JAfjimqfJLCgOyJIqm44AQttTUkrxrivYbEqQZLZFSvEMpgeyP3fPKUwKjCSoihBg2TSrCpgGqq3KBqdyagSYGKUTQr4HrjQVRL7XyWwAq2lMRrG5UyMkCBkVRXYYH2NYsW4BMYRGF1bQMQRIGwBhzQYLxFGcoRodhj7tCfPhDDB5zDD1PgRmh6ouQ4iqPpAZcgA&name=filtro%20cinza)

Dois nomes a decorar: `tex0` é o canvas como textura, `vTexCoord` é a posição do pixel. Com esses dois, metade dos efeitos de imagem já cabe.
:::
---
# Deformar antes de amostrar
:::col ratio=65%
O pulo do gato dos filtros: em vez de mudar **a cor** que você leu, mude **o lugar de onde** você lê.
```js
const SRC = `
precision highp float;
varying vec2 vTexCoord;
uniform sampler2D tex0;

void main() {
  vec2 uv = vTexCoord;
  uv.x += 0.035 * sin(uv.y * 28.0);
  uv.y += 0.02 * cos(uv.x * 20.0);
  vec4 c = texture2D(tex0, uv);
  gl_FragColor = vec4(c.b, c.r,
                      c.g, 1.0);
}`;
```
Duas linhas de deslocamento e uma troca de canais. Nenhuma delas sabe o que está sendo desenhado - o filtro funciona igual sobre qualquer cena.
:::
:::col ratio=35%
::img src="filtro_onda.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMADKACUyAxhAwAAYcLz9bRgQxgXFMMCCJBeBiWDDXPgoADcHGSBhGkEEDGSMG0xTFFHgZGu130UH5EDMEDAlgVaD8fDQXnG+mKRAYSzgAAZlQLrmAoAx3hAABQASgYwE+4slDDMyTJ0tl8sVytkXoQcAYAGpyaaEKbyvkGAAqPyQe3BkYJhjFWzRx2Bz3JBBpiMMKOmqWJnGGFP50OJ4olnNuiUAFh0PpNKDM-UN9pNpqReYbMgYggwAH0AGL6PiCOVc-Q+91N+3aBDVfsr-RIz4qHe7veyFeCfsARmzyoAvhSLRBxr5LGAMCh9Ndr5ZVdoUIyZMYO14nS7Pg8BQljIARBUrJs637cpTT7BgAHU6AAIQAcQAGUHWQvDAOABiICQGVGe1j0wjkHyfa4fSAnkYHHciYH0Ak9FgfR7WJMhB3PDgODfCAPy-BgoCnAB3f9XSHao+G0bpBGfVUoHtMQAGJLFNBQoAANjEUjtAkPgnVze9HwY+0jIozjuIgXj+KZXSIH051xNkCBrgJCigQMz4dWqMAJBQNCWVQe0AE58lIqAwFpT9cT4DAAtZFB7WKfJ8n7Yomw0tLymKftrCjJt+yjVKGGsEjcy8MxJk8ocnwEQx+CWe1rAAdjgtrSOfTQlgADSaoqcz6a4upgKh7SjDTSKMjBFJAJTimqfJLCgYLtN5BgbjgYjj1NUivGuP9dsqpBqtkWq8QamAQrgqDiw6oaaN6vKECbAbOpo0ao3KSaH2m5SYGKDTsr4VbjQVSr7XyWw0pe8r9uqrjJAgZFUV2GB9jWLFuH7GE02AW0DEESBsGLNavEUCKhGJ80GAR7QwL4QwXUE+k9T4EZieqLlpLWhGQHPIA&name=filtro%20onda)

Essa ideia - **perturbar a coordenada** - é a base de quase todo efeito de distorção, e reaparece em todos os níveis desta aula.
:::
---
# O mesmo efeito, dos dois lados
:::col ratio=65%
Na aula 7, um duotone percorrendo `pixels` na CPU:
```js
f.loadPixels();
const px = f.pixels;
for (let i = 0; i < n; i += 4) {
  const g = 0.222 * px[i]
          + 0.707 * px[i + 1]
          + 0.071 * px[i + 2];
  const t = g / 255;
  px[i] = lerp(24, 240, t);
  // ...
}
f.updatePixels();
```
O mesmo efeito como filtro:
```glsl
void main() {
  vec2 uv = vTexCoord;
  vec4 c = texture2D(tex0, uv);
  float t = dot(c.rgb,
    vec3(0.222, 0.707, 0.071));
  vec3 a = vec3(0.09, 0.15, 0.36);
  vec3 b = vec3(0.94, 0.80, 0.59);
  gl_FragColor =
    vec4(mix(a, b, t), 1.0);
}
```
:::
:::col ratio=35%
Repare no que sumiu: o laço, o índice, o `updatePixels()`.

E no que mudou de escala: as cores agora vão de **0 a 1**, não de 0 a 255.

O corpo da conta - os mesmos três pesos, o mesmo `mix` - é idêntico. O que muda é tudo o que está **em volta** dele.
:::
---
:::center
# Modificar em vez de escrever
:::
---
# Shader hooks
:::col ratio=65%
Escrever um shader inteiro significa reimplementar luz, material, textura e câmera - tudo o que o p5 já faz bem.

Os **hooks** do p5.js 2 resolvem isso: você substitui **uma função** dentro do shader que o p5 já usa, e o resto continua funcionando.
```js
const TOM = `(vec4 c) {
  c.rgb *= vec3(1.25, 0.85, 0.6);
  return c;
}`;

let meu;

function setup() {
  createCanvas(340, 300, WEBGL);
  const base = baseMaterialShader();
  meu = base.modify({
    "vec4 getFinalColor": TOM,
  });
}

function draw() {
  background(246);
  orbitControl();
  shader(meu);
  ambientLight(90);
  directionalLight(255, 246, 232,
                   -0.4, 0.5, -1);
  noStroke();
  fill("#c9ccd2");
  rotateX(-0.4);
  rotateY(0.5);
  sphere(96);
}
```
Esse é, de longe, o melhor ponto de entrada: o efeito é seu, a infraestrutura é do p5.
:::
:::col ratio=35%
::img src="hook_cor.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMCgkACyDGEDAABgAKZIwbQAFh0AEoGMBPtoEPpBNUGAAqMk07TlSkARjK+SRDAADAhbOKpQgAGyMgDcn36KDM+hk2lVEAAvuTdRxxr51GYjRBLGYINoUGBcX4NGYvJTmayZDp+nwlmQBMk+IZKeU6ZKJeVJaGGAB1OgAIQA4gAZFVs3H46oBmCkhgZ4xE70wTx8DAAZT0sH0rt1sjN2dzMAQaFuYEsI0p7pUDDEAoZgg0ADFIMWyNcMNd9GJsATiUjPnqU-qOBwrTa7Q6oPo+AB3V0sz4Z7TdQT6a7WqCU4p0pXVhjj6pgFAjiAoE8YKufSaKQuUs0L2R8NB7wkFBEzAQRUEpABOSU-wYKAwH6W17QgYtQPAlAL3yOVLwVCVinKYpZw9TsSNI2RrGlOkJWlOVrGFWCIGuEsX2uIF3w9SwwAwN8xAAYm0SDtCiYoxFgk9NCWAANSkKIQOkxOuCSYCoSkaNgwwvCmfooOvDg9Q4ZFUV2BsDkMLFuAlGERhZBgnk5SAp0lZUGC8RR4KERznP0m0-QDGz4I0-gRinaox0PLyDL1IA&name=hook%20cor)
:::
---
# O catálogo de hooks

| shader base | o que ele pinta |
|---|---|
| `baseMaterialShader()` | superfícies com luz e material |
| `baseColorShader()` | preenchimento chapado, sem luz |
| `baseStrokeShader()` | traços e contornos |
| `baseFilterShader()` | filtros de tela cheia |

Os pontos que dá para substituir, no `baseMaterialShader()`:

| vertex | fragment |
|---|---|
| `void beforeVertex` | `void beforeFragment` |
| `Vertex getObjectInputs` | `Inputs getPixelInputs` |
| `Vertex getWorldInputs` | `vec4 combineColors` |
| `Vertex getCameraInputs` | `vec4 getFinalColor` |
| `void afterVertex` | `void afterFragment` |

`shader.inspectHooks()` imprime essa lista no console, para o shader que estiver na mão. É a resposta certa quando uma IA inventa um nome de hook que não existe.

Para levar um valor do vertex ao fragment, declare-o nos dois lados com `vertexDeclarations: "OUT float vAltura;"` e `fragmentDeclarations: "IN float vAltura;"` - `OUT` e `IN` são macros do p5 que funcionam em WebGL 1 e 2.
---
# Mexer na geometria
:::col ratio=65%
Os hooks de vertex recebem e devolvem a estrutura `Vertex`, com `position`, `normal`, `texCoord` e `color`. Mexer na posição ali deforma a malha **na GPU**, sem tocar no `p5.Geometry`.
```js
const ONDA = `(Vertex v) {
  // posição em espaço de objeto:
  // a esfera aqui tem raio 1
  float f = v.position.y * 8.0 - uT;
  v.position *= 1.0 + 0.14 * sin(f);
  return v;
}`;

const tempo = () => millis() / 1000;

let onda;

function setup() {
  createCanvas(340, 320, WEBGL);
  const base = baseMaterialShader();
  onda = base.modify({
    uniforms: {
      "float uT": tempo,
    },
    "Vertex getObjectInputs": ONDA,
  });
}

function draw() {
  background(246);
  orbitControl();
  shader(onda);
  ambientLight(90);
  directionalLight(255, 246, 232,
                   -0.4, 0.5, -1);
  noStroke();
  fill("#3b74e8");
  rotateX(-0.4);
  rotateY(0.5);
  sphere(72, 72, 48);
}
```
:::
:::col ratio=35%
::img src="hook_vertices.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMEgAOSIAEEGMIGAADAAUADUYPolnAGMkAJQMYCfCIMLzXQxgADnAGPrgwYGgxYYvHwBaLYAxrtVYhprtguY4GFoJpYGVo+ABHMxgBhLCX6Z6igCMn0sGGufF8lnJLIQvP5KDAuIQIwYACoGLYEAAGBjWBhmCgAbk+yVdfLAHtxfopluDDAA1AwgwhLQAWP1+SDUyys6MyPoaMz6GTJMsAX0pZY4OLxvlNvOd1PZwhYDDQYAwSUMXacDEtQYnTYg418uKgfCnljMEG0iZkxhQZi8I855Y8CiWZAEyT4w-KuaDSIY5WKl4YAHU6AAhADiABlS58W-jqqeYM7f2MABZB0GTAPgMAAZT0WB9C7MtZDnLQKUAmAEDQW4wEsEZqV3FRwwgLDrn0NAwg5T58LEW17V8CMxGwE1xV5JEKIYOsWPLWQxHpRl4AYQQNBIJUYFXABJbILHWBiiVJDjZDrT8IDrDgOCXFc1wYKBzQAdx3T5f20bpBH0a5lygalilzAA2RTEP0aoEzIXEUBMjB4M+SZFAZakkNszU0AciQUDfMBBFQakAE4gz8qAwH6VdPQgCCQrClALPyfIr0sqyspvOT8IKwqVGsbNcyvbNMtDS0-Iga5IJc64gXc8tLAHNyxAAYnKaoAHZcxgewQD8kzNCWAANakSoQXNhuuUaYCoakKr8qUpn6akeuKK9NqvXNbEU5SIGRVFdjQg5DCxbgrxhH1gD7AxBEgBig0jHlFFioRntew7tGPU8OU0sApX4EYGOqO1DO+jgQDrIA&name=hook%20vertices)

A malha continua sendo uma `sphere()` comum. A onda existe só durante o desenho - nenhum vértice foi alterado na memória.

Atenção ao espaço: `v.position` está em **coordenadas de objeto**, antes das transformações. A esfera do p5 tem raio **1** ali, qualquer que seja o argumento de `sphere()`. Deslocamentos em pixels explodem a malha; use fatores relativos.

A `normal` não é recalculada sozinha. Para a luz acompanhar a deformação, ajuste `v.normal` no mesmo hook.
:::
---
# Uniforms no `modify()`
:::col ratio=65%
O campo `uniforms` declara e alimenta as variáveis que vêm da CPU, de uma vez só:
```js
const tempo = () => millis() / 1000;
const cor = () => [0.9, 0.4, 0.1];
const base = baseMaterialShader();

const meu = base.modify({
  uniforms: {
    "float uT": tempo,
    "vec3 uCor": cor,
  },
  "vec4 getFinalColor": `(vec4 c) {
    float f = 0.5 + 0.5 * sin(uT);
    c.rgb = mix(c.rgb, uCor, f);
    return c;
  }`,
});
```
A via clássica, que ainda funciona, separa a declaração do valor:
```js
// no shader: uniform float uT;
s.setUniform("uT", millis() / 1000);
```
:::
:::col ratio=35%
A chave é a **declaração GLSL completa** - tipo e nome - e o valor é uma função que o p5 chama a cada quadro.

Manter a declaração e o valor **no mesmo lugar** é um erro a menos: não há como declarar um uniform e esquecer de alimentá-lo.
:::
---
:::center
::img src="showcase_1.png" height=80%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgACWu126hj812q-QY1wYTyWnj4PC8in0fGu2AYsEs130TwYWieGD0DBgDBQkEEQvm-B5GBQZiZCA42muEGGDAAagBBABKAEl1QxhAwAAYAClVMH0SzgDGSAEoGMBPpYMNc+L5LPrrQgvNdDGARUqECMGAAqBgANgQAAYGABqT3e33+mJW0PlKOxhhmCgAbk+yS9Pr9YCVIYNAEZ03HIwgy2WQ35IMbLHbQ4rDMb8wmiwGAF71+rR6yZig23Mya3q6WyrQGzuFpOBseyfoy-QyZJjgC+hrHiuVvgo2oAcgBxRgGk3JGDaAAsOjtDvHV+05R5Huf5WN1cjAHYkQxq1rf9q3KSNRzza9X2qd9IK-BAAE58mAhAbyQgCazDcDxydF1fF8A1tH4NAvA7SdVy0UNq3gjNqzQ79-wrMClx0BB9EEaDgwNNAwDgY0+H-ap-xQFsGFKMNmJXWUZG0Lcdw4cZfiQMcOEsMwIG0JM-A0MwSIfT4PAUJYyAEZI+HbeDI0jf98mKKyGAAdToAAhE8ABksNkSYPWqMyYAAWVdc0wDpABlPRYH0Y0bQQNBbjASwRmNR8VEzCB4s5NAwntBgxBw11hzEVkov1FhRIQV9NyRT5ZCvC14CIa9+CZJMsrEEgAFUKAYPLfGSMjp1zZFqu6plBHUCAUAawiDFdYtlVZMRj26518r6qcmUGqrx1kMQzTqq0xRQEhqlia8UG1bILHWVkNR1dUtpSsRnzvQ6ADFIDpMhrmdfRCoYQ9TzoB6GE3DyGAga5XIJXStw4FS1I0ua2SZAB3YrkoYHztG6QR9GuNSoGNYob0w5jJkUc1jUmMG+DQaowAkFBXLAQRUGNMtbLBqAwH6RGlTpZnWZQIn8jQ4nbH-YpyjDf9rGrG9kLQ6wyzBiGQpQPGgSi7NurADAMBF-Iwb3FUEw9ABtc3rGKCzZZvSMAF1-3NuzbKdhhzeKWw7Otx2HeYk3fCZYtiQNc34IVhgObsstI2Kf3HU5BhjQUhgwA9SMdfTvAGHKLOYxjPTtoYLwzEmbXho1gRDH4JZjQTc2wAdl33YbpvzbLd2mOGvHNCWAANY05YQfIM3TyjyrB5drj7mAqDgsMx-rKip78Lwpn6Y1g59Rv3dt8Nu+L70Yc+TcODPiBkVRXYYH2NYsW4ATbiDYAqQMQRIFZTOS8UbmhC-nWF9tAmTMtlbmhgvD8BGKyaozpsaAI4CATcQA&name=showcase%201)
:::
---
:::center
# O shader inteiro
:::
---
# O vertex padrão
:::col ratio=58%
Este é o vertex shader que serve para quase tudo: ele aplica as matrizes do p5 e repassa a coordenada de textura.
```glsl
precision highp float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
  vTexCoord = aTexCoord;
  gl_Position =
    uProjectionMatrix
    * uModelViewMatrix
    * vec4(aPosition, 1.0);
}
```
:::
:::col ratio=42%
Três nomes que o p5 preenche sozinho: `aPosition` e `aTexCoord` vêm da geometria, e as duas matrizes vêm das transformações e da câmera.

A ordem da multiplicação importa: projeção **vezes** modelo-visão **vezes** o ponto, nessa ordem.

Guarde este trecho. Quando uma IA entregar um vertex shader diferente disso sem um motivo claro, desconfie.
:::
---
# O fragment shader
:::col ratio=65%
Com o vertex padrão em `VERT`, o fragmento é onde a imagem acontece. Aqui, anéis concêntricos a partir da distância ao centro.
```js
const FRAG = `
precision highp float;
varying vec2 vTexCoord;
uniform vec2 uTamanho;

void main() {
  vec2 p = vTexCoord - 0.5;
  p.x *= uTamanho.x / uTamanho.y;

  float d = length(p);
  float anel = 0.5 + 0.5
             * sin(d * 46.0);

  vec3 a = vec3(0.09, 0.15, 0.36);
  vec3 b = vec3(0.92, 0.42, 0.18);
  gl_FragColor =
    vec4(mix(a, b, anel), 1.0);
}`;

let meu;

function setup() {
  createCanvas(380, 300, WEBGL);
  pixelDensity(1);
  meu = createShader(VERT, FRAG);
}

function draw() {
  background(246);
  shader(meu);
  meu.setUniform("uTamanho",
                 [width, height]);
  noStroke();
  plane(width, height);
}
```
:::
:::col ratio=35%
::img src="shader_aneis.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMABqdAAShQGMIGAADDhefraMCGMC4phgQRILwMSwYa58FAAbg4vJQnmqFhgDGSMG05QYfBo10ZKCZEAFECFIrFEqlxVlFHgZGu130UFVyQMI0ggi12h1yT1cANRpNHDMEDAliNaAYTxQABYGGYALK3AYEsAwADugd5njgqtd7s93t5-rMNH011iUqVuOjwrAcY4yWuYCgycgAAoAJQMYCfO36w3G8m6xtO1WyQQYAD68sVyvJn1kaYzWe0OYgedjQ4YACoA8HEmHI1OCzP55LtL6K3KFWAJ0iGABGBAABirqoAvpTVRwcXjfAAxYkAQQA4i3qdk6QyB0hWeynLcryprmpa1q2vajrGvGboevoXqbjqZgUHwTwQEg1y3hAxaluWEDVrW9bagwHIUg2DpNmW1gMKeCD5B2pEIHAc4UihaECJhzFOAGqHoVxIzYbIXI8r4ZYUuMQgoEgFZeBenwibysoZDwFJ0fkDAANS0fRM4qPpsjzoyBFlvOvoAGxnvJkgyNaMpaORUrlBWdGngAnIedFHvknkIOU5nWbIm4ytULbBS5CBucUvm+tFOlHrYgUMF23aPvofCCAa3L6IOtlBVK25oAWO6HtUh4CAMVaHie55XjeHAcOMvjqGY2GWK644DsYKBmF4hF1rZHgKEsZACGahgVuUtinoe5SnjNDAAOp0AAQm+AAySVeAWAxEBIiojBWR5JS1LZDbyMAAMp6LA+gVkSpKHs+77WZeDUQO1ECdcyUDpRG-WfNUfDaN0ggZq6UAVsUFlJZMigwHdLUnTAZgIN1ACqcGehWYjsfx1xiEiekGSTDAANoRqW0mHlMAEoAAuklEDXJdwrXEC1aMV4-AZBWlNQNTTAwHTr0cMiqK7DA+xrFi3ClbcIy1sm+iCJA2C0XypGKFAlrq6emtvV9Y18IYSs64Y3N8CM6vVNyIMG2Ll5AA&name=shader%20aneis)

`plane(width, height)` é o truque padrão: uma superfície que cobre a tela, para que o fragmento rode em todos os pixels.
:::
---
:::center
# Escrevendo shaders com uma IA
:::
---
# Por que combinam tão bem
:::col
Shaders são um caso raro em que gerar código por IA funciona muito melhor do que a média. Não é acaso:

- **São pequenos e fechados.** Um fragment shader é uma função pura, de vinte a cinquenta linhas, sem arquitetura em volta.
- **O retorno é imediato e visual.** Você não precisa entender o código para saber que está errado: basta olhar.
- **O erro é barato.** Nada quebra, nada se perde, nada precisa ser desfeito. Você roda de novo.
:::
:::col
- **A linguagem é pequena e estável.** GLSL tem poucos tipos, poucas funções e quase não muda. Não há versão nova a cada semestre.
- **O corpus público é enorme.** Shadertoy, The Book of Shaders e décadas de demoscene estão no treino de qualquer modelo grande.

O resultado prático: você consegue chegar a efeitos que levariam semanas para aprender a escrever do zero.

E a armadilha correspondente: **é muito fácil acumular código que funciona e que você não entende**. O resto desta parte é sobre isso.
:::
---
# O que pedir
:::col ratio=52%
A diferença entre um pedido que funciona e um que não funciona quase nunca está no efeito desejado. Está no **contrato técnico**.

Um pedido vago produz, com altíssima probabilidade, um shader do **Shadertoy**: com `mainImage`, `fragCoord`, `iTime` e `iResolution`. Nada disso existe no p5, e nada disso compila.

Diga sempre, de saída:

- que é para o **p5.js 2**, em **GLSL ES 1.00**;
- que a entrada é `varying vec2 vTexCoord`, de 0 a 1;
- que a saída é `gl_FragColor`;
- quais uniforms existem, **com tipo e nome**;
- se é um filtro (`tex0` disponível) ou um shader de forma.
:::
:::col ratio=48%
E nomeie a **técnica**, não só a aparência. O vocabulário é o que puxa a solução certa do modelo:

| em vez de | diga |
|---|---|
| "uma bolha" | campo de distância (SDF) |
| "ondulado" | *domain warping* |
| "nuvens" | fbm, ruído em oitavas |
| "listras" | `fract` sobre a coordenada |
| "borda suave" | `smoothstep` |
| "cores bonitas" | paleta cosseno |
| "raios de luz" | *raymarching* |

Cada um desses termos corresponde a uma família conhecida de código. Pedir pelo nome é a diferença entre receber a técnica e receber uma imitação dela.
---
# Dois pedidos
:::col
**Pedido fraco**

> Faz um shader de água bonito pro meu sketch p5.

O que costuma voltar: código de Shadertoy, com `void mainImage(out vec4 fragColor, in vec2 fragCoord)`, `iTime`, `iResolution`, e talvez `texture()` em vez de `texture2D()`. Não compila, e o erro não diz por quê de forma óbvia.
:::
:::col
**Pedido forte**

> Fragment shader para **p5.js 2**, **GLSL ES 1.00**, usado com `createFilterShader`.
> Entradas: `varying vec2 vTexCoord` (0 a 1), `uniform sampler2D tex0`, `uniform float uT`, `uniform vec2 uTamanho`.
> Saída: `gl_FragColor`.
> Efeito: distorcer a amostragem de `tex0` com *domain warping* de duas oitavas de ruído, amplitude por volta de 0.03, animado por `uT`.
> Corrija a proporção com `uTamanho`. Sem funções externas, sem `#version`.

O segundo pedido é mais longo, e é exatamente por isso que funciona.
:::
---
# O que conferir no que voltou
:::col
Uma lista curta resolve a maioria dos casos. Nesta ordem:

**1. Convenção trocada.** Procure `mainImage`, `fragColor`, `iTime`, `iResolution`, `iChannel0`. Se aparecerem, é Shadertoy: renomeie para `main`, `gl_FragColor`, e seus próprios uniforms.

**2. Versões misturadas.** `in`/`out` e `texture()` são GLSL ES 3.00; `attribute`/`varying`, `texture2D()` e `gl_FragColor` são 1.00. O p5 aceita as duas, mas **não** misturadas no mesmo arquivo.

**3. `precision` ausente.** Todo fragment shader precisa de `precision highp float;` na primeira linha.
:::
:::col
**4. Inteiro onde devia ser float.** `d * 2` não compila; `d * 2.0` compila. É o erro mais comum e o mais fácil de ler no console.

**5. Laço com limite variável.** `for (int i = 0; i < n; i++)` só vale se `n` for constante em tempo de compilação.

**6. Proporção ignorada.** Se o efeito é circular e o canvas não é quadrado, confira se há correção por `uTamanho`.

**7. Nome de hook inventado.** Se o código usa `.modify()`, confira o nome contra `inspectHooks()`. Modelos inventam hooks plausíveis que não existem.

**8. Função do p5 que não existe.** `shaderMaterial()`, `setShader()`, `uniform()` - nenhuma dessas é real.
:::
---
# Depuração visual
:::col ratio=65%
Não há `print()` dentro de um shader. A técnica que substitui tudo é **pintar o valor** que você quer inspecionar.
```glsl
// a coordenada está certa?
gl_FragColor = vec4(uv, 0.0, 1.0);

// quanto vale este escalar?
gl_FragColor = vec4(vec3(d), 1.0);

// está negativo em algum lugar?
gl_FragColor = vec4(vec3(d < 0.0),
                    1.0);

// e se a faixa for grande demais?
gl_FragColor = vec4(vec3(fract(d)),
                    1.0);
```
A primeira é obrigatória quando nada aparece: se o canvas não ficar com um degradê vermelho-verde, o problema está antes - na geometria, na matriz ou no `plane()`.
:::
:::col ratio=35%
::img src="depurar.png" width=100%

`fract()` é o truque para enxergar valores fora de 0 a 1: em vez de saturar tudo em branco, ele vira faixas que revelam a estrutura.
:::
---
# Como iterar
:::col
O instinto errado é pedir o shader inteiro de novo a cada ajuste. O resultado é que tudo muda junto, e você perde a referência.

O instinto certo é o mesmo de toda esta disciplina: **transformar o que você quer ajustar em parâmetro**.

Peça que as constantes mágicas virem uniforms, ou pelo menos `const float` nomeados no topo:
```glsl
const float ESCALA = 46.0;
const float VELOC  = 0.6;
const float AMPLIT = 0.035;
```
:::
:::col
Com isso, três coisas mudam:

- você itera **girando números**, com retorno imediato, sem rodar o modelo de novo;
- você começa a entender o shader pelo comportamento, que é como se aprende isto de verdade;
- quando for preciso pedir uma mudança estrutural, você sabe dizer **qual parte** mudar.

E guarde as versões que funcionaram. Um shader que ficou bom é difícil de reencontrar por acaso.
:::
---
# O que você precisa saber mesmo assim
:::col
Delegar a escrita não dispensa entender o terreno. O mínimo para não ficar refém:

- **o modelo mental** - sem ordem, sem vizinhos, sem memória;
- **de onde vêm as entradas** - `uniform` igual para tudo, `attribute` por vértice, `varying` interpolado;
- **que `uv` vai de 0 a 1** e que a proporção precisa de correção;
- **que cor vai de 0 a 1**, não de 0 a 255;
- **ler o erro de compilação** e achar a linha;
- **pintar um valor** para enxergar o que está acontecendo.
:::
:::col
Nada disso é sintaxe. É tudo modelo mental, e é o que permite olhar para quarenta linhas de GLSL que você não escreveu e dizer com segurança: *o problema está aqui*.

A diferença entre usar uma IA bem e mal, nesta matéria, não é saber mais GLSL. É saber **formular o pedido** e **ler o resultado**.

Vale também o caminho inverso: peça ao modelo que **explique** um shader que você encontrou, linha a linha. É uma das maneiras mais rápidas de aprender a linguagem.
:::
---
# Trazendo código do Shadertoy
:::col ratio=52%
Boa parte do que existe de shader na internet está no Shadertoy, em convenções próprias. A tradução é quase mecânica:

| Shadertoy | p5.js |
|---|---|
| `void mainImage(out vec4 o, in vec2 f)` | `void main()` |
| `fragCoord` | `vTexCoord * uTamanho` |
| `fragColor` | `gl_FragColor` |
| `iResolution.xy` | `uTamanho` |
| `iTime` | um `uniform float` seu |
| `iMouse.xy` | um `uniform vec2` seu |
| `texture(ch, uv)` | `texture2D(tex0, uv)` |
:::
:::col ratio=48%
Repare que `fragCoord` do Shadertoy é em **pixels**, e `vTexCoord` do p5 é de **0 a 1**. É a fonte de erro número um nessas traduções: o shader compila e desenha, mas tudo sai na escala errada - um padrão gigante, ou um ponto minúsculo no canto.

Essa tradução é, aliás, um ótimo pedido para fazer a uma IA, porque é mecânica e verificável:

> Traduza este shader do Shadertoy para p5.js 2, GLSL ES 1.00, com `vTexCoord` de 0 a 1 e um uniform `uTamanho` para a resolução. Mantenha o efeito idêntico.
:::
---
:::center
::img src="showcase_2.png" height=80%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgAVTQDEs+j4gnUEF+elg+gYkCWYH012wOj4aC81wYsAY12gfEMSI51zQAFuIGB2VBrtViRKGDBCc84LyEBxtNzhgwAGp0ABKFAYwgYAAMOF5+towIYxTIkGBBEgvISMNc+CgANwcF0oTzVCxy5IwbTlBh8GjXS0oK3uiCe72+hj+7TFYMUeBka7XfRQKPJAwjSCCeMBpPJFNwNMZrMcMyiywZglPFAAFgYZgAsrcBhqwDAAO6tl2eOBR6tgWv6esu5tmGgM2IBiPc-tesBDjjJa5gKAMd4QAAUAEoGMBPiXU+nM-rk2eK1HZIIMAB9UPhq2X6ez+dWpeDhgAKhb7aJF2vbfiuf6Ftoja7iGYZgAuED8gAjAgAAM+5RgAvoaUaqhA6oAGLagAggA4pexrZGaFqvjadoOpYToutmub5hBxaluWmbDjWdZsS2FAsgISDXNxo68Qxzq+GYFBRhwEkusyrLXLuCZJl4h7HjIjqSX4l4oaht6EhmDC7rSNJ6a65l4Aw+SWWAADU9kaZ8sjyb4vQGm5pnoS5fHaJeqm7pae69P+FQMPZ-Hgfp+T7vyqqGLuoUMMhADsDDWFF-76eU+6HtlCCpYZsiGBFBrBbu4xCCgSC7g6mXaPlJmpahEUMMl5SoYemXSeBu7IShbXJfpxR5YZGGfP0KBmPoMilY4NkGRwE2SBACZBl4fDjJou5uQwKDOVp63BgFAblLu+koY2-KXQAbDdCCIalPlHWdDDVKdgYXY9iEPcUtgPaltgvbIx3+Qa63fQAnL9DA5eUD1PSDEFBluENnf1qEoQ9tjFA95TA4Zo4mb41k5Y2h5TTNMhoCu0H8tU-K+At5PI8Tu6k3DCC3c9fQaNT2504zOj8hzGVc+UFNOBLuWGVTs2C3Au7aPyUCi74mX6Tzh4swg5Sy8tHBrhuW47geR4nkWDAOhDHHnlumsILZnxeAgcB-ga0mCRAwlu9LXtPD71wICMhkOr+BrIbYslaXtliXtoLJsnVyPxwaidKXVbUjfk4GBZY8VJ8pDqRTleUvZ8e2+On-Csrt4HIYhuel07D3YylXWGXtMgGlDS2vYGOjGQam3bXwu1OhmYv-hAOsmTImUDWNRtaTiuEoBmEDspYkDshIXpyry8orryleMb4BaecS2goNPDCz4ZqrUhHfhoOmNXDDAXjfe3l2Nvk-JBAV1jufeMl4Bri30ohWw4EJS3y8PydShl7wPnwsSQQaYnTUnRpBZWxl-zJCQp3Za2EODbT8EgGOlhqw31fMYaa39DqyA8AoJYZABA5kSlDFC7d8jFHbgAdToAAIRIgAGWRl4FcAwiASHDCMfqyNJgJ36C6GAABlSkMB9C7i1LqfkhFSLIy3mI9MjDMIr2oRAWh3IOTEh7ObTSJUtE6MmEojE9DcQ8XHLuMQAchLXDEPyAA2j2TcNV+RTFtKgAAuu4hAnjvFoF8eYCgQSGCdUQsY646ivTXCBAeMO-AMi7jCVACJTAYDRIOhYiAyJUS7BgPsNYWJuAM1uCMI824DCCEgEyFCllNpQCgPmfplkVqJzWkfYAHILReH4CMJk1QnTaG6OMjgIAMJAA&name=showcase%202)
:::
---
# Recapitulando
:::col
**O modelo mental**
- um programa por pixel, todos ao mesmo tempo
- sem ordem, sem vizinhos, sem memória
- `uv` de 0 a 1; cor de 0 a 1
- a proporção precisa de correção explícita

**A linguagem**
- compilada na hora, a partir de texto
- `uniform`, `attribute`, `varying`
- `float`, `vec2-4`, `mat2-4`, `sampler2D`
- tipagem estrita: `1` não é `1.0`
- swizzle: `v.rgb`, `v.zyx`, `cor.rgb *= 0.8`

**As três portas**
- `createFilterShader()` + `filter()`
- `baseMaterialShader().modify({...})`
- `createShader(vert, frag)` + `shader()`
:::
:::col
**Com uma IA**
- diga a versão, as entradas e a saída
- nomeie a técnica, não só a aparência
- confira: convenção, versão, `precision`, float, proporção
- peça parâmetros, não reescritas
- peça explicações do que você não entendeu

**Depurar**
- pinte o valor: `vec4(vec3(d), 1.0)`
- comece conferindo `uv`
- `fract()` para enxergar fora de 0 a 1
:::
---
# Para levar adiante
:::col
A base desta aula é o tutorial **Intro to GLSL** do p5.js, mais as páginas de `createFilterShader`, `createShader` e dos *shader hooks* na referência.

Para a parte técnica - pipeline gráfico, sintaxe de GLSL em detalhe, campos de distância e *raymarching* - a aula **7 - Shaders** de Computação Visual cobre o assunto com profundidade.

E **The Book of Shaders**, de Patricio Gonzalez Vivo, continua sendo a melhor introdução visual que existe.
:::
:::col
Sugestões de exploração:

- Pegue um filtro da aula 7 feito na CPU e reescreva como shader; compare o custo com uma cena pesada.
- Use um hook de vertex para fazer um modelo importado da aula 9 respirar.
- Traduza um shader do Shadertoy e parametrize tudo o que for constante.
- Peça a uma IA um shader com uma técnica que você não conhece, e depois peça que ela explique linha a linha.
:::
---
:::center
# Obrigado
:::
