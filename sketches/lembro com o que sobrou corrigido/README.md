---
title: Lembro com o que sobrou
tags: [AI, ChatGPT, typography, memoria, percepcao, p5js]
collection: artefato da semana/7
---

# Lembro com o que sobrou

Um sketch interativo de arte tipográfica sobre a memória como reconstrução: **para lembrar de uma coisa, outras precisam mudar**.

## Abrir

Extraia o ZIP e abra `index.html` em um navegador atualizado, com acesso à internet. Não é necessário instalar dependências ou compilar. A conexão é necessária para carregar p5.js pelo CDN.

Arquivos da entrega:

- `index.html`: página e carregamento de p5.js **2.2.3**, por CDN.
- `sketch.js`: composição tipográfica, animação e interação.
- `style.css`: apresentação e adaptação a telas pequenas.
- `README.md`: concepção, instruções e regras técnicas.

No editor p5.js, use os três arquivos de código juntos e preserve o carregamento da versão 2 em `index.html`. O sketch usa elementos dessa página, portanto copiar apenas `sketch.js` para um projeto vazio não é suficiente.

## Experimentar

1. Escolha **o rosto**, **a voz**, **o calor** ou **o toque**, clicando no título. As teclas **1–4** também selecionam.
2. Mantenha **Segure para lembrar** pressionado. A lembrança escolhida busca letras reais nas outras e tenta preencher suas lacunas. Solte para interromper. Também é possível segurar **espaço** fora dos outros controles, ou quando o botão de reconstrução está em foco.
3. **Arraste uma letra** até outra lembrança: ela ocupa o lugar vazio mais próximo. Se o caractere for diferente do esperado, ele altera a transcrição. Soltar fora das lembranças cancela a transferência.
4. **Duplo clique** em uma letra a devolve à posição de origem, se ela estiver livre. O movimento adquirido permanece. Se a posição estiver ocupada, a interface informa que é preciso abri-la primeiro.
5. Observe as frases sob cada imagem e a mensagem de consequência na parte inferior.

**Esc** cancela o arrasto e interrompe a reconstrução. **Pausar movimento** suspende os ritmos, mantendo a interação disponível. A preferência do sistema por movimento reduzido inicia o sketch pausado. **Começar outra memória** reinicia toda a experiência, incluindo o histórico das letras. Atualizar a página também reinicia: o histórico existe apenas durante a sessão.

Em celular, toque e segure para reconstruir; o arrasto usa eventos de ponteiro. Os controles podem ser acessados por Tab. O teclado permite reconstruir as quatro lembranças sem usar o arrasto.

## O limite é real

As quatro frases exigem **211 posições**, mas existem apenas **169 caracteres disponíveis**, contando a pontuação. Assim, não é possível completar todas ao mesmo tempo. Algumas letras já começam deslocadas, na periferia de outra lembrança; as demais ocupam posições das frases. O contador permanece constante.

Cada letra é um objeto único com identidade, origem, posição atual e histórico sensorial. Uma transferência esvazia uma posição e ocupa outra com o mesmo objeto. O botão procura primeiro caracteres compatíveis vindos de outra lembrança. Na ausência deles, tenta aproveitar uma letra periférica local compatível e, por último, usa outro caractere disponível: reconstruir também pode produzir uma frase diferente.

Os pontos claros marcam lugares vazios. As transcrições e os ecos são representações dos mesmos recursos, não letras adicionais que possam ser transferidas. Os lugares periféricos acolhem deslocamentos, mas também não geram letras.

## Como os sentidos se misturam

| Origem | Comportamento que a letra transporta |
| --- | --- |
| Rosto / visual | Mantém um desvio ligado à posição que ocupava no contorno original. |
| Voz / sonora | Pulsa, interrompe o ritmo, varia a opacidade e produz um eco deslocado. |
| Calor / térmica | Oscila em convecção lenta e interfere na cor. |
| Toque / tátil | Resiste ao deslocamento e se comprime durante o movimento. |

Uma letra sonora levada ao rosto faz parte desse rosto gaguejar. Uma letra que passa pelo calor leva a convecção para a voz. Uma letra tátil demora a acompanhar o arrasto. Os efeitos se acumulam em pesos sensoriais, mantendo a origem; cada passagem entre lembranças acrescenta um vestígio e um pequeno deslocamento de impressão.

Quando uma lembrança perde letras, as restantes se aproximam, reorganizando a figura com menos recursos. O contorno é calculado por caminhos e relações matemáticas; não há imagens ocultas, máscaras de fotografias ou consultas à geometria de fontes.

Não existe um estado de vitória: preencher a frase não apaga a trajetória dos caracteres. A redistribuição de funções é uma **metáfora artística**, não uma reprodução científica de processos neurológicos. A dimensão sonora é representada visualmente; o sketch não reproduz áudio.

## Prompt de concepção

Crie um sketch interativo de arte tipográfica com o tema **“Lembro com o que sobrou”**, explorando a memória como uma reconstrução que transforma aquilo que tenta preservar.

A composição deve apresentar fragmentos de lembranças associados a diferentes percepções: o rosto de alguém, uma voz, uma temperatura, uma textura. Todas as lembranças compartilham uma quantidade limitada de letras. Para reconstruir uma delas, o participante precisa retirar caracteres de outras, deixando lacunas e produzindo novos sentidos nas frases que permanecem.

Cada letra deve carregar vestígios sensoriais de sua origem. Caracteres provenientes de uma lembrança sonora pulsam, ecoam ou fazem pausas; os de uma lembrança tátil se comprimem, aderem ou resistem ao movimento; os de uma lembrança visual preservam relações de posição e contorno. Ao serem transferidos, esses caracteres levam seus comportamentos para o novo contexto.

A interferência deve produzir combinações inesperadas: **um rosto que gagueja, uma voz que passa a ser lembrada como temperatura, uma distância que adquire ritmo**. Essa mistura precisa aparecer no comportamento e na organização das letras, além do significado das frases.

À medida que uma lembrança perde caracteres, ela deve tentar se reorganizar usando os recursos que restaram. A proposta usa a redistribuição de funções como metáfora artística: aquilo que perde uma forma de expressão encontra outra maneira de continuar presente.

As transformações deixam marcas. Devolver uma letra ao lugar de origem não elimina completamente os comportamentos adquiridos durante seu percurso. Assim, mesmo que o participante recomponha uma frase, a lembrança já terá mudado.

A imagem deve ser construída pela própria tipografia: palavras, vazios, sobreposições, ritmos e movimentos. A interação começa com o desejo de recuperar algo e revela progressivamente seu custo: **para lembrar de uma coisa, outras precisam mudar**.

## Regras técnicas e créditos

- p5.js **2.2.3** carregado exclusivamente de `https://cdn.jsdelivr.net/npm/p5@2.2.3/lib/p5.min.js`.
- O ZIP **não contém a biblioteca p5.js**, fontes, imagens ou dependências instaladas.
- Usa fontes do sistema, com alternativas locais, sem importar arquivos de fonte.
- Não utiliza `textToPoints`, `textToContours` ou outros métodos de consulta de geometria de fonte.
- A imagem do canvas é construída com caracteres, vazios, ecos e sobreposições. As bordas da interface apenas organizam os controles.
- Preâmbulo YAML com as tags **AI** e **ChatGPT** e a coleção **artefato da semana/7**.
- Concepção fornecida pelo participante; implementação realizada com auxílio de **ChatGPT**.
- Referências técnicas: [p5.js — createCanvas](https://p5js.org/reference/p5/createCanvas/), [text](https://p5js.org/reference/p5/text/), [textFont](https://p5js.org/reference/p5/textFont/).
