import {Game} from './game.js';
import {Point, distanceSquared} from './math.js';
import {fillWithImage} from './loader.js';

export const BATTERY_DESTINATION = {
  x: 50,
  y: 50,
};

export class Battery {
  // this is the size of the hit region, NOT the image.
  // it's a little bigger than the image so that the
  // water bears carrying it are still visible.
  readonly radius = (380/2) / this.game.grid.xPixelsPerCell;

  @fillWithImage('assets/pictures/battery.png')
  static readonly image: HTMLImageElement;

  constructor(private readonly game: Game, readonly point: Point) {
  }

  draw(ctx: CanvasRenderingContext2D) {
    const mouseDistSquared = distanceSquared(this.point, this.game.worldSpaceMousePosition);

    if(mouseDistSquared < Math.pow(this.radius, 2)) {
      ctx.globalAlpha = 0.5;
    }

    ctx.drawImage(Battery.image,
      this.point.x * this.game.grid.xPixelsPerCell - Battery.image.width / 2,
      this.point.y * this.game.grid.yPixelsPerCell - Battery.image.height / 2,
    );

    ctx.globalAlpha = 1;
  }

  isAtDestination() {
    return distanceSquared(this.point, BATTERY_DESTINATION) < 1
  }
}
