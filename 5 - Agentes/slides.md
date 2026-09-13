::: center
# Programação criativa
## Aula 5 - Agentes
:::
---
# Agentes

Ao invés de um design global, usamos entidades locais que evoluem ao longo do tempo.

- Um **agente** possui uma posição inicial e uma **regra de movimento**.
- O desenho é o **rastro** que ele deixa.
- O próximo passo depende do anterior.

Esta aula segue a seção **P.2.2 Agents** de *Generative Design* (Bohnacker, Gross, Laub e Frohling)
---
# Roteiro
:::col
- **Agentes ingênuos** - passeio aleatório em oito direções
- **Agentes inteligentes** - regras condicionais e leitura do próprio rastro
- **Formas a partir de agentes** - um agente por vértice
:::
:::col
- **Crescimento** - agregação por proximidade
- **Densidade** - empacotamento de círculos
- **Pêndulos** - agentes encadeados
:::
---
# Ingredientes
:::col ratio=45%

1. **Estado** - o que ele precisa lembrar: posição, direção, velocidade, cor, idade.
2. **Regra** - como o estado muda de um passo para o outro.
3. **Rastro** - o que fica registrado na tela a cada passo.

Trocar qualquer um dos três dá um desenho completamente diferente. É esse o espaço de exploração.
:::
:::col ratio=55%
::img src="ideia_agente.png" width=100%
:::
---
# Emergência por deposição

:::col
Cada agente "deposita" marcas no canvas.

As marcas se somam gerando padrões visuais.

Em desenhos por agentes, você escreve o **processo**. O resultado é uma consequência que muitas vezes você não consegue prever de cabeça - só rodando.

:::
:::col
Isso tem um custo e um ganho:

- **Custo**: menos controle direto. Ajustar o desenho é ajustar regras e parâmetros, e a relação entre os dois raramente é óbvia.
- **Ganho**: uma regra de três linhas pode gerar uma família inteira de imagens.
:::
---
:::center
# Agentes ingênuos
:::
---
# Uma regra simples
:::col ratio=45%
O agente sorteia, a cada passo, uma das **oito direções** da bússola, anda um passo naquela direção e marca a nova posição.

Nada mais. Sem memória, sem objetivo, sem reagir ao que já foi desenhado - daí o nome que o livro usa: *dumb agents*.

O interessante é que, mesmo assim, o acúmulo dos passos produz uma nuvem com textura e borda características.
:::
:::col ratio=55%
::img src="bussola.png" height=80%
:::
---
# Passeio usando tabela de direções
:::col ratio=65%
Cada direção é um par `[dx, dy]`. `random()` aplicado a um array devolve um elemento sorteado, e a desestruturação separa o par em `dx` e `dy`.
```js
const DIRECOES = [
  [0, -1], [1, -1], [1, 0],
  [1, 1], [0, 1], [-1, 1],
  [-1, 0], [-1, -1],
];

let x = width / 2;
let y = height / 2;
const passo = 2;

for (let i = 0; i < 14000; i++) {
  const [dx, dy] =
    random(DIRECOES);
  x += dx * passo;
  y += dy * passo;
  circle(x, y, 3);
}
```
:::
:::col ratio=35%
::img src="ingenuo_nuvem.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeUAGwABiRDE5XMpAG5PtU+NpuoJ9NdcVBycUACwcoWffQCKDXNAAZWmsoA7MqZAwINcwMZtTA9QbPsbNSgpUCqcLDZYwBgMOzirz5TyGPlPb78lbDdoicMGEQAJIAJToZBIdE1DGEDAA2p9ZCmfdYAIwAXV5KezvJz+dTRYYXPz6bLvLzBZ9ddTOdrVcNGebFdLKY7JaRn1zTs+418cCTDAA7mAoCgkE4GMUnbJhwwRmOpmBBKg5wu6aHfF5WYZrmOd5Jndd9AxycuwGOuYKGLe8Axs96uffHwBqT-U2ltnR7qmUBwLydy5km1ayKq0AauSkYxnGCYGioDCjp+ybAQwABUDAHms1yLioq7oQwdzYbhh4EdW2hgAE4zkiBK68uUyEMAAvhwHEQMiqK7DA+xrFi3C8jCq7AAwTz6IIkDYBWD4HlAUCQIIskflx2jMqyNKkaaXj8CMsnVBg1zig+XEgGxQA&name=ingênuo%20nuvem)
:::
---
# Quanto mais passos, mais densa a nuvem
:::col ratio=32%
O desenho não tem um "fim": ele apenas fica mais denso.

- No começo, um caminho fino e reconhecível.
- Depois, uma mancha com gradiente radial.
- No limite, uma área uniforme.

Escolher **quando parar** é uma decisão de composição, não do algoritmo.
:::
:::col ratio=68%
::img src="ingenuo_tempo.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgAQQY6kMTwYEDMyRgaAYFIYAEczHwUPprgxIMMBEswgxmbBjBAkMyIHxmUt9GhIHwkX5mYoJIY+AgONprhBhgwiABJABKdDIJDoAGUGMIGABtT4mgAMkusAEYALqSk02632x3OhgWh2m92u81Whiu022yWBk3Bj1esPu20Ojh2gDcHA4ljMEG0KDAypJZIpAAprnBJdcRpL+FBrpKvHw1tdDABKBjAT5eMyTXN1xMyBiMgSGfhLfOFrkjDufCDXABiYAwGHb8b8jOuQNzxWKFo7C6ZQIA6jAwIJULmbaOu-107n-f6yxXeIprifZONfHAjbfy04GMVJSNX9eP8VO1kcd9UXZcN0sadZ3KL8GAAFn9fIYNg2CHwYSxrn0BhcyfFlXwtecwDkBgqxrQwCIAanIhsmy7WQlRVXwTSgIc7jtV99AEcs0FzDVtV1A1UNkF9jVzF9yIYZiGAAKk-BhxOvBsAFI32uQCVB-ESf3Eu5pNk+S7yUlS1LosAAnGUTv0lcpUIAX2ba4vDnDg7MkCAUzTDMs2MFAzEc6jPg8BQljIARkmrXMAHYADZ-VXdc1OqPhtG6QQmVTKAV1gqLUI46BrjQfVpgy6y1Po1U-2NG0YsldCMEELRjXKfCAuVVUaRQKBXxNGL-Xgi1Yvyfr-RtQahoTT52qgBB0P0OgkqQXNcwgSUwAbYQWEbT46Na3wC1fWr6rk3CZOwu8jqawTs3JbiC0lYpYNLO9JQgS7gNAmA5zQyDcwATni7tln1MAAC8PptEqAbgFBcSSQQIFzMg6AAOQoOhNUlRGUbRy6lih3MAAMABJgBiFBrgAGWubQ+HGEDPCEXMxB8awACFNTEOsbOI6tDFrfGizElT-zui1srUmyTxc5FUV2GB9jWLFuElGEf2AAkDEESBsA9ecqygKBIEEbX8IYFzqYgMLDEbCSwEMLx+BGbXqgwKnunnKWbKAA&name=ingênuo%20tempo)
:::
---
# O que fazer na borda
:::col ratio=40%
O agente vai sair do canvas. As três respostas usuais dão desenhos bem diferentes:

- **Módulo**: quem sai pela direita entra pela esquerda. A nuvem cresce até preencher tudo.
- **Aparar**: a posição é presa ao retângulo. O agente gruda na borda e a engrossa.
- **Refletir**: a componente que estourou troca de sinal. A nuvem se dobra sobre si mesma.
:::
:::col ratio=60%
::img src="bordas_tres.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgUfqGBhea5JFBgbR8AmwBg3fRQPhIhjqQxPPwwdQQJYMGCMiZoa4MCBmdT6flUrwUwzXQwIDjaa4QYYMIgASQASnQyCQ6ABlBjCBgAbU+BoADAzrABGAC6DINFvN1tt9oYJpthudjuNZoYjsNloZvoN-pdbqDzstNo4VoA3BwOJYzBBtKT5YTnhkMAAKa5wBn8KDXBmklBmDCFhh8WJmYZ8ACUDGAny81aQmdrsZkDBQ+gEhn4S2zuYYxWK7c+EGuADEwBgs+2-N3rkDM8UTQA2efDEVAgDqMDAglQmYtZTHnf6ycz3u9+fLt7Psh70GuaG10ygmfyD94GgYcD1vCKPyjjDgyIwAbeTjDh2sgTtqi7LvOlgzlm5TFAyAAs3r5OhDDlCa36WNc+gMJm4y+GAAEmtGDCUXgw5YSa1G0QA1Cx9aNp2shygqvgGlAQ53FaAFPgWaCZiq6qajq36yAaQ4jMJ+qVtWmiZv+LEMAJDAAFSgQw4GaXcun6feMEqNoYABOM6lgQy5TfgAvuO1zwduMBtjRyGzpmACcBE0UscAoNqYAAF4eRaDmBcsACCSSCBAmZkHQAByFB0KqDIpelmXfkFKCZsWpZ3kBUG4ZBmkjt+RJeJ5HDOZIEAJkmKYyMYJZ1RxnweAoSxkAIyQUpmADsTEMsU+QBZ81R8No3SCCKiYfsUGEbuZPGKpB+oWrY1FNumAyZlheZAQyYgSMkxLJDA+hiAytkGQyAAy9bCCwhrqQwmmvQwACkDDPQ9hmA-WAPPVaNWHVmxRrjeZ0MGIfDij2d3IqRCkvW9H0Gpt3bpo93qvQyeM9pAmYjAyRO1pD5nipAR0YXtp0FudIBbORVn3Rjdmg3qH2cSotGWBjcguvW-76tYcA0QMxjC6LH2-ZLw4mc9DDWH+5myGAIsU2LBEGQB1gjLLGDy7rpHgUr9bgfqxRqxrBna30GhmPoMjyWBMafI5Z6NciqK7DA+xrFi3AMjC4HAIyBiCJA2AujR4pQFAkCCInzGNeSEBDQSMdp4YXj8CMifVGW800QHjlAA&name=bordas%20tres)
:::
---
# Módulo, em uma linha
:::col ratio=65%
O operador `%` de JavaScript devolve resto negativo para entrada negativa, então vale escrever um `mod` que sempre volta para dentro:
```js
const mod = (v, m) =>
  ((v % m) + m) % m;

let x = width / 2;
let y = height / 2;
const passo = 4;

for (let i = 0; i < 26000; i++) {
  const [dx, dy] =
    random(DIRECOES);
  x = mod(x + dx * passo, width);
  y = mod(y + dy * passo, height);
  circle(x, y, 4);
}
```
Com passos suficientes, a nuvem cobre o canvas inteiro e o resultado deixa de ter centro.
:::
:::col ratio=35%
::img src="ingenuo_wrap.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeUAGwABiRDE5XMpAG5PtU+NpuoJ9NdcVBycUACwcoWffQCKDXNAAZWmsoA7MqZAwINcwMZtTA9Qa6UThgwiABJABKdDIJDomoYwgYAG1PrJvTyGNYAIwAXV53uDvJD4Z9UYYXPDfrjvLDEcDaZ9IdTScN-uzCdj3oLMaRn1DwskhuNmpQUqBVMrsksYAwGHZxV58sD+U7DHlxSthu0Nt8aFunoY5OSvLQ1OED3J04YAFIGHOGABqdfUtdoSufca+OCTgDuYCgKCQTgYxSbvA0DBGk6mYEEqBvd+tEFtXlZhmuSd5QPQ1LGufQpyPBgwEnLlBWguRb25Lk4OgzdN2pWk8x0UcfSgOBeTuUNPWTWRVWgDVyQdZ1XXdA0VAYE8vXHWUT23fCGAAKgYP81muXlz0vJB6JUZ9mNucln3Y59uN4gDeVfd8UBE2RtDAAJxnJAiny7ESAF8OAMiBkVRXYYH2NYsW4XkYWfYB1wMQRIGwBN4L-KAoEgQQXNQoztGZVkaQYTzDC8fgRhc6oMGucV4KMkA9KAA&name=ingênuo%20wrap)
:::
---
# Restringindo as direções
:::col ratio=65%
Como as direções agora são dados, mudar o comportamento é mudar uma lista. Tirando as direções que apontam para a esquerda e para cima, o agente **deriva**:
```js
const SO_SUDESTE = [
  [1, 0], [1, 1], [0, 1],
];

let x = 40;
let y = 40;

for (let i = 0; i < 12000; i++) {
  const [dx, dy] =
    random(SO_SUDESTE);
  x = (x + dx * 3) % width;
  y = (y + dy * 3) % height;
  circle(x, y, 3);
}
```
:::
:::col ratio=35%
::img src="ingenuo_restrito.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeUAGwABiRDE5XMpAG5PtU+NpuoJ9NdcVBycUACwcoWffQCKDXNAAZWmsoA7MqZAwINcwMZtTA9QbPsbNSgpUCqcLDZYwBgMOzirz5TyGPlPb78lbDdoicMGJqSAB9TUAVSIdE1FEYwgYAG1PrJUwBGXlcgC6vOzvKzBbTPpLSM+eadn3GvjgDBT3qdsjrDBGjYYzY4n0s130DHJbbAna5goYI7wDCzxS5c-HYAA1IvqbTDbIQxAw6moHBeXc842MypVdANeSI9G4wmkwaVAwGynyQ3FwxdwwAFR86kAUgYAHcwCgFAkBbFQOyfDtXzuT9vwYP8pjAQRUDAjcwACcZn15EZeXKO8GAAXw4IiIGRVFdhgfY1ixbheRhDtgAYJ59EESBsAYMcGC8RQoEgQR2M4kjtGZVkaTfU0vH4EZ2OqDBrnFccSJAAigA&name=ingênuo%20restrito)
:::
---
:::center
# Um parêntese: objetos e classes
:::
---
# Dados soltos, dados juntos
:::col ratio=55%
Para desenhar três bolinhas, dá para guardar cada atributo numa lista:
```js
const xs = [70, 150, 240];
const ys = [90, 160, 70];
const rs = [26, 40, 18];

for (let i = 0; i < 3; i++) {
  circle(xs[i], ys[i],
         rs[i] * 2);
}
```
Funciona, mas as três listas precisam andar juntas o tempo todo. Acrescentar uma cor significa uma quarta lista, e nada garante que todas fiquem com o mesmo tamanho.
:::
:::col ratio=45%
Um **objeto** junta, num valor só, os dados que descrevem **uma** bolinha:
```js
const bolinha = {
  x: 70, y: 90, r: 26,
};
circle(bolinha.x,
       bolinha.y,
       bolinha.r * 2);
```
As chaves `{ }` criam o objeto e `bolinha.x` lê o campo `x` dele.

Passa a existir uma variável por **bolinha**, e não uma por atributo.
:::
---
# `class`: um molde para objetos
:::col ratio=65%
Uma **classe** é um molde. Ela descreve, de uma vez só, os dados e o comportamento que todos os objetos daquela classe terão.
```js
class Bolinha {
  constructor(x, y, r, cor) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.cor = cor;
  }
  desenha() {
    fill(this.cor);
    circle(this.x, this.y,
           this.r * 2);
  }
}

const a = new Bolinha(110, 130, 52,
                      "#2b5fd9");
const b = new Bolinha(238, 96, 38,
                      "#e2632a");
a.desenha();
b.desenha();
```
:::
:::col ratio=35%
::img src="classe_bolinhas.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeUACwABiRDGK5S5lIA3J9qnxtN1BPprrioOTihyAGzCz76ARQa5oADK0zlAHYVTIGBBrmBjDqYPrDZ8TVqUNKgVSRZIjdp+GsGAAha5dPQ0z6ybRE4b6Mz4676clwXkjXn6XlB-TU2lGlQMFBIM0IOAMYQMODOtOyDNZka5hgjQtFkuGBD6cv6Ktpmv7CPlxNNhgAXwDDFgxggeip-tTKksYAwGHJLcThqLOjAAXG08ztej6dXCFjvfnKhb9YAVHy5yoe0az3Tg74tHmMgB3L0+yBDgCML55DBfAt5+WKSJ3u6AWmYgAMTFNU+SWFAACcYgnkGEDDAw1Tlvej6+nw8rlLYvLQYqvLYf+o5ASRDCgTAxSKuUxR8HBVZ8Ag-YSEOJ7VIxEzMZhhpnsiqK7DA+xrFi3C8jCZbAAwTz6IIkDYAwXJCgwXiKFAkCCHJCndhw2jMqyNJ9maXj8CMcnVBg1wSopPFdkAA&name=classe%20bolinhas)

- `new Bolinha(...)` fabrica um objeto novo, chamado **instância**.
- O `constructor` roda nesse momento e guarda os valores recebidos.
- `desenha()` é um **método**: uma função que mora dentro da classe e vem junto com toda instância.
:::
---
# O papel do `this`
:::col ratio=45%
`desenha()` foi escrito **uma vez** e serve para todas as bolinhas. `this` é o que diz **de qual delas** o método está falando.

- Numa chamada, `this` é o objeto que está **antes do ponto**: em `a.desenha()`, `this` é `a`; em `b.desenha()`, `this` é `b`.
- No `constructor`, `this` é o objeto recém-criado pelo `new`.
- `this.x = x` guarda o parâmetro **dentro** do objeto. Sem o `this.`, `x` seria só uma variável local, que some assim que o construtor termina.

Regra prática: o que precisa sobreviver à chamada vai em `this.`.
:::
:::col ratio=55%
::img src="this_ideia.png" width=100%
:::
---
# Um agente como objeto
:::col ratio=65%
Com mais de um agente, vale encapsular estado e regra numa classe. Cada instância guarda a sua posição e a sua cor, e reaproveita o `mod` que já escrevemos.
```js
class Agente {
  constructor(x, y, cor) {
    this.p = createVector(x, y);
    this.cor = cor;
  }
  passo(t) {
    const [dx, dy] =
      random(DIRECOES);
    const p = this.p;
    p.x += dx * t;
    p.y += dy * t;
    p.x = mod(p.x, width);
    p.y = mod(p.y, height);
  }
  desenha(d) {
    fill(this.cor);
    circle(this.p.x, this.p.y, d);
  }
}

const cores = ["#20242c18",
               "#2b5fd918",
               "#e2632a18"];
const bando = cores.map(
  (c) => new Agente(width / 2,
                    height / 2, c)
);

for (let i = 0; i < 16000; i++) {
  for (const a of bando) {
    a.passo(2);
    a.desenha(4);
  }
}
```
:::
:::col ratio=35%
::img src="ingenuo_classe.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeUAGwABiRDE5XMpAG5PtU+NpuoJ9NdcVBycUACwcoWffQCKDXNAAZWmsoA7MqZAwINcwMZtTA9Qa6UThgwiABJABKdDIJDomoYwgYAG1PrJvTyGNYAIwAXV53uDvJD4Z9UYYXPDfrjvLDEcDaZ9IdTScN-uzCdj3oLMaRn1Dwskhu0Nt8aFunoY5OSvLQ1OED3JzYYAFIGG2GABqfvUvtoSufY2alBSoFUifV-hrBgAQUEEiWNOTNYgw30Znx1305LgvJGvJr+mptLzKhQSFNCC8jfpfCWADUYIfj6eGCMDSod4PoY+xHi+R6VoBAC+yZeKyhjXOSKDXsmsg7ra3pQL+dyhp6qEqKq0AauSDrOq67oAYBOi1gwz5evej5eJBVFeAgcBDl6WEMAAVAwKDMYBrEjBxDB3DxfECSorHsV69aytJvIAO5gFA96UYJCDCbJtzkkJvJTGAgioOpDAwbesDGBAejklAKG3rIlhgBgGBIcBoFXpJaFgAE4yuYxbG8gxIF6aJJlmbIZnWruviXhMja+iAADExRcgqxTaMG9jIvhVG5WIyXVPklhQAAnJlYhlvZuV5UlMDFBy5TFHw5UgBWUW2qKRHgf0IFPBSybkto7YsEaMCKau64QEs5LKapSBOAwxSVdVK3VQZRm+I4i0XpSnxWoalhgeS4y+GAjZcoKDBnXgDDBtyXIXVdg6DnZgGHfoTbob4WjXJYDCdeqr1UXwT7wYhxQmbIIMWRI1nymFnxmWZyKorsMD7GsWLcLyMLCcA-YGIIkDYAml1wVAUCQIIJOPWZ2jMqyNKiaaXj8CMJPVBg1zipdyNQUAA&name=ingênuo%20classe)

Três agentes idênticos a menos da cor, partindo do mesmo ponto. A sobreposição das três nuvens é que dá a imagem.
:::
---
# De setup para draw
:::col ratio=60%
Os exemplos desta aula constroem o desenho inteiro dentro de `setup()`, porque queremos uma imagem estática e reprodutível (daí o `randomSeed`).

Para ver o processo acontecendo, basta mover o laço para `draw()` e **não** limpar o fundo:
```js
function draw() {
  for (let i = 0; i < 60; i++) {
    const [dx, dy] =
      random(DIRECOES);
    x += dx * passo;
    y += dy * passo;
    circle(x, y, 3);
  }
}
```
:::
:::col ratio=40%
O número de passos por quadro vira o controle de velocidade. No livro ele vem de `mouseX`, com `map()`.

Duas armadilhas comuns:

- chamar `background()` dentro de `draw()` apaga o rastro, que é justamente o desenho;
- desenhar um passo por quadro dá 60 passos por segundo, o que é lento demais para ver a nuvem se formar.
:::
---
:::center
::img src="showcase_1.png" height=80%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgAWTMYBQ10MDD4ggkSxJNxuhiROkUWjMaB012ZhjMWm0130DBgfg5fQmKE82j41wYsAlYH6XImCA4XIgwwYNAAggAZOgUVUMYQMADaYgAxMUAAzFAAsxW0YjpxuK1XyligAE5bQxjTBigA2crFPju40ARksAHY+L7AyAjbZquUI8UxABdADcCuuSt8FBIRFVAGVdQb9aa6dYg0m6fqg6Xy5XqwxTRWDfXa58VO2OwaSwxaway3Te-r+w2m0P62Wk6mOAr+GsGKryRAlgxgJ9FcN9GZtET9AAKOB0kZ0rn6OlQaW0hhePhra4AShXbYYKCQYEMCC8hY8CiWADUYNu3L7oed5pjIKgvm++zcl+3Jge2kHvueRiFshhjwRBr7vtet6FjhhjXBhAC+nwCFAfC7g+q7gbI66+PqUAHhKIxJoW+hkayu6IQgaGgU+3FeAgcCFlxWEfkJDAANQSsJABUz5ifh4rSQA7mAUAvg+ACkDBqRpSAYbIAkICMInGaZ0l3Aw8kCTeBFSUwMBgIIqDaY5zmoMRHAkZIECWGYEDbmAGZ+BoZheJRj7gd+fBLGQAjJDeu4uqa3b5KlfHgdUfDaN0gj6NcAVQLulreplsjsdArJ5tMxXFEG5UMBA1x5sK1xApRYFrhmyrZVVhb6lO4GWDBu7jL4vR6qaKYML0eA9sUM3dJJklUU+dFSiheqVVAnH6tmuZ5kiT6dqdZ36lWdKNpW3aDi2k7HTRZ3PR2F31tdXY1qO47lhWJ0vS9F3dhON0Dt9V2TkmjW0T1vjaLBGBAWqmravqvQ6cjWqqgg4xCC+UOGToCDGCgqoYF4ei7uUprQwwfW7R+ZiTLuGQqfOi5LLuO2cXpml0tzaC7lMHkoHex5nhe-McYL+rFHS5R0haUN3o1PmfCNPJjRoDBgIW0063IDDlN6qUzWAK1rU9GsMLuG1aNclh0xxludnwCBkRRtOyJYYAYBgu5uyeXs6NK2jjAH4lMW7glHgw+S0z5sg+T5yKorsMD7GsWLcHSMKmcADBPPogiQNgDYzdeUDnkIZf6z5ooQIlJIF+ehhePwIxl9UiO5TNKdEUAA&name=showcase%201)
:::
---
:::center
# Agentes inteligentes
:::
---
# O agente com regras
:::col ratio=45%
O segundo exemplo do livro troca o sorteio livre por três condições:

1. O agente anda sempre numa direção principal - norte, leste, sul ou oeste - mas com um **ângulo** sorteado dentro daquele quadrante. 
2. Ao chegar perto da **borda**, ele adota a direção principal oposta e sorteia um novo ângulo.
3. Ao tocar num pixel que **não é o fundo** - isto é, ao cruzar o próprio rastro - ele mantém a direção principal, mas sorteia um novo ângulo.

E, a cada mudança de ângulo, liga o ponto atual ao ponto da mudança anterior com uma reta.
:::
:::col ratio=55%
::img src="esperto_regra.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgAQUMDBQ-QJ2mu0DApImDCg1wYfEEEiWDEgSySDIgSyROmuaAY1wJ+muKDMGH5DAgWie+gZaAQHFJEGGDDoAGUyABVABKJAYwgYYgAxMUAAzFAAsxW0Yi5uIAWuqADK6-UgI3VfKWKAATmtDAduM1uIAcgApXHOw0wYoANnKxT4voAanRNQBZCOu6rG8p8YowMQAbnlZKVAA1jc7ymauVQK3qq1zSwBGZ1m43Gmst+vFYpFiAKpWpgMAcVbTdsfY4OJZMCMMG02j4tNg1OuYAJxkE6g5-K5XgMWj4ugMfJ0+jMAC8+NuUMuYAxkrOoIp8xBLGZ+ygwGSz5e+AAKPguWqLltC5KAAEoGGAT4B18fRnQAbWqRDjQAXQYaw6VQtDgMQpsMKwvh8LQ3C-CQqAcMwnQcPAkjqO0Ei0L7WQ4OpCRnX0KiACo-HorCuIIhheMMHCWOZSwGEA6pDH-WAICgvAGCbGBrC9KD+mFfQZAgEUMHEtjfD1f9-0Y9DqOI9CoJE-ipMYoSiJI6y+Kspx2IgAyS18MxnRMszCOw1zeMEgLTNs4iCOcrjXMcdzxLAST-18JSKwAH1SwkGBYZSGHShgfJS3KMp87Kmw0jQzG08U9PEzTKpkRDLIwgBqTLgto7ChNa3x2oI5iOAAXw4Dh30-b8ZEFYVRX-OAuRGLl9Hm8UuQwJsVuKKCYJkPwiWuIF-x7aMuSbAB2I7lLbCCCx2wUgQAdRgMBBFQf8mzKK7Pi6GAZoYVqm3KOauSHTVRyw2wFpGD7toga4ADEwAwDB-yum69u+-1A1DXEUeGW6YAep6XtKDaDLAAJxhmwGGHNKHZBhlVdv2lHLARpGMeDMMUaWOAUBVMAL2+ptSnyLnllxNkIH-B06FhiguTIOggwoFNacJZZ-wAAwAEmACABoQBgddWgaNaBkcIeo-8MGKBgAH4GC9BhsAYY0INVhKpOtqDuZQK3ijNkHfuU-2+hGIP1L7IbJDfD9tC-H9jGFLxkeg2D+j4JYyAEZI+Fk6MTS5cpbFd8TqiPbpBEFD8oAOs1oyhz4YfhxHkeu3G0YO4167bxn8ce57fbeknPn6OP-3LGsOwYZtqInhgqBbLDawb7a2K8JDEJOqfilsWwyPwk7wYYQ-95387inydCuUQ8ozq5L1o1wz4VBfl+b-Kbe6-3ps22OuN94flyYo5RH7X2KD-QuXdSLiXbvtZMaYca9wJgPV6CARbiUsNcBCVsNDMmdMaa6YA5AMC8AgcYQgUBIGok2QhzVmpQS+v+BAzCvCITAGRZhCBWFEL+mhFeshYHfVVBqbUiC8bIKJggbun1IDfU4awq+DB5GIWKHw8SjDlHlA4SwxC+Q1HDW2jiN6p4BCCBFHeDkgpVwMAAI5mEUPoAQSxPheDMJMVunwoCOIAO6QEEGQMkPsECJwdLIoguckD-kQtWBgZp9HbUEf+O0joxFowkYPBA5RVaMK3kA3eXJcnKS9LYbJsj-yFJ3kfJs0Zt671Vl4a4ydVZN1Zq3VG+1kkOlSfdfuL03pmlVgYbQ5TalH1sDE8ZXJrAAAlcQOlhgAfRoAASS5CXT4iTTpTybF6fIQDLo93Eb0jJw9tqMMmdTE6MTgagwYEfGMpy6bXAZnjNpLMW6dNFjzPmAtXrCy+SgcWT1JbS1lvLRWytNSqx9v+MQxjaQACOhDmIYAAS78FgpYihri+huUA-IWTxIwrEPJXa1i7EOKcfmZEDAblByFkAk6ZVJyGNiqUOkDAbj6GfCPIU5j-y33OoAh258uRiF0DAQQ1wfLzH0LeakWguXPmwL6MQkBHxyvvFoKAZMYAAHOADHtIvCeH7N4PgGAxD8KcLFcoBtaQeD-DeB1PJTwmsaZ4Wkjj26fVwV4bQzpdKIwwVgz2uCiH1kIcQ0h5DBCUOoQwAAZImhgBB-W0PoanbashMHYPGL4WI+DrqFqUkQrCNCGCxDoZtZ+Kg2I2OdI6q8-5uFkW4fSttiFYidsLbw1WL8Pb-hsZtEhAa9Q2OutUdO3RrpRxfnOhgC7B3+o0ny6a-qOoboIsdO+DAAYui8OuaV4pjX6AAM8mu-H0XOu0VU0oBJix6WhpVkqRWY0UVqWVPJeR3AFPzBb-Ouj7IFggQUyzlgwBWSsVYYNafA1MALYUgEACgEp5vW7T3IE2kWgGk7l9A2Pd+RHkMHeUjYRWoSCIbEKhrQmktCMn6NSexBI0BmGfBAPVud2IMDfeY305op7lCI1DKOyJUS7BgPsNYWJuDAVuGHYADApSCEgM7AhJDFA6qEGp2d8ps5ccUzqwwXh+AjGdtUUU2gZ2Lo4CAAaQA&name=esperto%20regra)
:::
---
# Os ângulos possíveis
:::col ratio=58%
`fatias` diz em quantas partes cada quadrante é dividido. O `+ 0.5` centraliza as fatias, o que garante que nenhum ângulo caia exatamente sobre um eixo.
```js
// 0 é leste; o ângulo cresce
// no sentido horário
const L = 0, S = 1;
const O = 2, N = 3;
const fatias = 3;

function anguloAleatorio(dir) {
  const f = HALF_PI / fatias;
  const k = floor(
    random(-fatias, fatias)
  );
  return dir * HALF_PI
       + (k + 0.5) * f;
}
```
Com `fatias = 3`, cada direção principal abre um leque de seis ângulos.
:::
:::col ratio=42%
::img src="esperto_angulos.png" width=100%
:::
---
# Ler o próprio rastro
:::col
`get(x, y)` devolve `[r, g, b, a]` do pixel. Comparando com a cor de fundo, o agente descobre se já passou por ali.
```js
const c = get(floor(x),
              floor(y));
const cruzou = c[0] < 240
            || c[1] < 240
            || c[2] < 240;
```
Esta é a parte que faz o agente ser "inteligente": ele não tem uma lista dos lugares por onde passou - ele **olha para a tela**. A tela é a memória.
:::
:::col
`get()` é cômodo, mas cada chamada lê a GPU. Para dezenas de milhares de passos, use `loadPixels()` uma vez e leia o array direto:
```js
loadPixels();
const d = pixelDensity();
const w = width * d;
const i =
  4 * (floor(y) * d * w
     + floor(x) * d);
const cruzou =
  pixels[i] < 240;
```
Lembre de chamar `loadPixels()` de novo depois de desenhar, senão o array fica desatualizado.
:::
---
# O passeio inteligente
:::col ratio=65%
```js
let x = width / 2, y = height / 2;
let dir = S;
let ang = anguloAleatorio(dir);
let cx = x, cy = y;

for (let i = 0; i < 60000; i++) {
  stroke("#b03a2e");
  strokeWeight(1);
  point(x, y);

  x += cos(ang) * 1.5;
  y += sin(ang) * 1.5;

  let naBorda = true;
  if (y <= 5) dir = S;
  else if (x >= width - 5) dir = O;
  else if (y >= height - 5) dir = N;
  else if (x <= 5) dir = L;
  else naBorda = false;

  const c = get(floor(x), floor(y));
  const cruzou = c[0] < 240
              || c[1] < 240
              || c[2] < 240;

  if (naBorda || cruzou) {
    if (dist(x, y, cx, cy) >= 25) {
      stroke("#20242c");
      strokeWeight(2);
      line(x, y, cx, cy);
    }
    ang = anguloAleatorio(dir);
    [cx, cy] = [x, y];
  }
}
```
:::
:::col ratio=35%
::img src="esperto_linhas.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWYoABiRDE5XMpAG5PtU+NpuoJ9NdcVBycV2QA2IWffQCKDXNAAZWmsoA7MqZAwINcwMZtTA9QbPhEGFyGABL3gTJaChjXBgAI6EZgw7vp7hg1scRvdxggBPVTGu+gAh55rnSicMGAAZBjCW28zXphgARmFhu0Sd8JBzxV5ADkc+UC7IixBk5Y+ATWdWC58cXiCUSGAJBD7rgBBcbN6OE8lQMD6am0w114sMSw5gASg5TADEAPo0ACSTkXzbArNrKnryd6Gcsvuj5M+Kj6ao15OsTZbhl5r6Phkpd4YBvv-SkvoMiTvoDAAFQMKuG7bjuv73gwADUDDkr0yFcgg+TUpBlgngAvhwnzjL4cA5gA7mAUAoEg+7lgwIw5lMYCCKgtEnsRDCgTmmrsRovZCDmfYDsODJjtcE5Tv+Tq+NopEZnAvLaAxGYjO2hqWNGKEcWAOZcq6Ol4AwCpciZekMGAiGITOv7DFKQK3iAADE1RcuUfDFIGIBSbItnXECADqMDMag5K5t5DBeCa4bkgp9FWnODCkYhGZFmyfbYXmmEnrIDHJX4kDkulEGZfkan3hxEB8AAQtGUBaBmKD6GYMDZeZS7kgxeAZlhnFTtxrUDMYbUoaRLAZhRVE0dYDA9VxGYkANGBDWA7UMWNTBBSxvjTbNfUZhWi3Le1pFdTN1Jzamh0wEa1W1fVB5LS1hEJWeMk5oIGjkle1w3nAlIfte+gdZS4WvToTUAF7Sjm2gANpcgAunIDDyly8EIRjAA+mM6LDuZI4ZqPoxj97Y7jxQEyj7J6c994rShlU1fodUMGTHhmFDZjWQlsj0xJwwxbyIyKbFSnUutxQ9bOJN+I1fkwA5jncvKxTaGI4X3r5AWbSFxQayoXQK7Fws6KLIz6wRPP8YIgner6ImjvGEnTq1siw7JikjEjGaw8bCOtZbsiW5byKorsMD7GsWLcLyMIMcADBPPogiQNgtqul4iiTkIadmZb2jMq2CeToYXj8CMafVL64quiHeFAA&name=esperto%20linhas)
:::
---
# As retas contam a história
:::col ratio=65%
As retas pretas não são decoração: cada uma mede quanto o agente andou sem esbarrar em nada. Mapeando esse comprimento para a espessura e para a cor, o desenho passa a mostrar onde o espaço ainda estava livre.
```js
const d = dist(x, y, cx, cy);
if (d >= 25) {
  const t = norm(
    constrain(d, 25, 220), 25, 220
  );
  strokeWeight(lerp(0.7, 2.8, t));
  stroke(lerpColor(color("#2b5fd9"),
                   color("#e2632a"),
                   t));
  line(x, y, cx, cy);
}
```
As primeiras retas, traçadas num canvas vazio, são longas e quentes; as últimas, espremidas, são curtas e frias.
:::
:::col ratio=35%
::img src="esperto_cor.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWYoABiRDE5XMpAG5PtU+NpuoJ9NdcVBycV2QA2IWffQCKDXNAAZWmsoA7MqZAwINcwMZtTA9Qa6UThgwADIMYQMHkMTWOhgARl5JHdxV5ADl3eVhYbtDbfJY+ATWUGQ58cXiCUSGAJBGYMNcAILjKPXTzXclQMD6am0w2yMMQW2Wd0ACUzdoAYgB9GgASScDEj0cMIZUOnDDF6TssGbz5M+-dV0A15Os3bArN5C9ZlMnDANU40Zn0MiL+gYACoGPWm622+v+wwANQMcm9W9chD5anHyx9hgAXw4n3Gvjg7oAO5gFAKBIJ2foMCM7pTGAgioBBH5-gw+7upqSEaCmQjuqm6ZZjmKB5oShbFpuvCYdoAFOnAvLaNBTojHGhqWHmd7IWA7pcoKDAcXgDAKlyglcTx17XqW67DFKQITiAADE1RcuUfDFDAYhkbIknXECADqMBwag5IeupDBeCaEAoOSNFQVa5YMAB15OmGbKpq+nrPh+sjQQ5fiQOSLlHm5+RMf2yEQHwABCeZQFoTooPoZgwB5PE1uS0F4E6L4ocWaFJQMxjJXeAEsE6wGgeB1gMJlqFOiQuUYPlYApdBxVMHp8G+BVVXZU6-p1Q1KUAellXUtV9p9TARoRVFMVdnw9WJT+tmVra2juoIGjkqO1zjnAlLLmO+ipZSxnLb4HhmAAXtK7raAA2lyAC6cgMPKXKXleH0AD6fTot0ek9fGve9H39t9v3FADL3slxi39o1d5hZF+jRQwYPnVdZjibZFaDlA7pFsMlm8iMtFWXRxmyPDhYMC1xSZWWIMDlWvi+E6xr6GgE7Y1ep2qr5UC8nTgvcntL35MLb3c7IFMqJpOltQZ4z6BST66oLCC2LyKDHUl-ZyzA5JK14ZDXBmh1hmbMmycU1T5JYUAAJxqUiwOM27A6W2IskwMUCrlMUfDO677sg9rMuyF0BtWSTOhkyMMvfpI3OpjhQh4dmDJEQW+4y7dlG0SMT1Ord0cPUlieyInifIqiuwwPsaxYtwvIwtBwAME8+iCJA2DOtxXiKEWQi98JifaMyMbtwTXj8CMvfVBm4rcdXn5AA&name=esperto%20cor)
:::
---
:::center
# Formas a partir de agentes
:::
---
# Um agente por vértice
:::col ratio=45%
Os agentes ingênuos ficam interessantes quando **cooperam**. A ideia do terceiro exemplo:

- desenhe um polígono com `n` vértices sobre um círculo;
- faça de cada vértice um agente ingênuo, que anda um pouquinho a cada quadro;
- redesenhe o contorno ligando os vértices na mesma ordem de sempre.

A ordem dos vértices é a única coisa que segura a forma. Quanto mais os agentes andam, mais a memória do círculo se desfaz.
:::
:::col ratio=55%
::img src="forma_ideia.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgAVTQDD4ggkSwYXmu+gYyRg+hQYG0MGwDGuOjAATMGBZFLAgkgfAwSOZDFghk52j46ggKBZMCF2muUopEGuCA48ogwwYdAAymRcQAlEgMYQMMQAYmKAAZigAWYraMSCgCCAC1cQAZY2mkAW6r5SxQACcjoY7qd+qdADkAFJOr3mmDFABs5WKfDEAG4OBxLGYINo6Qq-BozF4ABQASgYwE+HgUSzIAmSfEMZfytktgvKNstFazMgY1T42m6gn01zzUDLtqTfc++gEUGuaG10ynNrnA-Vmu0cC9AEYAOxJwXaEYHpO2QUyE37m2ChdgFm3y1J-ufLxmSaV-uyKALgB3SBBDIBUljgFAEGMFB3UgGAiBbJAywAbXyQV8gAXU3WRlQAMTADAMB-PwUHHIFp0tXsMxIsiYAAdRgHlUDLfcEA3X9WQCcYy13U8RgfZ4WQAKgYYpsLJa5y03WsFU1blBC9ZCMMFIkKS0E0lI4ywKQYMtxl8MAvUtajDLwBgIBMgBqSyqxrAdZG3Xx1N0ig6JIAB9GgAEkGBEsAq0ccyGGsBgAAknXdXDPK8jjZHkhBP2-Os+CWAA1GACwpHi90snRrlbPgqxEx9rj4hhcsMSAy0K3y+kEitxNkVSFwSr8kOStKMulfQy3k5CwAwhAcrq6BlzLaxbUFW0K0FPqBoQc9coXUa0HGybRI3BqOIAX2zAc8IIoi+xo65yNdD1juGWiGKYlBpzY8TDC8LoYBocd5lpEYyzECQoHWQVoxILzI3E6oYF5CBtT0eYf0+bTKR42TfC8ZlLEJQQ1KrJ6XvS2l4DLLwhsFQmRnE36ob4GHpIHeHdP0hhDJNYyGbkcyrJs6tPlkK7TpgFjAyok6gRuwRmNYsTYt4ODes8QR+sGuBZtl+WFpUjGFxVxX0bUlXScl5VtVI3niMsQ6KPyY7tDZbRuLmhWlZ5XXBVnSXTcIsswwjGMnUt63uOavhNbVnX5v4hhA3E3bJH265Ddo4jwJQbUwAALz5-dymOxOnSSQQIA9uhcIoQUyDoSMKDofVxLdoj93yQWra4vnynKTtw+KZ3q7N-crSz5ZvpAclKoAc4AY5ZSB6TAflBUMa5qn6OUAFv2U5ENu3vduu-dz2o1jX2m7LFu257zeI44xOB5ZIkSRgQVYHJMBDGFWVFwMdebU30-HqNs63XdS6v96KMVFndUo7EpYZCPutOuJ4GAtyvAwWBx0DZANhjTM250AHUUvmIFk6purKlnjANAXhF4QC0OoQwTwP5f3yC7T4uCQAUlgASWAVIACXtJ6QTFoYKI8DDo6yBrixYoFscHLGTmnUR4kmFaBYSQ4U+VOHcIZM-DhhIGAAC+ID0nTMieBrcpqf1kf3MQ8on5aAAI5mFlMYQQZgFyaPhk8JkNiBDSnXkY0SSYJaMLMSAd4z9lE3ylBMQk0AJSCiCYSLxbdigdlMRBAe6g0AAGfPBaCXDoFe2gOQsmMC-Qwlg+ApziVNQMthNxR2RKiXYMB9hrCxNwQUMJzzAAYE8fQEMmTMy8IoKAwFenUSjuKCAzZn4dMGdjPgIwmTVDFN0EZHAQDbSAA&name=forma%20ideia)
:::
---
# Ligando os pontos
:::col ratio=55%
`beginShape()` e `endShape()` delimitam uma figura feita de uma lista de pontos. O que muda é **como** esses pontos são ligados.
```js
// segmentos de reta
beginShape();
for (const p of pontos) {
  vertex(p.x, p.y);
}
endShape(CLOSE);
```
```js
// curva suave pelos pontos
splineProperty("ends", JOIN);
beginShape();
for (const p of pontos) {
  splineVertex(p.x, p.y);
}
endShape();
```
:::
:::col ratio=45%
- `vertex()` liga os pontos com **segmentos de reta**; o `CLOSE` em `endShape()` fecha o polígono.
- `splineVertex()` passa uma **curva suave** por eles. Com poucos vértices, a diferença é enorme.

`splineProperty("ends", JOIN)` diz o que fazer nas pontas da lista: `JOIN` emenda o fim com o começo, fechando a curva sem bico. O padrão é `INCLUDE`, que deixa a curva aberta, começando no primeiro ponto e terminando no último.
:::
---
# O círculo que se desfaz
:::col ratio=65%
```js
const n = 22;
const raio = 110;
const passo = 2.2;
const cx = width / 2;
const cy = height / 2;

const pontos = [];
for (let i = 0; i < n; i++) {
  const a = (TWO_PI * i) / n;
  pontos.push(createVector(
    cx + cos(a) * raio,
    cy + sin(a) * raio
  ));
}

noFill();
stroke(32, 40, 52, 40);
strokeWeight(1.4);
splineProperty("ends", JOIN);

for (let q = 0; q < 26; q++) {
  for (const p of pontos) {
    p.x += random(-passo, passo);
    p.y += random(-passo, passo);
  }
  beginShape();
  for (const p of pontos) {
    splineVertex(p.x, p.y);
  }
  endShape();
}
```
:::
:::col ratio=35%
::img src="forma_spline.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeUACwABiRDE5XMpAG5PtU+NpuoJ9NdcVBycUOQA2IWffQCKDXNAAZWmsoA7MqZAwINcwMZtTA9Qa6UThkaGMIGMVisLDdobb5VYT7QwAIw+rku2RuiC2ryswzXb2lZ3WkO+bRwb0AdzAUBQSCcjsDOndOhG3qmYEEqEzMckrtzXiJKGuhm9AG0ALrZyzXfQMcnjXxgb0Bhg9vBGwX9gDUI+ptMNQdzWgd5IoAHUSAB9GgASQYACp+9THEPPrIqxAa4YEF4zJNyfS+EsAGowfFt8kHlQJhgjnNsvjU7ee65Il8g3zD9DEgclvy3PpnmuF9KQNWQAF8OE+Y0ADEwAwDAqWzYYpSBdlil5bleXyQiGG5eC-BQPCYAXGAi1QckfQQDlKMMLwuhgGgpXmfRRmfcRoHWXkACkSDXAA5K1DVbdtOw0BgAEde2HZTB2KBVVLHCcX1kjtg1DBhrksBgjxPHSpxULwEETEcHVVaANXJawwzWf9TPDa5KJUUyEGA+y1SclzPN5VyI28hgkMs6oYEESBNT0eZsN0tt9MrIyTLM2sLJ82R2M4+8+PgclrLgUK-IiqKfIkKAEr4JLKKiqLkVRXYYH2NYsW4XkYXzYAGCefQ4ogbAGD7MMoCgSBBFGvsou0ZlWRpBgpvyvgRlG6oMGucVh2ahCgA&name=forma%20spline)

Cada quadro deposita um contorno um pouco mais deformado que o anterior. O acúmulo desenha a **história** da deformação.
:::
---
# `splineVertex` e `vertex`, lado a lado
:::col
::img src="forma_spline.png" width=80%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeUACwABiRDE5XMpAG5PtU+NpuoJ9NdcVBycUOQA2IWffQCKDXNAAZWmsoA7MqZAwINcwMZtTA9Qa6UThkaGMIGMVisLDdobb5VYT7QwAIw+rku2RuiC2ryswzXb2lZ3WkO+bRwb0AdzAUBQSCcjsDOndOhG3qmYEEqEzMckrtzXiJKGuhm9AG0ALrZyzXfQMcnjXxgb0Bhg9vBGwX9gDUI+ptMNQdzWgd5IoAHUSAB9GgASQYACp+9THEPPrIqxAa4YEF4zJNyfS+EsAGowfFt8kHlQJhgjnNsvjU7ee65Il8g3zD9DEgclvy3PpnmuF9KQNWQAF8OE+Y0ADEwAwDAqWzYYpSBdlil5bleXyQiGG5eC-BQPCYAXGAi1QckfQQDlKMMLwuhgGgpXmfRRmfcRoHWXkACkSDXAA5K1DVbdtOw0BgAEde2HZTB2KBVVLHCcX1kjtg1DBhrksBgjxPHSpxULwEETEcHVVaANXJawwzWf9TPDa5KJUUyEGA+y1SclzPN5VyI28hgkMs6oYEESBNT0eZsN0tt9MrIyTLM2sLJ82R2M4+8+PgclrLgUK-IiqKfIkKAEr4JLKKiqLkVRXYYH2NYsW4XkYXzYAGCefQ4ogbAGD7MMoCgSBBFGvsou0ZlWRpBgpvyvgRlG6oMGucVh2ahCgA&name=forma%20spline)

Com `splineVertex()`, a curva passa suavemente perto dos agentes. A forma parece orgânica mesmo com poucos vértices.
:::
:::col
::img src="forma_vertex.png" width=80%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgkBgAWToAGV8XjtLcwIJrgwoNTyRAUNd9BBrkidNc0AxkjB9Es4AAKACUDBZvDMggMNJgHBxhi8XRgADUeXyhdgGNdDAx1IY0JqGHxBBIllrkmB9HxOWZOV5rkkqSyEBxLGYINoUGBrjJjCgzF4hQxgJ8PAolmQBMk+IZ+eUACwABjZcfjgoA3J9qnxtN1BPprq6oPzirGAGxpz4W6AconTQsAdnLMhF1zAxhrMHrjeDXuGIoYwgYxWK6ab9N7Fs9-YYAEZp-GR7Ix74vFHDNSB6Vh92IL3tHApwB3MBQFBIJyDhfsne+bQjKdTSmoc9bySjnvLr2MrUDgDaAF1L0sJkGH5cZfDAKd5wYCC8BFVNoIAagQ4UgybRd3wNKd+QoAB1EgAH0aAASQYAAqaDhUcODPlkW0GU1BAvDMSZ+RDPglmVd0mX5GiVD3BgEPZaM+GFciJ1ZXjFzvQTDEgfkRLIvpnmuXjBUbWQAF8OE+FkADEwAwDAhUvYY8yBGNijZBM2XySyGATdS-BQMyYBwmBHxQflpwQWMuybID9BAsCGAAR0g+Cwtg4oSwipCUN4gKQKXBgvA1SwUs-TV4rQlQvAQfcEIHStaTQflrBXNZWRS1drkclQUoQaSioEEqyoqtc2Xa2rL003jqhgQRICJPR5mMhLgNYjDUuudK6K-bL6tkbleXgfk8rgTrGrqhgtJyiQoGGvhRrIAAZEgiToRzdt25FUV2GB9jWLFuDZGE72AbUDEGiB1SglcoCgSBBF++Ddu0CMo0DGlW3lPgRnVaoMGubNQY4EANKAA&name=forma%20vertex)

Trocando por `vertex()`, os mesmos 22 agentes viram um polígono. Nada mudou no comportamento - só na maneira de ligar os pontos.
:::
---
# Um centro que persegue
:::col ratio=65%
No livro, a forma inteira segue o mouse com uma suavização de um centésimo por quadro:
```js
centro.x +=
  (mouseX - centro.x) * 0.01;
```
Esse é o `lerp` da aula 3 escrito na mão. Guardando o centro num vetor, fica:
```js
const n = 26;
const pontos = [];
for (let i = 0; i < n; i++) {
  const a = (TWO_PI * i) / n;
  pontos.push(createVector(
    cos(a) * 30, sin(a) * 30
  ));
}

const centro = createVector(
  width / 2, height / 2
);
const alvo = centro.copy();
splineProperty("ends", JOIN);

for (let q = 0; q < 200; q++) {
  if (q % 25 === 0) {
    alvo.set(
      random(60, width - 60),
      random(60, height - 60)
    );
  }
  centro.lerp(alvo, 0.08);
  for (const p of pontos) {
    p.x += random(-0.45, 0.45);
    p.y += random(-0.45, 0.45);
  }
  beginShape();
  for (const p of pontos) {
    splineVertex(centro.x + p.x,
                 centro.y + p.y);
  }
  endShape();
}
```
:::
:::col ratio=35%
::img src="forma_centro.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWABsAAYkQxytzuZSANyfap8bTdQT6a64qDk4pckWffQCKDXNAAZWm8oA7MqZAwINcwMZtTA9QbPsaAGJgDAYKmiw3DGVA8nlYp89m8hj5L0MACM+udsld1yBAHUYGBBKhyYGEIGrYbtEThkaGMIGMVOaGdOnfF4iShroYswwANoAXXzlmu+gY5PGvjAFe5woYbbwRs7YAA1P3qbTDbI0xAM1ps+SKJGSAB9GgASQYACou9THL3PrJixBS4YEF4zJNyfS+EsAGowfEN8k7lRptl8anrgV8wyQckvtf87kPykDVkABfDg6ULHQJBQGUK3PK8b1LfR71HBgAHcwCgFAkCcHM+SmWNUBw4pPiAgsJ18PgMGSa5YKgmV9muLwRidT5DC8LoYBoGV5n0UZ73EaB1j5AApEglwAORTWR60bZsNAYABHdtOyUntikFFTB2HB8wEsJslIAUhzfIs2EbMhRpB9ZEo6iEBJZCVEcvo1Q1ckeT5dDMOw6wGB5SkkSslRVWgVz3KYGM418Hy-MC0iQIfbQ6OuBBxn0CkbOuPluQQblbDihgZKbccMy8Bhrj0vcD20lDdwQOAGH7bNgvVNByWsbL2XyLKEE6-LapGBqmpc1r2p6rqGA6-J8tAlDqhgQRIE1PR5hYlDCrPCDSvKhhKrLaqnL8djIBga9ePgM8krqhqdrqgKaoOh7IP3eiBv7G6Rmmh8JCgJa+BW0iZpm5FUV2GB9jWLFuD5GEBuABgnn0BaIGwCbOy8RQoEgQQUY7BgZu0ZlWRpBhMbY-gRhR6oMGuSVOyB4CgA&name=forma%20centro)

Com um alvo que muda de tempos em tempos, a forma deixa um traço largo - um pincel que também é um agente.
:::
---
:::center
# Estrutura de crescimento
:::
---
# Agregação: encoste no vizinho mais próximo
:::col ratio=45%
A regra do quarto exemplo cabe numa frase: **sorteie um círculo novo e encoste-o no círculo já existente que estiver mais perto**.

1. Sorteie posição e raio.
2. Percorra os círculos já colocados e ache o mais próximo.
3. Calcule o ângulo do vizinho até o candidato.
4. Reposicione o novo círculo sobre essa direção, à distância exata da soma dos dois raios - encostando.

O candidato sorteado nunca fica onde caiu: ele apenas **indica uma direção de crescimento**.
:::
:::col ratio=55%
::img src="agreg_ideia.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgkBhePhra4MKBaPiCfqCPjaPjXbA6ARQMCklDXJEMZJgABekCQxPehnx+mucDAaDZ+OuhjANOJlkgfAwCA42muEGGDDoAGUyABVABKeOEDDEAGJigAGYoAFmK2jE7IAggAtXUAGQYxrNxWq+UsUAAnA6GG7HfrHQA5ABSjs9JpAppgxQAbOVinwxABuDgcSxmCDaFBgNV+DRmLwACgAlAxgJ8PAolmQBMlCRX8haLey0xaq9mZAxqtTuhTrvmoBWbcm+zmB6r1b5YnwaFLWYLjQBtDcARkt7O3267DBtAF12RuA8n97YrwxtwB2M8MHf32z7++3y1nz4qX9--87h27JTvu1pPhuxSQfuFpvne+TgcmxT7mm+7FCeJ79rIEDXFqKDCkC1aYQwljXPoDAVvOGobnA7IjOy+gngw1yWAwS4rsMUo1sAxFgBgGAVihDDWke+RIXe975H2OhgAE4wVjRDB0X0DAAFTHlJAC+s6yJRvheHAcblNasFeCMcbFNu1r0eZ25Ebpz7JApyRKakjGbg+sEPp+FoYdpTiOExDLQMyfCsn4pFLIo1yfF4ZiTIRnxQPofAAO6QIIZBqkscAoAgxgoG6kAwEQhJIBWG63vBM4DthABivH8VJwz4TAFbbsmvaZn4eHXECADqMBgIIqBtQgtjVTpMnaHJ+nsqZ1lqcUE3dS1bUBp1K29TAA1DSN24INay1dK1s34i5TkjMtXjXJWy3Ybhq1SfKfFtR1UnaFNM0KfNDCSf2nw4sSnI8hAfIMBMqoYEgzLRTV1z1S9TU9QRLrukjLU7cNKCTgdy0fbJrWOeyznE2Ri0MAA1Aw43-QOOJaNd0qyjxECKvSEiqsMUX1mqGpaMaoUCMUFamQw1gckp+lixycB47zviWAZxqOZTOhShWfA1mpFapKr+hVuylhmcrZlU9KEAa1r5G61T+tEfdyOtU9DUVqG4bRo672fa1iuG0pZPqbTsg4sKKBmBgUqfNlKBatyrW7lJ0eOkkggW26dC1RQ7JkHQEYUHQ+pSQ7j1Ec9-G7ht0cVmIjNgAA5wAx8ShgRQopLBlLVMpnNpsMNOpcu6jbqJ8s1cgMDvL8s8gpePoADPorisGKtU0ZxNmeLwnLWXrthpGMYjzlY+143coKhg7MFqu3PIsRBmr0eRuq9ah0Dy9FeHygydDRbOd5wX2dc750LkRKuYhm6t2LAwCATdwbuGuFDGATFoBIOJNoAAtwEcOZ8aQMEACgEcDIZTAYFoJk-RT4kjQf0dwYoJCsgdD+X8aUoAoCQE4Y87Ipi7V8OLSC1UtIQGRKiXYMB9hrCxNwdkMIzLcSePoQQkB6QWi6gSKATIhBKK6gImkEBWyCm4kyQwXh+AjHpNUCO2huhaI4CADSQA&name=agreg%20ideia)
:::
---
# O passo da agregação
:::col ratio=65%
```js
const circulos = [
  { x: width / 2,
    y: height / 2, r: 9 },
];

for (let k = 0; k < 420; k++) {
  const r = random(3, 11);
  const px = random(width);
  const py = random(height);

  let perto = circulos[0];
  let dm = Infinity;
  for (const c of circulos) {
    const d = dist(px, py,
                   c.x, c.y);
    if (d < dm) {
      dm = d;
      perto = c;
    }
  }

  const a = atan2(py - perto.y,
                  px - perto.x);
  const R = perto.r + r;
  circulos.push({
    x: perto.x + cos(a) * R,
    y: perto.y + sin(a) * R,
    r,
  });
}

noStroke();
fill(32, 40, 52, 190);
for (const c of circulos) {
  circle(c.x, c.y, c.r * 2);
}
```
:::
:::col ratio=35%
::img src="agreg_estrutura.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeVbAAGJEMDmcykAbk+1T42m6gn011xUHJxQALAA2QWffQCKDXNAAZWmMoA7MqZAwINcwMZtTA9Qa6UThjowAEzBhroYGMIGABtT6yYAMODYBgAdzAUBQSCcDGKSK9KhG-qmYEEqHDkb6-oAnAwAL5Rw0AXSFkkNlmu+gY5PGvl6bs5AoYvTwDDlxRrdYA1K3qbTDbJtDbfKW3aroBr2TyAIxjg0qHR9hheOCuvpqkdBkNIKcqXsQW1eEaLofqtDk+OJlBW7u8DRzmD6FDXRfae3aR3O92c-PRisMKBoRcASQgSxIDAUYC2nYtS3JLdbW0BhrksO0HSdQxO2jHtZygRcoFNFByXnHldxzadiJIkjtAQOAeXIkYN2nMAEPJTCGx-VCL2nH8sLA0j5lve83W0Ljp0zaNhMLadoN8LQ3T4TQIGKPC92sa9eIQEYiNIjTp3nBglJ4u8KNomdt18AAlRc9OuBBS1bPpBMQ59kIQLwzEmckuxIv1lP0hcbN7Nk+GpAAqBgTPU6dYy8yy9xswxIHJAKGGC0K0L6MKsw3UTPmNTUUElIEqS4oCMAwdkUzlbkGHyFMxzTflCpLMsJJ0OCEMfJDnVY8Sn3GKCKKo1T+tLYLigyjhRORVFdhgfY1ixbgeRhPcfSefRBEgf0Wy8RRsKEDba1E7RmVZGlv1NLx+Ai6onTFfaOBATMgA&name=agreg%20estrutura)
:::
---
# Ver o processo
:::col ratio=65%
Três linhas a mais mostram de onde veio cada círculo: a posição sorteada, o vizinho escolhido e o segmento entre os dois.
```js
noFill();
stroke("#c9ccd2");
circle(px, py, r * 2);
line(px, py, perto.x, perto.y);
```
Ligando o candidato ao vizinho, aparece a estrutura de **parentesco** da agregação: uma árvore, em que cada círculo tem um pai.

Essa visualização é a maneira mais rápida de entender por que o resultado tem a forma que tem - e vale para quase todo sistema de agentes.
:::
:::col ratio=35%
::img src="agreg_processo.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeVbAAGJEMDmcykAbk+1T42m6gn011xUHJxQALAA2QWffQCKDXNAAZWmMoA7MqZAwINcwMZtTA9Qa6UThjowAEzBhroYGMIGABtT6yYAMODYBgAdzAUBQSCcDGKSK9KhG-qmYEEqHDkb6-oAnAwAL5Rw0AXSFkkNw0lQIA6jAE6hyQBGK2GyzXfQMcnjXy9N2cgUMXp4CPFTvdgDUg+ptMNsm0Nt8TbdqugGvZPOrtYLKh0U4YXjgrr6aoXQZDSANa8nEFtXhGO7n6rQ5PjiZQdbXrc3MH0KGuO+09u0jud7s5fNoxfKA0B3ABJCBLEgMBRlXFQGybclT1tbQGGuSw7QdJ1DFHaMJw3KAdygU0UHJLceQvHM1xo2jaO0BA4B5BiRmPGiwEw8kiN7UC8PHGjQOI+DaPmd9PzdbRhJUTNoxkws12NAAxMAMAwKkpOLa4gXJMQAGJtDTbQomKMQ2InH9xnIpjNxGHkmwAKgjMzeEgGArMo2zXzExjKLfD8EFYgtoxQ3wtDdPhNAgYpyMvawvP82z8Lo5KtwYOLRP8uBnJChgACUdwy64ECbQc+ik79sOdBAvDMSZyTHWi-Xiort1Kyc2T4alHNy6iaNjZqAoYUrDEgclOoYbrerXfQpqzNi5M+Y1NRQEs3LY6DVPZFM5W5Bh8hTas035eDEObHK0IwrDfxwviTwstyGOsljmOKianPguS5ORVFdhgfY1ixbgeRhS8fSefRBEgf0By8RQSKEaGuzk7RmVZGkGBIwwvH4frqidMUkY4EBMyAA&name=agreg%20processo)
:::
---
# Uma semente grande muda tudo
:::col ratio=65%
Se o primeiro círculo for grande, quase todo candidato sorteado fica *fora* dele, e o crescimento acontece pela superfície:
```js
const circulos = [
  { x: width / 2,
    y: height / 2, r: 92 },
];
```
Com isso a estrutura cresce **de fora para dentro**, formando uma coroa. O mesmo algoritmo, com uma condição inicial diferente, dá uma família de imagens distinta.

Compare com o que acontece na natureza: cristais, corais e depósitos minerais crescem exatamente assim, por adesão de material na superfície disponível.
:::
:::col ratio=35%
::img src="agreg_fora.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeVbAAGJEMDmcykAbk+1T42m6gn011xUHJxQALAA2QWffQCKDXNAAZWmMoA7MqZAwINcwMZtTA9Qa6UThjowAEzBhroYGMIGABtT6yYAMODYBgAdzAUBQSCcDGKSK9KhG-qmYEEqHDkb6-oAnMUGABfKOGgC6Qskhss130DHJ418vTdnIFDF6eAY+WKtfrAGo29TaYbZNobb4y27VdANeyeQBGccGlQ6fsMLxwV19NWjoMhpDTlR9iC2rwjJfD9VocnxxMoK093gaecwfQoa5L7T27SO53uzkF6OVhhQNBLgCSECWJAYCjIWM4lmW5Lbra2gMNclh2g6TqGF20a9nOUBLlApooOSC48nuuYziRpGkdoCBwDyFEjJuM5gIh5JYY2v5oZeM6-th4FkfMd4Pm62jcTOWbRiJRbRjBvhaG6fCaBAxT4fu1g3nxCAjMRZGaTOC4MMpvH3pRdGzjuvgAEpLvp1wIGWbZ9EJSEvihCBeGYkzkt2pF+ipBmLrZfZsnw1IAFQMKZGkzrG3lWfutmGJA5KBQwIVhehfThdmm5iZ8xqaigkpAlS3HARgGDsimcrck2Kbjmm-JFaW5aSTo8GIU+yHOmxM5tdo4zQZR1FqQNZYhcUmUcGJyKorsMD7GsWLcDyML7j6Tz6IIkD+q2XiKDhQibXWYnaMyrI0j+ppePwkXVE6YoHRwIBZkAA&name=agreg%20fora)
:::
---
# O preço da busca
:::col
Para cada novo círculo, o laço percorre todos os anteriores. Colocar `n` círculos custa

$$1 + 2 + \dots + n = \frac{n(n-1)}{2} \approx \frac{n^2}{2}$$

comparações. Com 900 círculos são cerca de 400 mil - instantâneo. Com 20 mil círculos seriam 200 milhões, e o desenho trava.
:::
:::col
A saída usual é uma **grade espacial**: divide-se o canvas em células do tamanho do maior raio e guarda-se em cada célula a lista dos círculos que caem nela. A busca pelo vizinho mais próximo passa a olhar só as nove células ao redor.

Vale a pena quando `n` passa de alguns milhares. Antes disso, o laço simples é mais legível e igualmente rápido.
:::
---
:::center
::img src="showcase_2.png" height=80%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBh0NBePjaa6adQQFDXHRmWIU-TPClPOBgNAUmAAcgYgmuyRg+ggigpXmu+gYZjQOj4+IpsD6ZjAUGuCA4ljMEG0KDA1xkxhQZi8AAoAJQMYCfDwKJZkATJPiGPUATgADA6kQx8k6DQBuT7VQndQT6a4qqB64oAFgAbJ7PrToNc0ABlabBu1RmQMCDXMDGRMwYPlACMqdkGazMCIGmeGD15RdDoQ+VTps1wx0YACZgw10MDGEDAA2gBdL1pyxChh68a+Xy9h0ehi+PAMR1OucoADUa6NJrTsiJEBbcB7fQE8rQeoA7nKUEgDS6RkeY6e9VMwIJUEWVHuW9oJYKjyXjD1Q8ACoGDrJ1ynyO8GFA8CHUgj9d2bXx9AAWT4Q9eyefVBXPPUf0lF1SmKW8wJdfMiJdO1I2HFQGFHYUJw0PoH3QuA52FFhe2KDiGGsGcEAAdi3T46LASxxwIbQ220DsuwQQw4xgPV8KNYQWAYKAsxQIC7xdbQEDgfSEBGI1FwM4U1z6A0RJ3OjW3bTtDAQLwzEmPVgAYIyGBGF19H038KQAX0Q+zqn6Phulo+ygtEhhYrTBKm33XxLE8CleyJTt9D1MQAGJigdMNim0MRSIARzMCQliPLKhVykA8pgYpw3KYo+DKl11A1WrrmyhqCuqfJLCgO0yui4YAyBAB1GBX1QPV8wQcoPwY8cv18bQGGuCTpMcrtbLojb516lLaUgfD9kCmCGCWqCyNu0LjqJYVewXMD6wYAB+XgeS8Mg+vqtKNS6ubrhdXxQJIuL7NhuHZGwX79H+wGcu68GGEq6qYBdPVfGsD6GxukjotkSbriBfChSe5D6N6-qXoQcl4xQTwhENULLAUjQAEEMC8PQ9Wwy7-IYYoXXDZ1bqliMIf0KqbNJ+iwAwKtLCemTxku7yDN8nQEGFKGPwShLkVRXYYH2NYsW4F0YXvTynn0QRIER2cGAJKAtKEN25wSn8IGtbtPK0wwvH4EZEeqTttCi+KOBAIKgA&name=showcase%202)
:::
---
:::center
# Densidade estrutural
:::
---
# Empacotamento: cresça até encostar
:::col ratio=45%
O quinto exemplo troca a regra por outra, quase oposta:

1. Sorteie uma posição.
2. Tente o **maior raio** possível. Se o círculo com esse raio encosta em alguém, tente um raio menor.
3. Se algum raio couber, guarde o círculo. Se nenhum couber, descarte a posição e sorteie outra.

O resultado não cresce a partir de uma semente: ele **preenche**. Os primeiros círculos são grandes; os últimos se espremem nos vãos.
:::
:::col ratio=55%
::img src="pack_ideia.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgkBhePhra4MKDEmBoAnaa6adQQFDXbA6fruGAMYn6Z7EvhLBgSKnDAy8tAMPgYQRmckIDhUiDDBh0ADKZAAqgAlPHCBhiADExQADMUACzFbRiJEMACCAC1lQAZBianXFar5SxQACcZoYtotqotADkAFIWh1akDamDFABs5WKfDEAG4OBxLGYINoUGBrjJjCgzF4ABQASgYwE+HgUSzIAmShIL+T1evNsb1RaTMgY1T42m6gn01zTUALRqjbeTHZlctifBo12Gc9DAG1FwBGFdNhjuqPmw1RgC65tXxVs5uK5W3DENeoPDEX5Ub5oA7BfyoaD58VJ+v9+77YL-qN0NWwb0XYp8hPBhowg8pyj3Pd21kCBrgAMTADAMGLBM-BQfsgQAdRgMBBFQAsVwQUcsOGXCYALWMdw3fJinNFcGzHDtLGufQGALSdfEXOBzRGc19D3NlLAYadZ3nQwS20MAAnGAsBIYIS+gYAAqSC2PLbM5S8OBQyNCCvBGUMWNsdtPhxQkGCWOluRSGzYD6TlzVJBh3k4-EDC0YlaU4z4vDMSZMM+KAOQAd0gQQyGzJY4BQBBc1tSAYCIQkkALRd8nNfI9zYxCULQjC22w6jh0bUqqOufDCOIlBSIQQ0CoYDiuJ43TfC465xMXP8n0Nc0o2KfKdHk7RFP080TOEjStIQ-FrkLbSOxxdlOQYABHCUdAHaoYE+cZfHUDAkC8zU9QWtruKOtTNXdS61JYTViiw-RrGsEsyw7WQwHEgsCEkud6UMJLrnUAssuU1T9BEkthBYEkwGGAspvxVToZLPA+i4gBqPoiy+jyBjOrjNX0LDqn6PhuiwgBfT4GY7JDUPQzCypqmifT9IMLSqnDOYIoiSPKFq5IUmi0Zm4nTq8zTihapCFQFoF2csYqC25gNg1K8WJsl5TpYo8dZHilAFTAAAvGiVwVrCzYtJJBAgTW6GQihzTIOh-QoOhVVKpWVZolr1bZljW3t5YCzEDks0MWyJE0Ul49ZfptGCxQ5y9fSGHx90mPRhhrAYKNbBDjWtd50qzejkA-M5LjY+JbbWSpMx9uzgz8ZO0nc4YYzTO7kmvOL5qro122I4ThLHaIl2vZ9v3Pe933-YWmuAVZDIICQMxhSb3b25gfRzS0Lw5zAABzgBj4kAEuSQmbQDCTrRWQHHCtAfwxOKWRR42RB+T8UUoAoCQE4SC5opjC18MXFcZd2xM2RKiXYMB9hrCxNwc0MJTLAA8gYQQkBGSPQJFAKA0ViH02lDWGyeDyGGC8PwEYjJqgYGuD2KhEAQB0yAA&name=pack%20ideia)
:::
---
# O empacotamento em JavaScript moderno
:::col ratio=65%
`Array.prototype.some()` diz exatamente o que o laço interno do livro fazia: existe algum círculo que encosta neste?
```js
const circulos = [];
const rMax = 42, rMin = 2;

for (let t = 0; t < 4000; t++) {
  const x = random(width);
  const y = random(height);

  for (let r = rMax;
       r >= rMin; r--) {
    const bate = circulos.some(
      (c) => dist(x, y, c.x, c.y)
             < c.r + r
    );
    if (!bate) {
      circulos.push({ x, y, r });
      break;
    }
  }
}

noFill();
stroke(32, 40, 52, 200);
strokeWeight(1.4);
for (const c of circulos) {
  circle(c.x, c.y, c.r * 2);
}
```
:::
:::col ratio=35%
::img src="pack_denso.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeVbAAGJEMDmcykAbk+1T42m6gn011xUHJxQALAA2QWffQCKDXNAAZWmMoA7MqZAwINcwMZtTA9Qa6UThjowAEzBhroYGMIGABtAC6QsN2htvn0AFk+HBXQw5cUeUHIGHij7PpZrvoGOTxr5fG7OQKGL48OHOQXsygANTF6m0w2yP0QW2ht2q6Aa8kAdzAUBQSANKh0-oYIzDDfVaHJUzAglQVsrDETydTGj6A+DcB93dXyZY9cDkGz+ms1nLn271dtIqWYe09u0judCEMGpg5MPq-J2mpwhYDCgppQ5LgPJGPLaAgf46AgIyUk+q5QXmQHJsWfSQQwXarmAlgpgQp4wAeU5Hpe16GAgXhmJM5LAAwIEAQuAC+yFQdU-R8N0K6rlRT6sYa7GfMaABiYAYBgVLMcMkpAuykb5jy+TicUBbIcJ1xAgA6jAY6oOSACMCByshM4psevjaAw1xoReDpOoY2G4QE4wvsBgFgfZyYAFQMMUyHsexyKorsMD7GsWLcDyML9mRTz6IIkDYAwWYMF4ihfkIUUxex2jMqyNKfqaXj8CMUXVE6YrZp5VFAA&name=pack%20denso)
:::
---
# Detalhes que mudam o resultado
:::col
**A ordem dos raios importa.** Testar do maior para o menor produz poucos círculos grandes e muitos pequenos. Testando do menor para o maior, todos ficam pequenos e a imagem fica uniforme.

**O raio pode depender da posição.** Fazendo `rMax` variar com a distância ao centro, ou com `noise(x, y)`, o empacotamento vira uma maneira de desenhar um campo:
```js
const cx = width / 2;
const cy = height / 2;
const rMax = map(
  dist(x, y, cx, cy),
  0, cx, 40, 4
);
```
:::
:::col
::img src="pack_var.png" width=88%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeVbAAGJEMDmcykAbk+1T42m6gn011xUHJxQALAA2QWffQCKDXNAAZWmMoA7MqZAwINcwMZtTA9Qa6UThjowAEzBhroYGMIGABtAC6QsN2htvn0AFlIK6GMUfZ9LNd9AxyeNfL43ZyBQxfHgGArOVmUygANS56m0w2yP0QW1wUOq6Aa8kAdzAUBQSANKh0-oYI0raprUzAglQVuLbbLvm0Fbd9cbSCcYZ9rdLtu0nbdvf7vkcs8+JfbQb444YTwpW5UUFNKHJcB5Ix5Y5vI0pSOPsm5OkvDDlL7lx8Hx6jMbjGh9JWgZ7nOratjGLBukGkApvo1jWIWT7DraIpLKG2j2tojrOgghgajA5LIbI5LaNSwgsAwp7DBeV43ggb7aAg97EeBrg6AgMa5n0yEtuBYCWLGBBoTASFDvOWE4YYCBeGYkzksADBvteQEAL58Wx1T9Hw3Rga2qnHgZhpGZ8xoAGJgBgGBUmBwySkC7LFDyH48vkTlhlmfF2dcQIAOowH2qDkgAjAgcp8X+sYLqODDXIJmEOk6hhiRJATjKRDH0SpTExgAVGGfFGUZyKorsMD7GsWLcDyMKdopTz6IIkDYAwyYMF4iinkILVtUZ2jMqyNJUaaXj8CMLXVE6YopsVqlAA&name=pack%20var)

Aqui o raio máximo permitido diminui com a distância ao centro. O empacotamento traduz um **valor contínuo** em um **tamanho de grão**.
:::
---
# Agregação e empacotamento, comparados
As duas regras usam a mesma operação - medir distâncias entre círculos - e chegam a imagens que não têm nada a ver uma com a outra.
:::col
**Agregação** (P.2.2.4)
- o novo elemento **encosta** num vizinho escolhido
- a estrutura tem uma raiz e é conexa
- deixa vãos grandes entre os ramos
- produz galhos, corais, cristais
:::
:::col
**Empacotamento** (P.2.2.5)
- o novo elemento ocupa um **vazio** qualquer
- não há parentesco entre os elementos
- os vãos vão sendo eliminados
- produz espumas, texturas, granulações
:::

Um bom lembrete de quanto o resultado depende da **regra**, e não das primitivas de desenho.
---
:::center
# Agentes num pêndulo
:::
---
# Agentes encadeados
:::col ratio=45%
O último exemplo não sorteia nada. Os agentes são **determinísticos** e ficam presos uns aos outros:

- o primeiro gira em torno do centro, a um raio fixo;
- o segundo gira em torno do primeiro, com braço menor e velocidade maior;
- e assim por diante.

Cada agente deixa o seu próprio rastro. Como as velocidades são múltiplas umas das outras, os rastros se fecham e formam figuras simétricas - o mesmo princípio do Espirógrafo e dos epiciclos.
:::
:::col ratio=55%
::img src="pend_ideia.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgAQR0ihgYC0sAY82gZgw1zCBKgWliZggmgYgjA+i0MDQDBQ130EGuDDpDAES08vIQHG01wgwwYdAAymQAKoAJRIDGEDDEAGJigAGYoAFmK2jESLxAC0lQAZDVakC66r5SxQACcZoY1txKtxADkAFL4zU6mDFABs5WKfDEAG5JdLZQBZb0AcTt5VdxTjkgglkZ2hQYGlfg0Zi8AAoAJQMYCfDwKJZkATJPiGcth-Xm8q2PWV7Oyap8bTdQT6a6MqDlo1hvt1hO+arsqWGO0AbVX1j1CHy+XNAEY97ZzWJWeyGAB1vdiAC6SM+Kgfj4fq63tl3DAA7K7jyBT1pz+U5qciWTJgFAApSky+gAIdijed4yE+SHPpuCDlO+hp6j+f4Xu6IDXte-a8BoDBwHae56oa5ojHaxT5HqRGQbKPgrpq65wNRBHZp8li8gw5ZMb4q58OaUpoF414MNclgMIuQ7UtWtaIbIXhmJMVZEbIUDsgA7pAghkNKSxwCgCDGCg1qQDARCtkg5arlRDBhtes7KQw-IAGJgBgGAaX4KBjkCU57jOMb+YFMAAOpEoIqDlnuZSuQ+2hsto4zlhxDAjKJ1ziQwABUDDFElKheNcFYlbIZEANSasu5Z8NWhViV4mlZQwtV+JADVNTouWtfeZIoIYCCqepq6ZSMLlEQAvhwc4yr4fAYCgZjsqxDCrq6Yb7mGR5FZhhE8Xx5bjL4YB2gxDAXXgslLtSCDjEIKBIGFYDVdVimDcMEXlhdwgA3d8kjU9ggvQw1gMHuDAAPyet6fqBgw2CWjalXhdcQLRWAsUoOW5QIIa6NdDA5YIOTLGrmAt4MOTo3DVTHVQ9Ng2CQwaBkZq5aU9TL6SdVQ2GIzAt7tefPVo4RVtWzaA0VzPNi6LTM80zourqLEtS99AWY6TxR7kTYU-br2O4-FCB7sTVnlhz5qy+ayYqmmkMUeay2retVMs25-LyjrQV9gwljeb5rq9mFxkoPKYAAF6k3upT5IHke4kkggQOW1p0B5FDmmQdC+hQdAqujkflnJy5e6uxQ047KZuyta2tl7JVzTmsi+-7pMlSxCC8fodBDnZ9leJlXhTeaYDVsILA1oNwc+X9GqA73oPgy7sPwz6Ab4ijCrKmq6MpQE6Wj+a4+T8vmp6pvBvI1Dluza5nyR9HcfxYnged79JUL75B7h25MsVOOMM750LsXPOBci4lyImXMQ2gJA6yDmAOA1wPSUz1GLLB58GZYPVvzA6v8Q6ZwRjvZOwC05gOgZAhg4CYElXgSALQZUmQkgmBIPQGCGblGwYQnagtVy8IIRDIqxVuKIT-h-JOEdKGgMztnXOdCaGwKASZN+8dP5wOWOWBBigtByQAOcCgAJfs2eCubQa0eQMBgCyNk0ZkQMDruaYo21GE6LEO8FcMEvBgQFAARzMHYgUIoYBin0AwQAKAQehcQwcoBsPEmV0cwvofAY4AGOBRIP6MKFcyQBjXBSnSWA6wHapi7JGJJeMxBmIFF4AwAAj9QyChTB0EE3WJFT4n0Vcm3ZEqJdgwH2GsLE3BzQwhosAcx+hWQQBRldBpUAoD6QWWFNu2hmythrIKMAhgvD8BGCjaoVJhzrI4CAGaQA&name=pend%20ideia)
:::
---
# A cadeia com `p5.Vector`
:::col ratio=65%
`p5.Vector.fromAngle()` devolve um vetor unitário; `setMag()` dá a ele o comprimento do braço. O restante é somar.
```js
const juntas = 4;
const braco = 84;
const razao = 3;
const centro = createVector(
  width / 2, height / 2
);

const trilhas = Array.from(
  { length: juntas }, () => []
);

for (let t = 0; t < 1400; t++) {
  let pos = centro.copy();
  for (let i = 0; i < juntas; i++) {
    const g = pow(razao, i);
    const s = i % 2 ? -1 : 1;
    const ang = t * 0.02 * g * s;
    const f = (juntas - i) / juntas;
    const prox =
      p5.Vector.fromAngle(ang);
    prox.setMag(f * braco);
    prox.add(pos);
    trilhas[i].push(prox);
    pos = prox;
  }
}

noFill();
strokeWeight(1.2);
const c0 = color("#2b5fd9");
const c1 = color("#e2632a");
for (let i = 0; i < juntas; i++) {
  const f = i / (juntas - 1);
  stroke(lerpColor(c0, c1, f));
  beginShape();
  for (const p of trilhas[i]) {
    vertex(p.x, p.y);
  }
  endShape();
}
```
:::
:::col ratio=35%
::img src="pend_cadeia.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWAAMnKRDC5nMpAG5PtU+NpuoJ9NdcVBycV2QA2IWffQCKDXNAAZWmsoA7MqZAwINcwMZtTA9Qa6UThgxYrjNIYGMI+cLDdobb5qqqPc6GLZ2W7ZB6ILbVQAvPjXP3lIM6T06CQoKV++l8JYANRg+Ou+nJn1kAHcwFAUEgnAxirypmBBKgK8VPlb3Qnk2AMHonS6AIL6VUjBCWKVofOG2TAXgSQRl7B2h2shgAX15VOdLAYAG0ALpNt2fSy5hjk8a+XwuzmChi+PAMACM-MvKAA1E-qbSx5PfF5rl3ExBk9c+zXF4IxUnGsgHvoR4ngwYB+hesFyHO-6speYAvm+BYqCGtqCH636FuSEZRryYAGio2EJr+cEAKSVgwAD8DDWLeDCzre4GUaGvgCHhLq+AAVAwnIIJyxQMEJeFCYYnHBgmlh+uS9ooU61iwdSjjIY6snxtxDBeFKcDOlhFEFAgWY5mkQ4at2QjjOSvHkRR+mGQgJIALJ8II5IKUJ3pitcTmma5iiyt+hhBSobYdqyG5gFuCBeGYkzkgZ1xwJFsjhfhhmcYunz5ZIhrGgAYu2GBgZ8wxSkCADqMC1qg5K3mUTk4b42icqm1wYLm+YgAAxMU1T5JYUAAJxiG1CbaKxLoer1eZiANMDFAq5TFHwU1xpB0EaIh55oUhynabBGE0lh7UMApLpwZpSnzqpd6RdV1xAseMD6F4ZA9X1nW8rNvKWJSkXVDAgiQJqejzJVH67eSV1eAw1wKdFnZxVumEfrIySfUscCpQgcC8l4CAjJFhUURIUBQ3wMNOYVhXIqiuwwPsaxYtwvIwiMNIME8+gQxAs4IV4oWQIIIuXoV2jMguE5QKaXj8CMs7VL14rSxwICLkAA&name=pend%20cadeia)
:::
---
# A razão de velocidades é o parâmetro
:::col ratio=32%
`razao` diz quantas vezes cada braço gira mais rápido que o anterior.

- Valores **inteiros** fecham a figura e dão simetria de ordem exata.
- Valores **fracionários** demoram muito a fechar, ou nunca fecham, e preenchem o disco.

Um único número controla toda a família.
:::
:::col ratio=68%
::img src="pend_simetrias.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgAQT6fAAXnxrgxYAxkgNrtowFBFBMGIJrpT9BAtFpDGB1ChPFo6QxLGBBGZ9HwEBxLGYINoUGBrjJ9NdDHxtAoABTXOBIhjXEba-hQa7a0XEo0MWJSzSGACUDGAny8ZkmautAG5PjyBIZ+EsNVqdSM3Z8INcAGJgDAYF2uvw865AtXFYoAFjdscVQIA6jAhag1QBGIMyPowGVqgAM2srvEUZoN1yLsm08uGOgkcYYwh0-T4SwAaqWUNd9Gr604GMV9bXx8VG05HAw+BhtAJVQwh5oeF3qqLmwwAFQMNUWiBWhgAagYhZnMYAjmYYP00EqGPeYDpntUtCGGF5nhkME+ZsIFbHcVVJLtR2nQ9ywQZNU3HNVj0tPhDAvK9bQXWd3WLcZfAEXwuwgMxIxw2RhgzGBs1zFAKwQABOOcKPjGA1TEABiYpqnySwoHosQ50sYcjzw9dOwYcsY18PAGFsct5Kk89z1te1i1kUSvBfLtVVPRV9muLwRmjT5ZCE-QRI0BgwHEySrLkc0UMMGMwCUlSTJUYDWy0LtfBghB5PyA9f2uAB3NUTRJbUwFtQ81WsgBSCcGAAfgYax8wYbAMLIlQmxbXwvHEgoEAHGVhwQSxFTQXEhHGNU+DnXKvAQYwUAAWT4QQkOQ09ULSqzMIc3qbSCsDm0alRmsUKA1U0m0cqarTfwWhgAF93LASwjwI20ulYgiEH9A69WCwxDu1OaEEDFaCKKpUcvW4tNK8YyIEeiUpRlOUZFaswXrc4sPAUJYyAEZJULVAB2AA2atijkucv20bpBEVKUZpTaG5083wxy7fNIcnBgRnE-NbBynGP0MJaAG0aaJ8oAF1tRp8ptSZln8nZ5mGHphAuYYJnGYp1ClQq4c6BVJAkJpiKzRPK0eeizsWDtdzKc1cTimh9DrNisdL3zbD3MVZVVT4P1tRO+tjSJSKhqtCaQwAZTjBM00FSM1Xo8s0yWOAUGdsBCVY-Nyj95ZcSSQQIDVMg6AAOQoOgACVtXjpPU4m-3aIAAxNABjiCGAAEmAOXVtz7VNcvMcsKt9CDYnY3i1WucXbd1iPYjKMw99qTliDkOC2w9dI+j2OM+TtOGCnrOcpztiQGbNACUJIurNPHNRUXAUhRFLRLFLPQYxXteN8qlVvoAQ95BgBi0Lx+gkXR31JKAwHca4xCRdyVBC2kKAkAzm1FMGi-V8yphwo9ZEqJdgwH2GsLE3BtQwhJsABgTx9CCEgFlWyf4oAfyEHgmMj0VwQHBmhDBH9DBeH4CMLK1QMDUm6KQjgIBVpAA&name=pend%20simetrias)
:::
---
# Mostrar o mecanismo
:::col ratio=65%
Desenhar os braços junto com os rastros deixa o desenho e a explicação na mesma imagem - e essa sobreposição costuma ser mais bonita do que qualquer um dos dois sozinho.
```js
const juntas = 4;
const braco = 84;
const razao = 3;
const centro = createVector(
  width / 2, height / 2
);
let ant = null;

for (let t = 0; t < 6000; t++) {
  let pos = centro.copy();
  for (let i = 0; i < juntas; i++) {
    const g = pow(razao, i);
    const s = i % 2 ? -1 : 1;
    const ang = t * 0.006 * g * s;
    const f = (juntas - i) / juntas;
    const prox =
      p5.Vector.fromAngle(ang);
    prox.setMag(f * braco);
    prox.add(pos);

    // o mecanismo, de vez em quando
    if (t % 150 === 0) {
      stroke(32, 40, 52, 45);
      strokeWeight(1);
      line(pos.x, pos.y,
           prox.x, prox.y);
    }
    pos = prox;
  }

  // o rastro da ponta
  stroke("#e2632a");
  strokeWeight(1.1);
  if (ant) line(ant.x, ant.y,
                pos.x, pos.y);
  ant = pos;
}
```
:::
:::col ratio=35%
::img src="pend_rastro.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWAAMnKRDC5nMpAG5PtU+NpuoJ9NdcVBycV2QA2IWffQCKDXNAAZWmsoA7MqZAwINcwMZtTA9QbPsaAGJgDAYKnCySG7RE4YMWK4zSGBjCPnO2RuiAe6qqt1+hi2dmBnTu3yqgBefGukfKseDHu0EhQUsj9L4SwAajB8dd9OTPrIAO5gKAoJBOBjFXlTMCCVBN4qfA2yca+AS+f0QMwO52fSzlhjk-sMIcMTmCudyBgK7mLucAak31Nphr7GgYXmuvv92Ygueu+2uXhGTqrDEn+mns7AkY3b7wnu9rKXYG3u4PkG8YMIIkbHtW5JJimvJgL2KjASGvyRm+ACkzYMAA-Aw1gAIwMNgDC4bGCGZgOQiRr4ABUC4INyCoMDRYE0YYJEqGRj6RuSXoXqyOEMHBTY8T6bGIR6XhSnAfpASoBQICWZZpJYUpoAAgkI4zkgIgjwQhEnXIgJIALJ8II5KWIxDBhmK1y6bJkkIIosrHoYVr7ioEQMKm6jaAIppoNcvKwAwyQwImDAwGgDAAI5mGq1wyWAFnkr46G4fknJ+sI-oCjSMmyMMUpAuS5QtnyPIMPkZXsvkdkIYV1xAgA6jA7aoOSuF1SoXQwOSLkIHAvL9SMSL5Qhsj6Ygg1Hg5IxdQAvjJLngZJbGLS6CGeamqoNQwUBaMevEPg1xViAAxDAxQKqVfBiHZJ0wC1bUoB1CCdWxSXToO1I9VpF4Dbyg4ICNY3jeN-XTcNdmDuBJ6xut63IqiuwwPsaxYtwvIwiMNIME8+iCJAhEbl4TmQIIxNLutvkQCyvrAHtppePwIyEdUGDXOKVMcCA81AA&name=pend%20rastro)
:::
---
:::center
::img src="showcase_3.png" height=80%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgANQMYD4hh0ihghOJsAY82gZgw12J2muaD6fAAXtcJgwoGBLDB+hAloYkX5rtV+l56ZpDAgOJYzBBtCgwNcZPoiSh9NcABTaODC7QjYViviM4WxeVS4Vq1l8a7CrxEwx2nTXfT2ibXACUDGAn3GvgEvmEDAgtIwAG5PsNNUCda7PeG-BrrkCAOpkwSoLXzJ0JkPXABiYAwGC1Cc+jIgwx0EmTDGDHgUS1xMEVrp1ep0I3LMgYlldDC1-oYQYYAAZE748AwAJxj+eTgDUi+9vt7smHEuJDdrmv21y8IzLkfXfYHQ40DDA9fHiev0-NAqJd+Xq8+KhdVYDN98ACoqY61wMP+EoAO5atatrCmA3r-lq14AKQMMUDAAPwMNYACMDDYAwmE9h+siVtWXg3gUCAtm2aSWJqaAAIJCOMWp8ARhFeAgxgoAAsnwghavxj5ShhV7eo4DCCUSsEMMajKsR+7GKFA2b0nJKhbmRJ4fgAvu+V6WIOgbel0MDMQKCCdoGCCGlS9LmfatndppKiBmR9JOTpEAebK8qKsqMicWYXhlj6Fb9HwSxkAIyRElqc5jsK+Tzqx1Qmt0giavKSnFAALAAbKxxG+LqN6gWAUAoEgTjIfqIw3lMYCZr4YnFE5OJ8Bg2gCNoMA3jJQFwRJxKLnhonVbwYBoGAmhQEBWgAH7FOUY5UnAnxqtG2q6jVwqYZhxTCuUCXCmOCDzuU+T6tcdL6Fq5T7Qw2XxQw+T3eU2WejtCD4U563Jh220MLYtjCtlB3HadY6gy611atlh2zhdyGYQA7CD+WfWOrG-Zq-1dsKyNQ-DqPjhD8OMjDxTFLlwozjOIP3cjtgfXhp1Y+qONbXjD3Aw9wr3Sd87U9D7Z3SDT0vcKuXveDM49h5yKorsMD7GsWLcEaty1cADBPPogiQLhE4AVA3JCIbiYeZ1EDRcS2vcoYXj8CMuHVHS2jdBbHAgFpQA&name=showcase%203)
:::
---
# Seis exemplos, um esqueleto só
Vale reler os seis como variações da mesma estrutura:

| exemplo | estado | regra | rastro |
|---|---|---|---|
| ingênuos | posição | sorteia uma das 8 direções | um círculo por passo |
| inteligentes | posição, direção, último cruzamento | ângulo novo na borda ou sobre o rastro | pontos e retas |
| formas | lista de posições | cada uma anda um pouco | contorno que liga todas |
| crescimento | lista de círculos | encosta no vizinho mais próximo | os círculos |
| densidade | lista de círculos | maior raio que couber | os círculos |
| pêndulo | ângulo | ângulos múltiplos encadeados | a trajetória de cada junta |

Trocar uma das três colunas é o método: dá para escrever uma família inteira de sketches sem inventar nenhum algoritmo novo.
---
# Recapitulando
:::col
**A ideia**
- estado + regra + rastro
- o desenho é consequência do processo
- iteração, não repetição
- o resultado se explora rodando, não prevendo

**JavaScript moderno**
- direções como dados: `random(DIRECOES)`
- desestruturação: `const [dx, dy] = ...`
- `class` para estado e regra juntos
- `this`: a instância de quem chamou o método
- `map`, `some`, `for...of`, `Array.from`
:::
:::col
**Recursos do p5**
- `splineVertex()` para contornos suaves
- `splineProperty("ends", JOIN)` fecha a curva
- `get()` lê a tela; `loadPixels()` para volume
- `p5.Vector.fromAngle`, `setMag`, `lerp`

**Decisões que mudam o desenho**
- o que fazer na borda
- quando parar
- que parte do processo fica visível
:::
---
# Para levar adiante
:::col
Os seis exemplos são de *Generative Design* (Bohnacker, Gross, Laub, Frohling), seção **P.2.2 Agents**, aqui reescritos. Os sketches originais do livro estão em **generative-gestaltung.de**.

O passo seguinte natural é dar aos agentes uma **força** em vez de uma direção sorteada: aceleração, velocidade e limite de velocidade. É o que o Nature of Code chama de *steering*, e reaproveita todos os vetores da aula 3.
:::
:::col
Sugestões de exploração:

- Troque `random(DIRECOES)` por uma direção vinda de `noise()` - o agente deixa de tremer e passa a fluir.
- Faça o agente inteligente ler a cor do pixel para decidir o ângulo, e não só se há alguém ali.
- No empacotamento, substitua os círculos por outra forma e ajuste o teste de colisão.
- Deixe a razão do pêndulo variar lentamente ao longo do tempo.
:::
---
:::center
# Obrigado
:::
