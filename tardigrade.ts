import {loadImage} from './loader.js';
import {Point, direction, distanceSquared} from './math.js';
import {Game} from './game.js';

export class Tardigrade {
  readonly point: Point;
  readonly destination: Point;

  satiation: number = 0.4; // 0 is starved, 1 babby formed from gonad
  thirst: number; // 0 is sated, 1 is all the way thirsty
  // dehydrationSpeed : number = 0.0001; // thirst per tick
  dehydrationSpeed : number = 0;
  hydrationSpeed : number = 0.1; // antithirst per tick in water

  nutrientConsumptionRate: number = 0.1;
  starvationRate : number = 0;

  // in grid cells per second
  readonly speed = 0.1;

  constructor(readonly game: Game, x: number, y: number) {
    this.point = {x, y};
    this.destination = {x, y};
    this.satiation = 0;
    this.thirst = Math.random();
  }

  tick(dt: number) {
    this.dehydrate(dt);
    if(!this.isDehydrated()) {
      this.move(dt);
    }
  }

  dehydrate(dt: number) {
    if(!this.isDehydrated()) {
      this.thirst -= this.dehydrationSpeed * dt;
    }
  }

  isDehydrated() {
    return this.thirst <= 0;
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
    const dir = direction(this.point, this.destination);
    const dx = Math.cos(dir) * this.speed * dt / 1000;
    const dy = Math.sin(dir) * this.speed * dt / 1000;
    const distSquared = distanceSquared(this.point, this.destination);
    if(distSquared < 0.01) this.pickDestination();
    else {
      this.point.x += dx;
      this.point.y += dy;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(
      this.isDehydrated() ? deadImage : image,
      this.point.x * this.game.grid.xPixelsPerCell,
      this.point.y * this.game.grid.yPixelsPerCell
    );
  }

  private pickDestination() {
    this.destination.x = Math.random() * 10;
    this.destination.y = Math.random() * 10;
  }
}

const image = loadImage('assets/pictures/tardy-tardigrade.png');
const deadImage = loadImage('assets/pictures/deadigrade.png');
