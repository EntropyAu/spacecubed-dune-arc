precision highp float;
uniform sampler2D source;
uniform mat4 sandColors;
varying vec2 coords;

void main(void) {
  vec4 source = texture2D(source, coords);
  gl_FragColor = sandColors * source;
}
