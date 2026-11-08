
let shape;
let earthTexture;

let rotationAngle = 0;
let rotationSpeed = 0.002;

let earthRadius = 1;

let stains = [];
let meteor = null;

let options = {
  fileType: '.obj',
  normalize: true,
  successCallback: handleModel,
  failureCallback: handleError
};

async function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  document.body.style.margin = "0";
  document.body.style.backgroundImage = 'url("starfield.jpg")';
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundRepeat = "no-repeat";
  document.body.style.backgroundAttachment = "fixed";

  earthTexture = await loadImage('Textures/Diffuse_2K.png');
  await loadModel('Earth_Surface.obj', options);

  describe('Interactive Earth with meteor impacts.');
}

function draw() {
  clear();

  rotationAngle += rotationSpeed;

  ambientLight(30);
  directionalLight(255, 255, 255, 0.5, 0.5, -1);
  orbitControl();

  if (!shape || !earthTexture) return;

  // Draw Earth and its permanent impact marks.
  push();

  rotateY(rotationAngle);
  scale(1, -1, 1);

  noStroke();
  fill(255);
  textureMode(NORMAL);
  texture(earthTexture);

  model(shape);

  // Draw all previous impact stains.
  noLights();
  fill(35, 20, 15);

  for (let stain of stains) {
    push();
    translate(
      stain.x * (earthRadius + 0.5) / earthRadius,
      stain.y * (earthRadius + 0.5) / earthRadius,
      stain.z * (earthRadius + 0.5) / earthRadius
    );
    sphere(earthRadius * 0.25);
    pop();
  }

  pop();

  // Animate the meteor outside the Earth transform.
  if (meteor) {
    drawMeteor();
  }
}

// Convert a point in the Earth's local coordinates
// into its current position in the scene.
function localToWorld(point) {
  let x = point.x;
  let y = -point.y;
  let z = point.z;

  let c = cos(rotationAngle);
  let s = sin(rotationAngle);

  return createVector(
    x * c + z * s,
    y,
    -x * s + z * c
  );
}

// Convert a clicked screen position into a point
// on an approximate spherical Earth.
function getSurfacePoint(mx, my) {
  let fov = PI / 3;
  let cameraZ = (height / 2) / tan(fov / 2);

  let ray = createVector(
    (mx - width / 2) / (height / 2) * tan(fov / 2),
    (my - height / 2) / (height / 2) * tan(fov / 2),
    -1
  );

  ray.normalize();

  let origin = createVector(0, 0, cameraZ);

  let b = 2 * origin.dot(ray);
  let c = origin.dot(origin) - earthRadius * earthRadius;
  let discriminant = b * b - 4 * c;

  if (discriminant < 0) return null;

  let distance = (-b - sqrt(discriminant)) / 2;

  if (distance < 0) return null;

  let worldPoint = p5.Vector.add(
    origin,
    p5.Vector.mult(ray, distance)
  );

  // Undo the Earth's current rotation.
  let angle = -rotationAngle;
  let x = worldPoint.x * cos(angle) + worldPoint.z * sin(angle);
  let z = -worldPoint.x * sin(angle) + worldPoint.z * cos(angle);

  // Undo the vertical flip used when drawing the OBJ.
  return createVector(x, -worldPoint.y, z).normalize();
}

function mousePressed() {
  if (!shape || meteor) return;

  let point = getSurfacePoint(mouseX, mouseY);

  if (!point) return;

  // Start the meteor outside the selected location.
  meteor = {
    point: point,
    progress: 0
  };
}

function drawMeteor() {
  let point = meteor.point;

  // Get the current world position of the impact site.
  let impactPosition = localToWorld(
    p5.Vector.mult(point, earthRadius)
  );

  let direction = localToWorld(point);
  direction.normalize();

  meteor.progress += 0.025;

  let t = constrain(meteor.progress, 0, 1);
  let eased = 1 - pow(1 - t, 3);

  let distance = earthRadius * 3 * (1 - eased);

  let meteorPosition = p5.Vector.add(
    impactPosition,
    p5.Vector.mult(direction, distance)
  );

  push();

  noLights();

  // Meteor trail.
  stroke(255, 110, 30, 180);
  strokeWeight(3);

  let tail = p5.Vector.add(
    meteorPosition,
    p5.Vector.mult(direction, earthRadius * 0.4)
  );

  line(
    meteorPosition.x,
    meteorPosition.y,
    meteorPosition.z,
    tail.x,
    tail.y,
    tail.z
  );

  // Meteor body.
  noStroke();
  fill(255, 120, 35);
  translate(
    meteorPosition.x,
    meteorPosition.y,
    meteorPosition.z
  );

  sphere(earthRadius * 0.025);

  pop();

  // Impact!
  if (meteor.progress >= 1) {
    stains.push(point.copy());
    meteor = null;
  }
}

function handleModel(data) {
  shape = data;

  // Estimate the radius from the loaded geometry.
  earthRadius = 0;

  for (let vertex of shape.vertices) {
    earthRadius = max(earthRadius, vertex.mag());
  }

  console.log("Earth loaded");
  console.log("Estimated radius:", earthRadius);
}

function handleError(error) {
  console.error("Model loading error:", error);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
