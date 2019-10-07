import {Game} from './game.js';
import {liveTardigrades, tunTardigrades, idleTardigrades} from './tardigrade.js'

export class Hud {
  constructor(private readonly game: Game) {
  }

  private readonly popBars: PopBar[] = [
    {label: 'tun', color: 'red', count: 0, contributesToGraph: false},
    {label: 'idle', color: 'yellow', count: 0, contributesToGraph: true},
    {label: 'busy', color: 'white', count: 0, contributesToGraph: true},
    {label: 'total', color: 'black', count: 0, contributesToGraph: false},
  ];

  draw(ctx: CanvasRenderingContext2D) {
    this.drawTardigraph(ctx);
  }

  private drawTardigraph(ctx: CanvasRenderingContext2D) {
    const goal = this.game.getGoalOfCurrentGeneration();
    this.popBars[0].count = tunTardigrades.size;
    this.popBars[1].count = idleTardigrades.size;
    this.popBars[2].count = liveTardigrades.size - idleTardigrades.size;
    this.popBars[3].count = liveTardigrades.size;

    const isHovered = this.game.screenSpaceMousePosition.x <= 300 && this.game.screenSpaceMousePosition.y < 48;

    ctx.fillStyle = 'black';
    ctx.fillRect(10, 10, 200, 24);
    ctx.font = '18px system-ui';

    if(isHovered) {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = 'white';
      ctx.fillRect(12,36,200,(this.popBars.length + 1) * 18)
      ctx.globalAlpha = 1;
    }

    let x = 0;
    let y = 36;
    for(let b = 0; b < this.popBars.length; b++) {
      ctx.fillStyle = this.popBars[b].color;
      if(this.popBars[b].contributesToGraph) {
        const width = (this.popBars[b].count / goal) * 200;
        ctx.fillRect(10 + x, 10, width, 24);
        x += width;
      }
      if(isHovered) ctx.fillText(`${this.popBars[b].label}: ${this.popBars[b].count}`, 12, y);
      y += 18;
    }

    ctx.textBaseline = 'top';
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'white';
    ctx.strokeRect(10, 10, 200, 24);

    ctx.fillStyle = 'black';
    if(isHovered) ctx.fillText(`goal: ${goal}`, 12, y);
  }
}
