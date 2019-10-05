import {Grid} from './grid.js';
import {Point} from './math.js';
import {Pawn} from './pawn.js'

export class Game {
  readonly grid = new Grid(this, 10, 10);
  readonly mousePosition: Point = {x: 0, y: 0};
  readonly pawn = new Pawn(this, Math.random() * 10, Math.random() * 10, 'MOON_AGENT');

  isMouseClicked = false;

  private readonly ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;

    canvas.addEventListener('mousemove', this.mouseMove.bind(this));
    canvas.addEventListener('mouseup', () => this.isMouseClicked = false);
    canvas.addEventListener('mousedown', () => this.isMouseClicked = true);
    canvas.addEventListener('mouseout', () => this.isMouseClicked = false);
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
}
