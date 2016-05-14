
window.GhostMaker = class GhostMaker {
  constructor(glContext, options) {
    this.width = 320;
    this.height = 200;
    this.videoElement = document.createElement("video");
    this.videoElement.width = this.width;
    this.videoElement.height = this.height;
    this.videoElement.autoplay = true;
    this.ghostCanvas = document.getElementById('ghost-canvas');
    this.ghostCanvas = this.ghostCanvas || document.createElement("canvas");
    this.ghostCanvas.width = this.width;
    this.ghostCanvas.height = this.height;
    this.ghostCanvasContext = this.ghostCanvas.getContext("2d");
    this.initializeBufferCanvas();
    this.initializeDifferenceCanvas();
    this.texture = new GLTexture(glContext, { width: this.width, height: this.height, linearSample: false });
    this.playing = false;
    this.frame = 0;
    this.start();
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

  start() {
    navigator.webkitGetUserMedia({ "video": true }, (stream) => {
      this.videoElement.src = window.webkitURL.createObjectURL(stream);
      this.videoElement.play();
      this.playing = true;
    }, console.error);
  }

  stop() {
    this.videoElement.stop();
    this.videoElement.src = null;
  }

  tick(dt) {
    if (!this.playing) return;
    this.frame ++;
    this.differenceContext.globalCompositeOperation = 'source-over';
    this.differenceContext.drawImage(this.bufferCanvas, 0, 0, this.width, this.height);
    this.bufferCanvasContext.drawImage(this.videoElement, 0, 0, this.width, this.height);
    this.differenceContext.globalCompositeOperation = 'difference';
    this.differenceContext.drawImage(this.bufferCanvas, 0, 0, this.width, this.height);

    if (this.frame < 60) return;

    // fade out the background image
    this.ghostCanvasContext.globalCompositeOperation = 'source-over';
    this.ghostCanvasContext.fillStyle = "rgba(0, 0, 0, 0.02)";
    this.ghostCanvasContext.fillRect(0, 0, this.width, this.height);

    this.ghostCanvasContext.globalCompositeOperation = 'screen';
    this.ghostCanvasContext.globalAlpha = 0.5;
    this.ghostCanvasContext.drawImage(this.differenceCanvas, 0, 0, this.width, this.height);

    this.ghostCanvasContext.globalCompositeOperation = 'color';
    this.ghostCanvasContext.globalAlpha = 1;
    this.ghostCanvasContext.fillStyle = "rgba(0, 0, 0, 1)";
    this.ghostCanvasContext.fillRect(0, 0, this.width, this.height);

    let imageData = this.ghostCanvasContext.getImageData(0, 0, this.width, this.height);
    this.texture.setPixels(new Uint8Array(imageData.data), GL.UNSIGNED_BYTE);
  }
}
