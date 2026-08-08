let hershey;

//
// Reads the hershey font catalog
// 
async function loadHershey () {
  hershey =  await loadJSON('./hersheytext.min.json');
}


//
// Loads one of the Hershey fonts. 
// For a complete list, use hershey.keys()
//
class HersheyFont {
  
  constructor (fontName, pace=0) {
    let data = hershey[fontName]
    Object.assign (this, {
      name: data[name],
      pace,
      chars:new Map()
    })
    let charCode = 33;
    for (let datum of data["chars"]) {
      let geom = []
      const chr = String.fromCharCode(charCode)
      for (let cmd of datum["d"].split(" ")) {
        if (cmd.length==0) continue;
        if (cmd[0] == "M") {
          geom.push([]);
          cmd = cmd.slice(1)
        } else if (cmd[0] =="L") {
          cmd = cmd.slice(1)
        }
        let [x,y] = cmd.split(",").map(d=>parseInt(d))

        geom.at(-1).push([x,y])
      }
      
      charCode++;
      this.chars.set(chr, {width:datum["o"],strokes:geom})
    }
  }
  
  charStrokes (ch, x0 = 0, y0 = 0) {
    let strokes = []
    for (let strk of this.chars.get(ch).strokes) {
      let s = [] 
      for (let [x,y] of strk) {
        s.push ([x+x0, y+y0])
      }
      strokes.push (s)
    }
    return strokes
  }

  textStrokes (text, x0 = 0, y0 = 0) {
    let strokes = [];
    for (let ch of text) {
      if (this.chars.has(ch)) {
        for (let s of this.charStrokes (ch, x0, y0)) strokes.push(s)
        x0 += this.chars.get(ch).width*2 + this.pace;
      }
      else x0 += 10;
    }
    return strokes
  }
  
  
  textBox(text) {
    let trange = [[0,0],[0,0]]
    for (let s of this.textStrokes(text)) {
      for (let coords of s) {
        for (let i in [0,1]) {
          trange[i][0] = min(trange[i][0],coords[i])
          trange[i][1] = max(trange[i][1],coords[i])
        }
      }
    }
    return trange
  }
}
