---
title: Crânio 3D
tags: [generative, AI, Gemini, 3D, Cranium, Skull]
collection: artefato da semana/9
---

# 💀 Crânio Anatômico 3D — p5.js 2.0 (WebGL)

Um estudo de modelagem procedural, iluminação tridimensional e articulação hierárquica utilizando **p5.js v2** no modo **WebGL**. Este projeto foi desenvolvido aplicando os conceitos fundamentais de computação gráfica 3D: espaço tridimensional, transformações espaciais, primitivas geométricas, câmeras, luzes e materiais.

---

## 🎯 Sobre o Sketch

O artefato consiste em um crânio humano estilizado e articulado, construído **exclusivamente a partir da composição de primitivas 3D nativas do p5.js** (`ellipsoid`, `box`, `cylinder`, `cone`, `torus` e `sphere`), sem o carregamento de malhas externas (`.obj` ou `.stl`).

### Funcionalidades Interativas

* **Controle de Câmera (`orbitControl`):** Permite girar a cena (arrastar com o botão esquerdo), aplicar zoom (scroll do mouse) e mover o foco (arrastar com o botão direito).


* **Articulação Temporomandibular (ATM):** A mandíbula abre e fecha de forma automática (via função cosseno contínua no tempo) ou manual (através de um *slider* na interface).


* **Modos de Iluminação:** Três configurações de luzes (`Estúdio`, `Dramática` e `Cripta`) que combinam `ambientLight()`, `directionalLight()` e `pointLight()` para alterar completamente a atmosfera e a percepção de volume.


* **Depuração de Malha (`normalMaterial`):** Botão dedicado para ativar o `normalMaterial()`, pintando cada face da geometria de acordo com o vetor normal da superfície — ideal para inspecionar o alinhamento das primitivas sem a interferência das luzes.



---

## 🎨 Processo Criativo e Anatômico

Transformar formas geométricas puras em uma estrutura orgânica reconhecível exigiu decompor a anatomia craniana em volumes fundamentais:

1. **Neurocrânio (Calota Craniana):** Composto pela interseção suave de elipsoides para formar o osso frontal (testa), as bossas parietais e a base occipital (nuca).
2. **Viscerocrânio (Bloco Facial e Órbitas):**
* As órbitas oculares foram emolduradas por anéis (`torus`) levemente rotacionados e escalonados para reproduzir a inclinação anatômica real.
* O arco superciliar (sobrancelha óssea), a glabela e os ossos zigomáticos (maçãs do rosto) foram esculpidos com elipsoides rotacionados nos três eixos (`rotateX`, `rotateY`, `rotateZ`).
* Os arcos zigomáticos (pontes laterais que vão da bochecha até a têmpora) foram construídos com cilindros inclinados.


3. **Abertura Piriforme (Nariz):** Modelada com um cilindro superior para o osso nasal, um cone escuro achatado para a cavidade interna e uma caixa fina central representando o septo ósseo.
4. **Arcadas Dentárias e Maxila:** Os dentes superiores e inferiores foram distribuídos ao longo de um arco trigonométrico ($\sin(\theta), \cos(\theta)$), variando sutilmente a largura e a altura das caixas (`box`) para diferenciar incisivos, caninos e molares, além de incluir bossas alveolares (raízes ósseas) na maxila.
5. **Coluna Cervical:** Adicionada na base posterior como suporte visual e estrutural, utilizando cilindros para o corpo vertebral, `torus` para os anéis e cones para os processos espinhosos.

### Iluminação e Materiais

Para evitar que as esferas e elipsoides parecessem discos planos na tela, o projeto explora três materiais distintos sobre as luzes da cena:

* **Osso (`boneMaterial`):** Cor difusa marfim/bege combinada com `specularMaterial(85)` e `shininess(18)` para simular uma superfície porosa e semi-fosca.
* **Esmalte Dental (`toothMaterial`):** Tom mais claro com alto reflexo especular (`specularMaterial(180)` e `shininess(55)`), gerando pontos de luz nítidos nos dentes.
* **Cavidades (`cavityMaterial`):** Cor escura com brilho especular zerado (`specularMaterial(0)`), criando a sensação de profundidade nas órbitas oculares, cavidade nasal e céu da boca.

---

## 🛠️ Desafios de Desenvolvimento e Soluções Técnicas

Durante o desenvolvimento iterativo do modelo, surgiram desafios clássicos de modelagem 3D por primitivas e sistemas de coordenadas que guiaram o refinamento do código:

### 1. Simetria Bilateral com `scale(-1, 1, 1)`

Em vez de duplicar código e calcular coordenadas negativas manualmente para o lado esquerdo e direito do rosto, utilizou-se um laço `for (let side of [-1, 1])` combinado com `scale(side, 1, 1)` dentro de blocos `push()` e `pop()`. Isso permitiu modelar apenas uma metade das órbitas, maçãs do rosto, ramos da mandíbula e dentes, espelhando o resultado com precisão matemática.

### 2. Vedação das Cavidades Oculares e Proporção Frontal

* **Problema inicial:** Usar esferas inteiras escuras para representar o fundo dos olhos fazia com que a parte traseira e lateral dessas esferas vazasse para fora das têmporas. Na tentativa seguinte de aumentar o osso frontal para cobri-las, o elipsoide da testa acabou engolindo as órbitas e o nariz.


* **Solução:** As esferas oculares foram substituídas por discos elipsoidais rasos no eixo $Z$ (`ellipsoid(15, 13.5, 5)`), posicionados imediatamente à frente de uma parede óssea esfenoidal sólida (`box`) e ladeados por pilares frontozigomáticos. O neurocrânio foi recuado no eixo $Z$, liberando a face frontal.

### 3. Cinemática da Mandíbula e Sistema de Coordenadas do p5.js

* **Problema inicial:** A mandíbula atravessava a linha da maxila ao fechar ou movia-se na direção errada durante a rotação.


* **Solução:**
1. **Pivô na ATM:** A origem foi transladada para a posição anatômica do côndilo mandibular (`translate(0, -4, -8)`) antes de aplicar a rotação, garantindo um arco de movimento realista.
2. **Regra da Mão Direita no WebGL:** Como no p5.js o eixo $Y$ cresce para baixo e o eixo $Z$ cresce para fora da tela (em direção ao observador), uma rotação positiva em torno do eixo $X$ (`rotateX(+)`) eleva os pontos que estão à frente do pivô ($Z > \text{pivô}_Z$). Por isso, aplicou-se **`rotateX(-jawAngle)`** (com sinal negativo) e `constrain(jawAngle, 0, 0.42)`, garantindo que a mandíbula parta do ponto exato de oclusão dental ($0\text{ rad}$, onde os dentes inferiores repousam $1.25\text{ px}$ abaixo dos superiores) e desloque-se exclusivamente para baixo ($+Y$).
