const tfVS = `#version 300 es
uniform float a;
uniform float b;
uniform float c;
uniform float d;
uniform float k;

in vec2 oldPosition;
out vec2 newPosition;

#define PI 3.14159265359
#define TAU 6.28318530718

float func (vec2 p) {
  float x = p.x;
	float y = p.y;
	return a * sin(TAU * x) + 
	   b * sin(TAU * x) * cos(TAU * y) + 
		 c * sin(4. * PI * x) + 
		 d * sin(6. * PI * x) * cos(4. * PI * y) + 
		 k * x;
}

void main() {
	newPosition = fract(vec2(func(oldPosition.xy), func(oldPosition.yx)));
}
`;
const tfFS = `#version 300 es
precision mediump float;
out vec4 o;
void main() {
  o = vec4(0);
}
`;
