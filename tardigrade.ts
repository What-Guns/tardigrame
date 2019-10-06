import {loadImage} from './loader.js';
import {Point, direction, distanceSquared, findNearestVeryExpensive} from './math.js';
import {Game} from './game.js';
import {Cell, cellsThatNeedWorkDone} from './cell.js';
import {TardigradeActivity, IdleActivity, RehydrateActivity, idleTardigrades, BuildActivity} from './tardigradeActivities.js';

export const liveTardigrades = new Set<Tardigrade>();
export const tunTardigrades = new Set<Tardigrade>();
export const deadTardigrades = new Set<Tardigrade>();

type State = 'LIVE' | 'TUN' | 'DEAD'

const DESTINATION_THRESHOLD = 0.01;

export class Tardigrade {
  readonly point: Point;

  currentCell!: Cell;

  private _activity: TardigradeActivity;
  set activity(a : TardigradeActivity) {
    this._activity = a;
  }
  get activity() {
    return this._activity;
  }

  moss = 0.4; // 0 is starved, 1 babby formed from gonad
  fluid = Math.random() * 0.5 + 0.5;
  dehydrationSpeed : number = 0.00005; // thirst per millisecond
  hydrationSpeed : number = 0.0001; // antithirst per millisecond

  nutrientConsumptionRate: number = 0.1;
  starvationRate : number = 0;
  state : State = 'LIVE';
  animationState = 0;
  animationRate = (Math.random() * 500) + 500;

  // in grid cells per second
  readonly speed = 0.2;

  static assignTardigradesToBuild(cell: Cell) {
    const count = cell.type === 'PLANNED_MOSS' ? 2 : 5;
    for(const t of findIdleTardigrades(cell, count)) {
      t.activity = new BuildActivity(t, cell);
    }
  }

  constructor(readonly game: Game, x: number, y: number) {
    this.point = {x, y};
    this._activity = new IdleActivity(this);
    idleTardigrades.add(this);
    this.state = 'LIVE';
    liveTardigrades.add(this)
    this.currentCell = this.game.grid.getCell(this.point);
  }

  tick(dt: number) {
    this.move(dt);
    this.updateHydration(dt);
    this.updateState();
    this.updateActivity(dt);
    this.updateAnimations(dt);
  }

  move(dt: number) {
    if(this.state !== 'LIVE') return;
    const dir = direction(this.point, this.activity.destination);
    const distSquared = distanceSquared(this.point, this.activity.destination);
    if(distSquared > DESTINATION_THRESHOLD) {
      const movement = Math.min(this.speed * dt / 1000, Math.sqrt(distSquared));
      this.point.x += Math.cos(dir) * movement;
      this.point.y += Math.sin(dir) * movement;
    }
    this.point.x = Math.min(Math.max(0, this.point.x), this.game.grid.columns);
    this.point.y = Math.min(Math.max(0, this.point.y), this.game.grid.rows);
    this.currentCell = this.game.grid.getCell(this.point);
  }

  updateHydration(dt: number) {
    if(this.currentCell.hydration) {
      this.fluid = Math.min(1, this.fluid + this.hydrationSpeed * dt);
    } else {
      this.fluid = Math.max(0, this.fluid - this.dehydrationSpeed * dt);
    }
    if(this.fluid < 0.3 && !(this.activity instanceof RehydrateActivity)) {
      this.activity = new RehydrateActivity(this);
    }
  }

  updateState() {
    if(this.state !== 'TUN' && (this.fluid <= 0 || this.moss <= 0)){
      this.state = 'TUN'
      liveTardigrades.delete(this);
      tunTardigrades.add(this);
    }
  }

  updateActivity(dt: number) {
    if(this.activity.isValid()) {
      this.activity.perform(dt);
    } else {
      this.findSomethingToDo();
    }
  }

  updateAnimations(dt: number) {
    const cycleLength = this.activity.animations.length * this.animationRate;
    this.animationState += dt;
    if(this.animationState > cycleLength) {
      this.animationState -= cycleLength;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const image = this.chooseImageToDraw()
    ctx.drawImage(
      image,
      this.point.x * this.game.grid.xPixelsPerCell - image.width/2,
      this.point.y * this.game.grid.yPixelsPerCell - image.height/2
    );

    if(!(this.activity instanceof IdleActivity) && this.game.debugDrawPaths) {
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.point.x * this.game.grid.xPixelsPerCell, this.point.y * this.game.grid.yPixelsPerCell);
      ctx.lineTo(this.activity.destination.x * this.game.grid.xPixelsPerCell, this.activity.destination.y * this.game.grid.yPixelsPerCell);
      ctx.stroke();
    }

    const mouseDistSquared = distanceSquared(this.point, this.game.worldSpaceMousePosition);

    if(mouseDistSquared < 4) {
      ctx.globalAlpha = mouseDistSquared < 1 ? 1 : (4 - (mouseDistSquared - 1)) / 3;
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'blue';
      ctx.beginPath();
      ctx.arc(
        this.point.x * this.game.grid.xPixelsPerCell,
        this.point.y * this.game.grid.yPixelsPerCell,
        16,
        0,
        2 * Math.PI * this.fluid,
        false
      );
      ctx.stroke();
      ctx.strokeStyle = 'coral';
      ctx.beginPath();
      ctx.arc(
        this.point.x * this.game.grid.xPixelsPerCell,
        this.point.y * this.game.grid.yPixelsPerCell,
        14,
        0,
        2 * Math.PI * this.moss,
        false
      );
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  chooseImageToDraw() : HTMLImageElement {
    if(this.state === 'DEAD' || this.state === 'TUN') return deadImage;
    return this.activity.animations[Math.floor(this.animationState / this.animationRate)];
  }

  private findSomethingToDo() {
    const cell = findNearestVeryExpensive(Array.from(cellsThatNeedWorkDone), this.point, 1)[0];
    if(cell) {
      this.activity = new BuildActivity(this, cell);
    } else {
      this.activity = new IdleActivity(this);
    }
  }
}

const deadImage = loadImage('assets/pictures/deadigrade.png');

function findIdleTardigrades(cell: Cell, howMany: number) {
  const point = {x: cell.point.x + 0.5, y: cell.point.y + 0.5};
  return findNearestVeryExpensive(Array.from(idleTardigrades), point, howMany);
}
