---
title: O Livro Monstruoso dos Monstros e o Retrato Vivo (Parte 1)
tags: [AI, Gemini, animacao, narrativa, HarryPotter, curta]
collection: projeto final/Maria Eduarda Araujo/1
---

# Projeto Final (Parte 1): O Livro Monstruoso dos Monstros

**Autora:** Maria Eduarda Araújo  
**DRE:** 119054059  

---

## 1. Visão Geral e Ideia do Projeto Final
O meu projeto final consiste em um curta-metragem animado buscando alta fidelidade visual inspirado no universo de *Harry Potter*, unindo a estética clássica de abertura de livros dos filmes da Disney.

A narrativa é totalmente guiada por uma linha do tempo baseada no tempo de execução (`millis()`) e foi dividida em três etapas evolutivas ao longo das três semanas de desenvolvimento:
* **Etapa 1 (Atual — O Despertar do Livro):** O *Livro Monstruoso dos Monstros* repousa fechado sobre uma mesa de mogno em Hogwarts, amarrado por duas fivelas laterais. Inicialmente visto de perfil, ele acorda, os seus 8 olhos de aranha abrem par por par, olham para os lados e **encaram diretamente a câmera** (o espectador). Irritado por estar sendo observado, ele luta furiosamente contra as amarras, arrebenta as fivelas com faíscas mágicas, dá botes e abre-se em perspectiva 3D, folheando algumas páginas detalhadas no estilo clássico da Disney até pousar na página de pergaminho em branco com moldura renascentista.
* **Etapa 2 (Próxima Semana — O Retrato Vivo):** A câmera realizará um *zoom in* cinematográfico em direção à moldura da página direita, revelando o surgimento da fotografia mágica com o Trio de Ouro (Harry, Rony e Hermione) abraçados dentro do retrato.
* **Etapa 3 (Semana Final — A Fuga do Quadro):** Os personagens dentro da foto irão desfazer o abraço, virar de perfil e correr articuladamente para fora dos limites da moldura, desaparecendo gradualmente ao cruzar a borda do papel (utilizando `drawingContext.clip()`), exatamente como nos retratos do mundo bruxo.

---

## 2. O que foi implementado nesta 1ª Entrega
Nesta primeira implementação, desenvolvi um motor gráfico robusto utilizando matemática avançada e transformações afins em WebGL, alguns com a ajuda do gemini:

* **Câmera 3D Contínua (Perfil $\rightarrow$ Visão Superior):** O curta inicia com a câmera na altura da mesa enfocando diretamente a **borda lateral** do livro (onde fica a bocarra principal), evidenciando o relevo ocular e as duas fivelas de couro. Em seguida, a câmera executa um arco suave de transição tridimensional até a visão de cima (*top-down*).
* **Anatomia de Aranha Caranguejeira (Tarântula):** A capa é inteiramente revestida por cerdas em camadas orgânicas (tons de carvão, mogno e pontas ferrugem) geradas por curvas de Bézier matemáticas (`curvaMat` baseada em `vertex()`). No alto da capa, uma elevação volumétrica em domo abriga **8 olhos de aranha desproporcionais e expressivos** (sem pelos na órbita, equipados com pálpebras limpas e sem marcas indesejadas).
* **Atuação Dinâmica dos Olhos:** Os 8 olhos abrem devagar de par em par, examinam os arredores, e miram de forma intimidadora na direção de quem assiste, franzindo as pálpebras de raiva antes de iniciar o combate.
* **Boca nas 3 Bordas e Língua Anatômica:** As fileiras de presas de marfim e gengivas estendem-se por toda a extensão lateral, superior e inferior do livro. Quando ele bota para fora, uma língua comprida, carnuda e sinuosa serpenteia para fora da lateral com sulco central e brilho úmido.
* **Luta contra as Fivelas e Tremedeira Equilibrada:** Duas fivelas de latão na parede lateral direita prendem o livro. Ele vibra de raiva com uma frequência de tremor calibrada para transmitir tensão sem borrar a imagem, arrebenta as amarras gerando partículas de faíscas e estabiliza-se no centro.
* **Folhear Clássico Estilo Disney:** A capa gira em 3D revelando 10 páginas de pergaminho curvas que voam em sequência pelo ar (trazendo caligrafia manuscrita e iluminuras que se curvam junto no ar) e os dentinhos das bordas do livro aberto continuam se mexendo levemente.

---

## 3. Testes, Validação e Thumbnail
* **Testes no p5front:** O programa foi extensivamente testado no ambiente do `p5front` para garantir que as mensagens de erro do interpretador fossem evitadas, substituindo funções que não funcionavam por algoritmos geométricos próprios. Houve dificuldade com a parte das mudanças das paginas e alguns dos movimentos que o livro deveriam fazer que requeriam varias mudanças e alterações no código até ficar no estagio atual.
* **Arquivo `thumbnail.png`:** A miniatura oficial foi capturada no mostrando o livro já com as páginas abertas e iluminado, representando perfeitamente a identidade visual do curta.
