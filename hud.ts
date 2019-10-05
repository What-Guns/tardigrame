import {Game} from './game.js';
import {Tardigrade} from './tardigrade.js'
import {liveTardigrades} from './tardigrade.js'
import {tunTardigrades} from './tardigrade.js'

export class Hud {

  liveT : Set<Tardigrade> = liveTardigrades 
  tunT : Set<Tardigrade> = tunTardigrades 

  constructor(private readonly game: Game) {
  }

  draw(ctx: CanvasRenderingContext2D) {
    const message = `Available water: ${this.game.availableWater}`;
    ctx.fillStyle = 'black';
    ctx.font = '24px system-ui';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeText(message, 10, 10);
    ctx.fillText(message, 10, 10);

    const stateCountMessage =`Alive: ${this.liveT.size} Tun: ${this.tunT.size}`
    ctx.strokeText(stateCountMessage, 10, 30)
    ctx.fillText(stateCountMessage, 10, 30)

  }
}
