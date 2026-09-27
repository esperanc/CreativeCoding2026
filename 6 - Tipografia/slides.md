::: center
# Programação criativa
## Aula 6 - Tipografia
:::
---
# Tipografia

A letra é uma forma como qualquer outra - só que carregada de séculos de convenção e de significado.

- Do lado de fora, um texto é **informação**: ele diz alguma coisa.
- Do lado de dentro, é **geometria**: contornos, curvas, pontos, espaços.
- A programação criativa vive de atravessar essa fronteira nos dois sentidos: usar o texto como dado para gerar imagem, e usar a geometria da letra como matéria-prima de desenho.

Esta aula segue o capítulo **P.3 Type** de *Generative Design* (Bohnacker, Gross, Laub e Frohling), adaptado para o p5.js 2.
---
# Roteiro
:::col
- **Escrevendo na tela** - `text`, fontes, métricas, caixas de texto
- **O texto como material** - o que a sequência de caracteres pode gerar
:::
:::col
- **A geometria da letra** - extrair pontos, contornos e caminhos
- **Manipulando o contorno** - dissolver, deformar, deslocar, animar
:::

O ponto de virada da aula é o meio: até lá o texto é **conteúdo**, e a partir dali vira **forma**.
---
:::center
# Escrevendo na tela
:::
---
# O básico
:::col ratio=65%
Três funções dão conta da maior parte dos casos.
```js
textSize(64);
textAlign(CENTER, CENTER);
text("tipo", width / 2, 70);

textSize(28);
textAlign(LEFT, BASELINE);
text("à esquerda", 24, 150);

textAlign(RIGHT, BASELINE);
text("à direita", width - 24, 200);
```
`textAlign()` aceita um alinhamento horizontal (`LEFT`, `CENTER`, `RIGHT`) e, opcionalmente, um vertical (`TOP`, `CENTER`, `BASELINE`, `BOTTOM`).
:::
:::col ratio=35%
::img src="basico.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQAHIURjCBhiYKhcKRaINRIpNIZFbZXKFSy4lCGa5mAIwRwCFC4xyWMDjQySiDSiDWfgoSDWAAsAAYddYINd9E8MAgAO7XSyWMQAbg4418guVMDtkggfEMIwg2gYljM3o1uL8GjMXgAFABKBjAT4eBRLMgCZIesNagBsOqRDGKuojrtk1T42m6gn0ougYZzabzn30Aig1zQAGVplAwwB2GsyBiGsDGFswNud-O+oUwBgMvhm56+DDXRQUoVh4nkqm0uhd2RLOAoRfKsNOpZdz5yjAYMPlYpZ3VZ-LFTc965NlBloGR12fbcoJtgABeMDDNMtQfL8AEEkkECAwzIOh1yJLMYLgkDljDMQNS8a4xCzM0wCgFAkCcbMs3bHVj27L8f3-StbGQndwLASCwxJOgKQoLMACFQKbOgSQASWpDcRy-VCQAAA4YCYAEczBgfQoD4LDsy1LMAEZ8lIj9yOWejGKJXiAHEAAk2IYTjuL4gTaJQETxKgMB+jATRFJwvCCOsJSs2KPUuwAXw4ZFUV2GB9jWLFuCzGERmjBgnn0QRIGwBgdRtBgvEUOyhES5KGD870kw9aK7MMLx+BGRLqjnYsUtykAfKAA&name=basico)
:::
---
# Carregando uma fonte
:::col ratio=62%
```js
// 1. uma fonte já no sistema
textFont("Georgia");

// 2. o Google Fonts, pela folha
//    de estilo
const f = await loadFont(
  "https://fonts.googleapis.com" +
  "/css2?family=Anton");

// 3. o arquivo da fonte
const g = await loadFont(
  "https://cdn.jsdelivr.net" +
  "/npm/@fontsource/anton/files" +
  "/anton-latin-400-normal.woff");
```
:::
:::col ratio=38%
Há três caminhos, e eles **não** são equivalentes - a diferença aparece no slide seguinte.

`loadFont()` é **assíncrono**: ele devolve uma promessa. Por isso o `setup()` precisa ser declarado `async` e a chamada precisa de `await`.

Sem isso, a fonte ainda não chegou quando o desenho começa, e o texto sai na fonte padrão.
:::
---
# O detalhe que decide tudo
:::col ratio=60%
Os três caminhos servem para **escrever**. Só o terceiro serve para **medir e desenhar a forma da letra**.
```js
const f = await loadFont(
  "...css2?family=Anton"
);
textFont(f);
text("Ra", 20, 80);  // ok

f.textToPoints("Ra", 0, 0);
// Erro: No font data available
```
:::
:::col ratio=40%
Para extrair geometria, o p5 precisa do **arquivo da fonte**, não de uma referência a ela. E ainda há uma pegadinha de formato:

- `.woff`, `.ttf`, `.otf` - o p5 consegue ler os contornos.
- `.woff2` - **carrega e escreve normalmente, mas não entrega geometria**.

O `.woff2` é o formato que o Google Fonts serve por padrão para navegadores modernos. Se `textToPoints` reclamar de "no font data", quase sempre é isto.
:::
---
# As métricas de uma linha
:::col ratio=42%
Toda letra se apoia numa **linha de base**. A partir dela:

- **ascent** - quanto a fonte sobe acima da base;
- **descent** - quanto desce abaixo;
- **entrelinha** (*leading*) - a distância de uma base à seguinte.

O p5 2 distingue duas famílias de medidas: as que descrevem **o texto que você escreveu** (`textBounds`, `textAscent`) e as que descrevem **a fonte inteira** (`fontBounds`, `fontAscent`), independentemente das letras usadas.
:::
:::col ratio=58%
::img src="metricas.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgAQUMvEgegJsD6MEsMH6EG0YC0pLMTwYlmuECWDBgDD4JLMXJ0zzgvNJ6igYCgfAQHG0LOGDAAqgAlAAyAH0AGIkAByFEYwgYYmCoXCkWiDUSKTSGRW2VyhWZrMM1zMARgjgEKBZjksYHGhldrJZ1n4KEg1gALAAGcPWCDXfRPDAIADu10sljEAG5JdLfHQAMpkBUkBi6sQAYmK4eKoeK2jESLxAC1ZYri3qQOXqvlLFAAJx1hiK3Hy3EagBSuNbZZgxQAbOVinx+2QAJIahsTkvtnu2HsKewgTOSCCWMzU4MshiCMy0gAUI3rUv09f01xQZgw13rcAAjABKBjAJ8wwvkCN6Pr+6Z+CgIEwAA6jAYCCKgN7fmUEGfF0MA3hG9b3gwP64ehMgMDGubQdcoEQUy3oYGBsZEbISxwCgqosigN4AgIhjWMYnhpiAVFMSguZgAAXlh36lPkgnLLiSSCBAN6KnQqoUPWZB0FqdDygxDBCTeL5vh+X7fgwADUDC2IRh4AL4cBwXIjNSTKnto54yMYb5eDe-6AcRHgKEsZACMkXI3jOM7hvW5QAOzhrp1R8No3SCC+p5QDeVYzrpUoQDKlitnwibPL4H6KKxrI3gqKrqlpulCRV7GWERny5TKBKbgAEnAggZq12YMNUcCtnF9aJcYrbFPktiHoxywieJKG2PFs16bJ8mKcpqn1gAQriuZ0Iqq50C1xE4oKPIEto-Jcv1eW+NUrZCTtjrQIYN6GGNcBjVyMA5QNliPbqdooC96XvZ9g3fYNv26TGqo0T5q3ARRWGDsOY64lRKNAvBiHIahoa6f0bk3oDCDQ+TeHk4m9bk0guk41huJNoq2PkbjCFIexhPEzApPVBTY0IHhgu04NyCnbIOLXGtzGfpyrITAwUDXAShnvmrDA3let7-uR12ckybEco+VJLL+d0yvw+iCE9yywaKKBIB9-33Zy7itiD+LaBI7G-vWsCe8DbFEBMvuVXD1xkTBSPURgtHzvWOEMPkxT1sU5TSat+mQ0NP3GFLTiOB7hIQMSny63wN7jTA9Z5gW8okPWYhdHoKscrX-axcUulVzXv0MNYHvaOpq7ri3IBchHvg3mKxtK5byIMD3ffXtXtfmR37hj2uuKT0HM-a-PIN-d3MW94enw4uMggSPPYpXTdjTEaRHNYTJzGNRxqJcTxlJgH4p-YSYkJJSWAXJRCm0VJqQYBpLSOlVpegTjeFmzZ6rLB-s9V6UB3q-mwEba6YABQq1lgARzMByZkYB2TfHdN3Hs6cGDfmrLpZBtF0YjnHBg5iP8QZgzej5AhWgiEkJPibBgkAlhgH0IuZe5RGH1m-DOImSDEaSRWp8fSYghKOygM7Hyk4NgWWPDeG2gh6xRWYf+CyDgvBwAYUw78thsq2Q4MiVEuwYD7DWFibgY1bgjAAgwJ4ttIAEPDJBLwigRRCAiZBOy1IQq8mACrMAhgvD8BGAQ6oH5koJPcTZIAA&name=metricas)
:::
---
# Medindo antes de desenhar
:::col ratio=65%
`textWidth()` dá a largura de avanço de um texto; `textBounds()` dá a caixa que ele realmente ocupa.
```js
const s = "Ag";
textSize(150);
textAlign(LEFT, BASELINE);

const b = textBounds(s, 60, 190);
noFill();
stroke("#2b5fd9");
rect(b.x, b.y, b.w, b.h);

const fb = fontBounds(s, 60, 190);
stroke("#e2632a");
rect(fb.x, fb.y, fb.w, fb.h);

noStroke();
fill(32, 40, 52);
text(s, 60, 190);
```
Em azul a caixa do desenho, em laranja a caixa da fonte. A diferença entre as duas é exatamente o que sobra de espaço em torno das letras.
:::
:::col ratio=35%
::img src="medidas.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQAHIURjCBhiYKhcKRaINRIpNIZFbZXKFSy4lCGa5mAIwRwCFC4xyWMDjQySiDSiDWfgoSDWAAsAAYddYINd9E8MAgAO7XSyWMQAbg4418guVMDtkggfEMIwg2gYljM3o1uL8GjMXgAFABKBjAT4eBRLMgCZIesNa4o6pEMYoANh1EddsmqfG03UE+lF0DDxS12fzn30Aig1zQAGVplAwwB2OsyBiGsDGNswDvdgu+oUwBgMvhm56+DDXRQUoVh4nkqm0ug92RLOAoZfKsNOpY9z7DctAgDqMDAglQYYAjAgtafezi8b8p4yQABBQS2z5dxQFswAALxgR98jzMcgJ-JJBAgMMSToCkKEzAAhH8WzoEkAElqS3V1Y1xfFqi-ID0IrKBDDDQxM1zTMHwATmgz5DQpeUMEjMdz2uIEwzEABiYpqnySwoCYsRtz6GBtBQMNqgQOBM0UkYVPNdSkFfWR33xSwyIZY9KP9ajaPojMGGY1je14-ihJgHNymKPgpLHfo5KPRTlN9VTM30jSfOQbS+2uFsUAvCDpLlDAuKczNdUzfJimkoCzIYBjLJYnsAF8OGRVFdhgfY1ixbgVNuEZowYJ59EESBsAYHUbQYLxFCgSBBAapqGFy70kw9Kr2sMLx+BGBrqgXEtmt6kBsqAA&name=medidas)
:::
---
# Texto numa caixa
:::col ratio=65%
`text()` aceita largura e altura. Com isso ele quebra as linhas sozinho.
```js
textSize(19);
textAlign(LEFT, TOP);
textWrap(WORD);
textLeading(27);

const s =
  "A tipografia dispõe letras no " +
  "espaço. Com uma caixa, text() " +
  "quebra as linhas sozinho.";

noFill();
stroke(206);
rect(26, 26, 300, 190);

noStroke();
fill(32, 40, 52);
text(s, 26, 26, 300, 190);
```
`textWrap(CHAR)` quebra em qualquer caractere, e não só entre palavras.
:::
:::col ratio=35%
::img src="caixa_texto.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQAHIURjCBhiYKhcKRaINRIpNIZFbZXKFSy4lCGa5mAIwRwCFC4xyWMDjQySiDSiDWfgoSDWAAsAAYddYINd9E8MAgAO7XSyWMQAbg4418guVMDtkggfEMIwg2gYljM3o1uL8GjMXgAFABKBjAT4eBRLMgCZIesPlWw6pEMYr5HUR12yap8bTdQT6UXQMPFLUANjzn30Aig1zQAGVplAwwB2OsyBiGsDGNswDvd-O+oUwBgMvhm56+DDXRQUoVh4nkqm0ug92RLOAoZfKsNOpY9z67lAtsAALxgYYAjABObcMc8AQSSgggYZJdApFEzFAkDQz7ngA6g24agSQRJECBywkgoUCQIIlajhwsa4vihhTp8shiK+L7eNcpZ8HKWhIYYXgAK+Tg6DbYYajIbAA1LhTETF4fAAOfXAgDBkM2DBmE8OjPHAfCZuekZMQwrG9nhIAAI5mDA1QNgwHq8JAejYSKV7abxtrob2hoUvKGCRmOwxlkClY6rWY79NoKCVtWmbFG5DDlHqmaPrmrqfIaLYoDZt7PnKGAWeUxSZrqmb5MUcF7mGhjuZ5HmZt5GYMH5PYAL4cMiqK7DA+xrFi3CZjCIzRgwTz6IIkDYAwOo2gwnFQEhQjNa1DAFd6SaacADAUV4-AjM11QLsWbX9SAeVAA&name=caixa%20texto)
:::
---
# `textProperty()`: o resto do CSS
:::col ratio=65%
O p5 2 desenha texto com a API de texto do canvas, e `textProperty()` abre essa API inteira, inclusive propriedades que não têm função própria no p5.
```js
const esp = ["0px", "7px", "16px"];
textSize(30);
textAlign(LEFT, BASELINE);

esp.forEach((v, i) => {
  textProperty("letterSpacing", v);
  fill(lerpColor(color("#2b5fd9"),
                 color("#e2632a"),
                 i / 2));
  const y = 62 + i * 66;
  text("tipografia", 26, y);
});
```
Outras propriedades úteis: `wordSpacing`, `fontStretch`, `fontVariantCaps`, `textRendering`. `textProperties()` devolve todas de uma vez.
:::
:::col ratio=35%
::img src="propriedades.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQAHIURjCBhiYKhcKRaINRIpNIZFbZXKFSy4lCGa5mAIwRwCFC4xyWMDjQySiDSiDWfgoSDWAAsAAYddYINd9E8MAgAO7XSyWMQAbg4418guVMDtkggfEMIwg2gYljM3o1uL8GjMXgAFABKBjAT4eBRLMgCZIesNa4o6pEMYr5HUR12yap8bTdQT6UXQMPFLUANjzn30Aig1zQAGVplAwwB2OsyBiGsDGNswDvd-O+oUwBgMvhm56+DDXRQUoVh4nkqm0ug92RLOAoZfKsNOpY9z6GlsoMtAyOu2O4-ETLxThgAbTEOq8cDEmbEnc-38ZEAAEZq3-EAAF0x13FAWzAAAvGAw3KXMoOWABBJJBAgMMSToCkKEzAAhNCWzoEkAElqS3W9e0fBBBX0OgiyQMMw2STMwCjYQWGjT4d2WGgy3mfRRjDMQHSWfQWy8ItIEEADkm3FQ5QwDAw3GfQvDIa4F30MMcV0sSQAAYmKap8ksKAAE4xAjJE+JURynMcgyjSM4yYGKatymKPhbPs3tnKCxywCcLMIyU2QcTxXwRmfatigYABqBhQoAKgYatqzHfi9yMjUvGuUs+DlPzkSzatMxGJSAF8exqjhkVRXYYH2NYsW4TMYTi4AGCefRBEgbAGB1G0GBkqAoDk4bRoYBrvSTD1owYKbDC8fgRmG6oF2LMb5pAGqgA&name=propriedades)
:::
---
:::center
# O texto como material
:::
---
# Quebrando linhas na mão
:::col ratio=65%
Se a caixa do `text()` resolve o caso simples, por que fazer na mão? Porque escrever **letra a letra** é o que permite mudar alguma coisa a cada letra.
```js
const frase = "letra a letra";
textSize(34);
textAlign(LEFT, BASELINE);
fill(32, 40, 52);

let x = 24;
let y = 70;
for (const c of frase) {
  const w = textWidth(c) + 4;
  if (x + w > width - 24) {
    x = 24;
    y += 54;
  }
  text(c, x, y);
  x += w;
}
```
O laço avança a posição pela largura de cada caractere, e quebra a linha quando o próximo não cabe.
:::
:::col ratio=35%
::img src="quebra_manual.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQAHIURjCBhiYKhcKRaINRIpNIZFbZXKFSy4lCGa5mAIwRwCFC4xyWMDjQySiDSiDWfgoSDWAAsAAYddYINd9E8MAgAO7XSyWMQAbg4418guVMDtkggfEMIwg2gYljM3o1uL8GjMXgAFABKBjAT4eBRLMgCZIesNa4o6pEMYoANh1EddsmqfG03UE+lF0DDxS12fzn30Aig1zQAGVplAwwB2OsyBiGsDGNswDvdgu+oUwBgMvhm56+DDXRQUoVh4nkqm0ug92RLOAoZfKsNOpY9z6GlsoctAyOu2O4-GWBvGKeMkAOhsMLTvvi2z67lAtmAABeMBhuUWrbgw-4AIJJIIEBhiSdAUhQmYAELQS2dAkgAktSW5jnKGAYGBxSZrqmb5MUp69g6DBwC+1ZjnRIwvp2OqEUaDBhjieK+D6lq+k+MBRjGvayLx+Jmi+-4AOpgFAKBIDxUYANQMFqY6yGAljcQx6nSSwDBmgpSkMNYWYQdGnwqPRjGaTZKisapDL5A54kMAAvo5-48ZmcCZiMkGyPpDJmmO3kQJFyKorsMD7GsWLcJmMKscADBPPogiQNgDAcQwXiKFAkCCLl+WRdoSYetGDDFYYXj8CMuXVAuJY2l5HAgJ5QA&name=quebra%20manual)
:::
---
# O ritmo vira tamanho
:::col ratio=65%
No livro, o tamanho de cada letra vem do intervalo de tempo entre as teclas: quem digita devagar escreve grande. Aqui o ritmo vem do `noise()`, mas a estrutura do laço é a mesma.
```js
const frase = "o ritmo da escrita";
textAlign(LEFT, BASELINE);
fill(32, 40, 52);

let x = 24;
let y = 96;
const n = frase.length;
for (let i = 0; i < n; i++) {
  const t = noise(i * 0.35);
  textSize(20 + t * 62);
  const c = frase[i];
  const w = textWidth(c) + 3;
  if (x + w > width - 24) {
    x = 24;
    y += 104;
  }
  text(c, x, y);
  x += w;
}
```
Repare que `textWidth()` tem de ser chamado **depois** de `textSize()`: a largura depende do corpo.
:::
:::col ratio=35%
::img src="ritmo_tamanho.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQAHIURjCBhiYKhcKRaINRIpNIZFbZXKFSy4lCGa5mAIwRwCFC4xyWMDjQySiDSiDWfgoSDWAAsAAYddYINd9E8MAgAO7XSyWMQAbg4418guVMDtkggfEMIwg2gYljM3o1uL8GjMXgAFABKBjAT4eBRLMgCZIesNa3VIhjlYo6iOu2TVPjabqCfSi6Bh4pagBsuc++gEUGuaAAytMoGGAOy1mQMQ1gYytmDtrt531CmAMBl8M3PXwYa6KClCsPE8lU2l0buyJZwFBL5Vhp1LbufQ3NlCloGR12x3H4yz14yTxkga59MDoN9QLQTCGaW2fDuKAAIJJIIEBhiSdAUhQGYAELAc2dAkgAktSm6jnKGAYGGWYZumDD5MUJ49g6DBwM+lajmRIzPgAnFWo44nivgyAyD4ejACDjEIKBIJhRoMGGZFgM+Oo2gwol4L2ElgAA1HJUYxj2sjMfivgMn2xhhqJABUDA6gg5T5FuKhAc2YAAF4wBWOoMHJDC+PpVbEaOql3r4PrsY+MAANpgAAum5OgeQwZrPkBADqYBQHxYbaFGDnlMFYCWEJFEOeFLBhTFfEMNYDCVkpnwqORlFasFsi0XJDIAIw6hVJUMAAvk1QHxRmcAZiMpmyBlDJmqOrUQMNyKorsXEHIYWLcBmMK0cADBPPogiQNgBkSV4ihQJAgjreJLUcNoSYetGDA7YYXj8CM63VPORYSaNzVAA&name=ritmo%20tamanho)
:::
---
# O texto como planta baixa
:::col ratio=65%
Aqui cada caractere deixa de ser desenhado como letra e passa a ser uma **instrução**: uns avançam, outros giram, outros desenham. O texto vira o roteiro de um caminho.
```js
const frase = "forma segue funcao";
translate(74, height - 54);
textSize(18);
textAlign(LEFT, BASELINE);

for (const c of frase) {
  if (c === " ") {
    noFill();
    stroke("#e2632a");
    arc(0, -13, 26, 26, 0, HALF_PI);
    translate(13, -13);
    rotate(-QUARTER_PI / 2);
  } else if ("aeiou".includes(c)) {
    stroke("#2b5fd9");
    line(0, 0, 0, -26);
    translate(0, -26);
    rotate(QUARTER_PI / 2);
  } else {
    noStroke();
    fill(32, 40, 52);
    text(c, 0, 0);
    translate(textWidth(c), 0);
  }
}
```
:::
:::col ratio=35%
::img src="planta_baixa.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQAHIURjCBhiYKhcKRaINRIpNIZFbZXKFSy4lCGa5mAIwRwCFC4xyWMDjQySiDSiDWfgoSDWAAsAAYddYINd9E8MAgAO7XSyWMQAbg4418guVMDtkggfEMIwg2gYljM3o1uL8GjMXgAFABKBjAT4eBRLMgCZIesNa4o6pEMcoANh1EddsmqfG03UE+lF0DDxS12fzn30Aig1zQAGVplAwwB2OsyBiGsDGNswDvdgu+oUwBgMvhm56+DDXRQUoVh4nkqm0ug92RLOAoZfKsNOpY9z7DctAgDqMDAglQYYAjAha67Y7j8ZYG8Yp4yQILjVoxiCGYk5+t6fDXLanwoA2eLqjAXZapmUy3qgDDWAw+RatuDC7igLZgAAXghD62DheEAIJJIIEBhiSdAUhQmYAEIUS2dAkgAktSW6vr2-4MGGOJ4r4PqWr6X4wFGMa9rIYCWIJPrCMpv6-tJnwqH21wUvKGCRmOmnntcQJhmIADEMDFNm5TFHwYg4ZpBjaGGGboQ+5SZlZnnZpmrkABIUSSFJkjQnEOSoMECIY8GPh5bnlOFsjlpoSxhtYACKBIUUSdJEiFnFOAwxThQAvgwAzfvJgliHwN6imICCQNoGBmLAhhCRG6mySoRkmeZxTVPklhQAAnPZBkqF0CGuTNmbWFZiW4bB0V8KlrnzS+GkqMlq0IZl2W5flhXFRNZUVZOMmabIhotjBxkIYtcoYHpNmZrqmb5CdW07ssQm+b5i2RXBu1hnhl5gFAKBIB1AOnZ8JUcAjEDIqiuwwPsaxYtwmYwiM0YME8+iCJA2AMDqNoMF4ihQJAgik+TDBI9oSYevjNOGF4-AjKT1QLiWFNIyAJVAA&name=planta%20baixa)

As vogais viram curvas à direita, os espaços viram arcos à esquerda, e o resto continua sendo letra.
:::
---
# Contando caracteres
:::col ratio=65%
O primeiro passo para tratar texto como dado é medir alguma coisa nele. A contagem de frequência cabe em cinco linhas:
```js
const alfabeto =
  "abcdefghijklmnopqrstuvwxyz";
const conta = new Array(26).fill(0);
for (const c of texto) {
  const i = alfabeto.indexOf(c);
  if (i >= 0) conta[i]++;
}
```
E aí a frequência pode governar qualquer atributo do desenho. Aqui ela governa a cor:
```js
const maxi = Math.max(...conta);
textSize(21);
textAlign(LEFT, BASELINE);

let x = 24;
let y = 52;
for (const c of texto) {
  const i = alfabeto.indexOf(c);
  const f = i < 0 ? 0 : conta[i];
  const t = f / maxi;
  fill(lerpColor(color("#c9ccd2"),
                 color("#e2632a"),
                 t));
  text(c, x, y);
  x += textWidth(c);
  if (x > width - 40 && c === " ") {
    x = 24;
    y += 32;
  }
}
```
:::
:::col ratio=35%
::img src="frequencia.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQAHIURjCBhiYKhcKRaINRIpNIZFbZXKFSy4lCGa5mAIwRwCFC4xyWMDjQySiDSiDWfgoSDWAAsAAYddYINd9E8MAgAO7XSyWMQAbg4418guVMDtkggfEMIwg2gYljM3o1uL8GjMXgAFABKBjAT4eBRLMgCZIesNagBsOqRDHKeojrtk1T42m6gn0ougYeK6bzn30Aig1zQAGVplAwwB2GsyBiGsDGFswNud-O+oUwBgMvhm56+DDXRQUoVh4nkqm0uhd2RLOAoRfKsNOpZd2O4-Hb6UTz6yMRaDVea6lvhyrTjrQGJYMWCfvv3-S8DR1oYPbXAwExeEWIFiFeDAANSMiAX5oLcIEAI5mK+-5gCgYpvjizraFoxhoKBhiCgEIHjlB3ayHBAIwMRaHjiB4xYUaDDzOKhYMCBKB1oWGBIKh6FMKKySvkktocCeeK+HwGCWHw1QaCBojUfBilRDAliCEgYCxN0GBoIaXgoUY2HJGacAjAAXpJ3Z4fieGaBOPYwGaDAAIL6HWIyVmmEYIHKGAYGGOqbqOf5hg5vg+paDDntcUYxmp0UMGALlyQpSnSggkCwHAJCWFF4WyGAlgMGG6UsAyYU6EKfAANpgAAujBMEjgAvlJ3aGk2vHXECkautJ+JPHA6UMgAsnwKAYmNYYIItTl8OF55NmA1kwJWACMq3LB5SSCBAYYknQFIUFmABCHlNnQJIAJLUhuw3dg6DBwC5VYjm9IwufkxQjmRFWpbF5UJUl0GpRNDCZYpym5dA8CFcVI6yKl5UMuleAMDqDAAPw4ww2B1cqjUtajJNni55WOAwY1gBTQUheM+heGQ1xzvoUUc0aYZiAAxNoACc2hRMUYgRki0EqDLssqDinN8yA-MwMUablMUfAS1Laly3rW4RiV8XLFFWZwFmIxGx9MEMueADqYBQLNKPQWVFUfSwDBmo7s0MNYDC6gwABkQc6BOwgMg4EvRtL72fVqFOyL9NvZgD0Fdd2GcZ8iqK7DA+xrFi3BZjCv3AHTBiCJAxM6ja7GKFAkCCDXdcZwREDJkB5eN4YXj8CMxPVHOxatxwIAdUAA&name=frequencia)

As letras mais comuns do texto aparecem quentes; as raras somem no cinza.
:::
---
# Do texto ao diagrama
:::col ratio=65%
Mesma contagem, outra decisão: em vez de pintar a letra onde ela está, **levá-la para a linha da sua própria inicial**. Um `lerp` entre as duas posições mostra o texto se desmanchando em um diagrama.
```js
const maxi = Math.max(...conta);
textSize(12);
textAlign(LEFT, BASELINE);

stroke(228);
for (let i = 0; i < 26; i++) {
  const yy = 24 + i * 11;
  line(22, yy, width - 22, yy);
}
noStroke();

let x = 26;
let y = 24;
for (const c of texto) {
  const i = alfabeto.indexOf(c);
  if (i < 0) { x += 4; continue; }
  const alvo = 22 + i * 11;
  const t = conta[i] / maxi;
  fill(lerpColor(color("#c9ccd2"),
                 color("#2b5fd9"),
                 t));
  text(c, x, lerp(y, alvo, 0.9));
  x += textWidth(c) + 1.5;
  if (x > width - 26) {
    x = 26;
    y += 13;
  }
}
```
No livro, esse `0.9` é a posição do mouse: dá para ver o texto virando diagrama e voltando.
:::
:::col ratio=35%
::img src="frequencia_ordenada.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQAHIURjCBhiYKhcKRaINRIpNIZFbZXKFSy4lCGa5mAIwRwCFC4xyWMDjQySiDSiDWfgoSDWAAsAAYddYINd9E8MAgAO7XSyWMQAbg4418guVMDtkggfEMIwg2gYljM3o1uL8GjMXgAFABKBjAT4eBRLMgCZIesNagBsOqRDHKxR1EddsmqfG03UE+lF0DDxXT+c++gEUGuaAAytMoGGAOy1mQMQ1gYytmDtrsF31CmAMBl8M3PXwYa6KClCsPE8lU2l0buyJZwFBL5Vhp1Lbux3H4nfSyefWRiLQarzXMt8OVaCdaAxLBiwL-9h-6XgaPWhi9tcDATF4xagWI14MAA1IyIDfmgtygQAjmYb4AWAKBiu+OLOtoWjGGgYGGIKASgRO0E9rI8EAjAJHoROoHjNhRoMPM4pFgwoEoPWRYYEgaEYUworJG+SS2hwp54r4fAYJYfDVBooGiDRCFKVEMCWIISBgLE3QYGghpeKhRg4ckZpwCMABeUk9vh+L4Zok69jAZoMAAgvo9YjFWaYRggcoYBgYZ5qO5EMGGjm+D6loMBe1xRjG6kxQwYCufJinKdKCCQLAcAkJY0VbioYCWFFGUsAyeY6EKfAANpgAAurBsGjgAvtJPaGs2fHXECkaujJ+JPHAGUMgAsnwKAYmNYYIItzl8KVF7NmANkwGGACMxSrcsnlJIIEBhiSdAUhQWYAEKec2dAkgAktSm7DT2wzloNxTFLYpWRWGDrpa5Oo2oDeAMMUaYg2AbXJTBaUjCMrnVnBgMAFQMNt22jrIXRbV9WYI1mZpgFAs0MNY4PFATIylV1PXXH1H1bSePYA3ASOQ58AOIwy1YRex0VnrFPEVYlsOpULgNTgpSkqXl0DwEVJXY+lFVhhlYO1cADDs7BDJaiDzmQBhIN0yodWyQw8nJKplMoxl6OYyraW+Ayy1Nc1TgMGNYAq8FoXjPoXhkNc876ILYdhmIADE2gAJzaFExRiBGSIwebGeZzikcx8U1T5JYUBxynafqZn5fbhGpXbss0VZnAWaB+GIxZtb1xZjqCBx1XKu6wyF4AOok7NJUo9tCD5Cr5VRezLAMMTpNIOT4MBdG6c6xzKuyIjesY+UKtmwwdN08iqK7DA+xrFi3BZjCiPa08+iCJA2AMMDHGKFAkCCK-7904REBkzAW1l-QwXh+AjFftUecJZTYcBAB1IAA&name=frequencia%20ordenada)
:::
---
# Palavras, não letras
:::col ratio=65%
Contar palavras é o mesmo exercício com outro separador. `Map` guarda a contagem, e a lista ordenada vira um diagrama de barras.
```js
const palavras = texto.split(/\s+/);
const conta = new Map();
for (const p of palavras) {
  const n = conta.get(p) || 0;
  conta.set(p, n + 1);
}
const lista = [...conta]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 9);
const mx = lista[0][1];

let y = 22;
for (const [palavra, n] of lista) {
  const h = 14 + n * 6;
  const w = map(n, 1, mx, 70, 380);
  noStroke();
  fill(lerpColor(color("#c9ccd2"),
                 color("#2b5fd9"),
                 n / mx));
  rect(24, y, w, h);
  naCaixa(palavra, 24, y, w, h);
  y += h + 7;
}
```
:::
:::col ratio=35%
::img src="palavras_barras.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQAHIURjCBhiYKhcKRaINRIpNIZFbZXKFSy4lCGa5mAIwRwCFC4xyWMDjQySiDSiDWfgoSDWAAsAAYddYINd9E8MAgAO7XSyWMQAbg4418guVMDtkggfEMIwg2gYljM3o1uL8GjMXgAFABKBjAT4eBRLMgCZIesNagBsOqRDHKxR1EddsmqfG03UE+lF0DDxXT+c++gEUGuaAAytMoGGAOy1mQMQ1gYytmDtrsF31CmAMBl8M3PXwYa6KClCsPE8lU2l0buyJZwFBL5Vhp1Lbux3H4nfSyefWRiLSC41aYyCMwTu-+7R8a4MO9Gp7B58Tl+ZgioyIDXgwADUoE-g+DCvr676ft+Y6wYBDDAV+8H3n+YjgVBAIwAByFPEsnhaPBJEwGR-4vsh2F8LaHCfH6AZgEG7qJmAcB8GGhhZnAWYjFmZpZkgUYxj227LM2YAAF4wGGACMepbioOJ4r4fAYMkX4MmaDAAFQMDqCC2Gmo6yOp+K9FO2lfo4DAXgA6mAUAoEgvGqVJu4yfJYZoJASl6oZDDdKJIUmbYEZeb68oYFW+T5DFF4AIJJIIEBhiSdAUhQWZkHQG5Eslyy8fxkEMLYgkVUgTgMMUqkAL5MT2Vm+F4Wl8KkHqTo5yzXAghheEkKBho4bBsIYEGOKpbU6EKWgMhk+kALJ8OGqn3gwYZzV4DCWgwHX8N1hjieBc0yAy6maAgggaGGXhRgAPk9xkWfNyp8IN91eFmMhQYpTWnhpvD9povUANoIND118AAuuBg1GqNYZ8Fm1RRsILAMNUEOKXDDDWN+eNwxGiOGEk2gKZmDAAJyzWevhoHAvVJMMfAQzqcMk66nwOgwIy9cUxSjltO2MwwENHV19Z-QTB1s5oZ2SR9+K1QyilahVMhGeZ50S-pDJPOGEBZopWbM1mHY0+Uth5u9hrNig5ZApG71yhg8XjPoXhkNc876OLAdhmIADE2i09oUTFGIEZIuBKiJ0nan+0aIcgKHxTVPklhQLTsfxyryfF7IMgOcz0Xvf02ijdWgnCaJMUcc83EPZ13VZnXAsN0wMWCxBDK1VBHajs1EBj8iqK7DA+xrFi3Do7cgvAAwTz6IIkDYG9h2KFAkCCFvOo2gwY8fhAyaGNGDB70N-AjFv1TziWx8T41QA&name=palavras%20barras)
:::
---
# Ajustar o corpo à caixa
:::col ratio=62%
O truque que o livro usa no *treemap* vale sempre que um texto precisa caber num retângulo: meça com um corpo qualquer e use **regra de três**.
```js
function naCaixa(s, x, y, w, h) {
  textSize(100);
  const alvo = w * 0.86;
  const k = alvo / textWidth(s);
  textSize(min(100 * k, h * 0.8));
  fill(255);
  textAlign(LEFT, CENTER);
  text(s, x + 8, y + h / 2);
}
```
:::
:::col ratio=38%
Lendo linha a linha:

- meça a palavra a um corpo de referência (100);
- `k` é o fator que faria essa largura virar 86% da largura da caixa;
- o corpo final é `100 * k`, **limitado** pela altura da caixa - senão uma palavra curta e uma caixa baixa produziriam uma letra gigante que vaza.

O `min()` é a parte que quase todo mundo esquece na primeira tentativa.
:::
---
:::center
::img src="showcase_1.png" height=80%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgAMX6AEczBJtGAtFA+IZeBp9JTsDpFFprtprvp+hBSVokoJGQwtMZBGZIEsGBSGOpDE9qShaQgOCyIMMGABVABKABkAPq4kgAOQojGEDDEwVC4Ui0QaiRSaQyK2yuUKlmuEBQhmuZgCMEcAhQLscljA40MPtdLus-BQkGsABYAAxx6wQVlPDAIADu10sljEAG55S6lQBBdW4hhGsR8apRGCWQRIMCxboYNDJrwEowoMzJdNwEYALzzBcVvgNAA0KCRy59Kwwo15roJaYGtDA+Xz9CLYKKwIYF-ppbSqcmGBMvHwWaK12hbtcGES11yYGAu7TjSBPgBqd8Xl1LbT8jAaCnoYzoBHea7GMBD4MHe4wvqyDDzF61RMnOtKoRgSB3jB2Hdo+STvl+75+mK4wyquDBmFKYFSr6YA8gybIwDyYrbgqyQknwEFXn4DEQGAgYAVAd5iMRYhrqRXKQHovFLHAfqnnOfBoNUQFUcBsDGBA2H3sSsHaGY54aVoBgKKKWjnoIkB8EOkgQJSIwcgwlhmByUYun4GhGQAFAAlAwwCfB4ChLGQAjJJSPkAJwJkiDD5Amfn5jIDCodo3RLh60A+cUMYAGzJcFha+JY5Z8umzy+Bg1yKLif4+WqWo6vqdBFal8koPVro+ZY7XFSOOh-loRoZOmDBFmyfAjLlhUIIGGAYD5cbtbIYEMD5CpKtosFleOk4BUFqWyFtvhgOVJa4ggkCwHAJCWJtq0qIJG3nSwRorUNrp8AA2mAAC6n6filsgAL4DUqTxwOdRoALJ8CgGJQz5CCowqmj9alOILoYYAAXe7G8syrLspy8WxFoJ4YGYPIHqysAOSJEO+GYGBRje5VjRNU0zcUc0LUtECsxgT2nbwDG-hM5U-f9INfZDBgAVSRoy3LnUAMpgP2MA+QAjOUT2dUW3IQD56p0LiFDxQAQkW6t0OqACSuptXL5EMHA5XxnL62bSVOi7Qw+0kIdnwnf7MMTaW13QPA92PXLsgvT5514Awn3AB7DCfka+S5l9UZCzA+fg8d8u+CM5XlDG2cMOdABUDC6wA7InddlT5rPs9cf3-QF3KS4YCBeGYkw+T9XdgDevfxT9cDxSM-3xQDT2yJP08A9L88MIvbdPAElLD6PSDj9o8XbyM8Xo79m+OOKfDQ33beeznc7LAA6mAUCI49tfFG3ydPYsAYOmL+iMGDWAYPGAKnsjTe0+KXT4OJKTix5CyCYV9rg1U8BSKk8x+BIWuLjfGDATx8AwJYKsGhrifGTLiIMS0nrDH0NcIE79nz1hQMtBAthRZYNZLDW4OsAAS6trbxXKPlOM8VdZxSbnI2RK0faIT9oNH6fB4rVGXv9QOA90GGFDmXZhrCdYpycAwPmAVG7lGKNIhg+VijxWbrYeKli25izQLAjav04w6O-NUH6viAp33-mHNKMB+xgBgPoHyPil58h+rreJnj4q-SSRAixjjxTbwCekyBxQskBN8ZoxJT8EHFWwYI2APlVQAHFxEWPyPkTGshkFUnIkeWh1x1YyhMf5ZRB5VFKh+mfbJ8U0CXznDorM98D4GMCmEgWPlxj6C8GQfhMSWTYJ8mIAAxNoaK2gojFDEH5TB2y9m2LysUbQpz4ooD8qvN+ClNrjO3hMp6pdS7IlRLsGA+w1hYm4Jo24ldM772shAekcZ87nigFASAghoUl3lBFFBmcEV7n4CMek1QaoZRRRAEAoMgA&name=showcase%201)
:::
---
:::center
# A geometria da letra
:::
---
# O que mudou
:::col ratio=58%
```js
// em p5.js 1: duas bibliotecas
opentype.load(arq, (e, f) => {
  const cam =
    f.getPath(txt, x, y, tam);
  let p =
    new g.Path(cam.commands);
  p = g.resampleByLength(p, 11);
});
```
```js
// em p5.js 2: nativo
const f = await loadFont(URL);

f.textToPoints(s, x, y, opts);
f.textToContours(s, x, y, opts);
f.textToPaths(s, x, y);
```
:::
:::col ratio=42%
No livro, extrair o contorno de uma letra exige duas bibliotecas externas: `opentype.js`, para abrir o arquivo da fonte e ler os caminhos, e `g.js`, para reamostrar esses caminhos em pontos igualmente espaçados.

No p5 2 isso é nativo, e o objeto devolvido por `loadFont()` responde a três perguntas diferentes sobre a mesma letra:

- **pontos** - posições sobre o contorno;
- **contornos** - os mesmos pontos, separados por traçado fechado;
- **caminhos** - os comandos originais da fonte, com as curvas intactas.
:::
---
# `textToPoints()`
:::col ratio=65%
Devolve uma lista achatada de pontos sobre o contorno de todas as letras.
```js
textAlign(CENTER, CENTER);
const cx = width / 2;
const cy = height / 2;
textSize(170);
const pts = fonte.textToPoints(
  "tipo", cx, cy,
  { sampleFactor: 0.14 }
);

noStroke();
fill("#2b5fd9");
for (const p of pts) {
  circle(p.x, p.y, 5);
}
```
Duas coisas que economizam tempo:

- o **tamanho** vem do `textSize()` corrente, e não de um argumento. No p5 1 havia um parâmetro de corpo; aqui não há, e um número solto nessa posição é ignorado em silêncio - a letra sai minúscula e não se sabe por quê.
- a posição `(x, y)` é interpretada segundo o `textAlign()` corrente. Com `CENTER, CENTER` ela é o centro do texto, que costuma ser o mais cômodo.
:::
:::col ratio=35%
::img src="contorno_pontos.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQAHIURjCBhiYKhcKRaINRIpNIZFbZXKFSy4lCGa5mAIwRwCFC4xyWMDjQySiDSiDWfgoSDWAAsAAYddYINd9E8MAgAO7XSyWMQAbg4418guVMDtkggfEMIwg2gYljM3o1uL8GjMXgAFABKBjAT4eBRLMgCZIesNagBsOqRDGKuojrtk1T42m6gn0ougYZzabzn30Aig1zQAGVplAwwB2GsyBiGsDGFswNud-O+oUwBgMvhm56+DDXRQUoVh4nkqm0uhd2RLOAoRfKsNOpZdz7blAAQSSgggYbIdHXRKzt-vm50uPx2jgE4YZrAUBQSCcbMRxxPFfG0EYvymMBBFQQDihHU8mzAAAvGAwwARnbHUXxA-EfEML9DxgBBTwoa4aGuSBhTDT5ZDEDUvGuMQsw-FiRiRWjoz8Pg0C8cYKSLaV9GwBgdQQdCtQYABfT5j27Q0mxQMsgUjEc5QwDAaJAABiYpqnySwoAATjEF9BX0Bgw1w3wvAYS0GHwqMY27WRtDAAJxjDLwEDgLNvPYhh8hfGSIBC5FUV2YiDkMLFuCzGEIOABgnn0QRIBEnUbQcxQoEgQQMqykLtCTD0uNyww+L4EYROqOdi0KjgQCkoA&name=contorno%20pontos)
:::
---
# `sampleFactor`: quantos pontos
:::col ratio=35%
`sampleFactor` multiplica a densidade da amostragem. O padrão é `0.1`.

Vale menos do que parece perseguir fidelidade: contornos grosseiros costumam render desenhos mais interessantes do que contornos exatos.

Há também `simplifyThreshold`, que remove pontos quase colineares depois da amostragem.
:::
:::col ratio=65%
::img src="pontos_fator.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgkBjqQxoa46a4QFDXfQQYl8InDfSKYnaa5oBgofqGBiwCCGMBQRQTBAcJnc3wAVQASgAZAD6ADESAA5CiMYQMMTBULhSLRBqJFJpDIrbK5QqWUkoQzXMwBGCOATkiCOSxgcaGO1k0nWfgoSDWAAsAAYA9YqfonhgEAB3a6WSxiADcHD4hhGEG0DEsZjTPtJfg0Zi8AAoAJQMYCfDwKJZkATJZOFgDstgDSIYxWbxcTMgY1T42m6gn0VugheKfoAbJ2K6ThhmGKq+JHnr4MNdFLLzYWJTL5Uq6FPu0s4CgN2TC5YD7IjygAIJJQQQQtkOh78Wt5+vy+s5YAZTAAC8YELABGfIAwPacRQzPhyXZecGAAbQDBAAz9VtkOA4p0IQP18gAXS7WRLBgikBTNfQ6D7JBC0LQxLFbMBS2EFgy0+WRhVnbQ4Hg4DAwYABqBgwAYAAqNswMIlQON8bQRh49tJNkKlZRdDAS3jPw2WuIFRzHTtNKHIEAHUYDAQRUBAr9ZH6bQUELLiGGsBhgOAls2yw9y3OKTCrJJKCfA5VVLAQa8KGuGhrkgC1CzEPgxFbLiEpGVtgD8GkvHGWU+1g7A-EsBgAF9fKpH8tJ0-TnQwNSxAAYmKap8ksKAAE4xF88iGHsmdfC8BgYwYALS20MAAnGQsvAQOBWwm5KGHqfJ2tUwtmvAjTr1POyAQEQxrGMTw4xAfTrz-QCQPKI7ljvMzHw-ZU3wYW66HFXzrxi1F0sy7KKVyhxBLohKpvEv1FqqkCwIu48TqAnzFO-Y9xotBBxiEFAkAEtUNi8c1rnWAHW2KBtihe5YNvPCGUChsHVrh297xul87vfBmnq-IquwKjhkVRXYYH2NYsW4VsYTk1Knn0QRIFygMNK8RQoEgQQpY0jm01rZMy05MBDAyvgRly6pV37ZXOYKoA&name=pontos%20fator)
:::
---
# Cada ponto sabe para onde vai
:::col ratio=65%
Além de `x` e `y`, cada ponto traz `angle`: a direção da tangente ao contorno naquele lugar. É o que permite orientar o que você desenha em cima dele.
```js
textAlign(CENTER, CENTER);
const cx = width / 2;
const cy = height / 2;
textSize(170);
const pts = fonte.textToPoints(
  "tipo", cx, cy,
  { sampleFactor: 0.11 }
);

stroke("#e2632a");
strokeWeight(1.8);
for (const p of pts) {
  push();
  translate(p.x, p.y);
  rotate(p.angle);
  line(-10, 0, 10, 0);
  pop();
}
```
Somando `HALF_PI` ao ângulo você obtém a **normal**, que aponta para fora do contorno. Guarde esse detalhe: ele reaparece daqui a alguns slides.
:::
:::col ratio=35%
::img src="pontos_angulo.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQAHIURjCBhiYKhcKRaINRIpNIZFbZXKFSy4lCGa5mAIwRwCFC4xyWMDjQySiDSiDWfgoSDWAAsAAYddYINd9E8MAgAO7XSyWMQAbg4418guVMDtkggfEMIwg2gYljM3o1uL8GjMXgAFABKBjAT4eBRLMgCZIesNagBsOqRDGKuojrtk1T42m6gn0ougYZzabzn30Aig1zQAGVplAwwB2GsyBiGsDGFswNud-O+oUwBgMvhm56+DDXRQUoVh4nkqm0uhd2RLOAoRfKsNOpZdz7blAAQSSgggYbIdHXRKzt-vm50uPx2jgE4YZrAUBQSCcbMRxxPFfG0EYvymMBBFQQDihHU8mzAAAvGAwwARnbHUXxA-EfEML9DxgBBTwoa4aGuSBhTDT5ZDEDUvGuMQsw-FiRiRWjoz8Pg0C8cYKSLaV9GwBgdQQdD0IYABfT5j27YYyyBGiQAAYhgYo03KYo+DEF8FOuIEAHUYGg1AMIQWwX0FfQGDDXDfC8BhLQYfCoxjbtZC8MxJkjEctzrPF1TQrwEDgLMQpGF9ZDLTQljDEKBEEcYot4SA0OsdDM1ErNMqzbC-Jc65wxfGSIFK5FUV2YiDkMLFuCzGEIOABgnn0QRIBEnUbRcxQoEgQROu60rtCTD0uL6ww+L4EYROqOdiyGjgQCkoA&name=pontos%20angulo)
:::
---
# `textToContours()` e os buracos
:::col ratio=65%
`textToPoints` entrega tudo numa lista só, o que atrapalha na hora de **preencher**: o "o" tem um furo, e um furo precisa ser um traçado separado.
```js
textAlign(CENTER, CENTER);
const cx = width / 2;
const cy = height / 2;
textSize(170);
const cont = fonte.textToContours(
  "tipo", cx, cy,
  { sampleFactor: 0.3 }
);

noStroke();
fill(32, 40, 52);
beginShape();
cont.forEach((c, i) => {
  if (i > 0) beginContour();
  for (const p of c) {
    vertex(p.x, p.y);
  }
  if (i > 0) endContour(CLOSE);
});
endShape(CLOSE);
```
Cada traçado depois do primeiro entra como um contorno adicional. O sentido de giro de cada um, que vem da própria fonte, é o que decide se ele preenche ou fura.
:::
:::col ratio=35%
::img src="contornos_buracos.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQAHIURjCBhiYKhcKRaINRIpNIZFbZXKFSy4lCGa5mAIwRwCFC4xyWMDjQySiDSiDWfgoSDWAAsAAYddYINd9E8MAgAO7XSyWMQAbg4418guVMDtkggfEMIwg2gYljM3o1uL8GjMXgAFABKBjAT4eBRLMgCZIesNagBsOqRDGKuojrtk1T42m6gn0ougYZzabzn30Aig1zQAGVplAwwB2GsyBiGsDGFswNud-O+oUwBgMvhm56+DDXRQUoVh4nkqm0uhd2RLOAoRfKsNOpZdz7blAAQSSgggYbIdHXRKzt-vm50uPx2jgE4YZrAUBQSCcbMRxxPFfG0EYvymMBBFQQDihHU8mzAAAvGAwwARnbHUXxA98hS-Q8YAQU8KGuMghVFIww0+WQxA1LxrjELMP2YkYkRo6M-D4NAvHGCki2lfRsAYHUEHKBgAF9PmPbtDSbFAyyBSMRzlDAMDDcpiizXUs3yYoX2qGBBEgJs9HmZTYyFBBBX0OgiyQMMw20LMwCjYQWGjDiwEsBgwzABgPOwhhDOMiByOVSiLO7WQbN83DfC8BhLR0KMY2ilRkhgfRtzDLwEDgLM8pGF9ZCk9LvN8-zAqjCQoHC6UxRvEkSCbDcRwkl9atMvhzLIZrWq7MrkVRXYiIOQwsW4LMYQg4AGCefRQuEnUbQYLxFCgSBBGW1ayu0JMPU4zbDF4vgRmE6o52LXaOBACSgA&name=contornos%20buracos)
:::
---
# `textToPaths()`: a fonte como está
:::col ratio=62%
Os dois anteriores devolvem pontos: as curvas já foram achatadas em segmentos. `textToPaths()` devolve os **comandos originais**, no mesmo vocabulário do SVG.
```js
textSize(200);
const cmds = fonte.textToPaths(
  "Ra", 0, 0
);

// [ ["M", 42.4, 156.3],
//   ["L",  7.6, 156.3],
//   ["Q", cx, cy, x, y],
//   ["Z"], ... ]
```
`M` move sem desenhar, `L` traça reta, `Q` traça uma quadrática com um ponto de controle, `Z` fecha o traçado.
:::
:::col ratio=38%
::img src="paths_comandos.png" width=100%
:::
---
# Qual usar quando

| você quer | use |
|---|---|
| espalhar elementos sobre o traço | `textToPoints` |
| preencher a letra, com furos | `textToContours` |
| redesenhar as curvas sem perda | `textToPaths` |
| uma malha 3D para o modo WEBGL | `textToModel` |

Todos leem o corpo do `textSize()` e a âncora do `textAlign()` correntes. `sampleFactor` e `simplifyThreshold` só valem para os dois que amostram pontos: `textToPaths` não amostra nada, só traduz o que já estava na fonte.
---
# Dissolvendo o contorno
:::col ratio=65%
O primeiro exercício do livro sobre contornos: trocar a linha da letra por uma sequência de elementos. A letra continua legível por um bom tempo depois de deixar de ser desenhada.
```js
textAlign(CENTER, CENTER);
const cx = width / 2;
const cy = height / 2;
textSize(130);
const pts = fonte.textToPoints(
  "forma", cx, cy,
  { sampleFactor: 0.2 }
);

const n = pts.length;
for (let i = 0; i < n; i++) {
  const p = pts[i];
  stroke("#b39d00");
  strokeWeight(1.2);
  line(p.x - 5, p.y - 5,
       p.x + 5, p.y + 5);
  if (i % 2 === 0) {
    noStroke();
    fill(32, 40, 52);
    circle(p.x, p.y, 7);
  }
}
```
:::
:::col ratio=35%
::img src="dissolve.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQAHIURjCBhiYKhcKRaINRIpNIZFbZXKFSy4lCGa5mAIwRwCFC4xyWMDjQySiDSiDWfgoSDWAAsAAYddYINd9E8MAgAO7XSyWMQAbg4418guVMDtkggfEMIwg2gYljM3o1uL8GjMXgAFABKBjAT4eBRLMgCZIesNagBsOqRDGKuojrtk1T42m6gn0ougYZzabzn30Aig1zQAGVplAwwB2GsyBiGsDGFswNud-O+oUwBgMvhm56+DDXRQUoVh4nkqm0uhd2RLOAoRfKsNOpZdz7blAAQSSgggYbIdHXRKzt-vm50uPx2jgE4YZrAUBQSCcbMRxxPFfG0EYvymMBBFQQDihHU8mzAAAvGAwwARnKHUXxA-EfEML9DxgBBTwoa4aGuSBhTDT5ZDEQVjT4MQsw-FiRiRWjoz8Pg0C8cYKSLaV9GwBgdTKBgAF9PmPbtcN8GQGXwhBxiEf8RwYhgwwdBgwC-HUbR0uQewMsAAGpTKjGNu1kOSGC8L98IAbTAABdEdZGGMsgRokAAGJqnKABOKA9TEF8PJQLyYAAdRgaDUAwspwt4SA0K8BBP2sBh8izdKIKynLOJUWR0s-UzstyhAIPK-JkrASxNN0gBSbMJ2EBlsOjIqe2uJtIuubzktkOUMAwMNymKLNdSzfJiiGnQwACcYw1Kyr2IYYdOKk7ttu25FUV2YiDkMLFuCzGEIOABgnn0QRIBE-S7MUKBIEEB6DO27Qkw9LiXsMPi+BGETqjnYsPo4EAJKAA&name=dissolve)
:::
---
# O mesmo, orientado
:::col ratio=65%
Trocando o elemento fixo por um que respeita o `angle` do ponto, o desenho passa a ter uma direção de leitura - as marcas acompanham o traço em vez de brigar com ele.
```js
textAlign(CENTER, CENTER);
const cx = width / 2;
const cy = height / 2;
textSize(130);
const pts = fonte.textToPoints(
  "forma", cx, cy,
  { sampleFactor: 0.16 }
);

noFill();
for (const p of pts) {
  push();
  translate(p.x, p.y);
  rotate(p.angle + HALF_PI);
  stroke("#2b5fd9");
  strokeWeight(1.4);
  arc(0, 0, 18, 18, 0, PI);
  pop();
}
```
:::
:::col ratio=35%
::img src="dissolve_var.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQAHIURjCBhiYKhcKRaINRIpNIZFbZXKFSy4lCGa5mAIwRwCFC4xyWMDjQySiDSiDWfgoSDWAAsAAYddYINd9E8MAgAO7XSyWMQAbg4418guVMDtkggfEMIwg2gYljM3o1uL8GjMXgAFABKBjAT4eBRLMgCZIesNagBsOqRDGKuojrtk1T42m6gn0ougYZzabzn30Aig1zQAGVplAwwB2GsyBiGsDGFswNud-O+oUwBgMvhm56+DDXRQUoVh4nkqm0uhd2RLOAoRfKsNOpZdz7blAAQSSgggYbIdHXRKzt-vm50uPx2jgE4YZrAUBQSCcbMRxxPFfG0EYvymMBBFQQDihHU8mzAAAvGAwwARnKHUXxA-EfEML9DxgBBTwoa4aGuSBhTDT5ZDEQVjT4MQsw-FiRiRWjoz8Pg0C8cYKSLaV9GwBgdQQdC0wYABfT5j27Q0KXlDBIxHBiGDDXDfC8BhLQYfCoxjbtZC8MxJhUziUDrPF1TQrwEDgLM7JGF9ZDLTQljDOyBEEcYGAAagYAAJM8SQpMkaAASRcvxLOuIEaJAABiYpqnySwoAATjEaLhjLIEAHUYGg1AMIQLVooMbQw0zUSs3Q2w6oa2qGEi6KvGucMXxkiBuuRVFdmIg5DCxbgsxhCDgAYJ59EESARJ1G09MUKBIEEebFu67Qkw9LiVsMPi+BGETqjnYsNo4EApKAA&name=dissolve%20var)

O mesmo contorno, o mesmo número de pontos. Só o que se desenha em cada um mudou.
:::
---
# Variando o contorno
:::col ratio=65%
Em vez de marcar os pontos, **ligar** cada um ao seguinte por uma curva que se afasta do contorno original. A letra ganha um contorno novo, que oscila em torno do antigo.
```js
textAlign(CENTER, CENTER);
const cx = width / 2;
const cy = height / 2;
textSize(170);
const cont = fonte.textToContours(
  "tipo", cx, cy,
  { sampleFactor: 0.16 }
);

noFill();
stroke("#20242c");
strokeWeight(1.1);
for (const c of cont) {
  const n = c.length - 1;
  for (let i = 0; i < n; i++) {
    const a = c[i];
    const b = c[i + 1];
    const d = dist(a.x, a.y,
                   b.x, b.y);
    const lado = i % 2 ? 1 : -1;
    const ang =
      a.angle + HALF_PI * lado;
    const h = d * 1.6;
    const bx = a.x + cos(ang) * h;
    const by = a.y + sin(ang) * h;
    bezier(a.x, a.y, bx, by,
           bx, by, b.x, b.y);
  }
}
```
Usar `textToContours` em vez de `textToPoints` poupa um detalhe chato: como cada traçado vem separado, não é preciso testar a distância entre pontos consecutivos para evitar ligar o fim de uma letra ao começo da próxima.
:::
:::col ratio=35%
::img src="bezier_contorno.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQAHIURjCBhiYKhcKRaINRIpNIZFbZXKFSy4lCGa5mAIwRwCFC4xyWMDjQySiDSiDWfgoSDWAAsAAYddYINd9E8MAgAO7XSyWMQAbg4418guVMDtkggfEMIwg2gYljM3o1uL8GjMXgAFABKBjAT4eBRLMgCZIesNagBsOqRDGKGYjrtk1T42m6gn0ougYeK6bzn30Aig1zQAGVplAwwB2GsyBiGsDGFswNud-O+oUwBgMvhm56+DDXRQUoVh4nkqm0uhd2RLOAoRfKsNOpZdz7blAAQSSgggYbIdHXRKzt-vm50uPx2jgE4YZrAUBQSCcbMRxxPFfG0EYvymMBBFQQDihHU8mzAAAvGAwwARnbHUXxA98hS-Q8YAQU8KGuMghVFIww0+WQxA1LxrjELMP2YkYkRo6M-D4NAvHGCki2lfRsAYHUEHQtMGAAX0+Y9u0NCl5QwSMR2GMsgWokAAGJih1Ktim0MQX1U64gQAdRgaDUAwsSX0FfQGDDXCwIYS1X2VKMY27WQnJ7L9tAQcYhH-BhrAYdCR1kOyHIdBgwC-HUbViuQe0SsAAGo0o8jjvLfXwtAZbQAG0wAAXQilQfOqPzioYNKwrK7K3PxKAvygPsUDDPgEDgLMurYxqVEGoaVGqbqs1GkYX0Gnz+AbL84oAUmzBgAH4woYYTrHCxqfIEQQJwGhgur28ZaoYAAJM8SQpMkaAASQYAAqXhFGucqctAphWqesKEDTd6mt8apP0nbqzpxQxOqEKNnqQAHKog0GILqwxIChwQYaYAHqhgZCwBgfROrGo6EDYhhgfG-qvOGwaKfJsnRp68nSamqTPmkiAOeRVFdiIg5DCxbhxtuCDgAYJ59EESBhIShgvEUNqhBlxKOe0JMPU4trDF4vgRmE6o52LFWOBASSgA&name=bezier%20contorno)
:::
---
# Contorno feito de agentes
:::col ratio=65%
Isto é exatamente o exemplo "formas a partir de agentes" da aula passada, com uma diferença: as posições iniciais não vêm de um círculo, vêm de uma letra.
```js
textAlign(CENTER, CENTER);
const cx = width / 2;
const cy = height / 2;
textSize(230);
const cont = fonte.textToContours(
  "A", cx, cy,
  { sampleFactor: 0.12 }
);

noFill();
strokeWeight(1);
for (let q = 0; q < 26; q++) {
  for (const c of cont) {
    for (const p of c) {
      p.x += random(-2.2, 2.2);
      p.y += random(-2.2, 2.2);
    }
    stroke(32, 40, 52, 26);
    beginShape();
    for (const p of c) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);
  }
}
```
Quanto mais quadros, menos letra e mais nuvem. O ponto em que ela deixa de ser um "A" é uma decisão de composição, não do algoritmo.
:::
:::col ratio=35%
::img src="agentes_letra.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQAHIURjCBhiYKhcKRaINRIpNIZFbZXKFSy4lCGa5mAIwRwCFC4xyWMDjQySiDSiDWfgoSDWAAsAAYddYINd9E8MAgAO7XSyWMQAbg4418guVMDtkggfEMIwg2gYljM3o1uL8GjMXgAFABKBjAT4eBRLMgCZIesNa4o6pEMcp6iOu2TVPjabqCfSi6Bh4pagBsuc++gEUGuaAAytMoGGAOy1mQMQ1gYytmDtrt531CmAMBl8M3PXwYa6KClCsPE8lU2l0buyJZwFBL5Vhp1LbufHcoACCSUEEDDZDoG6JmbvD63Olx+O0cEnDDNYCgKCQJwGGKUccTxXxtBGb8pjAQRUCAkDT2WZswAALxgCts1fMCPyFb8jxgBAzwoa4yCFUUjDDT5ZDEc8xEzT8GJGJFqOjPw+DQLxxgpQtpX0bAGB1BAAEZigYABfT4Tx7Q0KXlDBI1HYZSyBAB1GBYNQMNhNfQV9AYMMHQYABHb8dRtEy5GAqsLOMgBqOyoxjHtZD0gycIghhLTfZUnNY1yjXc99fC8LzLB0PyXJUWQvAQL87IZetoCbMNrFKYpM3S19opihAoISvoGxStKykyspspUSSotkZTriBMNygyhhdUzfImuKGtR2i6oYEESBmz0eZFP8sd9LDDyGFC7ztEinKVGSGB9B3MNYrgTNYpGCrZCquaJCgAa+CGsgSRIZtNy6iTPiqqrkVRXZCIOQwsW4TMYSg4AGCefQ+ogATzMmxQoEgQQ-osqrtCTD02KBwwuL4EYBOqecizBjgQHEoA&name=agentes%20letra)
:::
---
# Contornos paralelos
:::col ratio=65%
Para deslocar um contorno para dentro ou para fora, precisamos da **normal** em cada ponto - e ela é o `angle` mais um quarto de volta.
```js
textAlign(CENTER, CENTER);
const cx = width / 2;
const cy = height / 2;
textSize(240);
const cont = fonte.textToContours(
  "a", cx, cy,
  { sampleFactor: 0.4 }
);

noFill();
strokeWeight(0.9);
for (let d = 0; d < 20; d += 1.8) {
  stroke(32, 40, 52, 110);
  for (const c of cont) {
    beginShape();
    for (const p of c) {
      const n = p.angle + HALF_PI;
      vertex(p.x + cos(n) * d,
             p.y + sin(n) * d);
    }
    endShape(CLOSE);
  }
}
```
No livro esse cálculo ocupa seis linhas de álgebra com `p5.Vector`. Com o `angle` que já vem no ponto, viram duas.
:::
:::col ratio=35%
::img src="paralelos.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQAHIURjCBhiYKhcKRaINRIpNIZFbZXKFSy4lCGa5mAIwRwCFC4xyWMDjQySiDSiDWfgoSDWAAsAAYddYINd9E8MAgAO7XSyWMQAbg4418guVMDtkggfEMIwg2gYljM3o1uL8GjMXgAFABKBjAT4eBRLMgCZIesNa3VIhjlPUR12yap8bTdQT6UXQMPFLUANhzn30Aig1zQAGVplAwwB2GsyBiGsDGFswNud3O+oUwBgMvhm56+DDXRQUoVh4nkqm0uhd2RLOAoRfKsNOpZdz7blAAQSSgggYbIdHXRIzt-vm50uPx2jgE4YZrAUBQSCcBhihHHE8V8bQRi-KYwEEVBAOAk9libMAAC8YHLXUX1A98hS-Q8YAQU8KGuMghVFIww0+WQxD4MQMw-eiRiRKjoz8Pg0C8cYKQLaV9GwBgdQQLUGAAX0+Y9u0NCl5QwSMR2GEsgQAdRgGDUDDQSAE4X0FfQGDDB0GCgL8dRtIy5CA0zzIAagZABGBBbCjGNu1kBTriBMNymKDN0wYfIfIYOy7J1F9ZF0-TsPAhhLVfZVnJYvMYEESAmz0eY5MS0c9LDKKGC8GLLB0BLXJUWQ8pkBkvAQARBHGBhrIYAAJM8SQpMkaAASRHMrZGSGB9G3MNqs-RqcUMMMICjAAqIzmNK3rFuqyDGsMSBJpmoywpUMSFoYCQoDSvgMrIEkSCbDcetEz5dt25FUV2AiDkMLFuAzGFIOABgnn0FKIH4qyvEUKBIEEAGzN27Qkw9ViQcMTi+BGfjqjnQsIY4EARKAA&name=paralelos)
:::
---
# Quando o deslocamento vira moiré
:::col ratio=65%
Empurrando os contornos para bem longe, eles passam a se cruzar. As interferências entre traços vizinhos geram padrões que não estão em lugar nenhum do desenho original.
```js
textAlign(CENTER, CENTER);
const cx = width / 2;
const cy = height / 2;
textSize(200);
const cont = fonte.textToContours(
  "e", cx, cy,
  { sampleFactor: 0.35 }
);

noFill();
strokeWeight(0.8);
// o externo e o contorno mais longo
let fora = cont[0];
for (const c of cont) {
  if (c.length > fora.length) {
    fora = c;
  }
}

for (let d = 0; d < 70; d += 1.6) {
  const t = d / 70;
  stroke(lerpColor(color("#2b5fd9"),
                   color("#e2632a"),
                   t));
  beginShape();
  for (const p of fora) {
    const n = p.angle + HALF_PI;
    vertex(p.x + cos(n) * d,
           p.y + sin(n) * d);
  }
  endShape(CLOSE);
}
```
:::
:::col ratio=35%
::img src="paralelos_var.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQAHIURjCBhiYKhcKRaINRIpNIZFbZXKFSy4lCGa5mAIwRwCFC4xyWMDjQySiDSiDWfgoSDWAAsAAYddYINd9E8MAgAO7XSyWMQAbg4418guVMDtkggfEMIwg2gYljM3o1uL8GjMXgAFABKBjAT4eBRLMgCZIesNa3VIhjlYo6iOu2TVPjabqCfSi6Bh4pagBsuc++gEUGuaAAytMoGGAOy1mQMQ1gYytmDtrt531CmAMBl8M3PXwYa6KClCsPE8lU2l0buyJZwFBL5Vhp1LbufHcoACCSUEEDDZDoG6JGbvD63Olx+O0cEnDDNYCgKCQJwGGKUccTxXxtBGb8pjAQRUCAkDT2WZswAALxgCs9VfMCPyFb8jxgBAzwoa4yCFUUjDDT5ZDEGAxAzT8GJGJFqOjPw+DQLxxgpQtpX0bAGB1BBynyBgAF9PhPHtDQpeUMEjUdhlLIEAHUYFg1AwyE2xXwiBhrgYZYYH0Q1DP0t9lSNUz3kMXhcUEa5PgdMd62-MCUAAbR1ABdUdBX0BgwxwiD9MsCyUCjGMe1kMAwqChBxiEACGBYFy+ASiRBAAyLWNkfytAZbRR1kCSe1Kz5-MC5yoG-HUbQYGq8AYDs6oahgAGoGQARgQGto1Y4KGF8BkascZq6tYpTriBMNxn0LwyPnfQguuJaqJAABiYpqnySwoAATjECMWOilQzvOi6cTWsQNpgYoqyzPgjpOi7XreiLX3zGBBEgZs9HmBTWMqlbwIYLxQrSnLTtkQaZAZLwEAEQRxg6hgAAlzxJCkyRoABJYqVGSYydzDBGv3at9DDDCAowAKgal63rOhGoIpwxIGpumGs+8TWIkKA-r4AGyBJEhm03UdStK5FUV2QiDkMLFuAzGEoOABgnn0H6IAE1qvEUKBIEEXX6tK7Qkw9NjDcMLi+BGATqnnItTY4EAxKAA&name=paralelos%20var)
:::
---
:::center
::img src="showcase_2.png" height=80%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgAVSeDC8fH4qT4SIYZjQDBQ+j4mnUEBQ1wYUDAlhg-UZMBZ3O010Z130EGZRNpOkUWnGNL4CA4fIgwzxACUADIAfQAYiQAHIURjCBhiYKhcKRaINRIpNIZFbZXKFSz8lCGa5mAIwRwCJkQRyWMDjQyegUQaz8FCQawAFgADNHrML9E8MAgAO7XSyWMQAbg4fEMIwg2gYljMhfD-L8GjMXgAFABKBjAT4eBRLMgCZJ5msATlj5MjtmjdZzMgY1T42m6gn0rugNeKkYAbMPm-zFZYGAa+Cnnr4MNdFBqnTXcarNTq9SvR0s4Cgj4ya5Yr7IbygAIJJQQQGtkOi6uhKuSv7-kqz7UssADKYAAF4wDWACM+RDiOq4Kr4RIkmKBpiOGXjXNOfB+nw2aoYq-D6IIbp5puDAANoIAxGF8KSAC6CBPLWNbaA2wgsOBt4AOpgFAKBIFxDYANQMPBkZgfKipMpoPAGuRlG0oYCD9FAZjaHBNZkmOPF8VoUnVOSyGfFKDBwDRNYpsJokMNY1LXEpDaOAwxQoaOjr6AwNZWb0BrRlmDC9HghLEsxtIIOMQiiaF3QSRJDZNqOsjyb42g2QaNlSapVGGLR3QsU4nkjioOhrllIw0cUSEVSoeUqQYal5sVLGNRl1VVYyNGWAgr4UNcZBOq6Rg1kxpIdeS2WzSMSKfJVy0rata2yMAfh8GgXjjBqE5Mvo2AMNGCDlPkDAAL5gd1aEMGgtzMgavQAKQMJG3mVWy-kPVAT3CMFqXrctOJeP0Ei6MJxHpSowoQTS1xAvWoV+hgGA1uUxT9tG5L5FjnnFBZMOyNUMCCJAEF6PMyNLSo8ooAgvl0BOYlceSYBGY2tNfRuNZgAwfFDmOZOQKNApujTxMqL5-mZYSDDpjoDbJByN6TQgcDkl4CAjDdy3fXzAsnQ2EhQGLTIS2QKokBBdB67I11dSopuU3w1NWzbdtO5dDADMYDAG79-0GvBQMrTi9OCsKhiRbS4z7o0UvChq-ro8OfgI0CAkwGAgioDWp22PbxaCv5VlQDRIUsnI0m2KFFcSQaxSpdzKjDDOSNiAAxMU1T5JYUDdmIxeyDLXE9UWiv0y3UuVaT5MQK71Mj9Lpfj3dXgKxu3Fc7Py1yzIBrawIgjjAwUkABJviqGpqjQACSTtrSr+hq9reVVYYNYQA2ABULJax1ufPwkBv5-xZCvB2rdKouypnBD2tsV6XVbsgmGPs-bckDo9TcANPJhxBh5PCAoY6CjABITQf1E4rXbojOC3cYDFEXJjYiIB040KzjnPOKAEIIFkk-Eufl16KkntvJ0M81pjzlpvKe4j1peDMJMSWwNpQKjDHBd+gDdb8MqjOTQSx1Yn3GJA3gkA4LWAAOzmXJJY422iVB4VrEglBtN0EYH9ptYGninAeUsLSCAsQtCwGFtBMh+hW7J1TsjDOHc4KY2xrjfG8FzHIWibQ7Oud86nW7MXSRE8t69RQLIlaY8rL82CqFfmEVtCxQkIIRyzl4IVOSkU1acstAGm0LRMALFyTVBop0-mUl4KdWgXTHqFcDSsmGPpDW5IZQLTHLMxZWjRm3UVCfGiMpDHckvtfW+D8GD-0Nm9YoDAAD80kGDHWsKHOxazfDVBygwGUH8+RfxPuAiu-94IIDrqs3qipqi1S3EAqShhQEfMOdXb5vy7nBNCTMzWzyda9KRUC1FvSFnVCWdilZe9UErQJSoIlqDUHIlRLsGA+w1hYm4L024tVNpPAopAY6VciRQFZEINloVUHaA7NRTaUzdp8BGMdao+5Jy8o4CAS6QA&name=showcase%202)
:::
---
# Outro caminho: amostrar pixels
:::col ratio=65%
Contornos não são a única via. Escrevendo o texto num **buffer fora da tela** e lendo os pixels, a letra vira uma máscara - e aí cabe qualquer coisa dentro dela.
```js
const W = width, H = height;
const g = createGraphics(W, H);
g.pixelDensity(1);
g.background(255);
g.textFont(fonte);
g.textSize(150);
g.textAlign(CENTER, CENTER);
g.text("tipo", W / 2, H / 2);
g.loadPixels();

const frio = "#2b5fd9";
const quente = "#e2632a";
strokeWeight(1.3);
for (let x = 0; x < W; x += 5) {
  for (let y = 0; y < H; y += 5) {
    const i = 4 * (y * W + x);
    if (g.pixels[i] > 128) continue;
    const n = noise(x / 50, y / 50);
    stroke(n < 0.5 ? frio : quente);
    push();
    translate(x, y);
    rotate(n * TWO_PI);
    line(0, 0, 15, 0);
    pop();
  }
}
```
:::
:::col ratio=35%
::img src="cinetica.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQAHIURjCBhiYKhcKRaINRIpNIZFbZXKFSy4lCGa5mAIwRwCFC4xyWMDjQySiDSiDWfgoSDWAAsAAYddYINd9E8MAgAO7XSyWMQAbg4418guVMDtkggfEMIwg2gYljM3o1uL8GjMXgAFABKBjAT4eBRLMgCZIesNa3VIhjlPUR12yap8bTdQT6UXQMPFLUANhzn30Aig1zQAGVplAwwB2GsyBiGsDGFswNud3O+oUwBgMvhm56+DDXRQUoVh4nkqm0uhd2RLOAoRfKsNOpZd2O4-EAdQnDDNYCgKCQGYAEpepmBBKgRzi8b5BJe43wlgA4nWXhIGABxhmej6bgwggIF4YBwAMRASIYYCjGGACM0GwfmhbFqWbbFPk+TYQg267kuh4wKR5FNmAABeMCYfkOo0csACCSSCBAYZkHQ65EhmfECWxO5hmIGpeNcYgZhejgMMUj5OAppFzooNAIQMhiRq6J5fr6njXJeYgAMTFNU+SWFAACctp6fiACOZgSEsxkgCZMDFJW5TFHwdndsMJZAmeMCvqgmEIOU0GCvoDBhg6DBwJeOo2olcgMGeqVJQA1AyJHRp8sgxXFCUjMlqVlXgDAPhVDC5Qw+Uxt2Kg6KevhgJeWoMAAVHFZW9Re2WJdBLVgJYcWwfBiEYIYADaYAALoMCwDAYcUthRp+GoQM5I4tZ++IyAyvbGGGSXySxGZlRdrF7SogXXECYYyFVOoIPkDAAPwGWARnYAwTkudRd2yF4ZiTDphUqCgdZ4uqTFwFdI0qCWmhLM9PUMBQZ4kGSNAAJLI7IXRMTqGZk6t+Tk0TDBSeGyMAL6fEzEAs8iqK7DA+xrFi3AZjCZXAAwTz6IIkD-SltOKFAkCCBLqUs9oSYetGDAy4YXj8CM-3VHOhYKxwIAM0AA&name=cinetica)
:::
---
# Contorno ou pixel?
:::col
**Contorno** (`textToPoints` e parentes)
- dá posições exatas e a direção do traço
- o desenho segue a **borda** da letra
- precisa do arquivo da fonte
:::
:::col
**Pixel** (`createGraphics` + `loadPixels`)
- dá o **interior**, não a borda
- serve para qualquer fonte, e também para imagens e logos
- custo cresce com a área amostrada
:::

Duas perguntas diferentes: "onde passa a linha da letra?" e "que pixels estão dentro dela?".
---
# A letra como máscara
:::col ratio=65%
Trocando a marca desenhada em cada pixel aceso, o mesmo código vira outra imagem. Aqui cada ponto da máscara vira um círculo cujo tamanho vem de um campo de ruído.
```js
const W = width, H = height;
const g = createGraphics(W, H);
g.pixelDensity(1);
g.background(255);
g.textFont(fonte);
g.textSize(160);
g.textAlign(CENTER, CENTER);
g.text("A", W / 2, H / 2);
g.loadPixels();

noStroke();
for (let x = 0; x < W; x += 7) {
  for (let y = 0; y < H; y += 7) {
    const i = 4 * (y * W + x);
    if (g.pixels[i] > 128) continue;
    const n = noise(x / 66, y / 66);
    fill(32, 40, 52, 60 + n * 150);
    circle(x, y, 2 + n * 11);
  }
}
```
:::
:::col ratio=35%
::img src="cinetica_noise.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQAHIURjCBhiYKhcKRaINRIpNIZFbZXKFSy4lCGa5mAIwRwCFC4xyWMDjQySiDSiDWfgoSDWAAsAAYddYINd9E8MAgAO7XSyWMQAbg4418guVMDtkggfEMIwg2gYljM3o1uL8GjMXgAFABKBjAT4eBRLMgCZIesNa3VIhjlPUR12yap8bTdQT6UXQMPFLUANhzn30Aig1zQAGVplAwwB2GsyBiGsDGFswNud3O+oUwBgMvhm56+DDXRQUoVh4nkqm0uhd2RLOAoRfKsNOpZd2O4-EAdQnDDNYCgKCQGYAEpepmBBKgRzi8b5BJe43wlgA4nWXhIGABxhmej6bgwggIF4YBwAMRASIYYCjGGACM0GwfmhbFqWbbFPk+TYQg267kuh4wKR5FNmAABeMCYZWOo0csACCSSCBAYZkHQ65EhmfECWxO5hmI7FiBmF6OAwxSPk4cmkXOig0AhAyGJGrqfIaTYoCWQJaZ8gr6AwYYOgwcCXjqNqWXIDBnrZVkANQMp20afLIJlmRZIzWbZfl4AwD4BQwrkMO5MbdioOinr4YCXlqDAAFRmX5qUXs5lnQTFYCWGZsHwYhGCGAA2mAAC6DAsAwGHFLYUafhqEBmC6nkqJ++IyAyvbGGGVmyZWlYZn5g3ViOMVyhgGBhuU8kMOmDD5PNLFhT2KW1fkrETR1YABOM-UjRmxRrTIqUYVhO0AL6fDdEB3ciqK7DA+xrFi3AZjCfnAAwTz6IIkDYAwNkMF4ihQJAghAyDd3aEmHrRgwEOGF4-AjED1RzoWtkPVdQA&name=cinetica%20noise)
:::
---
# A letra em três dimensões
:::col ratio=65%
Em `WEBGL`, `textToModel()` transforma o texto numa malha - com espessura, se você pedir.
```js
textSize(150);
const m = fonte.textToModel(
  "p5", 0, 0,
  { sampleFactor: 3, extrude: 26 }
);

rotateX(-0.5);
rotateY(0.7);
ambientLight(90);
directionalLight(255, 255, 255,
                 -0.4, 0.6, -1);
fill("#2b5fd9");
noStroke();
model(m);
```
O `extrude` dá profundidade; sem ele, a malha é plana. E como é um `p5.Geometry` comum, vale tudo o que vale para qualquer modelo: material, textura, iluminação.
:::
:::col ratio=35%
::img src="modelo3d.png" width=100%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EDaa4QYYMACqACUADIAfQAYiQAHIURjCBhiYKhcKRaINRIpNIZFbZXKFSy4lCGa5mAIwRwCFC4xyWMDjQySiDSiDWfgoSDWAAsAAYddYINd9E8MAgAO7XSyWMQAbg4418guVMDtkggfEMIwg2gYljM3o1uL8GjMXgAFABKBjAT4eBRLMgCZIesNa4o6pEMcp6zMAdToACEAOIkiOu2TVPjabqCfSi6Bh4pagBsZc+TqWDAZfDNz18GGuigpQrDxPJVNpdDbMgYSzgKGHyrDHZg09kc5QAEEkoIIGGyHRJ0TMwej9PPhuAMpgABeMDDAEZ8jq1zpcfi0F3fUKYAgNxRrgAWVuAYw0+WQxAKMRMwzBgM3A6M-D4NAvHGCkq2lfRsCzTNln0MxYGw4pmwYABfT5zxnOtNCWAANMNrB1BB8lfai+CWKgwyYgB2V9kOqMAJBQEkwEEVAwwAThfcsGCgMB+m0QN3QwESxJQRt8nyTNik07TdIQlRDKMlRGIQLUYIQZtM2sB9XzlDAMDAkAAGJimqfJLCgCSxFfQ1LxQOsgUjGS0BAxy0GnciIGRVFdl-A5DCxbhMxhEZEKefRBEgbCdRtBgvEUOShByvKou0JMPUQuTDFQvgRmw6oB2rUqOBAUigA&name=modelo3d)
:::
---
:::center
::img src="showcase_3.png" height=80%
[editar](https://esperanc.github.io/p5front/?share=N4IglgdgJgpgHgOgBYBcC2AbEAuEAeAQgBEB5AYQBUBNABQFEACVTAPgB0I9mMGMBDCAHMAvGxAwIY9hAYMuMPlGmzZeNDBR8GAYyR8ATgGcNokAFcUAMwC0ADjEMA9MpV5D2-WAAOKBof3apqgoXobYjo7aUBAIAFaGsBhgAG76CBAajhBeaI5eAKwAAgBMCKUAzI5JAEZ5+XGGUniO7p4+LqpJEADWDPowGKaGKACeGDCGSDAaDqNeMKYo8CiRho0gTP2WQ6PjCNprDs4cqo5Tii541QD2UCMdcmh8kCzNTy8nrq3evv6BYoZuhpdA0mi0PD9Lo4bndpM1uNIQAAaECA4FIBo4EARBgAQV4Gn0Wm01zQ1wYT3cBj42AY5MgS08130DD4ZOGRKg5OSYCJDDMaB0bK85NgDBQRJJhgQHBJEGGDAAqgAlAAyAH0AGIkAByFEYwgYYmCoXCkWiDUSKTSGRW2VyhUs1wgKEM1zMARgjgEKGdjksYHGhm9Lud1n4KEg1gALAAGWPWCDMp4YBAAd2ulksYgA3Bw+IYRhBtAxLGZi5HnX4NGYvAAKACUDGAnw8CiWZAEyQLdYAnPGkQxo7ZYw28zIGNU+NpuoJ9O7oHXitGAGxjz5JsDGADK0ygdYAjAf1xO5QrLAxDXw089fBhropNc6UHWVRrtXq6CfZEs4Cgny6daWCerbOgqgiXjo-R8EsADiRJeEgYAHHWaZgFAKBIIOUxgIIqDfgwggIF4YBwAMRASIYYCjIeBFEVOM5zgu+7FPk+R0Qgv7-s+QEcVx25gAAXjAS7lKO46yERXG4kkggQHWZB0J+yqDopyl8csdZiE6+hPGIg5oRhSBOAwxTYTAuGoCZxQcfeig0KRAyGI246gfKvheHw4yaJBADaYgAMTFLGy7FNo+lGiAQXVPklhQL2EWBTAxQruUxR8IlUUHpYADsfCpWIAC6EmlsyDB1t5DBwJBsY5lVcgMIZmF1dVADUhrRk2LYTrIOnlZVIw1XVg14EwFl4Sgw0MO1Q5dZ8Kg6GBvhgJB0YMAAVOVg2bU1xmtVVBELWeviwC686QURJFkRghi+WAhUNQexS2CVR1LQwMiGpuxh1tVjgMP2g6Df9-aHSox0UpB30iX9pnFNNQ6xkD1nw-tcZg7IYAXnWp0Stcc09Qtfh40Cdaed5fC+ZY97MnWgqbZ1DAAKRDoVGMqBy1xAgA6uNqCHgg5Ts7IXhmJMLnzUTEoCIYEYw0Dwt9NcmhLHWMibRQ3MkOqNAAJIbaZitdCJSMMKb5QI-TDAHuUg7iZLC0ivW7MAL4ME5MAMFj5WCiwZsICuNnNg7KhJtuJMiYrAYYBgdZpYOcaDvkZnW2ur1E9ovLaOMv1A4OB4B67ksu58JcQGXyKorsMD7GsWLcIOMKDcAFIGIIkC0rVDCeVAUCQIInd1WX2hdgWzYMH3hhePwIy0tU94zkPHAgC7QA&name=showcase%203)
:::
---
# Recapitulando
:::col
**Escrever**
- `textSize`, `textAlign`, `textLeading`
- `text(s, x, y, w, h)` + `textWrap` quebra sozinho
- `textWidth`, `textBounds`, `fontBounds`
- `textProperty` abre o resto da API do canvas

**Carregar**
- `loadFont()` é assíncrono: `async setup` e `await`
- para geometria, o **arquivo** da fonte
- `.woff`/`.ttf`/`.otf` sim, `.woff2` não
:::
:::col
**Extrair**
- `textToPoints` - pontos, com `x`, `y` e `angle`
- `textToContours` - pontos separados por traçado
- `textToPaths` - comandos `M`/`L`/`Q`/`Z`
- `textToModel` - malha 3D
- `sampleFactor` controla a densidade

**Manipular**
- marcar, ligar, deslocar, deformar os pontos
- a normal é `angle + HALF_PI`
- ou esquecer o contorno e amostrar pixels
:::
---
# Para levar adiante
:::col
Os exemplos vêm do capítulo **P.3 Type** de *Generative Design* (Bohnacker, Gross, Laub, Frohling), reescritos para a API nativa do p5.js 2. Os originais, que dependem de `opentype.js` e `g.js`, estão em **generative-gestaltung.de**.

Fontes variáveis são o passo seguinte natural: com `textProperty("fontVariationSettings", ...)` dá para animar peso, largura e inclinação de forma contínua - e `textToPoints` acompanha.
:::
:::col
Sugestões de exploração:

- Ligue os pontos de duas letras diferentes e interpole entre elas.
- Use o `angle` para fazer os elementos crescerem só nas curvas, e não nas retas.
- Troque `random()` por `noise()` no exemplo dos agentes e veja a letra respirar em vez de tremer.
- Amostre os pixels de uma foto, e não de um texto, com o mesmo código da máscara.
:::
---
:::center
# Obrigado
:::
