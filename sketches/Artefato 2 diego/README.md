---
collection: artefato da semana/2
---

# Placa de Circuito Eletrônico Gerativa (PCB)

**Autor:** Diego d'Orsi Duarte 
**Ferramenta:** p5.js (Editor / p5Front)  

## Descrição do Trabalho

Em vez de formas abstratas aleatórias simples, o programa constrói elementos eletrônicos combinando as primitivas 2D do p5.js (`rect`, `ellipse`, `line`, `arc`, `triangle`, `quad`, `circle`, `beginShape`/`vertex`):
- **Microchips / CIs (DIP packages):** Com corpo preto em resina, pinos metálicos estanhados, ponto indicador de Pino 1, entalhe de orientação e código gravado.
- **Resistores:** Com fios de cobre e corpo bege contendo faixas do código internacional de cores.
- **Capacitores Eletrolíticos e Cerâmicos:** Detalhados com topos de alumínio, ranhuras de segurança e valores de capacitância.
- **LEDs Iluminados:** Com transparência, filamentos internos e halo de luz cintilante.
- **Trilhas e Vias de Cobre:** Malha de conexões em 45° e 90° com ilhas de solda douradas.
- **Silkscreen:** Rotulagem técnica com designações como `GND`, `VCC`, `5V`, `TX` e `RX`.

## Adaptabilidade e Responsividade
- O canvas adapta-se dinamicamente ao tamanho da janela usando `windowWidth` e `windowHeight`.
- As dimensões dos componentes e da grade de trilhas se escalam proporcionalmente à menor dimensão da tela (`min(width, height)`), garantindo nitidez e visual adequado em qualquer dispositivo.
- A função `windowResized()` ajusta o canvas e recalcula o layout automaticamente em caso de mudança no tamanho do navegador.

## Interatividade
- **Clique com o Mouse:** A cada clique do usuário sobre o canvas (`mousePressed`), uma nova composição de circuito é gerada proceduralmente.
