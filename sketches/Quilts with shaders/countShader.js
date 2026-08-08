// Maps the square [-1,1] x [-1,1] to the output
const countPointVS = `#version 300 es
in vec4 position;
out vec2 uv;
void main() {
	uv = position.xy;
	gl_Position = vec4(uv * 2. - 1., 0., 1.);
	gl_PointSize = 1.;
}
`;

// The fragment shader outputs a count of 1.0 (in the red channel).
const countPointFS = `#version 300 es
precision highp float;
out vec4 outColor;
void main() {
		outColor = vec4(1.0, 0.0, 0.0, 1.0);
}`;