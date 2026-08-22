# -*- coding: utf-8 -*-
"""Monta, para cada exemplo, o sketch completo = pre + trecho do slide + post.
O trecho vem literalmente do slides.md, então código, imagem e link nunca divergem.

  AULA="4 - ..." python3 ferramentas/gerar.py
"""
import re, os, sys, importlib.util

BUILD = os.path.dirname(os.path.abspath(__file__))
AULA = os.environ.get("AULA", "3 - Posição, Direção e Tamanho")
SLIDES = os.path.join(os.path.dirname(BUILD), AULA)
CONF = os.path.join(BUILD, "aulas", AULA)
GEN = os.path.join(BUILD, "gen", AULA)   # sketches gerados (não versionados)
os.makedirs(GEN, exist_ok=True)

def carrega_manifesto():
    p = os.path.join(CONF, "manifesto.py")
    if not os.path.exists(p):
        print("sem manifesto para", AULA); return {}
    spec = importlib.util.spec_from_file_location("manifesto_" + str(abs(hash(AULA))), p)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.M

def trechos_por_imagem(md):
    """{nome_da_imagem: (titulo, [blocos de codigo])} para cada slide."""
    out = {}
    for sl in md.split("\n---\n"):
        img = re.search(r'::img src="([^"]+)\.png"', sl)
        cod = re.findall(r"```js\n(.*?)```", sl, re.S)
        if not img or not cod: continue
        tit = (re.search(r"^# (.*)", sl, re.M) or ["", "?"])[1]
        out[img.group(1)] = (tit, [c.rstrip("\n") for c in cod])
    return out

def indenta(txt, n):
    ind = " " * n
    return "\n".join((ind + l if l.strip() else "") for l in txt.split("\n"))

def monta(cfg, trecho, mapa):
    pre = cfg["pre"].replace("{w}", str(cfg["w"])).replace("{h}", str(cfg["h"]))
    # {frag:nome} traz, literalmente, o trecho de outro slide — assim um passo
    # da construção não pode divergir do passo anterior.
    for outro in re.findall(r"\{frag:([^}]+)\}", pre):
        if outro not in mapa:
            raise SystemExit("{frag:%s}: slide não encontrado" % outro)
        pre = pre.replace("{frag:%s}" % outro,
                          indenta(mapa[outro][1][0], cfg["indent"]))
    return pre + indenta(trecho, cfg["indent"]) + "\n" + cfg["post"]

def main():
    M = carrega_manifesto()
    md = open(os.path.join(SLIDES, "slides.md"), encoding="utf-8").read()
    mapa = trechos_por_imagem(md)
    feitos = []
    for nome, cfg in M.items():
        if nome not in mapa:
            print("  ! slide não encontrado para", nome); continue
        src = monta(cfg, mapa[nome][1][cfg["frag"]], mapa)
        open(os.path.join(GEN, nome + ".js"), "w", encoding="utf-8").write(
            "// canvas %d %d\n" % (cfg["w"], cfg["h"]) + src)
        feitos.append(nome)

    # derivados: variantes de um sketch já gerado (ex.: o mesmo código sem push/pop)
    der = os.path.join(CONF, "derivados.py")
    if os.path.exists(der):
        spec = importlib.util.spec_from_file_location("derivados", der)
        mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
        feitos += mod.gerar(GEN)

    # sketches escritos à mão (não derivam de um único trecho do slide)
    MAN = os.path.join(CONF, "manuais")
    if os.path.isdir(MAN):
        for f in sorted(os.listdir(MAN)):
            if f.endswith(".js"):
                open(os.path.join(GEN, f), "w", encoding="utf-8").write(
                    open(os.path.join(MAN, f), encoding="utf-8").read())
                feitos.append(f[:-3])

    print("sketches gerados: %d  (%s)" % (len(feitos), AULA))
    return feitos

if __name__ == "__main__":
    main()
