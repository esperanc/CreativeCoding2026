---
title: Descarte
tags: [AI, Claude, image, seam-carving, picsum, generative]
collection: artefato da semana/8
---

# Descarte

Uma fotografia qualquer, vinda do picsum.photos, se separa diante de nós em duas metades: o que importa e o que não importa. A da esquerda encolhe, a da direita cresce, e a soma das duas tem sempre a largura exata da foto original — nenhum pixel é criado, nenhum é perdido, cada um apenas muda de lado.

Quem decide o que vai para cada lado não é o programa nem o autor: é um algoritmo clássico de computação gráfica, o **seam carving**, de Avidan e Shamir (SIGGRAPH 2007), o mesmo que está por trás do "redimensionar com reconhecimento de conteúdo" dos editores de imagem.

## Como o sketch funciona
- Para encolher a imagem em uma coluna, o algoritmo não corta uma coluna reta: procura a **costura** de menor energia — um caminho de um pixel de largura que desce do topo à base, andando no máximo uma casa para o lado a cada linha, e que atravessa a imagem por onde há menos detalhe. Arrancada a costura, as colunas à direita deslizam uma casa para a esquerda e a imagem fica um pixel mais estreita **sem que nada de importante tenha sido espremido**.
- A **energia** de um pixel é quanto ele difere dos seus vizinhos: o módulo do gradiente, somando as diferenças horizontais e verticais nos três canais. Céu liso e parede vazia têm energia quase nula; um rosto, uma folhagem ou uma linha de telhado têm energia alta. A costura é atraída pelo vazio.
- Achar a costura mais barata é um problema de **caminho mínimo**, resolvido por programação dinâmica. A melhor costura que chega a um pixel vale a energia dele mais a menor das três que chegam aos seus vizinhos da linha de cima. Uma passada de cima para baixo preenche a tabela de custos; uma de baixo para cima reconstrói o caminho. Sem essa recorrência seriam 3^altura caminhos possíveis — para uma imagem de 350 linhas, um número com mais de cem algarismos.
- A diferença entre vizinhos é dividida pelo **vão de onde veio**: duas casas no interior da imagem, uma só nas bordas. Sem essa divisão a derivada da borda sai pela metade, as colunas das pontas ficam baratas demais e toda costura degenera numa reta colada na margem — a imagem passaria a ser aparada pelo lado, em vez de costurada por dentro.
- Nada é jogado fora. Cada costura arrancada vira uma **coluna da imagem da direita**, na ordem em que foi removida. Como os pixels de uma costura vêm de alturas e posições diferentes, essa metade não forma figura nenhuma: é um campo estriado de fios verticais. E é assim por um motivo exato — o que o algoritmo remove primeiro é precisamente tudo aquilo que não tinha forma.
- Um **fio luminoso** mostra a costura no instante antes de ser arrancada, e um risco do outro lado do corte marca a coluna recém-nascida do descarte. Os dois juntos deixam o mecanismo visível: dá para acompanhar o pixel saindo de um lado e chegando ao outro.
- Quando resta pouco mais da metade da largura, o ciclo para, segura a imagem alguns segundos e pede outra foto. A anterior fica na tela até a nova chegar inteira, de modo que a troca não pisca.
- Nenhuma medida é fixa em pixels: a imagem de trabalho acompanha a proporção da janela, com um teto de pixels, porque cada costura custa uma passada pela imagem inteira. Isso dá de uma a quatro colunas por quadro a 60 quadros por segundo, de uma tela de celular a um monitor ultralargo.

## Inspiração
A referência direta é o artigo **"Seam Carving for Content-Aware Image Resizing"**, de Shai Avidan e Ariel Shamir (ACM SIGGRAPH 2007). O que me interessou nele não foi o uso prático, e sim o pressuposto embutido: para redimensionar sem deformar, o algoritmo precisa ter **uma opinião sobre o que, numa fotografia, pode ser perdido**. Essa opinião é uma fórmula de três linhas, e ela funciona assustadoramente bem.

O artefato não usa o algoritmo para redimensionar; usa para **mostrar essa opinião**. Daí a decisão de não descartar o descarte. Posto lado a lado com o que sobreviveu, o material removido revela que a distinção entre essencial e dispensável, aqui, é uma distinção entre o que tem estrutura e o que não tem. A metade da direita é bonita, e é informe — as duas coisas ao mesmo tempo.

A escolha do tema foi por exclusão. A aula percorreu a imagem como **tabela de números governando uma marca local**: grade com a imagem inteira, um detalhe repetido, recorte sorteado numa vizinhança, realimentação, `filter()`, `blendMode()`, `mask()`, círculos, traços e retângulos dimensionados pelo brilho, letras dimensionadas pelo brilho, mosaico de paleta, duotone escrevendo em `pixels` e agentes caminhando sobre a foto. Em todos, percorre-se a imagem e desenha-se algo cujo parâmetro vem do pixel daquele ponto. Aqui a estrutura é outra: o cálculo é **global e sequencial**, nenhum pixel decide nada sozinho, e o que se vê é a imagem original — não uma releitura dela — partida em duas pelo próprio algoritmo.

## Sobre o uso de IA
Desenvolvido com auxílio do Claude (AI), a partir da minha escolha de tema e de sucessivas rodadas de teste em navegador. Dois problemas só apareceram rodando o código, e vale registrá-los porque são armadilhas reais do assunto da aula:

O primeiro foi o viés de borda descrito acima: sem dividir o gradiente pelo vão real, **toda** costura saía como uma reta colada na margem esquerda, e a imagem era aparada em vez de costurada. O segundo foi mais sutil: `resize()` em `p5.Image` deixa a última coluna com **alfa parcial e RGB zerado**. Como zeros são uma descontinuidade máxima, essa coluna virava uma falsa borda de energia altíssima, capaz de repelir as costuras. A correção foi pedir ao picsum exatamente a dimensão desejada, dispensando o redimensionamento no caminho normal, e forçar a opacidade da imagem de trabalho por garantia.

## Autor
Artur Taboada Dios Carvalho

## Como visualizar este projeto

**Usando o ambiente online (p5front)**
1. Acesse o ambiente de desenvolvimento utilizado na disciplina: [https://esperanc.github.io/p5front/](https://esperanc.github.io/p5front/).
2. Copie todo o conteúdo do arquivo `sketch.js` deste zip e cole na área de edição de código do site.
3. O resultado será renderizado na tela de visualização após o botão "Run" ser clicado. Vale deixar rodando alguns minutos: cada fotografia leva cerca de dezesseis segundos para se partir, e o sketch nunca sabe qual virá a seguir.

A fotografia é buscada em **picsum.photos**, que a serve com CORS — sem isso o `loadPixels()` não devolveria os pixels e o algoritmo não teria o que medir. Nenhuma imagem acompanha o projeto, e nenhuma biblioteca além do p5.js é necessária.
