import {Cell} from './cell.js';
import {loadImage} from './loader.js';

export class Grid {
  cells: Cell[][];
  mouseX: number | null = null;
  mouseY: number | null = null;

  readonly pixelsPerCell = 100;

  constructor(readonly rows: number, readonly columns: number) {
    this.rows = rows;
    this.columns = columns;
    this.cells = [];
    for (let x=0; x<columns; x++) {
      this.cells.push([]);
      for (let y=0; y<rows; y++) {
        this.cells[x].push(Math.random() < 0.8 ? Cell.BLANK : Math.random() < 0.5 ? Cell.BIG_ROCK : Cell.POOL);
      }
    }

    // put a road somewhere
    for(let y = 0; y < this.rows; y++) {
      this.cells[2][y] = Cell.ROAD
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const hoverCell = this.getHoveredCell();
    for(let x = 0; x < this.columns; x++) {
      for(let y = 0; y < this.rows; y++) {
        if(hoverCell && x === hoverCell.x && y === hoverCell.y) {
          ctx.filter = 'brightness(150%)';
        }
        ctx.drawImage(this.getImageForCell(x, y), x * this.pixelsPerCell, y * this.pixelsPerCell);
        ctx.filter = 'none';
      }
    }
    const drawGridLines = true; // Put this as a Game-level config option?
    if(drawGridLines) {
        for (let x = 0; x < this.columns; x++) {
            ctx.moveTo(x * this.pixelsPerCell, 0)
            ctx.lineTo(x * this.pixelsPerCell, this.rows * this.pixelsPerCell)
        }
        for (let y = 0; y < this.rows; y++) {
            ctx.moveTo(0, y * this.pixelsPerCell)
            ctx.lineTo(this.rows * this.pixelsPerCell, y * this.pixelsPerCell)
        }
        ctx.stroke();
    }
  }

  getHoveredCell() {
    if (!this.mouseX || !this.mouseY) {
      return null;
    }
    return {
      x: Math.floor(this.mouseX / this.pixelsPerCell),
      y: Math.floor(this.mouseY / this.pixelsPerCell),
    }
  }

  private getImageForCell(x: number, y: number) {
    const cell = this.cells[x][y];
    switch(cell) {
      case Cell.BLANK: return GridImages.empty1;
      case Cell.POOL: return GridImages.pool1;
      case Cell.BIG_ROCK: return GridImages.bigRock;
      case Cell.ROAD: return GridImages.road;
    }
  }
}

const GridImages = {
  pool1: loadImage('assets/pictures/pool1.png'),
  empty1: loadImage('assets/pictures/empty1.png'),
  bigRock: loadImage('assets/pictures/bigrock1.png'),
  road: loadImage('assets/pictures/nsroad1.png'),
}
