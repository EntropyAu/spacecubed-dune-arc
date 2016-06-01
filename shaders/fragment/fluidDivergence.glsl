precision highp float;
uniform sampler2D velocityField;
uniform sampler2D heightMap;
uniform float resolution;
uniform float invResolution;
const float halfrdx = 0.5;
varying vec2 coords;

float heightAtOffset(float x) {
  return texture2D(heightMap, vec2(x, 0)).a;
}

vec2 sampleVelocity(vec2 at){
  vec2 normal = vec2(0., 0.);
  vec2 multiplier = vec2(1., 1.);
  if      (at.x < 0.) { normal.x =  1.; multiplier.x = -1.; }
  else if (at.x > 1.) { normal.x = -1.; multiplier.x = -1.; }
  if      (at.y < heightAtOffset(at.x)) { normal.y =  1.; multiplier = vec2(0.5,-0.5); }
  else if (at.y > 1.) { normal.y = -1.; multiplier.y = -1.; }
  return multiplier * texture2D(velocityField, at + normal * invResolution).xy;
}

void main(void){
  vec2 velocity = texture2D(velocityField, coords).xy;
  vec2 l = sampleVelocity(coords - vec2(invResolution, 0.));
  vec2 r = sampleVelocity(coords + vec2(invResolution, 0.));
  vec2 b = sampleVelocity(coords - vec2(0., invResolution));
  vec2 t = sampleVelocity(coords + vec2(0., invResolution));
  float divergence = halfrdx * ((r.x - l.x) + (t.y - b.y));
  gl_FragColor = vec4(velocity.x, velocity.y, divergence, 0.);
}
