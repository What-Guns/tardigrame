import {loadImage} from './loader.js';
import {Point, direction, distanceSquared} from './math.js';
import {Game} from './game.js';

export class Tardigrade {
  readonly point: Point;
  readonly destination: Point;

  // in grid cells per second
  readonly speed = 0.1;

  constructor(readonly game: Game, x: number, y: number) {
    this.point = {x, y};
    this.destination = {x, y};
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
      image,
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
