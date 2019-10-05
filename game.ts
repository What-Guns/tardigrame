import {Grid} from './grid.js';
import {Point} from './math.js';
import {Pawn} from './pawn.js'
import { PawnType } from './pawnType.js';
export class Game {
  readonly grid = new Grid(this, 10, 10);
  readonly mousePosition: Point = {x: 0, y: 0};
  readonly pawn = new Pawn(Math.random() * 10, Math.random() * 10, PawnType.MOON_AGENT)

  private readonly ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
  }

  tick() {
    this.grid.tick();
  }

  draw() {
    const w = this.ctx.canvas.width;
    const h = this.ctx.canvas.height;
    this.ctx.clearRect(0, 0, w, h);
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, w, h);

    this.grid.draw(this.ctx);
    this.pawn.draw(this.ctx);

  }

  mouseMove(ev: MouseEvent) {
    this.mousePosition.x = ev.offsetX;
    this.mousePosition.y = ev.offsetY;
  }

  mouseUp() {
  }
}
