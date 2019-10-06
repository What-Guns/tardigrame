import {Point} from './math.js';

export const CONSTRUCTION_REQUIRED_FOR_CANAL = 10000;

export const hydratedCells = new Set<Cell>();
export const mossyCells = new Set<Cell>();
export const cellsThatNeedWorkDone = new Set<Cell>();

export class Cell {
  private _type: CellType = 'BLANK';
  private _hydration = false;
  amountConstructed = 0;

  constructor(readonly point: Point) {}

  get hydration() {
    if(this.type !== 'POOL' && this.type !== 'WATER_SOURCE') return false;
    return this._hydration;
  }

  set hydration(hydrated: boolean) {
    if(hydrated && this.type !== 'POOL' && this.type !== 'WATER_SOURCE') {
      throw new Error('Only pools and water sources can be hydrated');
    }
    if(hydrated) hydratedCells.add(this);
    else hydratedCells.delete(this);
    this._hydration = hydrated;
  }

  get type() {
    return this._type;
  }

  set type(t: CellType) {
    this._type = t;

    if(t === 'WATER_SOURCE') this.hydration = true;

    if(t === 'MOSS') {
      mossyCells.add(this);
    } else {
      mossyCells.delete(this);
    }

    if(t === 'PLANNED_CANAL' || t === 'PLANNED_MOSS') {
      cellsThatNeedWorkDone.add(this);
    } else {
      cellsThatNeedWorkDone.delete(this);
    }
  }
}

export type CellType =
  'BLANK'|
  'POOL'|
  'ROAD'|
  'BIG_ROCK'|
  'PLANNED_CANAL'|
  'WATER_SOURCE'|
  'PLANNED_MOSS'|
  'MOSS';
