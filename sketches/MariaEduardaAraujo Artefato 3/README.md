---
collection: artefato da semana/3
---

# Artefato da Semana 3: Layout Geométrico e Transformações

**Autora:** Maria Eduarda Araújo  
**DRE:** 119054059  

## Sobre o Projeto
Pra terceira semana, mantive a mesma tematica dos artefatos anteriores — o uso de corações e tons de vermelho/rosa —, mas mudei a abordagem técnica. Nesse trabalho ao contrario dos antigos que tinham uma aleatoriedade, possui cálculos matemáticos exatos e proporcionais.

Para cumprir os requisitos da aula sobre Posição, Direção e Tamanho, este sketch implementa:

* **Fim dos "Números Mágicos":** A posição de cada coração não foi definida manualmente no código, mas sim calculada através de laços de repetição (`for`).
* **Uso da função `map()`:** Utilizei o `map()` pra transformar os índices da grade geométrica em coordenadas de pixels (x e y) na tela, mantendo a proporção exata independentemente da quantidade de elementos. A função também foi usada pra atrelar matematicamente a rotação e a escala de cada forma à sua posição.
* **Transformações Afins:** Em vez de recalcular os vértices de cada primitivo geométrico que compõe o coração, o código move e transforma o próprio sistema de coordenadas utilizando `translate()`, `rotate()` e `scale()`.
* **Isolamento de Estado:** As funções `push()` e `pop()` envolvem o bloco de desenho de cada coração pra garantir que a transformação de um elemento não afete os seguintes na grade.

## Processo de Criação
Utilizei a inteligência artificial para auxiliar na estruturação do código, focando na correta aplicação geométrica. O meu prompt foi formulado para proibir especificamente o uso da função `random()`, forçando a IA a utilizar regras de proporção (`map`) para gerar o padrão visual dos corações. 

O resultado foi um grid fluido onde os corações mudam de tamanho e ângulo de forma ordenada.

## Meu prompt utilizado: 

> "Crie um sketch estático em p5.js. O objetivo é demonstrar o domínio de layouts geométricos calculados matematicamente, sem usar 'números mágicos' ou aleatoriedade (random). O código deve seguir estritamente estas regras:
> 
> 1. O Desenho: A forma base a ser desenhada deve ser um coração, construído através da combinação de primitivas básicas (como triangle e circle/arc).
> 2. O Layout: Use laços de repetição aninhados (for) para criar uma grade geométrica (grid) ordenada com esses corações na tela.
> 3. Proporções: Utilize a função map() para calcular a posição X e Y exata de cada coração com base nos índices do laço de repetição.
> 4. Variação Matemática: Use map() ou a distância até o centro para variar matematicamente a escala e a rotação dos corações.
> 5. Transformações Afins: Desenhe os corações movendo o sistema de coordenadas com push(), translate(), rotate(), scale() e pop().
> 6. Tema visual: Fundo em tons escuros (como vinho ou marinho) e corações em uma paleta elegante de vermelhos e rosas.
> 
> Apresente o código totalmente comentado e documentado para explicar a lógica por trás do map(), push() e pop()."
