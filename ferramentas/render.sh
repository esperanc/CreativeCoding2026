#!/bin/bash
# Renderiza cada ex/*.js como PNG na pasta dos slides.
# Primeira linha de cada .js deve ser: // canvas LARGURA ALTURA
set -u
BUILD="$(cd "$(dirname "$0")" && pwd)"
OUT="$(dirname "$BUILD")/${AULA:-3 - Posição, Direção e Tamanho}"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TMP="$BUILD/tmp"
mkdir -p "$TMP"

targets=("$@")
if [ ${#targets[@]} -eq 0 ]; then
  targets=("$BUILD"/gen/"${AULA:-3 - Posição, Direção e Tamanho}"/*.js)
fi

for f in "${targets[@]}"; do
  [ -f "$f" ] || f="$BUILD/gen/${AULA:-3 - Posição, Direção e Tamanho}/$f.js"
  name="$(basename "$f" .js)"
  dims=$(head -1 "$f" | sed -n 's|^// canvas \([0-9]*\) \([0-9]*\).*|\1 \2|p')
  if [ -z "$dims" ]; then echo "SEM DIMENSAO: $name"; continue; fi
  W=$(echo $dims | cut -d' ' -f1); H=$(echo $dims | cut -d' ' -f2)
  d="$TMP/$name"; mkdir -p "$d"
  cp "$f" "$d/sketch.js"
  cat > "$d/index.html" <<EOF
<!DOCTYPE html><html><head><meta charset="utf-8">
<script src="https://cdn.jsdelivr.net/npm/p5@2.2.3/lib/p5.js"></script>
<style>html,body{margin:0;padding:0;background:#fff}canvas{display:block}</style>
</head><body><main></main><script src="sketch.js"></script></body></html>
EOF
  # --enable-unsafe-swiftshader: WebGL por software, para os sketches WEBGL.
  # Sem ele um createCanvas(w, h, WEBGL) sai em branco. Nao afeta o 2D.
  "$CHROME" --headless --disable-gpu --enable-unsafe-swiftshader --hide-scrollbars \
    --force-device-scale-factor=2 --virtual-time-budget=6000 \
    --screenshot="$OUT/$name.png" --window-size=$W,$H \
    "file://$d/index.html" >/dev/null 2>&1
  if [ -f "$OUT/$name.png" ]; then
    echo "ok  $name.png  ($(sips -g pixelWidth -g pixelHeight "$OUT/$name.png" 2>/dev/null | tr -d '\n' | sed 's/.*pixelWidth: \([0-9]*\).*pixelHeight: \([0-9]*\)/\1x\2/'))"
  else
    echo "FALHOU $name"
  fi
done
