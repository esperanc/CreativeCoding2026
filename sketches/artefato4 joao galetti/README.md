---
tags: [terrain, cartography, erosion]
collection: artefato da semana/4
---

# Terra Ficta

*Carta de levantamento de uma ilha que nunca existiu.*

Cada execução gera uma ilha nova e a publica no formato de uma carta náutica
gravada: costa, curvas de nível, sombreado a ponto, rios, lagos, sondagens de
profundidade, topônimos, rosa dos ventos, linhas de rumo e cartucho.

Clique para levantar outra ilha. A tecla **s** salva a carta em PNG.

---

## O que o sketch faz

O sketch não *desenha* um relevo — ele o fabrica e depois o levanta. São cinco
etapas, nessa ordem:

1. **Matéria-prima.** Um campo de ruído de Perlin de seis oitavas, com o
   domínio deformado por outro ruído, multiplicado por uma máscara de lóbulos
   sobrepostos que decide o que é terra e o que é mar. Isso dá um relevo
   plausível — e completamente inerte.

2. **Erosão fluvial.** Oitenta e cinco passos de um modelo de incisão por lei
   de potência de fluxo. A cada passo:
   - um *priority-flood* enche as depressões (o que sobra são os lagos) e
     devolve, de quebra, a ordem em que a água desce;
   - a acumulação de fluxo é calculada por escoamento multidirecional — cada
     célula reparte sua água entre todos os vizinhos mais baixos, na proporção
     do declive elevado à quarta potência;
   - o terreno é rebaixado onde passa muita água em declive forte
     (incisão ∝ √área · declive);
   - uma difusão suave arredonda as encostas, como faz o intemperismo.

   A razão entre cavar e desmoronar é o parâmetro que decide tudo: muito
   desmoronamento e a ilha vira uma duna lisa; pouco, e vira uma serra de facas.

3. **Hidrologia.** Com o relevo estabilizado, cada cabeceira é seguida célula a
   célula até o mar. O traço engrossa conforme a vazão acumulada.

4. **Gravura.** Marching squares extrai a linha de costa, as curvas de nível e
   a auréola batimétrica. O sombreado do relevo é feito a pontos distribuídos
   por *blue noise* (melhor candidato de Mitchell), com densidade proporcional
   à sombra — espalhados, nunca alinhados, como numa gravura em metal.

5. **Toponímia.** Sílabas portuguesas recombinadas dão nomes a vilas, picos e
   acidentes do litoral. Cada rótulo reserva o retângulo que ocupa; quem não
   couber sem encostar em outro simplesmente não é escrito, como faria um
   cartógrafo à mão.

**O ponto do trabalho é a etapa 2.** A rede de rios ramificada que aparece em
cada ilha não está programada em lugar nenhum: nenhuma linha do código diz
"faça uma bifurcação". A ramificação é a única forma estável do jogo entre
cavar e desmoronar — ela emerge. Ruído nenhum produz aquela forma; só a água
produz. É por isso que o cartucho diz *"os rios não foram desenhados: foram
encontrados"*.

Tudo é reprodutível: a mesma semente devolve exatamente a mesma ilha, e a
semente vem impressa no rodapé do cartucho.

---

## Inspiração

**Robert Hodgin — *Meander* (2020)**
<https://roberthodgin.com/project/meander>

**Robert Hodgin — *River Scars* (2024)**
<https://roberthodgin.com/project/river-scars>

Em *Meander*, Hodgin gera mapas históricos ficcionais de rios que nunca
existiram, simulando em Houdini a migração lateral de um curso d'água — a
erosão da margem externa, a deposição na interna, os lagos em ferradura que
sobram das curvas abandonadas. O resultado é apresentado no registro visual das
pranchas de Harold Fisk sobre o Mississippi. *River Scars* estende a ideia para
rios ramificados que cicatrizam um terreno inteiro.

**O que eu peguei dessas obras foram duas decisões, não uma técnica:**

1. *O artefato é um mapa.* Não uma imagem abstrata que lembra um mapa, mas um
   documento com a pretensão de um mapa — com escala, coordenadas, sondagens,
   nomes próprios e assinatura de quem levantou. É essa pretensão que produz o
   efeito: um mapa afirma que o lugar existe. Daí toda a camada cartográfica do
   meu sketch, que em outro contexto seria enfeite e aqui é o argumento.

2. *A beleza está no processo, não no traço.* Hodgin não desenha meandros
   bonitos; ele simula o mecanismo que produz meandros e deixa a forma
   aparecer. Foi essa inversão que me fez jogar fora a primeira versão deste
   sketch — que desenhava rios com ruído — e simular a erosão de verdade.

**E o que eu fiz diferente:** em Hodgin, o rio é o assunto e o terreno é o
palco. Aqui é o contrário — eu erodo uma ilha inteira e os rios são a
*consequência* que aparece no fim. Ele simula a migração lateral de um curso
único; eu simulo a incisão de uma bacia inteira, e por isso o que emerge é uma
rede dendrítica, não um meandro. E onde ele renderiza no estilo colorido das
pranchas de Fisk, eu gravo uma carta náutica em sépia sobre papel envelhecido.
Mesma ambição, mecanismo e registro diferentes.

**Sebastian Lague — *Coding Adventure: Hydraulic Erosion***
<https://www.youtube.com/watch?v=eaXk97ujbPQ>

Foi por aqui que entrei na ideia de erodir um mapa de alturas de ruído. Comecei
implementando exatamente o modelo do vídeo — gotas individuais que descem o
relevo carregando sedimento — e ele está no histórico deste sketch. Acabei
trocando: nessa resolução de grade, as gotas cavavam milhares de sulcos
paralelos e independentes, sem nunca integrar bacias grandes, e o resultado
parecia um terreno penteado. A lei de potência de fluxo resolve isso porque
calcula o relevo e a drenagem *juntos*, num laço de realimentação. Registro a
troca porque a pergunta do trabalho é sobre a ligação com a inspiração, e essa
ligação inclui o que não deu certo.

---

## O que veio da aula

Da aula *Imprevisibilidade e ruído*, quase tudo tem uso funcional aqui, não
decorativo:

| Conceito | Onde está |
|---|---|
| `noise()` com `noiseDetail()` | o relevo bruto, em seis oitavas |
| deformação do domínio | a costa deixa de ser uma bolha e ganha reentrâncias |
| `noiseSeed()` / `randomSeed()` | cada ilha é reprodutível pela semente |
| *blue noise* (melhor candidato de Mitchell) | o pontilhado do sombreado e a distribuição das sondagens |
| `random(array)` | as sílabas dos topônimos |
| ruído como campo de deslocamento | o meandro dado aos rios — aplicado em função da posição, para que as confluências continuem coincidindo depois de deformadas |

Da aula de posição e direção vêm as coordenadas polares da rosa dos ventos e
das linhas de rumo.

---

## Arquivos

- `sketch.js` — o sketch em p5.js, sem nenhuma biblioteca externa além do p5.
- `index.html` — executa o sketch e exibe o código-fonte.
- `thumbnail.png` — uma das cartas geradas (semente 12321).

O p5.js é carregado de um CDN; não há cópia da biblioteca neste zip.

---

Feito por **João Galetti**.
