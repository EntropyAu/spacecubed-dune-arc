window.Options = class Options {
  constructor() {
    this.options = window["defaultOptions"];
    this.initializeGUI();
  }

  initializeGUI() {
    const gui = new dat.GUI({
      width: 350,
      autoPlace: true
    });
    gui.close();
    gui.remember(this.options);
    gui.remember(this.options.layout);
    gui.remember(this.options.colors);
    gui.remember(this.options.interactivity);
    gui.remember(this.options.fluidBehaviour);
    gui.remember(this.options.sandBehaviour);
    gui.remember(this.options.sandBehaviour.emission);
    gui.remember(this.options.sandBehaviour.settlement);
    gui.remember(this.options.sandBehaviour.settlement.rate);
    gui.remember(this.options.sandBehaviour.weight);
    gui.remember(this.options.sandBehaviour.movement);

    gui.add(this.options, 'enabled')
       .name('Enabled');
    gui.add(this.options, 'dt')
       .min(0.001)
       .max(0.500)
       .step(0.001)
       .name('Speed (dt)');

    this.initializeLayout(gui);
    this.initializeInteractivity(gui);
    this.initializeColors(gui);
    this.initializeFluidBehaviour(gui);
    this.initializeSandBehaviour(gui);
  }

  initializeLayout(gui) {
    const layout = this.options.layout;
    function update() {
      setTimeout(function() {
        if (layout.flipVertical) {
          document.getElementById('flip-container').style.transform = 'scale(1,-1)';
        } else {
          document.getElementById('flip-container').style.transform = 'scale(1,1)';
        }
      }, 0);
      document.getElementById('fade-at-top').style.height = layout.fadeAtTop + '%';
      document.getElementById('fade-at-bottom').style.height = layout.fadeAtBottom + '%';
    };

    let folder = gui.addFolder("Layout");
    folder.add(layout, 'flipVertical').onChange(update).name('Flip Vertically');
    folder.add(layout, 'fadeAtTop').min(0).max(50).name('Fade Top (%)').onChange(update);
    folder.add(layout, 'fadeAtBottom').min(0).max(50).name('Fade Bottom (%)').onChange(update);
    update();
  }


  initializeInteractivity(gui) {
    let folder = gui.addFolder("Interactivity");
    const interactivity = this.options.interactivity;
    folder.add(interactivity, "enabled").name("Camera Enabled")
    folder.add(interactivity, 'resolution', {
                "Low": 128,
                "Medium": 256,
                "High": 512,
                "Very High": 1024
              }).name("Resolution");
    folder.add(interactivity, 'threshold').min(0).max(0.99).step(0.01).name('Threshold');
    folder.add(interactivity, 'flipVertical').name('Flip Vertical');
    folder.add(interactivity, 'flipHorizontal').name('Flip Horizontal');
  }


  initializeColors(gui) {
    const colors = this.options.colors;
    function update(value) {
      setTimeout(function() {
        const css = `linear-gradient(180deg, ${colors.background1} 0%, ${colors.background2} 50%, ${colors.background3} 100%)`;
        document.getElementById('flip-container').style.background = '-moz-' + css;
        document.getElementById('flip-container').style.background = css;
        document.getElementById('flip-container').style.background = '-webkit-' + css;
      }, 0);
    };
    update();
    let folder = gui.addFolder("Color");
    folder.addColor(colors, "background1").onChange(update).name("Background (Top)")
    folder.addColor(colors, "background2").onChange(update).name("Background (Middle)")
    folder.addColor(colors, "background3").onChange(update).name("Background (Bottom)")
    folder.addColor(colors, "sand1").name("Sand 1")
    folder.addColor(colors, "sand2").name("Sand 2")
    folder.addColor(colors, "sand3").name("Sand 3")
    folder.addColor(colors, "sand4").name("Sand 4")
  }


  initializeFluidBehaviour(gui) {
    let folder = gui.addFolder("Fluid Behaviour");
    const fluidBehaviour = this.options.fluidBehaviour;
    folder.add(fluidBehaviour, 'resolution', {
                "Low": 128,
                "Medium": 256,
                "High": 512,
                "Very High": 1024
              }).name("Resolution");
    folder.add(fluidBehaviour, 'solverIterations')
          .min(1)
          .max(20)
          .step(1)
          .name('Solver Iterations');
  }


  initializeSandBehaviour(gui) {
    const folder = gui.addFolder("Sand Behaviour");
    const sandBehaviour = this.options.sandBehaviour;
    folder.add(sandBehaviour, 'resolution', {
                "Low": 128,
                "Medium": 256,
                "High": 512,
                "Very High": 1024
              }).name("Resolution");

    this.initializeSandBehaviourEmission(folder);
    this.initializeSandBehaviourSettlement(folder);
    this.initializeSandBehaviourWeight(folder);
    this.initializeSandBehaviourMovement(folder);
  }

  initializeSandBehaviourEmission(gui) {
    const folder = gui.addFolder("Sand Behaviour / Emission");
    const emission = this.options.sandBehaviour.emission;
    folder.add(emission, 'minRate').min(0).max(100).name('Min Rate');
    folder.add(emission, 'maxRate').min(1).max(100).name('Max Rate');
    folder.add(emission, 'numEmitters').min(0).max(40).step(1).name('Emission Points');
    this.initializeSandBehaviourEmissionBand1(folder);
    this.initializeSandBehaviourEmissionBand2(folder);
  }


  initializeSandBehaviourEmissionBand1(gui) {
    const folder = gui.addFolder("Sand Behaviour / Emission / Band Rates 1");
    const band = this.options.sandBehaviour.emission.band1;
    folder.add(band, 'duration').min(1).max(600).step(1).name('Duration (seconds)');
    folder.add(band, 'sand1').min(0).max(1).name('Sand 1');
    folder.add(band, 'sand2').min(0).max(1).name('Sand 2');
    folder.add(band, 'sand3').min(0).max(1).name('Sand 3');
    folder.add(band, 'sand4').min(0).max(1).name('Sand 4');
  }


  initializeSandBehaviourEmissionBand2(gui) {
    const folder = gui.addFolder("Sand Behaviour / Emission / Band Rates 2");
    const band = this.options.sandBehaviour.emission.band2;
    folder.add(band, 'duration').min(1).max(600).step(1).name('Duration (seconds)');
    folder.add(band, 'sand1').min(0).max(1).name('Sand 1');
    folder.add(band, 'sand2').min(0).max(1).name('Sand 2');
    folder.add(band, 'sand3').min(0).max(1).name('Sand 3');
    folder.add(band, 'sand4').min(0).max(1).name('Sand 4');
  }


  initializeSandBehaviourSettlement(gui) {
    const folder = gui.addFolder("Sand Behaviour / Settlement");
    const settlement = this.options.sandBehaviour.settlement;
    folder.add(settlement, 'resolution', {
                "Extra High Quality": 2048,
                "High Quality": 1024,
                "Medium Quality": 512,
                "Low Quality": 256
              }).name("Resolution");
    folder.add(settlement, 'maxGradient').min(0).max(500).name('Gradient');
    folder.add(settlement, 'maxCoverage').min(0.01).max(0.99).name('Maximum Coverage');
    folder.add(settlement, 'colorShiftLeft').min(-1).max(1).step(0.1).name('Color Shift Left');
    folder.add(settlement, 'colorShiftRight').min(-1).max(1).step(0.1).name('Color Shift Right');
    this.initializeSandBehaviourSettlementRate(folder);
  }


  initializeSandBehaviourSettlementRate(gui) {
    const folder = gui.addFolder("Sand Behaviour / Settlement / Rate");
    const rate = this.options.sandBehaviour.settlement.rate;
    folder.add(rate, 'overall').min(0).max(2).name('Overall');
    folder.add(rate, 'sand1').min(0).max(1).name('Sand 1');
    folder.add(rate, 'sand2').min(0).max(1).name('Sand 2');
    folder.add(rate, 'sand3').min(0).max(1).name('Sand 3');
    folder.add(rate, 'sand4').min(0).max(1).name('Sand 4');
  }


  initializeSandBehaviourWeight(gui) {
    const folder = gui.addFolder("Sand Behaviour / Weight");
    const weight = this.options.sandBehaviour.weight;
    folder.add(weight, 'overall').min(0).max(100).name('Overall');
    folder.add(weight, 'sand1').min(0).max(1).name('Sand 1');
    folder.add(weight, 'sand2').min(0).max(1).name('Sand 2');
    folder.add(weight, 'sand3').min(0).max(1).name('Sand 3');
    folder.add(weight, 'sand4').min(0).max(1).name('Sand 4');
  }


  initializeSandBehaviourMovement(gui) {
    const folder = gui.addFolder("Sand Behaviour / Movement");
    const movement = this.options.sandBehaviour.movement;
    folder.add(movement, 'overall').min(0.1).max(1).name('Overall');
    folder.add(movement, 'sand1').min(0.1).max(1).name('Sand 1');
    folder.add(movement, 'sand2').min(0.1).max(1).name('Sand 2');
    folder.add(movement, 'sand3').min(0.1).max(1).name('Sand 3');
    folder.add(movement, 'sand4').min(0.1).max(1).name('Sand 4');
  }
}
