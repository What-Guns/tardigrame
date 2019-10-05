import {Game} from './game.js';

export class Hud {
  constructor(private readonly game: Game) {

  }

  draw(ctx: CanvasRenderingContext2D) {
    const message = `Available water: ${this.game.availableWater}`;
    ctx.fillStyle = 'black';
    ctx.font = '24px system-ui';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeText(message, 10, 10);
    ctx.fillText(message, 10, 10);
  }
}
