const CAM = {
  distInicial: 3.2,   
  distMin: 1.6,       
  distMax: 8,         
  atrito: 0.92,
  sensibilidade: 0.005, 
  zoomPasso: 0.003,    
};

function limitarDistancia(d, min, max) {
  return Math.min(max, Math.max(min, d));
}

function limitarPhi(phi) {
  return Math.min(Math.PI - 0.15, Math.max(0.15, phi));
}

function aplicarInercia(vel, atrito) {
  const v = vel * atrito;
  return Math.abs(v) < 1e-4 ? 0 : v;
}

if (typeof module !== 'undefined') {
  module.exports = { limitarDistancia, limitarPhi, aplicarInercia };
}

if (typeof window !== 'undefined') {
  window.cam = { theta: 0.6, phi: 1.2, dist: 0, velTheta: 0, velPhi: 0 };

  window.iniciarCamera = function () {
    cam.dist = RAIO * CAM.distInicial;
    ajustarPerspectiva();
  };

  window.ajustarPerspectiva = function () {
    perspective(Math.PI / 3, width / height, RAIO * 0.05, RAIO * 100);
  };

  window.atualizarCamera = function () {
    cam.theta += cam.velTheta;
    cam.phi = limitarPhi(cam.phi + cam.velPhi);
    cam.velTheta = aplicarInercia(cam.velTheta, CAM.atrito);
    cam.velPhi = aplicarInercia(cam.velPhi, CAM.atrito);
    const p = pontoNaEsfera(cam.theta, cam.phi, cam.dist);
    camera(p[0], p[1], p[2], 0, 0, 0, 0, 1, 0);
  };

  const noCanvas = (e) => e && e.target && e.target.tagName === 'CANVAS';

  window.mouseDragged = function (e) {
    if (!noCanvas(e)) return;
    cam.velTheta = movedX * CAM.sensibilidade;
    cam.velPhi = movedY * CAM.sensibilidade;
  };

  window.mouseWheel = function (e) {
    if (!noCanvas(e)) return;
    cam.dist = limitarDistancia(
      cam.dist * (1 + e.delta * CAM.zoomPasso),
      RAIO * CAM.distMin,
      RAIO * CAM.distMax
    );
    return false; 
  };
}
