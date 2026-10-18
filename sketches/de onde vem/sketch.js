let img;

async function setup() {
  createCanvas(600, 600);
  background(240); 
  noStroke();
  
  // O carregamento agora é feito no setup usando await
  img = await loadImage('https://picsum.photos/600/600');
  
  // Carrega os dados de cor da imagem para a memória após ela ser baixada
  img.loadPixels();
}

function draw() {
  // Evita erro no console enquanto a imagem ainda está sendo baixada
  if (!img || !img.pixels || img.pixels.length === 0) return;

  // Desenha 150 círculos por frame para o mosaico surgir gradativamente
  for (let i = 0; i < 150; i++) {
    let x = floor(random(img.width));
    let y = floor(random(img.height));

    // Calcula a posição do pixel no array (formato RGBA)
    let index = (x + y * img.width) * 4;

    let r = img.pixels[index];
    let g = img.pixels[index + 1];
    let b = img.pixels[index + 2];

    // Calcula o brilho do pixel
    let brightness = (r + g + b) / 3;
    
    // Pixels escuros geram círculos maiores; pixels claros, menores
    let radius = map(brightness, 0, 255, 15, 2);

    // Preenche com a cor original do pixel e uma leve transparência
    fill(r, g, b, 190);
    circle(x, y, radius);
  }
}