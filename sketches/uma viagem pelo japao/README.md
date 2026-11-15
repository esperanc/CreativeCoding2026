---
title: Uma viagem pelo Japão
tags: [ai, generative, claude]
collection: projeto final/Rafaella Lenzi/1
---

Autora: Rafaella Lenzi Romano

# Uma viagem pelo Japão
 
Um curta feito em p5.js sobre a minha viagem ao Japão. Uma viajante, vista de costas, passa por Tokyo, Kyoto, Nara e Osaka, e cada cidade tem a sua música.
 
## As cidades
 
- **Tokyo:** uma rua com neon à noite e a Tokyo Tower no fim
- **Kyoto:** o túnel de torii do Fushimi Inari
- **Nara:** lanternas de pedra, cervos, ginkgos e o Todai-ji
- **Osaka:** o canal de Dotonbori

## Escolhendo o trecho de cada música
 
Cada cidade toca só um trecho da sua música (normalmente o refrão), e a cidade dura o tempo desse trecho. Os tempos ficam na tabela `SONGS`, no topo do arquivo.
 
Para escolher os tempos, mude `TUNE` para o nome de uma cidade (por exemplo, `const TUNE = 'Osaka';`). Isso abre uma tela com a onda da música, onde dá para marcar o início (I) e o fim (O), ouvir como vai ficar no filme (P) e copiar a linha para a tabela `SONGS` (C). No final, volte `TUNE` para `null`.
 
## Para as próximas entregas
 
- Melhorar as paisagens das cidades, principalmente Nara e Kyoto
- Melhor a personagem andando
- Tornar as transições mais naturais, em alguns momentos dá a impressão de engasgar um pouco
- Talvez adicionar a cidade de Hiroshima
- Cenários de Tokyo e Kyoto parecem um pouco monótonos demais, então gostaria de trazer mais elementos para eles

(as melhorias são principalmente estéticas)

## Músicas
 
- Tokyo: Meiko, "Fantasy"
- Kyoto: Narpy, "Cherry Blossoms"
- Nara: "Always With Me" (A Viagem de Chihiro)
- Osaka: Miki Matsubara, "Stay With Me"

Os arquivos mp3 não estão incluídos no projeto.
