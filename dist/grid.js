import { Cell, CONSTRUCTION_REQUIRED_FOR_CANAL, hydratedCells, INITIAL_MOSS } from './cell.js';
import { loadImage } from './loader.js';
import { Tardigrade, liveTardigrades } from './tardigrade.js';
import { addPoints } from './math.js';
import { fullCanalImages, fullPoolImage, calculateWetDryCanals, emptyCanalImages, emptyPoolImage } from './water.js';
import { generationTwo } from './game.js';
export class Grid {
    constructor(game, rows, columns, ctx) {
        this.game = game;
        this.rows = rows;
        this.columns = columns;
        this.ctx = ctx;
        this.hoveredCell = { x: 0, y: 0 };
        this.xPixelsPerCell = 64;
        this.yPixelsPerCell = 64;
        this.drawGridLines = false;
        this.rows = rows;
        this.columns = columns;
        this.cells = [];
        for (let x = 0; x < columns; x++) {
            this.cells.push([]);
            for (let y = 0; y < rows; y++) {
                const cell = new Cell({ x, y });
                const rand = Math.random();
                this.cells[x].push(cell);
                if (rand > 0.8) {
                    cell.type = 'POOL';
                }
                else if (rand > 0.7) {
                    cell.type = 'BIG_ROCK';
                }
            }
        }
        this.bgPattern = ctx.createPattern(background, 'repeat');
    }
    tick(dt) {
        this.updateHoveredCell();
        calculateWetDryCanals(this.cells, dt);
    }
    clicked(where) {
        if (this.game.isPaused())
            return;
        const cell = this.getCell(where);
        switch (cell.type) {
            case 'BLANK':
                if (liveTardigrades.size > 0) {
                    this.startBuildingACanal(cell);
                }
                break;
            case 'BIG_ROCK':
                if (liveTardigrades.size >= generationTwo) {
                    this.startMossingUpARock(cell);
                }
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
    draw(ctx, timestamp) {
        this.drawBackground(ctx, timestamp);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(this.hoveredCell.x * this.xPixelsPerCell, this.hoveredCell.y * this.yPixelsPerCell, this.xPixelsPerCell, this.yPixelsPerCell);
        if (window.DEBUG_DRAW_HYDRATION) {
            for (const cell of hydratedCells) {
                ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
                ctx.fillRect(cell.point.x * 64 + 10, cell.point.y * 64 + 10, 44, 44);
            }
        }
    }
    getCell(point) {
        const x = Math.min(Math.floor(point.x), this.columns - 1);
        const y = Math.min(Math.floor(point.y), this.rows - 1);
        return this.cells[x][y];
    }
    setCellType(point, type) {
        this.cells[point.x][point.y].type = type;
    }
    startBuildingACanal(cell) {
        if (cell.type !== 'BLANK' && liveTardigrades.size != 0)
            return;
        cell.type = 'PLANNED_CANAL';
        Tardigrade.assignTardigradesToBuild(cell);
    }
    startMossingUpARock(cell) {
        if (cell.type !== 'BIG_ROCK' && cell.type !== 'MOSS')
            return;
        if (liveTardigrades.size < generationTwo)
            return;
        const searchPoint = { ...cell.point };
        const offset = { x: 0, y: 0 };
        let foundWater = false;
        for (offset.y = -1; offset.y <= 1; offset.y++) {
            for (offset.x = -1; offset.x <= 1; offset.x++) {
                addPoints(searchPoint, cell.point, offset);
                const neighbor = this.getCell(searchPoint);
                if (neighbor.hydration) {
                    cell.type = 'PLANNED_MOSS';
                    Tardigrade.assignTardigradesToBuild(cell);
                }
                foundWater = foundWater || neighbor.hydration;
            }
        }
    }
    drawBackground(ctx, timestamp) {
        if (!this.bgPattern)
            return;
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
        for (let x = firstVisibleColumn; x < lastVisibleColumn; x++) {
            for (let y = firstVisibleRow; y < lastVisibleRow; y++) {
                const cell = this.cells[x][y];
                if (!cell.visible)
                    continue;
                let image = gridImages[cell.type];
                let drawAPool = false;
                if (cell.type === 'POOL' || cell.type === 'PLANNED_CANAL') {
                    const cellAbove = this.cells[x] && this.cells[x][y - 1] && (this.cells[x][y - 1].type === 'POOL' || this.cells[x][y - 1].type === 'WATER_SOURCE') ? 1 : 0;
                    const cellBelow = this.cells[x] && this.cells[x][y + 1] && (this.cells[x][y + 1].type === 'POOL' || this.cells[x][y + 1].type === 'WATER_SOURCE') ? 1 : 0;
                    const cellLeft = this.cells[x - 1] && this.cells[x - 1][y] && (this.cells[x - 1][y].type === 'POOL' || this.cells[x - 1][y].type === 'WATER_SOURCE') ? 1 : 0;
                    const cellRight = this.cells[x + 1] && this.cells[x + 1][y] && (this.cells[x + 1][y].type === 'POOL' || this.cells[x + 1][y].type === 'WATER_SOURCE') ? 1 : 0;
                    const imagesToUse = cell.hydration ? fullCanalImages : emptyCanalImages;
                    image = imagesToUse[cellRight][cellLeft][cellBelow][cellAbove];
                    if (cellAbove + cellLeft === 2 && this.cells[x - 1] && this.cells[x - 1][y - 1] && this.cells[x - 1][y - 1].type === 'POOL') {
                        drawAPool = cell.type === 'POOL'; // don't draw a pool if this cell is only planned. It looks weird.
                    }
                }
                if (cell.type === 'PLANNED_CANAL' && Math.floor(timestamp / 500) % 2)
                    ctx.globalAlpha = 0.5;
                ctx.drawImage(image, x * this.xPixelsPerCell, y * this.yPixelsPerCell, this.xPixelsPerCell, this.yPixelsPerCell);
                ctx.globalAlpha = 1;
                if (drawAPool) {
                    ctx.drawImage(cell.hydration ? fullPoolImage : emptyPoolImage, (x - 0.5) * this.xPixelsPerCell, (y - 0.5) * this.yPixelsPerCell, this.xPixelsPerCell, this.yPixelsPerCell);
                }
                if (cell.type === 'PLANNED_CANAL') {
                    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.arc((x + 0.5) * this.xPixelsPerCell, (y + 0.5) * this.yPixelsPerCell, Math.min(this.xPixelsPerCell, this.yPixelsPerCell) / 3, 0, 2 * Math.PI * cell.amountConstructed / CONSTRUCTION_REQUIRED_FOR_CANAL, false);
                    ctx.stroke();
                }
                if (cell.type === 'MOSS') {
                    ctx.strokeStyle = 'coral';
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.arc((x + 0.5) * this.xPixelsPerCell, (y + 0.5) * this.yPixelsPerCell, Math.min(this.xPixelsPerCell, this.yPixelsPerCell) / 3, 0, 2 * Math.PI * cell.moss / INITIAL_MOSS, false);
                    ctx.stroke();
                }
            }
        }
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (this.drawGridLines) {
            for (let x = firstVisibleColumn; x < lastVisibleColumn; x++) {
                ctx.moveTo(x * this.xPixelsPerCell, 0);
                ctx.lineTo(x * this.xPixelsPerCell, this.rows * this.yPixelsPerCell);
            }
            for (let y = firstVisibleRow; y < lastVisibleRow; y++) {
                ctx.moveTo(0, y * this.yPixelsPerCell);
                ctx.lineTo(this.rows * this.xPixelsPerCell, y * this.yPixelsPerCell);
            }
            ctx.stroke();
        }
    }
    updateHoveredCell() {
        this.hoveredCell.x = Math.floor(this.game.worldSpaceMousePosition.x);
        this.hoveredCell.y = Math.floor(this.game.worldSpaceMousePosition.y);
    }
}
const background = loadImage('assets/pictures/Tardigrame_BG_tile_1600.png');
const gridImages = {
    POOL: loadImage('assets/pictures/full_canals/full_canals__0007_lefttotop.png'),
    BLANK: loadImage('assets/pictures/empty1.png'),
    BIG_ROCK: loadImage('assets/pictures/Rocks_and_moss/just_a_rock.png'),
    ROAD: loadImage('assets/pictures/nsroad1.png'),
    PLANNED_CANAL: loadImage('assets/pictures/futureCanal.png'),
    WATER_SOURCE: loadImage('assets/pictures/Puddle_states/puddle.png'),
    MOSS: loadImage('assets/pictures/Rocks_and_moss/rock_lotsa_moss.png'),
    PLANNED_MOSS: loadImage('assets/pictures/Rocks_and_moss/rock_little_moss.png'),
    CAPSULE: loadImage('assets/pictures/empty1.png'),
};
