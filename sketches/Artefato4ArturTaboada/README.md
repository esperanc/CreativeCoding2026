---
collection: artefato da semana/4
---

# Roseta de Quadrados em Lâminas Translúcidas

Este sketch constrói uma composição abstrata a partir de uma única primitiva geométrica: o quadrado girado em torno de um de seus vértices. O objetivo foi transformar um desenho estático de papel em um sistema animado, explorando rotação em torno de um ponto comum, escala geométrica entre camadas e sobreposição translúcida como recurso de profundidade.

## Como o sketch funciona
- Cada quadrado é desenhado com um de seus vértices na origem e girado por `(TWO_PI / quadrados) * i`, de modo que todos compartilham o mesmo ponto central e formam uma roseta em cata-vento.
- O número de quadrados da roseta é sorteado a cada execução (`floor(random(5, 13))`), então o programa nunca abre com exatamente a mesma composição: rosetas de cinco pás ficam abertas e angulosas, enquanto as de doze fecham quase em um disco contínuo.
- A tela é preenchida por camadas concêntricas dessa mesma roseta, com o lado crescendo em progressão geométrica (`base * 0.062 * pow(1.32, r)`). O número de camadas não é fixo: a função `medir()` calcula quantos anéis são necessários para que a maior lâmina ultrapasse a diagonal da janela.
- Todas as medidas derivam de `base = min(windowWidth, windowHeight)`, incluindo espessura de traço e deslocamento das formas, então a composição mantém as mesmas proporções em qualquer formato de tela. `windowResized()` refaz esse cálculo ao redimensionar a janela.
- Camadas vizinhas giram em sentidos opostos (`r % 2 ? -1 : 1`) e recebem defasagem de fase, o que produz a leitura de espiral: o movimento parece percorrer a imagem do centro para as bordas em vez de girar em bloco.
- Cada quadrado é preenchido por um degradê construído em 14 faixas, com o cinza definido pelo ângulo da forma em relação a uma direção de luz fixa (`cos(ang - PI * 0.25)`). Somado à baixa opacidade e a uma aresta fina de contorno, isso dá às formas sobrepostas o aspecto de placas de vidro empilhadas.
- Um termo senoidal (`respiro`) afasta e reaproxima as pás do centro ao longo do tempo, fazendo a roseta abrir e fechar continuamente.

## Inspiração
O sketch cruza duas referências encontradas no Instagram:

- **Desenho (geometria):** [dulfoart_style — "Simple Things to Draw When Bored"](https://www.instagram.com/reel/Dbxv9bURy_y/)
  O vídeo mostra, à mão livre, a construção de uma roseta formada por sete quadrados iguais girados em torno de um vértice comum. É exatamente essa a regra geométrica reproduzida no código: a forma desenhada no papel foi traduzida em uma fórmula de rotação, o que permitiu parametrizar o número de quadrados em vez de fixá-lo em sete.

- **Animação (renderização e movimento):** [zach.lieberman](https://www.instagram.com/reel/DcBdHy9TOag/)
  A obra apresenta uma malha densa de lâminas translúcidas em escala de cinza, com arestas visíveis e degradês internos, girando lentamente em espiral. Dela vêm as decisões de acabamento e movimento do sketch: a paleta monocromática sobre fundo escuro, o preenchimento em degradê por faixas com iluminação direcional, a sobreposição com baixa opacidade e a rotação defasada entre camadas.

A ligação entre as duas, portanto, é de estrutura e superfície: a geometria vem do desenho de dulfoart_style, enquanto a maneira de renderizá-la e animá-la vem da obra de Zach Lieberman. O resultado é o desenho de papel repetido em profundidade e posto em movimento.

## Autor
Artur Taboada Dios Carvalho

## Como visualizar este projeto

**Usando o ambiente online (p5front)**
1. Acesse o ambiente de desenvolvimento utilizado na disciplina: [https://esperanc.github.io/p5front/](https://esperanc.github.io/p5front/).
2. Copie todo o conteúdo do arquivo `sketch.js` deste zip e cole na área de edição de código do site.
3. O resultado será renderizado na tela de visualização após o botão "Run" ser clicado. Cada novo clique em "Run" sorteia uma roseta diferente.
