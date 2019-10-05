import {Game} from './game.js';
import {isLoaded} from './loader.js';

async function startTheGameAlready() {
  console.log('Waiting for everything to load');
  await isLoaded();
  console.log(`Everything has loaded now`);
  const game = new Game(document.querySelector('canvas')!);

  tick();

  function tick() {
    game.draw();
    requestAnimationFrame(tick);
  }
}

startTheGameAlready();
