window.GLVertexShader = class GLVertexShader extends GLShader {
  constructor(context, glShader) {
    super(context, glShader);
  }
  static factoryFromPath(context, path) {
    return (callback) => {
      GLShader._loadAndCompileShader(context, path, GL.VERTEX_SHADER, (err, shader) => {
        return callback(null, new GLVertexShader(context, shader));
      });
    }
  }
}