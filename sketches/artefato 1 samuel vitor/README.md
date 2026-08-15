---
collection: artefato da semana/1
---

# Noite em Quadriláteros

**Autor:** Samuel Vitor Pedro e Araujo
**Disciplina:** Programação Criativa  
**Atividade:** Artefato da semana 1 — Desenho com quadriláteros

## Descrição

Este trabalho é um sketch estático em p5.js inspirado na atmosfera noturna, nas cores vibrantes e no movimento das pinceladas de *A Noite Estrelada*, de Vincent van Gogh. A composição apresenta um céu azul profundo, estrelas amarelas, uma lua crescente luminosa, grandes espirais, montanhas, uma aldeia silenciosa e um cipreste escuro em primeiro plano.

A regra criativa foi usar `quad()` como a única primitiva de desenho. O próprio fundo, as casas, os telhados, as janelas, as estrelas, a lua, as montanhas, o cipreste, os brilhos e todas as texturas são formados por quadriláteros.

## Execução

Solicitei ao ChatGPT 5.6 Luna xHigh:
*me de uma ideia criativa de sketch estatico com as seguites limitações 'O sketch deve usar como primitiva de desenho apenas o comando quad. É permitido usar comandos de estilização como stroke, fill, strokeWeight, etc.'*

Recebi a idéia "A cidade refletida numa poça" e lembrei de noite estrelada, então segui:
*me de um prompt pra gerar noite estrelada, de van gogh, com as limitações da mensagem anterior*

O retorno foi:

*Crie um sketch estático em p5.js inspirado na atmosfera de A Noite Estrelada, de Vincent van Gogh, com céu noturno azul profundo, estrelas amarelas intensas, uma lua luminosa, espirais no céu, uma aldeia silenciosa e um grande cipreste escuro em primeiro plano.*
*Existe uma limitação rígida: a única primitiva de desenho permitida é quad(). Todas as formas visíveis — estrelas, lua, casas, janelas, montanhas, cipreste, espirais, brilho e textura — devem ser construídas exclusivamente com quadriláteros. Use quads finos, sobrepostos, rotacionados e deformados para criar pinceladas curvas e orgânicas.*  
*Não use ellipse(), circle(), rect(), line(), triangle(), arc(), point(), imagens ou SVGs. Comandos de estilização como fill(), stroke(), strokeWeight(), noStroke(), transparência e transformações são permitidos. O resultado deve parecer uma pintura feita com pinceladas geométricas, mantendo a composição e as cores vibrantes associadas à obra de Van Gogh, sem animação e sem interação.*

Enviei ao ChatGPT 5.6 Sol Ultra que gerou p5.js.
## Ideia e processo

O desenho transforma pequenos quads em "pinceladas geométricas". Há três técnicas principais:

1. **Pinceladas afiladas:** um quadrilátero estreito liga dois pontos, com uma largura diferente em cada extremidade.
2. **Fitas curvas:** uma sequência de quads encostados acompanha pontos calculados matematicamente e cria a ilusão de uma curva ou espiral.
3. **Mosaicos radiais:** setores quadrilaterais organizados em anéis formam os halos, as estrelas e a lua.

As formas são sobrepostas com diferentes tons de azul, amarelo, verde e transparência. Um gerador pseudoaleatório com semente fixa varia as pinceladas, mas preserva exatamente o mesmo resultado a cada execução.

O sketch produz **6.287 quadriláteros**, não contém animação nem interação e chama `noLoop()` após terminar a pintura.

## Arquivos

- `sketch.js`: script completo, comentado em português para facilitar a leitura por iniciantes;
- `thumbnail.png`: imagem representativa do resultado final;
- `README.md`: esta descrição.

## Como executar

### p5Front

1. Abra o [p5Front](https://esperanc.github.io/p5front/).
2. Crie um novo sketch.
3. Copie todo o conteúdo de `sketch.js` para o editor.
4. Execute o sketch e confira o resultado.

### Editor oficial do p5.js

1. Abra o [editor.p5js.org](https://editor.p5js.org/).
2. Crie um novo sketch.
3. Substitua o conteúdo de `sketch.js` pelo código deste trabalho.
4. Clique em **Play**.

## Restrição técnica

A única chamada que gera geometria no canvas é `quad()`, centralizada na função auxiliar `patch()`. Não são utilizadas outras primitivas, imagens, SVGs, animações ou eventos de entrada.
