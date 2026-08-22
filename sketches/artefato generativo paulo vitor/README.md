---
collection: artefato da semana/2
---

# Entre Prédios: Multiverso Generativo

**Autor:** Paulo Vitor Couto

## Descrição

Este sketch é uma extensão generativa do trabalho **Entre Prédios**, produzido na semana anterior somente com quadriláteros. A nova versão continua sendo uma homenagem gráfica autoral a um herói aracnídeo atravessando uma cidade, mas agora utiliza diferentes primitivas do p5.js, adapta-se à janela e cria uma composição nova a cada execução.

O desenho não usa dimensões fixas: o canvas é criado com `windowWidth` e `windowHeight`. Todos os elementos são posicionados a partir de proporções da largura, da altura ou da menor dimensão disponível. A função `windowResized()` recria o canvas quando a janela muda de tamanho.

## O que varia

A cada abertura — ou clique do mouse — são sorteados:

- as cores do céu e do horizonte;
- a quantidade e a posição das estrelas;
- o tamanho e a posição da lua;
- as alturas, larguras e cores dos prédios;
- as janelas acesas;
- a posição, o tamanho, a inclinação e a pose do herói;
- o lado e o ponto em que a teia se prende.

## Interação

- **Clique do mouse:** gera uma nova cena.
- **Tecla `S`:** salva a cena atual em PNG.
- **Redimensionar a janela:** ajusta o canvas e cria outra composição.

## Primitivas utilizadas

O sketch combina `rect()`, `ellipse()`, `triangle()`, `quad()`, `line()` e `arc()`, além de comandos de transformação e estilização.

## Como executar

1. Extraia o arquivo `.zip`.
2. Abra `index.html` em um navegador com acesso à internet; ou
3. Copie o conteúdo de `sketch.js` para o editor online do p5.js.

## Arquivos

- `index.html`: carrega o p5.js e o sketch.
- `style.css`: remove margens e permite que o canvas ocupe toda a janela.
- `sketch.js`: contém o desenho generativo, responsivo e comentado.
- `thumbnail.png`: imagem representativa de uma das possíveis cenas.
