---
collection: artefato da semana/4
---

# Entre Prédios: Correntes da Noite

**Autor:** Paulo Vitor Couto

## Descrição

Este sketch generativo apresenta uma cidade noturna atravessada por correntes luminosas. As faixas do céu seguem um campo de fluxo calculado com ruído Perlin: cada pequeno deslocamento consulta a direção do campo e, por isso, os caminhos parecem pertencer ao mesmo vento sem serem idênticos. Um pequeno herói percorre uma dessas correntes sobre a cidade.

O resultado muda a cada execução ou clique. O canvas usa `windowWidth` e `windowHeight`, e todas as quantidades, posições e dimensões são calculadas proporcionalmente ao espaço disponível.

## Obras utilizadas como inspiração

### *The Starry Night* — Vincent van Gogh

Link: [página da obra no Museum of Modern Art (MoMA)](https://www.moma.org/collection/works/79802)

Da pintura, o sketch reinterpreta a predominância dos azuis profundos, os pontos amarelos cercados por halos e a sensação de um céu que se movimenta sobre uma paisagem silenciosa. Não há reprodução da pintura: os redemoinhos são reconstruídos por regras matemáticas e a vila dá lugar a uma cidade contemporânea.

### *Fidenza* — Tyler Hobbs

Link: [texto do artista sobre o projeto Fidenza](https://www.tylerxhobbs.com/words/fidenza)

De *Fidenza*, a ligação principal é o uso de um **campo de fluxo** para orientar trajetórias orgânicas. No meu sketch, o ângulo de cada segmento é calculado com `noise()`, criando correntes paralelas que variam em curvatura, espessura e cor. A técnica foi adaptada para representar vento e luz em um céu urbano.

## Decisões visuais e técnicas

- Paleta baseada em azuis noturnos, amarelos luminosos e pequenos acentos vermelhos.
- Correntes formadas por curvas calculadas a partir de um campo de fluxo.
- Estrelas com círculos concêntricos e brilho translúcido.
- Prédios gerados com diferentes larguras, alturas, antenas e janelas.
- Textura de pontos aplicada sobre a cena para lembrar impressão gráfica.
- Personagem construído com formas simples e orientado pela direção da corrente.

## Interação

- **Clique:** gera uma nova composição.
- **Tecla S:** salva a imagem atual em PNG.
- **Tecla H:** mostra ou esconde as instruções.
- **Redimensionar a janela:** adapta o canvas e gera uma nova composição.

## Conteúdo do ZIP

- `index.html`
- `style.css`
- `sketch.js`
- `README.md`
- `thumbnail.png`

O arquivo não inclui cópias locais de `p5.js` ou `p5.sound.js`. A única biblioteca necessária é carregada por CDN no `index.html`.
