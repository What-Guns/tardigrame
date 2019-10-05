import {Game} from './game.js';
import {isLoaded} from './loader.js';

async function startTheGameAlready() {
  console.log('Waiting for everything to load');
  await isLoaded();
  console.log(`Everything has loaded now`);
  const canvas = document.querySelector('canvas')!;
  const game = new Game(canvas);
  canvas.addEventListener('mousemove', ev => {
    game.mouseMove(ev);
  })
  canvas.addEventListener('mouseleave', () => {
    game.mouseLeave();
  });

  tick();

  function tick() {
    game.draw();
    requestAnimationFrame(tick);
  }
}

startTheGameAlready();
