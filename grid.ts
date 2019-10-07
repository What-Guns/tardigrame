import {Cell, CellType, CONSTRUCTION_REQUIRED_FOR_CANAL, hydratedCells, INITIAL_MOSS} from './cell.js';
import {loadImage} from './loader.js';
import {Tardigrade} from './tardigrade.js';
import {Point, addPoints} from './math.js';
import {Game} from './game.js';
import {fullCanalImages, fullPoolImage, calculateWetDryCanals, emptyCanalImages, emptyPoolImage} from './water.js';
import {liveTardigrades} from './tardigrade.js'
import {generationTwo} from './game.js'
// import {generationThree} from './game.js'
// import {generationFour} from './game.js'
// import {generationFive} from './game.js'


export class Grid {
  readonly cells: Cell[][];
  readonly hoveredCell: Point = {x: 0, y: 0};

  readonly xPixelsPerCell = 64;
  readonly yPixelsPerCell = 64;
  drawGridLines = false;

  readonly bgPattern: CanvasPattern | null;

  constructor(readonly game: Game, readonly rows: number, readonly columns: number, readonly ctx : CanvasRenderingContext2D) {
    this.rows = rows;
    this.columns = columns;
    this.cells = [];

    for (let x=0; x<columns; x++) {
      this.cells.push([]);
      for (let y=0; y<rows; y++) {
        const cell = new Cell({x, y});
        const rand = Math.random();
        this.cells[x].push(cell);
        if(rand > 0.8) {
          cell.type = 'POOL';
        } else if(rand > 0.7) {
          cell.type = 'BIG_ROCK';
        }
      }
    }

    this.bgPattern = ctx.createPattern(background, 'repeat');
  }

  tick(dt : number) {
    this.updateHoveredCell();
    calculateWetDryCanals(this.cells, dt);
  }

  clicked(where: Point) {
    if(this.game.isPaused()) return;
    const cell = this.getCell(where);
    switch(cell.type) {
      case 'BLANK':
        this.startBuildingACanal(cell);
        break;
      case 'BIG_ROCK':
        this.startMossingUpARock(cell);
        break;
      case 'MOSS':
        Tardigrade.assignTardigradeToReproduce(cell);
        break;
      case 'PLANNED_CANAL':
        cell.type = 'BLANK';
        break;
      case 'PLANNED_MOSS':
        cell.type = 'BIG_ROCK';
        break;
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

    if((window as any).DEBUG_DRAW_HYDRATION) {
      for(const cell of hydratedCells) {
        ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
        ctx.fillRect(cell.point.x * 64 + 10,
          cell.point.y  * 64 + 10,
          44, 44);
      }
    }
  }

  getCell(point: Point) {
    return this.cells[Math.floor(point.x)][Math.floor(point.y)];
  }

  setCellType(point: Point, type: CellType) {
    this.cells[point.x][point.y].type = type;
  }

  private startBuildingACanal(cell: Cell) {
    if(cell.type !== 'BLANK' || liveTardigrades.size != 0) return;
    cell.type = 'PLANNED_CANAL';
    Tardigrade.assignTardigradesToBuild(cell);
  }

  private startMossingUpARock(cell: Cell) {
    if(cell.type !== 'BIG_ROCK' || liveTardigrades.size > generationTwo) return;
    const searchPoint = {...cell.point};
    const offset = {x: 0, y: 0};
    let foundWater = false;
    for(offset.y = -1; offset.y <= 1; offset.y++) {
      for(offset.x = -1; offset.x <= 1; offset.x++) {
        addPoints(searchPoint, cell.point, offset);
        const neighbor = this.getCell(searchPoint);
        if(neighbor.hydration) {
          cell.type = 'PLANNED_MOSS';
          Tardigrade.assignTardigradesToBuild(cell);
        }
        foundWater = foundWater || neighbor.hydration;
      }
    }
  }

  private drawBackground(ctx: CanvasRenderingContext2D) {
    if(!this.bgPattern) return;

    ctx.clearRect(0, 0, this.xPixelsPerCell * this.columns, this.yPixelsPerCell * this.rows);
    ctx.fillStyle = this.bgPattern;
    ctx.fillRect(0, 0, this.xPixelsPerCell * this.columns, this.yPixelsPerCell * this.rows);
    /*
    for(let x=0; x < this.xPixelsPerCell * this.columns / background.width; x++) {
      for(let y=0; y < this.yPixelsPerCell * this.rows / background.height; y++) {
        ctx.drawImage(background, x * background.width, y*background.height)
      }
    }*/

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
          const cellAbove = this.cells[x] && this.cells[x][y-1] && (this.cells[x][y-1].type === 'POOL' || this.cells[x][y-1].type === 'WATER_SOURCE') ? 1 : 0;
          const cellBelow = this.cells[x] && this.cells[x][y+1] && (this.cells[x][y+1].type === 'POOL' || this.cells[x][y+1].type === 'WATER_SOURCE') ? 1 : 0;
          const cellLeft = this.cells[x-1] && this.cells[x-1][y] && (this.cells[x-1][y].type === 'POOL' || this.cells[x-1][y].type === 'WATER_SOURCE') ? 1 : 0;
          const cellRight = this.cells[x+1] && this.cells[x+1][y] && (this.cells[x+1][y].type === 'POOL' || this.cells[x+1][y].type === 'WATER_SOURCE') ? 1 : 0;
          const imagesToUse = cell.hydration ? fullCanalImages : emptyCanalImages;
          image = imagesToUse[cellRight][cellLeft][cellBelow][cellAbove];
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
            cell.hydration ? fullPoolImage : emptyPoolImage,
            (x - 0.5) * this.xPixelsPerCell,
            (y - 0.5) * this.yPixelsPerCell,
            this.xPixelsPerCell,
            this.yPixelsPerCell
          );
        }
        
        /*if (cell.type === 'WATER_SOURCE') {
          const cellAbove = this.cells[x] && this.cells[x][y-1] && (this.cells[x][y-1].type === 'POOL' || this.cells[x][y-1].type === 'WATER_SOURCE');
          if(cellAbove) ctx.drawImage(puddleImages.PUDDLE_ABOVE, x * this.xPixelsPerCell, y * this.yPixelsPerCell, this.xPixelsPerCell, this.yPixelsPerCell);
          const cellBelow = this.cells[x] && this.cells[x][y+1] && (this.cells[x][y+1].type === 'POOL' || this.cells[x][y+1].type === 'WATER_SOURCE');
          if(cellBelow) ctx.drawImage(puddleImages.PUDDLE_BELOW, x * this.xPixelsPerCell, y * this.yPixelsPerCell, this.xPixelsPerCell, this.yPixelsPerCell);
          const cellLeft = this.cells[x-1] && this.cells[x-1][y] && (this.cells[x-1][y].type === 'POOL' || this.cells[x-1][y].type === 'WATER_SOURCE');
          if(cellLeft) ctx.drawImage(puddleImages.PUDDLE_LEFT, x * this.xPixelsPerCell, y * this.yPixelsPerCell, this.xPixelsPerCell, this.yPixelsPerCell);
          const cellRight = this.cells[x+1] && this.cells[x+1][y] && (this.cells[x+1][y].type === 'POOL' || this.cells[x+1][y].type === 'WATER_SOURCE');
          if(cellRight) ctx.drawImage(puddleImages.PUDDLE_RIGHT, x * this.xPixelsPerCell, y * this.yPixelsPerCell, this.xPixelsPerCell, this.yPixelsPerCell);
        }*/

        if(cell.type === 'PLANNED_CANAL') {
          ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(
            (x + 0.5) * this.xPixelsPerCell,
            (y + 0.5) * this.yPixelsPerCell,
            Math.min(this.xPixelsPerCell, this.yPixelsPerCell) / 3,
            0,
            2 * Math.PI * cell.amountConstructed / CONSTRUCTION_REQUIRED_FOR_CANAL,
            false);
          ctx.stroke();
        }

        if(cell.type === 'MOSS') {
          ctx.strokeStyle = 'coral';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(
            (x + 0.5) * this.xPixelsPerCell,
            (y + 0.5) * this.yPixelsPerCell,
            Math.min(this.xPixelsPerCell, this.yPixelsPerCell) / 3,
            0,
            2 * Math.PI * cell.moss / INITIAL_MOSS,
            false);
          ctx.stroke();
        }
      }
    }

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if(this.drawGridLines) {
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
    this.hoveredCell.x = Math.floor(this.game.worldSpaceMousePosition.x);
    this.hoveredCell.y = Math.floor(this.game.worldSpaceMousePosition.y);
  }
}

const background = loadImage('assets/pictures/Tardigrame_BG_tile_1600.png');

const gridImages: {[key in CellType]: HTMLImageElement} = {
  POOL: loadImage('assets/pictures/full_canals/full_canals__0007_lefttotop.png'),
  BLANK: loadImage('assets/pictures/empty1.png'),
  BIG_ROCK: loadImage('assets/pictures/Rocks_and_moss/just_a_rock.png'),
  ROAD: loadImage('assets/pictures/nsroad1.png'),
  PLANNED_CANAL: loadImage('assets/pictures/futureCanal.png'),
  WATER_SOURCE: loadImage('assets/pictures/Puddle_states/puddle.png'),
  MOSS: loadImage('assets/pictures/Rocks_and_moss/rock_lotsa_moss.png'),
  PLANNED_MOSS: loadImage('assets/pictures/Rocks_and_moss/rock_little_moss.png'),
}

type PuddleFragmentType = 'PUDDLE_ABOVE'|'PUDDLE_BELOW'|'PUDDLE_LEFT'|'PUDDLE_RIGHT';
const puddleImages: {[key in PuddleFragmentType] : HTMLImageElement} = {
  PUDDLE_ABOVE: loadImage('assets/pictures/Puddle_states/puddle_top_open.png'),
  PUDDLE_BELOW: loadImage('assets/pictures/Puddle_states/puddle_bottom_open.png'),
  PUDDLE_LEFT: loadImage('assets/pictures/Puddle_states/puddle_left_open.png'),
  PUDDLE_RIGHT: loadImage('assets/pictures/Puddle_states/puddle_right_open.png'),
}
