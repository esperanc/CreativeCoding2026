class Cluster {
  constructor(centerX, centerY, limit, radius) {
    this.centerX = centerX;
    this.centerY = centerY;

    this.x = centerX;
    this.y = centerY;

    this.limit = limit;
    this.tries = 0;

    this.radius = radius;
    this.step = 4;

    this.shade = random(colors);
  }

  stepForward() {
    if (this.ended()) {
      return;
    }

    const [dx, dy] = random(DIRECTIONS);

    const nextX = this.x + dx * this.step;
    const nextY = this.y + dy * this.step;

    if (
      nextX >= 0 &&
      nextX < width &&
      nextY >= 0 &&
      nextY < height &&
      dist(
        nextX,
        nextY,
        this.centerX,
        this.centerY
      ) <= this.radius
    ) {
      this.x = nextX;
      this.y = nextY;

      noStroke();
      fill(this.shade);
      circle(this.x, this.y, LAND_DIAMETER);

      landPoints.push({
        x: this.x,
        y: this.y
      });
    }

    this.tries++;
  }

  ended() {
    return this.tries >= this.limit;
  }
}