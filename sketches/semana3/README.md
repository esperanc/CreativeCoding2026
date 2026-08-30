---
collection: artefato da semana/3
---

Este projeto consiste em uma composição visual estática e gerativa desenvolvida com a biblioteca **p5.js**. A obra adapta-se automaticamente às dimensões da janela do navegador e cria padrões geométricos abstratos e inéditos a cada execução.

---

## 📐 Conceitos Geométricos Aplicados

1. **Posição (Grade Adaptativa e Centralização):**
   - A tela utiliza `windowWidth` e `windowHeight` para ocupar 100% da área disponível.
   - A composição se organiza em uma grade cujas margens são recalculadas automaticamente para manter os elementos perfeitamente centralizados na tela.
   - Utilização de `translate(posX, posY)` para mover a origem do sistema de coordenadas para o centro de cada célula.

2. **Dimensões (Escala Proporcional):**
   - Todas as formas e espessuras de linha têm tamanhos definidos em função da menor dimensão da janela (`min(width, height)`).
   - Essa abordagem impede que o design fique distorcido em telas verticais (monitores mobile) ou ultra-wide.

3. **Inclinação e Direção (Transformações Geométricas):**
   - Aplicação de rotações (`rotate()`) aleatórias em ângulos retos ($0^\circ$, $90^\circ$, $180^\circ$, $270^\circ$) e diagonais ($45^\circ$).
   - Controle das matrizes de transformação usando o par `push()` e `pop()` para isolar as rotações e translações dentro de cada célula individual.

---

## 🎨 Principais Funcionalidades

- **Gerativa:** A paleta de cores harmoniosa (em modo HSB) e as escolhas de formas em cada célula são calculadas aleatoriamente via `random()`.
- **Estática:** Utiliza `noLoop()` no setup para evitar renderização contínua e manter o foco em uma única imagem estática gerada.
- **Responsiva:** A função nativa `windowResized()` recalcula a grade e gera um novo arranjo sempre que o navegador muda de tamanho.

---

## 🚀 Como Executar

1. Abra o editor online do p5.js em: https://esperanc.github.io/p5front/
2. Substitua o código existente pelo script JavaScript fornecido no projeto (`sketch.js`).
3. Pressione o botão **Play** (▶) no canto superior direito para visualizar a imagem.
4. Para gerar uma nova variação da arte, aperte **Play** novamente ou redimensione a janela do navegador.

---

## 🛠️ Tecnologias Utilizadas

- **JavaScript (ES6+)**
- **p5.js** (Biblioteca para computação gráfica)
