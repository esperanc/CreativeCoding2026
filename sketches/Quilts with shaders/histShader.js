// Histogram accumulation shaders.
// The vertex shader uses gl_InstanceID to loop over every pixel.
// It samples the grayscale image, computes the corresponding histogram bin,
// and emits a point at the center of that bin (in clip space).
const histVS = `#version 300 es
		precision highp float;
		uniform sampler2D u_image;
		uniform int u_gridSize;
		uniform int u_numBins;
		uniform float u_maxCount;
		// A dummy attribute (we need one for a VAO).
		in float a_dummy;
		void main() {
				int index = gl_InstanceID;
				int x = index % u_gridSize;
				int y = index / u_gridSize;
				vec2 texCoord = (vec2(float(x), float(y)) + 0.5) / float(u_gridSize);
				vec4 texValue = texture(u_image, texCoord);
				//float gray = ((texValue.y*100. + texValue.x) * 100.)/u_maxCount;
				float gray = texValue.x/u_maxCount;
				int bin = int(floor(gray * float(u_numBins)));
				if (bin >= u_numBins) { bin = u_numBins - 1; }
				float binCenter = (float(bin) + 0.5) / float(u_numBins);
				// Map binCenter to clip space X coordinate in [-1,1].
				float xPos = binCenter * 2.0 - 1.0;
				gl_Position = vec4(xPos, 0.0, 0.0, 1.0);
				gl_PointSize = 1.0;
		}`;

		// The fragment shader outputs a count of 1.0 (in the red channel).
		const histFS = `#version 300 es
		precision highp float;
		out vec4 outColor;
		void main() {
				outColor = vec4(1.0, 0.0, 0.0, 1.0);
		}`;