class GuiBlock {
  static labelWidth = "5em";
  static font = '15px "Helvetica Neue", Helvetica, Arial, sans-serif';
  
  constructor (label="") {
    this.label = label;
    this.div = createDiv(label);
    if (label != "") {
      createElement("br").parent(this.div)
    }
    this.div.style("background", "lightgray")
    this.div.style("font", GuiBlock.font)
    this.div.style("padding", "10px")
    this.y = label=="" ? 5 : 10;
    this.elems = {};
    this.data = {}
    this.setters = {}
    this.position(10,10)
    this.changeFunc = null
    const preventCall = (e) => e.stopPropagation();
    for (let evclass of ['mousedown', 'mousemove'] )
      this.div.elt.addEventListener(evclass, preventCall);
    return new Proxy(this, {
        get(target, prop, receiver) {
          if (prop in target) return target[prop];
          return target.data[prop];
        }
      })
  }
  
   
  setValue(attr,value) {
    this.setters[attr](value)
  }

  change(func) {
    this.changeFunc = func
  }
  
  position(x=0,y=0) {
    this.div.position(x,y);
  }

  _addElement (name,element,valueFun=el => el.value(), display=true){
    this.data[name] = valueFun(element)
    let label = createSpan(name.replaceAll("_"," "))
    this.elems[name+"label"] = label;
    label.style("min-width",GuiBlock.labelWidth)
    label.style("display",'inline-block')
    label.parent(this.div)
    this.elems[name]=element
    element.parent(this.div)
    let disp;
    if (display) {
      disp=createSpan(` ${valueFun(element)}`)
      this.elems[name+"disp"]=disp
      disp.parent(self.div)
    }
    const update = (el) => {
      this.data[name]=valueFun(element);
      if (display) disp.html(valueFun(element))
      if (this.changeFunc) this.changeFunc()
    }
    const setter = (value) => {
      this.data[name]=value
      this.element.value(value)
      if (display) disp.html(valueFun(element))
    }
    this.setters[name]=setter;
    element.elt.oninput = update;
    element.changed(update)
    createElement("br").parent(this.div)
  }

  addText(name,value="") {
    const input = createInput(value)
    this._addElement(name,input,el => el.value(),false)
  }
  
  addColor(name,value="#ffffff") {
    const picker=createColorPicker(value)
    this._addElement(name,picker)
  }

  addCheckbox(name,value=false) {
    const cb=createElement("input")
    cb.attribute("type","checkbox")
    if (value) cb.elt.checked = true;
    const valueFun =  el => el.elt.checked
    this._addElement(name,cb,valueFun,false)
  }
    
  addNumber(name,min=0,max=100,value=0,step=1) {
    const slider=createSlider(min,max,value,step)
    this._addElement(name,slider)
  }
  
  addSelect(name,options,value) {
    const sel = createSelect()
    for (let option of options) sel.option(option)
    sel.selected(value)
    const valueFun = el => el.selected()
    this._addElement(name,sel,valueFun,false)
  }
}