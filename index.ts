import {Game} from './game.js';
import {isLoaded} from './loader.js';
import {audioContext} from './audio.js';

let lastTick = 0;

// any tick longer than this will be split into smaller ticks
const BIG_TICK = 500;

isLoaded().then(() => {
  //(document.getElementById('start') as HTMLButtonElement).disabled = false;
  const bg : HTMLImageElement = (document.getElementById('bg') as HTMLImageElement);
  const button : HTMLImageElement  = (document.getElementById('startButton') as HTMLImageElement);
  button.style.display = 'inline';
  button.style.position = 'absolute';
  button.style.left = `${bg.width / 6}px`
  button.style.top = `${bg.height * 3 / 5}px`
  button.style.width = `${bg.width / bg.naturalWidth * button.width}px`
  button.style.height = `${bg.height / bg.naturalHeight * button.height}px`
  //= "display: inline; position: absolute; top: 80%; left: 20%"
});

function startTheGameAlready() {
  document.getElementById('bg')!.remove();
  document.getElementById('startButton')!.remove();
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

