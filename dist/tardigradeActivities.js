import { cellsThatNeedWorkDone, hydratedCells, mossyCells } from './cell.js';
import { distanceSquared, addPoints, direction } from './math.js';
import { REPRODUCTION_TIME, liveTardigrades } from './tardigrade.js';
import { loadImage } from './loader.js';
import { generationThree } from './game.js';
import { createSoundLibrary, playSoundAtLocation } from './audio.js';
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
export class IdleActivity {
    constructor(tardigrade) {
        this.tardigrade = tardigrade;
        this.animations = idleAnimations;
        this.tunImage = tunIdle;
        this.age = 0;
        this.thirstThreshold = 0.6;
        this.hungerThreshold = 0.3;
        this.isIdle = true;
        const { x, y } = tardigrade.point;
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
}
export class BuildActivity {
    constructor(builder, targetCell) {
        this.builder = builder;
        this.targetCell = targetCell;
        this.destination = { x: 0, y: 0 };
        this.animations = buildAnimations;
        this.tunImage = tunBuild;
        this.age = 0;
        this.thirstThreshold = 0.4;
        this.hungerThreshold = 0.1;
        this.isIdle = false;
        this.destination = createPointInCellPoint(targetCell.point);
    }
    isValid() {
        return cellsThatNeedWorkDone.has(this.targetCell);
    }
    perform(dt) {
        if (this.builder.game.grid.getCell(this.builder.point) !== this.targetCell)
            return false;
        this.targetCell.addConstruction(dt);
        return true;
    }
}
export class ObtainResourceActivity {
    constructor(tardigrade, desireableCells, thenWhat) {
        this.tardigrade = tardigrade;
        this.thenWhat = thenWhat;
        this.animations = idleAnimations;
        this.tunImage = tunIdle;
        this.age = 0;
        const nearestWater = desireableCells
            .map(cell => ({ cell, dist2: distanceSquared(tardigrade.point, cell.point) }))
            .sort((a, b) => a.dist2 - b.dist2)
            .map(t => t.cell)[0];
        this.goal = nearestWater;
        this.destination = this.goal
            ? createPointInCellPoint(this.goal.point)
            : { ...tardigrade.point };
    }
    complete() { }
    get isIdle() {
        if (!this.thenWhat)
            return true;
        return this.thenWhat.isIdle;
    }
}
export class RehydrateActivity extends ObtainResourceActivity {
    constructor(tardigrade, thenWhat) {
        super(tardigrade, Array.from(hydratedCells), thenWhat);
        this.animations = rehydrateAnimations;
        this.tunImage = tunRehydrate;
        this.age = 0;
        this.thirstThreshold = -Infinity;
        this.hungerThreshold = 0;
    }
    isValid() {
        if (this.tardigrade.fluid >= 1)
            return false;
        return this.goal ? this.goal.hydration : false;
    }
    perform() {
        if (this.tardigrade.fluid >= 1)
            this.complete();
        return false;
    }
}
export class EatActivity extends ObtainResourceActivity {
    constructor(tardigrade, thenWhat) {
        super(tardigrade, Array.from(mossyCells), thenWhat);
        this.animations = eatAnimations;
        this.tunImage = tunEat;
        this.age = 0;
        // moss is near water, so this can be pretty low
        this.thirstThreshold = 0.3;
        this.hungerThreshold = -Infinity;
    }
    isValid() {
        if (this.tardigrade.moss >= 1)
            return false;
        return this.goal ? this.goal.type === 'MOSS' : false;
    }
    perform() {
        if (this.tardigrade.moss >= 1)
            this.complete();
        return false;
    }
}
export class ReproduceActivity {
    constructor(tardigrade, goal) {
        this.tardigrade = tardigrade;
        this.goal = goal;
        this.animations = reproduceAnimations;
        this.tunImage = tunReproduce;
        this.hungerThreshold = 0.1;
        this.thirstThreshold = 0.3;
        this.age = 0;
        this.isIdle = false;
        this.destination = createPointInCellPoint(goal.point);
    }
    isValid() {
        return this.goal.type === 'MOSS' && this.goal.moss > REPRODUCTION_TIME - this.tardigrade.reproductionAmount;
    }
    perform(dt) {
        if (this.tardigrade.game.grid.getCell(this.tardigrade.point) !== this.goal)
            return false;
        this.tardigrade.reproductionAmount += this.goal.consumeMoss(dt / 1000);
        return false;
    }
}
export class ObtainBatteryActivity {
    constructor(tardigrade, battery) {
        this.tardigrade = tardigrade;
        this.battery = battery;
        this.animations = buildAnimations;
        this.tunImage = tunBuild;
        this.hungerThreshold = 0.4;
        this.thirstThreshold = 0.1;
        this.age = 0;
        this.push = { x: 0, y: 0 };
        // This allows tardigrades to *stop* carrying the battery
        this.isIdle = true;
        const direction = Math.random() * 2 * Math.PI;
        this.batteryOffset = {
            x: Math.cos(direction) * (battery.radius - 0.02),
            y: Math.sin(direction) * (battery.radius - 0.02),
        };
        this.destination = { ...battery.point };
    }
    isValid() {
        if (liveTardigrades.size < generationThree)
            return false;
        if (this.tardigrade.game.batteries.indexOf(this.battery) === -1)
            return false;
        if (this.battery.isAtDestination())
            return false;
        return true;
    }
    perform(dt) {
        addPoints(this.destination, this.battery.point, this.batteryOffset);
        if (distanceSquared(this.tardigrade.point, this.battery.point) > Math.pow(this.battery.radius + 0.02, 2))
            return false;
        this.playSound();
        const pushDir = direction(this.battery.point, this.battery.destination);
        this.push.x = (dt / 1000) * Math.cos(pushDir) * 0.005;
        this.push.y = (dt / 1000) * Math.sin(pushDir) * 0.005;
        addPoints(this.battery.point, this.battery.point, this.push);
        return true;
    }
    playSound() {
        const rand = Math.floor(Math.random() * 900);
        switch (rand) {
            case 0:
                playSoundAtLocation(sounds.carrying0, this.tardigrade.point);
                break;
            case 1:
                playSoundAtLocation(sounds.carrying1, this.tardigrade.point);
                break;
            case 2:
                playSoundAtLocation(sounds.carrying2, this.tardigrade.point);
                break;
        }
    }
}
/**
 * Cell coordinates are the upper-left corner.
 * Given a point that represents the origin of a cell, this function
 * produces a new point inside that cell with random jitter.
 */
function createPointInCellPoint(point) {
    const output = { x: 0, y: 0 };
    const randomness = {
        x: Math.random() * 0.5 + 0.25,
        y: Math.random() * 0.5 + 0.25,
    };
    addPoints(output, point, randomness);
    return output;
}
const sounds = createSoundLibrary({
    carrying0: 'assets/audio/sfx/Yip3.ogg',
    carrying1: 'assets/audio/sfx/Yip5.ogg',
    carrying2: 'assets/audio/sfx/Yip6.ogg',
});
