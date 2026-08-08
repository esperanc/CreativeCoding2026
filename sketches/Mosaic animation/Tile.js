class Tile {
	constructor (drawFunc, fillColor, transf=null, callback = null) {
		Object.assign(this,{drawFunc,fillColor, transf, callback})		
	}
	draw (t, applyClip = true) {
		push();
		if (applyClip) clip(drawLib.square);
		if (this.transf) this.transf.apply(t);
		if (this.callback) this.callback(this)
		fill(this.fillColor);
		this.drawFunc();
		pop()
	}
}

class CompositeTile {
	constructor(...tiles) {
		this.tiles = tiles;
	}
	draw(t, applyClip = true) {
		for (let tile of this.tiles) {
			tile.draw(t,applyClip)
		}
	}
}

class Rotate {
	constructor (ang) {
		this.ang = ang;
	}
	apply(t) {
		rotate(this.ang)
	}
}

class TimedRotate {
	constructor (srcAng,dstAng,aroundPoint) {
		Object.assign(this,{srcAng,dstAng,aroundPoint})
	}
	apply(t) {
		let {srcAng,dstAng,aroundPoint} =this;
		let ang = srcAng * (1-t) + dstAng*t
		translate(aroundPoint.x,aroundPoint.y)
		rotate(ang);
		translate(-aroundPoint.x,-aroundPoint.y)
	}
}

class TimedTranslate {
	constructor (src,dst) {
		Object.assign(this,{src,dst})
	}
	apply(t) {
		let v = this.src.copy().lerp(this.dst,t);
		translate(v.x,v.y)
	}
}

class OverlayTile {
	constructor (bgTile, fgTile, bgTransf = null, fgTransf=null) {
		Object.assign(this,{bgTile,fgTile, bgTransf,fgTransf})
	}
	draw(t) {
		push()
		clip(drawLib.square);
		if (this.bgTransf) this.bgTransf.apply(t)
		this.bgTile.draw(t,false)
		pop();
		push()
		clip(drawLib.square);
		if (this.fgTransf) this.fgTransf.apply(t)
		this.fgTile.draw(t,false)
		pop()
	}
}