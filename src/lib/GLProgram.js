window.GLProgram = class GLProgram {
  constructor(context, vertexShader, fragmentShader) {
    const program = context.gl.createProgram();
    console.log("Creating program", vertexShader.glShader,fragmentShader.glShader)
    context.gl.attachShader(program, vertexShader.glShader);
    context.gl.attachShader(program, fragmentShader.glShader);
    context.gl.linkProgram(program);
    this.context = context;
    this.glProgram = program;
    this.loadedUniforms = {};
  }

  run(uniforms, target) {
    if (target instanceof GLTexture2Phase) {
      target.swap();
      target.write.use();
    } else {
      if (target) {
        target.use();
      } else {
        this.context.gl.bindFramebuffer(GL.FRAMEBUFFER, null);
        this.context.gl.viewport(0, 0, this.context.canvas.width, this.context.canvas.height);
      }
    }
    this.context.gl.useProgram(this.glProgram);
    this.setUniforms(uniforms);
    this.context.gl.drawArrays(GL.TRIANGLE_STRIP, 0, 4);
  }

  setUniforms(uniforms) {
    const gl = this.context.gl;

    for (var uniformName in uniforms) {
      var uniformValue = uniforms[uniformName];
      var uniformLocation = gl.getUniformLocation(this.glProgram, uniformName);
      if (typeof uniformValue === 'boolean') {
        gl.uniform1i(uniformLocation, uniformValue ? 1 : 0);
      } else if (typeof uniformValue === 'number') {
        gl.uniform1f(uniformLocation, uniformValue);
      } else if (_.isArray(uniformValue) && uniformValue.length == 2) {
        gl.uniform2f(uniformLocation, uniformValue[0], uniformValue[1]);
      } else if (_.isArray(uniformValue) && uniformValue.length == 4 && !_.isArray(uniformValue[0])) {
        gl.uniform4f(uniformLocation, uniformValue[0], uniformValue[1], uniformValue[2], uniformValue[3]);
      } else if (_.isArray(uniformValue) && uniformValue.length == 4 && _.isArray(uniformValue[0])) {
        gl.uniformMatrix4fv(uniformLocation, GL.FALSE, new Float32Array(_.flatten(uniformValue)))
      } else if (uniformValue instanceof GLTexture) {
        gl.uniform1i(uniformLocation, uniformValue.id - GL.TEXTURE0);
      } else if (uniformValue instanceof GLTexture2Phase) {
        gl.uniform1i(uniformLocation, uniformValue.read.id - GL.TEXTURE0);
      } else {
        console.log("Unknown uniform type", uniformName, uniformValue);
      }
      this.loadedUniforms[uniformName] = uniformValue;
    }
  }
}
