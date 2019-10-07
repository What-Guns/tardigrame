import { loadImage } from "./loader.js";
import { addPoints, isPointInBox } from "./math.js";
import { createSoundLibrary, playSoundLooped } from "./audio.js";
const image = loadImage('assets/pictures/capsule_withmoss.png');
const bgImage = loadImage('assets/pictures/capsule_bg.png');
const sparkle1 = loadImage('assets/pictures/assembled_bioweapon_1.png');
const sparkle2 = loadImage('assets/pictures/assembled_bioweapon_2.png');
export class Capsule {
    constructor(game, point) {
        this.game = game;
        this.point = point;
        this.offset = { x: -255, y: -266 };
        this.drawOrigin = { x: 0, y: 0 };
        this.mouseOver = false;
        this.assembled = false;
        this.sound = null;
        game.capsules.push(this);
        addPoints(this.drawOrigin, this.offset, { x: this.point.x * game.grid.xPixelsPerCell, y: this.point.y * game.grid.yPixelsPerCell });
    }
    draw(ctx, timestamp) {
        if (this.assembled) {
            ctx.drawImage(Math.floor(timestamp / 100) % 2 ? sparkle1 : sparkle2, this.drawOrigin.x, this.drawOrigin.y);
            return;
        }
        const mousePos = this.game.worldSpaceMousePosition;
        if (this.game.viewport.scale > 1.2 || isPointInBox(mousePos.x * this.game.grid.xPixelsPerCell, mousePos.y * this.game.grid.yPixelsPerCell, this.drawOrigin.x, this.drawOrigin.y, image.width, image.height)) {
            ctx.globalAlpha = 0.5;
        }
        ctx.drawImage(image, this.drawOrigin.x, this.drawOrigin.y);
        ctx.globalAlpha = 1;
    }
    drawBG(ctx) {
        ctx.drawImage(bgImage, this.drawOrigin.x, this.drawOrigin.y);
    }
    reassemble() {
        this.assembled = true;
        this.sound = playSoundLooped(sound.charge);
    }
    stopSound() {
        this.sound && this.sound.stop();
    }
}
const sound = createSoundLibrary({
    charge: 'assets/audio/sfx/HellIsComing.ogg',
});
