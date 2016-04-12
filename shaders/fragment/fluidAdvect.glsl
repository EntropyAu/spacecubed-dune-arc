precision highp float;
uniform sampler2D velocityField;
uniform float dt;
uniform float invResolution;
varying vec2 coords;
void main(void) {
  vec2 velocity = texture2D(velocityField, coords).xy;
  vec2 position = coords - velocity * invResolution * dt;
  vec4 velocitySample = texture2D(velocityField, position);
  velocitySample *= 0.97; // dampen velocity
  gl_FragColor = velocitySample;
}