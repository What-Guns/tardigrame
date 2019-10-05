import { PawnType } from "./pawnType.js";
// import { fillWithImage } from "./loader.js";
import {loadImage} from './loader.js';


export class Character {

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
      ctx.drawImage(this.getImageForPawnType(this.pawnType), 16, 16);
    }

    private getImageForPawnType(pawnType: PawnType) {
      switch(pawnType) {
        case PawnType.WORKER_TARDIGRADE: return PawnImages.tardigrade;
        case PawnType.CANNIBAL_TARIGRADE  :return PawnImages.tardigrade;
        case PawnType.MOON_AGENT: return PawnImages.tardigrade;
      }
    }
  }

  const PawnImages = {
    tardigrade: loadImage('assets/pictures/tardy-tardigrade.png'),
  }
  
