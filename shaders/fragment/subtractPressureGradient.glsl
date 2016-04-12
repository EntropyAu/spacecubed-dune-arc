precision highp float;
uniform sampler2D velocityField;
uniform float invResolution;
uniform float dt;
varying vec2 coords;
const float halfrdx = 0.5 * (2. / 1.);

void main(void) {
  vec4 velocity = texture2D(velocityField, coords);
  float l = texture2D(velocityField, coords - vec2(invResolution, 0.)).a;
  float r = texture2D(velocityField, coords + vec2(invResolution, 0.)).a;
  float b = texture2D(velocityField, coords - vec2(0., invResolution)).a;
  float t = texture2D(velocityField, coords + vec2(0., invResolution)).a;
  gl_FragColor = vec4(velocity.xy - halfrdx * vec2(r - l, t - b), 0., 0.);
}
