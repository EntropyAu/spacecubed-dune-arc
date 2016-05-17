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
    this.context.putImageData(this.image, 0, this.sink - this.height + 1);
    this.context.putImageData(this.image, 0, this.sink + 1);
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
    var y = this.height - 1 - (this.heightMap[x] / 255);
    x = x|x;
    y = y|y;
    var remaining = volume;
    var imageData = this.imageData;
    while (remaining > 0 && y >= 0) {
      var i = (x + y * this.width) * 4;
      var i2 = (i - this.sink * this.width * 4) % (this.width * this.height * 4);
      i = i2;
      var currentCellVolume = imageData[i + 3];
      var cellVolume = remaining <= 255 - currentCellVolume
                     ? remaining
                     : 255 - currentCellVolume;
      var newCellVolume = currentCellVolume + cellVolume;
      imageData[i + 0] = Math.round((currentCellVolume * imageData[i + 0] + cellVolume * color[0]) / newCellVolume); // R
      imageData[i + 1] = Math.round((currentCellVolume * imageData[i + 1] + cellVolume * color[1]) / newCellVolume); // G
      imageData[i + 2] = Math.round((currentCellVolume * imageData[i + 2] + cellVolume * color[2]) / newCellVolume); // B
      imageData[i + 3] = newCellVolume; // volume
      this.heightMap[x] += cellVolume;
      remaining -= cellVolume;
      y--;
    }
  }

  subtractSand(x, volume, colorDelta) {
    var heightMap = this.heightMap;
    x = x|x;
    var y = ((this.height - 1) - (heightMap[x] / 255))|0;
    var remaining = volume;
    var imageData = this.imageData;
    var i = 0;
    var cellVolume = 0;
    var pile = [];
    while (remaining > 0 && y <= this.height) {
      i = (x + y * this.width) * 4;
      var i2 = (i - this.sink * this.width * 4) % (this.width * this.height * 4);
      cellVolume = remaining <= imageData[i2 + 3]
                 ? remaining
                 : imageData[i2 + 3];
      pile.push({ color: [imageData[i2 + 0] + colorDelta,
                          imageData[i2 + 1] + colorDelta,
                          imageData[i2 + 2] + colorDelta],
                  volume: cellVolume });
      imageData[i2 + 3] -= cellVolume;
      heightMap[x] -= cellVolume;
      remaining -= cellVolume;
      y++;
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
    const maxGradient = this.options.sandBehaviour.settlement.maxGradient;
    for (var x = this.width - 1; x > 0; x--) {
      var volume = (this.heightMap[x + 1] - this.heightMap[x] - maxGradient) * (0.5 + Math.random() / 2);
      if (volume > 64) this.moveSand(volume, x + 1, x, -2);
    }
    for (var x = 0; x < this.width - 1; x++) {
      var volume = (this.heightMap[x + 1] - this.heightMap[x] - maxGradient) * (0.5 + Math.random() / 2);
      if (volume > 128) this.moveSand(volume, x + 1, x, -2);
    }
  }

  _collapseRight() {
    const maxGradient = this.options.sandBehaviour.settlement.maxGradient;
    for (var x = 0; x < this.width - 1; x++) {
      var volume = (this.heightMap[x - 1] - this.heightMap[x] - maxGradient) * (0.5 + Math.random() / 2);
      if (volume > 64) this.moveSand(volume, x - 1, x, -2);
    }
    for (var x = this.width - 1; x > 0; x--) {
      var volume = (this.heightMap[x - 1] - this.heightMap[x] - maxGradient) * (0.5 + Math.random() / 2);
      if (volume > 128) this.moveSand(volume, x - 1, x, -2);
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
    this.sink = (this.sink + 1) % this.height;
    // clear the bottom most row
    let bottomRow = (this.height - this.sink - 1) * this.width * 4;
    for (let i = 0; i < this.width * 4; i++) {
      this.imageData[i + bottomRow] = 0;
    }
    for (let i = 0; i < this.width; i++) {
      this.heightMap[i] = Math.max(0, this.heightMap[i] - 255);
    }

  }
}
