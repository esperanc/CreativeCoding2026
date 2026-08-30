---
title: Sistema Estelar Geométrico e Interativo
tags: [interactive, ai, gemini, generative, stellar system]
collection: artefato da semana/3
---

Sketch da aula 3 feito pelo Gemini e com alguns ajustes pessoais meus. 

Autor: Gabriel Rodrigues da Silva
DRE: 121044858

Conforme o enunciado, o artefato deve seguir algum tipo de especificação geométrica em termos de posição, dimensões ou inclinação / direção.

Sendo assim, para a construção desse trabalho, foram usados vários prompts, partindo de um código inicial gerado pelo Gemini 3.1 Pro.

Prompts utilizados em sequência:

1º Prompt:

```plain
Quero desenvolver um sketch para a disciplina de Programação Criativa focando em layout geométrico, restrições de posicionamento, proporções de tamanho e uso de funções trigonométricas no p5.js.
(texto até o slide 26 aqui)
(código do meu trabalho 2)
```

2º Prompt:

```plain
Esqueça o celular. Vamos focar em um céu noturno estelar com a perspectiva de um planeta central (Saturno) inclinado e com anéis, rodeado por formas geométricas variadas.

Preciso de uma especificação geométrica de posição, dimensões e direção, com coisas grandes aqui, coisas pequenas lá, proporção e uso de transformações (translate, rotate...). As estrelas do fundo devem surgir de forma sequencial ao iniciar.
```

3º Prompt:

```plain
Crie profundidade ao trabalho como se tivesse uma linha diagonal. Acima dela, apenas formas geométricas complexas grandes e abaixo dela, apenas formas pequenas, sem que nenhuma forma sobreponha a outra nem invada a área de segurança do Saturno.
```

4º Prompt:

```plain
Por fim, adicione um movimento dinâmico de 'gangorra' nos anéis de Saturno e use mousePressed para fazer a seguinte animação: se o usuário clicar em uma forma grande da metade superior esquerda, ela deve trocar de lugar com uma forma pequena da metade inferior direita, fazendo a pequena subir e ocupar o lugar da grande.
```
