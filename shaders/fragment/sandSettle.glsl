precision highp float;
uniform sampler2D heightMap;
uniform sampler2D sandField;
varying vec2 coords;

void main(void) {
  float height = texture2D(heightMap, vec2(coords.x, 0)).a;
  gl_FragColor = texture2D(sandField, vec2(coords.x, height));
}
