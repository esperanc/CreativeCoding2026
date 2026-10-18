
const IMAGE_SIZE = 512;
const MAX_MESSAGE_LENGTH = 256;
const MAX_KEY_LENGTH = 64;
const PBKDF2_ITERATIONS = 250000;
const MAGIC = "STG1";
const HEADER_SIZE = 36;

let canvas;
let activeScreen;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// ---------- INITIALIZATION ----------

function setup() {
  document.body.style.margin = "0";
  document.body.style.background = "#000";
  document.body.style.fontFamily = "monospace";

  canvas = createCanvas(windowWidth, windowHeight);
  canvas.style("position", "fixed");
  canvas.style("inset", "0");
  canvas.style("z-index", "0");

  noStroke();
  showHome();
}

function draw() {
  background(0);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ---------- UI HELPERS ----------

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
  activeScreen.style("background", "#000");

  const panel = createDiv();
  panel.parent(activeScreen);
  panel.style("width", "100%");
  panel.style("max-width", "480px");
  panel.style("box-sizing", "border-box");
  panel.style("padding", "28px");
  panel.style("border", "1px solid #333");
  panel.style("background", "#080808");
  panel.style("color", "#fff");

  const heading = createElement("h1", title);
  heading.parent(panel);
  heading.style("font-size", "24px");
  heading.style("letter-spacing", "4px");
  heading.style("margin", "0 0 12px 0");

  if (subtitle) {
    const description = createDiv(subtitle);
    description.parent(panel);
    description.style("color", "#999");
    description.style("font-size", "12px");
    description.style("line-height", "1.6");
    description.style("margin-bottom", "24px");
  }

  return panel;
}

function addLabel(parent, text) {
  const label = createDiv(text);
  label.parent(parent);
  label.style("display", "block");
  label.style("font-size", "12px");
  label.style("color", "#aaa");
  label.style("margin", "18px 0 8px");
  return label;
}

function addInput(parent, type, maxLength, placeholder) {
  const input = createInput("", type);
  input.parent(parent);
  input.attribute("maxlength", String(maxLength));
  input.attribute("placeholder", placeholder);
  input.style("display", "block");
  input.style("width", "100%");
  input.style("box-sizing", "border-box");
  input.style("padding", "12px");
  input.style("background", "#111");
  input.style("color", "#fff");
  input.style("border", "1px solid #444");
  input.style("border-radius", "0");
  input.style("font-family", "monospace");
  input.style("font-size", "14px");
  return input;
}

function addTextarea(parent, maxLength, placeholder) {
  const input = createElement("textarea");
  input.parent(parent);
  input.attribute("maxlength", String(maxLength));
  input.attribute("placeholder", placeholder);
  input.style("display", "block");
  input.style("width", "100%");
  input.style("min-height", "100px");
  input.style("box-sizing", "border-box");
  input.style("padding", "12px");
  input.style("background", "#111");
  input.style("color", "#fff");
  input.style("border", "1px solid #444");
  input.style("border-radius", "0");
  input.style("font-family", "monospace");
  input.style("font-size", "14px");
  input.style("resize", "vertical");
  return input;
}

function addButton(parent, label, callback, secondary = false) {
  const button = createButton(label);
  button.parent(parent);
  button.mousePressed(callback);
  button.style("display", "block");
  button.style("width", "100%");
  button.style("padding", "14px 10px");
  button.style("margin-top", "12px");
  button.style("border", secondary ? "1px solid #444" : "1px solid #fff");
  button.style("background", secondary ? "#080808" : "#fff");
  button.style("color", secondary ? "#fff" : "#000");
  button.style("font-family", "monospace");
  button.style("font-size", "12px");
  button.style("letter-spacing", "1px");
  button.style("cursor", "pointer");
  return button;
}

function addStatus(parent) {
  const status = createDiv("");
  status.parent(parent);
  status.style("margin-top", "16px");
  status.style("font-size", "12px");
  status.style("line-height", "1.6");
  status.style("color", "#aaa");
  status.style("white-space", "pre-wrap");
  status.elt.setAttribute("role", "status");
  return status;
}

function setStatus(element, message, color = "#aaa") {
  element.elt.textContent = message;
  element.style("color", color);
}

function setBusy(button, busy, label, busyLabel) {
  button.elt.disabled = busy;
  button.elt.textContent = busy ? busyLabel : label;
  button.style("opacity", busy ? "0.5" : "1");
}

// ---------- NAVIGATION ----------

function showHome() {
  const panel = createScreen(
    "STEGO",
    "IMAGE STEGANOGRAPHY // AES-256-GCM"
  );

  addButton(panel, "CODE", showCode);
  addButton(panel, "DECODE", showDecode, true);

  const footer = createDiv("512 × 512 PNG  |  LSB / RGB");
  footer.parent(panel);
  footer.style("margin-top", "24px");
  footer.style("color", "#555");
  footer.style("font-size", "10px");
  footer.style("text-align", "center");
}

function showCode() {
  const panel = createScreen(
    "CODE",
    "Encrypt a message and hide it inside a random image."
  );

  addLabel(panel, "ENCRYPTION KEY (MAX 64 CHARACTERS)");
  const keyInput = addInput(
    panel, "password", MAX_KEY_LENGTH, "Enter your secret key"
  );

  addLabel(panel, "MESSAGE (MAX 256 CHARACTERS)");
  const messageInput = addTextarea(
    panel, MAX_MESSAGE_LENGTH, "Write your secret message..."
  );

  const status = addStatus(panel);

  const encodeButton = addButton(
    panel, "ENCRYPT, HIDE & DOWNLOAD",
    async () => {
      const key = keyInput.value();
      const message = messageInput.value();

      if (!key) {
        setStatus(status, "Enter an encryption key.", "#ff7777");
        return;
      }

      if (!message) {
        setStatus(status, "Enter a message.", "#ff7777");
        return;
      }

      setBusy(
        encodeButton, true,
        "ENCRYPT, HIDE & DOWNLOAD", "PROCESSING..."
      );

      try {
        setStatus(status, "Fetching random image...");

        const img = await getRandomImage();

        setStatus(status, "Encrypting message...");

        const payload = await encryptMessage(message, key);

        setStatus(status, "Embedding encrypted data...");

        embedPayload(img, payload);

        // Download the modified image as PNG.
        img.save("stego-image.png");

        setStatus(
          status,
          "Done. Your PNG download should begin now.\nKeep your key safe!",
          "#8fda9b"
        );
      } catch (error) {
        console.error(error);
        setStatus(
          status,
          "Operation failed: " + error.message,
          "#ff7777"
        );
      } finally {
        setBusy(
          encodeButton, false,
          "ENCRYPT, HIDE & DOWNLOAD", "PROCESSING..."
        );
      }
    }
  );

  addButton(panel, "BACK", showHome, true);
}

function showDecode() {
  const panel = createScreen(
    "DECODE",
    "Upload a stego PNG and enter the original encryption key."
  );

  addLabel(panel, "STEGO IMAGE (PNG)");

  let uploadedImage = null;

  const fileInput = createFileInput(async (file) => {
    uploadedImage = null;

    if (!file || file.type !== "image") {
      setStatus(status, "Please select an image.", "#ff7777");
      return;
    }

    if (file.subtype && file.subtype.toLowerCase() !== "png") {
      setStatus(status, "Please upload a PNG image.", "#ff7777");
      return;
    }

    try {
      setStatus(status, "Loading uploaded image...");

      const img = await loadImage(file.data);

      if (!img.width || !img.height) {
        throw new Error("Invalid image dimensions.");
      }

      uploadedImage = img;

      setStatus(
        status,
        `Image loaded: ${img.width} × ${img.height}`,
        "#8fda9b"
      );
    } catch (error) {
      console.error(error);
      setStatus(status, "Could not load image.", "#ff7777");
    }
  });

  fileInput.parent(panel);
  fileInput.attribute("accept", "image/png");
  fileInput.style("display", "block");
  fileInput.style("max-width", "100%");
  fileInput.style("margin-top", "8px");
  fileInput.style("color", "#fff");
  fileInput.style("font-family", "monospace");

  addLabel(panel, "DECRYPTION KEY (MAX 64 CHARACTERS)");
  const keyInput = addInput(
    panel, "password", MAX_KEY_LENGTH, "Enter the original key"
  );

  const status = addStatus(panel);

  const output = createElement("pre");
  output.parent(panel);
  output.style("display", "none");
  output.style("white-space", "pre-wrap");
  output.style("overflow-wrap", "anywhere");
  output.style("padding", "12px");
  output.style("background", "#111");
  output.style("border", "1px solid #333");
  output.style("color", "#8fda9b");
  output.style("font-family", "monospace");
  output.style("font-size", "13px");

  const decodeButton = addButton(
    panel, "EXTRACT & DECRYPT",
    async () => {
      const key = keyInput.value();

      if (!uploadedImage) {
        setStatus(status, "Upload a PNG image first.", "#ff7777");
        return;
      }

      if (!key) {
        setStatus(status, "Enter your decryption key.", "#ff7777");
        return;
      }

      setBusy(
        decodeButton, true,
        "EXTRACT & DECRYPT", "PROCESSING..."
      );

      output.style("display", "none");

      try {
        setStatus(status, "Reading hidden data...");

        const payload = extractPayload(uploadedImage);

        setStatus(status, "Decrypting message...");

        const message = await decryptMessage(payload, key);

        // Use textContent so the message is displayed as text,
        // not interpreted as HTML.
        output.elt.textContent = message;
        output.style("display", "block");

        setStatus(status, "Message recovered successfully.", "#8fda9b");
      } catch (error) {
        console.error(error);
        setStatus(
          status,
          "Could not recover the message. Check the image and key.",
          "#ff7777"
        );
      } finally {
        setBusy(
          decodeButton, false,
          "EXTRACT & DECRYPT", "PROCESSING..."
        );
      }
    }
  );

  addButton(panel, "BACK", showHome, true);
}

// ---------- ISOLATED RANDOM IMAGE GETTER ----------

async function getRandomImage() {
  const seed =
    Date.now().toString(36) +
    Math.random().toString(36).slice(2);

  const url =
    `https://picsum.photos/seed/${seed}/${IMAGE_SIZE}/${IMAGE_SIZE}`;

  const img = await loadImage(url);

  if (!img || !img.width || !img.height) {
    throw new Error("Picsum returned an invalid image.");
  }

  if (img.width !== IMAGE_SIZE || img.height !== IMAGE_SIZE) {
    throw new Error("The downloaded image has unexpected dimensions.");
  }

  return img;
}

// ---------- CRYPTOGRAPHY ----------

function concatBytes(...arrays) {
  const totalLength = arrays.reduce(
    (sum, array) => sum + array.length, 0
  );

  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const array of arrays) {
    result.set(array, offset);
    offset += array.length;
  }

  return result;
}

async function deriveAesKey(passphrase, salt, usages) {
  if (!globalThis.crypto?.subtle) {
    throw new Error(
      "Web Crypto is unavailable. Use the HTTPS p5.js Web Editor."
    );
  }

  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256"
    },
    material,
    {
      name: "AES-GCM",
      length: 256
    },
    false,
    usages
  );
}

async function encryptMessage(message, passphrase) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveAesKey(passphrase, salt, ["encrypt"]);

  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoder.encode(message)
    )
  );

  // Header layout:
  // 4 bytes magic
  // 16 bytes salt
  // 12 bytes IV
  // 4 bytes ciphertext length (big-endian)
  // ciphertext, including the GCM authentication tag

  const magic = encoder.encode(MAGIC);
  const lengthBytes = new Uint8Array(4);

  new DataView(lengthBytes.buffer).setUint32(
    0, ciphertext.length, false
  );

  return concatBytes(magic, salt, iv, lengthBytes, ciphertext);
}

async function decryptMessage(payload, passphrase) {
  if (payload.length < HEADER_SIZE) {
    throw new Error("Payload is too short.");
  }

  const magic = decoder.decode(payload.slice(0, 4));

  if (magic !== MAGIC) {
    throw new Error("No compatible hidden message was found.");
  }

  const salt = payload.slice(4, 20);
  const iv = payload.slice(20, 32);

  const ciphertextLength = new DataView(
    payload.buffer,
    payload.byteOffset + 32,
    4
  ).getUint32(0, false);

  if (
    ciphertextLength < 16 ||
    ciphertextLength !== payload.length - HEADER_SIZE
  ) {
    throw new Error("Invalid ciphertext length.");
  }

  const ciphertext = payload.slice(HEADER_SIZE);
  const key = await deriveAesKey(passphrase, salt, ["decrypt"]);

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  return decoder.decode(plaintext);
}

// ---------- LSB STEGANOGRAPHY ----------

// Pixels are stored as RGBA.
// We modify only R, G and B, never the alpha channel.

function embedPayload(img, payload) {
  img.loadPixels();

  const pixels = img.pixels;
  const capacityBytes = Math.floor(
    (img.width * img.height * 3) / 8
  );

  if (payload.length > capacityBytes) {
    throw new Error("The message exceeds image capacity.");
  }

  let bitIndex = 0;
  const totalBits = payload.length * 8;

  for (let byteIndex = 0; byteIndex < payload.length; byteIndex++) {
    const byte = payload[byteIndex];

    for (let bit = 7; bit >= 0; bit--) {
      const channel = bitIndex % 3;
      const pixelIndex = Math.floor(bitIndex / 3);
      const pixelOffset = pixelIndex * 4 + channel;

      const bitValue = (byte >> bit) & 1;

      pixels[pixelOffset] =
        (pixels[pixelOffset] & 0xFE) | bitValue;

      bitIndex++;
    }
  }

  img.updatePixels();
}

function extractBytes(img, byteLength) {
  img.loadPixels();

  const pixels = img.pixels;
  const capacityBytes = Math.floor(
    (img.width * img.height * 3) / 8
  );

  if (
    !Number.isSafeInteger(byteLength) ||
    byteLength < 0 ||
    byteLength > capacityBytes
  ) {
    throw new Error("Invalid payload size.");
  }

  const result = new Uint8Array(byteLength);
  let bitIndex = 0;

  for (let byteIndex = 0; byteIndex < byteLength; byteIndex++) {
    let value = 0;

    for (let bit = 7; bit >= 0; bit--) {
      const channel = bitIndex % 3;
      const pixelIndex = Math.floor(bitIndex / 3);
      const pixelOffset = pixelIndex * 4 + channel;

      value |= (pixels[pixelOffset] & 1) << bit;
      bitIndex++;
    }

    result[byteIndex] = value;
  }

  return result;
}

function extractPayload(img) {
  // First extract the fixed header to discover payload length.
  const header = extractBytes(img, HEADER_SIZE);

  const magic = decoder.decode(header.slice(0, 4));

  if (magic !== MAGIC) {
    throw new Error("No compatible hidden message was found.");
  }

  const ciphertextLength = new DataView(
    header.buffer,
    header.byteOffset + 32,
    4
  ).getUint32(0, false);

  if (ciphertextLength < 16) {
    throw new Error("Invalid ciphertext length.");
  }

  const totalLength = HEADER_SIZE + ciphertextLength;

  // The extraction function also checks the image capacity.
  return extractBytes(img, totalLength);
}
