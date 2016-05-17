window.defaultOptions = {
  dt: 0.05,
  layout: {
    flipVertical: false,
    fadeAtTop: 0,
    fadeAtBottom: 0
  },
  interactivity: {
    enabled: true,
    resolution: 512,
    threshold: 0.1,
    flipVertical: false,
    flipHorizontal: false
  },
  colors: {
    background1: "#ffffff",
    background2: "#333333",
    background3: "#000000",
    sand1: [255,255,255],
    sand2: [240,187,130],
    sand3: [8,8,8],
    sand4: [255,0,128]
  },
  fluidBehaviour: {
    resolution: 256,
    solverIterations: 2
  },
  sandBehaviour: {
    resolution: 1024,
    emission: {
      numEmitters: 7,
      minRate: 10,
      maxRate: 40,
      band1: {
        duration: 5,
        sand1: 1.00,
        sand2: 0.75,
        sand3: 0.50,
        sand4: 0.25
      },
      band2: {
        duration: 5,
        sand1: 0.25,
        sand2: 0.50,
        sand3: 0.75,
        sand4: 1.00
      }
    },
    settlement: {
      resolution: 1024,
      maxGradient: 200,
      maxCoverage: 0.33,
      rate: {
        overall: 1,
        sand1: 1,
        sand2: 1,
        sand3: 1,
        sand4: 1
      }
    },
    weight: {
      overall: 100,
      sand1: 0.25,
      sand2: 0.5,
      sand3: 1,
      sand4: 1
    },
    movement: {
      overall: 1,
      sand1: 1,
      sand2: 1,
      sand3: 1,
      sand4: 1
    }
  }
}
