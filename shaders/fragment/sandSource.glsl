precision highp float;
uniform sampler2D sandField;
uniform sampler2D sandSource;
uniform sampler2D ghostSource;
uniform float dt;
uniform float invResolution;
varying vec2 coords;
void main(void) {
  vec4 sand = texture2D(sandField, coords);
  if (coords.y > 1. - invResolution * 5. && coords.y < 1. - invResolution * 4.) {
    vec4 source = texture2D(sandSource, vec2(coords.x, 0.));
    sand += source * dt;
  } else {
    vec4 source = texture2D(ghostSource, vec2(1. - coords.x, 1. - coords.y));
    sand.a = max(sand.a, (source.r * 2. - 0.75));
  }

  gl_FragColor = sand;
}
