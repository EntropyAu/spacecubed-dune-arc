precision highp float;
uniform sampler2D velocityField;
uniform vec2 motionCoords;
uniform vec2 motionDirection;
uniform float motionRadius;
uniform float dt;
varying vec2 coords;
void main(void) {
  vec4 velocity = texture2D(velocityField, coords);
  float strength = pow(clamp(1. - distance(coords, motionCoords) / motionRadius, 0., 1.), 4.) * dt * 0.05;
  velocity.x += strength * motionDirection.x;
  velocity.y += strength * motionDirection.y;
  gl_FragColor = velocity;
}