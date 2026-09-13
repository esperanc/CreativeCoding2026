---
title: Mapa Outer Wilds
collection: artefato da semana/4
---

# Artefato 4 - Mapa Generativo de Outer Wilds (Visão Isométrica)

**Autor:** Thalisson Braga

## Sobre a Obra e Inspiração
Este sketch foi inspirado no mapa do sistema solar do jogo **Outer Wilds** (desenvolvido pela Mobius Digital). No jogo, o sistema solar é um ambiente dinâmico, funcionando como um mecanismo de relógio onde os planetas estão em constante movimento orbital. 

A ideia deste sketch é replicar essa dinâmica procedural na forma de um mapa estático com perspectiva isométrica. A cada execução do código (`reload`), os planetas (Timber Hearth, Brittle Hollow, Giant's Deep, etc.) e suas luas aparecem em posições completamente diferentes de suas respectivas órbitas, criando um layout único.

**Links de Referência:**
* [Imagem do Mapa do Jogo no Computador de Bordo](https://user-images.githubusercontent.com/45887963/202887035-f987a9d1-1e2c-4e33-b61e-9da2bd14d595.jpg)
* [Site Oficial do Jogo](https://www.mobiusdigitalgames.com/outer-wilds.html)

## Regra Generativa Bônus: A Lua Quântica
Respeitando a *lore* (história) de *Outer Wilds*, implementei a mecânica da Lua Quântica. Utilizando a função `floor(random(5))`, o algoritmo sorteia aleatoriamente em qual das 5 órbitas principais a lua vai estar. Como na obra original, toda vez que não estamos olhando (neste caso, a cada geração do canvas), a lua viaja e se prende aleatoriamente às coordenadas de um planeta diferente.

## Conceitos Geométricos da Aula 3 Aplicados
Para construir este sistema solar fugindo de coordenadas `X` e `Y` fixas (os "números mágicos"), utilizei intensamente as ferramentas matemáticas e geométricas ensinadas na semana:

1. **Visão Isométrica com Transformações Afins (`scale`):** 
   Apliquei `scale(1, 0.4)` antes de desenhar as linhas das órbitas. Isso achata o eixo Y, transformando círculos perfeitos em elipses e criando uma ilusão 3D de perspectiva isométrica.

2. **Coordenadas Polares Adaptadas:** 
   Para posicionar os planetas corretamente sobre as órbitas achatadas (sem deformar o desenho do planeta em si com o `scale`), calculei a posição polar de forma independente usando:
   * `x = raio * cos(angulo)`
   * `y = raio * sin(angulo) * 0.4`
   O ângulo foi definido via `random(TWO_PI)`, garantindo o posicionamento procedural nas órbitas.

3. **Isolamento de Estado com `push()` e `pop()`:** 
   Foram ferramentas cruciais para aninhar os sistemas de coordenadas. Ao desenhar sub-sistemas, um novo `push()` foi aberto após o `translate()` para o centro do planeta. Isso permitiu que a lua Attlerock orbitasse Timber Hearth em seu próprio eixo isométrico, ou que os Gêmeos orbitassem um centro gravitacional comum, sem que as rotações e translações afetassem a malha principal do sistema solar.

4. **Translação Inicial:**
   Utilizei `translate(width/2, height/2)` para levar a origem `(0,0)` para o centro da tela, facilitando a ancoragem do Sol e o cálculo radial de todas as órbitas.
