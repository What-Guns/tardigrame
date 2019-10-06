import {Game, Tool} from './game.js';
import {isLoaded} from './loader.js';

let lastTick = 0;

type Debug = 'GRIDLINES';

async function startTheGameAlready() {
  console.log('Waiting for everything to load');
  await isLoaded();
  console.log(`Everything has loaded now`);
  const canvas = document.querySelector('canvas')!;
  const game = new Game(canvas);
  requestAnimationFrame(tick);

  function tick(timestamp: number) {
    if(lastTick !== 0) {
      const dt = timestamp - lastTick;
      game.tick(dt);
      game.draw();
    }

    lastTick = timestamp;
    requestAnimationFrame(tick);
  }

  const toolControls = Array.from(
    document.querySelectorAll<HTMLInputElement>('[data-tool-input]'));

  for(const control of toolControls) {
    control.addEventListener('change', () => {
      game.tool = control.value as Tool;
    });
  }

  const debugControls = Array.from(
    document.querySelectorAll<HTMLInputElement>('[data-debug]'));

  for(const debug of debugControls) {
    debug.addEventListener('change', () => {
      switch(debug.value as Debug) {
        case 'GRIDLINES':
          game.grid.drawGridLines = !game.grid.drawGridLines;
          break;
      }
    })
  }
}

startTheGameAlready();
