---
title: Arqueologia do Cursor
tags: [AI, ChatGPT, WEBGL, modelagem 3D, p5.Geometry, gesto]
collection: artefato da semana/10
---

# Arqueologia do Cursor

**Autor:** Arthur Ramos  
**Tecnologia:** p5.js 2.2.3 em modo WEBGL  
**Auxílio de IA:** ChatGPT

## Descrição

`Arqueologia do Cursor` trata o movimento do mouse como um vestígio que pode ser escavado e preservado. Um traço que normalmente desapareceria assim que o usuário soltasse o botão é transformado em uma escultura tridimensional fechada, iluminada e observada como um objeto de museu.

O sketch começa com um gesto produzido pelo próprio programa. Ao pressionar `D` ou clicar em **DESENHAR NOVO GESTO**, o usuário pode registrar outro movimento. A velocidade do cursor altera a largura da fita: movimentos lentos deixam marcas mais espessas, enquanto movimentos rápidos criam partes mais finas. Essa informação também desloca o traço no eixo `z`, fazendo o gesto abandonar o plano e ocupar o espaço.

## Como a malha é construída

O trabalho não carrega nenhum modelo pronto. O código cria diretamente um `p5.Geometry`:

1. Cada amostra do gesto recebe uma tangente e uma direção perpendicular.
2. A espessura gera os limites esquerdo e direito da fita.
3. A profundidade cria quatro vértices por amostra: frente e verso de cada limite.
4. Cada trecho é fechado com oito faces triangulares: frente, verso e duas paredes.
5. Duas tampas fecham o início e o final do gesto.
6. `computeNormals(FLAT)` calcula as normais e preserva as quinas da extrusão.

A malha também recebe coordenadas `uv`, mesmo sem usar uma textura. Quando um novo gesto é criado, `freeGeometry()` libera a geometria anterior da memória de vídeo.

O objeto é desenhado em laranja forte. Os triângulos da própria `p5.Geometry` são percorridos e enviados para `beginShape(TRIANGLES)`. A cor emissiva não depende da iluminação, por isso a forma permanece visível durante toda a rotação. Uma linha laranja-clara acompanha o centro do gesto.

## Conceitos da aula explorados

- `p5.Geometry`, `vertices`, `faces`, `uvs` e `vertexNormals`.
- Faces definidas por índices e organizadas como triângulos.
- Ordem dos vértices e orientação das faces.
- Cálculo de normais com `computeNormals(FLAT)`.
- Renderização das faces com `beginShape(TRIANGLES)`, `normal()` e `vertex()`.
- Liberação da malha anterior com `freeGeometry()`.
- Exportação da geometria com `saveObj()` e `saveStl()`.
- Material emissivo, perspectiva e `orbitControl()`.

## Como interagir

- Arraste o mouse no modo de visualização para orbitar a câmera.
- Use a roda do mouse para aproximar ou afastar.
- Pressione `D` para entrar ou sair do modo de desenho.
- No modo de desenho, arraste o mouse e solte para criar uma nova escultura.
- Pressione `R` para gerar outro gesto automaticamente.
- Pressione `M` para revelar ou esconder os triângulos da malha.
- Pressione `A` para ligar ou desligar a rotação automática.
- Pressione `Espaço` para pausar.
- Pressione `O` para exportar o modelo em OBJ.
- Pressione `T` para exportar o modelo em STL.
- Pressione `S` para salvar uma imagem do canvas.

## Requisitos técnicos

- O projeto usa p5.js **versão 2.2.3**, hospedada no CDN jsDelivr.
- A biblioteca p5.js não está incluída no ZIP.
- Não há modelos 3D, imagens, fontes ou outras bibliotecas dentro do projeto.
- O canvas é responsivo e usa `windowWidth` e `windowHeight`.
- Todos os arquivos estão diretamente na raiz do ZIP.

## Processo com IA

O ChatGPT foi usado para desenvolver, comentar e revisar o código.
