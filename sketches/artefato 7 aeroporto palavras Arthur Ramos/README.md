---
title: Aeroporto para Palavras Nunca Ditas
tags: [AI, ChatGPT, p5.js, typography, generative, split-flap]
collection: artefato da semana/7
---

# Aeroporto para Palavras Nunca Ditas

**Autor:** Arthur Ramos  
**Artefato da Semana 7 — Tipografia**

## Ideia

O sketch transforma um painel antigo de partidas em um terminal para frases que alguém pensou, mas nunca conseguiu dizer. Em vez de cidades, os destinos são mensagens como **EU FICO**, **ME DESCULPA**, **VOLTA** e **AINDA DÁ TEMPO**. Cada uma recebe um estado, como **NÃO DITA**, **ENGOLIDA**, **ADIADA** ou **SEM CORAGEM**.

As letras giram como as peças de um painel mecânico _split-flap_. De tempos em tempos, uma linha muda e uma nova mensagem tenta encontrar seu lugar. A composição é diferente a cada execução.

## Como a tipografia forma a imagem

Depois do fundo, a única primitiva visual utilizada é `text()`. Molduras, divisórias, indicadores, códigos, ruídos e o próprio painel são construídos com caracteres tipográficos, incluindo `═`, `─`, `│`, `·`, `▓` e letras. Não há retângulos, linhas, círculos ou contornos de fonte desenhando a estrutura.

A proposta evita as soluções mais diretas apresentadas na aula, como formar letras com pontos, deformar contornos, preencher máscaras tipográficas ou criar nuvens de palavras. Aqui, a tipografia funciona ao mesmo tempo como imagem, interface e narrativa.

## Geração e interação

- A distribuição inicial de mensagens, horários, códigos, portões e estados é aleatória.
- A cada intervalo, uma das linhas passa por uma nova sequência de letras.
- **Clique ou toque em uma linha:** troca somente aquela partida.
- **Espaço:** pausa ou continua o painel.
- **R:** recria todo o terminal.
- **S:** salva a imagem atual em PNG.

O canvas usa `windowWidth` e `windowHeight`. O número de linhas, o tamanho dos caracteres e as colunas visíveis se adaptam à janela.

## Referências

- [Aula 6 — Tipografia, Creative Coding 2026](https://esperanc.github.io/SlideDown/index.html?p=6%20-%20Tipografia&f=https%3A%2F%2Fesperanc.github.io%2FCreativeCoding2026)
- [Split-flap display](https://en.wikipedia.org/wiki/Split-flap_display)

Os painéis mecânicos de aeroportos inspiraram o movimento letra por letra e a organização em colunas. O conteúdo foi deslocado do transporte literal para a ideia de mensagens que permanecem esperando uma partida emocional.

## Uso de inteligência artificial

O código e a documentação foram desenvolvidos com auxílio do **ChatGPT**, com escolhas e revisão de Arthur Ramos.

Prompt inicial utilizado:

> Crie um sketch generativo e responsivo em p5.js sobre tipografia. Quero representar um painel de aeroporto para palavras que nunca foram ditas. No lugar das cidades, coloque mensagens como “EU FICO”, “ME DESCULPA” e “VOLTA”, com estados como “NÃO DITA”, “ADIADA” e “SEM CORAGEM”. As letras devem mudar como em um painel mecânico de aeroporto. Construa toda a imagem com texto e caracteres tipográficos. Use p5.js versão 2 por CDN e comente o código para facilitar a compreensão.

## Requisitos técnicos

- p5.js **2.2.3** carregado pelo CDN jsDelivr;
- nenhuma cópia da biblioteca p5.js incluída no ZIP;
- nenhuma fonte externa ou arquivo de fonte incluído;
- arquivos do sketch diretamente na raiz do ZIP.
