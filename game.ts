import {Grid} from './grid.js';

export class Game {
  readonly grid = new Grid(10, 10);

  private readonly ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
  }

  draw() {
    const w = this.ctx.canvas.width;
    const h = this.ctx.canvas.height;
    this.ctx.clearRect(0, 0, w, h);
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, w, h);

    this.grid.draw(this.ctx);
  }

  mouseMove(ev: MouseEvent) {
    this.grid.mouseX = ev.clientX;
    this.grid.mouseY = ev.clientY;
  }

  mouseLeave() {
    this.grid.mouseX = null;
    this.grid.mouseY = null;
  }
}
