# -*- coding: utf-8 -*-
import os, re

def gerar(GEN):
    """pushpop_sem: o MESMO sketch da grade, sem push()/pop()."""
    g = os.path.join(GEN, "pushpop_grade.js")
    if not os.path.exists(g): return []
    src = open(g, encoding="utf-8").read()
    sem = [l for l in src.split("\n") if not re.match(r"\s*(push|pop)\(\);", l)]
    out = "\n".join(sem).replace(
        "function setup() {",
        "// O MESMO codigo da grade, sem push() e pop():\n"
        "// as transformacoes se acumulam e o desenho foge do canvas.\n"
        "function setup() {")
    open(os.path.join(GEN, "pushpop_sem.js"), "w", encoding="utf-8").write(out)
    return ["pushpop_sem"]
