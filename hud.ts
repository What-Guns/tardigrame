import {Game} from './game.js';
import {liveTardigrades} from './tardigrade.js'
import {tunTardigrades} from './tardigrade.js'

export class Hud {

  constructor(private readonly game: Game) {
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.font = '24px system-ui';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;

    const stateCountMessage =`Alive: ${liveTardigrades.size} Tun: ${tunTardigrades.size}`
    ctx.strokeText(stateCountMessage, 10, 10)
    ctx.fillText(stateCountMessage, 10, 10)

    const toNextGenMessage =`Number to next generation: ${this.game.numberToNextGen}`
    ctx.strokeText(toNextGenMessage, 1000, 10)
    ctx.fillText(toNextGenMessage, 1000, 10)

  }
}
