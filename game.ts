import {Grid} from './grid.js';
import {Hud} from './hud.js';
import {Pawn} from './pawn.js'
<<<<<<< HEAD
import {Point} from './math.js';

export class Game {
  readonly grid = new Grid(this, 10, 10);
  readonly pawns = new Array<Pawn>();
  readonly hud = new Hud(this);
=======
import {Popover, RegretPopover} from './popover.js';

export class Game {
  readonly grid = new Grid(this, 10, 10);
  readonly mousePosition: Point = {x: 0, y: 0};
  readonly popover : Popover;
  readonly pawn = new Pawn(this, Math.random() * 10, Math.random() * 10, 'MOON_AGENT');
>>>>>>> Add popovers

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
<<<<<<< HEAD

    for (let i = 0; i < 100; i++){
      this.pawns.push(new Pawn(this, Math.random() * 10, Math.random() * 10, 'MOON_AGENT'));
    }
=======
    this.popover = RegretPopover(this.ctx);
    this.popover.show();
>>>>>>> Add popovers
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
<<<<<<< HEAD
    for (let i = 0; i < 100; i++){
      this.pawns[i].draw(this.ctx);
    }
    

    this.hud.draw(this.ctx);
=======
    this.pawn.draw(this.ctx);
    this.popover.draw();
>>>>>>> Add popovers
  }

  mouseMove(ev: MouseEvent) {
    this.mousePosition.x = ev.offsetX;
    this.mousePosition.y = ev.offsetY;
  }
}
