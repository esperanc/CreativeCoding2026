# -*- coding: utf-8 -*-
"""Monta, para cada exemplo, o sketch completo = pre + trecho do slide + post.
O trecho vem literalmente do slides.md, então código, imagem e link nunca divergem."""
import re, os, sys, subprocess, json

BUILD = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BUILD)
from manifesto import M

AULA = os.environ.get("AULA", "3 - Posição, Direção e Tamanho")
SLIDES = os.path.join(os.path.dirname(BUILD), AULA)
GEN = os.path.join(BUILD, "gen")  # sketches gerados (não versionados)
os.makedirs(GEN, exist_ok=True)

def trechos_por_imagem(md):
    """Devolve {nome_da_imagem: (titulo, [blocos de codigo])} para cada slide."""
    out = {}
    for sl in md.split("\n---\n"):
        img = re.search(r'::img src="([^"]+)\.png"', sl)
        cod = re.findall(r"```js\n(.*?)```", sl, re.S)
        if not img or not cod: continue
        tit = (re.search(r"^# (.*)", sl, re.M) or ["", "?"])[1]
        out[img.group(1)] = (tit, [c.rstrip("\n") for c in cod])
    return out

def monta(nome, trecho):
    cfg = M[nome]
    ind = " " * cfg["indent"]
    corpo = "\n".join((ind + l if l.strip() else "") for l in trecho.split("\n"))
    pre = cfg["pre"].replace("{w}", str(cfg["w"])).replace("{h}", str(cfg["h"]))
    return pre + corpo + "\n" + cfg["post"]

def main():
    md = open(os.path.join(SLIDES, "slides.md"), encoding="utf-8").read()
    mapa = trechos_por_imagem(md)
    feitos = []
    for nome, cfg in M.items():
        if nome not in mapa:
            print("  ! slide não encontrado para", nome); continue
        tit, blocos = mapa[nome]
        src = monta(nome, blocos[cfg["frag"]])
        cab = "// canvas %d %d\n" % (cfg["w"], cfg["h"])
        open(os.path.join(GEN, nome + ".js"), "w", encoding="utf-8").write(cab + src)
        feitos.append(nome)
    # pushpop_sem: o MESMO sketch da grade, sem push()/pop()
    g = os.path.join(GEN, "pushpop_grade.js")
    if os.path.exists(g):
        src = open(g, encoding="utf-8").read()
        sem = [l for l in src.split("\n") if not re.match(r"\s*(push|pop)\(\);", l)]
        out = "\n".join(sem).replace(
            "function setup() {",
            "// O MESMO codigo da grade, sem push() e pop():\n"
            "// as transformacoes se acumulam e o desenho foge do canvas.\n"
            "function setup() {")
        open(os.path.join(GEN, "pushpop_sem.js"), "w", encoding="utf-8").write(out)
        feitos.append("pushpop_sem")

    # sketches escritos a mao (nao derivam de um unico trecho do slide)
    MAN = os.path.join(BUILD, "manuais")
    if os.path.isdir(MAN):
        for f in sorted(os.listdir(MAN)):
            if f.endswith(".js"):
                open(os.path.join(GEN, f), "w", encoding="utf-8").write(
                    open(os.path.join(MAN, f), encoding="utf-8").read())
                feitos.append(f[:-3])

    print("sketches gerados:", len(feitos))
    return feitos

if __name__ == "__main__":
    main()
