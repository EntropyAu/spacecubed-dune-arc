precision highp float;
uniform sampler2D sandField;
uniform sampler2D sandSource;
uniform float dt;
uniform float invResolution;
varying vec2 coords;
void main(void) {
  vec4 sand = texture2D(sandField, coords);
  if (coords.y > 1. - invResolution * 5. && coords.y < 1. - invResolution * 4.) {
    vec4 source = texture2D(sandSource, vec2(coords.x, 0.));
    sand += source * dt;
  }
  gl_FragColor = sand;
}