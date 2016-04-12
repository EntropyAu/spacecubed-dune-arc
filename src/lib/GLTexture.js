var textureId = 0;

window.GLTexture = class GLTexture {
  constructor(context, options) {
    this.context = context;
    this.width = options.width;
    this.height = options.height;
    this.id = GL.TEXTURE0 + textureId++;
    this.fbo = null;
    this.options = options;

    this.glTexture = context.gl.createTexture();
    context.gl.activeTexture(this.id);
    context.gl.bindTexture(GL.TEXTURE_2D, this.glTexture);
    context.gl.pixelStorei(GL.UNPACK_ALIGNMENT, 1);
    if (!options.pixels) {
      options.pixels = new Float32Array(options.width * options.height * 4);
      for (var i = 0; i < options.width * options.height * 4; i++) {
        options.pixels[i] = 0;
      }
    }
    this.setPixels(options.pixels);
    context.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S,     GL.CLAMP_TO_EDGE); 
    context.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T,     GL.CLAMP_TO_EDGE);
    context.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, options.linearSample !== false ? GL.LINEAR : GL.NEAREST);
    context.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, options.linearSample !== false ? GL.LINEAR : GL.NEAREST);

    this.fbo = this.context.gl.createFramebuffer();
    this.context.gl.bindFramebuffer(GL.FRAMEBUFFER, this.fbo);
    this.context.gl.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this.glTexture, 0);
  }

  use() {
    this.context.gl.viewport(0, 0, this.width, this.height);
    this.context.gl.bindFramebuffer(GL.FRAMEBUFFER, this.fbo);
  }

  setPixels(pixels) {
    this.context.gl.activeTexture(this.id);
    this.context.gl.texImage2D(GL.TEXTURE_2D, 
                               0,
                               GL.RGBA, 
                               this.options.width, 
                               this.options.height, 
                               0, 
                               GL.RGBA, 
                               GL.FLOAT, 
                               pixels);

  }

  getPixels() {
    this.context.gl.bindFramebuffer(GL.FRAMEBUFFER, this.fbo);
    var floatValues = new Float32Array(this.width * this.height * 4);
    this.context.gl.readPixels(0, 0, this.width, this.height, GL.RGBA, GL.FLOAT, floatValues);
    return floatValues;
  }
}