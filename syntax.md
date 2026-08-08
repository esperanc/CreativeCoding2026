# Referência da linguagem SlideDown

Fonte: https://github.com/esperanc/SlideDown (README do projeto). Consulte este
arquivo sempre que tiver dúvida sobre sintaxe exata.

## Estrutura básica

Slides são separados por `---` — **exatamente três traços**, sozinhos numa
linha (espaços à direita são tolerados). `----` ou mais traços é uma regra
horizontal comum de markdown, não separador de slide.

```
# Slide 1
Conteúdo...

---

# Slide 2
Conteúdo...
```

## Blocos de layout (`:::`)

Blocos abrem e fecham com `:::`. Os principais são `row`, `col` (ou
`column`), `center` e `reveal`.

**Duas colunas:**
```
::: row
::: col
# Coluna esquerda
Conteúdo
:::
::: col
# Coluna direita
Conteúdo
:::
:::
```

**Proporções customizadas** — `ratio=XX%` ou apenas `XX%` como valor solto,
aplicável a `col` (largura) ou a linhas (altura):
```
::: row
::: col ratio=30%
Estreita (30%)
:::
::: col ratio=70%
Larga (70%)
:::
:::
```
(O framework já compensa o espaçamento de 2% entre colunas, então as
proporções batem certinho.)

**Centralizar conteúdo:**
```
::: center
# Título centralizado
:::
```

**Scrollytelling (`reveal`)** — itens de uma lista aparecem um a um ao rolar
a página:
```
::: reveal
- Aparece primeiro
- Depois este
- Por último este
:::
```

Pode-se combinar `reveal` com colunas, mantendo uma fixa e revelando a outra:
```
::: row
::: col
# Conteúdo fixo
Fica visível o tempo todo.
:::
::: col reveal
- Ponto 1
- Ponto 2
- Ponto 3
:::
:::
```
E combinar `ratio` com `reveal`:
```
::: row
::: col ratio=40%
:: image src=diagrama.png width=100%
:::
::: col ratio=60% reveal
- Primeiro ponto
- Segundo ponto
:::
:::
```

> Nota de compatibilidade: exemplos vistos em decks reais (ex.: cursos do
> autor) às vezes usam `::: col` diretamente, sem envolver em `::: row`. O
> parser tolera isso, mas o padrão recomendado no README é sempre envolver
> `col` dentro de `row`. Ao gerar conteúdo novo, prefira `row` explícito;
> só omita se estiver seguindo o estilo de um arquivo existente do usuário.

## Componentes (`::`)

Componentes usam `::` (dois-pontos, não três) e atributos `chave=valor`
(sem espaço) ou `chave="valor com espaço"`.

**Imagem** — `:: image` ou `:: img`. Suporta `src`, `width`, `height`,
`style`. Todas as imagens têm zoom automático ao clicar.
```
:: image src=minha-imagem.png width=500
:: img src="imagem com espaços.png" alt="Descrição" width=100% height=300px
:: image src=foto.jpg style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1)"
```
Dicas de dimensionamento:
- `width=100%` preenche o container — combina bem com `ratio` de coluna.
- Valores em pixel (`width=400`) para tamanho fixo.

**YouTube:**
```
:: youtube id=dQw4w9WgXcQ
```

**Iframe:**
```
:: iframe src="https://example.com"
```

## Código

Fences padrão de markdown, com highlight automático:
````
```python
def hello():
    print("Hello World!")
```
````

## Matemática (KaTeX)

Inline: `$E = mc^2$`

Bloco:
```
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

## Estrutura do repositório de conteúdo

```
repo/
├── index.json                     <- registro de todas as apresentações
├── 1 - Introdução/
│   ├── slides.md
│   └── (assets: png, svg, jpg, etc.)
├── 2 - Nome do Tópico/
│   ├── slides.md
│   └── ...
```

`index.json` tem o formato:
```json
{
  "title": "Título do curso",
  "subtitle": "Apresentações disponíveis:",
  "presentations": [
    { "folder": "1 - Introdução", "title": "Introdução" },
    { "folder": "2 - Nome do Tópico", "title": "Nome do Tópico" }
  ]
}
```
A ordem no array reflete a ordem de exibição. O nome da pasta costuma seguir
o padrão `"N - Título Curto"`, com N = número sequencial do módulo/aula.
