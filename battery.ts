import {Game} from './game.js';
import {Point, distanceSquared, assignPoint} from './math.js';
import {fillWithImage} from './loader.js';

export class Battery {
  // this is the size of the hit region, NOT the image.
  // it's a little bigger than the image so that the
  // water bears carrying it are still visible.
  readonly radius = (380/2) / this.game.grid.xPixelsPerCell;

  readonly destination: Point;

  private readonly lastPoint: Point;

  @fillWithImage('assets/pictures/battery.png')
  static readonly image: HTMLImageElement;

  @fillWithImage('assets/pictures/dubiousglow_1.png')
  static readonly glow1: HTMLImageElement;

  @fillWithImage('assets/pictures/dubiousglow_2.png')
  static readonly glow2: HTMLImageElement;

  constructor(private readonly game: Game, readonly point: Point) {
    this.destination = this.findDestination()!.point;
    this.lastPoint = {...point};
  }

  draw(ctx: CanvasRenderingContext2D, timestamp: number) {
    const mouseDistSquared = distanceSquared(this.point, this.game.worldSpaceMousePosition);

    if(this.game.viewport.scale > 1.2 || mouseDistSquared < Math.pow(this.radius, 2)) {
      ctx.globalAlpha = 0.5;
    }

    const moved = distanceSquared(this.lastPoint, this.point);

    ctx.drawImage(Battery.image,
      this.point.x * this.game.grid.xPixelsPerCell - Battery.image.width / 2,
      this.point.y * this.game.grid.yPixelsPerCell - Battery.image.height / 2,
    );


    if(moved) {
      ctx.globalAlpha = Math.abs(Math.sin(timestamp / 1000));
      ctx.drawImage(Battery.glow1,
        this.point.x * this.game.grid.xPixelsPerCell - Battery.image.width / 2,
        this.point.y * this.game.grid.yPixelsPerCell - Battery.image.height / 2,
      );
      ctx.globalAlpha = Math.abs(Math.cos(timestamp / 1000));
      ctx.drawImage(Battery.glow2,
        this.point.x * this.game.grid.xPixelsPerCell - Battery.image.width / 2,
        this.point.y * this.game.grid.yPixelsPerCell - Battery.image.height / 2,
      );
    }

    ctx.globalAlpha = 1;


    assignPoint(this.lastPoint, this.point);
  }

  isAtDestination() {
    return distanceSquared(this.point, this.destination) < 1
  }

  private findDestination() {
    for(const column of this.game.grid.cells) {
      for(const cell of column) {
        if(cell.type === 'CAPSULE') return cell;
      }
    }
    throw new Error("Couldn't find the capsule");
  }
}
