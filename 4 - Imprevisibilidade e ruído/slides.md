::: center
# Programação criativa
## Aula 4 - Imprevisibilidade e ruído
:::
---
# Imprevisibilidade

"Previsível" é quase um sinônimo de "chato".

- Como introduzir **imprevisibilidade controlada** — nem tão rígida que entedie, nem tão caótica que vire ruído sem forma?

- P5.js oferece duas ferramentas principais: `random()` e `noise()`

- Vamos estudar aplicações e extensões de ambos.
---
# A maneira certa de desenhar uma linha
:::col ratio=65%
Matt Pearson abre o capítulo 3 do *Generative Art* com uma provocação: qual é a maneira **errada** de desenhar uma linha?

A maneira certa é óbvia — e chata:
```js
stroke(20, 50, 70);
strokeWeight(5);
line(20, 50, 480, 50);
```
:::
:::col ratio=35%
::img src="linha_certa.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWABsAAYkQwAIzFbmUgDcn2qfG03UE+muuKg5OKXNFn30Aig1zQAGVpgqAOwqmQMCDXMDGHUwfWGz7DWVAgDqMDAglQHOtRtt1yBit5DHyvr1wrFHpQdpgjudrvyhtkXRgPr5-r57Nsvv9hoAvhxkajdjB9mssdw+TCRjSGE99IJINgGNyRQwvIooJBBLX6wws3jmazyy3DF5+CNa9UMNcpQ2uyAM0A&name=linha%20certa)
:::
---
# Primeira tentativa: acaso puro
:::col ratio=65%
O reflexo natural é jogar `random()` nas coordenadas.
```js
stroke(20, 50, 70);
strokeWeight(5);
line(20, 50,
     random(width),
     random(height));
```
O resultado é uma reta em direção aleatória. Continua sendo uma reta: trocamos o *destino*, não a *maneira de percorrer*.

Pearson chama isto, com razão, de "bem desinteressante".
:::
:::col ratio=35%
::img src="linha_aleatoria.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWABsAAYkQwAIzFbmUgDcn2qfG03UE+muuKg5OKXNFn30Aig1zQAGVpgqAJzc7n8lUyBgQa5gYw6mAKgDsJs+w1lQIA6jAwIJUByHaandcgYreQx8kHbcKxb6UM6YG6PV78ibZF0YIG+SGkZ8VLI1dBNeSAO5gKAoJCUjOmrN9dV5qZxlCUk0AXw4yNRuxg+zWWO4fJhIxpDCe+kEkGwDG5IoYXkUUEggjHE4YzbxzNZA9nhi8-BGY+qGGuUsny5AjaAA&name=linha%20aleatoria)
:::
---
# Variante iterativa
:::col ratio=65%
Uma ideia: em vez de uma linha só, desenhe **uma sequência de pedaços**.
```js
let ax = 20, ay = 50;

for (let x = 30; x < 440; x += 10) {
  let y = 50;
  line(ax, ay, x, y);
  ax = x;
  ay = y;
}
```
O desenho é idêntico ao anterior. Mas agora existe um **lugar onde intervir**: o `y` dentro do laço.
:::
:::col ratio=35%
::img src="linha_passos.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWABsAAYkQwAIzFbmUgDcn2qfG03UE+muuKg5OKXNFn30Aig1zQAGVpgqAOwqmQMCDXMDGHUwfWGz7DWVAgDqMDAglQHOtRtt1yBit5DHyvr1wrFkiN418fDgDGEDCFfL4Iyjfu5wc+lmu+gY5LDDEj0fKyZzcgY7PZBcjAGpo-zhTTPrJswno-7gypeJAYOSI3GRny4HyRobWxHE3AWyp44mRmOAL4cWcQZGo3YwfZrLHcPkwhPABhPfSCSDYBgFryKKCQQRHgvz7TM1k0hjnwxefgjI-VDDXKUihjzkDToA&name=linha%20passos)
:::
---
# Acaso a cada passo
:::col ratio=65%
Basta variar o `y` a cada pedaço.
```js
let ax = 20, ay = 50;

for (let x = 30; x < 440; x += 10) {
  let y = random(10, 90);
  line(ax, ay, x, y);
  ax = x;
  ay = y;
}
```
Isto é **ruído branco**: cada valor é sorteado sem nenhuma relação com o anterior. 

O resultado é agitado demais ... e monótono.

:::
:::col ratio=35%
::img src="linha_ruido_branco.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWABsAAYkQwAIzFbmUgDcn2qfG03UE+muuKg5OKXNFn30Aig1zQAGVpgqAOwqmQMCDXMDGHUwfWGz7DWVAgDqMDAglQHOtRtt1yBit5DHyvr1wrFkiN418fDgDGEDCFfL4Iyjfu5wc+lmu+gY5LDDEj0fKyZzcgY7PZBcjAGpo-zhTTPrJswno2roJrydW+QBOIN13iQGDkiNxkZ8uB8kaGlQMCOJuDByfxxMjOcMAC+HDXEGRqN2MH2ayx3D5MITwAYT30gkg2AYBa8iigkEE14LG+0zNZNIYD8MXn4I2v1QYNcUoiquHAgCuQA&name=linha%20ruido%20branco)
:::
---
# `random()`: as formas de chamar
:::col
- `random()` — de 0 (inclusive) a 1
- `random(alto)` — de 0 a `alto`
- `random(baixo, alto)` — na faixa
- `random(array)` — sorteia **um elemento** da lista
```js
random();      // 0.72...
random(10);    // 6.83...
random(-5, 5); // -1.2...

let c = ["a", "b", "c"];
random(c);     // "b"
```
:::
:::col
Relacionadas:
- `shuffle(array)` — embaralha uma cópia da lista
- `randomGaussian()` — sorteia com distribuição normal
- `randomSeed(n)` — fixa a semente

Cuidado com um detalhe do JavaScript: `random()` devolve um número **fracionário**. Para índices de array, use `floor(random(n))` — ou simplesmente `random(array)`.
:::
---
# Pseudo-aleatório: o acaso é reprodutível
:::col ratio=65%
Nenhum computador sorteia de verdade: `random()` é uma **fórmula** que produz números que nos parecem imprevisíveis. Dada a mesma semente, produz sempre a mesma sequência.
```js
randomSeed(42);
print(random()); // 0.6011...
randomSeed(42);
print(random()); // 0.6011... igual
```
Isso é uma ferramenta, não um defeito:
- reencontrar aquele resultado bonito que apareceu por acaso;
- variar um parâmetro **mantendo** o resto do sorteio;
- entregar um trabalho que sempre desenha igual.

:::
:::col ratio=35%
::img src="random_semente.png" width=100%
:::
---
# 10 PRINT
:::col ratio=65%
Um programa de uma linha para o Commodore 64, de 1982, que virou objeto de um livro inteiro (https://10print.org/):

`10 PRINT CHR$(205.5+RND(1)); : GOTO 10`

Sorteia entre duas diagonais e preenche a tela.
```js
let n = 20;
let s = width / n;

for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) {
    let x = i * s;
    let y = j * s;
    if (random() < 0.5) 
      line(x, y, x + s, y + s);
    else
      line(x, y + s, x + s, y);
  }
}
```
:::
:::col ratio=35%
::img src="dez_print.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeVbAAGJEMDmcykAbk+1T42m6gn011xUHJxQALAA2QWffQCKDXNAAZWmMoA7MqZAwINcwMZtTA9QbPsNJUDyWIAMTFTny4raMQG2Q265AgDqMDAglQ7KthvGvhkwgYzqFYY0fgYUYA7mAoCgkE4jbHPpZrvoGOTwwwwImGJyBcW5FniwBqGvU2mG2S5-OF+OxUvlhgdvDV2J1hufFS8eNwUslgBUfljw9kRZGpY7U8MM9nYEsBdV0A1VKrnIQ+WpQ9nXRg5LgPJGPLHNb8l4Yt8MntnA2Mx+Hp-P98f14fd4YIzPrIAC+nygRA4HIqiuwwPsaxYtwPIwguwAME8+iCJA2BlhWXiKFAkCCNhXbgdozKsjSDAEYYXj8CM2HVBg1xihWkHAUAA&name=dez%20print)
:::
---
# Por que o 10 PRINT funciona
:::col
O acaso é mínimo — **um bit por célula** — mas o resultado parece um labirinto elaborado.

A lição é geral: o interessante quase nunca vem da quantidade de acaso, e sim do **encontro entre acaso e estrutura**.
- A grade dá a estrutura.
- O sorteio dá a variação.
- Os becos e corredores que enxergamos não foram programados por ninguém, **emergem**.
:::
:::col
Vale experimentar:
- desequilibrar o sorteio (`random() < 0.3`);
- trocar as diagonais por arcos de círculo;
- sortear entre três ou quatro peças;
- fazer a probabilidade variar ao longo da tela.
:::
---
# A distribuição uniforme
:::col ratio=45%
`random()` é **uniforme**: todos os valores da faixa têm a mesma chance.

Se contarmos milhares de sorteios em compartimentos, o histograma é plano.

Uniforme é o padrão — mas raramente é o que a natureza faz. Alturas de pessoas, tamanhos de pedras e intervalos entre eventos têm distribuições bem diferentes.
:::
:::col ratio=55%
::img src="hist_uniforme.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgACTAw2ugn0fCeDFgfQEUGuaAAFABKbDkgkoTzVMxgbR8a4MLz8CB8BAcSxmCDaFBga4yYwoMxeBkMYCfDwKJZkATJPiGWkAFmKAAYkQxigA2fX0gDcn2qfG03WJ11FUFpxR1JstnyWcBQADEpShaWJcQNkhpOXwxB6ZJToDSAMrTZ16vVRz7jXwyYTG-VW6PpnTPOBahhZjIAdwYAEF9CSRrSIPSEJYwBgMLTzbnZPmUNdNDws2b9UPOwxLNd9AxafmwCWGDmGDO8Awe32LQuANTr+kFsBFwwAbUsGGu49pJNjdIb9IAupvc2mNLwDIJZ+UzU4GBAR-mJvMSdTZxXPgeEcT8Rwga441Za4gQZEcxwnKdHxnLN50XMCNy3RVPi7R8kFnJ55S5XctX3MBryNQ0GF-GB-x5AAqBgAEYEBNSijSY2wOxw0cWzbMQAGJimqfJLCgABOSMR1kfpxVpcp9QYdcFwYRj+H0QQjWKJjFOsJgjXUl89OKI0kCjWQAF9PhxLo9HJHlNWPCcaLoz5hn0GCYEDEABJgU1ymKCMQHMvxoKBAB1GAwEEVAXRC-MRhgWdtN0hhCNpFzFGudjqMMP8stU5jWJyzjuLzSAvIUo1EqNcpxKoxKQogqCPNgkLm1bbzfP8wKpM9ZY4zAAAvLymPKEKvRQSskkECBaQAGToH0KCNAAhEgKAoEgAFkJuWby0AAS6gMAtEyqAgtqkyGEShg9PyVNow6tsmJ0vbvUGkbaTG96ppmuayDoAA5Cg6AAJSNQGQfB37vP1MRaqo4pTVhsQmIRhg6qRlGR0m7z3yHRTDHHJZJUMckkvPak6XpI0YDQbMdBpLwDAldQIB7dYtJ0rS3SjKyIGRVFdhgfY1ixbgjRhEZFTS59ICZecWagE6hEVtcBa5CBNXJ4BmTy-gRiZapjztDWOBACygA&name=hist%20uniforme)
:::
---
# Moldando a distribuição
:::col ratio=45%
Elevar um sorteio uniforme a uma potência **entorta** a distribuição, sem precisar de fórmula nenhuma:
- `random()` — plano
- `pow(random(), 3)` — puxa para perto de 0: muitos valores pequenos, poucos grandes
- `1 - pow(random(), 5)` — o `customRandom` do Pearson: quase sempre perto de 1, raramente longe

É um jeito barato de dizer "quero muitos pequenos e alguns grandes".
:::
:::col ratio=55%
::img src="dist_potencia.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBhka5oa4MLRea5LCDaMBaCQoa76TREhhQMDDTzVMxgbR8a4IDiWMzklBga4yJDMlAACmucCRDEsMv0pLMGGuAEoGMBPuNfDJhAwAIwANgA3JqNDpnnA+IYGLqMgB3BgAQX0+j4I3FEBVCEsYAwGHFAAYVSaZLwzTTNDxdQAWANxgMh2SWWkMcVahhgG0MBMZuQMCN8DBGjMAahLao1odk6eSWe0wpZzwg4ss4pVMoDHYQAE5e93g59ZJywJbDABtSzK2ni2sAKgYnoAumXEwwAL6m3z8fSCLN6-IBpwL1fpmkkrMFniOBcMefR1cQa4AZRQCqBbdXyf0qfTmd1OczPBj1Lct1UHMNfCQLMni8cVh1HMcwEXDsZTPa4UP1A8ByrWVfX9MQAGJimqfJLCgbsxGwlQ+hgbQJSlBgS1zedt0EGU9W7Q9rCYGVWIYbi9QQfIZSQKj10+FlrnfPUAHYg1XSSgQAdRgMBBFQcU9TEroYElaV9U4mUGKY-dOwM+TPkfF8310sSfT9cUDQs0MljgFBHSSQRmzIOgADkKDoAAlGUfP8oKxNclAnzAAAvXS9WjCLlnFBUUCVdCGGMhgZOEhhigSuy8M0rDV0i6K4s04okrc8UxADMQjP04oAyq0rkrEPUGsyuBGMwszmtajgN0kCA+QFIUZGMNLYIrT4PAUJYyAEZIrXFfJmplYoSs+ao+G0bpBAVfkoHFYpowNaqUAAMWFCUxAACQGZINA5PhKNXV1oHxJ9phOvUtNXUVhlOsy2xtFg+gEKB8TbGUxE+6G0Dbd7PiBiUONBtVhAhkk7RSqGYfbBhyiJsRcfxr6kaJkmUdDNHxXKJyZTB7H9X4hhyYRwmZXyUmQD1dnOYJqmeZVWnZCs18pNsz8iv+5zZDK2L4pJtq3I8tTvL8gLgtxbXwrVu6QC0dRDCeBgAEczAEQUoEUGBGQdwxaSWIVDBlJkWTANkAFu7cd-N9AAK+tJ4MjAV11k2pm8vKWxsOG5FUV2GB9jWLFuBlGERnVBgnh3SBsGzYsvEUJkhCLnNhs5CAVutYBGWZLx+BGIvqmVfbi0TtcgA&name=dist%20potencia)
:::
---
# `randomGaussian()`
:::col ratio=55%
A distribuição normal — a "curva do sino" — concentra os valores em torno de uma média.
```js
// média 0, desvio 1
randomGaussian();

// média 100, desvio 15
randomGaussian(100, 15);
```
O segundo argumento é o **desvio padrão**: cerca de 68% dos sorteios caem a menos de um desvio da média, e 95% a menos de dois.

Diferente de `random()`, não há limite: um valor muito distante é raro, mas possível. Se isso for um problema, use `constrain()`.
:::
:::col ratio=45%
::img src="hist_gauss.png" width=100%
:::
---
# Onde colocar o acaso
:::col
A pergunta não é *se* usar acaso, mas **em qual parâmetro** — a mesma dose muda tudo de lugar para lugar.
- na **posição**: agitação, dispersão
- no **tamanho**: hierarquia, profundidade
- na **cor**: textura, vibração
- na **ordem** das operações: composição
- na **decisão** (`if`): variedade de tipos, como no 10 PRINT
:::
:::col
E quanto:
- pouco acaso sobre uma estrutura forte → o desenho parece **feito à mão**;
- muito acaso sem estrutura → o desenho parece **defeito**.

A imagem abaixo usa uma grade regular e sorteia só o tamanho, a cor e um pequeno deslocamento de cada célula.
::img src="acaso_showcase.png" width=64%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgAcX0ihgfRggjM-H0AG4-Nd9EtFNdDAw+PMIHxGZonhAkNckToaQwiWY0Ax5gBHMwSa4MWCGDDXbR8dQQFDXBAcSxmCDaFBga4yYwoMxeAAUAEoGMBPh4FEsyAJkmzjQAWYoABl5Ltdpopn2qfG03UE+mumqgxuKToAbN7PgToNc0ABlaZh2yu2wxmQMCDXRMoYNAs0+rPjXwyYQMACcxdkpb8DArAHcwFAUEgnNmawxLPzjXWwA2GK6qQO8J2GGAANST82WrOyHv6Bh9jQMWKD4druTj2LT2efFS8VdwQfGgeTocIfLmgBU9YvcagCeN1kjvOjXcPdZGp-XF9dV63vefQCE+aAvm+DAfgeKh1lAg6Ps+AHFPkvIAZW14MHehifrBq6+BWiHgZmh4LmAGAYCu+gmm6vLFMUkEoKavLjNRxpprylaVryTEsTAbHFAAjO6DAujxzEMEJ164bIYCWMuRFmtuAEAOzFOa2hgAE4zGnAvIjLyUAkaRAzGMS2q6Qw1jSh2xT6VZNmOJJhmGcZsgAL6fJ5EDeciqK7DA+xrFi3C8jCP7AAwTz6IIkDYEOVJeIoUCQII8Wbt5CoQA6jKRSlhhePwIzxdUcoBlSvnuUAA&name=acaso%20showcase)
:::
---
:::center
# Ruído coerente
:::
---
# O que falta no ruído branco
:::col ratio=45%
No ruído branco, cada valor ignora os vizinhos. Por isso a linha treme sem nunca "ir a lugar nenhum".

Quase tudo que parece natural — montanhas, nuvens, o vento, a mão que treme — tem **memória**: o próximo valor é parecido com o atual.

A isso chamamos **ruído coerente**: ainda imprevisível a longo prazo, mas suave a curto prazo.
:::
:::col ratio=55%
::img src="branco_vs_coerente.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgAQQY6kMTwYAEczAIUGAoIoYAxYAxknwMNd+oYkX4YGgGLTtNcueo0CywHwEBxLGYINpKdcZMZPDAABTXEbsyzs3n6dn6a4oMzMgCUDGAnwg1wAYmAMBgFfqANyfYbaoEKjV2h0oJ0wADqMDAglQCtK+TdMgY1RggkgAGU9PMbfbQ5YWQwFeNfHAGMIGAAGW0MDN4LMAFmzufzDAA1FniobkjB9Es4ArytnK-n2cq25YFXBDQAqBjlYptoch2QSKAxvhxscMU1Rj3XZ2zyyW60ARnX2dnjZQuKSgggCoAMnQzRR2WQ6AA5Ch0ABKO+WUbAAC9Feui0+4CgFdrdcy7Ith2IxtrYX4JgAvhwYoSlKYAyhyupeDaRqfB4ChLGQAiMoYCpFgAbNm7LFLYwYJrI1R8No3SCNqEpQIGhHfigZoyr+YgABIDHWlLaHwYizvoAhQHyUbTIx5EmtcYDGOJMCSbOcpgIqJbsqhwgsH0Il8gq1jruy676uyYgAMQwMUBFDgJyIMGI+hmAAt6JYbCZK1zYDoihaIyzL6AwfqmsJDDXAwFL1gh+iCRRHLygq64Efk6m9pmWmmrJioZgO2YINm641gwA7DtYDAGXZICmcU1T5JYUAAJxiCZIAOc5oW8vWEhLJ5-HUgyTLJuMaDVMFoXhZ4LLRRw0EQMiqK7DA+xrFi3DsjCoHAASBiRhAnlll4ihQJAgi7Xm038RAuFGnSslePwIyedUzI0adHAgJBQA&name=branco%20vs%20coerente)
:::
---
# Vamos construir um
:::col ratio=65%
Primeiro, decida a faixa de tela que o desenho vai ocupar e sorteie uns poucos valores **espaçados** dentro dela:
```js
const N = 10;  // pontos de controle
const M = 20;  // margem

// a faixa que o desenho ocupa
let x0 = M, x1 = width - M;
let y0 = height - M, y1 = M;

let g = [];
for (let i = 0; i < N; i++) {
  g.push(random());
}
```
Note que `y0` é **maior** que `y1`: é a faixa invertida da aula passada, porque o `y` da tela cresce para baixo.
:::
:::col ratio=35%
::img src="vn_grade.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWYoABiRDGK7K5lIA3J9qnxtN1BPprrioOT+QA2YWffQCKDXNAAZWmcoA7MqZAwINcwMZtTA9Qa6UThgwAHIMYQMACMXKFsgiDC8RJQ10MDFgOh90vG1ogtoAso6+W6PY4GE99IIYGgOJ9PVpLM84FoAI5mGAMa4BiYSJDF67aMl8T7jXxwLnRiO8uDO6MAdzAUBQSAY1gYEZFhrrDBGjadUzAglQfYHvJGbadg7Tw40DEE0YA2gBdIeySzXfQMckjsDR2NnvD291gADUt+ptMNskECC8Zkm5NV0A1VINsgAXxXOMi39b0IF9f1A20YNrlDQ1jU1FBpSBKk9wYSwwAwDByTEABiGBigVcpihrEB-www9j1Pc8bzka8GDvB8aU+WQRzgaMngpMBeR5e1Z2dFs+NbCjZG0MAAnGck4F5LjyUETcwG3XjeUE0c+IXSlVOdCigIgPTkVRXYYH2NYsW4XkYRGGkEwMQRIGwBhYy8RQoEgQRHNjPTtGZVkbLcwwvH4EZHOqDBK26d0DIAoA&name=vn%20grade)
:::
---
# Segundo: preencher os buracos
:::col ratio=65%
Guardando o passo anterior, acrescente uma função que recebe um `x` **da tela** e devolve o `y` **da tela** correspondente.
```js
function ruido(x) {
  let u = map(x, x0, x1, 0, N - 1);
  let i = min(floor(u), N - 2);
  let f = u - i;
  let v = lerp(g[i], g[i + 1], f);
  return map(v, 0, 1, y0, y1);
}
```
Dois `map()` e um `lerp()`: o primeiro `map` leva o `x` para a grade, o `lerp` interpola entre os dois pontos vizinhos, o segundo `map` leva o resultado de volta para a tela.

Com isso, desenhar a curva é só `vertex(x, ruido(x))` a cada pixel. Já é ruído coerente — mas os bicos denunciam a interpolação linear.
:::
:::col ratio=35%
::img src="vn_linear.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWYoABiRDGK7K5lIA3J9qnxtN1BPprrioOT+QA2YWffQCKDXNAAZWmcoA7MqZAwINcwMZtTA9Qa6UThgwAHIMYQMACMXKFsgiDC8RJQ10MDFgOh90vG1ogtoAso6+W6PY4GE99IIYGgOJ9PVpLM84FoAI5mGAMa4BiYSJDF67aMl8T7jXxwLnRiO8uDO6MAdzAUBQSAY1gYEZFhrrDBGjadUzAglQfYHvJGbadg7Tw40DEE0YA2gBdIeySzXfQMckjsDR2NnvD291gADUt+ptMNskECC8Zkm5NV0A1VINsgAXxXfdcXxQkZH0Mwu2uck4EfT5ZBHMxoyeCk4BbHkGFbXlMIdftnX-FRTxQyByUsDBrkPckzEpXk8L5QjELXSxo2Q-swD3Ii12SaNxn0ClBE3MBt15QSz1vF0RIYSxGL6DQzH0GRUPJZIcN5Z150whdCKAyRDQzHQFJZT5jQAMTADAMCpTjhmlIFyTEABiYpqnySwoAATjEQjbOuIEAHUYCnVB5QQfJCOqGBBEgTU9HmazPgPI8TzXOBowbd00rwJ1W0y+94OfBhkhgfQljgWDeUg6DYMpHTPgkKBYr4eKrX0+M-S9H0OsDbRg2uUNDWNTUUDsmAEsNSwLKspyYGKBVymKGsQEIpLj2Ip0Lzka8GDvB8aQQ3hUpQ5ryTANT7VnDSsMw1tZO0MAAnGCqExOsSpMwq6x3nAj1IIzjdN05FUV2GB9jWLFuF5GERhpF6k0gbAGFjLxFCgSBBER2NdO0ZlWVhtHDC8fgRkR6oKIld1AYAoA&name=vn%20linear)
:::
---
# Terceiro: suavizar a passagem
:::col ratio=65%
Uma única linha muda: em vez de usar `f` direto no `lerp`, passe-o por uma curva que começa e termina devagar.
```js
function suave(t) {
  return t * t * (3 - 2 * t);
}

function ruido(x) {
  let u = map(x, x0, x1, 0, N - 1);
  let i = min(floor(u), N - 2);
  let f = u - i;
  let v = lerp(g[i], g[i + 1],
               suave(f));
  return map(v, 0, 1, y0, y1);
}
```
Esta curva é o *smoothstep*. Ela vale 0 em 0 e 1 em 1, mas chega nas pontas com inclinação zero — por isso os bicos somem.

Pronto: isto é **value noise**, e é a espinha dorsal de qualquer ruído coerente.
:::
:::col ratio=35%
::img src="vn_suave.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWYoABiRDGK7K5lIA3J9qnxtN1BPprrioOT+QA2YWffQCKDXNAAZWmcoA7MqZAwINcwMZtTA9Qa6UThgwAHIMYQMACMXKFsgiDC8RJQ10MDFgOh90vG1ogtoAso6+W6PY4GE99IIYGgOJ9PVpLM84FoAI5mGAMa4BiYSJDF67aMl8T7jXxwLnRiO8uDO6MAdzAUBQSAY1gYEZFhrrDBGjadUzAglQfYHvJGbadg7Tw40DEE0YA2gBdIeySzXfQMckjsDR2NnvD291gADUt+ptMNskECC8Zkm5NV0A1VINsgAXxXfdcXxQliTMPhkhgckUEfT5ZH6Ul9BkXwACoGHQ49ylnYoGAwuC9wYIDJENHE8QJIk+jMLtrnJOB4OfXg1zMaMngpOAWx5BhW15biHX7Z1-xUU82MgclLAwa5D3JMxKV5AS+WE2QR0saNWP7MAiJUtdkmjcZ9ApQRNzAbdeWMs9bxdMyEJUOz7NkQxIOgiTKWUvoNDMFCEz4Clkj43lnXnbiF2Ekj03jLQq30FlPmNAAxMAMAwKkiOGaUgXJMQAGJimqfJLCgABOMRhPS64gQAdRgKdUHlBB8mE6oYEESBNT0eZUs+A8jxPNc4GjBt3QGvAnVbYb70YuzoP0JY4Ho3l9Bo9V6LcoiSNkCQoHa3yYKtQ1PT9L0fSOwNtGDa5Q0NY1NRQDK9qIywkpSnKYGKBVymKGsQGEnrj1Ep0Lzka8GDvB8aVskcBqddjyTAAL7VnIKeO41t3O0MAAnGBafKMkyzIYbjkbHechMCoT1o4EjkVRXYYH2NYsW4XkYRGGkfKTSBsEJ90vEUKBIEEbnYxI7RmVZdmBcMLx+BGbnqikiV3WpgCgA&name=vn%20suave)
:::
---
# O que acabamos de fazer
:::col ratio=45%
Três ideias, e nenhuma delas é complicada:
1. **sortear pouco** — um valor a cada tantos pixels, não um por pixel;
2. **interpolar** — preencher o meio com `lerp`;
3. **suavizar** — entortar o parâmetro da interpolação.

Mudando `N` muda a "escala" do ruído: poucos pontos na mesma faixa dão ondas longas; muitos pontos, agitação.
:::
:::col ratio=55%
::img src="vn_escala.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgkBgTLx8bR8dQQFDXBhQLSCfSKGAMNBmKkMLQTYn8SkU-RmMBQa4IDiWMwQbQoMDXGTaMz6ZJ8AAU1xGSPxhi8yu0130yv01xQZgw1wAlAxgJ9adBrmgAMrTKBy4oARkNAG5PuNfIIGMIGABtAC6rpkDEsmoYcvdDDAXoYAAZnZG5AwAGxxyMAajTxsECC8ZkmcvNfLQcsNLs+Gogwz8Zj4yXp3rlKGNwhYDF8ACo2wxO3LygxrAxit222WgxWq8kZA24M3W6ag7II1HvZYDZq5TPAyo+hppTJxvovHLBD6wH7lSeo2mGA7z9XazAN-3I6WtwwAL5viDXABiYAwGAlm+ww6kCcoavoo6yCB1xAgA6jAYCCKg9oIPkUEMNUMCCJAVp6PMQGfCG+hhhGXhwNGqbkXI3oACwxlRcAZsadb6EscC9jGDDXuRyqKtxDJ8Eek5ytRjgql4hrKjGyoOsq+T5NJr6fBIUB4UJj4Yd+VooKBmlvpY-6AQ6Doxhh7EoAAgkkggQHKAAydA-hQypkHQAByFB0AASuZyxWmAABej4OuUflwCgBa6vq1zKuUMkMPx14AOy0aO74cIKwqiuKMjGHqR7GvOsgeAoSxkAIsqGHKtEpnFMboW+1REt0NLXMKdrFLV4UoD+EqRWIAASAx1mKxJiBhUoyvKxQJQAnAlYgAMTFNU+SWFAc1iMqYg0nSvAGIIWhygtDDkYa2CJdAfCGLwEpHesk3SrKcomYpDDxTtIBLclfD5NUa3bQwu20rADIAJdQGAx3xWdM4TW+U0vY6CW2F9S0wMUSblMUfBAyD+0TLpiGaGGthwxdLI4ZoADnADH1wIxwGUQMiqK7DA+xrFi3DKjCIwmoJ+g4RAl1UYoUNCGL8Ys8SEBVYLUOqvwIyXdUBraN0MscCA75AA&name=vn%20escala)
:::
---
# `noise()`: o ruído de Perlin
:::col
Ken Perlin criou seu ruído em 1983, trabalhando nas texturas de **TRON**. Em 1997 recebeu um Oscar técnico da Academia por isso — provavelmente o único algoritmo com estatueta.

Desde então ele está em praticamente todo filme com CGI e todo videogame com terreno, fogo, fumaça ou água.

O p5.js traz o algoritmo pronto na função `noise()`.
:::
:::col
```js
noise(x);       // 1D
noise(x, y);    // 2D
noise(x, y, z); // 3D
```
- Devolve sempre um número entre 0 e 1 (com uma ressalva importante, daqui a dois slides).
- Valores de entrada **próximos** dão saídas **próximas**.
- Não é uma sequência: é um *relevo* fixo que você consulta. `noise(3.7)` devolve sempre o mesmo valor.
:::
---
# A linha, agora com ruído
:::col ratio=65%
De volta à linha do Pearson — só que o `random(10, 90)` vira uma consulta ao ruído.
```js
let ax = 20, ay = 50;
let t = random(10);

for (let x = 30; x < 440; x += 10) {
  let y = 10 + noise(t) * 80;
  line(ax, ay, x, y);
  ax = x;
  ay = y;
  t += 0.1;
}
```
`t` começa num lugar sorteado do relevo (senão o desenho seria sempre igual) e caminha de 0.1 em 0.1.
:::
:::col ratio=35%
::img src="perlin_linha.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWABsAAYkQwAIzFbmUgDcn2qfG03UE+muuKg5OKXNFn30Aig1zQAGVpgqAOwqmQMCDXMDGHUwfWGz7DWVAgDqMDAglQHMNslt1yBit5DHyvr1wrFkiN418fDgDGEDCFfL4Iyjfu5wdkYYYvmjaugmvJ-KDHE+lmu+gY5LTkej5WTDEjeAY7PZ1cjAGpo3nqbSjamNAwE23uQxm8bTcZyShqQAqBi2ZOfVOQGDkiNxkZ8uB8kbulQRxNwFPbvu9-eyXythjchD8-cAXw4t4gyNRuxg+zWWO4fJhCeADCe+kEkDYOeIoMF4ihQJAghAdW97aMyrI0gwEGGF4-AjEB1QYNcUogfeIDXkAA&name=perlin%20linha)
:::
---
# O passo é o parâmetro que importa
:::col ratio=45%
Quanto você avança em `t` a cada consulta decide tudo:
  - **0.005** — quase uma reta; o relevo mal muda
- **0.05** — ondulação orgânica: em geral é onde está o bom resultado
- **0.5** — saltos grandes demais; volta a parecer ruído branco

O ruído não tem uma "quantidade" própria: o que você controla é **a que velocidade explora o relevo**.
:::
:::col ratio=55%
::img src="perlin_passo.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgkBhePhra4MGBoBi+WDaMCwBhaPgE-oQKl8BAcSxmJkoMDXGRdPQACmuIyR+MJhmuIu0130Iv01xQZgw1wAlAxgJ8INcwMYAMrTKD88rKgDcGuuADEwBgMPyTZ9hnKgfypfo7TI-ChHTAAOowMCCVD80r5N2yca+XzCBgABlN7uqMEEkB1enmtrjsks0oY-PDDDgDCjsfzcijABZo8W4ABqauq9Xu2TJGD6JZwQ3RhjV-MioVdhia7UwfkoVUAKgY+WjoZUvmrUYJRIzDAAvp8JFAU-ThzPNTrPdcnTPLFabQBGM-T5dtlAAQSSggg-IAMnRzRQRWQ6AA5Ch0ABKM43jqYAAF7DmeRrXss-JygqSoiuU0a9iM-YAGxoW6a6SBA7KctyMjGAqXi2mqnweAoSxkAIySEvyZa2MhDDFAA7CGy7VHw2jdIIcocgaxRlph0FwCg5o8ig-JiAAEgMzZctofBiDOfJ8PyZ75CK0YIJWmkMGIADExTVPklhQAAnGIIpiIu4oxjp0b5AwgAoBAwACOZiEjADBmE8fQaEpIAqZAAqXkx2mOdZIAGSxfD5NUJlWfpIC2cSEVOa5PJQIqfAAOcAMfEtKggAEcQGAinKcuqnqbYenaXphkwMUaHlMUgVRal9kZQwNLJNcGCaLSxL6GYAC3UDEtU+gCFKVUcNhyKorsMD7GsWLcCKMKocADBPPoSYQNgMbGqKUBQJAgjHcW2GKRAtGGGqvXal4-AjMd1RKtxp2LSuQA&name=perlin%20passo)
:::
---
# Cuidado: a faixa real do `noise()`
:::col ratio=55%
A documentação diz "entre 0 e 1". Na prática, o Perlin quase nunca chega às pontas.

Medindo 60 mil amostras no p5 2.2.3: mínimo **0,05**, máximo **0,86**, média **0,48** — e os extremos são raríssimos.

Quem escreve `noise(t) * 255` esperando do preto ao branco recebe uma faixa de cinzas. Se precisar da amplitude toda, estique a faixa você mesmo:
```js
let v = noise(t);
let c = map(v, 0.15, 0.85,
            0, 255);
```
:::
:::col ratio=45%
::img src="perlin_faixa.png" width=100%
:::
---
# Oitavas: `noiseDetail()`
:::col ratio=45%
Uma montanha tem a forma geral, os vales, as pedras e os grãos de areia — a mesma estrutura repetida em escalas cada vez menores.

`noiseDetail(oitavas, atenuacao)` soma várias camadas de ruído, cada uma com o dobro da frequência e uma fração da amplitude:
```js
noiseDetail(4, 0.5);
```
- **oitavas**: quantas camadas somar
- **atenuação**: quanto cada camada seguinte pesa (0.5 é o usual)

Atenuação alta dá um resultado áspero; baixa, quase liso.
:::
:::col ratio=55%
::img src="perlin_oitavas.png" width=100%
:::
---
# `noiseSeed()`
:::col
Assim como `randomSeed()`, `noiseSeed(n)` fixa **qual relevo** será consultado.
```js
noiseSeed(42);
```
Sem ela, cada execução gera um relevo novo. Com ela, o desenho é sempre o mesmo.

Note a diferença entre as duas maneiras de variar:
- trocar a **semente** → outro relevo
- trocar o **ponto de partida** → outro trecho do mesmo relevo
:::
:::col
Uma receita útil para gerar variações controladas de um mesmo trabalho:
```js
let versao = 7;
noiseSeed(versao);
randomSeed(versao);
```
Troque `versao` e você tem outra peça da mesma família — e pode voltar a qualquer uma delas quando quiser.
:::
---
# Value noise e gradient noise
:::col ratio=45%
O que construímos sorteia **valores** nos pontos da grade e interpola entre eles.

O Perlin sorteia **direções** (gradientes) em cada ponto da grade, e interpola o quanto cada direção "puxa" o ponto consultado. O resultado passa por zero em todos os pontos da grade.

Na prática: o value noise tende a mostrar a grade em que foi construído; o gradient noise disfarça melhor. Os dois servem, e a diferença só aparece quando você olha de perto.
:::
:::col ratio=55%
::img src="value_vs_gradient.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgANT4GDMMAYEGuYGMfmu+iWYC0yQJVImAG4GIJ9IowBJfKTycTDFSaVooGB+tprhMEBwxRBhgwAJIAOQA0gxhAwxABiYoABmKABZitoxEiGAAhAAyAFVGGrNcVqvlLFAAJzGhgkABKAEEFQBxG3qkAamDFABs5WKfDETI4HEsZgg2hQYGuMmMmgAFHAAIwmka5hhwYp54oASgYwE+XRgWYL+ZNRZLpZjMl4GgYWjVfE0EGKGZGxQY1gY9cLg+HOebny8ZkmGebDBQ7Jl-CWWeLI7LLP0100a74U9b1Yz2pNp6HzpN1j1C+P5-P1kvDBvLdkXmuXnnLYAvrGIPHE2TVM-A0MxP3LStWw8BQljIAR6UMDM9QAdnPcptW1Q9ZGqPhtG6NlrgTKAM31UMsMXZYADFUxQDMxAACQGZINDAbQoxAciljgFAvSSQQIAzMg6AVCg6A9E0hJEsTyOXKBrjQABlaZiLIlsq3bOBDFVBgAG09XPbN0JNYodRNcps3PfTtQAXTU1scWsRyGHpQliR5ClHOsT5SQUpdriBL8GEsMAMAwDNFSVBcuJQBSwAALxrbNVM+aK6JAFyiRJMljGwSlqRgWkGDMNA8S9c1PQYGASrYqAtAgABnt1inKfIzMw18218ZItLVHTtQQZDWoYfqN36p9+pas8EFDWzPmGHcAp1dq-D8oEAHUCsEVAM2zcjLCpBgM2lWU4AYa5LELQxy2POATXyIbboYbNs3ycjSUokKwoXeb-JrC1rW+1aYA2sAtto0pXo66oYEESAFL0eYv0+fb9EO8ZfC8U61U0vrbIYTG5Gxww9LxzGAGoyYgz5ZHRhhejVDMCeHfTy0cBhnXPMBtMsDBripDNulLE0LrVXphzADrZDAC6My5lgGHKCCGC5tVyhZEWnpZX9Wxp9tfDVC6ACogoYY2M3KIcGEHY3LHI2RmPyuBGcep5P3GfRP26nSwGsk0va5smnt9xcheGk0C2eob7tLcjtdkCQoHhvhEbe65fIWmsF2C0KM09H1-T2g6M1plXhpZLm8AYfJy4p8ttBFbRxizYmfZNV2M394ODPDl67te8P2r-WQHKctkOS5LLeSHRzkc+8LlSi5ZYoSnbktbVKxDH4UJ-cmBcv5fLCuKrQiDlD06AAcYAYZISrqsUOrGuRK3JqewbyNpwQet07MEALaxf7lCmk+aw-VQzhzKLNI87YcIUjVPqauc0gYkQwoDDOIMwY7Q-pAGsRkGCwJgCaPUFkTQEMLqjI6qYTpnQuppa6OCsykL4B5Z8G5HoEIYIHA0qcPo5zQb9DM-06D8PWptbaENyLQ1hhAJOKcOoozRu2AmRNcYsgJngFRepSZwFrhWamnU6baWdpbFmTh2ac25rzfmgthbaTFsrSWysZZywVkrUuasTZqmzFrfRtN9YmxtqbQ6FthzWyCnbAxyRtLu0-F-b21kgmWBNHEgOQcgkZgusOXaJoUARIdlxZ2TCWFRONuhWOnwE6yMzh1H6AU85+mESyWpwMxHgwQJDZGRcS7aW1OXOQVca6UxApmHGPtLYmSKcSQOKSEnG2zGwluCTA4TPwcw4kw4ZlBPmandOAis5z2estaKy9EqKw6hvEAWhtBmH0PSfGzDDBaHfKjBKO476LluNcLSXyST1XWMZV+xRnRbg4NrZEqJdgwH2GsLE3BSG3BGBWBgTx9DSNyr0+5UBhRCHRT4xM8FmFIuFIYLw-ARi5WqLzPCeKQDfiAA&name=value%20vs%20gradient)
:::
---
:::center
::img src="ruido_showcase.png" height=80%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBhka4QFDXfQQa6GHT47QSFCebSkhiwSxEp5QOleIl9MxgFkIDiWMwQbQoMD4vwaMxeAAUAEoGMBPh4FEsyAJknxDBKACzFAAMSIYWu1UoA3J9qnxtN1BPprvyoBLihqAGzGz4ksDGADK0ztAEYAOwumQMN3GIgaZ4YCXlPXahD5QOyEkAMTAGEjCb81OuQIA6jAwIJUBKfQgNRnxr5tHAGMIGAB3LkoJBOBjFPXaEY1pj5wu+Rytk1Bxn6BgSisMXq17VGidyfWOmfdADUS5lcqDsnHvlrvX7Gvyg5UmetQLHMH0kp1euKxUdepQUr14wvEtsuoYAE4P-fH7xz5efXfLUf2vbVDUPFRqhgQRIA9PR5mlCDZGHUdxy0KcZy0PBawoHMSAAfRoABJBglwYWNtR9TDSKnBBtWKNdPiPccZFrEMYAlWl1T4GUACpyIQWxSIYH09UMSAJR4hh+NjISyNE2cZLo50kJUccR1rZ9Lw1PV-XyH9pNHWM-WKYSZCU-J41U2RknPJY4E46syJHfiuMk38O2Ely-AkniM1kABfJiGAkKA4L4BCyAAGRID06AzIKIES5FUV2GB9jWLFuD1GFO2ABgnn0GCIGwciZy8RQoEgQRSunBhEu0FU1Vlel3S8fgRlK6oMGuC0Z2SgKgA&name=ruido%20showcase)
:::
---
:::center
# Mais dimensões
:::
---
# `noise(x, y)`: o relevo visto de cima
:::col ratio=65%
Em uma dimensão, o ruído é o perfil de uma serra no horizonte. Em duas, é a mesma serra vista de helicóptero.
```js
let esc = 0.01;

for (let x = 0; x < width; x++) {
  for (let y = 0; y < height; y++) {
    let v = noise(x * esc, y * esc);
    stroke(v * 255);
    point(x, y);
  }
}
```
`esc` é o mesmo "passo" de antes, agora nas duas direções: pequeno dá manchas grandes, grande dá granulado.
:::
:::col ratio=35%
::img src="noise2d_grade.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeVygAGJEMDmcykAbk+1T42m6gn011xUHJxQALAA2QWffQCKDXNAAZWmMoA7MqZAwINcwMZtTA9QbPuNfBNtAxhAxOQhOQBGIWSQ2Wa76Bjkm0MOAOp0CwNyBgAdzAUBQSFDcAA1AnqbTDbJvb7-RoGCNg5zQ7m8EwYGBBKgC0mU58VLxs8lg8bTTByUGAFQMO083Ptu0GmuyYaSoHk+vt4r5fJ9-teE0QFAtrtT2QAX0+q4g6+RqN2MH2ayx3B5MNzwAYT30gkg2BDDC8iigkEE1-zDHX2mZrJpDAfhi8-BG17VBg1xiqGm7LkAA&name=noise2d%20grade)
:::
---
# A grade não precisa virar pixel
:::col ratio=45%
O valor do ruído em cada ponto da grade pode controlar qualquer coisa, não só o tom de cinza:
- o **tamanho** de um círculo
- o **ângulo** de um risco
- a **espessura** do traço
- a escolha entre duas formas

É aqui que o ruído deixa de ser uma textura e vira um material de desenho.
:::
:::col ratio=55%
::img src="noise2d_vis.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgkBjqQxoa46PhoLzE2B9MxgKDXJEMFD9Qy8GBgFBmfR8ZlQMCWGD9CBLQwIDiWMwQbQoMDXGReZ4ZDAACmucHpRNp9P013ZGGuAEoGMBPl4zJNFXqANyfRkCQz8JbK1UMACMxUtnwg1zAxgAytMoIqACzumQs3wTbQMYQMAAMCBjxXpXijLuKVtDlmu+gYivGvjgKeTjgYaYYBbwLvyMYtZYYAGpo14DUbQ7JM9ncxoGCNC04SzWexXnVWB-XG83PiowwxkinPd6YIqCwAqBgR+k91cRkNT2S8nPq4nCY+xiet3een2M65A801yxgDBKsQAYmK1XyligAE4xDvd7I2hgAE4xLhuap8F4irJPScaJrGCC2PSzpJnq-5TgAvmuGDGAw+6KoeUYns6Z4AbIwxarer7FAmgbFNof41hRN4wAA6qygioIqbrpmRDAmmaloMpyEB2nwDpOiMQlapoDqzquFCsSQAD6NAAJIMKuPGTruXSLtY+SwfShmnjW5JQehKhYQMuEtnxl7XrellTg+T6dvoUE0fSxTFAAbPSyR6vS4weYqtgxvS37fgFQUsqFxTOhFDB0TFzkqP0kpLgw1j8X28E9jlRYlkm2UuiVOUkbxu4YTpNWhnVsjmXeHrXFelGLkJrlKs6iX-kscAoAAgkkggQIqZB0AAchQdAAEr0hN01zUJ-UoD6YAAF6Ls65R9csioyWYur0iq9YMAA7CZzq2NpEB1aK4qStKMjGOyFmGp8HgKEsZACMkXKKlWSUJTG-7VHw2jdIIWrigGxSBr5e0DQAYjKKCKmIAASAzJBoYDaHwjHGvKAzcUlSViJoTwQEg1xE6GcqQKT11JShDBiAAR0IR10yA-6MwqirlIGwP0mI2hZvTdXIqiuwwPsaxYtw9Iwj2wD4gYgiQNgsZmYoPJCDr1YMHVBMQP9zLqzyhhePwIw69UuqQzW0sYUAA&name=noise2d%20vis)
:::
---
# Campos de fluxo
:::col ratio=65%
Se o ruído em cada ponto define um **ângulo**, temos um campo de direções. Partículas soltas nele desenham correntes.
```js
let esc = 0.006;
let n = 22;
let p = width / n;

for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) {
    let x = i * p;
    let y = j * p;
    let a = noise(x * esc, y * esc);
    push();
    translate(x, y);
    rotate(a * TWO_PI * 2);
    line(0, 0, 12, 0);
    pop();
  }
}
```
Multiplicar por `TWO_PI * 2` faz o campo dar duas voltas completas na faixa do ruído.
:::
:::col ratio=35%
::img src="noise_campo.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeUAGwABiRDE5XMpAG5PtU+NpuoJ9NdcVBycUACwcoWffQCKDXNAAZWmsoA7MqZAwINcwMZtTA9QbPsMpUDyWIAMTFLkK4raMQG2Q265AgDqMDAglQcqthvGvgm2gYwgYXIQXK5HOFYY0RujDGKxWTsnDDC86YA7mAoCgkE4jcnPpZrvoGOTc2B01zBQxG3gK62ANSd6m0w2yau1+up2JNluj9sQcfd3ufFS8VNwdONgBUeez84XvhG6dHa68G-nua0MeNppg5KXa8jvJ31-cns3XjMkyph5UKFVEEM-CWl9vj7zlKmh-loa4UL6JAAPo0AAkgwa7FIBKhdBePKxryACMxS8gK76yF41wUshAC+nxkRAFHIqiuwwPsaxYtwvIwjuwAME8+iCJA2Cxi2XiKFAkCCDxzYMBR2jMqyNIMIJhhePwIw8dUGDXOKLZUSRQA&name=noise%20campo)
:::
---
# Terreno
:::col ratio=65%
O uso mais direto: ler o ruído como **altitude** e escolher a cor por faixa.
```js
let esc = 0.008;
noiseDetail(5, 0.5);

let lim = [0.42, 0.46, 0.58, 1];
let cor = [[40, 90, 150],
           [225, 205, 160],
           [70, 130, 70],
           [150, 150, 150]];

for (let x = 0; x < width; x++) {
  for (let y = 0; y < height; y++) {
    let h = noise(x * esc, y * esc);
    let k = 0;
    while (h > lim[k]) k++;
    stroke(cor[k]);
    point(x, y);
  }
}
```
:::
:::col ratio=35%
::img src="noise_terreno.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeVygAGJEMDmcykAbk+1T42m6gn011xUHJxQALAA2QWffQCKDXNAAZWmMoA7MqZAwINcwMZtTA9QbPuNfBNtAxhAxOQhOZzbELDcbTTAiBpnhhyfkec78lbDTbeGA0A6GABtZ1y4rBhCK5P5Ww8gCMAF0PbII9prvoY7HY3LuQwAJwVzP5TnZpGfFTN5ux4rFIMMYqczuZhX1xuGlvD2O6mtcnljhtN4et2s1utZuvZ3McT6WIsMckRuAxzkChi7vAMADuYCgKCQB7gAGob9TaUOGBvi9uNAwRnuD5-j1MwIJUG-O8HxnfN3yQGMvWMcldwAKgYO0eU-eC7QNYcI16R191A08kDAcYtwglhIzQWNumzalujvPMW2GSUgXJQt9DIiiaObLwTQgFAYKQtCVAAX0+QSIGE5FUV2GB9jWLFuB5GFP2ABgnn0QRIGwJ0Dy8RQoEgQR1P3BhhO0ZlWRpBgdMMLx+BGdTqgwa4xQPUT+KAA&name=noise%20terreno)
:::
---
# A terceira dimensão como tempo
:::col
`noise(x, y, t)` permite animar sem que a imagem "pule": mantenha `x` e `y`, e faça `t` avançar devagar a cada frame.
```js
function draw() {
  background(255);
  let t = frameCount * 0.01;
  // ... noise(x, y, t)
}
```
O relevo 2D vira uma fatia de um bloco 3D, e o tempo desliza por ele.
:::
:::col
É a diferença entre uma imagem que **muda** e uma que **se transforma**:
- com `random()` a cada frame, tudo cintila;
- com `noise(..., t)`, tudo escorre.

O mesmo truque serve para deformar contornos, mover partículas ou fazer uma cor respirar.
:::
---
# O círculo errado
:::col ratio=65%
Aplicando o ruído ao raio, em coordenadas polares — as duas ideias da aula passada juntas.
```js
let cx = width / 2;
let cy = height / 2;

beginShape();
for (let a = 0;
     a < TWO_PI; a += 0.01) {
  let n = noise(cos(a) + 1,
                sin(a) + 1);
  let r = 90 + n * 70;
  vertex(cx + r * cos(a),
         cy + r * sin(a));
}
endShape(CLOSE);
```
Consultar o ruído em `cos(a)`, `sin(a)` — e não em `a` — garante que o contorno **feche**: ao dar a volta, voltamos ao mesmo ponto do relevo.
:::
:::col ratio=35%
::img src="noise_circulo.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeUACwABiRDE5XMpAG5PtU+NpuoJ9NdcVBycUOQA2IWffQCKDXNAAZWmsoA7MqZAwINcwMZtTA9QbPsaAGJgDAYKnCw3DKVA8liADExWq+UsUAAnGIDbJXdcgQB1GBgQSoOUIfJWw3jXzaOAMYQMADuYCgKCQTgYxWdshTOhGGaY0djvkcRedIpggkgmr08ydn0s130DHJZa0ma5JZUKi0eAYFAjJAA+jQAJKChhaADUg4QXIAjNTaYbSxojZXjaaYOTtNc2XxqcuGBukZ8Rw-H35IOTLwxr1vh3vfD3MwGue+B4AFQMLqQ73gwyQwPoSxwKe6bXj2IFnhelJ3ruT7loBSHPhAr6UiGDAAL6fBIUCtnw7ZkAAMiQmp0AaJEQMiqK7DA+xrFi3C8jCFbAAwTz6M2EDYAwQ4MF4ihQJAgiieJTHaMyrI0gw0mGF4-AjKJ1QYNc4qLkxIBEUAA&name=noise%20circulo)
:::
---
# Espirais ruidosas
:::col ratio=65%
A espiral da aula passada, com o raio perturbado pelo ruído.
```js
let cx = width / 2;
let cy = height / 2;
let t = random(10);

beginShape();
for (let i = 0; i < 1200; i++) {
  let a = i * 0.055;
  let r = i * 0.10 + noise(t) * 45;
  vertex(cx + r * cos(a),
         cy + r * sin(a));
  t += 0.01;
}
endShape();
```
:::
:::col ratio=35%
::img src="noise_espiral.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeUAGwABiRDE5XMpAG5PtU+NpuoJ9NdcVBycUACwcoWffQCKDXNAAZWmsoA7MqZAwINcwMZtTA9QbPsaAGJgDAYKnCw3DKVA8liADExWq+UsUAAnGIDbJXdcgQB1GBgQSockARgQSudn3Gvm0cAYwgYAHcwFAUEgnAxis7ZGmdCMs0xo7HfI4S2XeBoGL5s6roBqEwKU4bqjBBJBNXp5k7PpZrvoGOSK2Bq1zBQw53gGPHilyF0uANRb6m0w3lltabNzgBUDC5CC5+XyTcPvinJ4Y58v8a5DC3RpNxnJKGp5-lW9PlkZIYH0JY4HJDMPz6Z8dGuNk+EpJFgJUNDKxgqdz0MSBySQkMVF8Lds0vLl4ybABfT4JCgYc+FHA0qIgZFUV2GB9jWLFuF5GEq2ABgnn0QcIGwC9Fy8RQoEgQRRM3JjtGZVkaQYKTDC8fgRlE6oMGucVFyYkAKKAA&name=noise%20espiral)
:::
---
# Nem toda variação precisa de ruído
:::col ratio=55%
Pearson lembra que `sin` e `cos` também variam suavemente — e são bem mais previsíveis:
```js
sin(a)
pow(sin(a), 3)
pow(sin(a), 3) * noise(a*2)
```
- `sin` sozinho: regular demais
- `sin³`: achata o meio, exagera as pontas
- `sin³` vezes ruído: regularidade **e** surpresa

Combinar uma função periódica com uma ruidosa costuma dar resultados melhores do que qualquer uma das duas sozinha.
:::
:::col ratio=45%
::img src="sin_cubo.png" width=100%
:::
---
:::center
::img src="campo_showcase.png" height=80%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBg0AwoMDaMz8Qx+GCCMyQKDXBhmNA6PhoLw02AMSwYMxwFkwPqU6kIDiWMwQbQE64yYwoMxeAAUAEoGMBPh4FEsyAJknxDDKACzFAAMSIYev1coA3J9qnxtN1BPprsKoDLijqAGzmz76ATUtAAZWmTvKAEYPTIGBBrmBjP6YIGQxaw+NfBNtAxhAx9Qh9fryvkE7JhvagQB1GBgQSoGVBhDxz6Wa76BgypMMXrp-Vm1tyBgATmzne6AGpBwqlWHZC2vGmdP0+EsAGowUUNmVe6DXNAygDuYCgKCQcqNa59Mqm5dQctDKl4GgYvnTvUcvf7nwLKCLMGbMH0soNRuKxSukaKCHjeP4yrYhq9j2wGgeM4HFEGUF6rBRpBkhV4qPWjZfr4YDTh2DD4XgDDoYRYDDqOr4qC2AiCNOEZRp+XgIHADAAFQMCmRosSMHFce4CqcRQxYkAA+jQACS-HlPm143r4yTTgUCCLsuaSWPaaAAIJCOMMp0XKCCSgAsnwgjOmUmHXi2ACOyn1GpKANggihOl4RrJNZNGQMxrE8QgIxGrZ-kMCFIzebIU7prZcnXmAlhNixbEkfqDAAD7pQwyUMCwDA7nuSAZVlvHdmlmXZYFuVMGWFYgQw1Szt0cUMAAvp87UQJ1yKorsMD7GsWLcEaMJ8cADBPPogiQNgGadl4bmQIIs2EZ12galqioMFAUZePwIyzdUGDXDanbda1QA&name=campo%20showcase)
:::
---
:::center
# A família dos ruídos
:::
---
# Ruído tem cor
:::col ratio=45%
O nome "ruído branco" vem do som: assim como a luz branca contém todas as frequências, o ruído branco contém todas em igual quantidade.

A partir daí, cada "cor" descreve **como a energia se distribui pelas frequências**:
- **branco** — todas iguais; sem estrutura em escala alguma
- **rosa / marrom** — mais energia nas frequências baixas; é o que dá a aparência de paisagem
- **azul** — mais energia nas altas; pouca variação em escala grande, pontos bem espalhados
:::
:::col ratio=55%
::img src="espectro.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgAQUMDDE2mu-XWDCg1z6ZjAFOwOmuaEpWgkMH0gjAWmMfRgXgMSwY834BMs-QAjmYJNoOYYEBxLGYINoUGBrjJLM84HwABTXEZIhgQBkwfWwdz6+aGa6GfXE-QASgYwE+OO0Zn0yS0sAYE3mSv010+hoAYmAMBgtXaANx+FD+oFa21RmNxmAAdRgYEEqC1pXyUc+1Rg7IgAGU9PMI5HPpYSQwteNfGAGMIGAAGaNNvAtgCMrfbDDAAGpBw7kqylnAc-lWwxBwOGAAqBjdhAATn1utnDAALMUGNYBRMrVqm45l32HUvyrZ8zJvdAy3wK7fZMMU1ru6vW0m39cgenM2zbsX14SAYCnVsNxGLdt23fVYMghhNznWCQMNEtYz-cCk0sUNwwANm-Ks7wnFBcSSQQIC1AAZOggwofUyDoAA5Cg6AAJSTUiSzAAAvcDuzzYjZFIrVDXUfVimKKCt27bcQNwsMP2KIiGG4viBNzEDRNNbRJOkpDoLncp5OEhhFPDQTVPU-iP2AszSPIzMqKY1iOP1CgSBobTli1MRqg1Ph1kk-JbBklCbwc3yxBFGBxQAK8VaUxH1Ez8nCndIs+USxD4DBNGCndygM5DMtvABfDg5QVJUVRkYwUDMLwI0dT4PAUJYyAED1DC1bcAHZEPKC8zIC7RukEf0FSgHNt3wny4BQINVRQPyQAACQGMdlW0PgxAUwKc0Q-z9AEYkUsJEAUFuIKGFu2KEqS27MzMPL1AgJYLpa4QWDbBB8IMsQAGJbD4UHQf2sz1TATU7OOkB-UMLQzyefR-TQC6xC8foKTQSA+DQO6CQCmGgrpXl+m0GABWeJHBBgDHkTrSwHR+5d93Mxc-tsMLLqBmBinw4q9pAA7SaO+G+F4swMExkBsZgXH8cJ268oK8mVqtb1DF5DA9ApQqtRZ5tftbBBuz3OdLC5s3bEBkAgeKap8ksKBV0hjhKogZFUV2GB9jWLFuH1GFoOABhUeLOl+15KAoEgQRo+jL3dogHrHXJMAdf4EY6WqDBrnG5OOBAcqgA&name=espectro)
:::
---
# Worley: o ruído das células
:::col ratio=45%
Proposto por Steven Worley em 1996, com uma ideia completamente diferente da do Perlin — e muito mais fácil de entender:
1. espalhe alguns pontos pelo plano;
2. para cada pixel, meça a distância até o ponto **mais próximo**.

Só isso. O resultado tem células, nervuras e uma aparência orgânica que o Perlin não dá: pele de réptil, pedra lascada, espuma, folha vista de perto.
:::
:::col ratio=55%
::img src="worley_ideia.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgAdWu+nGI2wDCgYGGAm0YC0fCWDGuDC81wgKAZ70MjP01zgYDQ1wQHEsZgg2hQYGZfg0Zi8AAoAJQMYCfDwKJZkATJPiGGUAFh1AAYkQxyvr9XKANyfap8bTdQRc4VQGXFHUANgtnyWcBQADFmSgZWIABIDZIaMDaPhiD0yPoCKDXNAAZWmToAjABOGOfca+Hwc4QMADaAF1LbHLASGDLcwwwAxC-rzXW5AwM82wABqTsK-MILxmSYylW0mAANRgooJMv08cTMpNRuK+TNRtn0Hni4Yy7NcuzsZx2gGZn4HJgaAYrIvsB0kAAXlHYxBrkmUFygfLy7JK-pq7W4A2DBNgwAF4NutjAQBnaFsUCpKrG35VjWGgMCMgHAWhYHFBBzZodB25wZ8Ki8ChUCAWmMDtkRKg-tW2jMsMjL0pYjIoIYCpkYWaCQDKUBGmSwwynARojEaXgIMJjIICMe5fsRDCWGAGAYDKTyynxQFGmmaaGtu+T5EaGa7nJxH9KKQkiUuS4xsRAC+nz2Qejj0hyTIstcjRPi+b7XB+FoKUpKliAAxDAxSuuUxRRiANkKUh9EQIxXjMax7G3gE4wyuJkniaJDDafusg4mYF5eGAcADAwACOZh8BgNUwL+MB+LVpLkpoIrUgwfBss8rlcjyfI5ihVWASOSwTlO+gypmrqGbBcm1vM+isoB+ZFvqJb8RehYUVRFbxQxeYpfmcEkb4nGMvUk2smkAkBlVYn+WALG8a2UBoGdH2AVAzbLathZeM2tkMI5sjDO+MCBiAwXFNU+SWFAGbRs2EO+TAuIwGAgioAusVdFDVUSUaRN5f9-I5Y1rLSbFz6vpDn4Bcp0Ow-DiPIzFclUhlhPE9V0laWa5afIpzOukLl7LEmYB3lDaY6v5XooAAgkkggQDKAAydA+hQRoUCQNCxUr0NpggDATF4dVTIy-oeWIRomrp4vG8s0OlIyBhaJGUBaGVFUYEiDvGqa82u960PEeoADnNJtcMABHnXRY7of5WmC2em7DgqLSACX9IMOynIAM+DdcwdO1pkWxaLQUw3DCNIyjWcR2I5TmxMhhaPdSdUinIe6Wmrq2OHAY57IBcMpqGAEpXadprYo-lo5yKorsMD7GsWLcEaMJocARcGIIkAksBVtQGSQhn8DHCRhAmocofAlePwxIMNUs+2rfEAgLZQA&name=worley%20ideia)
:::
---
# Worley em código
:::col ratio=65%
```js
let pts = [];
for (let i = 0; i < 24; i++) {
  let x = random(width);
  let y = random(height);
  pts.push(createVector(x, y));
}

for (let x = 0; x < width; x++) {
  for (let y = 0; y < height; y++) {
    let d1 = 9999;
    for (const p of pts) {
      let d = dist(x, y, p.x, p.y);
      if (d < d1) d1 = d;
    }
    stroke(map(d1, 0, 90, 255, 0));
    point(x, y);
  }
}
```
`d1` é a distância ao vizinho mais próximo — chamada **F1**.
:::
:::col ratio=35%
::img src="worley_f1.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeVygAGJEMDmcykAbk+1T42m6gn011xUHJxQALAA2QWffQCKDXNAAZWmMoA7MqZAwINcwMZtTA9QbPsbNShJUCqULJIbxr4fIYGMIGABtAC6Ttklmu+gY5NdDDAnoYnIFEbkDHlsbAAGpk9TaYbZOG4FHVdANeSAO5gKAoJAGlS8DQMEa5tUFqZgQSoCsqd0ILxmSbk+l8JYANRg+OD5LgPJGlNbAF8OJ8gyGw9Wc16Ywwc3gGMXS0hY3BU+nPoHg6Hw7WV7HaxvG82UBf9zTDypw1AAIxRgCcn-fAcrDHnoe0IlhgYLwGGuSwQJQQwD0zX9nyjKBTRQUdxx5LwEDHECEAnH9fwjCDySgeNX2pV8ENwlQZ1g2RhntGBySeClXx5bkGHfVjinyfIWMnCjZC8E0IGQzCcMfKjZCoqjkVRXYYH2NYsW4HkYVrYAGCefRBEgbBo1jLxFEQoQdNXKjtGZVkaQYRDDC8fgRh06oMGuMVYykqcgA&name=worley%20f1)
:::
---
# Variações do Worley
:::col ratio=45%
Guardando também a segunda menor distância (**F2**), abre-se uma família inteira:
- **F1** — bolhas, células cheias
- **F2 − F1** — as **paredes** entre as células: o padrão de rachaduras clássico
- **F1 invertido** — pontos de luz

Trocar a medida de distância também muda tudo: distância euclidiana dá células arredondadas; a soma dos módulos (`abs(dx) + abs(dy)`) dá células angulosas, de cristal.
:::
:::col ratio=55%
::img src="worley_var.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgANQMYD42muE2wDAAYgBGJEU4rWKkMGAMKBgYYCbSE5lMgCyAj0KE0MQ4ljMEG0KDA1xkXmeGQwAAprnAaWhbtcafprigzBhrgBKBjAT76ARQa5oADK0yg8uK5T1AG5PuNfD5DAxhAwANoAXSdMgYlmu+gY8pdDDAHoYAAYHRG5AxKQAWONgADUaYNboQXjMk3lHgUS1xMHFwflJug5vllPy0b1GtN1dr9b1js+EGuFpQmqB8vbAaDIbDGgYcCjsbHCZbcfHac9xQNRoDsiHofDIwncc3eETde3DHnDEXhs+Kl4o6glKjlJgAE4aVBijf7-7z6vg6HiRBhgwvAxrksP8UEMJcz3fcMoCjVUzQ9YQFwYAB+Bg+GqQx5XHaw-wQOADTTFC0PlTcsK8BARgNMkWWGDCaRGGlSOVbDyLfd9ZDAID5Sg3cryXZln09K84yvKMoDjABfRkMGMCMOK4viDSfESWPPMTwNkcNkmgtU4M9a9kKeLxOOfLCrxpaMaSTcyYxpYp8nyCiGAMzjqWshgADZihsuyzIHVjLDADAFWSXz336cVFTnMcaUpZ98Lo48bJC2RVIDFLVwChVKUpes4yWOAUAAQSSQQIHlMg6AAOQoOgACUaXKqrasdBg8pQC0wAALxgGt7RY1qKy1HV1QAyKAHZ8mi2xF39FLhVFcVJRkYxtUMsCA0LPgljIARkj4dC6ys4pspC6oiW6QRNVFG1iiTNyQta8kpRQeUxAACQGZINDAbQ+DEEKZUgAZbSsqyxAZQAUAh0ABLjAdT2v6WIBuUa1sKyXLB59ACQiClr0hmV+lgdZ-tlIHyksmyaTB69iTQBgAB8oDgOm0wZkY6YRjgUuRVFdhgfY1ixbgaRhTdgEcgxBEgMlJxlKAWSEaXxI4H6IF290xaorx+BGMlql1bRuiViAQDEoA&name=worley%20var)
:::
---
# Blue noise: quando o acaso agrupa demais
:::col ratio=45%
Sortear pontos com `random()` **não** os espalha bem. O olho espera uniformidade e vê o contrário: **agrupamentos** aqui, **buracos** ali.

Não é defeito do gerador — é o comportamento correto de sorteios independentes. Mas quase nunca é o que queremos ao distribuir árvores, estrelas, furos ou pinceladas.

**Blue noise** é o nome de uma distribuição em que os pontos se mantêm afastados uns dos outros, sem cair numa grade regular.
:::
:::col ratio=55%
::img src="amostra_branco_azul.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgAQQY6kMTwYAEczAIUGAoIoYAxYAwvNcIChroYkX5rvolootPSoOTDASBDAwPo+IYEBxLGYINpKUy-BozF4ABQASgYwE+HgUSzIAmS4pVABYAGwABnZxQtaoA3J9qnxtN1BPprjKoCrima7Z8lnAUAAxJkoFViAASA2SGjA2j4Yl9Mj6Aig1zQAGVpp6AOzZxOyca+AAyDGEDGK5stDAAcqXyxb7ZIkzjqmLZddPl4zJN1baGCg24Z+EsVQBGfLs0fFfMMCDXdMD65A3sMSxgDAYL35fJ2vowOUqqtVovsosztcbsMgADEMGt5WK8ZA585DBVhYYYDr5r7X7wNd-ABqQCNW0UVtHGFU21TNAVTPdloLTOC1XZHdG1kRlVUTT4cT4AAvMwMGwAkBiQV842gKk+BZTtuyQFcBwEIdqJgL1jQnBgpxnOcFzdZddwvTdim3Xd+gPI9T1PGcPx8QUywAbQAXXQ1dX3fDRP2-X85AAz9gI1LUkwLDT1AwMj9DrCBCIwdlTPMog62sUcVNkSw1I-Xoyx-Bhen-Kc+26fTNU+FReA07Q6x1FiADV9xZfQoJTJD4OTaBkrVGdQo-KA61HGAAE4XJUNyLJVbQmWGUkGGuSwGRQQwNRyss0EgFUoHZAoEFiuVOQQKAwGGMr2RJDKitkMBapVWSEHGIQUCQUthC8gySLM18y20PtWwUbo+wAXxClQJrfHKWFW+yVrszkHLLKA+yuiyNv2w6DqMuqJS7HsHpnV7XPXTcxGvYpqnySwoHyhMVJKt9yogSqSWq2rZNA8DIJJBA4GGhARlQmdMN7DhPh4xd+L7QSx1Hc0Z39FBcSSQQIBVMg6GrCg6AAJXZZnWY53cafTMA8NY0djWp5Yr0Q2C1WI11lVZBhaWqMwxXK9ZJ3HK0HzFgMr2qDAzFpOcBpgYiJi8PgzMUDtkQYcp2M16dG1e5FUV2GB9jWLFuHZGERk1IV9EESBiO882oH6oQQ+e2UDXFf3+sMLx+BGYi9euZ1o5APagA&name=amostra%20branco%20azul)
:::
---
# Blue noise: melhor candidato
:::col ratio=65%
A receita de Mitchell é quase ingênua e funciona muito bem: para cada ponto novo, sorteie vários candidatos e **fique com o que estiver mais longe** dos já colocados.
```js
let pts = [];
for (let i = 0; i < 300; i++) {
  let melhor, melhorD = -1;
  for (let k = 0; k < 12; k++) {
    let cx = random(width);
    let cy = random(height);
    let c = createVector(cx, cy);
    let d = 9999;
    for (const q of pts) {
      d = min(d, c.dist(q));
    }
    if (d > melhorD) {
      melhorD = d;
      melhor = c;
    }
  }
  pts.push(melhor);
}
```
Mais candidatos, distribuição mais regular — e mais lento.
:::
:::col ratio=35%
::img src="blue_best.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeVygAGJEMDmcykAbk+1T42m6gn011xUHJxQALAA2QWffQCKDXNAAZWmMoA7MqZAwINcwMZtTA9QbPuNfD5DAxhAwANoAXSFhss130DHJNoYYAdDE5Av9cl5nOD-oA1FHqbTDbI-eoMEgvTzk6n9ERA9YAIzulQMT3e30aBi9R2R3p4Bi54oh7oxuOfQt+7RwQOq6Aa8kAdzAUBQSANhcTZe0I07ap7UzAglQI9HbcD9L4SwAajB8V7ye2eRPF62y1BAwBOc+nguj4s+7RE4YMACODGulgYdubCdHJ8daEg5KgfcECgU0UHJR9KUPFQAF8WxUMA3wAhgWAYDMvSIT9RxUNCs0DKArywnCVwImC4Ngr87QQLwzEmckcMXcjPmNTUUElIEqSvSwwAwDByTEABiYpqnySwoFPMRFxvXd71tF83w-HQwACcZyS8BA4B5NSRh5fV3XI5FUV2GB9jWLFuB5GFJ2AVCDEESBsCDEMvEUEChAcyNyO0ZlWRpBgQMMLx+BGBzqgwa4xRDfToKAA&name=blue%20best)
:::
---
# Para que serve blue noise
:::col ratio=45%
Sempre que algo for **espalhado** e não puder parecer alinhado nem embolado:
- pontilhado e meio-tom (*stippling*)
- posicionar vegetação, estrelas, manchas
- amostragem em computação gráfica: o erro vira grão fino em vez de manchas
- ordem de pinceladas, furos de gravura

A imagem ao lado reproduz um tom contínuo usando só pontos iguais, mais densos onde a imagem é escura.
:::
:::col ratio=55%
::img src="blue_stipple.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBg0a4QFBgDB6KDXbAMWAQQxgKCKGAU+lefEoa6GPowLz6W5mABekFJDDMaAYLOF2mZkDM1wQHEsZgg2kJ+L8GjMXgAFABKBjAT4eBRLMgCZJ8QzqgAsxQADEiGOUrVbNQBuT7VPjabqCLnyqDq4r5fLOz76ASktAAZWmvoAnABGIMyBgQa5gYyRmC+wMuxPJ8MoLlArXZ2SWIkYdViADE1uKlu0YgTnxxYjAT0EMDQDi0-U53L5+nJQoYXsUYAkSz6o74PEMZj4yTAPMU1wYTP0fTMNOuevxwxF12FwgY6rgtpG2uELB1n1k418UAYR6gqZQJ7PtuKsZtDFj+UdTh-aMrWLFQ7yTR8kxTYwTwYAAqBgrQQB1bDPOCEKQq1bG1eDEPyEDZH6FAzH0GRxSpfNnggdVYwYawKQYABqcC6MQ8p8ltb94ydJxHB-CCJm0Yjt0TABfbMm14vg0FZCj22FNd2ViGAwG0PhrltcVhXUYlrnXVToBpPgWVXAwtAmLxpz0fRPjAnw2SPABtABdECwKWAkjJSU0IOAz4AHckCJel1TshBxiEFAkDkO1rStBgADJ4pFcdPJNNk8AYWKHX-XVE1kdzNEJNKGIY-DeA0BhtKQXSIIgMwMAwW0qt0ogIOsWMyssGr1TA3oj2AhhegygA2bjuhK7VcpUUCKu0CD9SMmAADUYEVXT1RDaAD3VPyaUizVbU2sN1SmMBBFQTUE2m2QwEsY8ju27Ur1FdVtAQU8dAQc9tTIwk6pgbicX6JSwE0Bh8VgBh6W0fguRvGb7wg2MYGjMqS26sCwAgp44HVb9QvCwRItohhhsdbisYygmJCJpAKYm688uuh8jzQSB1SgW0CgQFa1rSZ9hlermUEMBywCcy60YYET4Zuu6OYYK9mv0IhJsqgZqpViCoG45X5u4mWmcN6bbuPZW1dCrwzEmdVze47QwACcZbY13T3qa120hGD8EGG51pc+Q3DeRVFdhgfY1ixbhbRhEYdUqgxBEgckBosqBnyEFODY4fS0vjgWvH4EZyWqDBrg9bOIBAESgA&name=blue%20stipple)
:::
---
# Simplex: o sucessor do Perlin
:::col ratio=45%
Em 2001 o próprio Ken Perlin publicou um substituto para o seu ruído, corrigindo dois problemas:
- o Perlin clássico é construído sobre uma grade **quadrada**, e deixa rastros nas direções dos eixos;
- o custo cresce muito rápido com o número de dimensões.

O simplex usa uma grade de **triângulos** (e seus equivalentes em mais dimensões), o que reduz os artefatos e o custo.

**Não vem no p5.js** — é preciso uma biblioteca. Para trabalho em 2D, a diferença raramente justifica; em 3D e 4D, sim.
:::
:::col ratio=55%
::img src="perlin_vs_simplex.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBg0GD6LoMAAUgn0ihgDAAjmZFGSoHwAJQMOB+MBoLzjFkkukUlCeASCMz8fQMhAcca+eb6NAMYQMADaAF0ANwcSxmCDaFBga4yYwwKB46VEwxM4CfMnQa5oADK0ygJoZqpkvA0DC8soVKs+lmu+mJEoYYE9AAZlUG5AxivkAGzhsAAagTTK8CC8ZkmRLATp9foDbuDcuj+XjDBYDDDQes1jNn1kgdinssGGufqJlqg1qzDATDAAjAycy7627fHKvPKwCr3ZPFZ6J7Fpwu53KUM7ZABfT5SmXj-a67R8FBErxDrea3XDBgAcQASp75fK+0i+4qkfLrM-X+-n5+3x-f2-J8kRDf9PxA-8QxfSCkT-b0IHVTVtV1Vl2U5YoiTgSAkQYEZIFrF1tEvXwADFilDBB8gYAAqYlDEpfRj3KJlrH7BkcOvci5SJcoGFY+jGJ4wcnAYONPkDQxPUwyAe1w-CaIYMj11dXxCwYZtW30aSZF7U0cMbOUNLbPCdL8IcR18MdiWDXtYiZWjOOUwM4BDT0sJkVju1YlB2Nw1y5RMvjiUbbzzJUoM+zc1zyxGVyAH5+wYbAK30yK5Rcss-IYBLXOSvsnLdOA0uZVzWLASLe04nCRmK2KgtiCqb2KArfDgLiSqCxryIc4pqvaurWK6hTHPEgs1ODAAyKN8nyfSDIYRspuLHCZDlMNPiIiAr0PCAUGuKS4DgaqRhwwRs1lctzWHcKUCskNKKCw6FKe1iRhGBS3uU2QwEsYlbsjEMmX6FAzH0GR1uu-7qNXNc63CwRPTveUzoYABSBhbHglQ+g0UGZChhgCZJeVQOelle0EJ851ot6wo3ZSdLlHa9swqC-JwndJxs918TQeVYkXRUwsZnQBBZorqufHnpS52TytkzmBdkhrFSFhmeyZsXrkw3rcN1zmwG5xrFcbXtXzVi1cbBhgAHZXNoiBnXPNUNS1HU9VxrwiQI2QPAUJYyAEZI+EMIkABZbDZ6NAeU6o+G0bpSWuDUHWKMOYzCpY4BQEjdWPMQAAkBmSDQwEPMRheuMBjDtA0iVsML9UNXn68r6uYCIDRngwIkpfu-IwsDAAZT0+wATjZiZtAokNyhLT4IGuG0+WuIFveU31-SJZzQ3DFk8AYIe941qMfZUTf818d61vDd6D6P3CT+KM-scsMAMB7p4vcX9vMIUqfqr-3cL5e6fcEC2FmilaaA8wrY36FqIk0ZZJHX7ORXsJ0ow4Wfl9c+79P58C9oYNkHJ4AYRZLRABj8KHAJwtYe6Y8cL0MYVgmag4cGyHgceYoMYqK9hQX2NBuEsFYNgQwc8m4fR4N7n2GOhNlgAEEkiCAgESMgdAAByFA6C3hwmozR2inRyOzjaMAAAvGAvcw6Z2WESMQRpCSABQCBgpJyRUhpFAOkfAxA4QEVHYo2DPhZ3zqiYhnIGBOJcbAQm-IhBCgMN4hg5QYx+ICRAc8yJUS7BgPsNYWJuA4RhO9YADAnj6DOhAZKlYvCKCgJAQQlTwznh2sHSSxTamGA5HwEYyVqgtgTo0jgIANxAA&name=perlin%20vs%20simplex)
:::
---
# Voronoise
:::col ratio=45%
Iñigo Quilez notou que o value noise e o Voronoi (o Worley) são casos extremos de uma **mesma fórmula**, com dois parâmetros que os interpolam de forma contínua.

Com isso é possível transitar suavemente entre manchas suaves e células duras — e visitar todo o território intermediário, que não tem nome.

É uma técnica de *shader*: roda no processador gráfico, um cálculo por pixel. Fica como convite para quando chegarmos lá.
:::
:::col ratio=55%
::img src="voronoise.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgANWu+muEGuYGM2AYZjQDC8Bj46hQhN4MGSWig1wYLIwZhgDGJpJ5fHZ+MJfIQHEsZgg2hQYCJ1OeGQwAAprnAkRT1YSUGYMNcAJQMYCfca+AAyDGEDAAjAAWAAM6u0AwtDGKADYANyffQCNloADK0ygSptNr1XpkTkc1KJKGuhgYsApTwYgh9Sfm+m1+mqij4xo0qZdAG0ALoR2SWAkMJUmhhgF3WK0e+tyS3m6NOngAamtLbA3e7BqNkdkgmLDd7VtLJfLn0r1drhdijebDBXeHbTh0zqnLdig+H85U48n1tLxZXU5nlpHKnv1PJHgUS1xMGlBKVDYAVDue31fWuNAlS7A1fzMdUV1-LsGF7H1oCAkCBjAik9SRY972Scl4L9JU0IwhgAF8KxUQjPjIyNiX9BlriBPCSKrfQazrOAXTtFtWLwBhTQ42DLWKI9RwYRjmMLEY2JbcSuJ4hhxO7fjBIfKMGHUKAwC0LwiVgdM+HJeBNIkJYGD4DA4wYawWD8dl2XeBMvEJOAwDQdltFjfMhNkOtDCArRLQdakJnZPySPvOttAbS1LF1T9WM7ZDHRXSLov0JVxLijBwwIkSl18XzzLXLRNz7YzD0NAiFyYnKGGqVcWxqoq12qUq7yUlQwpdcdwtg4zuunBgADJ+tTYsut7LRrxGq9qt6ucPIfMBLBrAhtANVyIBlCBuRC1q6ygF0njgJU1OGJU1Vkx0EC8BAzu0S6EBGNCGDtBA7TtK1Mrm0LCwAdxdTTvqVK1tygdUgd7MwGF-W0PtalRvJTeSdAQZJIYYb7tqU+ZvL4tGMdIgiKKUywwAwZUni8JV4a0aMseudVnqtfJ6YQWwmae9VinyfI9Rhh9+mlFVWN7M6rWKbqRg5jnedkQmiM+YnScBq07XDBgljgFAAEEkkECAlTIOgADkKDoAAldUDeNs3VfVlB-TAAAvGBAfKXnbaVLUdTphhVW6gB2fyrT9sMIwo8VJWlWUZGMbUKcUnR+j4JYyAEFlDCVfJXo58oVZI3NtG6NNrklYNihtN03eWAAxWMlTEAAJAZkg0MBtHzEBeZpSABiVTnmf8sQnilPQE0MMw+Gb9ZO4VHurVsfznrZsQbJgWVExculICQa4xGn7vlXKco2atF71TEbQAEuuX4BMoDMH0p5IqiaLo1WFeVK1lcrjXtbAXX9aNibc2DBLZAJtsse2TsXbfxQHXcwVIABfEBW7shpPoAAR-SRkScfST0MFoeM69SQqRLvGMQHNM4cztBXUOHBkSol2DAfYawsTcHVDCcSwAVIGEEJAck7F5RQDUkIfhLYKJtwgGnQ0iZSReH4CMck1RdQFzEXQwiQA&name=voronoise)
:::
---
# Qual ruído para qual trabalho
:::col
- **`random()`** — decisões, sorteio de peças, agitação. Quando não deve haver relação entre vizinhos.
- **`randomGaussian()`** — quando existe um valor típico e desvios raros.
- **`noise()` (Perlin)** — movimento, contornos, texturas, terreno. O ruído de uso geral.
- **`noiseDetail()`** — quando falta aspereza ou sobra.
:::
:::col
- **Worley** — quando o desenho pede células, nervuras ou lascas.
- **Blue noise** — quando pontos precisam ficar espalhados sem alinhar.
- **Simplex** — Perlin em 3D/4D, ou quando os rastros da grade incomodarem.
- **Voronoise** — quando quiser o meio do caminho entre mancha e célula.

Na dúvida: comece com `noise()` e só troque quando tiver um motivo que você consiga nomear.
:::
---
# Recapitulando
:::col
**Acaso**
- `random()`, `random(a,b)`, `random(array)`
- `randomSeed()` torna o acaso reprodutível
- potências e `randomGaussian()` moldam a distribuição
- 10 PRINT: acaso mínimo + estrutura

**Ruído coerente**
- sortear pouco, interpolar, suavizar
- `noise()` em 1, 2 e 3 dimensões
- o passo controla a escala
- faixa real ≈ 0,1 a 0,85
:::
:::col
**Aplicações**
- contornos, espirais, campos de fluxo, terreno
- a terceira dimensão como tempo
- combinar periódico com ruidoso

**A família**
- Worley: distância aos pontos mais próximos
- blue noise: pontos que se repelem
- simplex: grade triangular, mais dimensões
- voronoise: o contínuo entre os dois mundos
:::
---
:::center
# Obrigado
:::
