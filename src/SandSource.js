window.SandSource = class SandSource {
  constructor(glContext, options) {
    this.frame = 0;
    this.options = options;
    this.context = glContext;
    this.time = Math.random() * 2024;
    this.width = 1024;
    this.pixels = new Float32Array(this.width * 4);
    this.texture = new GLTexture(glContext, { width: 1024, height: 1, linearSample: false});
  }


  clearPixels() {
    for (let i = 0; i < this.pixels.length; i++)
      this.pixels[i] = 0;
  }


  updatePixels() {
    const t = this.time;
    const random = (seed, timeScale) => Math.abs(noise.simplex2(seed, t / timeScale));

    const emissionOptions = this.options.sandBehaviour.emission;

    const emitters = [];
    for (var e = 0; e < emissionOptions.numEmitters; e++) {
      const flows = [Math.pow(random(e + 10, 200), 3) * this.options.sandBehaviour.emission.maxRate,
                     Math.pow(random(e + 20, 200), 3) * this.options.sandBehaviour.emission.maxRate,
                     Math.pow(random(e + 30, 200), 3) * this.options.sandBehaviour.emission.maxRate,
                     Math.pow(random(e + 40, 200), 3) * this.options.sandBehaviour.emission.maxRate];
      const x = random(e + 50, 10000) * this.width;
      const width = Math.pow(random(e + 200, 50), 2) * 0.03 * this.width + 1;
      emitters.push({
        flows: flows,
        totalFlow: Math.max(_.sum(flows), 0.001),
        width: width|width,
        x: x|x
      })
    }

    const totalRelativeFlows = _(emitters).map('totalFlow').sum();
    const adjustedFlow = Math.max(emissionOptions.minRate, totalRelativeFlows);
    const flowScale = adjustedFlow / totalRelativeFlows;

    for (let e of emitters) {
      for (let i = e.x; i < e.x + e.width; i++) {
        if (i >= 0 && i < this.width) {
          this.pixels[i * 4 + 0] += e.flows[0] * flowScale;
          this.pixels[i * 4 + 1] += e.flows[1] * flowScale;
          this.pixels[i * 4 + 2] += e.flows[2] * flowScale;
          this.pixels[i * 4 + 3] += e.flows[3] * flowScale;
        }
      }
    }
  }


  tick(dt) {
    this.frame++;
    this.time += 0.05;
    if (this.frame % 20 !== 0) return;
    this.clearPixels();
    this.updatePixels();
    this.texture.setPixels(this.pixels);
  }
}
