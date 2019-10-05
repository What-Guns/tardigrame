import {Cell, CellType} from './cell.js';
import {loadImage} from './loader.js';
import {Point} from './math.js';
import {Game} from './game.js';
import {fullCanalImages, fullPoolImage/*, emptyCanalImages, emptyPoolImage*/} from './water.js';

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
        this.cells[x].push({
          type: Math.random() < 0.4 ? 'BLANK' : Math.random() < 0.1 ? 'BIG_ROCK' : 'POOL',
          hydration: 0,
        });
      }
    }

    // put a road somewhere
    for(let y = 0; y < this.rows; y++) {
      this.cells[2][y].type = 'ROAD';
    }
  }

  tick() {
    this.updateHoveredCell();
    if(this.game.isMouseClicked && this.game.tool === 'WATER' && this.game.availableWater > 0) {
      this.game.availableWater--;
      const cell = this.getCell(this.hoveredCell);
      cell.type = 'POOL';
      cell.hydration = 1.0;
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

  getCell(point: Point) {
    return this.cells[point.x][point.y];
  }

  setCellType(point: Point, type: CellType) {
    this.cells[point.x][point.y].type = type;
  }

  private drawBackground(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.xPixelsPerCell * this.columns, this.yPixelsPerCell * this.rows);
    //ctx.fillRect(0, 0, this.xPixelsPerCell * this.columns, this.yPixelsPerCell * this.rows);
    ctx.drawImage(background, 0, 0, this.xPixelsPerCell * this.columns, this.yPixelsPerCell * this.rows);

    const firstVisibleColumn = Math.max(0, Math.floor((this.game.viewport.x / this.game.viewport.scale) / this.xPixelsPerCell));
    const firstVisibleRow = Math.max(0, Math.floor((this.game.viewport.y / this.game.viewport.scale) / this.yPixelsPerCell));
    const numVisibleColumns = Math.ceil((this.game.viewport.width / this.game.viewport.scale) / this.xPixelsPerCell) + 1;
    const numVisibleRows = Math.ceil((this.game.viewport.height / this.game.viewport.scale) / this.yPixelsPerCell) + 1;

    const lastVisibleColumn = Math.min(this.columns, firstVisibleColumn + numVisibleColumns);
    const lastVisibleRow = Math.min(this.rows, firstVisibleRow + numVisibleRows);

    for(let x = firstVisibleColumn; x < lastVisibleColumn; x++) {
      for(let y = firstVisibleRow; y < lastVisibleRow; y++) {
        const cell = this.cells[x][y];
        let image = gridImages[cell.type];
        let drawAPool = false;
        if(cell.type === 'POOL') {
          const cellAbove = this.cells[x] && this.cells[x][y-1] && this.cells[x][y-1].type === 'POOL' ? 1 : 0;
          const cellBelow = this.cells[x] && this.cells[x][y+1] && this.cells[x][y+1].type === 'POOL' ? 1 : 0;
          const cellLeft = this.cells[x-1] && this.cells[x-1][y] && this.cells[x-1][y].type === 'POOL' ? 1 : 0;
          const cellRight = this.cells[x+1] && this.cells[x+1][y] && this.cells[x+1][y].type === 'POOL' ? 1 : 0;
          image = fullCanalImages[cellRight][cellLeft][cellBelow][cellAbove];
          if(cellAbove + cellLeft === 2 && this.cells[x-1] && this.cells[x-1][y-1] && this.cells[x-1][y-1].type === 'POOL') {
            drawAPool = true;
          }
        }
        ctx.drawImage(
          image,
          x * this.xPixelsPerCell,
          y * this.yPixelsPerCell,
          this.xPixelsPerCell,
          this.yPixelsPerCell
        );
        if(drawAPool) {
          ctx.drawImage(
            fullPoolImage,
            (x - 0.5) * this.xPixelsPerCell,
            (y - 0.5) * this.yPixelsPerCell,
            this.xPixelsPerCell,
            this.yPixelsPerCell
          );
        }
      }
    }

    const drawGridLines = false; // Put this as a Game-level config option?
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

const background = loadImage('assets/pictures/Tardigrame_BG_tile_1600.png');

const gridImages: {[key in CellType]: HTMLImageElement} = {
  POOL: loadImage('assets/pictures/full%20canals%20v2/full_canals__0007_lefttotop.png'),
  BLANK: loadImage('assets/pictures/empty1.png'),
  BIG_ROCK: loadImage('assets/pictures/bigrock1.png'),
  ROAD: loadImage('assets/pictures/nsroad1.png'),
}
