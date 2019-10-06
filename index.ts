import {Game} from './game.js';
import {isLoaded} from './loader.js';

let lastTick = 0;

// any tick longer than this will be split into smaller ticks
const BIG_TICK = 500;

async function startTheGameAlready() {
  console.log('Waiting for everything to load');
  await isLoaded();
  console.log(`Everything has loaded now`);
  const canvas = document.querySelector('canvas')!;
  const game = new Game(canvas);
  sizeCanvas();
  requestAnimationFrame(tick);

  addEventListener('resize', sizeCanvas);

  function tick(timestamp: number) {
    if(lastTick !== 0) {
      let dt = timestamp - lastTick;
      while(dt > 0 && !game.isPaused()) {
        game.tick(Math.min(BIG_TICK, dt));
        dt = Math.max(0, dt - BIG_TICK);
      }
      game.draw();
    }

    lastTick = timestamp;
    requestAnimationFrame(tick);
  }

  function sizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const oldCenter = {
      x: game.viewport.x + game.viewport.width / 2,
      y: game.viewport.y + game.viewport.height / 2,
    };

    game.viewport.width = canvas.width;
    game.viewport.height = canvas.height;

    game.viewport.x = oldCenter.x - game.viewport.width / 2;
    game.viewport.y  = oldCenter.y - game.viewport.height / 2;
  }
}

startTheGameAlready();

