---
title: Malha
tags: [AI, Claude, 3D, WEBGL, p5.Geometry, tricô, Fair Isle, generativo]
collection: artefato da semana/10
---

# Malha

Em português, **malha** é ao mesmo tempo a *mesh* de triângulos da
computação gráfica e o tecido de tricô. Neste sketch as duas coisas são uma
só: uma máquina circular tece, ao vivo e ponto a ponto, um tubo de tricô
Fair Isle. Cada laço de lã é uma malha 3D construída vértice a vértice num
`p5.Geometry`, e o tubo inteiro é uma espiral contínua, ou seja, um fio só.

O tecido não é modelado à mão: ele sai de uma **curva**. O ponto de meia é
escrito como função de um parâmetro *s* ∈ [0, 1]:

```
u = k + s + A·sin(4πs)/2π      // avança na carreira; as pernas se inclinam (o "V")
y = −(k+s)/N · altura + H·cos(2πs)   // sobe em espiral; o laço sobe e desce
ρ = R − D·cos(4πs)            // as pernas vêm para a frente, a cabeça vai para trás
```

Essa curva é enrolada no cilindro e varrida por um tubo de 6 lados. Para
cada anel calculo à mão a tangente, a normal e a binormal, e gravo em
`vertices`, `vertexNormals` e `vertexColors`. As `faces` costuram os anéis
em triângulos no sentido anti-horário. Como a malha é real, o lado de
dentro do tubo mostra sozinho o avesso do tricô (o ponto tricô).

**O desenho** segue a gramática do Fair Isle: faixas de motivos com simetria
dupla (losangos, cruzes, X, molduras combinados ao acaso numa grade de
pontos inteiros e recusados se ficarem ralos ou chapados demais), faixas
miúdas ("peerie") entre elas, listras de acento, duas cores por carreira e
o sombreamento em degraus, simétrico em torno do centro da faixa. As
paletas são de lãs Shetland: creme, aveia, turfa, índigo, garança, musgo,
ocre. Cada fio ainda tem uma torção de três cabos, escrita na cor de cada
vértice.

**A máquina:** uma coroa de 60 agulhas, das quais o came levanta as que
estão perto do ponto atual; os dois fios da carreira descem de um olhal (o
da cor do ponto vai tenso até a agulha, o outro corre por dentro); o tubo
gira e sobe a cada ponto.

**Interaja:**
- **clique** — o tricô continua com um desenho novo a partir da próxima
  carreira (a história fica gravada no tubo)
- **segure espaço** — tece depressa
- **segure D** — desmancha: o fio é puxado e os pontos se desfazem na ordem
  inversa
- **arraste** — gira a câmera (`orbitControl`); **R** volta à câmera inicial
- **O** — baixa o tubo de tecido inteiro como `.obj` (`buildGeometry` +
  `saveObj`), para abrir em outros programas de 3D
- **S** — salva a imagem
- `?seed=N` na URL fixa o desenho

## Detalhes técnicos

- p5.js v2 via CDN (jsDelivr), modo `WEBGL`; nada da biblioteca no zip.
- Cada carreira pronta é **uma** geometria (60 pontos × 14 anéis × 6
  vértices); só a carreira em andamento é desenhada ponto a ponto, e o ponto
  que está sendo laçado é refeito a cada quadro até a fração atual da
  curva. Geometrias que saem de cena são liberadas com `freeGeometry`.
- 64 carreiras em memória (~350 mil vértices); roda a 60 fps numa GPU
  integrada.
- O padrão é gerado sob demanda, carreira a carreira, e guardado: desmanchar
  e refazer tece exatamente o mesmo desenho.

Autor: **João Galetti** — feito com o auxílio de AI (Claude, da Anthropic),
com verificação visual das iterações via Playwright.
