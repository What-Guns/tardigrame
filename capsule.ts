import { loadImage } from "./loader.js";
import { Game } from "./game.js";
import { Point, addPoints, isPointInBox } from "./math.js";

const image = loadImage('assets/pictures/capsule_withmoss.png');
const bgImage = loadImage('assets/pictures/capsule_bg.png');

export class Capsule {
  readonly offset: Point = {x: -255, y: -266};
  drawOrigin: Point = {x: 0, y:0};
  mouseOver = false;
  constructor(readonly game: Game, readonly point: Point) {
    game.capsules.push(this);
    addPoints(this.drawOrigin, this.offset, {x:this.point.x * game.grid.xPixelsPerCell, y:this.point.y * game.grid.yPixelsPerCell});
  }

  draw(ctx: CanvasRenderingContext2D) {
    const mousePos = this.game.worldSpaceMousePosition;
    if(isPointInBox(mousePos.x * this.game.grid.xPixelsPerCell, mousePos.y * this.game.grid.yPixelsPerCell, this.drawOrigin.x, this.drawOrigin.y, image.width, image.height)) {
      ctx.globalAlpha = 0.5
    }
    ctx.drawImage(image, this.drawOrigin.x, this.drawOrigin.y);
    ctx.globalAlpha = 1
  }

  drawBG(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(bgImage, this.drawOrigin.x, this.drawOrigin.y);
  }
}