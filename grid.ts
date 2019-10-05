import {Cell} from './cell.js';
import {loadImage} from './loader.js';
import {Point} from './math.js';
import {Game} from './game.js';

export class Grid {
  readonly cells: Cell[][];
  readonly hoveredCell: Point = {x: 0, y: 0};

  readonly xPixelsPerCell = 64;
  readonly yPixelsPerCell = 64;

  constructor(readonly game: Game, readonly rows: number, readonly columns: number) {
    this.rows = rows;
    this.columns = columns;
    this.cells = [];

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
    if(
      this.game.isMouseClicked
      && this.game.tool === 'WATER'
      && this.getCellType(this.hoveredCell) !== 'POOL'
      && this.game.availableWater > 0) {
      this.game.availableWater--;
      this.setCellType(this.hoveredCell, 'POOL');
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawBackground(ctx);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(this.hoveredCell.x * this.xPixelsPerCell,
      this.hoveredCell.y * this.yPixelsPerCell,
      this.xPixelsPerCell,
      this.yPixelsPerCell
    );
  }

  getCellType(point: Point) {
    return this.cells[point.x][point.y];
  }

  setCellType(point: Point, type: Cell) {
    this.cells[point.x][point.y] = type;
  }

  private drawBackground(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.xPixelsPerCell * this.columns, this.yPixelsPerCell * this.rows);
    ctx.fillRect(0, 0, this.xPixelsPerCell * this.columns, this.yPixelsPerCell * this.rows);

    const firstVisibleColumn = Math.max(0, Math.floor((this.game.viewport.x / this.game.viewport.scale) / this.xPixelsPerCell));
    const firstVisibleRow = Math.max(0, Math.floor((this.game.viewport.y / this.game.viewport.scale) / this.yPixelsPerCell));
    const numVisibleColumns = Math.ceil((this.game.viewport.width / this.game.viewport.scale) / this.xPixelsPerCell) + 1;
    const numVisibleRows = Math.ceil((this.game.viewport.height / this.game.viewport.scale) / this.yPixelsPerCell) + 1;

    const lastVisibleColumn = Math.min(this.columns, firstVisibleColumn + numVisibleColumns);
    const lastVisibleRow = Math.min(this.rows, firstVisibleRow + numVisibleRows);

    for(let x = firstVisibleColumn; x < lastVisibleColumn; x++) {
      for(let y = firstVisibleRow; y < lastVisibleRow; y++) {
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
      for(let x = firstVisibleColumn; x < lastVisibleColumn; x++) {
        ctx.moveTo(x * this.xPixelsPerCell, 0)
        ctx.lineTo(x * this.xPixelsPerCell, this.rows * this.yPixelsPerCell)
      }
      for(let y = firstVisibleRow; y < lastVisibleRow; y++) {
        ctx.moveTo(0, y * this.yPixelsPerCell)
        ctx.lineTo(this.rows * this.xPixelsPerCell, y * this.yPixelsPerCell)
      }
      ctx.stroke();
    }
  }

  private updateHoveredCell() {
    this.hoveredCell.x = Math.floor(this.game.worldSpaceMousePosition.x / this.xPixelsPerCell);
    this.hoveredCell.y = Math.floor(this.game.worldSpaceMousePosition.y / this.yPixelsPerCell);
  }
}

const gridImages: {[key in Cell]: HTMLImageElement} = {
  POOL: loadImage('assets/pictures/pool1.png'),
  BLANK: loadImage('assets/pictures/empty1.png'),
  BIG_ROCK: loadImage('assets/pictures/bigrock1.png'),
  ROAD: loadImage('assets/pictures/nsroad1.png'),
}
