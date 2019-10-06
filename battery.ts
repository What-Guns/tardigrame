import {Game} from './game.js';
import {Point} from './math.js';

export class Battery {
  constructor(private readonly game: Game, private readonly point: Point) {
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.lineWidth = 8;
    ctx.arc(
      this.point.x * this.game.grid.xPixelsPerCell,
      this.point.y * this.game.grid.yPixelsPerCell,
      372/2, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#888';
    ctx.strokeStyle = '#333';
    ctx.fill();
    ctx.stroke();
  }
}
