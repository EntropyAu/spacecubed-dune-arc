window.SandSolver = class SandSolver {

  constructor(gl, canvas, options) {
    this.gl = gl;
    this.width = null
    this.height = null
    this.heightMap = null
    this.image = null
    this.imageData = null
    this.options = options;
    this.canvas = canvas;
    this.gl = gl;
    this.setSize(options.settlement.settlementSize, options.settlement.settlementSize);
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
    this.context.putImageData(this.image, 0, 0);
  }

  tick() {
    this.readSettledTexture();
    this.render();
    this.collapse();
    this.writeHeightMap();
  }

  readSettledTexture() {
    var pixels = this.texture.getPixels();
    for (let i = 0; i < this.width; i++) {
      if (pixels[i * 4 + 0] > 0) this.addSand(i, pixels[i * 4 + 0] * 256, this.options.sand1.color);
      if (pixels[i * 4 + 1] > 0) this.addSand(i, pixels[i * 4 + 1] * 256, this.options.sand2.color);
      if (pixels[i * 4 + 2] > 0) this.addSand(i, pixels[i * 4 + 2] * 256, this.options.sand3.color);
      if (pixels[i * 4 + 3] > 0) this.addSand(i, pixels[i * 4 + 3] * 256, this.options.sand4.color);
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
      cellVolume = remaining <= imageData[i + 3] 
                 ? remaining 
                 : imageData[i + 3];
      pile.push({ color: [imageData[i + 0] + colorDelta,
                          imageData[i + 1] + colorDelta,
                          imageData[i + 2] + colorDelta],
                  volume: cellVolume });
      imageData[i + 3] -= cellVolume; 
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
    for (var x = this.width - 1; x > 0; x--) {
      var volume = (this.heightMap[x + 1] - this.heightMap[x] - this.options.settlement.settlementGradient) * (0.5 + Math.random() / 2);
      if (volume > 64) this.moveSand(volume, x + 1, x, -2);
    }
    for (var x = 0; x < this.width - 1; x++) {
      var volume = (this.heightMap[x + 1] - this.heightMap[x] - this.options.settlement.settlementGradient) * (0.5 + Math.random() / 2);
      if (volume > 128) this.moveSand(volume, x + 1, x, -2);
    }
  }

  _collapseRight() {
    for (var x = 0; x < this.width - 1; x++) {
      var volume = (this.heightMap[x - 1] - this.heightMap[x] - this.options.settlement.settlementGradient) * (0.5 + Math.random() / 2);
      if (volume > 64) this.moveSand(volume, x - 1, x, -2);
    }
    for (var x = this.width - 1; x > 0; x--) {
      var volume = (this.heightMap[x - 1] - this.heightMap[x] - this.options.settlement.settlementGradient) * (0.5 + Math.random() / 2);
      if (volume > 128) this.moveSand(volume, x - 1, x, -2);
    }
  }
}
