window.GLContext = class GLContext {
  constructor(canvas) {
    const gl = canvas.getContext("webgl");
    gl.getExtension("oes_texture_float");
    gl.getExtension("oes_texture_float_linear");
    gl.getExtension("WEBGL_compressed_texture_s3tc");
    gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc");
    gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
    gl.viewport(0, 0, canvas.width, canvas.height)
    this.gl = gl;
    this.canvas = canvas;
    window.GL = gl; // hack so it's available for later use
  }
}
