---
title: Catálogo do que Não Existe
tags: [museum, art, interactive, generative, AI]
collection: projeto final/Nicole Cardozo/1
---

# Catálogof do que Não Existe

**Projeto final · parte 1 de 3** · feito com auxílio de AI (Claude)

Um museu de objetos impossíveis. Cada objeto do acervo foi "doado" por alguém que descreveu **para que ele serve**: medir a saudade, abrir as manhãs de segunda-feira, chamar quem já foi embora. O museu fabrica o objeto em 3D, dá a ele pelo menos uma **contradição** que o torna inutilizável (uma alça do lado de dentro, uma peça que nunca tocou o resto, um dente em duplicata) e o cataloga com uma **ficha catalográfica**, como num acervo de verdade.

A obra brinca com a distância entre o objeto e o documento que o descreve. A ficha é rigorosa: número de tombo, classificação, dimensões, procedência, estado de conservação e assuntos. O objeto que ela descreve, porém, não pode existir.

## O que já funciona (parte 1)

- **Gerador de objetos em 3D (WebGL).** Uma gramática de peças (cilindros, caixas, toros, esferas, cones, tubos curvos ao longo de curvas de Bézier e sólidos de revolução montados à mão como `p5.Geometry`). Cada um dos seis verbos tem uma estrutura própria:
  - *abrir* → chave com haste, argola e dentes;
  - *medir* → tripé, haste com graduação irregular e mostrador com ponteiro que gira sozinho;
  - *guardar* → recipiente torneado com tampa, alças e pés;
  - *chamar* → tubo curvo terminando em campânula;
  - *aquecer* → serpentina em volta de uma coluna;
  - *esquecer* → moldura com garras que seguram um vazio, com fragmentos à deriva.
- **Contradições.** Cada objeto recebe uma ou duas: peça duplicada, peça flutuante, alça interna, peça desproporcional ou peça torta. A contradição é escrita nas notas da ficha.
- **Materiais.** Latão, cobre, ferro fundido, porcelana, vidro, cera e papel, com materiais secundários e de detalhe escolhidos pela semente.
- **Ficha catalográfica.** Tombo (`CNE 2026/0007`), classificação na **CDI — Classificação Decimal do Inexistente**, denominação, material, dimensões calculadas a partir da geometria, época, procedência, conservação, modo de uso, notas, assuntos e doador.
- **Termo de doação.** Um formulário em que o visitante escolhe o verbo, escreve o complemento, o material e a época. O objeto é gerado deterministicamente a partir de uma semente.
- **Fichário.** Abas na parte de baixo da tela percorrem o acervo. As doações ficam salvas no navegador (`localStorage`).
- **Cena de museu.** Pedestal, luz de foco (`spotLight`), luz de preenchimento e animação de entrada na vitrine.

## Interação

| ação | efeito |
|---|---|
| **＋ Doar um objeto** (ou tecla **D**) | abre o termo de doação |
| **ao acaso** (no formulário) | preenche o termo aleatoriamente |
| arrastar / roda do mouse | gira e aproxima a câmera |
| abas do fichário ou **← →** | percorre o acervo |

## Ideias para o projeto final e o que pretendo acrescentar

### Parte 2: a exposição
- **Sala navegável.** Vários pedestais numa galeria em WebGL, com o visitante andando entre eles (câmera em primeira pessoa) em vez de ver um objeto por vez.
- **Vitrines e etiquetas.** Caixa de vidro sobre alguns objetos e uma pequena placa no pedestal com tombo e denominação, desenhada como textura.
- **Mais vocabulário.** Novos verbos (*consertar*, *apagar*, *dividir*, *esperar*), novas contradições (peça espelhada, peça que atravessa outra) e mais materiais, inclusive texturas procedurais (veios de madeira, pátina no cobre).
- **Sombras de contato** sob os objetos, para que pareçam pousados no pedestal.

### Parte 3: o sistema de informação
- **Busca no acervo** por verbo, material, época, assunto e doador, como num catálogo de biblioteca.
- **Índice de assuntos** navegável. Clicar em "Saudade — Medição" mostra todos os objetos ligados à saudade.
- **Exportação.** Baixar a ficha como imagem e o objeto em **STL**, para que o "objeto que não existe" possa ser impresso em 3D.
- **Relações entre objetos.** Objetos doados com complementos parecidos aparecem como "ver também" na ficha.
- **Acervo compartilhado** (se viável). As doações de visitantes diferentes passam a compor o mesmo museu.

## Técnica

- p5.js **2.x** carregado via CDN (jsDelivr). A biblioteca não está incluída no zip.
- Modo `WEBGL`; `p5.Geometry` construída vértice a vértice (sólidos de revolução); `model()`; primitivas 3D; cilindros orientados entre dois pontos com `rotate(ângulo, eixo)`; `spotLight`, `pointLight`, `directionalLight`, `specularMaterial`; `orbitControl`.
- Gerador pseudoaleatório com semente (mulberry32): o mesmo termo de doação sempre gera o mesmo objeto e a mesma ficha.
- Arquivos: `objeto.js` (gramática e desenho das peças), `ficha.js` (textos e catalogação), `sketch.js` (cena, acervo e interface).

## Uso de IA

Este projeto foi feito com auxílio de AI (**Claude**, da Anthropic). A IA ajudou a desenvolver o conceito e escreveu o código da primeira versão.
