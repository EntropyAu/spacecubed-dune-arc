window.SandSolver = class SandSolver {

  constructor(gl, canvas, options) {
    this.gl = gl;
    this.frame = 0;
    this.width = null
    this.height = null
    this.heightMap = null
    this.sink = 0;
    this.image = null
    this.imageData = null
    this.options = options;
    this.canvas = canvas;
    this.gl = gl;
    this.setSize(options.sandBehaviour.settlement.resolution,
                 options.sandBehaviour.settlement.resolution);
  }

  setSize(width, height) {
    this.heightMap = new Float32Array(width);
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;
    this.context = this.canvas.getContext('2d');
    this.context.clearRect(0, 0, width, height);
    this.image = this.context.getImageData(0, 0, width, height);
    this.imageData = this.image.data;
    this.texture = new GLTexture(this.gl, { width: width, height: 1, linearSample: false});
    this.heightMapPixels = new Float32Array(width * 4);
    this.heightMapTexture = new GLTexture(this.gl, { width: width, height: 1, linearSample: false});
  }

  render() {
    // add dirtyX, Y, width, height
    this.context.putImageData(this.image, 0, this.height - this.sink);
    this.context.putImageData(this.image, 0, 0 - this.sink);
  }

  tick() {
    this.frame++;
    if (this.frame % 2 !== 0) return;
    this.readSettledTexture();
    this.collapse();
    this._sinkIfRequired();
    if (this.frame % 16 === 0) this.writeHeightMap();
    this.render();
  }

  readSettledTexture() {
    const colorToByteArray = (color) => {
      const rgb = tinycolor(color).toRgb();
      return [rgb.r, rgb.g, rgb.b]
    }
    const colors = this.options.colors;
    const sand1Color = colorToByteArray(colors.sand1),
          sand2Color = colorToByteArray(colors.sand2),
          sand3Color = colorToByteArray(colors.sand3),
          sand4Color = colorToByteArray(colors.sand4);
    const rates = this.options.sandBehaviour.settlement.rate;
    var pixels = this.texture.getPixels();
    for (let i = 0; i < this.width; i++) {
      if (pixels[i * 4 + 0] > 0) this.addSand(i, pixels[i * 4 + 0] * 256 * rates.overall * rates.sand1, sand1Color);
      if (pixels[i * 4 + 1] > 0) this.addSand(i, pixels[i * 4 + 1] * 256 * rates.overall * rates.sand2, sand2Color);
      if (pixels[i * 4 + 2] > 0) this.addSand(i, pixels[i * 4 + 2] * 256 * rates.overall * rates.sand3, sand3Color);
      if (pixels[i * 4 + 3] > 0) this.addSand(i, pixels[i * 4 + 3] * 256 * rates.overall * rates.sand4, sand4Color);
    }
  }

  i(x,h) {
    return x * 4 + ((h + this.sink) % this.height) * this.width * 4;
  }

  writeHeightMap() {
    for (let i = 0; i < this.width; i++) {
      this.heightMapPixels[i * 4 + 3] = this.heightMap[i] / (255 * this.width);
    }
    this.heightMapTexture.setPixels(this.heightMapPixels);
  }

  addSandPile(x, pile) {
    for (let s of pile) {
      this.addSand(x, s.volume, s.color);
    }
  }

  addSand(x, volume, color) {
    const heightMap = this.heightMap,
          imageData = this.imageData;
    let h = this.heightMap[x] / 255;
    let remaining = volume;
    x = x|x;
    h = h|h;
    while (remaining > 0) {
      var i = this.i(x,h);
      var currentCellVolume = imageData[i + 3];
      var cellVolume = remaining <= 255 - currentCellVolume
                     ? remaining
                     : 255 - currentCellVolume;
      var newCellVolume = currentCellVolume + cellVolume;
      imageData[i + 0] = Math.round((currentCellVolume * imageData[i + 0] + cellVolume * color[0]) / newCellVolume); // R
      imageData[i + 1] = Math.round((currentCellVolume * imageData[i + 1] + cellVolume * color[1]) / newCellVolume); // G
      imageData[i + 2] = Math.round((currentCellVolume * imageData[i + 2] + cellVolume * color[2]) / newCellVolume); // B
      imageData[i + 3] = newCellVolume; // volume
      heightMap[x] += cellVolume;
      remaining -= cellVolume;
      h++;
    }
  }

  subtractSand(x, volume, colorDelta) {
    const heightMap = this.heightMap,
          imageData = this.imageData;
    let remaining = volume;
    let h = heightMap[x] / 255;
    let pile = [];
    x = x|x;
    h = h|h;
    while (remaining > 0 && h >= 0) {
      let i = this.i(x,h);
      let cellVolume = remaining <= imageData[i + 3]
                     ? remaining
                     : imageData[i + 3];
      pile.push({ color: [imageData[i + 0] + colorDelta,
                          imageData[i + 1] + colorDelta,
                          imageData[i + 2] + colorDelta],
                  volume: cellVolume });
      imageData[i + 3] -= cellVolume;
      heightMap[x] -= cellVolume;
      remaining -= cellVolume;
      h--;
    }
    return pile.reverse();
  }

  moveSand(volume, fromX, toX, colorDelta) {
    if (toX < 0 || toX > this.width - 1) return;
    const sandPile = this.subtractSand(fromX, volume, colorDelta);
    this.addSandPile(toX, sandPile);
  }

  collapse() {
    this._collapseLeft();
    this._collapseRight();
  }

  _collapseLeft() {
    const maxGradient = this.options.sandBehaviour.settlement.maxGradient,
          colorShiftLeft = this.options.sandBehaviour.settlement.colorShiftLeft;
    const colorShiftLeftByte = Math.floor(colorShiftLeft * 10)
    for (var x = this.width - 1; x > 0; x--) {
      var volume = (this.heightMap[x + 1] - this.heightMap[x] - maxGradient) * (0.5 + Math.random() / 2);
      if (volume > 64) this.moveSand(volume, x + 1, x, colorShiftLeftByte);
    }
    for (var x = 0; x < this.width - 1; x++) {
      var volume = (this.heightMap[x + 1] - this.heightMap[x] - maxGradient) * (0.5 + Math.random() / 2);
      if (volume > 128) this.moveSand(volume, x + 1, x, colorShiftLeftByte);
    }
  }

  _collapseRight() {
    const maxGradient = this.options.sandBehaviour.settlement.maxGradient,
          colorShiftRight = this.options.sandBehaviour.settlement.colorShiftRight;
    const colorShiftRightByte = Math.floor(colorShiftRight * 10)
    for (var x = 0; x < this.width - 1; x++) {
      var volume = (this.heightMap[x - 1] - this.heightMap[x] - maxGradient) * (0.5 + Math.random() / 2);
      if (volume > 64) this.moveSand(volume, x - 1, x, colorShiftRightByte);
    }
    for (var x = this.width - 1; x > 0; x--) {
      var volume = (this.heightMap[x - 1] - this.heightMap[x] - maxGradient) * (0.5 + Math.random() / 2);
      if (volume > 128) this.moveSand(volume, x - 1, x, colorShiftRightByte);
    }
  }

  _sinkIfRequired() {
    let coverage = this._getPortionCovered();
    if (this._getPortionCovered() > this.options.sandBehaviour.settlement.maxCoverage) {
      this._sink();
    }
  }

  _getPortionCovered() {
    let pixelsCovered = 0;
    for (let i = 0; i < this.width; i++) {
      pixelsCovered += this.heightMap[i] / (255);
    }
    return pixelsCovered / (this.width * this.height);
  }

  _sink() {
    // clear the bottom most row
    for (let x = 0; x < this.width; x++) {
      this.heightMap[x] = Math.max(0, this.heightMap[x] - 255);
    }
    for (let i = this.i(0,0); i < this.i(this.width, 0); i++) {
      this.imageData[i + 0] = 0;
      this.imageData[i + 1] = 0;
      this.imageData[i + 2] = 0;
      this.imageData[i + 3] = 0;
    }
    this.sink = (this.sink + 1) % this.height;
  }
}
