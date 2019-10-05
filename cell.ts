import {Point} from './math.js';

export const CONSTRUCTION_REQUIRED_FOR_CANAL = 10000;

export const hydratedCells = new Set<Cell>();
export const cellsThatNeedWorkDone = new Set<Cell>();

export class Cell {
  private _type: CellType = 'BLANK';
  private _hydration = false;
  amountConstructed = 0;

  constructor(readonly point: Point) {}

  get hydration() {
    return this._hydration;
  }

  set hydration(hydrated: boolean) {
    if(this._hydration !== hydrated) {
      if(hydrated) hydratedCells.add(this);
      else hydratedCells.delete(this);
    }
    this._hydration = hydrated;
  }

  get type() {
    return this._type;
  }

  set type(t: CellType) {
    if(t !== this._type) {
      if(t === 'PLANNED_CANAL') cellsThatNeedWorkDone.add(this);
      else cellsThatNeedWorkDone.delete(this);
    }
    this._type = t;
  }
}

export type CellType =
  'BLANK'|
  'POOL'|
  'ROAD'|
  'BIG_ROCK'|
  'PLANNED_CANAL'|
  'WATER_SOURCE';
