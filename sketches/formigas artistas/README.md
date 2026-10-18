---
title: Formigas artistas
tags: [AI, Claude, Gemini, imagem, animação, agentes, picsum]
collection: artefato da semana/8
---

# Formigas montando um quadro

Este sketch em **p5.js (v2.3.4)** apresenta uma animação generativa e interativa em que uma colônia de formigas reconstrói, peça por peça, uma fotografia obtida dinamicamente da internet.

---

## A Ideia

A proposta parte do princípio discutido na **Aula 7 (Imagem)**: toda imagem digital é simultaneamente uma figura e um mosaico de recortes. Em vez de simplesmente exibir a imagem pronta ou processá-la de forma estática, a ideia foi transformar a montagem da figura em uma narrativa visual inspirada no comportamento de agentes autônomos.

Uma imagem de `480x360` pixels é requisitada publicamente e dividida em uma grade de **20 colunas por 15 linhas** (totalizando **300 seções quadradas** de `24x24` pixels). As posições dessas seções são embaralhadas em uma fila. A partir de um formigueiro no canto inferior esquerdo da tela, até 100 formigas saem em busca das peças, carregando cada recorte com detalhe real da foto até a sua coordenada exata dentro da moldura de madeira. Quando todas as peças são encaixadas e a última formiga retorna ao formigueiro, o quadro completo permanece em exibição por alguns segundos antes de uma nova imagem ser sorteada.

---

## Conceitos e Funções da Aula Aplicados

O projeto utiliza exclusivamente os recursos de manipulação de imagem e camadas gráficas do **p5.js v2**:

* **`async` / `await loadImage(url)`:** Carregamento assíncrono de imagens externas diretamente do servidor público `https://picsum.photos/480/360` com suporte nativo a **CORS** (e *fallback* de segurança para a pintura *Moça com Brinco de Pérola*, de Vermeer, hospedada na Wikimedia Commons).
* **`createImage()` e `copy()`:** Utilizados na preparação da imagem recebida para garantir que ela preencha as dimensões exatas do quadro (`480x360`) mantendo a proporção original sem distorções.
* **`createGraphics()`:** Empregado para criar duas camadas fora da tela (*offscreen buffers*):
  1. `fundo`: armazena o cenário estático (textura de terra, formigueiro, moldura de madeira e grade guia), desenhado apenas uma vez no `setup()` para otimizar o desempenho.
  2. `quadro`: camada transparente onde cada recorte entregue pelas formigas é gravado permanentemente.
* **`image()` com 3 e 9 argumentos:**
  * A assinatura de **3 argumentos** (`image(fundo, 0, 0)`) projeta as camadas principais no canvas a cada quadro.
  * A assinatura de **9 argumentos** (`image(origem, dx, dy, dw, dh, sx, sy, sw, sh)`) realiza o recorte direto da imagem de origem tanto para desenhar o pedaço que cada formiga carrega acima da cabeça quanto para estampar a peça no `quadro` no momento do encaixe.

---

## Processo de Desenvolvimento

1. **Concepção e Movimentação dos Agentes:**
   O primeiro passo foi modelar a classe `Formiga`, combinando trigonometria (`atan2`, `cos`, `sin`) para orientar o deslocamento entre o formigueiro e a célula-alvo no quadro, somado a um desvio suave com **Perlin noise** (`noise()`) para dar organicidade à caminhada. O desenho do corpo das formigas inclui animação cíclica das seis patas, antenas, sombra projetada e elevação da peça carregada.

2. **Resolução de CORS e Migração para Funções Nativas do p5.js v2:**
   Na versão inicial, o carregamento da imagem do `picsum.photos` apresentava falhas de redirecionamento e bloqueio de CORS ao tentar manipular elementos `<canvas>` e `<img>` diretamente pelo DOM. A solução foi substituir a abordagem manual pelo fluxo nativo ensinado em aula: `await loadImage()` do p5.js 2 (que já gerencia o cabeçalho `crossOrigin = "anonymous"` nos redirecionamentos do Picsum) em conjunto com `createImage()`, `copy()` e `image()` de 9 argumentos.

3. **Sincronização do Ciclo de Vida da Simulação:**
   Durante os testes, notou-se que a animação pausava assim que a 300ª peça era colocada no quadro, congelando na tela as últimas formigas que ainda estavam retornando ao formigueiro. A condição de término da montagem foi refinada para aguardar não apenas o preenchimento total do quadro (`colocadas === TOTAL`), mas também o recolhimento completo de todas as formigas (`formigas.length === 0`) e o fim das animações de encaixe (`efeitos.length === 0`).

4. **Adaptação de Controles de Teclado para o p5.js v2:**
   Por fim, os eventos de teclado em `keyPressed()` foram atualizados para o padrão de strings de eventos da versão 2 do p5.js (`"ArrowUp"` e `"ArrowDown"`), garantindo resposta imediata aos comandos de velocidade e pausa.

---

## Controles Interativos

* **`[Espaço]`**: Pausa / retoma a simulação.
* **`[↑]` / `[↓]`**: Aumenta ou diminui a velocidade das formigas (`1x`, `2x`, `4x`, `8x`, `16x`).
* **`[N]`**: Sorteia e carrega imediatamente uma nova imagem do `picsum.photos`.
