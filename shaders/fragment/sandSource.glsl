precision highp float;
uniform float dt;
uniform float invResolution;

uniform sampler2D sandField;
uniform sampler2D sandSource;

uniform sampler2D motionSource;
uniform float motionThreshold;
uniform int motionFlipHorizontal;
uniform int motionFlipVertical;

varying vec2 coords;
void main(void) {
  vec4 sand = texture2D(sandField, coords);
  if (coords.y > 1. - invResolution * 5. && coords.y < 1. - invResolution * 4.) {
    vec4 source = texture2D(sandSource, vec2(coords.x, 0.));
    sand += source * dt;
  } else {
    vec2 motionCoords = vec2(coords);
    if (motionFlipVertical != 0) motionCoords.y = 1. - motionCoords.y;
    if (motionFlipHorizontal != 0) motionCoords.x = 1. - motionCoords.x;
    vec4 motion = texture2D(motionSource, motionCoords);
    sand.a = max(sand.a, (motion.r * (1. - motionThreshold) - motionThreshold));
  }

  gl_FragColor = sand;
}
