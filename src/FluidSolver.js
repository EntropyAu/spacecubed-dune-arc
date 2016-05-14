window.FluidSolver = class FluidSolver {
  constructor(glContext, options) {
    this.context = glContext;
    this.options = options;
    this.textures = {};
    this.fragmentShaders = {};
    this.vertexShaders = {};
    this.pointerDown = false;
    this.mousePosition = null;
    this.mouseVelocity = null;
    this.programs = {};
    this.ready = false;
    this.setSize(options.fluid.resolution, options.fluid.resolution, function() {});
    this.loadFragmentShaders(() => {
      this.loadVertexShaders(() => {
        this.initializePrograms();
        this.ready = true;
      })
    });
  }
  setSize(width, height, callback) {
    this.width = width;
    this.height = height;
    this.initializeTextures();
  }
  setSourceTexture(texture) {
    this.sourceTexture = texture;
  }
  setGhostSourceTexture(texture) {
    this.ghostSourceTexture = texture;
  }
  setSettlementTexture(texture) {
    this.settlementTexture = texture;
  }
  setHeightMapTexture(texture) {
    this.heightMapTexture = texture;
  }
  initializeTextures() {
    this.textures.fluid = new GLTexture2Phase(this.context, { width: this.width, height: this.height });
    this.textures.sand = new GLTexture2Phase(this.context, { width: 1024, height: 1024 });
  }
  loadFragmentShaders(callback) {
    async.series({
      fluidAdvect:                GLFragmentShader.factoryFromPath(this.context, "./shaders/fragment/fluidAdvect.glsl"),
      fluidDivergence:            GLFragmentShader.factoryFromPath(this.context, "./shaders/fragment/fluidDivergence.glsl"),
      fluidPressure:              GLFragmentShader.factoryFromPath(this.context, "./shaders/fragment/fluidPressure.glsl"),
      subtractPressureGradient:   GLFragmentShader.factoryFromPath(this.context, "./shaders/fragment/subtractPressureGradient.glsl"),
      sandAdvect:                 GLFragmentShader.factoryFromPath(this.context, "./shaders/fragment/sandAdvect.glsl"),
      sandSettle:                 GLFragmentShader.factoryFromPath(this.context, "./shaders/fragment/sandSettle.glsl"),
      sandSource:                 GLFragmentShader.factoryFromPath(this.context, "./shaders/fragment/sandSource.glsl"),
      sandGhostSource:            GLFragmentShader.factoryFromPath(this.context, "./shaders/fragment/sandGhostSource.glsl"),
      mouseMotion:                GLFragmentShader.factoryFromPath(this.context, "./shaders/fragment/mouseMotion.glsl"),
      sandDrag:                   GLFragmentShader.factoryFromPath(this.context, "./shaders/fragment/sandDrag.glsl"),
      sandAdd:                    GLFragmentShader.factoryFromPath(this.context, "./shaders/fragment/sandAdd.glsl"),
      show:                       GLFragmentShader.factoryFromPath(this.context, "./shaders/fragment/show.glsl")
    }, (err, shaders) => {
      this.fragmentShaders = shaders;
      return callback();
    });
  }
  loadVertexShaders(callback) {
    console.log("Loading vertex shaders...");
    async.series({
      simple: GLVertexShader.factoryFromPath(this.context, "./shaders/vertex/simple.glsl"),
    }, (err, shaders) => {
      this.vertexShaders = shaders;
      return callback();
    });
  }
  setMouseMotion(positionXY, velocityXY, pointerDown) {
    this.mousePosition = positionXY;
    this.mouseVelocity = velocityXY;
    this.pointerDown = pointerDown;
  }
  initializePrograms() {
    this.programs = {
      fluidAdvect:     new GLProgram(this.context, this.vertexShaders.simple, this.fragmentShaders.fluidAdvect),
      fluidPressure:   new GLProgram(this.context, this.vertexShaders.simple, this.fragmentShaders.fluidPressure),
      fluidDivergence: new GLProgram(this.context, this.vertexShaders.simple, this.fragmentShaders.fluidDivergence),
      subtractPressureGradient: new GLProgram(this.context, this.vertexShaders.simple, this.fragmentShaders.subtractPressureGradient),
      sandAdd:         new GLProgram(this.context, this.vertexShaders.simple, this.fragmentShaders.sandAdd),
      sandAdvect:      new GLProgram(this.context, this.vertexShaders.simple, this.fragmentShaders.sandAdvect),
      sandDrag:        new GLProgram(this.context, this.vertexShaders.simple, this.fragmentShaders.sandDrag),
      sandSettle:      new GLProgram(this.context, this.vertexShaders.simple, this.fragmentShaders.sandSettle),
      sandSource:      new GLProgram(this.context, this.vertexShaders.simple, this.fragmentShaders.sandSource),
      sandGhostSource: new GLProgram(this.context, this.vertexShaders.simple, this.fragmentShaders.sandGhostSource),
      mouseMotion:     new GLProgram(this.context, this.vertexShaders.simple, this.fragmentShaders.mouseMotion),
      show:            new GLProgram(this.context, this.vertexShaders.simple, this.fragmentShaders.show)
    }

    var vertexProgram = this.programs.show.glProgram;
    this.context.gl.linkProgram(vertexProgram);
    var aPosLoc = this.context.gl.getAttribLocation(vertexProgram, "vertexPosition");
    var aTexLoc = this.context.gl.getAttribLocation(vertexProgram, "texturePosition");
    this.context.gl.enableVertexAttribArray(aPosLoc);
    this.context.gl.enableVertexAttribArray(aTexLoc);
    this.context.gl.bindBuffer(GL.ARRAY_BUFFER, this.context.gl.createBuffer());
    this.context.gl.bufferData(GL.ARRAY_BUFFER, new Float32Array([
                                 -1, -1,
                                  0,  0,
                                  1, -1,
                                  1,  0,
                                 -1,  1,
                                  0,  1,
                                  1,  1,
                                  1,  1 ]), GL.STATIC_DRAW);
    this.context.gl.vertexAttribPointer(aPosLoc, 2, GL.FLOAT, GL.FALSE, 16, 0);
    this.context.gl.vertexAttribPointer(aTexLoc, 2, GL.FLOAT, GL.FALSE, 16, 8);
  }

  tick() {
    const rgbaToFloat = (color) => {
      return [color[0] / 255,
              color[1] / 255,
              color[2] / 255,
              1.0]
    }
    const sandColors = [rgbaToFloat(this.options.sand1.color),
                        rgbaToFloat(this.options.sand2.color),
                        rgbaToFloat(this.options.sand3.color),
                        rgbaToFloat(this.options.sand4.color)];

    const resolution = this.width;
    const invResolution = 1 / this.width;
    const dt = this.options.dt;
    const velocityField = this.textures.fluid;
    const sandField = this.textures.sand;
    const heightMap = this.heightMapTexture;

    if (!this.ready) return;

    if (this.mousePosition) {
      let mouseVelocityMagnitude = Math.sqrt(this.mouseVelocity[0] * this.mouseVelocity[0]
                                           + this.mouseVelocity[1] * this.mouseVelocity[1]);
      if (mouseVelocityMagnitude > 0) {
        let unitMouseVelocity = [-this.mouseVelocity[0] / mouseVelocityMagnitude,
                                  this.mouseVelocity[1] / mouseVelocityMagnitude];
        this.programs.mouseMotion.run({
          velocityField,
          motionCoords: [this.mousePosition[0], 1 - this.mousePosition[1]],
          motionDirection: [unitMouseVelocity[0] * 4000, unitMouseVelocity[1] * 4000],
          motionRadius: 0.1 + mouseVelocityMagnitude,
          dt
        }, velocityField);

      }
      if (this.pointerDown) {
        this.programs.sandAdd.run({
          sandField,
          motionCoords: [this.mousePosition[0], 1 - this.mousePosition[1]],
          motionRadius: 0.01,
          sandVolumes: [0.5, 0.1, 0.1, 0.01],
          dt
        }, sandField);
      }
    }

    if (this.sourceTexture) {
      this.programs.sandSource.run({
        invResolution,
        sandField,
        sandSource: this.sourceTexture,
        dt
      }, sandField);
    }

    if (this.ghostSourceTexture) {
      this.programs.sandGhostSource.run({
        invResolution,
        sandField,
        sandSource: this.ghostSourceTexture,
        dt
      }, sandField);
    }

    this.programs.fluidAdvect.run({
      velocityField,
      invResolution,
      dt
    }, velocityField);

    this.programs.sandDrag.run({
      sandField,
      velocityField,
      dt,
      dragValues: [1, 40, 40, 40]
    }, velocityField);

    this.programs.fluidDivergence.run({
      velocityField,
      resolution,
      heightMap,
      invResolution,
      dt
    }, velocityField);

    for (let i = 0; i < this.options.fluid.pressureSolveIterations; i++){
      this.programs.fluidPressure.run({
        velocityField,
        resolution,
        heightMap,
        invResolution
      }, velocityField);
    }

    this.programs.sandAdvect.run({
      sandField,
      velocityField,
      invResolution,
      heightMap,
      resolution,
      dt,
      dragValues: [1, 0.9, 0.9, 0.8],
      translate: [0, 0.005]
    }, sandField)

    this.programs.sandSettle.run({
      sandField,
      velocityField,
      heightMap,
      resolution,
      invResolution,
      dt
    }, this.settlementTexture);

    this.programs.subtractPressureGradient.run({
      velocityField,
      invResolution,
      dt
    }, velocityField);

    this.programs.show.run({
      source: sandField,
      heightMap,
      resolution,
      sandColors
    });
  }
}
