---
collection: artefato da semana/6
---

# Último Fôlego — Emergência

Um sketch em **p5.js** sobre uma batalha entre sobrevivência e ameaça, construído a partir do conceito de **emergência**.

A proposta brinca com a palavra “emergência” em dois sentidos: como uma situação crítica dentro da narrativa visual e como um fenômeno de **emergência em creative coding**, no qual comportamentos complexos surgem da interação de regras simples.

---

## 1. Conceito

O sketch representa um personagem tentando resistir ao ataque de uma entidade ameaçadora.

À primeira vista, a cena pode ser interpretada como uma batalha: existe um sobrevivente, um inimigo, energia sendo projetada entre os dois e um ambiente em estado de instabilidade.

Porém, a imagem não é construída apenas colocando manualmente cada elemento em uma posição específica.

Grande parte da atmosfera da cena surge a partir de **agentes autônomos** que possuem regras simples de comportamento e reagem ao ambiente.

É justamente aí que acontece a brincadeira conceitual do projeto:

> **A emergência da batalha é representada por uma emergência computacional.**

---

## 2. A emergência dentro da narrativa

Na história do sketch, existe uma situação de emergência.

O personagem está sob pressão constante e precisa resistir ao ataque da criatura. Conforme sua resistência diminui, o ambiente se torna mais instável, a ameaça ganha importância visual e a composição passa a transmitir uma sensação de caos.

A emergência, nesse caso, significa uma situação que exige uma resposta imediata.

O jogador participa dessa situação através do mouse:

* segurar o mouse representa **resistir ao ataque**;
* soltar o mouse representa **perder resistência**;
* a resistência influencia o estado do personagem;
* a proximidade e o comportamento da ameaça interferem na movimentação dos elementos da cena.

Assim, a imagem não representa apenas uma batalha congelada. Ela representa um sistema em constante tensão.

---

## 3. Emergência em Creative Coding

No creative coding, **emergência** pode ser entendida como o aparecimento de comportamentos ou padrões complexos a partir da interação de elementos relativamente simples.

Em vez de determinar manualmente:

> “este elemento deve estar exatamente aqui e se mover exatamente desta maneira”,

o sketch define regras locais para os agentes.

Cada agente possui, por exemplo:

* posição;
* velocidade;
* aceleração;
* forças que podem influenciar seu movimento;
* percepção de outros agentes;
* reação à ameaça;
* atração ou aproximação do sobrevivente.

As regras são relativamente simples individualmente.

Porém, quando muitos agentes interagem simultaneamente, o resultado coletivo pode produzir padrões que não foram desenhados diretamente pelo código.

É essa característica que torna o comportamento **emergente**.

---

## 4. Como os agentes funcionam

Os agentes do sketch seguem diferentes regras de comportamento.

### Separação

Os agentes tentam evitar ficar excessivamente próximos uns dos outros.

Isso impede que todo o sistema se transforme em um único ponto e contribui para a distribuição das partículas pelo espaço.

### Alinhamento

Os agentes observam a movimentação dos vizinhos e tendem a ajustar suas velocidades.

Isso cria uma sensação de fluxo coletivo.

### Coesão

Os agentes também são influenciados pela posição dos outros agentes, criando uma tendência de permanecerem relacionados ao grupo.

### Reação à ameaça

A criatura funciona como uma força externa sobre o sistema.

Os agentes podem se afastar ou alterar seu comportamento quando estão próximos da ameaça.

### Atração pelo sobrevivente

Alguns agentes também são influenciados pelo personagem central, criando concentração e circulação ao seu redor.

---

## 5. Do comportamento individual ao comportamento coletivo

O ponto mais importante do sketch está nessa passagem:

**regras simples → interação → comportamento coletivo → padrão visual**

Um agente individual não possui conhecimento da imagem inteira.

Ele não sabe que precisa “desenhar uma batalha”.

Ele apenas responde às condições ao seu redor.

Quando centenas de agentes fazem isso simultaneamente, entretanto, aparecem:

* fluxos;
* concentrações;
* dispersões;
* regiões de maior atividade;
* movimentos circulares;
* alterações na densidade visual;
* sensação de caos e organização ao mesmo tempo.

Esses padrões são propriedades do **sistema**, e não de um agente específico.

---

## 6. A brincadeira entre os dois significados de emergência

O principal conceito do projeto está na sobreposição dos dois significados.

### Emergência narrativa

O personagem está enfrentando uma **situação de emergência**.

Existe perigo, pressão e necessidade de resistência.

### Emergência computacional

A imagem é parcialmente produzida por um **sistema emergente**.

O resultado visual não é totalmente especificado antecipadamente. Ele aparece a partir da interação entre os agentes e as regras do sistema.

Dessa maneira, a própria forma de construção da obra conversa com aquilo que ela representa.

A batalha é emergente porque suas condições estão sempre mudando.

E a imagem também é emergente porque seus padrões visuais surgem da interação entre elementos simples.

---

## 7. O papel do acaso

O sketch também utiliza variações e comportamentos que impedem que todos os agentes produzam exatamente o mesmo movimento.

Isso é importante porque emergência não significa simplesmente gerar uma imagem aleatória.

O objetivo é combinar:

**regras + interação + variação**

O acaso introduz pequenas diferenças entre os agentes, enquanto as regras estabelecem limites para seus comportamentos.

O resultado fica entre a ordem e o caos.

Se todos os elementos fossem completamente previsíveis, a imagem seria apenas uma sequência determinada de instruções.

Se tudo fosse completamente aleatório, seria difícil identificar um comportamento coletivo.

O sistema procura justamente esse meio-termo.

---

## 8. O usuário como parte do sistema

A interação do usuário também participa da emergência.

Ao pressionar e segurar o mouse, o jogador interfere na resistência do personagem e, consequentemente, nas condições do sistema.

Isso significa que o usuário não está apenas observando a cena.

Ele altera uma das variáveis que influenciam seu comportamento.

A experiência passa então por três níveis:

**usuário → sistema → imagem**

O usuário modifica o estado do sistema, o sistema recalcula os comportamentos dos agentes e esses comportamentos modificam a imagem.

---

## 9. Processo criativo

O processo começou com a ideia visual de uma batalha em situação crítica: um personagem tentando sobreviver enquanto uma entidade o ameaça.

A partir dessa ideia, elementos tradicionais de uma cena de batalha foram transformados em componentes de um sistema generativo.

Em vez de utilizar partículas apenas como decoração, elas passaram a possuir regras próprias.

O objetivo foi fazer com que o ambiente parecesse estar **reagindo à batalha**, e não simplesmente representar uma imagem estática de uma batalha.

A ameaça passou a funcionar como uma influência sobre os agentes, enquanto o sobrevivente funciona como outro centro de influência.

Assim, a composição final surge da disputa entre diferentes forças.

---

## 10. Entre ordem e caos

Uma das características visuais buscadas no sketch é a tensão entre **ordem e caos**.

Os agentes possuem regras que organizam seus movimentos, mas essas regras acontecem simultaneamente em muitos indivíduos.

Pequenas mudanças podem alterar a configuração coletiva.

Isso produz uma estética adequada ao conceito da obra:

* a batalha possui uma estrutura;
* os personagens possuem posições definidas;
* existem forças e relações claras;
* mas o ambiente permanece instável.

A organização existe, mas nunca é completamente rígida.

---

## 11. Por que usar agentes?

O uso de agentes torna o conceito de emergência parte do próprio processo de criação.

Se cada partícula tivesse sua posição e trajetória determinadas manualmente, a emergência estaria apenas sendo representada visualmente.

Com os agentes, ela também está presente **na maneira como a imagem é produzida**.

Portanto, o código não apenas fala sobre emergência.

Ele utiliza emergência como uma estratégia de criação.

---

## 12. Conclusão

**Último Fôlego — Emergência** utiliza uma situação de batalha como metáfora para explorar sistemas emergentes em creative coding.

A emergência aparece simultaneamente como:

> **uma situação de perigo dentro da narrativa**

e

> **um comportamento coletivo que surge da interação entre agentes computacionais.**

A intenção é que exista uma relação entre **o que a imagem representa** e **como ela é construída**.

O sobrevivente tenta resistir a uma emergência.

Os agentes, por sua vez, produzem padrões emergentes.

Assim, a batalha não é apenas o tema do sketch: ela também serve como modelo para pensar a própria criação generativa.

**Uma batalha produzida por emergência para representar uma situação de emergência.**
