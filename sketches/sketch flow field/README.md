---
collection: artefato da semana/4
---

# Curvature: Estudo em Campos de Fluxo

## Inspiração
- **Obra de referência:** Fidenza (Série de Arte Generativa)
- **Autor:** Tyler Hobbs
- **Link:** https://tylerxhobbs.com/fidenza

## Relação entre o Sketch e a Obra
Este artefato foi diretamente inspirado na abordagem estrutural da série *Fidenza*, de Tyler Hobbs, que utiliza campos vetoriais contínuos para guiar curvas orgânicas com espessuras e densidades variáveis. 

No sketch implementado:
1. Um campo vetorial é gerado dinamicamente utilizando **Perlin Noise** bidimensional (`noise()`), mapeando ângulos trigonométricos contínuos pelo plano.
2. Centenas de partículas percorrem trajetórias orientadas por esses vetores, desenhando traços com larguras (`strokeWeight`) distintas e pontas projetadas (`PROJECT`), emulando as fitas e blocos sólidos característicos da obra.
3. A paleta de cores balanceia tons escuros de fundo com toques quentes e terrosos, recriando o contraste visual marcante das gravuras generativas de Hobbs.
4. O sketch inclui interatividade: clicar com o mouse gera uma nova semente de ruído e reexecuta o algoritmo, produzindo uma composição única a cada execução.
