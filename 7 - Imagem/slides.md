::: center
# Programação criativa
## Aula 7 - Imagem
:::
---
# Imagem

Uma imagem digital é um mosaico de azulejos coloridos. Isso parece óbvio, mas tem uma consequência prática: **toda imagem é, ao mesmo tempo, uma figura e uma tabela de números**.

- Olhando como **figura**, você a recorta, repete, escala, mistura com outras.
- Olhando como **tabela**, cada pixel vira um dado que pode governar qualquer coisa: o tamanho de um círculo, o corpo de uma letra, a direção de um traço.

Esta aula segue o capítulo **P.4 Image** de *Generative Design* (Bohnacker, Gross, Laub e Frohling), adaptado para o p5.js 2.
---
# As duas leituras
:::col ratio=42%
À esquerda, a imagem como a vemos: um rosto, um tecido, uma pérola.

À direita, a mesma imagem reduzida a uma grade pequena e redesenhada a partir dos números: cada célula mostra só a **cor média** e o **brilho** daquele pedaço.

Nada foi acrescentado - só jogado fora. E, mesmo assim, o retrato sobrevive. É essa margem, entre o que a imagem tem e o que basta para reconhecê-la, que a aula inteira explora.
:::
:::col ratio=58%
::img src="duas_leituras.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgAQQY6kMTwYYCeghgaB01zQ1wYljAgjM+i0MCpNIYmmqAy0sAYEDM6n010MCA42muEGGDAAqgAlAAyAH0AGIkCgkBjCBhiYKhcKOFBIAXVBAAdzA3VJMCgYD4CGu+kEjnNlvmNr4kWpNMlBqNaFqUEcUAA7I4ALIwMCGWIwRXqFCK2CKrwGAZxLxO-IABizXjg1gjUZjcY0idjKf6GHTgjEAG4OHxDCMINo6WYWygwBK-BozF4ABQASgYwE+HgUSzIAmSjf7weKWaRDAALDnB-WZAxqnxtN1BEL21B+8VlwA2ddjiVSyzXFC0rV8U3PXwYa6KACSZJg-blStV6ovSRN3FSVfEsTU6Vva4EHJFAhw3WRLAQfpDDAAAvb9FwYcoF0A2RST4cl+0sJdVyXcos0Az4cS0ZIYCMPhaX6KAzDQsAoD4JdmImCQ9A4nQBjMfgGC0bRBP4S9QIYLwIJvO8YI0eDPi8ZCJnQ78KKXSiEOkhBX0UGgwDgAZDCU4CrxfRR72whcnF0qYGVQHSIGuABlFAhSBMzEIdBh+3GXwRggrNawYIK8HsyNBCcsKAGpYuHUdNx8-Q-IChg4GC0LMoilTzSgQ1svixLPhUKkpLACDlwYAAqPygrqvL2MNBhYoyvCyrpMAMAwfsVK8IyTIAbTAABdJd+sGjBDBG1qGAARnG3SBuM6bZra4pRo6sr+m0ODVyzObMrq-goGucjDrahreCspdTtpNqswQfI7qsuanvybaGAAX0+X6gNkFz3M8791y6nr+3mtcdKWOAUGVCU4IBARDGsYxPEsMQwdhlBXPUyHymx5ZcSSQQIH7Mg6AAOQoOhZSXdUaA6nH+zELQCPJSlxXZelGWZMRSMuukzWapA7OKcjT2XZnllZkAKIy7UNjalSHOi3w2ocMSMCExtsD8WlRN89R3QYXltEULQ3R3a4BdKsqDrmpqCrFk63scBgJewqXAP+5FUV2GB9jWLFuCXGEguAAkDEESB9ZC6TFBtIR49C-6LYgGdDBHM2oy8fgRn16pX13NOOBAb6gA&name=duas%20leituras)
:::
---
# Roteiro
:::col
- **Carregar e desenhar** - `loadImage`, `image`, `tint`, recortes
- **Recortes e repetição** - grades, detalhes, realimentação
:::
:::col
- **Filtros e mistura** - `filter`, `blendMode`, `mask`
- **O pixel como dado** - `pixels`, brilho, e a imagem virando outra coisa
:::

A imagem usada em todos os exemplos é a *Moça com Brinco de Pérola*, de Vermeer (c. 1665) - domínio público, e com uma faixa de luz e sombra que serve bem aos exercícios.
---
:::center
# Carregar e desenhar
:::
---
# `loadImage()` é assíncrono
:::col ratio=65%
```js
let foto;

async function setup() {
  createCanvas(460, 540);
  foto = await loadImage(URL_FOTO);
  image(foto, 0, 0);
}
```
A constante com o endereço, quebrada só para caber aqui:
```js
const URL_FOTO =
  "https://thumb.wikimedia.org" +
  "/wikipedia/commons/thumb/d/d7" +
  "/Meisje_met_de_parel.jpg" +
  "/500px-Meisje_met_de_parel.jpg";
```
:::
:::col ratio=35%
Como `loadFont()` na aula passada, `loadImage()` devolve uma **promessa**. Daí o `setup()` ser `async` e a chamada levar `await`: sem isso o desenho começa antes de a imagem chegar.

Duas exigências do endereço:

- precisa ser **acessível por HTTP**, e não um caminho de arquivo local, se você quiser que o sketch funcione para outra pessoa;
- o servidor precisa permitir leitura de outra origem (**CORS**). Sem isso a imagem até aparece, mas ler os pixels dela dá erro de segurança.
:::
---
# `image()`: três chamadas
:::col ratio=65%
```js
const f = foto.get();
f.resize(0, 150);

// 1. no tamanho da imagem
image(f, 20, 30);

// 2. esticada num retângulo
image(f, 170, 30, 70, 150);

// 3. um recorte da origem,
//    esticado no destino
image(foto, 270, 30, 150, 150,
      150, 90, 140, 140);
```
A forma de nove argumentos é a mais útil das três: os quatro primeiros números dizem **onde desenhar**, e os quatro últimos **que pedaço da imagem usar**.
:::
:::col ratio=35%
::img src="tres_chamadas.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQKCQGMIGGJgqFwo4UEgzGhqggAO5gbpgdRQMB8BDXfSCRy8-nzIV8SLXNBoXGGVnszmOKAagDsjgAsjAwIZYjAyeoUGTYGSvAYBnEvBL8gAGR1eODWfWG42mjQWk3W-oYO2CMQAbg4418lmuKGuYckED4hhGEG0DEsZhTKDAuL8GjMXgAFABKBjAT4eBRLMgCZKJgsAFnrjqRDGKAEZHUW47JqnxtN1BPprhmoAXivWAGxdz76ARQBUAZWmo6105kDAg10NMCXMBXa9kUZjdIYfG5z18GGuigAkk9BDAC8TyVSaWvy8rIyej9cEA+UMW3Zpgg-SGGAABej7NgwbZOu+64RDBCAbtcDCaE8EBIKhUBaAKfAPmgnx4Q+BaWC2xTQeUnZxp8iGlAwExZtoihaBAHJ9BoABHQhmFeRH3o+ZEwVqlHQSJLawdRHC0Y4DDlMh7H9Di+hLAwOEMGKYAEUiMkqAxwxgMx84oWpjGQNc-H4YJ0bXOR4lydBkkSU6OnrnpshOQwACcjlNhJTZrgAvhwyKorsMD7GsWLcC2MIjKWDBPOKkDYAwjohgw1pQEKQipelDDBSmNaJglQqGF4-AjKl1RXv2GWFSAgVAA&name=tres%20chamadas)

Repare na segunda: dar largura e altura **deforma** a imagem. Para preservar a proporção, calcule uma das duas a partir da outra.
:::
---
# `tint()` e `imageMode()`
:::col ratio=65%
`tint()` multiplica a imagem por uma cor, e o quarto argumento controla a opacidade.
```js
const f = foto.get();
f.resize(0, 160);

image(f, 20, 30);

tint("#2b5fd9");
image(f, 170, 30);

tint(255, 110);
image(f, 320, 30);

noTint();
```
`f.resize(0, 160)` usa o zero como "calcule este lado para manter a proporção".

`imageMode(CENTER)` faz os dois primeiros números do `image()` serem o **centro**, e não o canto - prático quando a imagem vai ser girada.
:::
:::col ratio=35%
::img src="tint_modos.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQKCQGMIGGJgqFwo4UEgzGhqggAO5gbpgdRQMB8BDXfSCRy8-nzIV8SLXNBoXGGVnszmOKAagDsjgAsjAwIZYjAyeoUGTYGSvAYBnEvBL8gAGR1eODWfWG42mjQWk3W-oYO2CMQAbg4418lmuKGuYckED4hhGEG0DEsZhTKDAuL8GjMXgAFABKBjAT4eBRLMgCZKJgsAFlsjqRDGKAEZHUW47JqnxtN1BPprhmoAXivWAGxdz76ARQBUAZWmo6105kDAg10NMCXMBXa9kUZjdIYfG5z18GGuigAkk9BDAC8TyVSaWvy8rIyej9cEA+UMW3Zpgg-SGGAABej7NgwbYTp2cafAKfAPgWlgtsU0HlPBHCfFmEAAWIADExTVPklhQAAnGIB4MEhKFoTBWqYdh8ayHhAHFPk+Qtm2HY0XRj4MeUGEtlh77rpuFCQABa4AL4cMiqK7DA+xrFi3AtjCIylgwTzipA2AMI6IYMNaUBCkIhnGQw8kpjWiY6UKhhePwIyGdUV79iZtkgLJQA&name=tint%20modos)
:::
---
# Recortar e copiar
:::col ratio=65%
Três maneiras de obter um pedaço, com finalidades diferentes.
```js
// get(): devolve uma imagem nova
const a = foto.get(150, 90,
                   150, 150);
image(a, 20, 40);

// copy(): escreve numa imagem que
// já existe, esticando se precisar
const b = createImage(120, 120);
b.copy(foto, 150, 90, 150, 150,
       0, 0, 120, 120);
image(b, 190, 40);

// get() sem argumentos: uma cópia
// inteira, para não estragar o
// original ao filtrar
const c = foto.get();
c.resize(0, 150);
image(c, 330, 40);
```
:::
:::col ratio=35%
::img src="recortar.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQKCQGMIGGJgqFwo4UEgzGhqggAO5gbpgdRQMB8BDXfSCRy8-nzIV8SLXNBoXGGVnszmOKAagDsjgAsjAwIZYjAyeoUGTYGSvAYBnEvBL8gAGR1eODWfWG42mjQWk3W-oYO2CMQAbg4418lmuKGuYckED4hhGEG0DEsZhTKDAuL8GjMXgAFABKBjAT4eBRLMgCZKJgsAFlsjqRDGKAEZHUW47JqnxtN1BPprhmoAXivWAGxdz76ARQBUAZWmo6105kDAg10NMCXMBXa9kUZjdIYfG5z18GGuigAkk9BDAC8TyVSaWvPhEGA+UMXsAxYMk1wYMkMAMByWgCnwD5oBu1y1uWyq+Fo9JHtcCDfgWbZOi2ACczafCohFEcRDBYc2pFOgeDCQQ+BZ8C2xTkfWnZxh+jg6NcXgjL+DATBWIEbuB1H3jAMEAI5mDAbEMLEACHvFwIaSwthMWbaHO1y5gwXj9NohoGAheK+NUJ4VnwSx3lBj5toxLY2SxnxcjiXEFqhdnYQweHueRZFIgRxHkT5tmkYxVE0Y+1R2V5DDMe+66fhhJbGDBBiCByEgxmEYFPDoADPXjCtJkBLGAs4tv6WgQAAx5pqmzoIBgMNc0limAgiQHwPB8JplhgBgKCzvohn4qmKHRmhiXdjoCD9IYYAAF6Pj5lFTeFBbaC25TlExDkQAAvhwyKorsMD7GsWLcC2MIjKWDBPOKkB-o6IbaYoQpCE9L0HSmNaJrdQqGF4-AjH+1RXv2X2HXtQA&name=recortar)

`get()` **sempre** devolve uma imagem nova. Filtrar `foto` diretamente alteraria o original para todos os exemplos seguintes.
:::
---
# Imagens feitas por você
:::col ratio=65%
Nem toda imagem vem de um arquivo. `createImage()` cria uma vazia, para ser preenchida pixel a pixel; `createGraphics()` cria uma tela fora do vídeo, para ser **desenhada** com os comandos de sempre.
```js
// pixel a pixel
const a = createImage(120, 120);
a.loadPixels();
for (let y = 0; y < 120; y++) {
  for (let x = 0; x < 120; x++) {
    const i = 4 * (y * 120 + x);
    a.pixels[i] = x * 2;
    a.pixels[i + 1] = y * 2;
    a.pixels[i + 2] = 180;
    a.pixels[i + 3] = 255;
  }
}
a.updatePixels();
image(a, 20, 30);

// com os comandos de desenho
const b = createGraphics(120, 120);
b.background("#2b5fd9");
b.noStroke();
b.fill("#f0ead6");
for (let k = 0; k < 9; k++) {
  b.circle(random(120), random(120),
           random(14, 44));
}
image(b, 170, 30);
```
:::
:::col ratio=35%
::img src="imagens_proprias.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQKCQGMIGGJgqFwo4UEgzGhqggAO5gbpgdRQMB8BDXfSCRy8-nzIV8SLXNBoXGGVnszmOKAagDsjgAsjAwIZYjAyeoUGTYGSvAYBnEvBL8gAGR1eODWfWG42mjQWk3W-oYO2CMQAbg4418lmuKGuYckED4hhGEG0DEsZhTKDAuL8GjMXgAFABKBjAT4eBRLMgCZKJgvlACMjqRDAbWsdRbjsmqfG03UE+muGagBeKABYAGydz76ARQBUAZWmI6105kDAg10NMCXMBXa9kUZjdIYfG5z18GGuigAkk9BDAC8TyVSaWvPhEGF4wHABqevz+AzlsqvhaPSFZ8Esd58A+BYNsUzatghB6nggV6KDQgEYIYxZdmmYoMAWEYMCMJ6OiGJFyEh5EkQA1LRJZluuh4EURGgMHAZEUZxeDUdx9GMZ8Kg6CBDBgCeY4MAAVIRpEyfBjoMLRHEocJIrfr+2EANpgAAuienEycUeFqQgGkDIYOlKa2+n0nJDDGUJKjqVhlnicpxS2a2tjkU5sguZpbnWeUXnFPk+QmQwAC+nwxeuIr5lAkEwJhgW4Z8AowY+fAtghLblB2cYfo4IloAw1yGKVc4VQwsC1RMEhINcwF4r41QnhBSwAOKzl4SBgAccF5dRKFcj2fYDkO0AFmIADExTVPklhQAAnGIo3pNcC4oIOQLpeuXKWGAGAYDNICzZYjoKFAE7rXhUb6IRxG9PSNG9LxK0Ud0Amlk5XLaGAATjAWs7QAqQ0di2oPzmgENFkifnCcJ0Pgw2Y4tmOY5FihcWyJlsHVC2baIQVa5xciqK7DA+xrFi3AtjCpHAAwTzipA2AMDR1pQEKQgczRcXaDWialrVhpePwIwc9UV59hR5NRUAA&name=imagens%20proprias)

Os dois servem de destino para `copy()` e de máscara para `mask()`, e os dois respondem a `get()` e a `pixels`.
:::
---
:::center
# Recortes e repetição
:::
---
# A imagem inteira, numa grade
:::col ratio=65%
O primeiro exemplo do capítulo não recorta nada: ele desenha a **imagem inteira** em cada célula de uma grade. Como cada célula é quadrada e a foto não é, o resultado é uma deformação regular.
```js
const n = 5;
const lado = width / n;

for (let gy = 0; gy < n; gy++) {
  for (let gx = 0; gx < n; gx++) {
    image(foto,
          gx * lado, gy * lado,
          lado, lado);
  }
}
```
No livro o número de colunas vem do mouse, e a imagem vai de um retrato reconhecível a uma textura abstrata conforme a grade fica mais fina.
:::
:::col ratio=35%
::img src="grade_inteira.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQKCQGMIGGJgqFwo4UEgzGhqggAO5gbpgdRQMB8BDXfSCRy8-nzIV8SLXNBoXGGVnszmOKAagDsjgAsjAwIZYjAyeoUGTYGSvAYBnEvBL8gAGR1eODWfWG42mjQWk3W-oYO2CMQAbg4418lmuKGuYckED4hhGEG0DEsZhTKDAuL8GjMXgAFABKBjAT4eBRLMgCZKJgvlAAsjqRDEbjqLcdk1T42m6gn01wzUALxQbADYO599AIoAqAMrTYdaycyBgQa6GmALmBLleyKMxukMPjc56+DDXRQASSeghgBeJ5KpNJX5eVvhk9PynZ0794imuI9eSgNknDXONPijfQGALCMGEEEYj0dEN4MQvBwNQgBqTCSzLVd9zFGC4MEOAkJQki5AwkjsNwz4VAYAU+DvAsD2uJE6PoziKIAKn-WcWwQhheP4fiOM4lQRLYvjrj3FQAF9PgUiAlORVFdhgfY1ixbgWxhRDgAYJ5xUgbAGGQhhrSgIUhFM8ylO0GtE1LBghUMLx+BGUzqgvXsUJUuSgA&name=grade%20inteira)
:::
---
# Um detalhe, repetido
:::col ratio=65%
Agora o contrário: a grade inteira é preenchida com **o mesmo recorte**, tirado de um ponto qualquer da imagem. Um detalhe pequeno vira padrão.
```js
const n = 6;
const lado = width / n;
const sx = 178;
const sy = 190;

for (let gy = 0; gy < n; gy++) {
  for (let gx = 0; gx < n; gx++) {
    image(foto,
          gx * lado, gy * lado,
          lado, lado,
          sx, sy, lado, lado);
  }
}
```
:::
:::col ratio=35%
::img src="detalhe_repetido.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQKCQGMIGGJgqFwo4UEgzGhqggAO5gbpgdRQMB8BDXfSCRy8-nzIV8SLXNBoXGGVnszmOKAagDsjgAsjAwIZYjAyeoUGTYGSvAYBnEvBL8gAGR1eODWfWG42mjQWk3W-oYO2CMQAbg4418lmuKGuYckED4hhGEG0DEsZhTKDAuL8GjMXgAFABKBjAT4eBRLMgCZKJgvlAAsxSRDEbxSLcdk1T42m6gn01wzUALxQbADYO599AIoAqAMrTYdaycyBgQa6GmALmBLleyKMxukMPjc56+DDXRQASSeghgBeJ5KpNJX5eVvhk9LHnZ0794imuI9eSgNknDXH8cTxX44CPABGLVbAgv8kzggBOR040+KN9AYAsIwYQQRiPDCCKIvBwNIgBqSiSzLVd9zFXD8MEGD6RIli5AoljqNoz4VAYAU+DvAsD2uJE+P4ySOIAKn-WcW0IhhZP4eSJMklQVLEuSxLU9S-DgFskxbTTjIAvcVAAX0+KyIBs5FUV2GB9jWLFuBbGEiOABgnnFSBsAYEjrSgIUhH8kibO0GtE1LBghUMLx+BGfzqgvXsQwYOyLKAA&name=detalhe%20repetido)

O recorte saiu do olho. Repetido, deixa de ser olho e vira trama.
:::
---
# O mesmo, com sorteio
:::col ratio=65%
A variação que o livro propõe: em vez de um ponto fixo, sortear a origem de cada célula **numa vizinhança** do ponto escolhido. A trama ganha variação sem perder a unidade.
```js
const n = 6;
const lado = width / n;
const cx = 225;
const cy = 215;

for (let gy = 0; gy < n; gy++) {
  for (let gx = 0; gx < n; gx++) {
    const sx = constrain(
      random(cx - lado, cx + lado),
      0, foto.width - lado);
    const sy = constrain(
      random(cy - lado, cy + lado),
      0, foto.height - lado);
    image(foto,
          gx * lado, gy * lado,
          lado, lado,
          sx, sy, lado, lado);
  }
}
```
O `constrain()` é o que impede o recorte de pedir pixels fora da imagem.
:::
:::col ratio=35%
::img src="detalhe_sorteado.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQKCQGMIGGJgqFwo4UEgzGhqggAO5gbpgdRQMB8BDXfSCRy8-nzIV8SLXNBoXGGVnszmOKAagDsjgAsjAwIZYjAyeoUGTYGSvAYBnEvBL8gAGR1eODWfWG42mjQWk3W-oYO2CMQAbg4418lmuKGuYckED4hhGEG0DEsZhTKDAuL8GjMXgAFABKBjAT4eBRLMgCZKJgvlAAsxSRDEbxSLcdk1T42m6gn01wzUALxQbADYO599AIoAqAMrTYdaycyBgQa6GmALmBLleyKMxukMPjc56+DDXRQASSeghgBeJ5KpNJX5eVvhk9LHnZ0794imuI9eSgNknDXH8cTxXxtDgI9imKfIIL-bQRjggBGRCOE+KN9AYAsIwYQRUPpR0Q0I1C8HA8iAGpqJLMtV33MU8IIwRYJIsi2LkKi2No+jPhUX8oL8dihOGadIALATBL6GcFQLGCGGsf9ZxbRTqJU64iyRaTBMdFsD2uHkwBApAlM0vcZMg-EkyPayUAkiApMYmTp2geSUPM-hVJ0VCNO8rSdJcvSDOjIypjAQRUC8gDLMEgU+DvAtDKCmS0sI2CACpNJbIiGGygLUvSwTCpy3T0sMOAWyTFtSoCuKGAAX0+ZqIFa5FUV2GB9jWLFuBbGFUOABgnnFSBsAYUiGGtKAhSECapta7Qa0TUsGCFQwvH4EYJuqC9ezI9rGqAA&name=detalhe%20sorteado)
:::
---
# Realimentação
:::col ratio=65%
Uma câmera apontada para a tela que mostra o que a câmera vê. Aqui o efeito é simulado copiando pedaços **do próprio canvas** de volta para ele, muitas vezes.
```js
const f = foto.get();
f.resize(width, 0);
image(f, 0, 0);

for (let i = 0; i < 70; i++) {
  const x1 = floor(random(width));
  const w = floor(random(10, 26));
  const x2 = round(
    x1 + random(-7, 7));
  const y2 = round(random(-6, 6));
  const fx = get(x1, 0, w, height);
  image(fx, x2, y2);
}
```
Cada passo lê uma faixa vertical e a cola deslocada. Como o passo seguinte lê o resultado do anterior, o erro se acumula - é esse acúmulo que desmancha a figura.
:::
:::col ratio=35%
::img src="realimentacao.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQKCQGMIGGJgqFwo4UEgzGhqggAO5gbpgdRQMB8BDXfSCRy8-nzIV8SLXNBoXGGVnszmOKAagDsjgAsjAwIZYjAyeoUGTYGSvAYBnEvBL8gAGR1eODWfWG42mjQWk3W-oYO2CMQAbg4418lmuKGuYckED4hhGEG0DEsZhTKDAuL8GjMXgAFABKBjAT4eBRLMgCZKJgvlAAsjqRDCbjqLcdk1T42m6gn01wzUALxQbADYO599AIoAqAMrTYdaycyBgQa6GmALmBLleyKMxukMPjc56+DDXRQASSeghgBeJ5KpNJX5eVkaPB+uCDvKGLnbTBB+kMMAAC9715KA2RbdsAIFPg7wLSwYJg19VyjfQGALCMGDAI9HRDXC5AYLUCNwgBqciSzLVdZBxPFfDgABGT8LzFAtp2gBUC0gtkiz3FR6PxblWOudjONnNACyY5sGGKCcBLo98GDgYojwHIcC0+FQVJY8i+hnbjrC1Ftl0UnRlJGNT6Q06AOMMqTrDHFsFIApSGLTOAj1-AtmJQhhuRbKYwEEVBzPgxDLDgFtVJbKyBIAXw4JKIGRVFdhgfY1ixbgWxhEZSwYJ5xUgbAGDI60oCFIQyrIlLtBrRNCqFQwvH4EYyuqC9e0IlKQASoA&name=realimentacao)
:::
---
:::center
::img src="showcase_1.png" height=80%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBhka78QQwNAMWB9GDaa76JZhBhadSGJ4MSzXFDXJEMIkMeZQPgUwwkmAMTRPCBIa78qBgSwwfoQakIDgUiDDBgAVQASgAZAD6ADESBQSAxhAwxMFQuFHCgkGY0NUEAB3MDdMDqSV8BCUwSOJ0u7lgPiRa5oNDXZVWm12xxQaMAdkcAFkYGBDLEYNr1ChtbBtV4DAM4l5vfkAAwlrxwaxJlNpjMabPpvP9DCFwRiADcHD4hhGEG0TLMfZQYDDfg0Zi8AAoAJQMYCfDwKJZkATJbuTgCcZfZpZL087MgY1V53UE+mug6gk7EAGIAIwP8p3vhifeffQCKDBgDK0yvd+KN9DyVFVmVZY1aQdZ5fAwa5FAASSeQlJw1HV9UNICFzDUDnjgbsIIAbTvAA2Et2QfMiGFjAAWHdKPKaiAF0D1kZl9AYSdxl8XoTRLdsGF6PAmVw7sEHGIRrX47oAGppNnedD1kECYMUa4IMsETDAI7pmM+JTsN8GQTWKYiGGkgSGAAKgYO9qJYlQ2I4riGDACC+JcuQGAgfiwFk+S9JUZS-DgCCP2gYNJwo9knjgSK73ydkwOuR0wCga0GGsXhVIyhgt2nICVECgy-BGULPwirdor4WKNwSpkWWSqYwEEVAcv4L8coAvcCsKnRiqgEKTTCr80Enax2rU6ySwQWiGCdNKkDa7KpoQYiesKoK7jK8LRvG5aGGm2ampa3xMomqyDtW9aVC8MxJhnezCpQMLDH4JZJwGsyso6xwGGKdktvM87fsAx6VHPTR3uGiKCMouH2QACQAQU1XVtRoeD2WsZHUfR+DGPysHZFdPhkKSrHgb+inspB9kJrp1SkQC3qVEMOB2R7Bmvy565rtkLxrina6AF9PlFiBxeRVFdhgfY1ixbh2RhUrgAYJ59EESBsAO-i8ygSUhG19zxe0Vd8NVyVDC8fgRm16pYO0bp+Ml4WgA&name=showcase%201)
:::
---
:::center
# Filtros e mistura
:::
---
# `filter()`
:::col ratio=42%
`filter()` aplica uma transformação a todos os pixels de uma vez. Chamado solto, age sobre o canvas; chamado como `img.filter(...)`, age sobre a imagem.

Alguns aceitam um parâmetro: `THRESHOLD` recebe o corte (0 a 1), `POSTERIZE` o número de níveis por canal, `BLUR` o raio.

O espalhamento `c.filter(...op)` é cômodo quando a lista de filtros é um dado, como aqui.
:::
:::col ratio=58%
::img src="filtros_ideia.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgkBgARzMMAYljAGCW+gAFABKEl8ABe2AYWnUhieDDAT0EMDQSIYZnZuj4TygWlgDCgYGGAm0YD4CA42muEGGDAAqgAlAAyAH0AGIkCh44QMMTBULhRwoJAC6oIADuYG6nJgkvl130gkcjud8zdkWuaDQysMVptaFqUEcUAA7I4ALIwKWxGA69QoHWwHVeAwDOJeL35AAMRa8cGsieTqfTmdTOf6GHzgjEAG5FSHfHQAMpkTXG00gADExSLxQALMVtGI+QBBABaaq1DBNYmH1XyligAE5WxwOJYzBBtCgwMq-Bo+JS4ABGPkjPlwYq04CfYb6a5AynXmNF6ktvwoO+QIAOpJoIqBfggABsf6fF0MBXreDD3gwj4MNYDDXkWd6wTIDAQNcXaAR+CF-iSZIYF+P64bIgFykI4xXsUd4PsU6GYUhIzsfkrHsdenEMAA1Aw+S4QAvnuEB8IYIxHiSh7HqeMjGCgZheDSDAvnhHgKEsZACMk0mUj+2EMOUJY0Qw1R8No3SCO+h5QJS44wW22kdiS1woNcy7Mvazy+Bg1yKAAklyCGarqBpGrhnxKiqvhaCalhedcCDcigNJubI8r9IYYD0ghpnXluv7ZRy4WUnwfLmTVZWSbI8WqtUvnyhlWWfHapLkjAVIAOIajOVCWZyfDcpS1R8sUMY8WZ9WSO5CU6L5drtZZ2gIN1FKUhQAASGrdrtJBakQfJFggY6ieVo3jdofL5COdWxXhKmXuZQnMg6YBQNaH3XsxmHFLNxRQVdr4Xs5M0ffKjo-Ugf0A-9s35Fhz2yARRFAaR-5LHAKB6sqmViMGBGGDm2gwGIZG4ygXYFQh-HU8sM5JIIECUmQdAAHIUHQGp8kaNCWd1lHzoulk05SYibWS20DUN1LTgwlLvcJMPfb9wkg6JTgMIj5SuZ8kvS1tvU7fth3HadSuQ-k0NfXDH0o7+uv64beHGyA52XYryLK9Ndtqw7msiajrt8teD1o+RGCUf9ZUMDTBMQETqICIY1jGJ4lhUzjyx04VX7lBLyxSyAHpgIIkB8BgSuq59sO-Y4etTeUT7lZ73kqhKxKyhA9J8ErAf2438PNwDxRtyXeNl14-TeQwxLVPoMrXErD1FiPGtjy3etT25nwi1+Y4JzTBcM+3ifM6z7OczzfMCyQQsd6XYjaIoWhCiKWhjcShjXMvYkWgbo8g5CnJMK8+R-wAf0ZkOhrheDlOxKSPl-6AIYD5CuVcpK12RJ8FQshyjFimlBd2EkIDIlRLsGA+w1hYm4HyGEXFgAMCeJ6SATIiz-hzFASUQhOH-nIe-CAhlDCaQlFKLw-ARhMmqEFWygiOAgDEkAA&name=filtros%20ideia)
:::
---
# A lista de filtros, como dado
:::col ratio=65%
```js
const f = foto.get();
f.resize(0, 120);

const lista = [
  [GRAY], [INVERT],
  [THRESHOLD, 0.5],
  [POSTERIZE, 3],
  [BLUR, 3], [DILATE],
];
const rot = ["GRAY", "INVERT",
  "THRESHOLD", "POSTERIZE",
  "BLUR", "DILATE"];

textSize(11);
textAlign(CENTER, TOP);
noStroke();
lista.forEach((op, i) => {
  const c = f.get();
  c.filter(...op);
  const x = 18 + (i % 3) * 146;
  const y = 14 + floor(i / 3) * 150;
  image(c, x, y);
  fill(100);
  text(rot[i], x + c.width / 2,
       y + 126);
});
```
:::
:::col ratio=35%
::img src="filtros.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQKCQGMIGGJgqFwo4UEgzGhqggAO5gbpgdRQMB8BDXfSCRy8-nzIV8SLXNBoXGGVnszmOKAagDsjgAsjAwIZYjAyeoUGTYGSvAYBnEvBL8gAGR1eODWfWG42mjQWk3W-oYO2CMQAbg4418lmuKGuYckED4hhGEG0DEsZhTKDAuL8GjMXgAFABKBjAT4eBRLMgCZKJgsAFnrjqRDHKxUdRbjsmqfG03UE+muGagBeK9YAbJ3PvoBFAFQBlaYjrVTmQMCDXQ0wRcwZer2RRmN0hh8bnPXwYa6KACST0EMALxPJVJpq-Lysjx8P1wQ95Qxa7NMEH6QwwAALwfZsGAARnbN81xxPEL0NTRjwAbU+WQ0IAcSJABBKgAF0WzQ68ADkADU6CJChiMwhg0IoAAJIk6HnJiSBJIgW0dBB8jotcsJoEh5woajrwALToFtygElQGIAIRJYkZOIhiiGvEk8LEuSGEIwDEPxQdfHpDCQFwgixBbMRyKomirPosRmNY9jOKIKyGRAYTRPEqSHMEzylOJDyxA0rSxLEfSOE+JY4BQedwIfaDoP3BhYpQPCkkECACzIOgyLEokWxpGhUo3ecUEHIEAM+JJhhFKN9DoXskALAtri8FswBLYQWFLejDN8VN6UsX8NBqgLtAQSwwAwJZ9ALBAlo61LZEGhg4GPaDbAYABqBgCzABgAFJWxLAAqGCJ0AtaPwYEYtvrPa00vMVDqcM6GEu6CnRuhgBT4e8C20Fs4BbEZVrTWaMALaDnUh9KC2MtCwDUzb9qm3koDZD7iiRej5Pu57YMnQCAF9VzJjhkVRXYYH2NYsW4FsYQe4AGCecVIGwBhHRDBhrSgIUhB5vmGCplMa0TUsGCFQwvH4EYeeqS8+35iWQDJoA&name=filtros)

Cada iteração parte de uma **cópia** de `f`, com `f.get()`. Sem isso, os filtros se acumulariam um sobre o outro.

No p5 2 essas constantes são na verdade cadeias de caracteres (`GRAY` é `"gray"`), o que não muda nada no uso, mas aparece se você imprimir uma delas.
:::
---
# `blendMode()`
:::col ratio=65%
`blendMode()` muda a regra de combinação entre o que já está no canvas e o que vai ser desenhado em cima.
```js
const f = foto.get();
f.resize(0, 120);

const modos = [
  BLEND, MULTIPLY, SCREEN,
  OVERLAY, DIFFERENCE, LIGHTEST,
];
const rot = ["BLEND", "MULTIPLY",
  "SCREEN", "OVERLAY", "DIFFERENCE",
  "LIGHTEST"];

textSize(11);
textAlign(CENTER, TOP);
noStroke();
for (let i = 0; i < 6; i++) {
  const x = 18 + (i % 3) * 146;
  const y = 14 + floor(i / 3) * 150;
  blendMode(BLEND);
  image(f, x, y);
  blendMode(modos[i]);
  fill("#e2632a");
  circle(x + 68, y + 86, 64);
  blendMode(BLEND);
  fill(100);
  text(rot[i], x + 50, y + 126);
}
```
:::
:::col ratio=35%
::img src="mistura.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQKCQGMIGGJgqFwo4UEgzGhqggAO5gbpgdRQMB8BDXfSCRy8-nzIV8SLXNBoXGGVnszmOKAagDsjgAsjAwIZYjAyeoUGTYGSvAYBnEvBL8gAGR1eODWfWG42mjQWk3W-oYO2CMQAbg4418lmuKGuYckED4hhGEG0DEsZhTKDAuL8GjMXgAFABKBjAT4eBRLMgCZKJgsAFnrjqRDHKxUdRbjsmqfG03UE+muGagBeK9YAbJ3PvoBFAFQBlaYjrVTmQMCDXQ0wRcwZer2RRmN0hh8bnPXwYa6KACST0EMALxPJVJpq-Lysjx8P1wQ95Qxa7NMEH6QwwAALwfZsGAARnbN81xxPFfCVOdDGPABtT5ZAAIRJOgADkiBbXUCRJChrxoEkqBbecyCJOgCKRLCGBIAA1OhSQAQWohgiGvCkKQ4giyDoFsSWvABxAAJCg6HnCgmLXABdQDEPxQdfHpTCQFwgiiDEFsxBIsiKKogzmLEWj6IIgyGRANiOJJbjbLEPiBKE-CRPMtdZDEcTpNk+SxBUjhPiWOAUHncCH2g6D9wYcKUE4pJBAgAsRPw2SiRbGkaHijd5xQQcgQAz4o30BgCwjBgwGPR0QxquQGHHBqwAAajaksyx8nQPwYOBj2g2wGDayraoAUlbEsACoYInQDZDU3wRkG+sRrTS8xQLWrHCmhhZugp0FoYapxmgXVbgfXTCPi2QBT4e8C0sFs4BbEZbpOs6oAu2ACxQ65DHQsAlI+ywwAwDACzEABiGBinHNs+DED7tDAAJxgLAbRvHWw3vW2xxxbcd6w+06JG+y6C2uohQfByHoOdD7EoLDSgaUl71qdPHRtgydAIAXw4QWIGRVFdhgfY1ixbgWxhFbgAYJ5xUgbAGHqhhrSgIUhFV9Xhe0GtE1LBghUMLx+BGVXTuuPsGuFkB+aAA&name=mistura)

`blendMode()` é estado global: vale para tudo o que for desenhado depois, até você voltar para `BLEND`.
:::
---
# Misturar duas imagens
:::col ratio=65%
`blendMode()` governa o **desenho** no canvas. Para combinar duas imagens e guardar o resultado numa terceira, existe `img.blend()`, que tem a mesma assinatura de `copy()` mais o modo.
```js
const a = foto.get();
a.resize(0, 190);

const b = createGraphics(a.width,
                         a.height);
b.noStroke();
for (let k = 0; k < 40; k++) {
  b.fill(random(255), random(255),
         255, 120);
  b.circle(random(a.width),
           random(a.height),
           random(20, 90));
}

a.blend(b.get(),
        0, 0, a.width, a.height,
        0, 0, a.width, a.height,
        OVERLAY);
image(a, 30, 20);
```
:::
:::col ratio=35%
::img src="blend_imagens.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQKCQGMIGGJgqFwo4UEgzGhqggAO5gbpgdRQMB8BDXfSCRy8-nzIV8SLXNBoXGGVnszmOKAagDsjgAsjAwIZYjAyeoUGTYGSvAYBnEvBL8gAGR1eODWfWG42mjQWk3W-oYO2CMQAbg4418lmuKGuYckED4hhGEG0DEsZhTKDAuL8GjMXgAFABKBjAT4eBRLMgCZKJgvFcqOpEMBuOotx2TVPjabqCfTXDNQesAFgAbO3PvoBFAFQBlaZDrUTmQMCDXQ0wecwRfL2RRmN0hh8bnPXwYa6KACST0EMALxPJVJpy-Lyt8Wnp++uCFvKGLHaPBB+kMMAAC87ybBgAEYAE42zjV88V8apDwrPglgAcSnLwkDAA4CxFXkoDZJFPhUciKMoqiRSmMBBFQXcGC5NdZxQfsgX-T4o30BgCwjBhenpR0QwEuQGGHYSBIAaikksyxXTsEEsMAMAwAsp2gBV63yfIi2bDSZzQbTdNIhSqJbHTmyg4p4LIpj9jAAJxnU6ctMIsBiKQPS7PMvpXKMmiDXolBvLM3yDK0mzmzgotGIAXw4T4RWqcZoALLlf2LUzfIYSDIPczzm0CujUGy3y8qKnkPJIwDaOCsrzJIAA1OhSQAQSoRiBT4W8CObRtmxs5cEogZFUV2GB9jWLFuGbGERlLBgnnFSBsFykTrSgIUhDWySRu0GtE0WoVDC8fgRjWlLrh7ESRpAOKgA&name=blend%20imagens)

A vantagem sobre `blendMode()` é que o resultado é uma imagem, e não um estado do canvas: dá para filtrar, recortar e reaproveitar.
:::
---
# `mask()`: recorte com forma
:::col ratio=65%
`mask()` usa o **canal alfa** de uma segunda imagem para decidir o que fica visível. Onde a máscara é opaca, a imagem aparece.
```js
const f = foto.get();
f.resize(0, 200);

const m = createGraphics(f.width,
                         f.height);
m.noStroke();
m.fill(255);
m.circle(f.width / 2, 70, 118);
m.rect(48, 140, 110, 46);

f.mask(m.get());
image(f, 30, 20);
```
O `createGraphics()` começa **transparente**, e é isso que faz a máscara funcionar: só o que você desenhar nele terá alfa. Pintar um fundo preto não mascararia nada.
:::
:::col ratio=35%
::img src="mascara.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQKCQGMIGGJgqFwo4UEgzGhqggAO5gbpgdRQMB8BDXfSCRy8-nzIV8SLXNBoXGGVnszmOKAagDsjgAsjAwIZYjAyeoUGTYGSvAYBnEvBL8gAGR1eODWfWG42mjQWk3W-oYO2CMQAbg4418lmuKGuYckED4hhGEG0DEsZhTKDAuL8GjMXgAFABKBjAT4eBRLMgCZKJgvFAAsjqRDEbjqLcdk1T42m6gn01wzUHrDYAbB3PvoBFAFQBlabDrUTmQMCDXQ0wecwRfL2RRmN0hh8bnPXwYa6KACST0EMALxPJVJpy-Lysjh-31wQt5Qxc7aYQfpDDAAAvO9m1bZ0XxXHE8V8NBDwrPglgAcSnLwkDAA4C0sHkwCgNkkU+FQSNIsjyNwqYwEEVBdwYNB0muWcUAHIE-0+BjLDADAMHrfJ8johjtDAAJxhwvCCKQJxWxbLUIIARnk2xBMAmBtF-BtbBbeSm20+SILHaC9wQJ5AQLBif2LOiBT4W8cJbcoIOKds4wAXw4ZFUV2GB9jWLFuBbGERlLeiDEESBsAYR0QwYa0oCFIRIuihh3JTGtExCoVDC8fgRki6pz17GLUpAVygA&name=mascara)
:::
---
# Um parêntese: e os shaders?
:::col ratio=44%
Quase tudo desta parte da aula - filtros, misturas, ajustes de cor, distorções - pode ser feito também com um **fragment shader**: um programinha que roda na placa de vídeo e calcula a cor de cada pixel **em paralelo**.

A diferença é de escala. `filter()` e os laços sobre `pixels` percorrem a imagem um pixel por vez, na CPU. Um shader trata milhões de pixels por quadro sem esforço, o que muda o que é possível fazer **em tempo real**.
:::
:::col ratio=56%
Em p5.js isso aparece como `createShader()` e `createFilterShader()`, no modo `WEBGL`:
```js
// para reconhecer quando vier
const s =
  createFilterShader(fonte);
filter(s);
```
Vamos deixar o assunto para mais adiante, porque ele traz junto uma linguagem nova (GLSL) e um modelo de execução diferente.

Por enquanto fica o mapa: **o que você aprender aqui sobre o que fazer com os pixels continua valendo; o shader muda só onde a conta é feita.**
:::
---
:::center
# O pixel como dado
:::
---
# O array `pixels`
:::col ratio=58%
`loadPixels()` enche o array `pixels` com os canais de cada pixel, em sequência: vermelho, verde, azul, alfa, vermelho, verde, azul, alfa...

Para chegar ao pixel `(x, y)`:
```js
const w = img.width;
const i = 4 * (y * w + x);
const r = img.pixels[i];
const g = img.pixels[i + 1];
const b = img.pixels[i + 2];
const a = img.pixels[i + 3];
```
Depois de **escrever** em `pixels`, é preciso chamar `updatePixels()` para que a mudança apareça.
:::
:::col ratio=42%
::img src="indice_pixels.png" width=100%
:::
---
# Uma armadilha de densidade
:::col
Numa tela de alta resolução, o canvas guarda mais de um pixel físico para cada pixel lógico. `pixelDensity()` devolve esse fator - tipicamente `2`.

Isso vale para o **canvas**. Para um `p5.Image` carregado com `loadImage()`, a densidade é sempre `1`, e a conta do índice é a simples.
:::
:::col
```js
// numa imagem: direto
i = 4 * (y * img.width + x);

// no canvas: vezes a
// densidade, nos dois eixos
const d = pixelDensity();
i = 4 * (y * d * width * d
       + x * d);
```
Na dúvida, trabalhe sobre uma imagem e não sobre o canvas: além de mais simples, é mais rápido.
:::
---
# `get()` ou `pixels`?
:::col
`img.get(x, y)` devolve `[r, g, b, a]` e é a maneira mais legível de ler **um** pixel.

Só que cada chamada carrega os pixels de novo por baixo dos panos. Numa imagem de 500 por 585, são 292 mil chamadas para percorrer tudo - e o sketch trava.
:::
:::col
A regra prática:

- **um punhado de pixels**, ou um ponto sob o mouse: `get()`.
- **a imagem toda**: `loadPixels()` uma vez, depois o laço lendo `pixels` direto.

Nos exemplos a seguir a imagem é primeiro **reduzida** com `resize()`. Uma grade de 40 por 47 já dá o suficiente para reconhecer o retrato, e são duas mil células em vez de 292 mil.
:::
---
# De cor para brilho
:::col ratio=45%
Para controlar um tamanho, uma espessura ou um ângulo, três canais são demais: queremos **um** número. O brilho é essa redução.

Os três canais não pesam igual, porque o olho é muito mais sensível ao verde do que ao azul:

$$\text{cinza} = 0{,}222\,r + 0{,}707\,g + 0{,}071\,b$$

Não existe conjunto de pesos "correto" - este é o que o livro usa. O importante é usar sempre o mesmo, para que as comparações entre pixels façam sentido.
:::
:::col ratio=55%
::img src="brilho.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBhka5oa4MFD9Qw6ATPUnJMD6PhoBhmOkQBkwfTXBAcbTXCDDBgAVQASgAZAD6ADESBQSAxhAwxMFQuFHCgkAzqggAO5gbpgdRQMB8BDXfSCRya7XzPV8SL4gncpUqtC1KCOKAAdkcAFkYGBDLEYML1ChhbBhV4DAM4l4TfkAAwxrxwaxen1+gMaYP+sP9DCRwRiADcHK5PLoAGUyAKpTKxABiYox4oAFmK2jESIYAEEAFq8wXS2UgOvVfKWKAATjbDEFHf5HYAcgApDv92swYoANnKxT4BY4HD4hhGEG0DEsZmPKDAXL8GjMXgAFABKBjAT4eBRLMgCZIH+-rxsxu25Rxo+hYyAw1R8No3SCKy55QPeTbrqBb7Fr4ljXCghIynw6rPL4GDXIoACSTyCDA94CiK4qSih4EYVhCCEYoNBgHAAyGE+YGfDiDIMF4bEDAwUBaJYUEwKh3K+Am-bFAAjIB-EjLJAFgbInJSQwYD9o2DAAFQMPeXjKQZDFspqUDKgwADU-FwHR6loX0-ZmQgAnsRghgANpgAAuu2gguZhbLuRxPk2Qwcn+RBQWMaFnnhbZxS+WpOhOfMhjXKSMpeTGZTFMU7Z5a6MaukVCClVFqUaTy2jkj6-ZefoAXttUKWSTyED4hMjViMkLLqBgSDXJOfUsrAo0gHwABeZgYGI7XgTVviciSvWDtoMblGOxTVJNNZyZYrp8Ju+27SO44LdVTnaJA01aDK+j6fxExZblvkRYFBkZW9UURdUz0-d5yXceBOKEvFwkwAwRpgORaCfF1pbEtcQJcaeYAYBg97NQwgitQ5fQwNoKD3gB7bkwwO3ttTDDIalliY9jckKaBRLLKKXKkwCAiGNYxieJYYhs0scAoKWYDTRRcmlPkIvLB2SSCBA95kHQc4UHQ-LtpKNCE6L3PmHS8WTrY67tnJAH6xzXP3mItpZWG2gSSA8tixLUv3jLbOM1jXtW6lBt2yAwcRU9tmTZ9EWR7ZAMR67pvm5F+S2HRPGOAwB4QQYNKklAWVkhAFKfAbitwyrgp0KKFDtmrGta4TGFPfe4y+L0MoxvmDC9HgDDlF33TWdZz6vuBjmacpMr5MUEW9AZzapbISMo2jPtM-eq0TF53S+YTsj9CTXtjopIztk8D51UXPrb9FinFPk+RFRbsaPhbthAXvGN+wpMZuygnMQENoYXm-MWRgCFq7LuBsPbS2KJ-IOXV1DeR3hbY+7ZlLWEinAxeX9mYvygTbQBwcHaGCdi7P+MCvZyQQHLHBQdL4UhvtHDYDA4ADgikDG+QFGzvwYMpWyY5CYAF89xgwzoSEkc1ND50+MMVkaN6y-y7nI1GMAADq3pBCoC9mUQmXRpZoMiq6XhjZKZyWMYTZe8iKJrz9rdCA91CYH1Jo2EqFNFK01pvTT4vtmaswIWLABQCQEC3AcLAJ4tJawJoX-MuytVbq01trBgutrZi2DoSaonghojWRAwfIckk6WyUSXQhhsSFkPCezd2USvbYNwf7Ep4EEGWA3ndPgT9Iqv3yYU5+qdQayF8feMsFZ+QkD-kE4hXJHbiSqdA2pclyixKVhXKuNdcSJIboHZYwd7H3X7HlAqM9w4MGKqVPGEU8qVQgpOOShjFGN3XsUiZtsebclAYLOZyxKHewiXElWdckk6xIHrbZ6SxCEn6voWAL1gFQ2mgwfqUtSTvFJAARzMNDQkM05rti8EaDFWKYY5IYBIdixotAHkMDqNsnwVCyC3HfaedEREQGRKiXYMB9hrCxNwVqtxlLAAYE8Y0kBsCnK7mGKAeohDis7gwVll8fykiFXqUh-ARjiuqIRaCXdWUgCEUAA&name=brilho)
:::
---
# Círculos a partir de pixels
:::col ratio=65%
O exemplo central do capítulo: cada pixel vira um elemento gráfico, e o brilho governa o tamanho.
```js
const f = foto.get();
f.resize(34, 0);
f.loadPixels();

const fw = f.width, fh = f.height;
const lado = width / fw;
noStroke();
for (let y = 0; y < fh; y++) {
  for (let x = 0; x < fw; x++) {
    const i = 4 * (y * fw + x);
    const r = f.pixels[i];
    const g = f.pixels[i + 1];
    const b = f.pixels[i + 2];
    const cinza = 0.222 * r
                + 0.707 * g
                + 0.071 * b;
    const d = map(cinza, 0, 255,
                  lado * 1.25, 1);
    fill(r, g, b);
    circle((x + 0.5) * lado,
           (y + 0.5) * lado, d);
  }
}
```
:::
:::col ratio=35%
::img src="pixels_circulos.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQKCQGMIGGJgqFwo4UEgzGhqggAO5gbpgdRQMB8BDXfSCRy8-nzIV8SLXNBoXGGVnszmOKAagDsjgAsjAwIZYjAyeoUGTYGSvAYBnEvBL8gAGR1eODWfWG42mjQWk3W-oYO2CMQAbg4418lmuKGuYckED4hhGEG0DEsZhTKDAuL8GjMXgAFABKBjAT4eBRLMgCZKJgvlAAsjqRDCbjqLcdk1T42m6gn01wzUALxQbADYO599AIoAqAMrTYdaycyBgQa6GmALmBLleyKMxukMPjc56+DDXRQASSeghgBeJ5KpNJX5eVkaPB+uCDvKGLnbTBB+kMMAAC970bFt2wAywEAvRQaDAOABkMf8ODfPFI25T8eTAKA2RbSwkBwqYwEEVAAJxTDeEUa4j15fDiMcNNuQA9c5xQAcgTQ1co30BgCwjBgRiPR0Q2EuQ0yQcSRgAalkksy1XfcxQEoS4FE8SNLwFitPkxTPhUHR3wYMAjwbBgACoBJE6zLGw2SGDgPcjOM6j+PpWCvCQlCAG0wAAXQAoyqPxQQcO85CMEMfyGEcgBGILDJUULfGqCKfOi2LHOKJLlJSkztEgUCtHpR0ymKYorL6ZLXLqlRHPKrVHS1arg3y+r6sahAWvi6rqmCgrqKgI8nkLIqIBKqCW2KfJ8iRWrOvq-hZ2q+Kynmhh4pcozLDADAMALfQW0EFtqh2lKwACcYCwLDTuvyEtrJW64Fo6zqCxEh6npo2cWygC6AF9PmBiBQeRVFdhgfY1ixbgztuETgAYJ5xUgbAGDEhhrSgIUhAxrHQe0GtE1LBghUMLx+BGDHqgvXtxPBwGgA&name=pixels%20circulos)

Repare na inversão: quanto **mais escuro** o pixel, maior o círculo. É o que faz a sombra virar massa.
:::
---
# O mesmo laço, outro traço
:::col ratio=65%
A leitura dos pixels não muda; muda o que se desenha em cada célula. Aqui, um traço inclinado cuja **espessura** vem do brilho.
```js
const d = map(cinza, 0, 255,
              5, 0.4);
stroke(r, g, b);
strokeWeight(d);
const px = (x + 0.5) * lado;
const py = (y + 0.5) * lado;
line(px - lado / 2, py - lado / 2,
     px + lado / 2, py + lado / 2);
```
A imagem ganha direção e uma textura de gravura, que vem toda da inclinação constante dos traços.
:::
:::col ratio=35%
::img src="pixels_linhas.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQKCQGMIGGJgqFwo4UEgzGhqggAO5gbpgdRQMB8BDXfSCRy8-nzIV8SLXNBoXGGVnszmOKAagDsjgAsjAwIZYjAyeoUGTYGSvAYBnEvBL8gAGR1eODWfWG42mjQWk3W-oYO2CMQAbg4418lmuKGuYckED4hhGEG0DEsZhTKDAuL8GjMXgAFABKBjAT4eBRLMgCZKJgvlAAsjqRDCbjqLcdk1T42m6gn01wzUALxQbADYO599AIoAqAMrTYdaycyBgQa6GmALmBLleyKMxukMPjc56+DDXRQASSeghgBeJ5KpNJX5eVkaPB+uCDvKGLnbTBB+kMMAAC970bFt2wAywEAvRQaDAOABkMf8ODfPFI25T8eTAKA2RbSwkBwqYwEEVAAJxTDeEUa4j15fDiMcNNuRgsUGALCMGBGI9HRDbi5DTJB+JGABqUSSzLVd93YziNAYOBeP4xS8BY5TxMkz4VB0d8GDAI8GwYAAqDieJMyxsNEhS920nTqP0HCvCQlCAG0wAAXQA7SqPxQRHOcjBDDchgrIARk8rSVB83xqn85DAuCqzigi6Sot07RIFArR6UdMpimKYy+ki2ySpUKzcq1R0tUK4NUtK0ryoQKrQsK6o42Kuz8SgI8nkLDKICyqCW2KfJ8iRDr6pKsaGFyhsbO04YByBAt9BbQQW2qeaVEW64gQAdQNci-ygLbZGihhXSPAtFMa-ISxM-hZy8tLqK8Hj6QLHjbvumino6rp70u6xfro5jihbN6GGBx7QYYcGJu0y6rJhpw4Yhr6QdR4pX1SgBfT58YgQnkVRXYYH2NYsW4Dbbh44AGCecVIGwGb+OtKAhSEFm+IYQntBrRNSwYIVDC8fgRhZ6oL17fjidxoA&name=pixels%20linhas)
:::
---
# E o mesmo laço, outra forma
:::col ratio=65%
Com retângulos girados pelo próprio brilho, aparece um relevo: as áreas claras ficam alinhadas, as escuras embaralhadas.
```js
const ang = map(cinza, 0, 255,
                0, HALF_PI);
const lp = map(cinza, 0, 255,
               lado * 1.3,
               lado * 0.3);
push();
translate((x + 0.5) * lado,
          (y + 0.5) * lado);
rotate(ang);
noStroke();
fill(r, g, b);
rect(-lp / 2, -lp / 2, lp, lp);
pop();
```
São três desenhos a partir do mesmo laço de leitura. É aí que mora o espaço de exploração: trocar o que vai dentro da célula, e não a maneira de percorrer a imagem.
:::
:::col ratio=35%
::img src="pixels_retangulos.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQKCQGMIGGJgqFwo4UEgzGhqggAO5gbpgdRQMB8BDXfSCRy8-nzIV8SLXNBoXGGVnszmOKAagDsjgAsjAwIZYjAyeoUGTYGSvAYBnEvBL8gAGR1eODWfWG42mjQWk3W-oYO2CMQAbg4418lmuKGuYckED4hhGEG0DEsZhTKDAuL8GjMXgAFABKBjAT4eBRLMgCZKJgvlAAsjqRDCbjqLcdk1T42m6gn01wzUALxQbADYO599AIoAqAMrTYdaycyBgQa6GmALmBLleyKMxukMPjc56+DDXRQASSeghgBeJ5KpNJX5eVkaPB+uCDvKGLnbTBB+kMMAAC970bFt2wAywEAvRQaDAOABkMf8ODfPFI25T8eTAKA2RbSwkBwqYwEEVAAJxTDeEUa4j15fDiMcNNuRgsUGALCMGBGI9HRDbi5DTJB+JGABqUSSzLVd93YziNAYOBeP4xS8BY5TxMkz4VB0d8GDAI8GwYAAqDieJMyxsNEhS920nTqP0HCvCQlCAG0wAAXQA7SqPxQRHOcjBDDchgrIARk8rSVB83xqn85DAuCqzigi6Sot07RIFArR6UdMpimKYy+ki2ySpUKzcq1R0tUK4NUtK0ryoQKrQsK6o42Kuz8QEPz6SeQsMogLKoJbYp8nyJEOvq+rmwYAAJABBEkKTJGgrxs7zdIwLwjz6gsBqGhgZtG8bJqm2z+FnQrQoQcoJrqs6SouuiTNy8p1pULwzEmND7pQac8X4JYCwLRTGvyEsTKeu6HtsgseLBiGaNnd7ZAHTQge6lG12uOc-uuIEfpKywwAwDAC30FtBBbaosf6bQ-2sLanAYYoW0Z7bmNZ3gvBbLasa8a5C1fVKAF9PjFiAJeRVFdhgfY1ixbhqduHjgAYJ5xUgbBDv460oCFIRtb4hgJe0GtE1LBghUMLx+BGbXqgvXt+KlkWgA&name=pixels%20retangulos)
:::
---
# Tipo a partir de pixels
:::col ratio=65%
Em vez de uma forma, uma **letra** em cada posição. O texto corre normalmente, linha a linha, e cada caractere consulta o pixel que lhe corresponde.
```js
// só o rosto: o fundo escuro
// viraria um bloco de letras
const f = foto.get(90, 110,
                   330, 400);
f.resize(90, 0);
f.loadPixels();

const frase =
  "a imagem e feita de pixels ";
textAlign(LEFT, BASELINE);
noStroke();

let x = 0, y = 15, k = 0;
while (y < height + 15) {
  const ix = constrain(floor(
    map(x, 0, width, 0, f.width)),
    0, f.width - 1);
  const iy = constrain(floor(
    map(y, 0, height, 0, f.height)),
    0, f.height - 1);
  const i = 4 * (iy * f.width + ix);
  const r = f.pixels[i];
  const g = f.pixels[i + 1];
  const b = f.pixels[i + 2];
  const cinza = 0.222 * r
              + 0.707 * g
              + 0.071 * b;
  textSize(map(cinza, 0, 255,
               15, 2.5));
  fill(r, g, b);
  const c = frase[k % frase.length];
  text(c, x, y);
  x += textWidth(c) + 1;
  if (x > width) { x = 0; y += 15; }
  k++;
}
```
:::
:::col ratio=35%
::img src="tipo_pixels.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQKCQGMIGGJgqFwo4UEgzGhqggAO5gbpgdRQMB8BDXfSCRy8-nzIV8SLXNBoXGGVnszmOKAagDsjgAsjAwIZYjAyeoUGTYGSvAYBnEvBL8gAGR1eODWfWG42mjQWk3W-oYO2CMQAbg4418lmuKGuYckED4hhGEG0DEsZhTKDAuL8GjMXgAFABKBjAT4eBRLMgCZKJgvlAAsjqRDAbxUdRbjsmqfG03UE+muGagBeKDYAbJ3PvoBFAFQBlaYjrVTmQMCDXQ0wRcwZer2RRmN0hh8bnPXwYa6KACST0EMALxPJVJpq8+ET8AGeGNc+tdhtc2A-mmw6-hM2hmIO76OAwyRgDOnhaByDDVJeOIMLAvAaDOjRrjieKRseh7XAg94oAWACczYMAAjDRzafCoTHMSxDDlOU1FNh2XZpgg-SGGAABeD5US23GfJYCCXooNBgHAAyGMWcblsqkY4TAdKMQyIBaAKfD3mgDAaZYBqaBhGleHJCnaTxSxwCgACCSSCBABYknQFIUC2ABCDnznQJLXgAcnQ+7rtc84oIOQJKRwnwRgwcDHtRIzHjR+Qtr09KOjx3JIGA4wMAWqV4EwBqCKgDAANS0fkJZlmusj4ficnHs1UXPK5liXmKBZabITyFnAYktryUBsiNvFjWyRZFki-UMNRknTUgDDWLRYVNapDBgKl9LtTOkAFt11y9Qtg3FZNUxgBVKCTZJ123bN82NSoS3IOVlXrTRm06NtYDHg2DAAFRFbtINTWA42rTVcm-e1fREQglnyRghgANpgAAujxW0EQwghIyjCmY9VtE41pCPVETVlo6TNXFBTr0I9okCCVo2VlMUxQQ-oC2sSoNWOggWqOlqEPBq9AtMULCBizREPVLjDB2Sg85CQ+F2sxA7OTcU+QZfz0u1S2pR1b9lgFRgBb6C2ggttU8Pbam9KWOp6O9AApGm6lSRIghskzTGqwW2gtsNDAjL9SVVfSqsAOpQ2yocljVNHK2AlhFUlLAMCt9WJclIaR9V9LpcXAC+WndFVVU8VXEAN8iqK7DA+xrFi3AO7cqXAAwTzipAQE5Qw1pQEKQjD5XHDaDWialhhhpePwIxAah1x9tPEAgBXQA&name=tipo%20pixels)

A imagem é legível de longe; o texto, de perto. As duas leituras não cabem ao mesmo tempo.
:::
---
# Um mosaico de paleta
:::col ratio=65%
A versão de emojis do livro depende de uma biblioteca de busca em árvore k-d. Com uma paleta pequena, a mesma ideia cabe num laço: para cada pixel, **a cor mais próxima** da lista.
```js
const paleta = [
  "#20242c", "#2b5fd9", "#e2632a",
  "#c9ccd2", "#1f7a63", "#8b3a62",
  "#f0ead6"];
const cores = paleta.map(
  (c) => color(c));

const f = foto.get();
f.resize(40, 0);
f.loadPixels();

const fw = f.width, fh = f.height;
const lado = width / fw;
noStroke();
for (let y = 0; y < fh; y++) {
  for (let x = 0; x < fw; x++) {
    const i = 4 * (y * fw + x);
    const r = f.pixels[i];
    const g = f.pixels[i + 1];
    const b = f.pixels[i + 2];
    let melhor = cores[0];
    let dmin = Infinity;
    for (const c of cores) {
      const d = sq(red(c) - r)
              + sq(green(c) - g)
              + sq(blue(c) - b);
      if (d < dmin) {
        dmin = d;
        melhor = c;
      }
    }
    fill(melhor);
    rect(x * lado, y * lado,
         lado, lado);
  }
}
```
:::
:::col ratio=35%
::img src="mosaico_paleta.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQKCQGMIGGJgqFwo4UEgzGhqggAO5gbpgdRQMB8BDXfSCRy8-nzIV8SLXNBoXGGVnszmOKAagDsjgAsjAwIZYjAyeoUGTYGSvAYBnEvBL8gAGR1eODWfWG42mjQWk3W-oYO2CMQAbg4418lmuKGuYckED4hhGEG0DEsZhTKDAuL8GjMXgAFABKBjAT4eBRLMgCZKJgvlAAsjqRDCbjqLcdk1T42m6gn01wzUALxQbADYO599AIoAqAMrTYdaycyBgQa6GmALmBLleyKMxukMPjc56+DDXRQASSeghgBeJ5KpNJX5eVvmtEa09IA2p9ZGIADExSOqOxTaGILZAcU1T5JYUAAJyQQyICATAxRjuUxR8JB-4oYB2gIdoUTFMhQEAIyWFqfCYWRqG2NU5Q0aRyJ4UBliOgoUBjmIAC6nY6O+gn9IYR6fhoIpPIWeEFtoJbCCwgkXvoslFq+q44nikZHge1wIHeKDFgJlgICJYAAF73k2LbtsZCAXooNBgHAAyGEZHBvlpabcjpPJgFAbItpYSC+VMYCCKgAmafi-CzkevIBSFjjeQJ65zigA5Au5q5RvoDAFhGDAjEejohkVchpkgZUjAA1DVJZlqu+5ivlhVwCVZXtXgKUMHAdUNXhsjRb4YBHg2DAAFT5cVU2WD5NW9XuKhDUJeX0iZXjOa5P5gPxg2CV5gi+ZtLkYIYO0MAt5F7U1KjDQw1THVtZ0XQtxQ3ctsiFeoGBIC19I4iJP6Oh9n2FVAaCQEeV4QJYkBgKMAnLbl+X3am1yWMJEwDbdy33VAR6GAAjgW-TDnJDDWH0Rb7Z9n0LcTBb9tMECqZTDCCDTuN0-Tfgk9UGBmPeFNU9US102AmMFgT3UQ5AOM8yocsyPSUBIzzP1-WtOjq8tAC++0G9zcMYBgBaa2K4sqP02iGe1U2xdcLYzbwihO7Ty2Oy2jtW0bshG0byKorsMD7GsWLcC2MLFcADBPOKkDYAwpUMNaUBCkIScp0b2g1ompYMEKhhePwIxJwL1y9mVgd60AA&name=mosaico%20paleta)

A distância é a diagonal no cubo RGB. Como só comparamos distâncias, dá para pular a raiz quadrada.
:::
---
# Escrevendo em `pixels`
:::col ratio=65%
Até aqui só lemos. Escrevendo no array e chamando `updatePixels()`, dá para construir qualquer filtro que o p5 não tenha - aqui, um duotone.
```js
const f = foto.get();
f.resize(0, 200);
f.loadPixels();

const px = f.pixels;
const n = px.length;
for (let i = 0; i < n; i += 4) {
  const cinza = 0.222 * px[i]
              + 0.707 * px[i + 1]
              + 0.071 * px[i + 2];
  const t = cinza / 255;
  px[i] = lerp(24, 240, t);
  px[i + 1] = lerp(38, 205, t);
  px[i + 2] = lerp(92, 150, t);
}
f.updatePixels();
image(f, 30, 20);
```
Como o laço anda de quatro em quatro sobre o array inteiro, nem precisamos converter índice em `(x, y)`: a posição não importa para este efeito.
:::
:::col ratio=35%
::img src="duotone.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQKCQGMIGGJgqFwo4UEgzGhqggAO5gbpgdRQMB8BDXfSCRy8-nzIV8SLXNBoXGGVnszmOKAagDsjgAsjAwIZYjAyeoUGTYGSvAYBnEvBL8gAGR1eODWfWG42mjQWk3W-oYO2CMQAbg4418lmuKGuYckED4hhGEG0DEsZhTKDAuL8GjMXgAFABKBjAT4eBRLMgCZKJgvFAAsjqRDEbjqLcdk1T42m6gn01wzUHrDYAbB3PvoBFAFQBlabDrUTmQMCDXQ0wecwRfL2RRmN0hh8bnPXwYa6KACST0EMALxPJVJpy-Lysjh-31wQt5Qxc7aYQfpDDAAAvO9m1bZ1dwA89FBoMA4AGQw-w4V88V8V0PwQLwEKQ-8cXQ1dD1dBBxiENl-yjfQGALCMGDAQ9HRDei5FXZiGIAanpBsSzLFdZAI-FtEgECtHpR0ymKYoGAAKgYV0AG0wAAXU+FR1I02QOIYCStUdLVZPkuAlIYbSAEZVP4zTrO0iT9LMwzFM41tlP-AS3wYXx6WEiBRKcVt8nyNyjKU5TD3GfRC0bFs2xbFBoNkJzTIYCzwpgSKC3KWwYsdfI4oSkLnOKML6QiwsAE5ihbMynXy-8AF9PksBB8ygPglngxCMGQ6CBT4W8C0sFtygg4p2zjRqIGRVFdhgfY1ixbgWxhEZSwYJ5xUgbAdOY60oCFIRtqYhhJu0GtEzWoVDC8fgRm26pz17ZjJpAeqgA&name=duotone)
:::
---
# Agentes sobre a imagem
:::col ratio=65%
Juntando com a aula 5: agentes que caminham pela tela e tomam a cor do pixel que está debaixo deles. O desenho é feito pela caminhada, não pela grade.
```js
const f = foto.get(90, 110,
                   330, 400);
f.resize(width, 0);
f.loadPixels();
const fw = f.width, fh = f.height;
const W = width - 1, H = height - 1;

for (let a = 0; a < 150; a++) {
  let x = random(width);
  let y = random(height);
  for (let p = 0; p < 120; p++) {
    const ix = constrain(
      floor(x), 0, fw - 1);
    const iy = constrain(
      floor(y), 0, fh - 1);
    const i = 4 * (iy * fw + ix);
    const r = f.pixels[i];
    const g = f.pixels[i + 1];
    const b = f.pixels[i + 2];
    const cinza = 0.222 * r
                + 0.707 * g
                + 0.071 * b;
    stroke(r, g, b, 110);
    strokeWeight(
      map(cinza, 0, 255, 0.3, 3));
    const nx = x + random(-8, 8);
    const ny = y + random(-8, 8);
    line(x, y, nx, ny);
    x = constrain(nx, 0, W);
    y = constrain(ny, 0, H);
  }
}
```
:::
:::col ratio=35%
::img src="agentes_imagem.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQKCQGMIGGJgqFwo4UEgzGhqggAO5gbpgdRQMB8BDXfSCRy8-nzIV8SLXNBoXGGVnszmOKAagDsjgAsjAwIZYjAyeoUGTYGSvAYBnEvBL8gAGR1eODWfWG42mjQWk3W-oYO2CMQAbg4418lmuKGuYckED4hhGEG0DEsZhTKDAuL8GjMXgAFABKBjAT4eBRLMgCZKJgvlAAsjqRDCbjqLcdk1T42m6gn01wzUALxQbADYO599AIoAqAMrTYdaycyBgQa6GmALmBLleyKMxukMPjc56+DDXRQASSeghgBeJ5KpNJX5eVkaPB+uCDvKALAE5mwYABGYDm0+FRIKg6CGHKcogLbPc0wQfpDDAAAve9eSgNkW3bTtkIvRQaDAOABkMYsCJxPFI25T8eTAHCkBbSwkHoqYwEEVAqPfBgAHUj2wtkGGsECWwACSPDiuN8UTgLjT4o30BgCwjY8j0dEN1LwECnS0vgAGoDJLMtV1kNS4CPadoAVAshKQJDzI0BgRismdbOk1BHLTMUVLUrwNK0gKdOA4pNIYLwjJMiCVGo-FSKPOKUGnSACxiyDLAvMUCzgIs8JYui5O82QkoYMBXPpJKUogNKzKgzLrmykY8oYIDWJEkDip0XiwCPBsGAAKhU8rBrTOiDLK3KCMg0rlPpSwEC8UjyIAbTAABdabYt4wR6KWsiMEMNaGAm4DNvS7qaIYao9uWw7jom4pzrqkreO0SB0K0elHTKYpilG-QLpgqCJp+rVHS1Ubgxe4GQdahAIeA0bqi22RhgHIEC30FtBBbaoW1A-CLvR64gT4g0ZNq4GnkLd6IE+-KGGKfJ8jwhByhbcoiy60qIEs+lLIm6zZzQAs7BbWwed4iAKpck6+nc0XxYYSXUd4SB7zgFsRhbPndeatX+cu9HnhqvXWpbPiutlqrTYLGXGfE7yAF9PldiB3eRVFdhgfY1ixbg8duVzgAYJ5xUgbBWqCxQhSEKPwvd7Qa0TUsGCFQwvH4EYo+qC9ey0z3naAA&name=agentes%20imagem)

A espessura do traço vem do brilho: no escuro o agente quase não marca, no claro ele pesa. No livro os pixels vêm da webcam, e o retrato se forma conforme a pessoa se mexe.
:::
---
# Imagem que muda: vídeo e câmera
:::col ratio=62%
Tudo o que foi feito com `foto` vale para uma fonte que muda a cada quadro. `createCapture()` abre a câmera; `createVideo()` abre um arquivo.
```js
let cam;

function setup() {
  createCanvas(640, 480);
  cam = createCapture(VIDEO);
  cam.size(640, 480);
  // esconde o elemento <video>
  cam.hide();
}

function draw() {
  cam.loadPixels();
  if (!cam.pixels.length) return;
  // o mesmo laço de sempre,
  // agora 60 vezes por segundo
}
```
:::
:::col ratio=38%
Três cuidados:

- `hide()` evita que o elemento de vídeo apareça **além** do canvas, sobreposto a ele;
- nos primeiros quadros `cam.pixels` ainda está vazio, e o laço precisa desistir em silêncio;
- a câmera exige permissão do usuário e uma página servida por **HTTPS** ou `localhost`.

Este é o exemplo que não tem imagem renderizada nestes slides: não há webcam do outro lado.
:::
---
:::center
::img src="showcase_2.png" height=80%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgkPoafR8FDXfGWGBgYnYBgk6qeDBIEkTbTXekwBgARzMfB4Axg6ggxIYsGMED0aQ4zIgwwYAFUAEoAGQA+gAxEgUPHCBhiYKhcKOFBIMxoaoIADuYG6YHUUDAfAQ130gkcFqt81tfEi1zQaGuUoNRpNjigwYA7I4ALLkwyxGBK9QoJWwJVeAwDOJeZ35AAM2a8cGsUbAMbjCaTcdT-QwGcEYgA3Bw+IYRhBtAxLGZWygwH6-BozF4ABQASgYwE+HgUSzIAmSTcHAE5c0iGDns8OGzIGNU+NpuoJ9NdO1BB2IAMSWbMKKAANjEG8+hOg3oAytMT-kH1vJdLLNdBVqfBms8vgYNcigAJJPIIMCDvKypqhqX4Tn6v4MFqf7EggMEoIOobZiutgEQw5Q3sRAAs5HrpusiWAg-SGGAABesGUSu1GfHRYGKDQYBwAMhgjjROiob4lhmuh7bmmAUCGiulhIJJdFTGAgioMJP6gYoJJaipam+I47ZIBponUnAkmDhasmKdY7YSQAVLw2mjoZxSbpxjoMIO4y+CMknZnWDB+XgRmBSMADU4WjuOW60Z53kaAw5lagFSVyHZgVwJF0WfCoIlSr4YCSeRDCOYOfmOeJDDhUlX55bIml9EpCBeHxAkANpgAAuiugjNa1-EYIYnXVQwACMPXbv1bVDSNNXFF1wl5Y12iQExWgpWUxTFKVTU1dmCD4aGu19ftCDZqGY27dUS0qI1vhaqtEDrU4DDFPk+S3Q1pnaMlZmjYO5lnZ+u38FA1xffl0raH5WrlaNB0g45YMQ7lKheGYkxCWjsgoE+hj8Esg6-SuMN1fVYCWF5vghQd705bF9UQNcL549cQJCe2YAYBgg76L1K7VOT9V9P+RKwU8Q4oOx7FlPkMsMDQEHDsL9X9NouHWCju0HTeK5a9pOsIHrTng7tY1lCu2uORbxSq7IAC+DACWylPU+liMgzFIuyMzrOHhzG5czzfMC9u9t3WAATjIOxHEZLg7SwwdPy8nCAfVbhs23Lmdm45iMq5DTsuwwbuJx7CC2AzPt+GzHP8wwgiC0HwwBzAADq5L6YOCdJ57su2Cu5QrrbhcMMzKrc7zEeyIemhEwAijKACCcoUHQcpKkrM+8JAsEG3naep8R1tH+xEfF0NbLez7ft17BQeWFPfNG4Pjev4Lr876t0ewXHK6lDtkXHGDAvDXCHKrB2nwoEQBgciVEuwYD7DWFibggtbh+WAAwJ4TpIBUlSqmKAtohD4MCjA7Qs4mxjiFMWLw-ARhUmqGBPcZCOAgAdkAA&name=showcase%202)
:::
---
:::center
::img src="showcase_3.png" height=80%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgAMWuKGuaGuhme2mu2AY1z6Gn0fEJNOJEE0UGp5LQNPJ+iWhgYiRgDHUhmJCA45IgwwYAFUAEoAGQA+riSBQSAxhAwxMFQuFHCgkGY0NUEAB3MDdMDqKBgPgIa76QSOM0W+bWviRIlMwx6g1GxxQf0AdkcAFkYGBDLEYAr1CgFbAFV4DAM4l5HfkAAwZrxwaxhiNRmMaePRpP9DCpwRiADcHD4hhGEG0DEsZibKDA1xkxhQZi8AAoAJQMYCfDwKJZkATJev9gCcWaRDEzGcHtZkDGqfG03UE+mubag-bEAGIMzAAIwZi8ANjEa8+dOgRIAytMj8ULw+N+LJZYCdSGp8Cazy+Bg1yKAAkk8ggwP2sqKsqqrfrI-6Egg4GKDQYBwAMhhDuunw4oam4COSfICv0XI8ku2iKFoJHslSfgwGYm6eBgSDUlanZjl2kpbk2gEMAA2gAuuuqH2gw-bjL4vQahm1YML0eAMAuyndAA1Fpw6jhusi-mBijCYGSmfIZ-G-HA6otuB9r9k+rJoP2GZLmh1ymmAUD6gw1i8CZg4oSoRl+CMtmWPZ+iOQIzmue5AHIOGgioH5AWskFkkqHJfhEloilZVJ+gyTl+UMEpDBaGp-CsspWhaRqgZ6RZKj-sVskaJutkVdUcjpdcym9Q1DBNSOLUqDoVkMGAtkACwMAAVDJ-YNgwWmbsOS0eV5PlIGtfg2etfDBRNsiGHla2KWUxTFItLaJV4OF4SJYBiftGYIGZgZ3dtj24RghgvftF5ieNp0TetH0ZoGF4-Q9T0A0D63FBJYMAL4tRjBmTRKvgyBqXjXCa-baOGGCySZTgjYOS7FCdpFCQgXhmJM-bAAdS4NkuNXXEu1QcVxlLnU8VMyGjwVY0RjjMXwGDJLzDAQIaWh7ooAp7iSxhgHSfG45VcvCdtsEoP2N5uSN5vlLY5uzWbwWy-LCD9IYYAAF5wcUN5LquWUO55mFQNh-34cFoXAbZfs7fqS58HtQEG0lYApSgWWhaTPAalMSepdLsep1N1w2Rq-ZmrtaXh0t6fDtLxSERubUlZ14UFQw4VqXnrc6c12MNx1vhF+Vyk2e3JpD13Y3Y5ZeszRq81Lf24VLeH61wPTU+Sn7ABCAvCR9N23UvCd-c9r1g+D58Q+Vn3Q3dkfH4jM3rSDZ8XxfkMINDsOH479+A4-DAo0KtlTq6hOLSQ1IJckIkMxiSXFANAkBbKQQgJYSAYBRhAKKjJUKXgqSWAZuSbuF9QpQAjtUfCXgED8zAGA8uBtt40K4mvFQYB8H9lIWpeBkA9J8gQfjPkylQFcWKgTZSWNwbiNOpaPgsF+weSXIXfaNlK4DCXIvHQqiNE8Hfl7LR70EBexfhNIR9oECGDgEuExaQuaCgGMIjCJlLF2NMTzemkisZY2RKiXYMB9hrCxNwPmtxwrsyeA6SAlIKpJigNaIQkSxFimnPWEcfIIxeH4CMSk1RwI7gSRAEAaMgA&name=showcase%203)
:::
---
# Recapitulando
:::col
**Carregar e desenhar**
- `loadImage()` é assíncrono: `async` e `await`
- a origem precisa de CORS para dar pixels
- `image()` com 3, 5 ou 9 argumentos
- `get`, `copy`, `resize`, `createImage`
- `tint`, `noTint`, `imageMode`

**Transformar**
- `filter(GRAY | THRESHOLD | BLUR | ...)`
- `blendMode()` é estado global
- `mask()` usa o alfa da máscara
:::
:::col
**O pixel como dado**
- `loadPixels()`, `pixels`, `updatePixels()`
- índice: `4 * (y * largura + x)`
- densidade 1 na imagem, 2 no canvas
- `get()` para poucos, `pixels` para todos
- reduza a imagem antes de percorrê-la
- brilho: `0.222r + 0.707g + 0.071b`

**E depois**
- os mesmos efeitos, em paralelo, com fragment shaders
:::
---
# Para levar adiante
:::col
Os exemplos vêm do capítulo **P.4 Image** de *Generative Design* (Bohnacker, Gross, Laub, Frohling). Os originais, em p5.js 1, estão em **generative-gestaltung.de**.

A imagem é a *Moça com Brinco de Pérola*, de Johannes Vermeer (c. 1665), do Mauritshuis - domínio público. Trocar a foto é trocar uma constante: qualquer endereço que sirva a imagem com CORS serve.
:::
:::col
Sugestões de exploração:

- Use o brilho para escolher **qual** forma desenhar, e não só o tamanho dela.
- Ordene os pixels de cada linha por brilho e veja o retrato escorrer.
- Faça a grade do mosaico seguir uma coordenada polar em vez de cartesiana.
- Troque a paleta fixa do mosaico pelas cores médias de uma pasta de imagens suas.
:::
---
:::center
# Obrigado
:::
