export interface Cell {
  type: CellType;
  hydration: number;
}

export type CellType = 'BLANK' | 'POOL' | 'ROAD' | 'BIG_ROCK';
