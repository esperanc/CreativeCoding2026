/**
 * This is essentially the rbf module by Thibaut Séguy, but modified to use a selectable norm
 * See https://github.com/thibauts/rbf
 **/
let RBF;

{
	const euclideanNorm = (pa, pb) => {
    return numeric.norm2(numeric.sub(pb, pa));
  }
  
  const distanceLinear = (r) => {
    return r;
  }

  const distanceCubic = (r) => {
    return Math.pow(r, 3);
  }

  const distanceQuintic = (r) => {
    return Math.pow(r, 5);
  }

  const distanceThinPlate = (r) => {
    if(r === 0) return 0;
    return Math.pow(r, 2) * Math.log(r);
  }

  const distanceGaussian = (r, epsilon) => {
    return Math.exp(- Math.pow(r / epsilon, 2));
  }

  const distanceInverseMultiquadric = (r, epsilon) => {
    return 1.0 / Math.sqrt(Math.pow(r / epsilon, 2) + 1);
  }

  const distanceMultiquadric = (r, epsilon) => {
    return Math.sqrt(Math.pow(r / epsilon, 2) + 1);
  }
	
	const distanceFunctions = {
    'linear': distanceLinear,
    'cubic':  distanceCubic,
    'quintic': distanceQuintic,
    'thin-plate': distanceThinPlate,
    'gaussian': distanceGaussian,
    'inverse-multiquadric': distanceInverseMultiquadric,
    'multiquadric': distanceMultiquadric
  };

	
	RBF = (points, values, distanceFunction, epsilon, norm = euclideanNorm) => {
		
		let distance;
		if(distanceFunction) {
      distance = typeof distanceFunction !== 'string' ? distanceFunction 
        : distanceFunctions[distanceFunction];
    } 
		else {
			distance = distanceFunctions.linear;
		}
		
		let M = numeric.identity(points.length);
		
		// First compute the point to point distance matrix
    // to allow computing epsilon if it's not provided
    for(let j=0; j<points.length; j++) {
      for(let i=0; i<points.length; i++) {
        M[j][i] = norm(points[i], points[j]);
      }
    }
		
		// if needed, compute espilon as the average distance between points
    if(epsilon === undefined) {
      epsilon = numeric.sum(M) / (Math.pow(points.length, 2) - points.length);
    }
		
		// update the matrix to reflect the requested distance function
    for(let j=0; j<points.length; j++) {
      for(let i=0; i<points.length; i++) {
        M[j][i] = distance(M[j][i], epsilon);
      }
    }
		
		  // determine dimensionality of target values
    let sample = values[0];
    const D = typeof sample === 'number' ? 1 : sample.length;
		
		// generalize to vector values
    if(typeof sample === 'number') {
      values = values.map(function(value) {
        return [value];
      });
    }
		
		// reshape values by component
    let tmp = new Array(D);
    for(let i=0; i<D; i++) {
      tmp[i] = values.map((value) => value[i]);
    }
    values = tmp;
		
		// Compute basis functions weights by solving
    // the linear system of equations for each target component
    let w = new Array(D);
    let LU = numeric.LU(M);
    for(let i=0; i<D; i++) {
      w[i] = numeric.LUsolve(LU, values[i]);
    }
		
		// The returned interpolant will compute the value at any point 
    // by summing the weighted contributions of the input points
    const interpolant = function (p) {

      let distances = new Array(points.length);
      for(let i=0; i < points.length; i++) {
        distances[i] = distance(norm(p, points[i]), epsilon);
      }

      let sums = new Array(D);
      for(let i=0; i<D; i++) {
        sums[i] = numeric.sum(numeric.mul(distances, w[i]));
      }

      return sums;
    }
		
		interpolant.w = w.flat();
		interpolant.epsilon = epsilon;
		return interpolant;

	}
}
