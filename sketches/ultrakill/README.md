---
title: ULTRAKILL
collection: artefato da semana/5
---

# Artefato 5 - +RICOSHOT (ULTRAKILL HUD Generativo)

**Autor:** Thalisson Braga 

## Sobre a Obra e Inspiração
Este sketch foi profundamente inspirado no FPS frenético e visceral **ULTRAKILL** (desenvolvido por Arsi "Hakita" Patala). A estética do projeto simula o ambiente do *Cyber Grind* (uma arena de simulação virtual do jogo, conhecida por seu visual retro low-poly e malhas geométricas).

A cena retrata de forma procedural a mecânica mais icônica do jogo: o V1 (protagonista) atirando moedas para o ar (revólver *Marksman*) e disparando um laser que ricocheteia perfeitamente entre todas elas até explodir o inimigo. A cada execução do sketch, uma nova cena é gerada: a posição do inimigo muda, a quantidade de moedas lançadas varia e o polígono de sangue gerado no impacto assume uma nova forma afiada.

**Links de Referência:**
* [Página Oficial do Jogo](https://store.steampowered.com/app/1229490/ULTRAKILL/)

Para construir a animação procedural, a física de partículas e a estética do projeto sem o uso de imagens externas, utilizei a matemática ensinada ao longo da semana:

1. **Vetores (`p5.Vector`):** 
   A lógica de trajetória depende inteiramente de vetores. A origem e o inimigo são objetos `p5.Vector`. As posições das moedas arremessadas foram calculadas usando **`p5.Vector.lerp()`** para que fiquem distribuídas no caminho entre o V1 e o alvo. Também utilizei funções como `.add()`, `.mult()` e `.dist()` para simular gravidade e velocidade nas faíscas e gotas de sangue do impacto.

2. **Coordenadas Polares (Explosões e Gotas):** 
   As formas espirrando no momento do acerto (`onHit()`) usam coordenadas polares convertidas para cartesianas. A função `makeBlood()` fatia um círculo usando `TWO_PI / n` e gera vértices aleatórios com `x = cos(a) * r` e `y = sin(a) * r`. O mesmo princípio foi usado para ejetar as partículas em direções (ângulos) radiais aleatórias.

3. **Transformações Afins e Sistemas de Coordenadas:** 
   * **Grid Isométrico:** O fundo do *Cyber Grind* foi criado empilhando transformações: `translate()` para posicionar o piso, `rotate(PI / 4)` para girar a malha em losango e `scale(1, 0.42)` para achatar o eixo Y, gerando uma falsa perspectiva 3D (isométrica).
   * **Isolamento de Estado:** O uso de `push()` e `pop()` foi estritamente necessário em todos os desenhos (moedas, HUD, inimigo) para garantir que a translação da "câmera" (incluindo o efeito de *screen shake*) e as rotações individuais não corrompessem a malha principal.
