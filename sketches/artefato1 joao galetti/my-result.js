N_ROWS = 10
N_COLUMNS = 15

SQUARE_SIZE = 30

WIDTH_BORDER = 40
HEIGHT_BORDER = 20

function setup() {
  canvasWidth = SQUARE_SIZE * N_COLUMNS + WIDTH_BORDER * 2
  canvasHeight = SQUARE_SIZE * N_ROWS + HEIGHT_BORDER * 2
  createCanvas(canvasWidth, canvasHeight);
}

function draw() {
  background(220);

  squareHalf = SQUARE_SIZE / 2

  for (i = 0; i < N_ROWS; i++) {
    for (j = 0; j < N_COLUMNS; j++) {
      if (i % 2 === 0) {
        startClosed = 0
      } else {
        startClosed = 1
      }

      quad(
        WIDTH_BORDER + SQUARE_SIZE * j, HEIGHT_BORDER + SQUARE_SIZE * i + squareHalf,
        WIDTH_BORDER + SQUARE_SIZE * j + squareHalf, HEIGHT_BORDER + SQUARE_SIZE * i + ((frameCount / 4 + startClosed * squareHalf) % SQUARE_SIZE),
        WIDTH_BORDER + SQUARE_SIZE * (j + 1), HEIGHT_BORDER + SQUARE_SIZE * i + squareHalf,
        WIDTH_BORDER + SQUARE_SIZE * j + squareHalf, HEIGHT_BORDER + SQUARE_SIZE * (i + 1) - ((frameCount / 4 + startClosed * squareHalf) % SQUARE_SIZE)
      )
    }
  }
}
