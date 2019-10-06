import {Cell, cellsThatNeedWorkDone, hydratedCells} from './cell.js';
import {Point, distanceSquared, addPoints} from './math.js';
import {Tardigrade} from './tardigrade.js';
import { loadImage } from './loader.js';

export const idleTardigrades = new Set<Tardigrade>();

export interface TardigradeActivity {
  isValid(): boolean;
  perform(dt: number): void;
  readonly destination: Point;
  readonly animations: Array<HTMLImageElement>;

  // a tardigrade with less fluid than this will abandon this activity
  thirstThreshold: number;
}

export class IdleActivity implements TardigradeActivity {
  readonly destination: Point;
  readonly animations = [
    loadImage('assets/pictures/Tardigrade_animations/tardigrade_orig-1.png.png'),
    loadImage('assets/pictures/Tardigrade_animations/tardigrade_orig-2.png.png'),
  ];

  constructor(readonly tardigrade: Tardigrade) {
    const {x, y} = tardigrade.point;
    idleTardigrades.add(tardigrade);
    const game = tardigrade.game;
    this.destination = {
      x: Math.min(Math.max(x + Math.random() * 10 - 5, 0), game.grid.columns),
      y: Math.min(Math.max(y + Math.random() * 10 - 5, 0), game.grid.rows),
    };
  }

  isValid() {
    return distanceSquared(this.tardigrade.point, this.destination) > 0.01;
  }

  perform() {}

  thirstThreshold = 0.6;
}

export class BuildActivity implements TardigradeActivity {
  readonly destination = {x: 0, y: 0};
  readonly animations = [
    loadImage('assets/pictures/Tardigrade_animations/tardigrade_orig-1.png.png'),
    loadImage('assets/pictures/Tardigrade_animations/tardigrade_orig-2.png.png'),
  ]

  constructor(
    private readonly builder: Tardigrade,
    private readonly targetCell: Cell) {
    idleTardigrades.delete(builder);
    this.destination = createPointInCellPoint(targetCell.point);
  }

  isValid() {
    return cellsThatNeedWorkDone.has(this.targetCell);
  }

  perform(dt: number) {
    if(this.builder.game.grid.getCell(this.builder.point) !== this.targetCell) return;

    switch(this.targetCell.type) {
      case 'PLANNED_CANAL':
        this.targetCell.addConstruction(dt);
        break;
      case 'PLANNED_MOSS':
        this.targetCell.type = 'MOSS';
        break;
    }
  }

  thirstThreshold = 0.4;
}

export class RehydrateActivity implements TardigradeActivity {
  readonly goal?: Cell;
  readonly destination: Point;
  readonly animations = [
    loadImage('assets/pictures/Tardigrade_animations/tardigrade_orig-1.png.png'),
    loadImage('assets/pictures/Tardigrade_animations/tardigrade_orig-2.png.png'),
  ]

  constructor(private readonly tardigrade: Tardigrade) {
    const nearestWater = Array.from(hydratedCells)
      .map(cell => ({cell, dist2: distanceSquared(tardigrade.point, cell.point)}))
      .sort((a, b) => a.dist2 - b.dist2)
      .map(t => t.cell)[0];
    this.goal = nearestWater;
    this.destination = this.goal
      ? createPointInCellPoint(this.goal.point)
      : {...tardigrade.point};
    idleTardigrades.delete(tardigrade);
  }

  isValid() {
    if(!this.goal) return false;
    return this.goal.hydration && this.tardigrade.fluid < 1;
  }

  perform() {}

  thirstThreshold = -Infinity;
}

/**
 * Cell coordinates are the upper-left corner.
 * Given a point that represents the origin of a cell, this function
 * produces a new point inside that cell with random jitter.
 */
function createPointInCellPoint(point: Point) {
  const output = {x: 0, y: 0};
  const randomness = {
    x: Math.random() * 0.5 + 0.25,
    y: Math.random() * 0.5 + 0.25,
  };
  addPoints(output, point, randomness);
  return output;
}
