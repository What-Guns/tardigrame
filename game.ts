import {Grid} from './grid.js';
import {Hud} from './hud.js';
import {Tardigrade} from './tardigrade.js'
import {Point, distanceSquared, addPoints, assignPoint} from './math.js';
import {Popover, RegretPopover} from './popover.js';
import {liveTardigrades} from './tardigrade.js'

export interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

export const generationOne : number = 10;
export const generationTwo : number = Math.ceil(Math.pow(generationOne, 1.5))
export const generationThree : number = Math.ceil(Math.pow(generationOne, 2))
export const generationFour : number = Math.ceil(Math.pow(generationOne, 2.5))
export const generationFive : number = Math.ceil(Math.pow(generationOne, 3))

export class Game {
  readonly grid : Grid;
  readonly pawns = new Array<Tardigrade>();
  readonly hud = new Hud(this);

  private readonly heldButtons = new Set<number>();

  popover: Popover;

  private readonly screenSpaceMousePotisionAtLeftClick: Point = {x: 0, y: 0};
  readonly screenSpaceMousePosition: Point = {x: 0, y: 0};
  readonly worldSpaceMousePosition: Point = {x: 0, y: 0};

  availableWater = 20;
  debugDrawPaths = false;

  numberToNextGen : number = generationTwo;

  readonly viewport: Viewport;

  private readonly ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.grid = new Grid(this, 100, 100, this.ctx);
    this.viewport  = {
      x: this.grid.columns * this.grid.xPixelsPerCell / 2 - 320,
      y: this.grid.rows * this.grid.yPixelsPerCell / 2 - 320,
      width: 640,
      height: 640,
      scale: 1.0,
    };

    // set up all of the mouse stuff
    canvas.addEventListener('mousemove', this.mouseMove.bind(this));
    canvas.addEventListener('mousedown', ({button}) => {
      if(button === 0) assignPoint(this.screenSpaceMousePotisionAtLeftClick, this.screenSpaceMousePosition);
      this.heldButtons.add(button);
    });
    canvas.addEventListener('mouseup', ({button}) => {
      this.heldButtons.delete(button);
      if(button !== 0) return;
      const draggedDistance = distanceSquared(this.screenSpaceMousePosition, this.screenSpaceMousePotisionAtLeftClick);
      if(draggedDistance > 20) return;
      this.grid.clicked(this.worldSpaceMousePosition);
    });
    canvas.addEventListener('mouseout', () => this.heldButtons.clear());
    canvas.addEventListener('wheel', this.zoom.bind(this));

    // spawn tardigrades in the viewport
    for (let i = 0; i < generationOne; i++){
      const x = this.grid.columns / 2 + Math.random() * 6 - 3;
      const y = this.grid.rows / 2 + Math.random() * 6 - 3;
      this.pawns.push(new Tardigrade(this, x, y));
    }

    // put a water source somewhere near the middle of the game, and some moss next to it.
    const waterSource = 
    this.grid.getCell({
      x: this.grid.columns / 2 + Math.random() * 6 - 3,
      y: this.grid.rows / 2 + Math.random() * 6 - 3,
    });
    waterSource.type = 'WATER_SOURCE';
    this.grid.getCell({
      x: waterSource.point.x + 1,
      y: waterSource.point.y
    }).type = 'MOSS';


    // put some water sources in the corners of the map.
    for(let x = 0; x < 1; x += 0.9) {
      for(let y = 0; y < 1; y += 0.9) {
        this.grid.getCell({
          x: this.grid.columns * (x + Math.random() * 0.1),
          y: this.grid.rows * (y + Math.random() * 0.1)
        }).type = 'WATER_SOURCE';
      }
    }
    this.popover = RegretPopover(this.ctx);
    // this.popover.show();
  }

  tick(dt: number) {
    this.grid.tick(dt);
    for(let i = 0; i < this.pawns.length; i++) {
      this.pawns[i].tick(dt);
    }

    if (liveTardigrades.size >= generationFour){
      //Moon Laser Destroy the Earth
      this.numberToNextGen = generationFive
    } else if (liveTardigrades.size >= generationThree){
      //Mine ice for water
      this.numberToNextGen = generationFour
    } else if (liveTardigrades.size >= generationTwo){
      //Build moss
      this.numberToNextGen = generationThree;
    } else if (liveTardigrades.size > 0){
      //Build canals
      this.numberToNextGen = generationTwo;
    } else if (liveTardigrades.size == 0){
      //Ded
      this.numberToNextGen = generationOne;
    }
   
  }

  draw() {
    this.ctx.clearRect(0, 0, this.viewport.width, this.viewport.height);
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.viewport.width, this.viewport.height);

    this.ctx.setTransform(this.viewport.scale, 0, 0, this.viewport.scale, -this.viewport.x, -this.viewport.y);

    this.grid.draw(this.ctx);
    for (let i = 0; i < this.pawns.length; i++){
      this.pawns[i].draw(this.ctx);
    }

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    this.hud.draw(this.ctx);
    this.popover.draw();
  }

  mouseMove(ev: MouseEvent) {
    if(this.heldButtons.has(0)) {
      const delta = {
        x: this.screenSpaceMousePosition.x - ev.offsetX,
        y: this.screenSpaceMousePosition.y - ev.offsetY
      };
      addPoints(this.viewport, this.viewport, delta);
    }

    this.screenSpaceMousePosition.x = ev.offsetX;
    this.screenSpaceMousePosition.y = ev.offsetY;

    this.worldSpaceMousePosition.x = (ev.offsetX + this.viewport.x) / this.viewport.scale / this.grid.xPixelsPerCell;
    this.worldSpaceMousePosition.y = (ev.offsetY + this.viewport.y) / this.viewport.scale / this.grid.yPixelsPerCell;
  }

  zoom(ev: WheelEvent) {
    this.viewport.x += this.viewport.width / 2;
    this.viewport.y += this.viewport.height / 2;
    this.viewport.x /= this.viewport.scale;
    this.viewport.y /= this.viewport.scale;
    this.viewport.scale += ev.deltaY * - 0.01;
    this.viewport.scale = Math.max(0.25, this.viewport.scale);
    this.viewport.x *= this.viewport.scale;
    this.viewport.y *= this.viewport.scale;
    this.viewport.x -= this.viewport.width / 2;
    this.viewport.y -= this.viewport.height / 2;

    this.mouseMove(ev);
  }
}
