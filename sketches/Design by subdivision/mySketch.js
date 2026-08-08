/*****

This sketch is inspired by Michael Hansmeyer's work on design by subdivision, 
in particular his Extended Catmull-Clark subdivision scheme, as detailed in the article
"Design by Subdivision" (http://archive.bridgesmathart.org/2010/bridges2010-167.pdf)
presented at the Bridges 2010 conference. Only the basic features 
of this scheme were implemented, but enough to produce some interesting results.

Several other mesh operators are also implemented, including the original 
Catmull-Clark subdivision algorithm (https://en.wikipedia.org/wiki/Catmull%E2%80%93Clark_subdivision_surface), 
the Doo-Sabin subdivision algorithm (http://graphics.cs.ucdavis.edu/education/CAGDNotes/Doo-Sabin/Doo-Sabin.html), 
vertex cutting, face extrusion, face center extrusion and the dual operator.

By default, the sketch starts in demo mode, where interesting results are 
shown in rotation. Hit 'd' to toggle. 

The several operations on solids, starting from one of the 5 platonic polyhedra,
can be applied in cascade using the interface panel.

*****/

const {
	mat3,
	vec3
} = glMatrix;
const {
	GUI
} = lil;

let stack = [];
let solid, rotationAxis, rotationAngle;

let gui, control, controlBounds, pushCtrl, popCtrl,
	opCtrl, solidCtrl, biasCtrl, amountCtrl, relSizeCtrl, extCatCtrl, extraCatCtrl,
	animateCtrl, showEdgesCtrl, displayFolderCtrl, normalizeCtrl;

let demoMode = true,
	demoModeSettingsIndex = 0,
	demoModeTime = 0,
	demoModeIntervalTime = 10;

let overlayCanvas;

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);
	gui = new GUI();
	control = {
		defSolid: 'cube',
		operation: '--',
		push: doPush,
		pop: doPop,
		bias: 0,
		amount: 0.5,
		relSize: 0.5,
		wf: 0,
		we: 0,
		wp: 0,
		w1: 0,
		w2: 0,
		w3: 0,
		w4: 0,
		extraCatmull: 0,
		animate: false,
		showEdges: true,
		flatIllumination: true,
		normalizeSize: true,
	};
	controlBounds = {
		bias: [-1, 1],
		amount: [-2, 2],
		relSize: [0, 1.5],
		wf: [-5, 5],
		we: [-5, 5],
		wp: [-5, 5],
		w1: [-20, 20],
		w2: [-20, 20],
		w3: [-5, 5],
		w4: [-5, 5]
	};
	solidCtrl = gui.add(control, 'defSolid', ['tetrahedron', 'cube', 'octahedron', 'dodecahedron', 'icosahedron'])
		.name('default solid').onChange(redoOp);
	opCtrl = gui.add(control, 'operation', ['--', 'dooSabin', 'dual', 'catmull', 'extendedCatmull',
		'subdivide', 'cutCorners', 'extrudeCenters', 'extrudeFaces'
	]).onChange(redoOp);

	biasCtrl = gui.add(control, 'bias', ...controlBounds.bias, 0.01).onChange(redoOp);
	amountCtrl = gui.add(control, 'amount', ...controlBounds.amount, 0.01).onChange(redoOp);
	relSizeCtrl = gui.add(control, 'relSize', ...controlBounds.relSize, 0.01).onChange(redoOp);
	extCatCtrl = [];
	['wf', 'we', 'wp', 'w1', 'w2', 'w3', 'w4'].forEach((d, i) => {
		extCatCtrl[i] = gui.add(control, d, ...controlBounds[d], 0.01).onChange(redoOp)
	})
	extraCatCtrl = gui.add(control, 'extraCatmull', 0, 4, 1).onChange(redoOp);

	pushCtrl = gui.add(control, 'push').name("done");
	popCtrl = gui.add(control, 'pop').name("undo");
	const displayFolder = gui.addFolder("display")
	showEdgesCtrl = displayFolder.add(control, 'showEdges');
	displayFolderCtrl = displayFolder.add(control, 'flatIllumination');
	normalizeCtrl = displayFolder.add(control, 'normalizeSize');
	animateCtrl = displayFolder.add(control, 'animate');
	redoOp();
	rotationAxis = createVector(random(), random(), random()).normalize();
	rotationAngle = 0;

	// Shuffle saved settings
	shuffle(savedSettings, true);

	// Create a 2D canvas for the overlay and add it to the DOM
	overlayCanvas = createGraphics(600, 600);
	overlayCanvas.style("display", "block");
	const overlayElement = createDiv(""); // Create a wrapper for positioning
	overlayElement.elt.appendChild(overlayCanvas.elt); // Add 2D canvas to DOM
	overlayElement.style("position", "absolute");
	overlayElement.style("z-index", "100");
	overlayElement.style("top", "0");
	overlayElement.style("left", "0");
	overlayElement.style("pointer-events", "none"); // Ensure it doesn't block mouse input	
}

function keyPressed() {
	if (key == "s") savedSettings.push({
		stack: stack.map(s => s.control),
		control
	});
	else if (key == "p") print(JSON.stringify(savedSettings));
	else {
		demoMode = !demoMode;
		demoModeTime = 0;
	}
}

function initOp() {
	stack = [];
	if (solid) solid.freeGeometries();
	switch (control.defSolid) {
		case 'tetrahedron':
			solid = tetrahedron;
			break;
		case 'cube':
			solid = cube;
			break;
		case 'octahedron':
			solid = octahedron;
			break;
		case 'dodecahedron':
			solid = dodecahedron;
			break;
		case 'icosahedron':
			solid = icosahedron;
			break;
	}
	return solid;
}

function operand() {
	if (solid) solid.freeGeometries();
	if (stack.length == 0) return initOp();
	else return stack[stack.length - 1].solid;
}

function dooSabinOp() {
	solid = dooSabin(operand(), control.bias);
}

function cutCornersOp() {
	solid = cutCorners(operand(), control.amount);
}

function dualOp() {
	solid = dual(operand());
}

function catmullOp() {
	solid = subdivide(operand(), true);
}

function simpleSubdivideOp() {
	solid = subdivide(operand(), false);
}

function extrudeCentersOp() {
	solid = extrudeCenters(operand(), control.amount, control.bias);
}

function extrudeFacesOp() {
	solid = extrudeFaces(operand(), control.amount, control.relSize, control.bias);
}

function extendedCatmullOp() {
	let args = ['wf', 'we', 'wp', 'w1', 'w2', 'w3', 'w4'].map(d => control[d]);
	solid = extendedCatmull(operand(), ...args);
	for (let i = 0; i < control.extraCatmull; i++) solid = subdivide(solid, true);
}

function redoOp() {
	let show = [];
	switch (control.operation) {
		case '--':
			if (stack.length == 0) {
				initOp();
				show = [solidCtrl];
			}
			break;
		case 'dooSabin':
			dooSabinOp();
			show = [biasCtrl]
			break;
		case 'cutCorners':
			cutCornersOp();
			show = [amountCtrl]
			break;
		case 'extrudeCenters':
			extrudeCentersOp();
			show = [amountCtrl, biasCtrl];
			break;
		case 'extrudeFaces':
			extrudeFacesOp();
			show = [amountCtrl, biasCtrl, relSizeCtrl];
			break;
		case 'dual':
			dualOp();
			break;
		case 'catmull':
			catmullOp();
			break;
		case 'extendedCatmull':
			extendedCatmullOp();
			show = [...extCatCtrl, extraCatCtrl];
			break;
		case 'subdivide':
			simpleSubdivideOp();
			break;
	}
	if (stack.length > 0 || control.operation != "--") show.push(popCtrl);
	if (control.operation != "--") show.push(pushCtrl);
	for (let ctrl of [popCtrl, pushCtrl, biasCtrl, solidCtrl, amountCtrl, relSizeCtrl, ...extCatCtrl, extraCatCtrl]) {
		ctrl.show(show.includes(ctrl))
	}
	//if (control.normalizeSize) solid.normalize();
}


function doPush() {
	stack.push({
		solid,
		control: Object.assign({}, control)
	});
	control.operation = '--';
	opCtrl.updateDisplay();
	redoOp()
}

function doPop() {
	control.operation = '--';
	opCtrl.updateDisplay();
	if (stack.length > 0) {
		let top = stack.pop();
		Object.assign(control, top.control);
		solid = top.solid;
		for (let ctrl of [opCtrl, solidCtrl, biasCtrl, amountCtrl,
				relSizeCtrl, ...extCatCtrl, extraCatCtrl,
				showEdgesCtrl, displayFolderCtrl
			]) ctrl.updateDisplay();
	}
	redoOp()
}

function restoreSettings(settings) {
	stack = [];
	for (let s of settings.stack) {
		Object.assign(control, s);
		redoOp();
		doPush();
	}
	Object.assign(control, settings.control);
	redoOp();
	for (let ctrl of [opCtrl, solidCtrl, biasCtrl, amountCtrl,
			relSizeCtrl, ...extCatCtrl, extraCatCtrl,
			showEdgesCtrl, displayFolderCtrl
		]) ctrl.updateDisplay();
}

function draw() {
	background(60);
	overlayCanvas.clear();

	if (demoMode) {
		overlayCanvas.fill('white');
		overlayCanvas.text("Demo mode\n(type 'd' to toggle)", 20, 20);
		overlayCanvas.stroke('red')
		overlayCanvas.noFill();
		overlayCanvas.rect(20, 60, 200, 20);
		overlayCanvas.noStroke();
		overlayCanvas.fill('red');
		overlayCanvas.rect(20, 60, map(demoModeTime, 0, demoModeIntervalTime, 0, 200), 20);
	}

	ambientLight(128, 128, 128);
	directionalLight(200, 200, 200, 10, 10, 10);
	directionalLight(200, 200, 200, -10, -20, -30);
	// specularMaterial(color(255))
	// shininess(50)
	//metalness(10)
	orbitControl();
	let scaleFactor = min(width, height) * 0.45;
	if (control.normalizeSize) {
		scaleFactor /= solid.radius;
	}
	scale(scaleFactor);
	rotate(rotationAngle, rotationAxis);

	let edges = control.showEdges;

	let flat = control.flatIllumination;
	let geom = flat ? solid.p5FlatGeometry : solid.p5Geometry;
	noStroke();
	fill(255)
	model(geom);
	if (edges) {
		stroke('black');
		noFill()
		model(solid.p5LineGeometry)
	}

	if (control.animate) {
		let dt = deltaTime / 2000;
		let t = millis() / 2000;
		rotationAngle += dt * radians(10);
	}


	if (demoMode) {
		if (demoModeTime == 0) {
			if (savedSettings.length > 0) {
				demoModeSettingsIndex = (demoModeSettingsIndex + 1) % savedSettings.length;
				restoreSettings(savedSettings[demoModeSettingsIndex])
			} else {
				let iprop = 0;
				for (let ctrl of [biasCtrl, amountCtrl,
						relSizeCtrl, ...extCatCtrl
					]) {
					if (ctrl._hidden) continue;
					let prop = ctrl.property;
					iprop++;
					let bounds = controlBounds[prop];
					control[prop] = map(random(), 0, 1, ...bounds);
					ctrl.updateDisplay();
					redoOp()
				}
			}
		}
		demoModeTime += deltaTime / 1000;
		if (demoModeTime >= demoModeIntervalTime) demoModeTime = 0;
	}

}