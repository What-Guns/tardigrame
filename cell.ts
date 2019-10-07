import {Point} from './math.js';
import { createSoundLibrary, playSoundAtLocation } from './audio.js';

export const CONSTRUCTION_REQUIRED_FOR_CANAL = 10000;

export const hydratedCells = new Set<Cell>();
export const mossyCells = new Set<Cell>();
export const cellsThatNeedWorkDone = new Set<Cell>();

export const INITIAL_MOSS = 25;

export class Cell {
  moss = 0;

  private _type: CellType = 'BLANK';
  private _hydration = false;

  private _amountConstructed = 0;
  visible = true;

  get amountConstructed() {
    return this._amountConstructed;
  }

  constructor(readonly point: Point) {}

  get hydration() {
    if(this.type !== 'POOL' && this.type !== 'WATER_SOURCE' && this.type !== 'CAPSULE') return false;
    return this._hydration;
  }

  set hydration(hydrated: boolean) {
    if(hydrated && this.type !== 'POOL' && this.type !== 'WATER_SOURCE' && this.type !== 'CAPSULE') {
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
    if(t === this._type) return;
    this._type = t;

    this._amountConstructed = 0;

    if(t === 'WATER_SOURCE' || t === 'CAPSULE') this.hydration = true;

    if(t === 'MOSS') {
      mossyCells.add(this);
      this.moss = INITIAL_MOSS;
    } else {
      mossyCells.delete(this);
    }

    if(t === 'PLANNED_CANAL' || t === 'PLANNED_MOSS') {
      playSoundAtLocation(sounds.click1, this.point);
      cellsThatNeedWorkDone.add(this);
    } else {
      cellsThatNeedWorkDone.delete(this);
    }
  }

  addConstruction(amount: number) {
    if(this.type !== 'PLANNED_CANAL' && this.type !== 'PLANNED_MOSS') {
      throw new Error(`Someone is trying to build on ${this.type}`);
    }

    this._amountConstructed += amount;

    if(this.type === 'PLANNED_MOSS') this.playMossSound();

    if(this.type === 'PLANNED_CANAL' && this.amountConstructed > 10000) {
      this.type = 'POOL';
    }

    if(this.type === 'PLANNED_MOSS' && this.amountConstructed > 20000) {
      this.type = 'MOSS';
      playSoundAtLocation(sounds.mossDone, this.point)
    }
  }

  consumeMoss(amount: number) {
    if(this.type !== 'MOSS') throw new Error(`No moss to eat on ${this.type}`);

    const amountConsumed = Math.min(amount, this.moss);
    this.moss -= amountConsumed;
    if(this.moss <= 0) this.type = 'BLANK';
    return amountConsumed;
  }

  private playMossSound() {
    const rand = Math.floor(Math.random() * 300);
    switch(rand) {
      case 0:
        playSoundAtLocation(sounds.moss1, this.point)
        break;
      case 1:
        playSoundAtLocation(sounds.moss2, this.point)
        break;
      case 2:
        playSoundAtLocation(sounds.moss3, this.point)
        break;
    }
  }
}

const sounds = createSoundLibrary({
  moss1: 'assets/audio/sfx/PlantingMoss.ogg',
  moss2: 'assets/audio/sfx/PlantingMoss2.ogg',
  moss3: 'assets/audio/sfx/PlantingMoss3.ogg',
  mossDone: 'assets/audio/sfx/Sproing.ogg',
  click1: 'assets/audio/sfx/Click.ogg',
})

export type CellType =
  'BLANK'|
  'POOL'|
  'ROAD'|
  'BIG_ROCK'|
  'PLANNED_CANAL'|
  'WATER_SOURCE'|
  'PLANNED_MOSS'|
  'MOSS'|
  'CAPSULE';
