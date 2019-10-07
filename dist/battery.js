var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { distanceSquared, assignPoint } from './math.js';
import { fillWithImage } from './loader.js';
export class Battery {
    constructor(game, point) {
        this.game = game;
        this.point = point;
        // this is the size of the hit region, NOT the image.
        // it's a little bigger than the image so that the
        // water bears carrying it are still visible.
        this.radius = (380 / 2) / this.game.grid.xPixelsPerCell;
        this.destination = this.findDestination().point;
        this.lastPoint = { ...point };
    }
    draw(ctx, timestamp) {
        const mouseDistSquared = distanceSquared(this.point, this.game.worldSpaceMousePosition);
        if (this.game.viewport.scale > 1.2 || mouseDistSquared < Math.pow(this.radius, 2)) {
            ctx.globalAlpha = 0.5;
        }
        const moved = distanceSquared(this.lastPoint, this.point);
        ctx.drawImage(Battery.image, this.point.x * this.game.grid.xPixelsPerCell - Battery.image.width / 2, this.point.y * this.game.grid.yPixelsPerCell - Battery.image.height / 2);
        if (moved) {
            ctx.globalAlpha = Math.abs(Math.sin(timestamp / 1000));
            ctx.drawImage(Battery.glow1, this.point.x * this.game.grid.xPixelsPerCell - Battery.image.width / 2, this.point.y * this.game.grid.yPixelsPerCell - Battery.image.height / 2);
            ctx.globalAlpha = Math.abs(Math.cos(timestamp / 1000));
            ctx.drawImage(Battery.glow2, this.point.x * this.game.grid.xPixelsPerCell - Battery.image.width / 2, this.point.y * this.game.grid.yPixelsPerCell - Battery.image.height / 2);
        }
        ctx.globalAlpha = 1;
        assignPoint(this.lastPoint, this.point);
    }
    isAtDestination() {
        return distanceSquared(this.point, this.destination) < 1;
    }
    findDestination() {
        for (const column of this.game.grid.cells) {
            for (const cell of column) {
                if (cell.type === 'CAPSULE')
                    return cell;
            }
        }
        throw new Error("Couldn't find the capsule");
    }
}
__decorate([
    fillWithImage('assets/pictures/battery.png')
], Battery, "image", void 0);
__decorate([
    fillWithImage('assets/pictures/dubiousglow_1.png')
], Battery, "glow1", void 0);
__decorate([
    fillWithImage('assets/pictures/dubiousglow_2.png')
], Battery, "glow2", void 0);
