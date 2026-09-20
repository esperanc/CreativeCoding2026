---
collection: artefato da semana/5
---

# Artefato 5: O Trio de Ouro e a Lógica Anti-Colisão

**Autora:** Maria Eduarda Araújo  
**DRE:** 119054059

## Sobre o Projeto
Este quinto artefato é uma cena complexa em p5.js, concebida para criar uma atmosfera mágica do universo *Harry Potter*. O projeto conta com o Trio de Ouro, o Chapéu Seletor, castiçais na parede de tijolos e uma janela colossal que exibe um céu diurno onde *mini-bruxos* voam em vassouras com movimento *parallax*. O cenário é construído sem o uso das funções complexas de curva vetorial, empregando vértices retos para driblar limitações estruturais da plataforma.

Nesse trabalho tentei fazer a tal "Inspiração Negativa": garantir que o cenário não se assemelhasse aos outros artefatos da galeria, possuindo um layout imprevisível e mutável a cada execução.

## Estratégia de "Loteamento com Embaralhamento"
Para garantir que fosse algo que não fiz antes desenvolvi um sistema inteligente de distribuição espacial. 
O algoritmo implementa um **Loteamento Geométrico Rigoroso**:
* **Lotes do Chão:** O eixo X inferior foi dividido em zonas seguras (ex: Esquerda, Meio-Esquerda, Meio-Direita, Extrema Direita)[cite: 10]. A cada execução (no `setup()`), a função `shuffle()` embaralha quem irá ocupar qual vaga. Deste modo, o Vaso de Planta, a Vassoura Mágica, o Trio de Ouro e o Chapéu Seletor trocam de posição dinamicamente a cada *refresh*, mas as suas caixas delimitadoras nunca se intercetam.
* **Lotes da Parede:** O mesmo princípio é aplicado à parede[cite: 10]. A gigantesca janela e o voo do parapeito disputam terrenos pré-definidos à esquerda e à direita do ecrã, garantindo que o teto se mantenha estruturado[cite: 10].

## Efeitos Visuais e Animação
Mesmo com as coordenadas base a serem definidas aleatoriamente no arranque (`setup`)[cite: 11], todos os elementos permanecem perfeitamente vivos durante o ciclo de atualização da tela (`draw()`). Utilizando a função trigonométrica `sin()` atrelada ao `frameCount`, o cenário está em contínuo movimento: a poeira solar flutua, a coruja respira no parapeito da janela, o Chapéu Seletor mexe a boca e as chamas dos castiçais tremeluzem na parede de pedra, criando uma cena vibrante e imersiva.
