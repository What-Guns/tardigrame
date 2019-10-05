import { PawnType } from "./pawnType.js";
// import { fillWithImage } from "./loader.js";
import {loadImage} from './loader.js';


export class Pawn {

  // @fillWithImage('assets/pictures/tardy-tardigrade.png')
  // private static tardigradeImage: HTMLImageElement;

  x:number
  y:number
  pawnType: PawnType
  constructor(x: number, y: number, pawnType: PawnType) {
    this.x = x;
    this.y = y;
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
