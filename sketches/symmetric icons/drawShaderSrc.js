let drawVS =`#version 300 es

in vec4 position;
out vec2 uv;

void main() {
	uv = position.xy;
  gl_Position = vec4(2.*uv-1., 0., 1.);
}`;

let displayFS = `#version 300 es
precision highp float;

uniform sampler2D u_texture;
uniform float u_gridSize;
uniform float u_scale;
uniform vec2 u_size;
out vec4 fragColor;

void main() {
  vec2 coords = mod((gl_FragCoord.xy - u_size/2.)/u_scale + u_gridSize/2., u_gridSize) / u_gridSize;
  //vec2 coords = mod((gl_FragCoord.xy+u_size/2.) / u_scale, vec2(u_gridSize)) / u_gridSize;
	vec4 color = texture(u_texture, coords);
	fragColor = color;
}`;

let drawFS=`#version 300 es
precision highp float;

uniform sampler2D u_texture;
uniform sampler2D u_lut;   // Floating point LUT.
uniform sampler2D u_palette;   // Color palette.
uniform float u_maxCount;
uniform float u_lutPower;
in vec2 uv;
out vec4 fragColor;

void main() {
	vec4 count = texture(u_texture, uv);
	float intensity = count.x / u_maxCount;
	float newIntensity = texture(u_lut, vec2(intensity, 0.5)).r;
	newIntensity = pow(newIntensity, u_lutPower);
	fragColor = texture(u_palette, vec2(newIntensity,0.5));
}`