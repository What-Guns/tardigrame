import {Grid} from './grid.js';
import {loadImage} from './loader.js';

export class Game {
  readonly grid = new Grid(10, 10);
  regret : boolean = false;
  regretImage : HTMLImageElement = loadImage('assets/pictures/regret.png')

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
    if(this.regret) {
      this.ctx.drawImage(this.regretImage, 80, 280);
    }
  }

  mouseMove(ev: MouseEvent) {
    this.grid.mouseX = ev.offsetX;
    this.grid.mouseY = ev.offsetY;
  }

  mouseLeave() {
    this.grid.mouseX = null;
    this.grid.mouseY = null;
  }
}
