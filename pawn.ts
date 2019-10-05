import { PawnType } from "./pawnType.js";
// import { fillWithImage } from "./loader.js";
import {loadImage} from './loader.js';
import {Point} from './math.js';
import {Game} from './game.js';


export class Pawn {
  readonly point: Point;
  constructor(readonly game: Game, x: number, y: number, public pawnType: PawnType) {
    this.point = {x, y};
    this.pawnType = pawnType
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(pawnImages[this.pawnType], 16, 16);
  }
}

const pawnImages: {[key in PawnType]: HTMLImageElement} = {
  CANNIBAL_TARIGRADE: loadImage('assets/pictures/tardy-tardigrade.png'),
  MOON_AGENT: loadImage('assets/pictures/tardy-tardigrade.png'),
  WORKER_TARDIGRADE: loadImage('assets/pictures/tardy-tardigrade.png'),
};
