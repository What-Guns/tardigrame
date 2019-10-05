import {Cell} from './cell.js';
import {loadImage} from './loader.js';
import {Point} from './math.js';
import {Game} from './game.js';

export class Grid {
  readonly cells: Cell[][];
  readonly hoveredCell: Point = {x: 0, y: 0};

  readonly xPixelsPerCell = 64;
  readonly yPixelsPerCell = 64;

  private readonly offscreenCanvas: HTMLCanvasElement;
  private readonly offscreenCtx: CanvasRenderingContext2D;

  // Set to true after changing cells,
  // this triggers the off-screen canvas refresh.
  private cellsChanged = true;

  constructor(readonly game: Game, readonly rows: number, readonly columns: number) {
    this.rows = rows;
    this.columns = columns;
    this.cells = [];

    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = columns * this.xPixelsPerCell;
    this.offscreenCanvas.height = rows * this.yPixelsPerCell;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d')!;

    for (let x=0; x<columns; x++) {
      this.cells.push([]);
      for (let y=0; y<rows; y++) {
        this.cells[x].push(Math.random() < 0.8 ? 'BLANK' : Math.random() < 0.5 ? 'BIG_ROCK' : 'POOL');
      }
    }

    // put a road somewhere
    for(let y = 0; y < this.rows; y++) {
      this.cells[2][y] = 'ROAD';
    }
  }

  tick() {
    this.updateHoveredCell();
  }

  draw(ctx: CanvasRenderingContext2D) {
    if(this.cellsChanged) this.updateOffscreenCanvas();
    ctx.drawImage(this.offscreenCanvas, 0, 0);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(this.hoveredCell.x * this.xPixelsPerCell,
      this.hoveredCell.y * this.yPixelsPerCell,
      this.xPixelsPerCell,
      this.yPixelsPerCell
    );
  }

  private updateOffscreenCanvas() {
    this.cellsChanged = false;
    const ctx = this.offscreenCtx;

    ctx.clearRect(0, 0, this.xPixelsPerCell * this.columns, this.yPixelsPerCell * this.rows);

    for(let x = 0; x < this.columns; x++) {
      for(let y = 0; y < this.rows; y++) {
        ctx.drawImage(
          gridImages[this.cells[x][y]],
          x * this.xPixelsPerCell,
          y * this.yPixelsPerCell,
          this.xPixelsPerCell,
          this.yPixelsPerCell
        );
      }
    }

    const drawGridLines = true; // Put this as a Game-level config option?
    ctx.beginPath();
    if(drawGridLines) {
      for (let x = 0; x < this.columns; x++) {
        ctx.moveTo(x * this.xPixelsPerCell, 0)
        ctx.lineTo(x * this.xPixelsPerCell, this.rows * this.yPixelsPerCell)
      }
      for (let y = 0; y < this.rows; y++) {
        ctx.moveTo(0, y * this.yPixelsPerCell)
        ctx.lineTo(this.rows * this.xPixelsPerCell, y * this.yPixelsPerCell)
      }
      ctx.stroke();
    }
  }

  private updateHoveredCell() {
    this.hoveredCell.x = Math.floor(this.game.mousePosition.x / this.xPixelsPerCell);
    this.hoveredCell.y = Math.floor(this.game.mousePosition.y / this.yPixelsPerCell);
  }
}

const gridImages: {[key in Cell]: HTMLImageElement} = {
  POOL: loadImage('assets/pictures/pool1.png'),
  BLANK: loadImage('assets/pictures/empty1.png'),
  BIG_ROCK: loadImage('assets/pictures/bigrock1.png'),
  ROAD: loadImage('assets/pictures/nsroad1.png'),
}
