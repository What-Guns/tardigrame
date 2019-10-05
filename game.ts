import {Grid} from './grid.js';
import {Hud} from './hud.js';
import {Tardigrade} from './tardigrade.js'
import {Point} from './math.js';
import {Popover, RegretPopover} from './popover.js';

export class Game {
  readonly grid = new Grid(this, 10, 10);
  readonly pawns = new Array<Tardigrade>();
  readonly hud = new Hud(this);
  popover : Popover;

  readonly mousePosition: Point = {x: 0, y: 0};
  isMouseClicked = false;

  availableWater = 20;

  private readonly ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    canvas.addEventListener('mousemove', this.mouseMove.bind(this));
    canvas.addEventListener('mouseup', () => this.isMouseClicked = false);
    canvas.addEventListener('mousedown', () => this.isMouseClicked = true);
    canvas.addEventListener('mouseout', () => this.isMouseClicked = false);

    for (let i = 0; i < 100; i++){
      this.pawns.push(new Tardigrade(this, Math.random() * 10, Math.random() * 10));
    }

    this.popover = RegretPopover(this.ctx);
    // this.popover.show();
  }

  tick(dt: number) {
    this.grid.tick();
    for(let i = 0; i < this.pawns.length; i++) {
      this.pawns[i].tick(dt);
    }
  }

  draw() {
    const w = this.ctx.canvas.width;
    const h = this.ctx.canvas.height;
    this.ctx.clearRect(0, 0, w, h);
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, w, h);

    this.grid.draw(this.ctx);
    for (let i = 0; i < 100; i++){
      this.pawns[i].draw(this.ctx);
    }
    

    this.hud.draw(this.ctx);
    this.popover.draw();
  }

  mouseMove(ev: MouseEvent) {
    this.mousePosition.x = ev.offsetX;
    this.mousePosition.y = ev.offsetY;
  }
}
