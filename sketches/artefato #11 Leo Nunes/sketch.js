
let canvas;
let activeScreen;

// Tutorial content
let currentPage = 0;

// ---------- INITIALIZATION ----------

function setup() {
  document.body.style.margin = "0";
  document.body.style.background = "#000";
  document.body.style.fontFamily = "monospace";

  canvas = createCanvas(windowWidth, windowHeight, WEBGL);

  canvas.style("position", "fixed");
  canvas.style("inset", "0");
  canvas.style("z-index", "0");

  noStroke();

  showHome();
}

// ---------- 3D BACKGROUND ----------

function draw() {
  background(5);

  ambientLight(100);
  directionalLight(255, 255, 255, 0.5, 0.5, -1);
  pointLight(100, 150, 255, 200, -200, 300);

  // Rotating 3D object
  push();

  rotateY(frameCount * 0.008);
  rotateX(frameCount * 0.004);

  specularMaterial(160, 180, 220);
  shininess(40);

  torus(180, 35, 48, 24);

  pop();

  // Additional geometric element
  push();

  rotateY(-frameCount * 0.005);
  rotateX(frameCount * 0.006);

  noFill();
  stroke(100, 150, 255, 120);
  strokeWeight(1);

  sphere(230, 24, 16);

  pop();

  noStroke();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ---------- SCREEN SYSTEM ----------

function createScreen(title, subtitle = "") {

  if (activeScreen) {
    activeScreen.remove();
  }

  activeScreen = createDiv();

  activeScreen.style("position", "fixed");
  activeScreen.style("inset", "0");
  activeScreen.style("z-index", "2");

  activeScreen.style("display", "flex");
  activeScreen.style("align-items", "center");
  activeScreen.style("justify-content", "center");

  activeScreen.style("overflow-y", "auto");
  activeScreen.style("padding", "20px");
  activeScreen.style("box-sizing", "border-box");

  // Transparent black overlay
  activeScreen.style(
    "background",
    "rgba(0, 0, 0, 0.65)"
  );

  const panel = createDiv();

  panel.parent(activeScreen);

  panel.style("width", "100%");
  panel.style("max-width", "520px");
  panel.style("box-sizing", "border-box");

  panel.style("padding", "30px");
  panel.style("border", "1px solid rgba(255,255,255,0.2)");
  panel.style("background", "rgba(0,0,0,0.55)");
  panel.style("color", "#fff");

  const heading = createElement("h1", title);

  heading.parent(panel);

  heading.style("font-size", "24px");
  heading.style("letter-spacing", "3px");
  heading.style("margin", "0 0 12px 0");

  if (subtitle) {

    const description = createDiv(subtitle);

    description.parent(panel);

    description.style("color", "#aaa");
    description.style("font-size", "12px");
    description.style("line-height", "1.7");
    description.style("margin-bottom", "25px");
  }

  return panel;
}

// ---------- UI HELPERS ----------

function addButton(parent, label, callback, secondary = false) {

  const button = createButton(label);

  button.parent(parent);
  button.mousePressed(callback);

  button.style("display", "block");
  button.style("width", "100%");
  button.style("padding", "14px");
  button.style("margin-top", "12px");

  button.style(
    "border",
    secondary ? "1px solid #555" : "1px solid #fff"
  );

  button.style(
    "background",
    secondary ? "transparent" : "#fff"
  );

  button.style(
    "color",
    secondary ? "#fff" : "#000"
  );

  button.style("font-family", "monospace");
  button.style("font-size", "12px");
  button.style("cursor", "pointer");

  return button;
}

function addText(parent, content) {

  const paragraph = createDiv(content);

  paragraph.parent(parent);

  paragraph.style("color", "#ccc");
  paragraph.style("font-size", "13px");
  paragraph.style("line-height", "1.8");
  paragraph.style("margin", "20px 0");

  return paragraph;
}

// ---------- HOME ----------

function showHome() {

  const panel = createScreen(
    "OBJKT (Ainda em construção...)",
    "UM GUIA PARA SUA ARTE NO UNIVERSO DIGITAL"
  );

  addButton(
    panel,
    "O QUE É OBJKT, BLOCKCHAIN E TEZOS",
    () => showIntroduction(0)
  );

  addButton(
    panel,
    "COMO EXPOR SUA ARTE NA OBJKT",
    () => showTutorial(0)
  );

  addButton(
    panel,
    "SOBRE ESTE ARTEFATO",
    showAbout,
    true
  );

  addButton(
    panel,
    "SHOW BACKGROUND",
    showBackground,
    true
  );
}

// ---------- INTRODUCTION ----------

const introductionPages = [

  {
    title: "O QUE É OBJKT?",
    text: "Aqui você vai conhecer a OBJKT e entender como funciona uma galeria digital dedicada à arte e aos colecionáveis digitais."
  },

  {
    title: "O QUE É BLOCKCHAIN?",
    text: "Blockchain é uma tecnologia de registro digital distribuído. Ela permite registrar informações e transações de maneira verificável."
  },

  {
    title: "O QUE É TEZOS?",
    text: "Tezos é uma rede blockchain que possui seu próprio ecossistema de aplicações e ativos digitais."
  }

];

function showIntroduction(page) {

  currentPage = page;

  const content = introductionPages[page];

  const panel = createScreen(
    content.title,
    "INTRODUÇÃO // " + (page + 1) + " / " + introductionPages.length
  );

  addText(panel, content.text);

  if (page > 0) {
    addButton(
      panel,
      "BACK",
      () => showIntroduction(page - 1),
      true
    );
  }

  if (page < introductionPages.length - 1) {
    addButton(
      panel,
      "NEXT",
      () => showIntroduction(page + 1)
    );
  }

  addButton(panel, "HOME", showHome, true);
}

// ---------- TUTORIAL ----------

const tutorialPages = [

  {
    title: "01 // PREPARAÇÃO",
    text: "Prepare sua obra digital. Organize o arquivo, confira suas dimensões e escolha uma imagem de apresentação."
  },

  {
    title: "02 // ACESSO",
    text: "Acesse a plataforma OBJKT e conheça as opções disponíveis para artistas."
  },

  {
    title: "03 // CONEXÃO",
    text: "Siga as instruções da plataforma para conectar uma carteira digital compatível."
  },

  {
    title: "04 // PUBLICAÇÃO",
    text: "Preencha as informações da obra, adicione título, descrição e imagem, e configure as opções de publicação."
  },

  {
    title: "05 // EXPOSIÇÃO",
    text: "Revise as informações e publique sua obra. Depois, compartilhe o endereço da sua galeria com o público."
  }

];

function showTutorial(page) {

  currentPage = page;

  const content = tutorialPages[page];

  const panel = createScreen(
    content.title,
    "COMO EXPOR SUA ARTE // " +
    (page + 1) + " / " + tutorialPages.length
  );

  addText(panel, content.text);

  if (page > 0) {
    addButton(
      panel,
      "BACK",
      () => showTutorial(page - 1),
      true
    );
  }

  if (page < tutorialPages.length - 1) {
    addButton(
      panel,
      "NEXT",
      () => showTutorial(page + 1)
    );
  }

  addButton(panel, "HOME", showHome, true);
}

// ---------- ABOUT ----------

function showAbout() {

  const panel = createScreen(
    "SOBRE ESTE ARTEFATO",
    "UMA OBRA INTERATIVA"
  );

  addText(
    panel,
    "Este artefato é uma experiência interativa criada para apresentar conceitos relacionados à arte digital e ao universo das galerias digitais."
  );

  addText(
    panel,
    "Explore os conteúdos, navegue pelas páginas e descubra as possibilidades de exposição da sua própria arte."
  );

  addButton(panel, "HOME", showHome);
}

// ---------- BACKGROUND MODE ----------

function showBackground() {

  if (activeScreen) {
    activeScreen.remove();
  }

  activeScreen = createDiv();

  activeScreen.style("position", "fixed");
  activeScreen.style("inset", "0");
  activeScreen.style("z-index", "2");
  activeScreen.style("pointer-events", "none");

  const button = createButton("HOME");

  button.parent(activeScreen);

  button.mousePressed(showHome);

  button.style("position", "absolute");
  button.style("top", "25px");
  button.style("left", "25px");
  button.style("padding", "12px 25px");
  button.style("background", "#fff");
  button.style("color", "#000");
  button.style("border", "none");
  button.style("font-family", "monospace");
  button.style("cursor", "pointer");

  // Re-enable interaction on the button
  button.style("pointer-events", "auto");
}
