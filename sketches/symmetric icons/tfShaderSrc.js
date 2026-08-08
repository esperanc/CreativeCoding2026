const tfVS = `#version 300 es
uniform float a;
uniform float b;
uniform float c;
uniform float d;
uniform float e;
uniform int n;

in vec2 oldPosition;
out vec2 newPosition;

vec2 cpow(vec2 z, int n) {
    // Compute the polar coordinates of z
    float r = length(z);
    float theta = atan(z.y, z.x);
    // Raise the modulus to the power n
    float rn = pow(r, float(n));
    // Multiply the angle by n
    float ntheta = float(n) * theta;
    return vec2(rn * cos(ntheta), rn * sin(ntheta));
}
		
void main() {
	vec2 z = oldPosition;
	vec2 term1 = z * (a + b * dot(z,z) + c * cpow(z,n).x);
	vec2 term2 = cpow (vec2(z.x,-z.y),n-1)*d;
	vec2 term3 = vec2(-z.y*e, z.x*e);
	newPosition = term1 + term2 + term3;
}
`;



const tfFS = `#version 300 es
precision mediump float;
out vec4 o;
void main() {
  o = vec4(0);
}
`;
