import { PawnType } from "./pawnType.js";
// import { fillWithImage } from "./loader.js";
import {loadImage} from './loader.js';
import {Point, direction, distanceSquared} from './math.js';
import {Game} from './game.js';

export class Pawn {
  readonly point: Point;
  readonly destination: Point;

  // in grid cells per second
  readonly speed = 0.1;

  constructor(readonly game: Game, x: number, y: number, public pawnType: PawnType) {
    this.point = {x, y};
    this.destination = {x, y};
    this.pawnType = pawnType
  }

  tick(dt: number) {
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
      pawnImages[this.pawnType],
      this.point.x * this.game.grid.xPixelsPerCell,
      this.point.y * this.game.grid.yPixelsPerCell
    );
  }

  private pickDestination() {
    this.destination.x = Math.random() * 10;
    this.destination.y = Math.random() * 10;
  }
}

const pawnImages: {[key in PawnType]: HTMLImageElement} = {
  CANNIBAL_TARIGRADE: loadImage('assets/pictures/tardy-tardigrade.png'),
  MOON_AGENT: loadImage('assets/pictures/tardy-tardigrade.png'),
  WORKER_TARDIGRADE: loadImage('assets/pictures/tardy-tardigrade.png'),
};
