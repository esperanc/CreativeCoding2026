---
title: Ata das Coisas que Não Houve
tags: [AI, ChatGPT, generative-art, simulation, interactive, emergence, filosofia, algorithmic-archive, self-revision]
collection: projeto final/Paulo Vitor Couto Doederlein/1
---

# Ata das Coisas que Não Houve

**Subtítulo:** uma máquina que se arrepende  
**Autor:** Paulo Vitor Couto Doederlein  
**Desenvolvido com auxílio de AI:** ChatGPT / Codex

> **Atenção:** se meu nome estiver abreviado ou grafado de outra maneira no Google Classroom, devo ajustar somente o nome na propriedade `collection` antes de enviar.

## Conceito

Este trabalho imagina um cartório impossível encarregado de registrar não apenas aquilo que aconteceu, mas também as alternativas que foram recusadas. Cada trajetória oficial produz atos numerados e cada ato contém duas direções: a versão que se tornou vigente e aquela que foi arquivada.

O arquivo, porém, não é neutro. A cada nove segundos, o sistema mede a orientação de todos os atos vigentes, descobre qual direção se tornou um hábito dominante e rasura parte desses registros. As alternativas associadas aos atos anulados voltam a circular e passam a modificar decisões futuras. A obra, portanto, não apenas gera uma imagem: ela observa seus próprios padrões, identifica quando ficou repetitiva e revisa a própria história.

O conceito cruza comportamento emergente, filosofia do contrafactual, memória institucional e a linguagem visual de documentos burocráticos. Em vez de simular uma planta, um planeta ou um fenômeno natural, o sketch encena uma instituição algorítmica capaz de arrependimento.

## Gramática visual

- **Fitas duplas em coral e âmbar:** caminhos considerados oficiais.
- **Traços ciano pontilhados:** alternativas recusadas que continuam interferindo no arquivo.
- **Pequenos quadrados numerados:** atos registrados pelo sistema.
- **Rasuras violetas:** atos contestados pelo público ou anulados pela revisão automática.
- **Linhas transversais:** marcas de autenticação inseridas nas trajetórias oficiais.
- **Grade e margens discretas:** estrutura visual de um documento em permanente elaboração.

## Entrega 1 — Fundação funcional

Esta primeira versão implementa:

- agentes oficiais e alternativas arquivadas;
- campo vetorial compartilhado criado sem `noise()`;
- influência recíproca entre caminhos oficiais, alternativas e memória;
- registro de decisões como atos numerados;
- classificação dos atos em oito direções;
- detecção periódica do comportamento dominante;
- revisão automática que rasura decisões repetidas;
- promoção de caminhos anteriormente rejeitados;
- contestação interativa de atos pelo observador;
- composição responsiva ao tamanho da janela;
- variação generativa entre execuções.

### Como interagir

- **Mover o cursor:** atua como a presença de um auditor e curva documentos próximos.
- **Clicar perto de um ato:** contesta o registro, rasura a decisão oficial e promove sua alternativa.
- **Clicar longe dos atos:** protocola uma contestação externa que perturba a memória local.
- **Espaço:** pausa ou retoma o arquivo.
- **R:** reinicia com outra configuração.
- **S:** salva o quadro atual como `thumbnail.png`.

## Evolução planejada

### Entrega 2 — Proveniência e camadas de memória

Vou acrescentar um grafo de proveniência: cada ato saberá quais decisões anteriores o influenciaram e quais alternativas surgiram de sua rasura. O campo será dividido em memória oficial e memória clandestina. Um fragment shader revelará essas camadas como marcas de pressão, apagamentos e textos parcialmente recuperados, como um documento examinado contra a luz. As revisões deixarão de considerar apenas direção e passarão a observar também genealogias excessivamente dominantes.

### Entrega 3 — Arquivo performático

A versão final terá capítulos temporais — protocolo, saturação, auditoria, rasura e reabertura — e uma paisagem sonora generativa inspirada em carimbos, máquinas de escrever e papel sendo manipulado. O som será produzido pelos acontecimentos do sistema, e não por uma música externa. A interface será refinada para permitir acompanhar a genealogia de um ato sem transformar a obra em um painel convencional.

## Técnica

O sketch usa p5.js 2 carregado por CDN. A biblioteca não está incluída no ZIP. Todas as variáveis estão declaradas e funções ou constantes do p5.js não são executadas na inicialização global. O projeto foi estruturado e testado para funcionar no p5Front.
