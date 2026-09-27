---
collection: artefato da semana/6
---

# Tecido

Este sketch é um estudo de **emergência**. Nenhuma linha do programa descreve a forma que aparece na tela. O que existe são fios fechados de nós e um punhado de regras locais — cada nó só enxerga os dois vizinhos do próprio fio e quem estiver a poucos pixels dele. Todo o resto (lóbulos, dobras, paredes de contato, a parada do crescimento) é consequência, não desenho.

## As regras
Cada nó, a cada quadro, obedece a quatro regras. Nenhuma delas menciona lóbulo, dobra, parede ou contorno.

1. **Coesão** — fique a uma distância de repouso fixa dos seus dois vizinhos de fio.
2. **Repulsão** — afaste-se de qualquer nó que entre no seu raio pessoal, inclusive de um nó de outro fio. É a única regra que atravessa a fronteira entre os tecidos.
3. **Suavização** — caminhe na direção do ponto médio dos dois vizinhos. É o que impede o fio de formar quinas.
4. **Crescimento** — sorteie uma aresta; se o ponto médio dela ainda tiver vizinhança folgada, insira um nó novo ali.

## O que emerge
- **As dobras.** A regra 4 faz o fio ganhar comprimento mais depressa do que o espaço disponível cresce. Um fio fechado mais longo do que a área comporta não tem para onde ir a não ser se enrolar: é a regra 2 que resolve o excesso, empurrando as partes que se encostam. O resultado são circunvoluções que lembram coral cerebriforme ou córtex — sem que exista nada no código sobre curvatura, ramificação ou espessura de lóbulo.
- **O ritmo desigual.** Como a folga varia de ponto para ponto, partes do mesmo fio disparam enquanto outras travam. É dessa diferença de ritmo que vem o nome *crescimento diferencial*, e é ela que produz um contorno irregular a partir de uma semente perfeitamente circular.
- **As paredes de contato.** Quando dois tecidos se encostam, cada um empurra o outro pela regra 2 até as duas bordas ficarem paralelas. Aparece entre eles uma parede quase reta, como em tecido biológico ou espuma — e não há uma única linha de código sobre fronteiras, colisão entre tecidos ou divisão do plano.
- **A morte por sufocamento.** O crescimento não para por um contador de quadros nem por um número máximo de nós: para quando cada ponto candidato já tem vizinhos demais em volta. O tecido preenche o espaço disponível e simplesmente cessa. Quando o último tecido para, a imagem se fixa.
- **A assimetria final.** O tecido que teve espaço livre pela frente termina com lóbulos largos e lisos; o que nasceu apertado entre outros dois termina denso e enrugado. As sementes são idênticas; o que as diferencia é a vizinhança que encontraram.

## Detalhes de implementação
- A regra 2 seria O(n²) se cada nó perguntasse a distância a todos os outros. O sketch mantém uma **grade espacial** com célula do tamanho do raio de repulsão, e cada nó só conversa com as nove células ao redor. Isso é o que torna a regra de fato local, e permite manter alguns milhares de nós em tempo real.
- O deslocamento de cada nó é limitado a uma fração do passo, para que o fio nunca dê um salto e se atravesse.
- O tecido cresce dentro de uma **lâmina fechada**: as bordas empurram de volta, e é por isso que o contorno se achata contra a moldura, do mesmo modo que se achata contra um tecido vizinho.
- A paleta é escolhida na constante `PALETA`, no alto do arquivo: `0` para a lâmina clara, `1` para o negativo.
- Uma camada de memória registra o contorno de tempos em tempos, mas só enquanto o tecido ainda está crescendo. O que fica são **anéis de crescimento**: o registro de por onde a borda já passou. Tecido parado não deixa mais rastro, então a imagem final não satura.
- Todas as medidas derivam de `min(windowWidth, windowHeight)` — passo, raio de repulsão, margem, espessura de traço —, e `windowResized()` recalcula tudo, de modo que a composição mantém as proporções em qualquer formato de tela.

## Autor
Artur Taboada Dios Carvalho

## Como visualizar este projeto

**Usando o ambiente online (p5front)**
1. Acesse o ambiente de desenvolvimento utilizado na disciplina: [https://esperanc.github.io/p5front/](https://esperanc.github.io/p5front/).
2. Copie todo o conteúdo do arquivo `sketch.js` deste zip e cole na área de edição de código do site.
3. O resultado será renderizado na tela de visualização após o botão "Run" ser clicado. O tecido leva alguns segundos para se formar; cada execução parte de sementes diferentes.

Nenhuma biblioteca externa é necessária.
