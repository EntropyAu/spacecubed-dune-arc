precision highp float;
uniform sampler2D sandField;
uniform vec2 motionCoords;
uniform vec4 sandVolumes;
uniform float motionRadius;
uniform float dt;
varying vec2 coords;
void main(void) {
  vec4 v = texture2D(sandField, coords);
  float strength = clamp(1. - distance(coords, motionCoords) / motionRadius, 0., 1.);
  v += strength * sandVolumes;
  gl_FragColor = v;
}