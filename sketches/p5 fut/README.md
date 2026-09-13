---
collection: artefato da semana/4
---

# Arte Geométrica Gerativa: Série Campo e Bolas de Futebol (p5.js)

## 🎨 Obra de Inspiração e Referência

- **Autor Inspirador:** Esteban Peñamil ([@estebanpm__](https://x.com/estebanpm__))
- **Link da Obra Original:** [https://x.com/estebanpm__/status/2094511037898965199](https://x.com/estebanpm__/status/2094511037898965199)

### 🔗 Ligação entre o Sketch e a Obra Usada:
A obra original de Esteban Peñamil apresenta uma composição em grade de ilustrações no estilo pôster, combinando texturas de hachuras riscadas (hatching), marcações geométricas de quadras e pilhas verticais ligeiramente inclinadas de bolas com variadas paletas de cores.

Este sketch reinterpreta essa mesma linguagem estética e conceitual, trazendo a temática do futebol de forma fiel:
1. **Marcações Autênticas de Campo de Futebol:** As marcações foram estritamente limitadas aos dois conjuntos regulamentares de um campo de futebol:
   - **Círculo Central:** Composto pela linha de meio-campo, círculo central e o ponto central de saída de bola.
   - **Grande Área:** Composta pela linha de fundo, retângulo da grande área, retângulo da pequena área (área de meta), marca do pênalti e a meia-lua (arco da grande área).
2. **Bolas de Futebol:** Mantêm o padrão clássico com pentágonos e hexágonos, organizadas em pilhas verticais com sobreposição, inclinação e sombras suaves.
3. **Textura e Paletas:** Preserva o efeito de hachura artesanal sobre campos em diversas cores (gramado clássico, futsal azul, saibro/terra, grama seca, sintético roxo).

---

## 📐 Conceitos Geométricos Aplicados

1. **Posição (Grade Adaptativa e Centralização):**
   - Distribuição dos cartões em uma matriz adaptativa calculada via `windowWidth` e `windowHeight`.
   - Uso de `translate(posX, posY)` para posicionar os cartões e centralizar as formas geométricas.

2. **Dimensões (Escala Proporcional):**
   - Todas as proporções de linhas do campo, áreas e bolas adaptam-se dinamicamente à menor dimensão da tela (`min(width, height)`).

3. **Inclinação e Direção (Transformações Geométricas):**
   - Aplicação aleatória de rotações em ângulos retos (`0°`, `90°`, `180°`, `270°`) às marcações de campo de futebol.
   - Inclinação ortogonal/diagonal suave na pilha de bolas (`rotate(inclinacaoPilha)`).
   - Uso do par `push()` e `pop()` para isolar cada sistema de coordenadas local.

---

## 🚀 Como Executar

1. Abra o editor online do p5.js em: [editor.p5js.org](https://editor.p5js.org/)
2. Copie o código presente no arquivo `sketch.js` e cole-o no editor.
3. Clique no botão **Play** (▶) para visualizar a obra.
4. Redimensione a janela ou recarregue a página para gerar variações inéditas.

---

## 🛠️ Estrutura do Arquivo ZIP

O arquivo ZIP contém na raiz (sem pastas internas):
- `sketch.js`: Código-fonte em p5.js atualizado.
- `index.html`: Página HTML configurada para visualização direta.
- `README.md`: Documentação e metadados do projeto.
