
let {mat3,vec3} = glMatrix;

const Vec = (x,y) => new p5.Vector (x,y,0);
const makeMatrix = (u,v,p) => mat3.fromValues(
	u.x, u.y, 0, v.x, v.y, 0, p.x, p.y, 1 
);
const mul = (...matrices) => {
	let result = [...matrices[0]];
	for (let m of matrices.slice(1)) {
		mat3.mul(result,result,m)
	}
	return result;
}
const makeTransform = (u0, v0, p0, u1, v1, p1 ) => {
  let A = makeMatrix( u0, v0, p0 );
  let B = makeMatrix( u1, v1, p1 );
  return mul(B, mat3.invert ([], A));
};
const makeTranslation = (vec) => mat3.fromTranslation([],[vec.x,vec.y,0]);
const makeRotation = (pt, ang) => mul(
		mat3.fromTranslation([],[pt.x,pt.y,0]),
		mat3.fromRotation([],ang / 180 * Math.PI),
		mat3.fromTranslation([],[-pt.x,-pt.y,0])
);
const makeScaling = (p) => mat3.fromScaling([],[p.x,p.y]); 
const makeReflection = (p, axis) => {
  let axis2 = Vec(-axis.y, axis.x);
  return makeTransform(axis, axis2, p, Vec(-axis.x, -axis.y), axis2, p);
}
const makeGlide = (p, q, axis) => {
  let axis2 = Vec(-axis.y, axis.x);
  return makeTransform(axis, axis2, p, axis, Vec(-axis2.x, -axis2.y), q);
}
const transformPoint = (pt,mat) => {
	let [x,y,z] = vec3.transformMat3([],[pt.x,pt.y,1],mat)
	return Vec(x,y)
}
//
// Wallpaper group transformation sets
//
const wg = ({
  p1: [
    makeTranslation(Vec(1, 0)),
    makeTranslation(Vec(0, 1)),
    makeTranslation(Vec(-1, 0)),
    makeTranslation(Vec(0, -1))
  ],
  p2: [
    makeRotation(Vec(0.5, 0), 180),
    makeRotation(Vec(0.5, 1), 180),
    makeRotation(Vec(0, 0.5), 180),
    makeRotation(Vec(1, 0.5), 180)
  ],
  pm: [
    makeTranslation(Vec(0, 1)),
    makeTranslation(Vec(0, -1)),
    makeReflection(Vec(0, 0), Vec(1, 0)),
    makeReflection(Vec(1, 0), Vec(1, 0))
  ],
  pg: [
    makeTranslation(Vec(0, 1)),
    makeTranslation(Vec(0, -1)),
    makeGlide(Vec(0, 0.5), Vec(1, 0.5), Vec(1, 0)),
    makeGlide(Vec(0, 0.5), Vec(-1, 0.5), Vec(1, 0))
  ],
  cm: [
    makeReflection(Vec(0, 0), Vec(0, 1)),
    makeReflection(Vec(0, 1), Vec(0, 1)),
    makeGlide(Vec(0, 0.5), Vec(1, 0.5), Vec(1, 0)),
    makeGlide(Vec(0, 0.5), Vec(-1, 0.5), Vec(1, 0))
  ],
  pmm: [
    makeRotation(Vec(0, 0), 180),
    makeRotation(Vec(1, 0), 180),
    makeRotation(Vec(0, 1), 180),
    makeRotation(Vec(1, 1), 180),
    makeReflection(Vec(0, 0), Vec(0, 1)),
    makeReflection(Vec(0, 0), Vec(1, 0)),
    makeReflection(Vec(0, 1), Vec(0, 1)),
    makeReflection(Vec(1, 0), Vec(1, 0))
  ],
  pmg: [
    makeRotation(Vec(0, 0.5), 180),
    makeRotation(Vec(1, 0.5), 180),
    makeReflection(Vec(0, 0), Vec(0, 1)),
    makeReflection(Vec(0, 1), Vec(0, 1))
  ],
  pgg: [
    makeRotation(Vec(1.5, 0.5), 180),
    makeRotation(Vec(-0.5, 0.5), 180),
    makeRotation(Vec(0.5, 1.5), 180),
    makeRotation(Vec(0.5, -0.5), 180),
    makeGlide(Vec(0, 0), Vec(1, 0), Vec(1, 0)),
    makeGlide(Vec(0, 1), Vec(1, 1), Vec(1, 0)),
    makeGlide(Vec(0, 0), Vec(0, 1), Vec(0, 1)),
    makeGlide(Vec(1, 0), Vec(1, 1), Vec(0, 1))
  ],
  cmm: [
    makeRotation(Vec(0, 0), 180),
    makeRotation(Vec(0.5, 0.5), 180),
    makeReflection(Vec(0, 0), Vec(1, 0)),
    makeReflection(Vec(0, 0), Vec(0, 1))
  ],
  p4: [
    makeRotation(Vec(0, 0), 90),
    makeRotation(Vec(1, 1), 90),
    makeRotation(Vec(1, 0), 180),
    makeRotation(Vec(0, 1), 180)
  ],
  p4m: [
    makeRotation(Vec(0, 1), 90),
    makeRotation(Vec(1, 0), 90),
    makeReflection(Vec(0.5, 0.5), Vec(1, 1))
  ],
  p4g: [makeReflection(Vec(0.5, 0.5), Vec(1, 1)), makeRotation(Vec(0, 0), 90)],
  p3: [
    makeRotation(Vec(0.5, Math.sqrt(3) / 6), 120),
    makeRotation(Vec(0, 0), 120)
  ],
  p3m1: [
    makeRotation(Vec(0.5, Math.sqrt(3) / 6), 120),
    makeRotation(Vec(0, 0), 120),
    makeReflection(Vec(0.5, 0), Vec(1, 0))
  ],
  p31m: [
    makeRotation(Vec(0.5, Math.sqrt(3) / 6), 120),
    makeRotation(Vec(0, 0), 120),
    makeReflection(Vec(0.5, 0), Vec(0, 1))
  ],
  p6: [
    makeRotation(Vec(0.5, Math.sqrt(3) / 6), 120),
    makeRotation(Vec(0, 0), 60)
  ],
  p6m: [
    makeRotation(Vec(0.5, Math.sqrt(3) / 6), 120),
    makeRotation(Vec(0, 0), 60),
    makeReflection(Vec(0.5, 0), Vec(1, 0)),
    makeReflection(Vec(0.5, 0), Vec(0, 1))
  ]
})