import {Point} from './math';

export const CONSTRUCTION_REQUIRED_FOR_CANAL = 10000;

export interface Cell {
  readonly point: Point;
  type: CellType;
  hydration: boolean;
  amountConstructed: number;
}

export type CellType =
  'BLANK'|
  'POOL'|
  'ROAD'|
  'BIG_ROCK'|
  'PLANNED_CANAL'|
  'WATER_SOURCE';
