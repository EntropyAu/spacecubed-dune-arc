precision highp float;
uniform sampler2D velocityField;
uniform sampler2D heightMap;
uniform sampler2D sandField;
uniform vec4 dragValues;
uniform float dt;
uniform float invResolution;
uniform float time;
uniform float graininess;
varying vec2 coords;

//note: uniformly distributed, normalized rand, [0;1[
float nrand( vec2 n )
{
	return fract(sin(dot(n.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float n1rand( vec2 n )
{
	float t = fract( time );
	float nrnd0 = nrand( n + 0.07 * t );
	return nrnd0;
}

void main(void) {
  vec4 fluid = texture2D(velocityField, coords);
  vec2 xyDelta = -1. * dt * fluid.xy * invResolution;
  float height = texture2D(heightMap, vec2(coords.x, 0)).a;

  vec2 translatedCoords = coords + vec2(0., 0.01) * dt;
  float massConservationFactor = 1. - fluid.b / 2. * dt;
  vec2 xy1 = translatedCoords + xyDelta * dragValues.r;
  vec2 xy2 = translatedCoords + xyDelta * dragValues.g;
  vec2 xy3 = translatedCoords + xyDelta * dragValues.b;
  vec2 xy4 = translatedCoords + xyDelta * dragValues.a;
  float r = xy1.y < height ? 0. : clamp(texture2D(sandField, xy1).r * massConservationFactor, 0., 1.);
  float g = xy2.y < height ? 0. : clamp(texture2D(sandField, xy2).g * massConservationFactor, 0., 1.);
  float b = xy3.y < height ? 0. : clamp(texture2D(sandField, xy3).b * massConservationFactor, 0., 1.);
  float a = xy4.y < height ? 0. : clamp(texture2D(sandField, xy4).a * massConservationFactor, 0., 1.);
  if (r > 0.1) r *= (1.0 - graininess) + n1rand(xy1) * graininess * 2.;
  if (g > 0.1) g *= (1.0 - graininess) + n1rand(xy2) * graininess * 2.;
  if (b > 0.1) b *= (1.0 - graininess) + n1rand(xy3) * graininess * 2.;
  if (a > 0.1) a *= (1.0 - graininess) + n1rand(xy4) * graininess * 2.;
  gl_FragColor = vec4(r,g,b,a);
}
