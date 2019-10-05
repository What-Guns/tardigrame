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
}