import {Cell, cellsThatNeedWorkDone, hydratedCells, mossyCells} from './cell.js';
import {Point, distanceSquared, addPoints} from './math.js';
import {Tardigrade} from './tardigrade.js';
import { loadImage } from './loader.js';

export const idleTardigrades = new Set<Tardigrade>();

export interface TardigradeActivity {
  isValid(): boolean;

  /** Returns whether the tardigrade did strenuous work. */
  perform(dt: number): boolean;

  readonly destination: Point;
  readonly animations: Array<HTMLImageElement>;
  readonly tunImage: HTMLImageElement;

  /** a tardigrade with less fluid than this will abandon this activity */
  readonly thirstThreshold: number;

  /** a tardigrade with less moss than this will abandon this activity */
  readonly hungerThreshold: number;
}

const idleAnimations = [
  loadImage('assets/pictures/Tardigrade_animations/tardigrade_orig-1.png.png'),
  loadImage('assets/pictures/Tardigrade_animations/tardigrade_orig-2.png.png'),
];
const tunIdle = loadImage('assets/pictures/Tardigrade_animations/tun/tardigrade_orig-1_tun.png');

const buildAnimations = [
  loadImage('assets/pictures/Tardigrade_animations/tardi_build1.png'),
  loadImage('assets/pictures/Tardigrade_animations/tardi_build2.png'),
];
const tunBuild = loadImage('assets/pictures/Tardigrade_animations/tun/tardi_build1_tun.png');

const eatAnimations = [
  loadImage('assets/pictures/Tardigrade_animations/tardi_eat1.png'),
  loadImage('assets/pictures/Tardigrade_animations/tardi_eat2.png'),
];
const tunEat = loadImage('assets/pictures/Tardigrade_animations/tun/tardi_eat1_tun.png');

const rehydrateAnimations = [
  loadImage('assets/pictures/Tardigrade_animations/tardi_drink1.png'),
  loadImage('assets/pictures/Tardigrade_animations/tardi_drink2.png'),
];
const tunRehydrate = loadImage('assets/pictures/Tardigrade_animations/tun/tardi_drink1_tun.png');

const reproduceAnimations = [
  loadImage('assets/pictures/Tardigrade_animations/tardi_babby1.png'),
  loadImage('assets/pictures/Tardigrade_animations/tardi_babby2.png'),
];
const tunReproduce = loadImage('assets/pictures/Tardigrade_animations/tun/tardi_babby1_tun.png');

export class IdleActivity implements TardigradeActivity {
  readonly destination: Point;
  readonly animations = idleAnimations
  readonly tunImage = tunIdle;

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

  perform() {
    return false;
  }

  thirstThreshold = 0.6;

  hungerThreshold = 0.3;
}

export class BuildActivity implements TardigradeActivity {
  readonly destination = {x: 0, y: 0};
  readonly animations = buildAnimations;
  readonly tunImage = tunBuild;

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
    if(this.builder.game.grid.getCell(this.builder.point) !== this.targetCell) return false;
    this.targetCell.addConstruction(dt);
    return true;
  }

  thirstThreshold = 0.4;

  hungerThreshold = 0.1;
}

export abstract class ObtainResourceAnimation implements TardigradeActivity {
  readonly goal?: Cell;
  readonly destination: Point;
  readonly abstract thirstThreshold: number;
  readonly abstract hungerThreshold: number;
  readonly animations = idleAnimations;
  readonly tunImage = tunIdle;

  constructor(protected readonly tardigrade: Tardigrade, desireableCells: Cell[]) {
    const nearestWater = desireableCells
      .map(cell => ({cell, dist2: distanceSquared(tardigrade.point, cell.point)}))
      .sort((a, b) => a.dist2 - b.dist2)
      .map(t => t.cell)[0];
    this.goal = nearestWater;
    this.destination = this.goal
      ? createPointInCellPoint(this.goal.point)
      : {...tardigrade.point};
    idleTardigrades.delete(tardigrade);
  }

  perform() {
    return false;
  }

  abstract isValid(): boolean;
}

export class RehydrateActivity extends ObtainResourceAnimation {
  readonly animations = rehydrateAnimations;
  readonly tunImage = tunRehydrate;

  constructor(tardigrade: Tardigrade) {
    super(tardigrade, Array.from(hydratedCells));
  }

  isValid() {
    if(!this.goal) return false;
    return this.goal.hydration && this.tardigrade.fluid < 1;
  }

  thirstThreshold = -Infinity;

  hungerThreshold = 0;
}

export class EatActivity extends ObtainResourceAnimation {
  readonly animations = eatAnimations;
  readonly tunImage = tunEat;

  constructor(tardigrade: Tardigrade) {
    super(tardigrade, Array.from(mossyCells));
  }

  isValid() {
    if(!this.goal) return false;
    return this.goal.type === 'MOSS' && this.tardigrade.moss < 1;
  }

  // moss is near water, so this can be pretty low
  thirstThreshold = 0.15;

  hungerThreshold = -Infinity;
}

const REPRODUCTION_TIME = 10;

export class ReproduceActivity implements TardigradeActivity {
  readonly animations = reproduceAnimations;
  readonly tunImage = tunReproduce;

  readonly destination: Point;

  hungerThreshold = 0.1;
  thirstThreshold = 0.1;

  private progress = 0;

  constructor(readonly tardigrade: Tardigrade, readonly goal: Cell) {
    this.destination = createPointInCellPoint(goal.point);
    idleTardigrades.delete(tardigrade);
  }

  isValid() {
    return this.progress < REPRODUCTION_TIME && this.goal.type === 'MOSS';
  }

  perform(dt: number) {
    if(this.tardigrade.game.grid.getCell(this.tardigrade.point) !== this.goal) return false;
    this.progress += this.goal.consumeMoss(dt / 1000);
    if(this.progress > REPRODUCTION_TIME) {
      const game = this.tardigrade.game;
      const {x, y} = this.tardigrade.point;
      game.pawns.push(new Tardigrade(game, x, y));
    }
    // yeah it's weird that we don't consider this "strenuous",
    // but we consume a bunch more moss above instead.
    return false;
  }
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
