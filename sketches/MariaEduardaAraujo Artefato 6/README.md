---
collection: artefato da semana/6
---

# Artefato da Semana 6: Emergência

**Autora:** Maria Eduarda Araújo
**DRE:** 119054059

## Sobre o Projeto
Para a sexta semana de programação criativa, o tema foi a exploração da **Emergência** — o fenômeno em que sistemas complexos e visualmente ricos surgem a partir de regras simples aplicadas a vários elementos de forma indireta. Embora o professor tenha indicado que não era estritamente necessário usar agentes autônomos, optei por criar um sistema de partículas para demonstrar o conceitoo (Bônus achei que ficou muito legal).

O resultado é um sketch que simula um ambiente mágico utilizando 1.500 pequenas partículas que se movem de forma autônoma pelo ecrã.

Usei:
*   **Emergência pelo Perlin Noise:** O comportamento fluido, semelhante a chamas de fogo, vento e correntes mágicas de poeira não foi desenhado manualmente. Utilizei a função matemática `noise()` para gerar um "campo de fluxo" (flow field) invisível.
*   **Comportamento Indireto:** As partículas não sabem para onde estão a ir ou que padrão devem formar. Elas apenas leem o valor do Ruído de Perlin (`noise()`) no ponto exato (x, y) em que estão naquele momento e traduzem esse valor num ângulo de força (vento). O padrão final complexo que se vê no ecrã — com redemoinhos e correntes — *emerge* do comportamento coletivo e de regras simples de atrito e limites de velocidade.

## Processo de Criação
Utilizei a inteligência artificial (Gemini) para auxiliar na implementação da estrutura do fluxo de partículas e na correta aplicação do algoritmo de Perlin Noise.

A IA ajudo a estruturar o loop que calcula o ângulo de força com `cos(angulo)` e `sin(angulo)` e a programar um leve atrito (`p.vx *= 0.95`), algo essencial para evitar que o sistema ficasse demasiado caótico.

A lógica visual foi dividida em dois tipos de comportamento:
1.  **Fogo:** Representa 20% das partículas, que recebem uma força de elevação extra para subir lentamente, dissipando as suas cores (tons de laranja/amarelo) com base no seu tempo de vida (idade).
2.  **Poeira:** Representa 80% das partículas, que reagem mais organicamente ao vento invisível do Perlin Noise, com cores mapeadas pela sua posição na tela e uma opacidade cintilante gerada pela função `sin()`.

O efeito de "rastro" contínuo (ghosting) foi alcançado desenhando um retângulo translúcido (`fill(10, 5, 15, 30)`) a cobrir todo o `canvas` em cada *frame*, no lugar da tradicional chamada `background()`.

## O Meu Prompt Utilizado

> "Crie um sketch animado em p5.js focado no conceito de Emergência, o resultado deve mostrar um comportamento complexo e orgânico que surge de regras simples, sem ter sido explicitamente desenhado. O código deve seguir estritamente estas regras:
> 
> 1. O Desenho: Crie um sistema com milhares de partículas (pelo menos 1500) divididas visualmente em dois tipos: 'Fogo' e 'Poeira'.
> 2. O Layout e Movimento: Não programe caminhos exatos para as partículas. Utilize o Perlin Noise (`noise()`) para gerar um 'Flow Field' (campo de fluxo) contínuo e invisível no fundo. As partículas devem reagir apenas ao 'vento' local da sua posição.
> 3. Variação Matemática: Aplique matemática para traduzir o ruído num ângulo (`TWO_PI`), use trigonometria (`cos` e `sin`) para gerar vetores de velocidade e aplique regras físicas básicas como atrito e limites de velocidade (`constrain`).
> 4. Tema visual: Um ambiente mágico e escuro. As partículas de Fogo devem ter tons quentes (vermelhos, amarelos) que sobem e morrem depressa. As partículas de Poeira devem durar mais, cintilar usando a função `sin()` atrelada à sua idade, e variar de cor (tons escuros de cinzas ao roxo) consoante a sua posição. Para os rastros, desenhe retângulos translúcidos ao invés de usar o `background()` puro.
> 
> Apresente o código totalmente comentado e documentado para explicar a lógica por trás do Perlin Noise e como a emergência se processa aqui, voltado para iniciantes em programação."
