window.GLContext = class GLContext {
  constructor(canvas) {
    const gl = canvas.getContext("webgl");
    gl.getExtension("oes_texture_float");
    gl.getExtension("oes_texture_float_linear");
    gl.viewport(0, 0, canvas.width, canvas.height)
    this.gl = gl;
    this.canvas = canvas;
    window.GL = gl; // hack so it's available for later use
  }
}