let posX = 0;
let posZ = 400;
let yaw = -Math.PI / 2;
let pitch = 0;

const FOV_BASE = Math.PI / 3;
const FOV_MIN = Math.PI / 16;
const FOV_MAX = Math.PI / 2.4;
const FOV_ZOOM_RAPIDO = Math.PI / 13;
const PITCH_MAX = 1.25;

let fovRoda = FOV_BASE;
let fov = FOV_BASE;

function atualizarJogador() {
  const fator = fov / FOV_BASE;

  if (mouseIsPressed) {
    yaw += (mouseX - pmouseX) * SENSIBILIDADE * fator;
    pitch -= (mouseY - pmouseY) * SENSIBILIDADE * fator;
    pitch = constrain(pitch, -PITCH_MAX, PITCH_MAX);
  }

  if (keyIsDown('ArrowLeft'))  yaw -= 0.03 * fator;
  if (keyIsDown('ArrowRight')) yaw += 0.03 * fator;

  const dirX = cos(yaw);
  const dirZ = sin(yaw);
  const ladoX = -dirZ;
  const ladoZ = dirX;

  if (keyIsDown('KeyW') || keyIsDown('ArrowUp')) {
    posX += dirX * VELOCIDADE;
    posZ += dirZ * VELOCIDADE;
  }
  if (keyIsDown('KeyS') || keyIsDown('ArrowDown')) {
    posX -= dirX * VELOCIDADE;
    posZ -= dirZ * VELOCIDADE;
  }
  if (keyIsDown('KeyA')) {
    posX -= ladoX * VELOCIDADE;
    posZ -= ladoZ * VELOCIDADE;
  }
  if (keyIsDown('KeyD')) {
    posX += ladoX * VELOCIDADE;
    posZ += ladoZ * VELOCIDADE;
  }

  posX = constrain(posX, -MEIA + MARGEM, MEIA - MARGEM);
  posZ = constrain(posZ, -MEIA + MARGEM, MEIA - MARGEM);

  const fovAlvo = keyIsDown('KeyZ') ? FOV_ZOOM_RAPIDO : fovRoda;
  fov = lerp(fov, fovAlvo, 0.18);
}

function aplicarCamera() {
  const horizontal = cos(pitch);
  const dirX = cos(yaw) * horizontal;
  const dirZ = sin(yaw) * horizontal;
  const dirY = -sin(pitch);

  camera(
    posX,        ALTURA_OLHO,        posZ,
    posX + dirX, ALTURA_OLHO + dirY, posZ + dirZ,
    0, 1, 0
  );

  perspective(fov, width / height, 1, 5000);
}

function mouseWheel(evento) {
  fovRoda = constrain(fovRoda * (1 + evento.delta * 0.0012), FOV_MIN, FOV_MAX);
  return false;
}
