---
collection: artefato da semana/6
---

# Cultura Emergente: Cartografia de um Micélio Sintético

**Autor:** Paulo Vitor Couto

## Conceito

Este sketch simula uma colônia de agentes microscópicos dentro de uma placa de cultura. O programa não contém o desenho final da rede. Cada agente conhece apenas sua vizinhança e repete regras simples; os caminhos, bifurcações, regiões densas e conexões entre nutrientes aparecem durante a execução.

O resultado é um exemplo de **emergência**: uma organização visível em escala global nasce da interação de decisões locais.

## Regras locais dos agentes

1. Cada agente mede o sinal à frente, à esquerda e à direita.
2. Ele gira para o sensor com mais feromônio ou alimento próximo.
3. Ao andar, deposita um rastro químico.
4. O rastro se espalha lentamente e perde intensidade.
5. Regiões muito saturadas provocam um pequeno desvio, evitando um único caminho dominante.
6. Ao encontrar alimento, o agente recupera energia e pode gerar uma ramificação.
7. Agentes que saem da placa ou perdem energia deixam de atuar.

Nenhuma dessas regras manda os agentes formarem veias, árvores ou pontes. Essas estruturas são efeitos coletivos do sistema.

## Referência conceitual

[Boids, de Craig Reynolds](https://www.red3d.com/cwr/boids/)

O projeto de Reynolds demonstra como comportamentos coordenados podem surgir quando agentes respondem apenas a informações locais. O meu sketch usa outra metáfora visual e regras próprias, voltadas para rastros químicos e nutrientes, mas parte do mesmo princípio: combinar percepções limitadas para produzir uma dinâmica coletiva complexa.

## Interação

- **Clique dentro da placa:** adiciona um nutriente.
- **P:** pausa ou continua a simulação.
- **R:** reinicia com outra semente.
- **S:** salva a imagem atual em PNG.
- **Redimensionar a janela:** reconstrói a simulação para o novo espaço.

## Estrutura do ZIP

O ZIP contém `index.html`, `style.css`, `sketch.js`, `README.md` e `thumbnail.png`, todos na raiz. A biblioteca p5.js é carregada por CDN; não há arquivos locais de p5.js ou p5.sound.js.
