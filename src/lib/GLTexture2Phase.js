window.GLTexture2Phase = class GLTexture2Phase {
  constructor(context, options) {
    this.context = context;
    this.read = new GLTexture(context, options);
    this.write = new GLTexture(context, options);
  }
  swap() {
    let temp = this.read;
    this.read = this.write;
    this.write = temp;
  }
}