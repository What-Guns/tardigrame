import {Point} from './math';

export const CONSTRUCTION_REQUIRED_FOR_CANAL = 10000;

export const hydratedCells = new Set<Cell>();

export class Cell {
  type: CellType = 'BLANK';
  _hydration = false;
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
}

export type CellType =
  'BLANK'|
  'POOL'|
  'ROAD'|
  'BIG_ROCK'|
  'PLANNED_CANAL'|
  'WATER_SOURCE';
