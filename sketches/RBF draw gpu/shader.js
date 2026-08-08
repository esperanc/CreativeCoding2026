const kernelGLSL = {
	  'linear': 'return r;',
    'cubic':  'return r*r*r;',
    'quintic': 'return pow(r,5.);',
    'thin-plate': 'if (r == 0.0) return 0.0; return  r * r * log(r);',
    'gaussian': 'return exp(-pow(r / u_epsilon, 2.));',
    'inverse-multiquadric': 'return 1.0 / sqrt(pow(r / u_epsilon, 2.) + 1.);',
    'multiquadric': 'return sqrt(pow(r / u_epsilon, 2.) + 1.);',
}

function makeShaderSource(kernel) {
  const vert = `#version 300 es 
          
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  
   in vec3 aPosition;
   in vec2 aTexCoord;
  
  out vec2 vTexCoord;
  
  void main() {
    	gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);  
  		vTexCoord = aTexCoord;
  }`;
  
  const frag = `#version 300 es
  precision highp float;
  #define MAXPOINTS 50
  uniform float u_height;
  uniform vec2 u_pts[MAXPOINTS];
  uniform float u_weights[MAXPOINTS];
  uniform int u_npts;
  uniform float u_epsilon;
  uniform vec3 u_color;
  
  float kernel (float r) {
  	${kernelGLSL[kernel]}
  }
  
  float rbf (vec2 coord) {
  	float sum = 0.;
  	for (int i = 0; i < MAXPOINTS; i++) {
  	  if (i == u_npts) break;
  		float r = length(coord - u_pts[i]);
  		sum += kernel(r)*u_weights[i];
  	}
  	return sum;
  }
  
  out vec4 fragColor;
  
  void main() {
  	if (rbf (vec2(gl_FragCoord.x, u_height - gl_FragCoord.y)) < 0.0) fragColor=vec4(0.,0.,0.,1.);
  	else fragColor = vec4(u_color, 1.);
  }`;
  return {vert,frag}
}