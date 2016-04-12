precision highp float;
uniform sampler2D velocityField;
uniform sampler2D sandField;
uniform sampler2D heightMap;
uniform vec4 dragValues;
uniform float dt;
uniform float invResolution;
varying vec2 coords;

void main(void) {
  vec4 fluid = texture2D(velocityField, coords);
  vec2 xyDelta = -1. * dt * fluid.xy * invResolution;
  vec2 translate = vec2(0., 0.01);
  float height = texture2D(heightMap, vec2(coords.x, 0)).a;
  if (height < coords.y) {
    float massConservationFactor = 1. - fluid.b / 4. * dt;
    float r = clamp(texture2D(sandField, coords + translate * dt + xyDelta * dragValues.r).r * massConservationFactor, 0., 1.);
    float g = clamp(texture2D(sandField, coords + translate * dt + xyDelta * dragValues.g).g * massConservationFactor, 0., 1.);
    float b = clamp(texture2D(sandField, coords + translate * dt + xyDelta * dragValues.b).b * massConservationFactor, 0., 1.);
    float a = clamp(texture2D(sandField, coords + translate * dt + xyDelta * dragValues.a).a * massConservationFactor, 0., 1.);
      gl_FragColor = vec4(r,g,b,a);
  } else {
    gl_FragColor = vec4(0.,0.,0.,0.);
  }
}
