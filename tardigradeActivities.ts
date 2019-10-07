import {Cell, cellsThatNeedWorkDone, hydratedCells, mossyCells} from './cell.js';
import {Battery} from './battery.js';
import {Point, distanceSquared, addPoints, direction} from './math.js';
import {Tardigrade, REPRODUCTION_TIME, liveTardigrades} from './tardigrade.js';
import {loadImage} from './loader.js';

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

  age: number;
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
  age = 0;

  constructor(readonly tardigrade: Tardigrade) {
    const {x, y} = tardigrade.point;
    const game = tardigrade.game;
    this.destination = {
      x: Math.min(Math.max(x + Math.random() * 10 - 5, 0), game.grid.columns),
      y: Math.min(Math.max(y + Math.random() * 10 - 5, 0), game.grid.rows),
    };
  }

  isValid() {
    return distanceSquared(this.tardigrade.point, this.destination) > 0.02;
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
  age = 0;

  constructor(
    private readonly builder: Tardigrade,
    private readonly targetCell: Cell) {
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

export abstract class ObtainResourceActivity implements TardigradeActivity {
  readonly goal?: Cell;
  readonly destination: Point;
  readonly abstract thirstThreshold: number;
  readonly abstract hungerThreshold: number;
  readonly animations = idleAnimations;
  readonly tunImage = tunIdle;
  age = 0;

  constructor(protected readonly tardigrade: Tardigrade, desireableCells: Cell[], public thenWhat: TardigradeActivity|null) {
    const nearestWater = desireableCells
      .map(cell => ({cell, dist2: distanceSquared(tardigrade.point, cell.point)}))
      .sort((a, b) => a.dist2 - b.dist2)
      .map(t => t.cell)[0];
    this.goal = nearestWater;
    this.destination = this.goal
      ? createPointInCellPoint(this.goal.point)
      : {...tardigrade.point};

    const tw = thenWhat ? thenWhat.constructor.name : 'nothing';
    console.log(this.constructor.name + ', then '+tw);
  }

  abstract perform(): boolean;

  abstract isValid(): boolean;

  protected complete() {}
}

export class RehydrateActivity extends ObtainResourceActivity {
  readonly animations = rehydrateAnimations;
  readonly tunImage = tunRehydrate;
  age = 0;

  constructor(tardigrade: Tardigrade, thenWhat: TardigradeActivity|null) {
    super(tardigrade, Array.from(hydratedCells), thenWhat);
  }

  isValid() {
    if(this.tardigrade.fluid >= 1) return false;
    return this.goal ? this.goal.hydration : false;
  }

  perform() {
    if(this.tardigrade.fluid >= 1) this.complete();
    return false;
  }

  thirstThreshold = -Infinity;

  hungerThreshold = 0;
}

export class EatActivity extends ObtainResourceActivity {
  readonly animations = eatAnimations;
  readonly tunImage = tunEat;
  age = 0;

  constructor(tardigrade: Tardigrade, thenWhat: TardigradeActivity|null) {
    super(tardigrade, Array.from(mossyCells), thenWhat);
  }

  isValid() {
    if(this.tardigrade.moss >= 1) return false;
    return this.goal ? this.goal.type === 'MOSS' : false;
  }

  perform() {
    if(this.tardigrade.moss >= 1) this.complete();
    return false;
  }

  // moss is near water, so this can be pretty low
  thirstThreshold = 0.3;

  hungerThreshold = -Infinity;
}

export class ReproduceActivity implements TardigradeActivity {
  readonly animations = reproduceAnimations;
  readonly tunImage = tunReproduce;

  readonly destination: Point;

  hungerThreshold = 0.1;
  thirstThreshold = 0.1;
  age = 0;

  constructor(readonly tardigrade: Tardigrade, readonly goal: Cell) {
    this.destination = createPointInCellPoint(goal.point);
  }

  isValid() {
    return this.goal.type === 'MOSS' && this.goal.moss > REPRODUCTION_TIME - this.tardigrade.reproductionAmount;
  }

  perform(dt: number) {
    if(this.tardigrade.game.grid.getCell(this.tardigrade.point) !== this.goal) return false;
    this.tardigrade.reproductionAmount += this.goal.consumeMoss(dt / 1000);
    return false;
  }
}

const BATTERY_DESTINATION = {
  x: 50,
  y: 50,
};

export class ObtainBatteryActivity implements TardigradeActivity {
  readonly destination: Point;
  readonly animations = buildAnimations;
  readonly tunImage = tunBuild;
  readonly hungerThreshold = 0.4;
  readonly thirstThreshold = 0.1;
  age = 0;

  private readonly push = {x: 0, y: 0};
  private readonly batteryOffset: Point;

  constructor(readonly tardigrade: Tardigrade, readonly battery: Battery) {
    const direction = Math.random() * 2 * Math.PI;
    this.batteryOffset = {
      x: Math.cos(direction) * battery.radius,
      y: Math.sin(direction) * battery.radius,
    };

    this.destination = {...battery.point};
  }

  isValid() {
    if(this.tardigrade.game.batteries.indexOf(this.battery) === -1) return false;
    if(distanceSquared(this.battery.point, BATTERY_DESTINATION) < 1) return false;
    return true;
  }

  perform(dt: number) {
    addPoints(this.destination, this.battery.point, this.batteryOffset);

    if(distanceSquared(this.tardigrade.point, this.battery.point) > Math.pow(this.battery.radius + 0.01, 2)) return false;

    const pushDir = direction(this.battery.point, BATTERY_DESTINATION);
    this.push.x = (dt / 1000) * Math.cos(pushDir) * 0.005;
    this.push.y = (dt / 1000) * Math.sin(pushDir) * 0.005;
    addPoints(this.battery.point, this.battery.point, this.push);

    return true;
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
