import {Cell} from './cell.js';
import {fillWithImage} from './loader.js';

export class Grid {
  cells: Cell[][];

  readonly pixelsPerCell = 100;

  @fillWithImage('assets/pictures/pool1.png')
  private static pool1: HTMLImageElement;

  @fillWithImage('assets/pictures/empty1.png')
  private static empty1: HTMLImageElement;

  constructor(readonly rows: number, readonly columns: number) {
    this.rows = rows;
    this.columns = columns;
    this.cells = [];
    for (let x=0; x<columns; x++) {
      this.cells.push([]);
      for (let y=0; y<rows; y++) {
        this.cells[x].push(Math.random() > 0.8 ? Cell.POOL : Cell.BLANK);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for(let x = 0; x < this.columns; x++) {
      for(let y = 0; y < this.columns; y++) {
        ctx.drawImage(this.getImageForCell(x, y), x * this.pixelsPerCell, y * this.pixelsPerCell);
      }
    }
  }

  private getImageForCell(x: number, y: number) {
    const cell = this.cells[x][y];
    switch(cell) {
      case Cell.BLANK: return Grid.empty1;
      case Cell.POOL: return Grid.pool1;
    }
  }
}
