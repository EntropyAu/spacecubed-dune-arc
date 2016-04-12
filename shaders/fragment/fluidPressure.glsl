precision highp float;
uniform sampler2D velocityField;
uniform sampler2D heightMap;
uniform float resolution;
uniform float invResolution;
varying vec2 coords;

float heightAtOffset(float x) {
  return texture2D(heightMap, vec2(x, 0)).a;
}

float samplePressure(vec2 at) {
  vec2 normal = vec2(0.0, 0.0);
  if      (at.x < 0.0) normal.x =  1.0; 
  else if (at.x > 1.0) normal.x = -1.0;
  if      (at.y < heightAtOffset(at.x)) normal.y =  1.0; 
  else if (at.y > 1.0) normal.y = -1.0;
  return texture2D(velocityField, at + normal * invResolution).a;
}

void main(void) {
  vec4 velocity = texture2D(velocityField, vec2(coords.x, coords.y));

  float l = samplePressure(coords - vec2(invResolution, 0.));
  float r = samplePressure(coords + vec2(invResolution, 0.));
  float b = samplePressure(coords - vec2(0., invResolution));
  float t = samplePressure(coords + vec2(0., invResolution));

  float divergence = velocity.z;
  velocity.a = (l + r + b + t - divergence) * 0.25;
  gl_FragColor = velocity;
}
