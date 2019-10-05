import {loadImage} from './loader.js';
import {Point, direction, distanceSquared} from './math.js';
import {Game} from './game.js';
import {Cell, CONSTRUCTION_REQUIRED_FOR_CANAL, hydratedCells} from './cell.js';

export const idleTardigrades = new Set<Tardigrade>();

interface Task {
  type: 'IDLE' | 'BUILDING_A_CANAL' | 'REHYDRATE';
  destination: Point;
}

const DESTINATION_THRESHOLD = 0.01;

export class Tardigrade {
  readonly point: Point;

  currentCell!: Cell;

  private task: Task;

  satiation = 0.4; // 0 is starved, 1 babby formed from gonad
  fluid = Math.random() * 0.5 + 0.5;
  dehydrationSpeed : number = 0.0001; // thirst per millisecond
  hydrationSpeed : number = 0.1; // antithirst per millisecond

  nutrientConsumptionRate: number = 0.1;
  starvationRate : number = 0;

  // in grid cells per second
  readonly speed = 0.1;

  constructor(readonly game: Game, x: number, y: number) {
    this.point = {x, y};
    this.task = {
      destination: {x, y},
      type: 'IDLE'
    }
    idleTardigrades.add(this);
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

    if(this.currentCell.type === 'POOL') {
      this.fluid = Math.min(1, this.fluid + this.hydrationSpeed * dt);
    } else {
      this.fluid = Math.max(0, this.fluid - this.dehydrationSpeed * dt);
    }
  }

  private performTask(dt: number) {
    if(this.task.type === 'IDLE' && distanceSquared(this.point, this.task.destination) <= DESTINATION_THRESHOLD) {
      this.task.destination.x = Math.random() * 10;
      this.task.destination.y = Math.random() * 10;
      return;
    }

    if(
      this.task.type === 'BUILDING_A_CANAL'
      && Math.abs(this.point.x - this.task.destination.x) < 0.5
      && Math.abs(this.point.y - this.task.destination.y) < 0.5
    ) {
      const cell = this.game.grid.getCell(this.task.destination);
      cell.amountConstructed += dt;

      if(cell.amountConstructed >= CONSTRUCTION_REQUIRED_FOR_CANAL) {
        cell.type = 'POOL';
      }

      if(cell.type !== 'PLANNED_CANAL') {
        this.assignTask({type: 'IDLE', destination: {...this.point}});
      }
    }
  }

  isDehydrated() {
    return this.fluid <= 0;
  }

  isStarved() {
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
    const dx = Math.cos(dir) * this.speed * dt / 1000;
    const dy = Math.sin(dir) * this.speed * dt / 1000;
    const distSquared = distanceSquared(this.point, this.task.destination);
    if(distSquared > DESTINATION_THRESHOLD) {
      this.point.x += dx;
      this.point.y += dy;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(
      this.isDehydrated() ? deadImage : image,
      this.point.x * this.game.grid.xPixelsPerCell - image.width/2,
      this.point.y * this.game.grid.yPixelsPerCell - image.height/2
    );

    if(this.task.type !== 'IDLE') {
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.point.x * this.game.grid.xPixelsPerCell, this.point.y * this.game.grid.yPixelsPerCell);
      ctx.lineTo(this.task.destination.x * this.game.grid.xPixelsPerCell, this.task.destination.y * this.game.grid.yPixelsPerCell);
      ctx.stroke();
    }

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

  assignTask(task: Task) {
    this.task = task;
    if(task.type === 'IDLE') {
      idleTardigrades.add(this);
    } else {
      idleTardigrades.delete(this);
    }
  }
}

const image = loadImage('assets/pictures/tardy-tardigrade.png');
const deadImage = loadImage('assets/pictures/deadigrade.png');

export function findIdleTardigrades(near: Point, howMany: number) {
  return Array.from(idleTardigrades)
    .map(tardigrade => ({tardigrade, dist2: distanceSquared(near, tardigrade.point)}))
    .sort((a, b) => a.dist2 - b.dist2)
    .slice(0, howMany)
    .map(t => t.tardigrade);
}
