precision highp float;
uniform sampler2D velocityField;
uniform sampler2D sandField;
uniform vec4 dragValues;
uniform float invResolution;
uniform float dt;
varying vec2 coords;

void main(void) {
  vec4 fluid = texture2D(velocityField, coords);
  if (coords.y > invResolution) {
    vec4 sand = texture2D(sandField, coords);
    fluid.y -= dot(sand, dragValues) * dt;
  }
  gl_FragColor = fluid;
}
