---
title: Do pó ao ponto
tags: [AI, ChatGPT, imagem, partículas, animação, interação, tênis]
collection: artefato da semana/8
---

# Do pó ao ponto

**Autor:** Henrique Kezen V. H. Leite  
**Desenvolvido com auxílio de AI — ChatGPT.**

## Proposta

Uma fotografia de Rafael Nadal em Roland Garros se transforma em milhares de grãos. A matéria se dispersa ao contato com o ponteiro e volta a compor o atleta quando o movimento cessa. O saibro é a metáfora visual para a tensão entre uma forma passageira e a permanência do gesto esportivo.

A fotografia não é exibida no canvas: o programa lê seus pixels e usa as cores para desenhar cada partícula. Uma máscara poligonal manual seleciona o corpo e a raquete, excluindo o gandula e quase todo o fundo publicitário. O recorte é ampliado sem deformar a proporção original. O fundo escuro, a poeira ambiente, as linhas de quadra e a tipografia são desenhados pelo código.

## Executar

Importe este ZIP no p5Front e execute o sketch. Os arquivos estão diretamente na raiz, como no exemplo da disciplina. No botão ⓘ, confira os metadados acima e a miniatura.

Outra opção: extraia o ZIP, abra um terminal na pasta e execute `python -m http.server 8000`. Acesse `http://localhost:8000` no navegador. Não é necessário instalar pacotes Python. É necessária conexão com a internet para carregar a biblioteca e a fotografia.

- **Mouse:** passe sobre o atleta para espalhar os grãos; afaste o ponteiro para permitir o retorno.
- **Celular/tablet:** toque e arraste sobre o desenho; solte para permitir o retorno.
- **Reformar a imagem:** repete a abertura com partículas dispersas.

## Como funciona

1. `setup()` carrega a fotografia com `await loadImage()`, conforme a API do p5.js 2.
2. A imagem é reduzida em memória para 960 × 600 pixels; `loadPixels()` permite ler as cores.
3. Um teste ponto-em-polígono seleciona a silhueta e a raquete. Não há máscara raster ou foto local.
4. Cada partícula guarda sua cor, posição de destino, posição atual e velocidade.
5. Uma força de mola leva os grãos ao destino; o amortecimento limita as oscilações.
6. O ponteiro exerce repulsão em um raio de 85 unidades do canvas.
7. As partículas são desenhadas no contexto 2D do canvas p5, sem sobrepor a fotografia original.

A composição tem resolução lógica de 1100 × 760 e se adapta à largura da tela por CSS. As coordenadas do ponteiro são convertidas para essa resolução. O desempenho depende do dispositivo.

## Dependências e arquivos

- **p5.js 2.2.3**, carregado exclusivamente pelo CDN: https://cdn.jsdelivr.net/npm/p5@2.2.3/lib/p5.min.js
- `index.html`: documento e referência ao CDN.
- `sketch.js`: leitura da imagem, partículas e composição.
- `style.css`: apresentação da página e controles.
- `README.md`: metadados e documentação.
- `thumbnail.png`: captura do canvas em execução.

A biblioteca p5.js e a fotografia não estão incluídas no ZIP. A miniatura é a única imagem local e não é carregada pelo sketch. Se a foto não carregar, a página mostra uma mensagem e um botão para tentar novamente.

## Fotografia, créditos e licença

**Rafael Nadal Forehand**, Yann Caradec, 29 de maio de 2012. Roland Garros, primeira rodada, Rafael Nadal contra Simone Bolelli.

- Página de origem: https://commons.wikimedia.org/wiki/File:Rafael_Nadal_Forehand.jpg
- Arquivo remoto: https://upload.wikimedia.org/wikipedia/commons/9/90/Rafael_Nadal_Forehand.jpg
- Licença indicada na página do Wikimedia Commons: **Creative Commons Attribution-ShareAlike 2.0 Generic (CC BY-SA 2.0)**.
- Texto da licença: https://creativecommons.org/licenses/by-sa/2.0/

Transformações: redimensionamento em memória, seleção poligonal, reenquadramento, reconstrução por partículas, animação e substituição do fundo. A composição visual derivada e sua miniatura são disponibilizadas sob CC BY-SA 2.0, com atribuição ao fotógrafo. O autor da fotografia não endossa este projeto. O código e a documentação também são disponibilizados sob CC BY-SA 2.0; o p5.js mantém sua própria licença.

## Prompt utilizado (transcrição integral)

O preâmbulo deste README usa delimitadores YAML `---` para reconhecimento dos metadados. A transcrição abaixo preserva o texto recebido, incluindo seu separador tipográfico.

```text
Crie um sketch de programação criativa chamado “Do pó ao ponto”, usando p5.js versão 2, em que uma fotografia de Rafael Nadal jogando no saibro é reconstruída com milhares de partículas.

Use a imagem já escolhida, de Nadal executando um forehand em Roland Garros em 2012, fotografada por Yann Caradec:

https://upload.wikimedia.org/wikipedia/commons/9/90/Rafael_Nadal_Forehand.jpg

Fonte e créditos:
https://commons.wikimedia.org/wiki/File:Rafael_Nadal_Forehand.jpg

Visual e interação:

* As partículas começam dispersas e se juntam gradualmente para revelar Nadal.
* Use as cores da fotografia nas partículas, preservando o reconhecimento do jogador, de seu corpo e da raquete.
* Ao passar o mouse, as partículas próximas devem se espalhar como poeira de saibro. Quando ele se afastar, elas devem retornar suavemente às posições originais.
* Use um enquadramento mais fechado no Nadal, preservando o corpo inteiro e a raquete. Reduza a presença das propagandas e do gandula por meio do código.
* Busque uma composição expressiva, com fundo escuro e movimento fluido. A imagem deve ser reconstruída pelas partículas, não apenas exibida com um efeito por cima.
* Mantenha o código organizado, comentado e compreensível para um estudante de programação.

Requisitos técnicos e entrega:

1. Use p5.js versão 2 carregada por CDN. Não inclua a biblioteca no ZIP.
2. Carregue a fotografia diretamente pela URL durante a execução, com CORS. Não inclua a fotografia no ZIP nem a incorpore em base64.
3. Verifique o carregamento da imagem, a leitura dos pixels e o funcionamento da animação e da interação.
4. Entregue apenas um arquivo ZIP, com os arquivos do sketch na raiz, incluindo index.html, sketch.js, eventuais estilos, README.md e thumbnail.png.
5. A thumbnail.png deve ser uma captura representativa do sketch funcionando.
6. O README deve começar exatamente com este preâmbulo:

⸻

title: Do pó ao ponto
tags: [AI, ChatGPT, imagem, partículas, animação, interação, tênis]
collection: artefato da semana/8

Após o preâmbulo, inclua meu nome, Henrique Kezen V. H. Leite, uma descrição do trabalho, instruções de execução e interação, a fonte da fotografia, os créditos e a licença correspondente, indicando as transformações realizadas.

Registre este prompt integralmente no README como o prompt utilizado. Siga a organização do ZIP de exemplo fornecido, para que o projeto possa ser aberto e seus metadados reconhecidos no p5Front.
```
