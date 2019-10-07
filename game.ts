import {Grid} from './grid.js';
import {Battery} from './battery.js';
import {audioContext, startBGM, fadeInBGM0, fadeInBGM1, fadeInBGM2} from './audio.js';
import {Hud} from './hud.js';
import {Tardigrade} from './tardigrade.js'
import {Point, distanceSquared, addPoints, assignPoint} from './math.js';
import {Popover, EmptyPopover, PausePopover, GameWinPopover} from './popover.js';
import {liveTardigrades} from './tardigrade.js'
import { Capsule } from './capsule.js';

export interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

/** The starting generation. Create canals. */
export const generationOne : number = 10;
/** The second generation. Create moss. */
export const generationTwo : number = Math.ceil(Math.pow(generationOne, 1.5))
/** The third generation. Carry the battery. */
export const generationThree : number = Math.ceil(Math.pow(generationOne, 2))
export const generationFour : number = Math.ceil(Math.pow(generationOne, 2.5))
export const generationFive : number = Math.ceil(Math.pow(generationOne, 3))

export class Game {
  readonly grid : Grid;
  readonly pawns = new Array<Tardigrade>();
  readonly batteries = new Array<Battery>();
  readonly capsules = new Array<Capsule>();
  readonly hud = new Hud(this);

  private readonly heldButtons = new Set<number>();

  popover: Popover;

  private readonly screenSpaceMousePotisionAtLeftClick: Point = {x: 0, y: 0};
  readonly screenSpaceMousePosition: Point = {x: 0, y: 0};
  readonly worldSpaceMousePosition: Point = {x: 0, y: 0};

  debugDrawPaths = false;

  numberToNextGen : number = generationTwo;

  readonly viewport: Viewport;

  private readonly ctx: CanvasRenderingContext2D;

  notInGameWindow = false;

  private generation = -1;

  speed = 1;

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

    (window as any).game = this;

    this.popover = EmptyPopover(this.ctx);

    document.addEventListener('visibilitychange', () => {
      if(document.hidden && !this.popover.visible) {
        this.showPopover(PausePopover(this.ctx));
      }
    });

    document.addEventListener('keyup', (ev : KeyboardEvent) => {
      if(!(ev.key === 'p' || ev.key === 'Pause')) return;
      if(!this.popover.visible) {
        this.showPopover(PausePopover(this.ctx));
      } else if(this.popover.imageName == 'PAUSE') {
        this.dismissPopover();
      }
    });

    this.updateListener();

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
      this.clicked();
    });
    canvas.addEventListener('mouseout', () => this.heldButtons.clear());
    canvas.addEventListener('wheel', this.zoom.bind(this));

    this.populateGrid();
    startBGM();
  }

  tick(dt: number) {
    dt *= this.speed;
    this.grid.tick(dt);
    for(let i = 0; i < this.pawns.length; i++) {
      this.pawns[i].tick(dt);
    }

    this.batteries.forEach(b => {if(b.isAtDestination()) this.win()});

    if (liveTardigrades.size >= generationThree){
      //Drag battery
      if(this.generation !== 2) fadeInBGM2();
      this.generation = 2;
      this.numberToNextGen = generationFour
    } else if (liveTardigrades.size >= generationTwo){
      //Build moss
      if(this.generation !== 1) fadeInBGM1();
      this.generation = 1;
      this.numberToNextGen = generationThree;
    } else if (liveTardigrades.size > 0){
      //Build canals
      if(this.generation !== 0) fadeInBGM0();
      this.generation = 0;
      this.numberToNextGen = generationTwo;
    } else if (liveTardigrades.size == 0){
      //Ded
      this.numberToNextGen = generationOne;
    }
   
  }

  draw(timestamp: number) {
    this.ctx.clearRect(0, 0, this.viewport.width, this.viewport.height);
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.viewport.width, this.viewport.height);

    this.ctx.setTransform(this.viewport.scale, 0, 0, this.viewport.scale, -this.viewport.x, -this.viewport.y);

    this.grid.draw(this.ctx, timestamp);

    for(let i=0; i < this.capsules.length; i++) {
      this.capsules[i].drawBG(this.ctx);
    }

    for (let i = 0; i < this.pawns.length; i++){
      this.pawns[i].draw(this.ctx);
    }

    for(let i = 0; i < this.batteries.length; i++) {
      this.batteries[i].draw(this.ctx);
    }

    for(let i=0; i < this.capsules.length; i++) {
      this.capsules[i].draw(this.ctx);
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
      this.updateListener();
    }

    this.screenSpaceMousePosition.x = ev.offsetX;
    this.screenSpaceMousePosition.y = ev.offsetY;

    this.worldSpaceMousePosition.x = (ev.offsetX + this.viewport.x) / this.viewport.scale / this.grid.xPixelsPerCell;
    this.worldSpaceMousePosition.y = (ev.offsetY + this.viewport.y) / this.viewport.scale / this.grid.yPixelsPerCell;
  }

  zoom(ev: WheelEvent) {
    this.viewport.x += this.screenSpaceMousePosition.x / 2;
    this.viewport.y += this.screenSpaceMousePosition.y / 2;
    this.viewport.x /= this.viewport.scale;
    this.viewport.y /= this.viewport.scale;
    const oldScale = this.viewport.scale;
    this.viewport.scale += ev.deltaY * - 0.01;
    this.viewport.scale = Math.max(0.25, this.viewport.scale);
    this.viewport.x *= this.viewport.scale;
    this.viewport.y *= this.viewport.scale;
    this.viewport.x -= (this.screenSpaceMousePosition.x * oldScale / this.viewport.scale) / 2;
    this.viewport.y -= (this.screenSpaceMousePosition.y * oldScale / this.viewport.scale) / 2;

    this.mouseMove(ev);

    this.updateListener();
  }

  private clicked() {
    if(liveTardigrades.size >= generationThree) {
      for(const batt of this.batteries) {
        const distSquared = distanceSquared(batt.point, this.worldSpaceMousePosition);
        if(distSquared < Math.pow(batt.radius, 2)) {
          Tardigrade.assignTardigradeToGetBattery(batt);
          return;
        }
      }
    }
    this.grid.clicked(this.worldSpaceMousePosition);
  }

  private updateListener() {
    const centerX = (this.viewport.x + this.viewport.width / 2) / (this.grid.xPixelsPerCell * this.viewport.scale);
    const centerY = (this.viewport.y + this.viewport.height / 2) / (this.grid.yPixelsPerCell * this.viewport.scale);
    audioContext.listener.setPosition(centerX, centerY, 1);
  }

  isPaused() {
    return this.notInGameWindow || this.popover.visible;
  }

  showPopover(p: Popover) {
    this.dismissPopover();
    this.popover = p;
    this.popover.show();
  }

  dismissPopover() {
    this.popover.hide();
  }

  getGoalOfCurrentGeneration() {
    switch(this.generation) {
      case 0: return generationTwo;
      case 1: return generationThree;
      case 2: return generationFour;
      case 3: return generationFive;
    }
    return generationFive;
  }

  private win() { // it's private to prevent cheaters from cheating!!!!!!
    this.showPopover(GameWinPopover(this.ctx))
  }

  private populateGrid() {

    // put a water source somewhere near the middle of the game
    const waterCell = this.grid.getCell({
      x: this.grid.columns / 2 + Math.random() * 6 - 3,
      y: this.grid.rows / 2 + Math.random() * 6 - 3,
    })
    waterCell.type = 'CAPSULE';

    // put a capsule to generate the water source
    new Capsule(this, waterCell.point);

    // spawn tardigrades near the capsule
    for (let i = 0; i < 100; i++){
      const x = waterCell.point.x + Math.random();
      const y = waterCell.point.y + 1 - Math.random() * 3;
      this.pawns.push(new Tardigrade(this, x, y));
    }

    // put pools / moss in adjacent sources so it looks right
    this.grid.getCell({ x:waterCell.point.x-2, y: waterCell.point.y}).type = 'MOSS';
    this.grid.getCell({ x:waterCell.point.x-2, y: waterCell.point.y}).visible = false;
    this.grid.getCell({ x:waterCell.point.x-1, y: waterCell.point.y}).type = 'POOL';
    this.grid.getCell({ x:waterCell.point.x+1, y: waterCell.point.y}).type = 'POOL';

    // put a bunch of moss blocks somewhere
    for(let i = 0; i < 12; i++) {
      const dir = Math.random() * 2 * Math.PI;
      this.grid.getCell({
        x: this.grid.columns / 2 + Math.cos(dir) * 7,
        y: this.grid.rows / 2 + Math.sin(dir) * 7,
      }).type = 'MOSS';
    }

    // put some water sources in the corners of the map.
    for(let x = 0; x < 1; x += 0.9) {
      for(let y = 0; y < 1; y += 0.9) {
        this.grid.getCell({
          x: this.grid.columns * (x + Math.random() * 0.1),
          y: this.grid.rows * (y + Math.random() * 0.1)
        }).type = 'WATER_SOURCE';
      }
    }

    this.batteries.push(
      new Battery(this, { x: 25, y: 25 }),
      new Battery(this, { x: 75, y: 75 })
    );
  }
}
