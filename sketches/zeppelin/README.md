---
collection: artefato da semana/5
---

# Zepelim Psicodélico — releitura da capa de *Led Zeppelin* (1969)

Uma releitura em chave **psicodélica/onírica** da capa clássica do primeiro álbum do Led Zeppelin (a foto do desastre do Hindenburg). A composição original é preservada e reconhecível — dirigível inclinado, fumaça no topo-direita, torre de amarração, título laranja, selo circular — mas tudo é reconstruído por regras geométricas e depois **distorcido**: o preto vira prisma, a fumaça vira grão arco-íris, e um campo de deformação faz a cena inteira ondular. Nada é aleatório de verdade — um gerador com semente fixa mantém o quadro idêntico e reprodutível.

## Autor

Júlia Vilela 

## Inspiração

- Capa de *Led Zeppelin* (Atlantic Records, 1969); arte baseada na fotografia do desastre do Hindenburg (1937), de Sam Shere.

## Ligação com a obra e especificação geométrica

O sketch parte da mesma geometria da capa e aplica sobre ela uma camada de distorção visual:

- **Domain warp (a cena ondulando)** — toda coordenada passa por `warp(x,y)`, que soma senos de frequências diferentes em x e y. É o que faz o dirigível, a torre e o solo derreterem organicamente.
- **Dirigível prismático** — a elipse (445 × 84, girada 0,28 rad) é amostrada como um contorno, deformada e desenhada com um **aro em arco-íris** (matiz ao longo do perímetro), um corpo escuro translúcido, uma crista iluminada e **rastros** (o contorno repetido, deslocado e com matiz trocado, imitando o eco visual).
- **Fumaça arco-íris** — o mesmo campo de *metaballs* da releitura sóbria, agora pintado em pontilhado colorido e aditivo (`blendMode(ADD)`), com a cor variando pela posição.
- **Aura-mandala** — halos concêntricos e uma coroa de 200 raios em pétala irradiam de trás do dirigível, como um sol.
- **Aberração cromática** — o título "LED ZEPPELIN" é desenhado três vezes, deslocado e em matizes vermelho/verde/azul, produzindo a franja colorida.
- **Torre e solo neon** — desenhados como linhas aditivas com matiz variável sobre o fundo escuro.
- **Selo circular** — desenho **autoral** (dois cometas num anel arco-íris), não a marca da gravadora.

Em resumo: a mesma lógica dos outros sketches (regra geométrica exata + determinismo), aplicada para **reencenar uma imagem icônica sob uma percepção distorcida**.

## Arquivos

- `sketch.js` — o programa (documentado).
- `index.html` — importa o p5.js de um CDN; **não** carrega `p5.sound`.
- `style.css` — centraliza o canvas.
- `thumbnail.png` — prévia do resultado.
