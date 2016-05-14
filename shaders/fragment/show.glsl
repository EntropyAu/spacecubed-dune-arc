precision highp float;
uniform sampler2D source;
uniform sampler2D heightMap;
uniform float resolution;
uniform mat4 sandColors;
varying vec2 coords;

void main(void) {
  float height = texture2D(heightMap, vec2(coords.x, 0)).a;
  vec4 source = texture2D(source, coords);
  if (coords.y >= height) {
    gl_FragColor = sandColors * source;
  } else {
    gl_FragColor = vec4(0.,0.,0.,0.);
  }
}
