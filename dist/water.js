import { loadImage } from "./loader.js";
import { playSoundAtLocation, createSoundLibrary } from "./audio.js";
// 0 is right, 1 is left, 2 is bottom, index 3 is top
export const fullCanalImages = [[[[
                loadImage('assets/pictures/full_canals/full_canals_0017_lonely.png'),
                loadImage('assets/pictures/full_canals/full_canals__0010_endfromtop.png'),
            ], [
                loadImage('assets/pictures/full_canals/full_canals__0011_endfrombottom.png'),
                loadImage('assets/pictures/full_canals/full_canals__0015_straight.png'),
            ]], [[
                loadImage('assets/pictures/full_canals/full_canals__0009_endfromright.png'),
                loadImage('assets/pictures/full_canals/full_canals__0007_lefttotop.png'),
            ], [
                loadImage('assets/pictures/full_canals/full_canals__0004_lefttobottom.png'),
                loadImage('assets/pictures/full_canals/full_canals__0001_leftexit.png'),
            ]]], [[[
                loadImage('assets/pictures/full_canals/full_canals__0008_endfromleft.png'),
                loadImage('assets/pictures/full_canals/full_canals__0005_righttotop.png'),
            ], [
                loadImage('assets/pictures/full_canals/full_canals__0012_righttobottom.png'),
                loadImage('assets/pictures/full_canals/full_canals__0003_rightexit.png'),
            ]], [[
                loadImage('assets/pictures/full_canals/full_canals__0006_straightcenter.png'),
                loadImage('assets/pictures/full_canals/full_canals__0002_topexit.png'),
            ], [
                loadImage('assets/pictures/full_canals/full_canals__0013_bottomexit.png'),
                loadImage('assets/pictures/full_canals/full_canals__0014_4way.png'),
            ]]]];
export const emptyCanalImages = [[[[
                loadImage('assets/pictures/Empty Canals/empty_canals_0000_lonely.png'),
                loadImage('assets/pictures/Empty Canals/empty_canals_0011_endfromtop.png'),
            ], [
                loadImage('assets/pictures/Empty Canals/empty_canals_0010_endfrombottom.png'),
                loadImage('assets/pictures/Empty Canals/empty_canals_0009_centerupdown.png'),
            ]], [[
                loadImage('assets/pictures/Empty Canals/empty_canals_0013_endfromleft.png'),
                loadImage('assets/pictures/Empty Canals/empty_canals_0008_toptoleft.png'),
            ], [
                loadImage('assets/pictures/Empty Canals/empty_canals_0006_lefttobottom.png'),
                loadImage('assets/pictures/Empty Canals/empty_canals_0002_exitleft.png'),
            ]]], [[[
                loadImage('assets/pictures/Empty Canals/empty_canals_0012_endfromright.png'),
                loadImage('assets/pictures/Empty Canals/empty_canals_0007_toptoright.png'),
            ], [
                loadImage('assets/pictures/Empty Canals/empty_canals_0005_righttobottom.png'),
                loadImage('assets/pictures/Empty Canals/empty_canals_0004_exitright.png'),
            ]], [[
                loadImage('assets/pictures/Empty Canals/empty_canals_0015_across.png'),
                loadImage('assets/pictures/Empty Canals/empty_canals_0003_exitleft.png'),
            ], [
                loadImage('assets/pictures/Empty Canals/empty_canals_0001_exitbottom.png'),
                loadImage('assets/pictures/Empty Canals/empty_canals_0014_4way.png'),
            ]]]];
export const fullPoolImage = loadImage('assets/pictures/full_canals/full_canals__0000_full.png');
export const emptyPoolImage = loadImage('assets/pictures/Empty Canals/empty_canals_0016_bigsquare.png');
const sounds = createSoundLibrary({ splash: 'assets/audio/sfx/Water2.ogg' });
let timeSinceLastWetDryCalc = 0;
export function calculateWetDryCanals(cells, dt) {
    if (timeSinceLastWetDryCalc < 250) {
        timeSinceLastWetDryCalc += dt;
        return;
    }
    timeSinceLastWetDryCalc -= 250;
    let playSplashLocation = null;
    for (let x = 0; x < cells.length; x++) {
        for (let y = 0; y < cells[x].length; y++) {
            const cell = cells[x][y];
            if (cell.type !== 'POOL') {
                continue;
            }
            if (cells[x][y].hydration) {
                continue;
            }
            const above = cells[x - 1] && cells[x - 1][y] && cells[x - 1][y].hydration;
            const below = cells[x + 1] && cells[x + 1][y] && cells[x + 1][y].hydration;
            const left = cells[x] && cells[x][y - 1] && cells[x][y - 1].hydration;
            const right = cells[x] && cells[x][y + 1] && cells[x][y + 1].hydration;
            if (above || below || left || right) {
                cell.hydration = true;
                playSplashLocation = cell.point;
                break;
            }
            ;
        }
    }
    if (playSplashLocation) {
        playSoundAtLocation(sounds['splash'], playSplashLocation);
    }
}
