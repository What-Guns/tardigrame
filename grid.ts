import {Cell} from './cell.js';

export class Grid {
    cells: Array<Array<number>>;
    constructor(readonly rows: number, readonly columns: number) {
        this.rows = rows;
        this.columns = columns;
        this.cells = [];
        for (let x=0; x<columns; x++) {
            this.cells.push([]);
            for (let y=0; y<rows; y++) {
                this.cells[x].push(Cell.BLANK);
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      for(let y = 0; y < this.columns; y++) {
        for(let x = 0; x < this.columns; x++) {
          ctx.lineTo(Math.random() * 640, Math.random() * 640);
        }
      }
      ctx.stroke();
    }
}
