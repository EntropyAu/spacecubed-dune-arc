precision highp float;
uniform sampler2D target;
uniform sampler2D source;
varying vec2 coords;


void main(void) {
  vec4 t = texture2D(target, coords);
  t.b += texture2D(source, coords).b;
  gl_FragColor = texture2D(target, coords);
}
