import {Point, direction, distanceSquared, findNearestVeryExpensive} from './math.js';
import {Battery} from './battery.js';
import {Game} from './game.js';
import {Cell, cellsThatNeedWorkDone} from './cell.js';
import * as activities from './tardigradeActivities.js';
import {createSoundLibrary, playSoundAtLocation, playSound} from './audio.js';

export const idleTardigrades = new Set<Tardigrade>();
export const liveTardigrades = new Set<Tardigrade>();
export const tunTardigrades = new Set<Tardigrade>();
export const deadTardigrades = new Set<Tardigrade>();

type State = 'LIVE' | 'TUN' | 'DEAD'

const DESTINATION_THRESHOLD = 0.01;

const guiSounds = createSoundLibrary({
  selectionFailed: 'assets/audio/sfx/BadJob!.ogg',
});

export class Tardigrade {
  readonly point: Point;

  currentCell!: Cell;

  private _activity: activities.TardigradeActivity;

  get activity() {
    return this._activity;
  }

  moss = 0.9; // 0 is starved, 1 babby formed from gonad
  fluid = Math.random() * 0.5 + 0.5;
  dehydrationSpeed = 0.00005; // thirst per millisecond
  hydrationSpeed = 0.0001; // antithirst per millisecond
  eatSpeed = 0.0001;
  appetite = 0.000025; // how hungry working makes tardigrades

  nutrientConsumptionRate = 0.1;
  starvationRate = 0;
  state: State = 'LIVE';
  animationState = 0;
  animationRate = (Math.random() * 500) + 500;

  // in grid cells per second
  readonly speed = 0.2;

  static assignTardigradesToBuild(cell: Cell) {
    const count = cell.type === 'PLANNED_MOSS' ? 2 : 5;
    for(const t of findIdleTardigrades(cell.point, count)) {
      t.assignActivity(new activities.BuildActivity(t, cell));
    }
  }

  static assignTardigradeToReproduce(cell: Cell) {
    let found = false;
    for(const t of findIdleTardigrades(cell.point, 1)) {
      found = true;
      t.assignActivity(new activities.ReproduceActivity(t, cell));
    }
    if(!found) playSound(guiSounds.selectionFailed);
  }

  static assignTardigradeToGetBattery(battery: Battery) {
    let found = false;
    for(const t of findIdleTardigrades(battery.point, 5)) {
      found = true;
      t.assignActivity(new activities.ObtainBatteryActivity(t, battery));
    }
    if(!found) playSound(guiSounds.selectionFailed);
  }

  constructor(readonly game: Game, x: number, y: number) {
    this.point = {x, y};
    this._activity = new activities.IdleActivity(this);
    this.state = 'LIVE';
    idleTardigrades.add(this);
    liveTardigrades.add(this)
    this.currentCell = this.game.grid.getCell(this.point);
  }

  tick(dt: number) {
    this.move(dt);
    this.updateResources(dt);
    this.updateState();
    this.updateActivity(dt);
    this.updateAnimations(dt);
  }

  move(dt: number) {
    if(this.state !== 'LIVE') return;
    const dir = direction(this.point, this.activity.destination);
    const distSquared = distanceSquared(this.point, this.activity.destination);
    if(distSquared > DESTINATION_THRESHOLD) {
      const movement = Math.min(this.speed * dt / 1000, Math.sqrt(distSquared));
      this.point.x += Math.cos(dir) * movement;
      this.point.y += Math.sin(dir) * movement;
    }
    this.point.x = Math.min(Math.max(0, this.point.x), this.game.grid.columns);
    this.point.y = Math.min(Math.max(0, this.point.y), this.game.grid.rows);
    this.currentCell = this.game.grid.getCell(this.point);
  }

  updateResources(dt: number) {
    if(this.currentCell.hydration) {
      this.fluid = Math.min(1, this.fluid + this.hydrationSpeed * dt);
    } else if (this.currentCell.type !== 'MOSS') {
      this.fluid = Math.max(0, this.fluid - this.dehydrationSpeed * dt);
    }

    if(this.currentCell.type === 'MOSS') {
      const maxEat = Math.min(this.eatSpeed * dt, 1 - this.moss)
      this.moss += this.currentCell.consumeMoss(maxEat);
    }

    const thenWhat = this.activity instanceof activities.IdleActivity ? null : this.activity;
    if(this.fluid < this.activity.thirstThreshold) {
      this.assignActivity(new activities.RehydrateActivity(this, thenWhat));
    } else if(this.moss < this.activity.hungerThreshold) {
      this.assignActivity(new activities.EatActivity(this, thenWhat));
    }
  }

  updateState() {
    const targetState = (this.fluid <= 0 || this.moss <= 0) ? 'TUN' : 'LIVE';
    if(this.state === targetState) return;
    this.state = targetState;
    if(this.state === 'LIVE') {
      playSoundAtLocation(sounds.revive, this.point);
      liveTardigrades.add(this);
      tunTardigrades.delete(this);
    } else {
      playSoundAtLocation(sounds.tun, this.point);
      idleTardigrades.delete(this);
      liveTardigrades.delete(this);
      tunTardigrades.add(this);
    }
  }

  updateActivity(dt: number) {
    this.activity.age += dt;
    if(this.activity instanceof activities.ObtainResourceActivity && this.activity.thenWhat) {
      this.activity.thenWhat.age += dt;
    }
    if(this.activity.isValid()) {
      const didWork = this.activity.perform(dt);
      if(didWork) {
        this.moss = Math.max(0, this.moss - dt * this.appetite);
      }
    } else {
      this.findSomethingToDo();
    }
  }

  updateAnimations(dt: number) {
    const cycleLength = this.activity.animations.length * this.animationRate;
    this.animationState += dt;
    while(this.animationState > cycleLength) {
      this.animationState -= cycleLength;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const image = this.chooseImageToDraw();
    ctx.drawImage(
      image,
      this.point.x * this.game.grid.xPixelsPerCell - image.width/2,
      this.point.y * this.game.grid.yPixelsPerCell - image.height/2
    );

    if(this.state === 'LIVE') this.drawHud(ctx);
  }

  assignActivity(a: activities.TardigradeActivity) {
    if(this.activity instanceof activities.ObtainResourceActivity && this.activity.isValid()) {
      this.activity.thenWhat = a;
    } else {
      this._activity = a;
      a.age = 0;
    }
    a = this._activity;
    if(a instanceof activities.IdleActivity || a instanceof activities.ObtainResourceActivity && !a.thenWhat) {
      idleTardigrades.add(this);
    } else {
      idleTardigrades.delete(this);
    }
  }


  private drawHud(ctx: CanvasRenderingContext2D) {
    const mouseDistSquared = distanceSquared(this.point, this.game.worldSpaceMousePosition) * this.game.viewport.scale;

    ctx.lineWidth = 2 / this.game.viewport.scale;
    if(mouseDistSquared < 4) {
      ctx.globalAlpha = mouseDistSquared < 1 ? 1 : (4 - (mouseDistSquared - 1)) / 3;
      ctx.strokeStyle = 'blue';
      ctx.beginPath();
      ctx.arc(
        this.point.x * this.game.grid.xPixelsPerCell,
        this.point.y * this.game.grid.yPixelsPerCell,
        16 / this.game.viewport.scale,
        0,
        2 * Math.PI * this.fluid,
        false
      );
      ctx.stroke();
      ctx.strokeStyle = 'coral';
      ctx.beginPath();
      ctx.arc(
        this.point.x * this.game.grid.xPixelsPerCell,
        this.point.y * this.game.grid.yPixelsPerCell,
        14 / this.game.viewport.scale,
        0,
        2 * Math.PI * this.moss,
        false
      );
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if(!(this.activity instanceof activities.IdleActivity) && (mouseDistSquared < 0.05 || this.activity.age < 1000)) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.point.x * this.game.grid.xPixelsPerCell, this.point.y * this.game.grid.yPixelsPerCell);
      ctx.lineTo(this.activity.destination.x * this.game.grid.xPixelsPerCell, this.activity.destination.y * this.game.grid.yPixelsPerCell);

      if(this.activity instanceof activities.ObtainResourceActivity) {
        const nextActivity = this.activity.thenWhat;
        if(nextActivity && !(nextActivity instanceof activities.IdleActivity)) {
          ctx.lineTo(
            nextActivity.destination.x * this.game.grid.xPixelsPerCell,
            nextActivity.destination.y * this.game.grid.yPixelsPerCell
          );
        }
      }
      ctx.stroke();
    }
  }

  chooseImageToDraw() : HTMLImageElement {
    if(this.state === 'DEAD' || this.state === 'TUN') return this.activity.tunImage;
    return this.activity.animations[Math.floor(this.animationState / this.animationRate)];
  }

  private findSomethingToDo() {
    if(this.activity instanceof activities.ObtainResourceActivity && this.activity.thenWhat) {
      this.assignActivity(this.activity.thenWhat);
      return;
    }
    const cell = findNearestVeryExpensive(Array.from(cellsThatNeedWorkDone), this.point, 1)[0];
    if(cell && distanceSquared(this.point, cell.point) < 25) {
      this.assignActivity(new activities.BuildActivity(this, cell));
    } else {
      this.assignActivity(new activities.IdleActivity(this));
    }
  }
}

function findIdleTardigrades(near: Point, howMany: number) {
  const point = {x: near.x + 0.5, y: near.y + 0.5};
  return findNearestVeryExpensive(Array.from(idleTardigrades), point, howMany);
}

const sounds = createSoundLibrary({
  'tun': 'assets/audio/sfx/LowSqueak.ogg',
  'revive': 'assets/audio/sfx/SqueakFixed.ogg',
})
