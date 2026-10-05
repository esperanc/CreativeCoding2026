function createFruits() {
  return {
    avocado: {
      text: "ABACATE",
      color: "#568203",
      ripeColor: "#666600",
      background: "#CCFFCC",
      texture: createGraphics(0, 0),
      draw: drawAvocado
    },
    
    apple: {
      text: "MAÇÃ",
      color: "#D32213",
      ripeColor: "#46462C",
      background: "#B06054",
      texture: createGraphics(0, 0),
      draw: drawApple
    },
    
    banana: {
      text: "BANANA",
      color: "#FFE55C",
      ripeColor: "#2F2600",
      background:"#554C1F",
      texture: createGraphics(0, 0),
      draw: drawBanana
    },
    
    pear: {
      text: "PERA",
      color: "#8AAE2C",
      ripeColor: "#615E3F",
      background: "#252E0C",
      texture: createGraphics(0, 0),
      draw: drawPear
    },
    
    orange: {
      text: "LARANJA",
      color: "#EF9D10",
      ripeColor: "#392500",
      background: "#FF5C00",
      texture: createGraphics(0, 0),
      draw: drawOrange
    },
    
    guava: {
      text: "GOIABA",
      color: "#F18CA0",
      ripeColor: "#7b3e3c",
      background:"#71424B",
      texture: createGraphics(0, 0),
      draw: drawGuava
    }
  }
}
