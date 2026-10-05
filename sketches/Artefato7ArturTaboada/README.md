---
title: Rios
tags: [AI, Claude, typography, justification, rivers, generative]
collection: artefato da semana/7
---

# Rios

Este sketch parte de um acidente que existe dentro de todo texto justificado. Justificar uma coluna é esticar os espaços entre as palavras até a linha terminar exatamente na margem; cada linha estica de um jeito diferente e, de vez em quando, o espaço entre duas palavras se sobrepõe ao espaço da linha de baixo, e este ao da seguinte. Quatro, cinco, seis linhas depois abriu-se um corredor de branco atravessando a mancha. Os tipógrafos chamam esse corredor de **rio**.

A imagem deste artefato é feita de texto, mas o que se olha nela não são as letras: é o branco que sobra entre elas. O rio não está na fonte, não está na entrelinha, não está na escolha das palavras — é o resto de uma conta, a soma dos arredondamentos que cada linha precisou fazer para fechar na margem certa. O programa não desenha rio nenhum; ele compõe a página e depois vai procurá-los.

## Como o sketch funciona
- A página é **composta de verdade**, não simulada. Cada palavra é medida com `textWidth()`, as palavras são juntadas enquanto couberem na medida da coluna, e a folga que sobra é repartida igualmente entre os vãos daquela linha. A última linha de cada parágrafo não é esticada, como manda a tradição, e o texto derrama de uma coluna para a outra quando a coluna enche.
- A repartição da folga **não tem teto**. Um compositor hifenizaria a palavra seguinte em vez de abrir vãos enormes; sem hifenização — como no jornal composto com pressa — a linha estica até onde precisar. São justamente esses vãos exagerados que abrem os rios mais largos, de modo que o defeito não é corrigido aqui: ele é o assunto. Em contrapartida, toda linha justificada termina exatamente na margem, em qualquer formato de tela.
- A detecção usa a **definição tipográfica** do fenômeno, e não uma aproximação: dois vãos pertencem ao mesmo rio quando seus intervalos horizontais se sobrepõem. O corredor desenhado é o branco comum a toda a corrente, e por isso ele afina onde os vãos quase se perdem e se alarga onde estão bem alinhados. Uma corrente só vira rio a partir de quatro linhas, e o peso visual cresce com o comprimento: um rio de quatro linhas é marginal e aparece fraco; um de oito domina a coluna.
- Um rio só existe **dentro de uma coluna**. A calha entre colunas é outro branco, de outra natureza, e não conta.
- **A medida respira.** A largura das colunas abre e fecha num ciclo de trinta e um segundos. A cada largura nova as linhas se quebram em outros pontos, os vãos caem em outros lugares, e os rios secam e abrem sozinhos — que é exatamente o que acontece quando se troca uma palavra por um sinônimo mais curto numa prova de página.
- **A vista aperta os olhos.** Num segundo ciclo, de dezessete segundos, a tinta perde força até as palavras deixarem de ser legíveis e virarem textura cinza, e nesse momento a água fica funda. É literalmente o gesto que um tipógrafo usa para achar rios numa prova: apertar os olhos, ou virar a página de cabeça para baixo, até as letras deixarem de ser lidas. Os dois ciclos têm durações diferentes e primas entre si, então a página nunca se repete.
- Todas as medidas derivam de `min(windowWidth, windowHeight)`, e o número de colunas é a maior quantidade que ainda respeite uma medida mínima por coluna — abaixo de mais ou menos vinte e cinco caracteres por linha a justificação deixa de fechar sem hifenização. Numa tela larga isso resolve para quatro colunas; numa tela de celular, para uma só. `windowResized()` recalcula tudo.
- Por desempenho, as letras são compostas numa camada à parte e só refeitas quando a medida muda de fato (o valor é arredondado ao pixel, já que as quebras de linha só mudam em medidas discretas). Cada quadro custa um único blit mais os rios, e o sketch roda a 60 quadros por segundo com cerca de cento e vinte linhas de texto na tela.

## Inspiração
A referência não é uma obra, é um vício de ofício. Rios são um dos defeitos clássicos da composição justificada, discutidos em qualquer manual de tipografia e caçados na prova de página com dois truques manuais: apertar os olhos até o texto virar mancha, ou virar a folha de cabeça para baixo, para que o cérebro pare de ler e passe a ver. O sketch pega esses dois gestos e os transforma nos seus dois únicos movimentos — a medida que respira, que faz os rios mudarem de lugar, e a vista que desfoca, que faz a água vir à tona.

A escolha do tema foi por exclusão deliberada. Os caminhos mais trilhados da tipografia em programação criativa — texto correndo ao longo de uma curva, letras convertidas em pontos ou partículas, a palavra usada como pincel, tipografia cinética, nuvens de palavras — tratam todos a letra como **forma a ser manipulada**. Aqui a letra não é manipulada em nada: a fonte é comum, o corpo é comum, o texto é prosa corrida e o desenho é uma página de jornal, sem nenhum efeito. A única coisa que o programa faz é medir. O que aparece é uma forma que ninguém desenhou, feita inteiramente do branco que a composição deixou para trás — a imagem é o negativo do texto, não o texto.

O texto que preenche as colunas fala do próprio fenômeno, de modo que a página é ao mesmo tempo a explicação e o exemplar defeituoso: as frases sobre vãos que esticam demais são compostas com vãos que esticam demais.

## Sobre o uso de IA
O artefato foi desenvolvido com auxílio do Claude (AI), a partir da minha escolha de tema e de sucessivas rodadas de teste. Vale registrar duas correções que só apareceram rodando o sketch no p5.js 2 de verdade, e não no raciocínio sobre o código: `textWidth(' ')` devolve **zero** nessa versão, porque a medição ignora o branco nas pontas da string — o que fazia a justificação sumir por completo e as palavras saírem coladas. A largura do espaço passou a ser medida por diferença, com o branco preso entre duas letras (`textWidth('n n') - textWidth('nn')`). A segunda foi o teto do vão, que deixava algumas linhas sem alcançar a margem e precisou ser removido.

## Autor
Artur Taboada Dios Carvalho

## Como visualizar este projeto

**Usando o ambiente online (p5front)**
1. Acesse o ambiente de desenvolvimento utilizado na disciplina: [https://esperanc.github.io/p5front/](https://esperanc.github.io/p5front/).
2. Copie todo o conteúdo do arquivo `sketch.js` deste zip e cole na área de edição de código do site.
3. O resultado será renderizado na tela de visualização após o botão "Run" ser clicado. Vale esperar cerca de meio minuto com o sketch aberto: é o tempo de um ciclo completo da medida e de quase dois ciclos da vista, e é nesse intervalo que se vê os rios secarem e abrirem em outros lugares.

Nenhuma biblioteca externa além do p5.js é necessária.
