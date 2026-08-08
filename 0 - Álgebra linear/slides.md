::: center
# Álgebra Linear para Computação Visual
## Uma recapitulação rápida
:::
---
# Vetores
::: row
::: col ratio=55%
- Representam **direção** e **magnitude** no espaço.
- Em Computação Visual: posições, normais, direções de luz.
- Notação: $\vec{v} = (x, y, z)$
:::
::: col ratio=45%
:: image src="vetor_3d.svg" width=100%
:::
:::
---
# Operações básicas
::: reveal
- Soma e subtração: combinam deslocamentos.
- Multiplicação por escalar: $\lambda\vec{v}$ escala o comprimento (e inverte o sentido se $\lambda < 0$).
- Produto escalar: mede alinhamento entre vetores. $\vec{a} \cdot \vec{b} = |a||b|\cos\theta$
- Produto vetorial: gera um vetor perpendicular a ambos.
- Normalização: reduz o vetor a comprimento 1, mantendo a direção.
:::
---
# Ponto vs. vetor
::: row
::: col
- **Ponto**: uma posição no espaço.
- **Vetor**: um deslocamento — não tem posição fixa, só direção e magnitude.
- A diferença entre dois pontos é um vetor: $\vec{v} = P_2 - P_1$.
- Um ponto **mais** um vetor é outro ponto: $P_2 = P_1 + \vec{v}$.
:::
::: col
:: image src="ponto_vs_vetor.svg" width=90%
:::
:::
---
# Coordenadas homogêneas
- Para tratar pontos e vetores de forma uniforme em matrizes $4\times4$, acrescenta-se uma quarta coordenada $w$.
- **Ponto**: $(x, y, z, 1)$
- **Vetor**: $(x, y, z, 0)$
- Isso é o que permite que a mesma matriz $4\times4$ afete pontos e vetores de forma diferente — em particular, é o $w$ que decide se a translação é aplicada ou não.
---
# Transformações afins
::: row
::: col
- Uma matriz $4\times4$ pode representar rotação, escala e translação.
- **Rotação e escala** afetam tanto pontos quanto vetores.
- **Translação só afeta pontos** ($w=1$): como o $w$ de um vetor é $0$, a coluna de translação da matriz é anulada e o vetor não se desloca — só muda de direção/magnitude com rotação/escala.
:::
::: col
:: image src="matriz_transformacao.svg" width=90%
:::
:::
