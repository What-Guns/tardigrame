import {Game} from './game.js';
import {isLoaded} from './loader.js';
import {audioContext} from './audio.js';

let lastTick = 0;

// any tick longer than this will be split into smaller ticks
const BIG_TICK = 500;

isLoaded().then(() => {
  (document.getElementById('start') as HTMLButtonElement).disabled = false;
});

function startTheGameAlready() {
  document.getElementById('start')!.remove();
  document.getElementById('game-container')!.style.display = '';
  const canvas = document.querySelector('canvas')!;
  const game = new Game(canvas);
  sizeCanvas();
  requestAnimationFrame(tick);

  audioContext.resume();

  addEventListener('resize', sizeCanvas);

  function tick(timestamp: number) {
    if(lastTick !== 0) {
      const dt = Math.min(timestamp - lastTick, BIG_TICK);
      if(!game.isPaused()) game.tick(dt);
      game.draw(timestamp);
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

(window as any).startTheGameAlready = startTheGameAlready;

