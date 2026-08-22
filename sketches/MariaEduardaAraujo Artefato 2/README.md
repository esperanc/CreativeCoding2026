---
collection: artefato da semana/2
---

# Artefato da Semana 2: Responsividade e Aleatoriedade

**Autora:** Maria Eduarda Araújo  
**DRE:** 119054059  

## Sobre o Projeto
Para esta segunda semana decidi manter o mesmo estilo da anterior, antes fiz um coração feito de vários quadradinho e pra essa vez fiz vários corações de tamanhos diferentes em posições e rotações diferentes.


Para cumprir os requisitos:
* **Responsividade:** O canvas foi criado utilizando `windowWidth` e `windowHeight` para ocupar todo o espaço disponível na janela do navegador. Além disso, a função `windowResized()` foi implementada para garantir que a arte se reajuste caso o usuário redimensione a tela.
* **Aleatoriedade:** O código utiliza a função `random()` dentro de um loop para espalhar os corações em posições (x, y) totalmente sorteadas. O tamanho e a rotação de cada coração também são definidos aleatoriamente a cada vez que o programa é executado, garantindo que o desenho nunca seja igual ao anterior.
* **Primitivas Geométricas:** Em vez de usar imagens prontas ou a curva complexa do primeiro trabalho, cada coração nesta versão é construído puramente através da combinação de primitivas básicas ensinadas em sala de aula (como `triangle` e `circle`/`arc`).

## Processo de Criação

Utilizei a IA para me ajudar a estruturar o código. O meu foco no prompt foi garantir que a IA entendesse que não bastava espalhar formas soltas, ela precisava usar a lógica de transformação (`push`, `pop`, `translate` e `rotate`) para girar as formas combinadas, criando o efeito de uma "chuva" de elementos em posições variadas. 

Após a IA gerar o código, testei o redimensionamento da janela e executei o programa várias vezes para ter certeza de que o desenho se adaptava e mudava completamente a cada *play*, o que fazia.

## Meu prompt utilizado no Gemini: 

> "Crie um sketch estático (sem animação) em p5.js. Apresente o resultado sob a forma de um único script em javascript para rodar no editor.p5js.org. O programa deve cumprir estes requisitos rigorosamente:
>
> **Responsividade:** O canvas deve se adaptar dinamicamente ao tamanho da tela usando createCanvas(windowWidth, windowHeight) e implementando a função windowResized() com resizeCanvas().
>
> **Aleatoriedade:** O desenho não pode ser igual a cada execução. Use um loop (como for) e a função random() para espalhar dezenas de corações em posições completamente aleatórias por toda a área da tela (do eixo x=0 até windowWidth, e y=0 até windowHeight). Use random() também para variar bastante o tamanho de cada coração e aplicar diferentes rotações a eles (usando push, pop, translate e rotate).
>
> **Primitivas Geométricas:** Para desenhar cada coração, construa a forma combinando primitivas básicas, como triangle e circle (ou arc).
>
> **Tema visual:** O fundo deve ser de uma cor roxo vinho elegante. Os corações podem variar em tons pastéis ou vibrantes de rosa, lilás e vermelho.
>
> **Documentação:** O código deve ser totalmente comentado, explicando a lógica matemática e as funções para uma plateia de iniciantes em programação.
