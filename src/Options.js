window.Options = class Options {
  constructor() {
    this.dt = 0.05;

    this.flipScreen = false;
    this.edgeFade = 0;

    this.fluid = {
      pressureSolveIterations: 2,
      resolution: 256
    };

    this.source = {
      minRate: 10,
      maxRate: 20,
      numEmitters: 7
    };

    this.settlement = {
      settlementSize: 1024,
      settlementRate: 1,
      settlementGradient: 200,
      maxWeight: 0.33
    };
    this.sand1 = {
      name: 'Sand 1',
      weight: 0.25,
      friction: 1,
      color: [255,255,255]
    };
    this.sand2 = {
      name: 'Sand 2',
      weight: 0.5,
      friction: 1,
      color: [240,187,130]
    };
    this.sand3 = {
      name: 'Sand 3',
      weight: 1,
      friction: 1,
      color: [8,8,8]
    };
    this.sand4 = {
      name: 'Sand 4',
      weight: 1,
      friction: 1,
      color: [255,0,128]
    };
    this.initializeGUI();
  }


  initializeGUI() {
    const gui = new dat.GUI({
      width: 350,
      autoPlace: true
    });

    gui.remember(this);

    gui.add(this, 'dt')
       .min(0.01)
       .max(0.50)
       .step(0.01)
       .name('Time Delta (dt)');

    this.initializeOverallGUI(gui);
    this.initializeFluidGUI(gui);
    this.initializeSourceGUI(gui);
    this.initializeSettlementGUI(gui);
    this.initializeSandGUI(gui);

    gui.close();
  }

  initializeOverallGUI(gui) {
    gui.add(this, 'flipScreen')
       .name('Flip Screen')
       .onChange(function(value) {
         if (value) {
          document.getElementById('container').style.transform = 'scale(1,-1)';
         } else {
          document.getElementById('container').style.transform = 'scale(1,1)';
         }
       });
    gui.add(this, 'edgeFade')
       .min(0)
       .max(100)
       .name('Edge Fade')
       .onChange(function(value) {
          document.getElementById('fade-at-bottom').style.height = value + '%';
       });
  }


  initializeFluidGUI(gui) {
    let folder = gui.addFolder("Fluid");
    folder.add(this.fluid, 'pressureSolveIterations')
          .min(1)
          .max(40)
          .step(1)
          .name('Solver Iterations');
  }


  initializeSourceGUI(gui) {
    const folder = gui.addFolder("Sand Source");
    folder.add(this.source, 'minRate')
          .min(0)
          .max(100)
          .name('Min Rate');
    folder.add(this.source, 'maxRate')
          .min(1)
          .max(100)
          .name('Max Rate');
    folder.add(this.source, 'numEmitters')
          .min(0)
          .max(20)
          .step(1)
          .name('Num Emitters');
  }


  initializeSettlementGUI(gui) {
    const folder = gui.addFolder("Settlement");
    folder.add(this.settlement, 'settlementRate')
          .min(0)
          .max(2)
          .name('Settlement Rate');
    folder.add(this.settlement, 'settlementGradient')
          .min(0)
          .max(500)
          .name('Settlement Gradient');
    folder.add(this.settlement, 'settlementSize', {
                "Extra High Quality": 2048,
                "High Quality": 1024,
                "Medium Quality": 512,
                "Low Quality": 256
              });
    folder.add(this.settlement, 'maxWeight')
          .min(0.01)
          .max(0.99)
          .name('Maximum Weight');
  }


  initializeSandGUI(gui) {
    for (let sandOptions of [
      this.sand1,
      this.sand2,
      this.sand3,
      this.sand4]) {
      const folder = gui.addFolder(sandOptions.name);
      folder.addColor(sandOptions, 'color')
            .name('Color');
      folder.add(sandOptions, 'weight')
            .min(0)
            .max(2)
            .name('Weight');
      folder.add(sandOptions, 'friction')
            .min(0)
            .max(1)
            .name('Friction');
    }
  }
}
