
window.GhostMaker = class GhostMaker {
  constructor(glContext, options) {
    this.gl = glContext;
    this.options = options;

    this.width = options.interactivity.resolution;
    this.height = options.interactivity.resolution;
    this.initializeVideoElement();
    this.initializeGhostCanvas();
    this.initializeBufferCanvas();
    this.initializeDifferenceCanvas();
    this.initializeOutputTexture();
    this.playing = false;
    this.starting = false;
    this.frame = 0;
    this.start();
  }

  start() {
    console.log("Starting camera interactivity...");
    this.starting = true;
    navigator.mozGetUserMedia({ "video": true }, (stream) => {
      this.videoElement.src = window.URL.createObjectURL(stream);
      this.videoElement.play();
      this.playing = true;
      this.starting = false;
      console.log("Camera interactivity started.");
    }, console.error);
  }

  stop() {
    console.log("Stopping camera interactivity.");
    this.videoElement.stop();
    this.videoElement.src = null;
    this.playing = false;
  }

  initializeVideoElement() {
    this.videoElement = document.createElement("video");
    this.videoElement.width = this.width;
    this.videoElement.height = this.height;
    this.videoElement.autoplay = true;
  }

  initializeGhostCanvas() {
    this.ghostCanvas = document.getElementById('ghost-canvas');
    this.ghostCanvas = this.ghostCanvas || document.createElement("canvas");
    this.ghostCanvas.width = this.width;
    this.ghostCanvas.height = this.height;
    this.ghostCanvasContext = this.ghostCanvas.getContext("2d");
  }

  initializeBufferCanvas() {
    this.bufferCanvas = document.createElement("canvas");
    this.bufferCanvas.width = this.width;
    this.bufferCanvas.height = this.height;
    this.bufferCanvasContext = this.bufferCanvas.getContext("2d");
  }

  initializeDifferenceCanvas() {
    this.differenceCanvas = document.createElement("canvas");
    this.differenceCanvas.width = this.width;
    this.differenceCanvas.height = this.height;
    this.differenceContext = this.differenceCanvas.getContext("2d");
  }

  initializeOutputTexture() {
    this.texture = new GLTexture2Phase(this.gl, { width: this.width, height: this.height, mode: GL.UNSIGNED_BYTE });
  }

  tick(dt) {
    if (this.options.interactivity.enabled && !(this.playing || this.starting)) {
      return start();
    }
    if (!this.options.interactivity.enabled && this.playing) {
      return stop();
    }
    if (!this.playing) return;
    this.frame ++;
    if (this.frame % 2 !== 0) return

    // draw the last video frame
    this.differenceContext.globalCompositeOperation = 'source-over';
    this.differenceContext.drawImage(this.bufferCanvas, 0, 0, this.width, this.height);
    this.bufferCanvasContext.drawImage(this.videoElement, 0, 0, this.width, this.height);

    // calculate difference with the current video frame
    this.differenceContext.globalCompositeOperation = 'difference';
    this.differenceContext.drawImage(this.bufferCanvas, 0, 0, this.width, this.height);

    if (this.frame < 60) return;

    // fade out the accumulation canvas
    this.ghostCanvasContext.globalCompositeOperation = 'source-over';
    this.ghostCanvasContext.fillStyle = "rgba(0, 0, 0, 0.04)";
    this.ghostCanvasContext.fillRect(0, 0, this.width, this.height);

    // add the latest movement
    this.ghostCanvasContext.globalCompositeOperation = 'screen';
    this.ghostCanvasContext.globalAlpha = 0.5;
    this.ghostCanvasContext.drawImage(this.differenceCanvas, 0, 0, this.width, this.height);

    if (this.texture) {
      let imageData = this.ghostCanvasContext.getImageData(0, 0, this.width, this.height);
      this.texture.write.setPixels(new Uint8Array(imageData.data));
      this.texture.swap();
    }
  }
}
