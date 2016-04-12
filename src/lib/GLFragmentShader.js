window.GLFragmentShader = class GLFragmentShader extends GLShader {
  constructor(context, glShader) {
    super(context, glShader);
  }
  static factoryFromPath(context, path) {
    return (callback) => {
      GLShader._loadAndCompileShader(context, path, GL.FRAGMENT_SHADER, (err, shader) => {
        return callback(null, new GLFragmentShader(context, shader));
      });
    }
  }
}