/**
 * Adapted from https://www.shadertoy.com/view/Xd23Dh (voronoise)
 * See also https://iquilezles.org/articles/voronoise/
 **/

let vert = `#version 300 es 
        
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

 in vec3 aPosition;
 in vec2 aTexCoord;

out vec2 vTexCoord;

void main() {
  	gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);  
		vTexCoord = aTexCoord;
}`;


let frag = `#version 300 es
precision highp float;

uniform vec3 u_color;   // Base color
uniform float u_jitter; // Jitter amount: 0: no jitter, 1: random jitter
uniform float u_ipower; // Interpolation power: 0 => bilinear, 1: min
uniform float u_cell;   // Cell count
uniform vec3 u_light_dir; // Vector pointing to light
uniform vec3 u_light_color; // Light color
uniform float u_ambient; // Ambient reflection coefficient
uniform float u_diffuse; // Diffuse reflection coefficient
uniform float u_specular; // Specular reflection coefficient
uniform float u_shininess; // Light shininess power
uniform vec2 u_resolution; // Screen dimensions
uniform mat3 u_transform; // UV space transformation
uniform int u_screen_coords; // Whether to use screen coords or texture coords

in vec2 vTexCoord;
out vec4 fragColor;

// vec3 hash3 (in vec2 p) {
//  vec3 q = vec3( dot(p,vec2(127.1,311.7)),
//			  dot(p,vec2(269.5,183.3)),
//			  dot(p,vec2(113.5,271.9)));
//	return fract(sin(q)*43758.5453123);
//}

vec3 hash3 (vec2 p)
{
	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy+p3.yzz)*p3.zyx);
}

vec3 voronoise( in vec2 p ) {
	float u = u_jitter;
	float v = u_ipower;
	float k = 1.0+63.0*pow(1.0-v,6.0);

	vec2 i = floor(p);
	vec2 f = fract(p);
    
	vec3 a = vec3(0.0);
	float sum = 0.;
	for( int y=-2; y<=2; y++ ) {
			for( int x=-2; x<=2; x++ ) {
        vec2  g = vec2( x, y );
				vec3  o = hash3( i + g )*vec3(u,u,1.0);
				vec2  d = g - f + o.xy;
				float w = pow( 1.0-smoothstep(0.0,1.414,length(d)), k );
				a += (hash3(i+g)-vec3(0.5,0.5,0.))*w;
				sum += w;
    	}
	}
	a /= sum;
	//a.z += 0.5;
	return normalize(a);
}

void main() {
	vec2 uv = u_screen_coords != 0 ? gl_FragCoord.xy / u_resolution.yy : vTexCoord;
	vec3 n = voronoise (u_cell*(u_transform*vec3(uv,0)).xy);
	//n.z = (n.z * 2.);
	float diffuse = abs(dot (n, u_light_dir)) * u_diffuse;
	vec3 halfway = normalize(u_light_dir + vec3(0,0,1));
	float specular = max(0.,pow(dot (halfway,n),u_shininess) * u_specular);
	fragColor = vec4((specular*u_light_color + (u_ambient+diffuse) * u_color).rgb,  1 );
}
`;