window.GLShader = class GLShader {
  constructor(context, glShader) {
    this.context = context;
    this.glShader = glShader;
  }

  static _loadShader(path, callback) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load",() => callback(xhr.responseText));
    xhr.open('GET', path + '?' + Math.random());
    xhr.send();
  }

  static _loadAndCompileShader(context, path, shaderType, callback) {
    GLShader._loadShader(path, (shaderSource) => {
      const shader = context.gl.createShader(shaderType);
      context.gl.shaderSource(shader, shaderSource);
      context.gl.compileShader(shader);
      if (!context.gl.getShaderParameter(shader, GL.COMPILE_STATUS)) {
        console.error("Shader compile error.")
        console.error(path + "\n" + context.gl.getShaderInfoLog(shader));
        return callback(context.gl.getShaderInfoLog(shader));
      } else {
        console.log("Shader compile success.")
        return callback(null, shader);
      }
    });
  }
}

