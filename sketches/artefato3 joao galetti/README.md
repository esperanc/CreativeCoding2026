---
collection: artefato da semana/3
---

# Artefato 3 — Bússola de Campo

Este artefato segue explicitamente uma especificação geométrica em termos de **posição, direção e tamanho**, os conceitos trabalhados na aula "Posição, direção e tamanho".

## A especificação geométrica

O desenho é um campo de "agulhas" organizadas em anéis concêntricos ao redor do centro do canvas:

- **Posição**: cada agulha é posicionada por **coordenadas polares** — um raio `r` (distância ao centro, definido pelo anel) e um ângulo `theta` (posição ao longo do anel). A posição cartesiana é derivada com `cos(theta) * r` e `sin(theta) * r`.
- **Direção**: cada agulha aponta em uma direção resultante de um **campo vetorial**: o ângulo polar somado a uma perturbação de ruído Perlin (`noise()`), criando um padrão de fluxo em espiral em vez de agulhas alinhadas radialmente.
- **Tamanho**: o comprimento e a espessura de cada agulha crescem **proporcionalmente à distância do centro** (`t = r / maxR`), junto com a cor, que faz uma transição entre dois tons conforme o raio e o ângulo.

Anéis de referência (`ellipse` sem preenchimento) marcam visualmente as distâncias radiais usadas para posicionar cada anel de agulhas.

## Técnica

Uma semente aleatória (`seed`) controla o ruído usado no campo vetorial; clicar no desenho sorteia uma nova semente e gera um novo campo, mantendo a mesma lógica de posição/direção/tamanho.

## Arquivos

- `sketch.js` — código-fonte do sketch em p5.js.
- `index.html` — executa o sketch (responsivo) e exibe o código-fonte visualmente.
- `thumbnail.png` — imagem representativa do resultado.

---

Feito por **João Galetti**.
