window.frames = 0;
window.currentCursorPosition = null;
window.newCursorPosition = null;
window.oldCursorPosition = null;
window.pointerDown = false;

function tick() {
  if (!window.options.enabled)
    return requestAnimationFrame(tick);

  if (options.fpsEnabled) stats.begin();

  if (currentCursorPosition) {
    oldCursorPosition = newCursorPosition || currentCursorPosition;
    newCursorPosition = currentCursorPosition;
    let cursorVelocity = [oldCursorPosition[0] - newCursorPosition[0],
                          oldCursorPosition[1] - newCursorPosition[1]];
    var c = Math.floor(Math.random()*255);
    fluidSolver.setMouseMotion(newCursorPosition, cursorVelocity, pointerDown);
  }

  frames++;
  sandSource.tick(options.dt);
  fluidSolver.tick(options.dt);
  sandSolver.tick(options.dt);
  ghostMaker.tick(options.dt);

  requestAnimationFrame(tick);
  if (options.fpsEnabled) stats.end();
}


function main() {
  window.options = new Options().options
  var glContext = new GLContext(document.getElementById('fluid-canvas'));
  window.sandSolver = new SandSolver(glContext, document.getElementById('sand-canvas'), options);
  window.sandSource = new SandSource(glContext, options);
  window.fluidSolver = new FluidSolver(glContext, options);
  window.ghostMaker = new GhostMaker(glContext, options)
  fluidSolver.setSourceTexture(sandSource.texture);
  fluidSolver.setSettlementTexture(sandSolver.texture);
  fluidSolver.setGhostSourceTexture(ghostMaker.texture);
  fluidSolver.setHeightMapTexture(sandSolver.heightMapTexture);
  document.body.addEventListener('mousemove', (e) => {
    currentCursorPosition = [e.clientX / document.body.clientWidth,
                             e.clientY / document.body.clientHeight];
  });
  window.addEventListener('mouseout', (e) => newCursorPosition = null);
  window.addEventListener('mousedown', (e) => pointerDown = true);
  window.addEventListener('mouseup', (e) => pointerDown = false);
  window.addEventListener('touchstart', (e) => pointerDown = true);
  window.addEventListener('touchend', (e) => pointerDown = false);

  window.stats = new Stats();
  stats.showPanel(0);
  tick();
}
