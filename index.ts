import {Game} from './game.js';

const game = new Game(document.querySelector('canvas')!);

tick();

function tick() {
  game.draw();
  requestAnimationFrame(tick);
}
