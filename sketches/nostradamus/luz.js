function fatorNoite(normal, sol) {
  const n = normalizar(normal), s = normalizar(sol);
  const d = n[0] * s[0] + n[1] * s[1] + n[2] * s[2];
  const t = Math.min(1, Math.max(0, (0.15 - d) / 0.3));
  return t * t * (3 - 2 * t);
}

if (typeof module !== 'undefined') {
  const { normalizar } = require('./geometria.js');
  globalThis.normalizar = normalizar;
  module.exports = { fatorNoite };
}

if (typeof window !== 'undefined') {
  window.acenderSol = function () {
    const s = normalizar(SOL);
    ambientLight(28);
    directionalLight(255, 245, 225, -s[0], -s[1], -s[2]);
  };
}
