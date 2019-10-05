import {Grid} from './grid.js';
import {Hud} from './hud.js';
import {Tardigrade} from './tardigrade.js'
import {Point, Rect, addPoints} from './math.js';
import {Popover, RegretPopover} from './popover.js';

export type Tool = 'WATER'|'PAN';

export class Game {
  readonly grid = new Grid(this, 100, 100);
  readonly pawns = new Array<Tardigrade>();
  readonly hud = new Hud(this);

  tool: Tool = 'PAN';

  popover : Popover;

  readonly screenSpaceMousePosition: Point = {x: 0, y: 0};
  readonly worldSpaceMousePosition: Point = {x: 0, y: 0};
  isMouseClicked = false;

  availableWater = 20;

  readonly viewport: Rect = {
    x: 0,
    y: 0,
    width: 640,
    height: 640,
  };

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
    this.ctx.clearRect(0, 0, this.viewport.width, this.viewport.height);
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.viewport.width, this.viewport.height);

    this.ctx.setTransform(1, 0, 0, 1, -this.viewport.x, -this.viewport.y);

    this.grid.draw(this.ctx);
    for (let i = 0; i < 100; i++){
      this.pawns[i].draw(this.ctx);
    }

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    

    this.hud.draw(this.ctx);
    this.popover.draw();
  }

  mouseMove(ev: MouseEvent) {
    if(this.isMouseClicked && this.tool === 'PAN') {
      this.viewport.x += this.screenSpaceMousePosition.x - ev.offsetX;
      this.viewport.y += this.screenSpaceMousePosition.y - ev.offsetY;

    }

    this.screenSpaceMousePosition.x = ev.offsetX;
    this.screenSpaceMousePosition.y = ev.offsetY;
    addPoints(this.worldSpaceMousePosition, this.screenSpaceMousePosition, this.viewport);
  }
}
