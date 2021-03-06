window.defaultOptions = {
  dt: 0.05,
  layout: {
    flipVertical: false,
    fadeAtTop: 50,
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
    background1: "#000000",
    background2: "#666666",
    background3: "#CCCCCC",
    sand1: "#FFFFFF",
    sand2: "#999999",
    sand3: "#333333",
    sand4: "#669966"
  },
  fluidBehaviour: {
    resolution: 256,
    solverIterations: 2
  },
  sandBehaviour: {
    resolution: 1024,
    emission: {
      numEmitters: 8,
      minRate: 10,
      maxRate: 50,
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
      maxCoverage: 0.20,
      rate: {
        overall: 1,
        sand1: 1,
        sand2: 1,
        sand3: 1,
        sand4: 0.1
      }
    },
    weight: {
      overall: 50,
      sand1: 1,
      sand2: 0.75,
      sand3: 0.50,
      sand4: 0.25
    },
    movement: {
      overall: 1,
      sand1: 1.0,
      sand2: 0.8,
      sand3: 0.6,
      sand4: 0.4
    }
  }
}
