::: center
# Programação criativa
## Aula 3 - Posição, direção e tamanho
:::
---
# Layout geométrico

Em outras palavras, **onde**, **para onde** e **de que tamanho** desenhar formas.

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
Podemos escrever cada forma na mão:
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
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWYoABiRDAAjPkuZSANyfap8bTdQT6a64qDk4rsgBsIs+EGuAGUUDKgVTRTIGJYwBgMOSxABiYrVfKWKAATjEqskBu0YAC43JSp5DAA7Pleez2U7ZK73TByXzyv7fdHA8GdG7tB7inzvX6A0H9SHE8nbNH0ww41mE2HyeUvbyC0WOABfDjI1G7GD7NZY7i8mEjGkMJ76QSQbAMLnChheRRQSCCQfDhh1vHM1ndieGLz8EaD6oYa6SkdzkA1oA&name=motiv%20manual)
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
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWYoABiRDAAjPkuZSANyfap8bTdQT6a64qDk4rsgBsIs+EGuAGUUDKgVTRTIGJYwBgMOSxABiYrVfKWKAATjEqskBss130DHJ418YAYwgYXOFDB9eAY+UDYAA1BHqbSDbJtGAAuNyUquQwI0GGAAqBgAdnyvPzvPZ7KdsgAvhxKxBkajdjB9mssdxeTCRjSGE99IJINh-YGvIooJBBH2Awxq9pmayO8PDF5+CM+9UMNdJYHqyBy0A&name=motiv%20for)
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
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWYoABiRDAAjPkuZSANyfap8bTdQT6a64qDk4rsgBsIs+EGuAGUUDKgVTRTIGJYwBgMOSxABiYrVfKWKAATjEqskBvGvhkwn5xX1sks130DHJroYYAYHq5wuDcgYEAjYAA1HHqbSDbIIgxfCyQ7AGFyGFo+Z9ZEHfB6Q44AzJrPynSpeBoGHBQ3X9BT2TyGOVbO2UDWVNowAFxuS4LyAOz5Xnldm9gC+HDnEGRqN2MH2ayx3F5MJGNIYT30gkg2BzEa8iigkEEx-DDAX2mZrN3F8MXn4I2P1Qw10lEYXIBnQA&name=motiv%20dez)
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
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWYoABiRDHKXK5lIA3J9qnxtN1BPprrioOTiuyAGzCz4Qa4AZRQ0qBVJFMgYljAGAw5LEAGJitV8pYoABOMQqyT6iIMLxElDXQwMSBgbRgPg8GAGyABz7jXx8OAMYQMfI8hh8EbRhjFON62ThhjVKMx8oAdnj1STMcVXPTvA0DBkMdtes+lmu+gY5MzYGTZe9cirQu9AGpe9TafqM5XfDG245mzJrAwAIyOlQ6MABcYtmD6CmR3nZ3koSlIz6Lo-jDfkxPbka7-eHo8qE8U2fFXn5RVXhcMAC+HC-EGRqN2MD7GsWLcNutxJsADBPPogiQNgDAdl4ihQJAgjwR2P7aMyrI0gwKGGF4-AjPB1QYNcEo9j+IAfkAA&name=lerp%20circulos)
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
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWYoABiRDGKADYuZSANyfap8bTdQT6a64qDk4rs-kiz4Qa4AZRQMqBVNFMgYljAGAw5LEAGJitV8pYoABOMQqyT68a+GTCBgARi5etklmu+gY5JdDDADHd3pDcgYEGFIYA1HHqbT9bJg3AwwwnhSwLyedHrB7eey8+VbEKfSpg1AM1nyTmGHmIAXeV7eQB2cufWTaMABcbkuAt8p5qCO2QAXw4k4gyNRuxg+zWWO4vJhIxpmYMgkg2Absa8iigkEEu4j0+0zNZG6Phi8-BGu+qGGuktj05A46AA&name=map%20tamanhos)
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
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWYoABiRDHKXK5lIA3J9qnxtN1BPprrioOTiuyAGzCz4Qa4AZRQ0qBVJFMgYljAGAw5LEAGJitV8pYoABOMQqyT68a+KCKa6GBiifWyADaAEZirz+bzivleez2bz-bZgwB2Xm2AC6etkLoYMmEDDdUA9CHGQhQSD1n0s130DHJ6bAXoYXKFDBreAzDbAAGo29TaT7eBoGHBa08KWBeTyM0jPiop9PZCGGAB3MBQIsMax8wWplQROsMGBoMVgODXXn5Lm7tA6MBPSe93wjQd8Ck5j2+sBJ0cnnk3mczqZgQSoKuDDsmO-KOlO-T4uScC8iMwaxkwMD-oBa4gUBIzgQwAC+HA4RAyKorsMD7GsWLcLyML3sADBPPogiQNgdYNl4ihQJAgiMfW2EcNozKsjS2ZgIYXj8CMjHVBg1wSg2eEgFhQA&name=map%20barras)
:::
---
# `constrain()`: manter dentro dos limites
:::col ratio=65%
`constrain(valor, minimo, maximo)` devolve o valor "aparado": nunca menor que `minimo`, nunca maior que `maximo`.

`map()` **extrapola** por padrão. Se o valor de entrada sair da faixa esperada, o resultado sai junto.
```js
let x = map(v, 0, 100, 110, 310);

fill("#e2632a"); // pode escapar
circle(x, 105, 22);

fill("#2b5fd9"); // fica preso
circle(constrain(x, 110, 310),
       205, 22);
```
:::
:::col ratio=35%
::img src="constrain_ex.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWYoABiRDHKXK5lIA3J9qnxtN1BPprrioOTiuyAGzCz4Qa4AZRQ0qBVJFMicjgYWkszzgWnm+jQYAJUC0LLADFgDAAjM6uUa+W7PpYwBgMPLisq9bJ+vjya6eQx2ZHuTHuSrJPrxr4ZMIXeVgwxLNd9AxycmGA601yhYW5AwIKWwABqavU2n62QRBjXBgsjA5vzPR3G01aLkIBBurmfWQF5IMNNPClgXmRmTWF286zR3nO6MJ0e8DQMOCThjT8nJOdrgVrt288puzeNrO+-1iADEMED5WKfDEwoNDC8txgDAmbQ+C8Awt20MAAnGck4FPfJeWKYobxUO8-XJJ9imqfJLCgABOT9S2bH0gJ-fpDGuMCIO0KDtCJYZ9GeCBoPPSMr0FJEt2QlRuTghgEITWQAF8OG9e9yRwwVMyWOAUAAQSSQRGLIOgADkKDoAAlXklNUjT+IYKSUHVMAAC8YHDfI9IMtDURgNAdForUGLEeCLwYRVEMk5ZrJouyaIgOinORXjXIVWwEyEiBkVRXYYH2NYsW4XkYRGGkDwMQRIGwBgSx-RQoEgQQspyiKgIgFlDFS-LDC8fgRiy6oOwlUsIpAASgA&name=constrain%20ex)
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
beginShape();
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
endShape();
```
:::
:::col ratio=35%
::img src="grafico_funcao.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWYoABiRDGKADYuZSANyfap8bTdQT6a64qDk4rs-kiz4RBjXBgwMBwDUjBjCBhchhQDViNBy65iT7DGVA8kARls+RVMj8KFtMAA6lrBKgHQhnaLXeNfCMjQanhSeQxrPayry48VeVMwL7fNY+dHuS7ZF0YOTo2HeQB3MBQFBIXlhl2fCDXABiYAwGCpQdkNuudrEAGJitV8pYoABOMQ5t0e72pv3lGuu6owQSQADKenmrc+lmu+gY5JDDDA+sNwv3cgN3K5x7AAGor9Taa7ZGrtNct7AIIotCaGOboJaH7wNAYOBD0jckwF5LMuR5T4VFguDZGsChPRIAB9GgAEleSQ1CMLHXNAL1A1DEgck4FnWC1R-L9ACTCBgln4GCGGSGB9CWOByUY2RQLgXlEOQtDMIYbCBKRTi4O5EsywrGNM0pUT-y4vgKRGXjEwTeMxNglM0xkiTZLHABfT4JCgFclPzF0jIgZFUV2GB9jWLFuF5GE9WAb8DEXCBsCPBgvEUKBIEEHyLwYKztGZVkaWNMBDC8fgRh86oMGuSVjyskADKAA&name=grafico%20funcao)
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
    line(map(u, 0, 1, x0, x1), y1,
      x0, map(u, 0, 1, y0, y1));
  }
}

padrao(20, 20, 240, 240);
padrao(270, 110, 420, 240);
```
:::
:::col ratio=35%
::img src="coords_normalizadas.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWABsAAYkQxirZuZSANyfap8bTdQT6a64qDk4pckWfYYyoEAdRgYEEqAVypkfhQapg5LEAGJitV8pYoABOMT6z44vEEokMLyKfR8a7kuC8hgjf1wACMfJGweptINsks130DHJ418YAYwgY3OFDBTeDTwYzWYA1AXI58VLwNAwzKms04GHnMxF0wwtMHSyouianhSzHz-aGGH6+SHKWHeW2yyG+V3yT303z+4GwxH9WXZB3ydPZ32h0GI0ukeOVIOGJve-PR0vKSuVABfT53yQGj1QL0+4r+998xUf9lC0VPz1vQVAB2Ps8z5dlP35X99QfZFUV2GB9jWLFuD5GERhpE8DEESBsHTTNnygSBBHw-MH20ZlWSw4jDC8fgRnw6oMGuSVMzgm8gA&name=coords%20normalizadas)
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
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeVbAAGJEMDmcykAbk+1T42m6gn011xUHJxQALAA2QWfCDXADKKElQKpQpkDEsYAwGHJYgAxMVqvlLFAAJxiZWSPXjXzaOAMYQMADuYCgKCQTgYxV1smdOhG7qYMDAglQAaDn1D+gjAEY5Zzg7wNAwZB7k-HHbJLNck+TQ2AI+mGOW8NmBVWANT16m0vUhrMCQQR8sAKgYFAA6iQAPo0ACSAYgGbbvjdHtdDHrfQYve01zZHYdKkzvnDc-Di6TvcMkHJG6nOjAAXG5LgPJGPPKcs3DAAvhw3xBkajdjB9mssdwPIwuGwAME8+iCJA2AMJWXiKFAkCCNBlYftozKsjSDAIYYXj8CM0HVBg1xinWH4gC+QA&name=polar%20pontos)
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
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeVbAAGJEMDmcykAbk+1T42m6gn011xUHJxQALAA2QWfca+bRwBjCBgAdzAUBQSCcDGKQpkvA0OhGmqYMDAglQRpNHE+w0lQPJYgAxMVOfLitoxMqzaqGDItQrOabPpZrvoGOSQ2BrZGGEm8KGBamANRZ6m0s2yEMCQTWpMAKgYFAA6iQAPo0ACSRogUYLTkcDC02kUWnyDCeAVZSM+sgiDDMaD6z2u-eehl4RME1xH5t8A+7pYYAFIGH3hPuGJGVyH9JzreutAB+BgARh9DGwt-yR7bruuQKrtvtKHJF4Y17lB9bwQfIg2PSAYHJdUGCzPozwrbRrjZYtKWHNsVFkbQrVg08GArQxIHJFC0Iw0joNgm8AHZ4J0JCiKEVCVzI7Db2ovC-EIlCg1kABfDg+IgZFUV2GB9jWLFuB5GErWAWd9EESBHxTLxFCgSBBCUzMBO7CAWXnWS1MMLx+BGR9qgwa4xS0jgQB4oA&name=polar%20raios)
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
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeVbAAGJEMDmcykAbk+1T42m6gn011xUHJxQALAA2QWfca+bRwBjCBgAdzAUBQSCcDGKQpkvA0OhGmqYMDAglQRpNHE+EGuAGUUJKgVTTbJLGAMBhyWIAMTFar5SxQACcYmVkjNlmu+gY5NVDDA1s5AozcmNCuzGYA1EXqbSzbJ0wJBNbMwAqBicsq2HMRBgAI6EZgw10+lYtKa19cbCAVLZUbf0z17FfNvig1qeFLAPO5+bX5R5AEY5fGVDowAFxuT1Qwi30GA3tNc2dXKUi+-v99oreeUw3DJByXeeVA9wwAF8OCAiBkVRXYYH2NYsW4HkYStYAGCefRBEgbBGxzLxFCgSBBHQwsQO0ZlWRpBgcMMLx+BGdDqh7MUcxAkAAKAA&name=polar%20espiral)
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
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeVbAAGJEMDmcykAbk+1T42m6gn011xUHJxQALAA2QWfca+bRwBjCBgAdzAUBQSCcDGKQpkvA0OhGmqYMDAglQRpNHE+EGuADEwBgMFTTbJhpKgeSxABiYrVfKWKAATjEyrN-uuQIA6rb7ShZQh8nHhTBBJAAMp6eY+z6Wa76Bjk1UMASCa2c30qFS1uRaihJkgAfRoAElG02a0IGABqLWchCcgCM1NpZtk1YrWsnCs5DAAVDprmz8uvB4I403kjB9Es4OT1SO+rvtFvybXKUjPgOm9orcOrxvDJA70JKQeGAAvp8EhQIWfDFmQAAyJD5nQcZARAyKorsMD7GsWLcDyMJWsADBPPoeYQNgDANgwXiKFAkCCMRpEIdozKsjSDCUYYXj8CMxHVBg1xigKgEcCAAFAA&name=polar%20rosacea)
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
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeVbAAGJEMDmcykAbk+1T42m6gn011xUHJxQALAA2QWfca+bRwBjCBgAdzAUBQSCcDGKQpkvA0OhGmqYMDAglQRpNHE+w0lQPJYgAxMVqvlLFAAJxiZVm13XIEAdVt9pQ7JDn0s130DHJqoYGq1xU5AvTch1eoNOY1AGpM3LqbSzbJE8nUxarZnswwrXgbXbUDmraXjeWaZ8VE5HAwvAYtNpFFovESUNcU3AeSNKf2VBEGLAGGYngwJYoYNhl7I0wJBNa+JoIMVyVbrJaeRqb+qQwPDxbk1qoGBhuT582eeq-4uprPuaarWk8FL6Dy3LGpy0HlDyACM5amgevCQDA34LkiqHPiWOgMAAVDo1xsselLYVWwGyF2+FEYYkDkmRT4qAAvp8bEQBxyKorsMD7GsWLcDyMJWsADBPPogiQNgDBNiOUAfkIMlNhx44QCyhg0mun5ePwIwydUGDXGKOZcSxQA&name=polar%20inversa)
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
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWYoABiRDHKXK5lIA3J9qnxtN1BPprrioOTiuyAGzCz4Qa4AZRQ0qBVJFMgYljAGAw5LEAGJitV8pYoABOMQqyT68a+LzXQwMYQ6fp8JYANRg+Ou+nJ-N5xUVgr1shdDGSA093oZMADQZD7LKvLsjtkEQYUr4yTAUEUME+sfF2kT9N9KcDKGD5J5DC5CAAjMq9Z9LMGGOTY2BE1yhQxB3gGG3bcPRwBqGfU2n63OOBiVhhoMwl1dxgbXbTF0ufWTxjAIRRyys5lR5k-rzdaLRuwxgADnAGPrkeGE+z1A5Ser1kfcAnGckfzgXkfxGXk2zbK8AF8OEQiBkVRXYYH2NYsW4XkYRGGl1wMQRIGwFsRy8c9IEEUjp2Q7RmVZAioDAQwvH4EZSOqDA926EdkJAeCgA&name=vec%20particula)
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
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWYoABiRDGKADYuZSANyfap8bTdQT6a64qDk4rs-kiz4Qa4AMTAGAwVNFMj8KBlQIA6jAwIJUOTyir9cMjTByWIAMTFar5SxQACcYhtnxxeIJRIYlmu+ieVJpn1k-Xx5J5DHjAHZ4+z8jaVDowAFxnHefGAIzKvWyAC+HE+hoEhn4Sw5KaFxeDofDvv1EQYWlD5pgaD8MAYaGuyRgFf0VZrDvz3N5gvTTbDfF1snbssN114ZkEBnLbccDH7xgHQ-7sAYauS11H474tan8dnjZDC91HDLEGRqN2MH2ayx3F5MIjDSA4GIIkDYAmwoMF4ihQJAggQVyUFvtozKssBcGGF4-AjBB1QYNckrIRwIAlkAA&name=t%20translate)
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
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeVbAAGJEMcqczmUgDcn2qfG03UE+muuKg5OKABYAGxCz4Qa4AMTAGAwVOFMj8KClQIA6jAwIJUOyVfrhkaYOSxABiYrVfKWKAATjE1s+hoEhn4S3JAHcwFAUEhHMUeVNzagoz79ZZrvoGOTxr4wAxhAxOYKGFm8AwPfmwABqMvU2n62T9fHk7m5nkARj5PPlAr1Kj6100QYoxpIAH0aABJJzF62yAC+HFnEGRqN2MH2ayx3B5MJGNIYT30gkg2Fz+a8iigkEER7zDHn2mZrJ358MXn4IyP1Qw13F+fnIGnQA&name=t%20rotate)
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
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyeVbAAGJEMcqczmUgDcn2qfG03UE+muuKg5OKABYAGxCz4Qa4AMTAGAwVOFMj8KClQIA6jAwIJUHKVfrhkaYOSxABiYrVfKWKAATjE1s+hoEhn4S3J8u5DBDPv1lmu+gY5PGvjADGEDE5goYibwDEVabAAGpc9TafrZP18eTQ6H8qHyvLrSo-No+ONyQBGBDlfJ1hgAXw4vYgyNRuxg+zWWO4PJhIxpDCe+kEkGwKbTXkUUEggiXqZ7HEbEBZhhn68MXn4IyX1Qw13Faf7IG7QA&name=t%20scale)
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
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGSCfSKGAACgAlAxgJ9LNd9AxyeNfGAGMIGAAGADcDDZeA5ABZeWAANSi6m0mQqLoUtkAKgY5U5SK5qoVSpVDAAjMVOZTuZ9ZLLyVqNcrVbqzQxFcqDZ8AL4cJ2SCA4vEEol+DRmLxUmmfDwKJZkATJPiGcmCvWq4oANn1hul1T42m6JOuuKg5OKgrj9ulw301yBAHUYGBBKgcwh8gXZEWSxSxABiYrVfKWKAATjEBc+XjMkypSdkKFJEEM-CWUa1AHZE58SWSRypZBEGAzK5A+BgB9c-f3pYPh-WGOOBFO+DPijGGAuz5MFPoABqm2sGpyOPl4rpaGBoAwcBLqSsAjvuh5Jp8EDXAAyuOTbgdKlhgBgGDktq2qLtKSxwCgACCSSCBA5JkHQAByFB0AASqqZGUTRZ64SgsFgAAXhS2r5qO57LOSYhboIO57siOqclqt51jxzH8ai5yvu+dZiKqyoScUUnOhwyKorsMD7GsWLcKqMIjDSDBPPoQkQNgXK8l4ihQJAgg2TyDAutoYYRmZjmGF4-AjDZ1QYNcaa8i6IAOkAA&name=t%20shear)
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
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGRPAJ8EieQQwNAACgAlAxgJ8INcAMoofTXIF0gDcn0sYAwGGpAEZigAGWm8mQ6MABcbUsVIhiKhjCiVS2TMgBiAqFks+ww5QIA6jAwIJUNTyvrpYbOTBqWIAMTFar5SxQACcYhtsn6+IVSpVnpVADZ1RwAL4cDg4vEEol+DRmLx0hmfDwKJZkATJPiGakAFnDSuKtgj0uqfG03UEHNxUGpxWLNs+XjMkx5n3ZAkM-CW1JLDBDvqcjgYAAOGBMAI5mGD6KB8bv6Xv9h1Dit+66aAcARQAqgBBABKFDoJ4A+jQAJKjknaMkUqld6Vea6p1tvjtIV+yHsQH2fADsUIZKiOGpjpODBQLKZqaJ8HK7g6h6nueV63qOAFAQOm73gYj7kuaL6ju+n5Sp8EQMPmDDXM+gEwTAfQwJYC4AFd4mAy7SsybJGg6o78oKTZiluMpyhuwYqqKo7aLK2jyqBUlKjJFHSkJQrCmqWHLEeSSCBA1JkHQABy6FKsZZkXjpcAoCyYAAF4OsKoY2SgjogNh66Doq6rbsh1K3o4ha0mIKnlCqxT5GJSy2R5SHAQ6QUhdy-6roB3klhKYUMOU0WltFNrRhAyKorsMD7GsWLcEqMIjAyDAkoIkDYMqqVeIosFCK1YqpcVj4QHmhgNbBhhePwIytdUGDXDWfUcCAkZAA&name=t%20ordem)
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
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4ECWMwQbQoMDXGTGFBmLwACgAlAxgJ8PAolmQBMk+IZyQAWAAMnKRDC5nMpAG5PtU+NpuoJ9NdcVBycV2QA2IWfCDXABiYAwGCpwpkfhQUqBAHUYGBBKg5Qh8sq9cNDTByWIAMTFar5SxQACcYhtn3GvhkwgY+V1sn9DC8rMM1wYQYA7mAoCgkE4GBBdZ9LNd9AxyeGwLGGJzBQwC3g0yWwABqKvU2l62RZnN5jQMWKF4ttuQVts1uufFS8VtwQvkgtVotW6kAKgjUeuocHQ98I1H7YnnKnDFnkbWC4HKnDAkEhaeFPHbd5PIYxW3aYY1hvV95AAkAIIAGTVAH0aABJX0GxULwzEmHUlyXCIGEEMwDCgPgD1kA0BEMfglnJOBeRGG0IKlTR0OPHCl36fFyWsYoFV5cjKODYpeXyYoiMHEiUDIgBGGjrA43lyjohheKY4DrgpIUIMgxwGGSa4ME0A8AF9PgUiAlORVFdhgfY1ixbheRhVdgAYJ59EESBsCLEtIygKBIEEMzOyU7RmVZGkGGswwvH4EYzOqDBrnFEsVLkoA&name=pushpop%20grade)
:::
:::col
O mesmo código sem `push()` e `pop()`: cada `translate` parte de onde o anterior deixou, os deslocamentos se somam e o desenho foge do canvas.
::img src="pushpop_sem.png" width=68%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgkBgAWToAGV8XjtLcwIJrgwoFpBPpFDAkX4YGgGF4zJMABQASgYMHZ1y8vOwHBxfEMDBQDIghks130T3JExZDD42jMaDM-DZAupsGMECQ1PlggFUGp2gEyQlCA4ljMEG0KDA1xkxhQZmFfOAnw8CiWZGtEq5ABYAAzh5kR8M8gDcn2q6u69OujqgXOKoYAbPHPhBrgAxMAYDC8hMyPzS65AgDqMEpqEzCHyecrw30NZgXLEAGJitV8pYoABOMRtz7jXwyYQMfIV2RT9kSwzU2cAdzAUBQSCcDAgFc+8v0DC5S7ADFn4bjDAveH3N7AAGonz7PrJj6el7FLwxrwwf3vA8AJfN9KxUXgNAYOBfy5C8nz-Fs+QAKmXNZrgXCDIN8EZYJ-BDwyQhhUK8FcMPfFQlwEQRfyeYV4IA5kowYYpiP3BhrBYpjmQACQAQQAGULAB9GgAEkJ3AlRpQEQx+CWLk4GZEY2ywvprk0BTqNUrD+mdLlrGKbNmUM4y52KZl8mKHSIL0lADIARjM6wnOZcoLIYdybIYABfT4-IgALkVRXYYH2NYsW4ZkYVw4AGCefRBEgbA-xvUioCgSBBBS-8AqtCAbUlOLMsMLx+BGFLqgwa5tG6G8gp8oA&name=pushpop%20sem)
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
