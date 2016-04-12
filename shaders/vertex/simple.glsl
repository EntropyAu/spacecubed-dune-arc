precision highp float;
attribute vec2 vertexPosition;
attribute vec2 texturePosition;
varying   vec2 coords;
void main(void) {
  gl_Position = vec4(vertexPosition , 0., 1.); 
  coords = texturePosition;
}
