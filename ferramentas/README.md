# ferramentas — exemplos dos slides

Mantém a correspondência entre **o código mostrado no slide**, **a imagem do
canvas** e **o link `editar`**. Os três saem da mesma fonte: o trecho de código
que está no `slides.md`.

Como funciona:

1. `manifesto.py` diz, para cada imagem de exemplo, o tamanho do canvas e o que
   envolve o trecho do slide (o `createCanvas`, o estilo, os laços externos).
2. `gerar.py` lê o `slides.md`, pega o trecho de cada slide e monta o sketch
   completo em `gen/`.
3. `render.sh` roda cada sketch no Chrome headless (p5.js 2.2.3, 2×) e grava o
   PNG na pasta da aula.
4. `injeta.js` comprime cada sketch num link `?share=` do p5Front (mesmo formato
   do botão *Share*) e o insere no `slides.md`, abaixo do `::img`.

Uso, a partir da raiz do repositório:

```bash
python3 ferramentas/gerar.py && ferramentas/render.sh && node ferramentas/injeta.js ferramentas/gen "3 - Posição, Direção e Tamanho/slides.md"
```

Outra aula: exporte `AULA="4 - ..."` antes dos comandos.

Depois de editar um trecho de código no `slides.md`, rode isso de novo: a imagem
e o link acompanham a mudança. Sem isso, os três podem divergir — foi assim que
o exemplo de coordenadas normalizadas ficou com o código incompleto.

Slides cujo desenho é uma *figura didática* (setas, réguas, eixos) não passam por
aqui: os sketches deles são escritos à mão e não têm link `editar`.
