import {loadImage} from './loader.js';
import {Point, direction, distanceSquared, findNearestVeryExpensive} from './math.js';
import {Game} from './game.js';
import {Cell, CONSTRUCTION_REQUIRED_FOR_CANAL, hydratedCells, cellsThatNeedWorkDone} from './cell.js';

export const idleTardigrades = new Set<Tardigrade>();
export const liveTardigrades = new Set<Tardigrade>();
export const tunTardigrades = new Set<Tardigrade>();
export const deadTardigrades = new Set<Tardigrade>();

interface Task {
  type: 'IDLE' | 'BUILDING_A_CANAL' | 'PLANTING_MOSS' | 'REHYDRATE';
  destination: Point;
}

type State = 'LIVE' | 'TUN' | 'DEAD'

const DESTINATION_THRESHOLD = 0.01;

export class Tardigrade {
  readonly point: Point;

  currentCell!: Cell;

  private task: Task;

  satiation = 0.4; // 0 is starved, 1 babby formed from gonad
  fluid = Math.random() * 0.5 + 0.5;
  dehydrationSpeed : number = 0.00005; // thirst per millisecond
  hydrationSpeed : number = 0.0001; // antithirst per millisecond

  nutrientConsumptionRate: number = 0.1;
  starvationRate : number = 0;
  state : State = 'LIVE';


  // in grid cells per second
  readonly speed = 0.2;

  constructor(readonly game: Game, x: number, y: number) {
    this.point = {x, y};
    this.task = {
      destination: {x, y},
      type: 'IDLE'
    }
    idleTardigrades.add(this);
    this.state = 'LIVE';
    liveTardigrades.add(this)
    this.currentCell = this.game.grid.getCell(this.point);
  }

  tick(dt: number) {
    if(!this.isDehydrated()) this.move(dt);
    this.currentCell = this.game.grid.getCell(this.point);

    if(this.fluid < 0.3 && this.task.type !== 'REHYDRATE') {
      const nearestWater = Array.from(hydratedCells)
        .map(cell => ({cell, dist2: distanceSquared(this.point, cell.point)}))
        .sort((a, b) => a.dist2 - b.dist2)
        .map(t => t.cell)[0];
      const destination = nearestWater ? {x: nearestWater.point.x + 0.5, y: nearestWater.point.y + 0.5} : {x: 0, y: 0};
      this.assignTask({
        type: 'REHYDRATE',
        destination,
      });
    }

    if(!this.isDehydrated()) this.performTask(dt);

    if(this.currentCell.hydration) {
      this.fluid = Math.min(1, this.fluid + this.hydrationSpeed * dt);
    } else {
      this.fluid = Math.max(0, this.fluid - this.dehydrationSpeed * dt);
    }
  }

  // private performTask(dt: number) {
  //   if(this.task.type === 'IDLE' && distanceSquared(this.point, this.task.destination) <= DESTINATION_THRESHOLD) {
  //     this.task.destination.x = Math.random() * 10;
  //     this.task.destination.y = Math.random() * 10;
  //     return;
  //   }

  //   if(
  //     this.task.type === 'BUILDING_A_CANAL'
  //     && Math.abs(this.point.x - this.task.destination.x) < 0.5
  //     && Math.abs(this.point.y - this.task.destination.y) < 0.5
  //   ) {
  //     const cell = this.game.grid.getCell(this.task.destination);
  //     cell.amountConstructed += dt;

  //     if(cell.amountConstructed >= CONSTRUCTION_REQUIRED_FOR_CANAL) {
  //       cell.type = 'POOL';
  //     }

  //     if(cell.type !== 'PLANNED_CANAL') {
  //       this.assignTask({type: 'IDLE', destination: {...this.point}});
  //     }
  //   }
  // }

  isTunAndRehydrated(){
    if (this.state === 'TUN' && this.fluid > 0 )
    {
      tunTardigrades.delete(this);
      liveTardigrades.add(this);
    }
  }

  isDehydrated() {
    this.state = 'TUN'
    liveTardigrades.delete(this);
    tunTardigrades.add(this);
    return this.fluid <= 0;
  }

  isStarved() {
    this.state = 'TUN'
    liveTardigrades.delete(this);
    tunTardigrades.add(this);
    return this.satiation <= 0
  }

  isHungry(dt: number) {
    if(!this.isStarved()) {
      this.satiation -= this.starvationRate * dt;
    }
  }

  isSatiated(){
    if (!this.isStarved && this.satiation == 1){
      this.game.pawns.push(new Tardigrade(this.game, this.point.x * 10, this.point.y * 10));
      this.satiation = 0.3;
    }
  }

  move(dt: number) {
    const dir = direction(this.point, this.task.destination);
    const distSquared = distanceSquared(this.point, this.task.destination);
    if(distSquared > DESTINATION_THRESHOLD) {
      const movement = Math.min(this.speed * dt / 1000, Math.sqrt(distSquared));
      this.point.x += Math.cos(dir) * movement;
      this.point.y += Math.sin(dir) * movement;
    }
    this.point.x = Math.min(Math.max(0, this.point.x), this.game.grid.columns);
    this.point.y = Math.min(Math.max(0, this.point.y), this.game.grid.rows);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(
      this.isDehydrated() ? deadImage : image,
      this.point.x * this.game.grid.xPixelsPerCell - image.width/2,
      this.point.y * this.game.grid.yPixelsPerCell - image.height/2
    );

    if(this.task.type !== 'IDLE' && this.game.debugDrawPaths) {
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.point.x * this.game.grid.xPixelsPerCell, this.point.y * this.game.grid.yPixelsPerCell);
      ctx.lineTo(this.task.destination.x * this.game.grid.xPixelsPerCell, this.task.destination.y * this.game.grid.yPixelsPerCell);
      ctx.stroke();
    }

    if(this.game.debugDrawThirst) {
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
    }
  }

  assignTask(task: Task) {
    this.task = task;
    if(task.type === 'IDLE') {
      idleTardigrades.add(this);
    } else {
      idleTardigrades.delete(this);
    }
  }

  private performTask(dt: number) {
    if(this.task.type === 'IDLE') {
      if(distanceSquared(this.point, this.task.destination) <= DESTINATION_THRESHOLD) {
        this.findSomethingToDo();
      }
    } else if(this.task.type === 'BUILDING_A_CANAL' || this.task.type === 'PLANTING_MOSS') {
      const targetCell = this.game.grid.getCell(this.task.destination);
      if(!cellsThatNeedWorkDone.has(targetCell)) {
        this.findSomethingToDo();
        return;
      }

      const myCell = this.game.grid.getCell(this.point);
      if(myCell === targetCell) {
        myCell.amountConstructed += dt;

        if(myCell.type === 'PLANNED_CANAL' && myCell.amountConstructed >= CONSTRUCTION_REQUIRED_FOR_CANAL) {
          myCell.type = 'POOL';
          this.findSomethingToDo();
        }

        if(myCell.type === 'PLANNED_MOSS') {
          myCell.type = 'MOSS';
          this.findSomethingToDo();
        }
      }
    } else if(this.task.type === 'REHYDRATE') {
      if(this.fluid >= 1) this.findSomethingToDo();
    }
  }

  private findSomethingToDo() {
    const cell = findNearestVeryExpensive(Array.from(cellsThatNeedWorkDone), this.point, 1)[0];
    if(cell) {
      this.assignTask({
        destination: {x: cell.point.x + 0.5, y: cell.point.y + 0.5},
        type: cell.type === 'PLANNED_CANAL' ? 'BUILDING_A_CANAL' : 'PLANTING_MOSS',
      });
    } else {
      this.assignTask({
        type: 'IDLE',
        destination: {
          x: Math.min(Math.max(this.point.x + Math.random() * 10 - 5, 0), this.game.grid.columns),
          y: Math.min(Math.max(this.point.y + Math.random() * 10 - 5, 0), this.game.grid.rows),
        }
      });
    }
  }
}

const image = loadImage('assets/pictures/tardy-tardigrade.png');
const deadImage = loadImage('assets/pictures/deadigrade.png');

export function findIdleTardigrades(cell: Cell, howMany: number) {
  const point = {x: cell.point.x + 0.5, y: cell.point.y + 0.5};
  return findNearestVeryExpensive(Array.from(idleTardigrades), point, howMany);
}
