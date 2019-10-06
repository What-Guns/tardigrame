import {Game} from './game.js';
import {Point} from './math.js';

export class Battery {
  readonly radius = (372/2) / this.game.grid.xPixelsPerCell;

  constructor(private readonly game: Game, readonly point: Point) {
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.lineWidth = 8;
    ctx.arc(
      this.point.x * this.game.grid.xPixelsPerCell,
      this.point.y * this.game.grid.yPixelsPerCell,
      this.radius * this.game.grid.xPixelsPerCell, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#888';
    ctx.strokeStyle = '#333';
    ctx.fill();
    ctx.stroke();
  }
}
