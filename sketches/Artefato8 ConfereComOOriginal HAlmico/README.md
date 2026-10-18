---
title: Confere com o Original
tags: [AI, Claude, imagem, cartorio, historia, brasil, caminha]
collection: artefato da semana/8
---

A Carta de Pero Vaz de Caminha a el-rei D. Manuel, datada "deste
Porto Seguro, da vossa Ilha de Vera Cruz", em 1º de maio de 1500,
costuma ser chamada de **certidão de nascimento do Brasil**. O
original está em Lisboa, no Arquivo Nacional da Torre do Tombo.

O sketch é o balcão de um cartório que emite segundas vias dessa
certidão. A primeira via traz o cabeçalho datilografado e a imagem da
primeira folha da carta manuscrita, carregada da internet. Cada via
seguinte é uma **fotocópia autenticada da via anterior**, inclusive
dos carimbos que já estavam nela. A cada cópia o manuscrito se
degrada, a escrita engrossa até virar mancha, os carimbos antigos
viram fantasmas cinzentos, e se acumulam carimbos de "CONFERE COM O
ORIGINAL", selos, assinaturas e emolumentos. No caminho entram
averbações com fatos reais: o registro tardio (escrita em 1500, a
carta foi localizada em 1773 e publicada em 1817) e as retificações
de nome, de Ilha de Vera Cruz para Terra de Santa Cruz (1503) e
depois para Brasil (consolidado em 1549).

A guia de recolhimento, ao lado, soma as taxas e **mede a cada via o
quanto a cópia ainda confere com o original**, comparando os pixels
das duas. Quando a cópia fica ilegível, o cartório despacha pedindo o
que não pode ser apresentado ali: o original, que está em Lisboa.

Interação:
- as vias saem sozinhas;
- um clique adianta a etapa atual (termina a cópia, aplica os
  carimbos ou pede a próxima via);
- no fim, um clique abre um novo atendimento, com outra senha e outra
  copiadora.

O canvas é quadrado e se adapta ao tamanho da janela; não há semente
fixa de aleatoriedade.

Imagem usada (carregada em tempo de execução, servida com CORS;
nenhuma imagem acompanha o projeto): primeira folha (fólio 1 recto)
da Carta de Pero Vaz de Caminha, Wikimedia Commons —
https://commons.wikimedia.org/wiki/File:Carta-caminha-folio01r.png

Técnicas usadas:
- carregamento com `await loadImage()` tentando vários endereços do
  Wikimedia em sequência; se todos falharem, o sketch desenha uma
  transcrição do começo da carta e continua funcionando sem rede;
- vias com resolução fixa (600 × 848, densidade de pixels 1),
  independentes do tamanho da janela;
- fotocópia como sequência de operações sobre `pixels`:
  desalinhamento (a folha redesenhada levemente deslocada e girada
  sobre o fundo preto da tampa da copiadora), conversão para brilho
  com 0,222·R + 0,707·G + 0,071·B, desfoque 3×3 separável, ruído do
  toner, curva de contraste com pivô acima do meio-tom (os cinzas
  médios escurecem e a escrita engrossa a cada geração) e defeitos
  fixos da máquina (poeira e riscos do cilindro) que se acumulam;
- conferência com o original: a via e a primeira via (sem carimbos)
  são reduzidas a uma grade de médias de brilho; de cada grade se
  subtrai a média da vizinhança, para sobrar só o detalhe (linhas e
  letras); a cópia é deslizada sobre o original, como numa
  conferência contra a luz, e a semelhança é a maior correlação de
  Pearson encontrada;
- carimbos com texto em círculo (o ângulo de cada caractere é a sua
  largura dividida pelo raio), selo com guilhochê (curvas fechadas em
  coordenadas polares), assinatura feita de laços modulados por
  `noise()` e falhas de tinta;
- animação por estados: a cópia nova é revelada por uma barra de luz
  com o recorte de 9 argumentos de `image()`, e cada carimbo cai numa
  camada transparente antes de ser gravado na via, para ser copiado
  na seguinte.

Fontes dos fatos históricos:
- data, local de guarda, localização em 1773 e primeira publicação em
  1817: https://www.infoescola.com/historia/carta-a-el-rei-d-manuel/
- a carta como "certidão de nascimento do Brasil":
  https://www.arpensp.org.br/artigo/17321
- Ilha de Vera Cruz, Terra de Santa Cruz (1503) e Brasil (1549):
  https://en.wikipedia.org/wiki/Ilha_de_Vera_Cruz

Autor: Henrique Almico Dias da Silva
