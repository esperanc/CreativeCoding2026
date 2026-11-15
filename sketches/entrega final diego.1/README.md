---
tags: [AI, Gemini, WebGL, Interativo, ArteGerativa, SinteseVetorial, ProjetoFinal]
collection: projeto final/DIEGO D ORSI DUARTE/1
---

# Sintetizador Vetorial Modular & Câmara de Interferência 3D (Entrega 1)

**Coleção:** `projeto final/[Diego D Orsi Duarte]/1`  
**Tags:** `AI`, `Gemini`, `WebGL`, `Interativo`, `ArteGerativa`, `SinteseVetorial`  
**Autor:** Diego D Orsi Duarte  

---

## 1. Visão Geral do Projeto
Este projeto desenvolve um **Sintetizador Vetorial Modular Interativo em 3D** construído com **p5.js (versão 2)** em modo **WebGL**. Inspirado em sintetizadores modulares analógicos (como sistemas Eurorack/Buchla) e osciloscópios vetoriais em modo XY, o artefato traduz relações matemáticas de frequência, amplitude e modulação de fase (FM) em esculturas luminosas tridimensionais dentro de um rack industrial iluminado.

Em vez de recorrer a formas genéricas de 3D procedural, o trabalho une **design de hardware eletromecânico** (potenciômetros rotativos, indicadores de LED, conectores *jack* sextavados e chassis de alumínio anodizado) com **síntese geométrica em tempo real** (trajetórias de Lissajous 3D moduladas por fase).

---

## 2. O que foi Implementado nesta 1ª Entrega (Semana 1)
- **Arquitetura Modular Responsiva em WebGL:** Canvas adaptativo (`windowWidth` / `windowHeight`) com escalonamento dinâmico proporcional à janela e câmera orbital interativa (`orbitControl`).
- **4 Módulos de Controle Paramétrico (`OSC_X`, `OSC_Y`, `OSC_Z`, `MOD_FM`):**
  - Cada módulo possui barra de LED pulsante sincronizada com sua frequência, escala radial, potenciômetro rotativo iluminado, indicador de multiplicador harmônico e conectores *jack*.
- **Câmara Central de Interferência 3D:**
  - Renderização em tempo real de curvas harmônicas tridimensionais com modulação cruzada de fase, interpolação cromática (ciano, magenta e âmbar) e nós energizados percorrendo a trajetória.
- **Iluminação Cênica e Materiais Avançados:**
  - Combinação de `ambientLight`, `directionalLight` e três `pointLight` dinâmicas interagindo com superfícies de `ambientMaterial`, `specularMaterial`, `shininess` e `emissiveMaterial`.
- **Controles Interativos Iniciais:**
  - **Clique do Mouse / Tecla `R`:** Sorteia um novo *patch* harmônico completo (frequências, fases, amplitudes e ângulos dos potenciômetros).
  - **Arrastar / Scroll:** Orbitar livremente e aplicar zoom no equipamento 3D.
  - **Teclas `1` a `4`:** Incrementa individualmente o multiplicador de frequência de cada um dos 4 módulos.
  - **Tecla `M`:** Alterna entre modos de visualização da câmara (ressonância dupla vs. malha simples).
  - **Tecla `Espaço`:** Congela/retoma a evolução temporal da fase para inspeção detalhada.

---

## 3. Planejamento e Evolução até a Etapa Final (3ª Entrega)

### Etapa 2 — Semana 2 (`projeto final/[Seu Nome no Classroom]/2`)
- **Sistema de Cabos Físicos Interativos (Patch Cables 3D):** Implementação de curvas catenárias tridimensionais com física simples (gravidade e balanço suave) conectando os conectores *jack* dos módulos às entradas da câmara.
- **Conexão por Clique (Seleção de Portas):** Permitir que o usuário clique em uma porta de saída e em uma porta de entrada para criar ou remover roteamentos de modulação manualmente.
- **Novos Modos de Distorção Harmônica (Wavefolder & Ring Modulator):** Adição de algoritmos de dobramento de onda e quantização espacial na câmara central, além de presets salvos via teclado.

### Etapa 3 — Semana 3 / Entrega Final (`projeto final/[Seu Nome no Classroom]/3`)
- **Síntese Sonora em Tempo Real (Web Audio API / p5.sound):** Sincronizar os parâmetros visuais dos 4 módulos (`OSC_X`, `OSC_Y`, `OSC_Z` e `MOD_FM`) com osciladores de áudio reais (síntese FM/AM), fazendo com que o usuário ouça exatamente a harmonia geométrica que está esculpindo na tela.
- **Persistência de Fósforo e Efeitos Ópticos:** Simulação de rastro luminoso na câmara vetorial e reflexos especulares aprimorados no visor.
- **Interface HUD Minimalista (Overlay 2D):** Exibição opcional (ligada/desligada por tecla) com os valores exatos de razão de frequência (ex.: `3:4:5`), taxa de modulação FM e guia rápido de atalhos.
