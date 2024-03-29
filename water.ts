import { loadImage } from "./loader.js";
import { Cell } from "./cell.js";
import { playSoundAtLocation, createSoundLibrary } from "./audio.js";
import {Point} from './math.js';

// 0 is right, 1 is left, 2 is bottom, index 3 is top

export const fullCanalImages = [[[[
  loadImage('assets/pictures/full_canals/full_canals_0017_lonely.png'), //0000
  loadImage('assets/pictures/full_canals/full_canals__0010_endfromtop.png'), // 0001
],[
  loadImage('assets/pictures/full_canals/full_canals__0011_endfrombottom.png'), // 0010
  loadImage('assets/pictures/full_canals/full_canals__0015_straight.png'), // 0011
]],[[
  loadImage('assets/pictures/full_canals/full_canals__0009_endfromright.png'), // 0100
  loadImage('assets/pictures/full_canals/full_canals__0007_lefttotop.png'), // 0101
],[
  loadImage('assets/pictures/full_canals/full_canals__0004_lefttobottom.png'), // 0110
  loadImage('assets/pictures/full_canals/full_canals__0001_leftexit.png'), // 0111
]]],[[[
  loadImage('assets/pictures/full_canals/full_canals__0008_endfromleft.png'), // 1000
  loadImage('assets/pictures/full_canals/full_canals__0005_righttotop.png'), // 1001
],[
  loadImage('assets/pictures/full_canals/full_canals__0012_righttobottom.png'), // 1010
  loadImage('assets/pictures/full_canals/full_canals__0003_rightexit.png'), // 1011
]],[[
  loadImage('assets/pictures/full_canals/full_canals__0006_straightcenter.png'), // 1100
  loadImage('assets/pictures/full_canals/full_canals__0002_topexit.png'), // 1101
],[
  loadImage('assets/pictures/full_canals/full_canals__0013_bottomexit.png'), // 1110
  loadImage('assets/pictures/full_canals/full_canals__0014_4way.png'), // 1111
]]]];

export const emptyCanalImages = [[[[
  loadImage('assets/pictures/Empty Canals/empty_canals_0000_lonely.png'), //0000
  loadImage('assets/pictures/Empty Canals/empty_canals_0011_endfromtop.png'), // 0001
],[
  loadImage('assets/pictures/Empty Canals/empty_canals_0010_endfrombottom.png'), // 0010
  loadImage('assets/pictures/Empty Canals/empty_canals_0009_centerupdown.png'), // 0011
]],[[
  loadImage('assets/pictures/Empty Canals/empty_canals_0013_endfromleft.png'), // 0100
  loadImage('assets/pictures/Empty Canals/empty_canals_0008_toptoleft.png'), // 0101
],[
  loadImage('assets/pictures/Empty Canals/empty_canals_0006_lefttobottom.png'), // 0110
  loadImage('assets/pictures/Empty Canals/empty_canals_0002_exitleft.png'), // 0111
]]],[[[
  loadImage('assets/pictures/Empty Canals/empty_canals_0012_endfromright.png'), // 1000
  loadImage('assets/pictures/Empty Canals/empty_canals_0007_toptoright.png'), // 1001
],[
  loadImage('assets/pictures/Empty Canals/empty_canals_0005_righttobottom.png'), // 1010
  loadImage('assets/pictures/Empty Canals/empty_canals_0004_exitright.png'), // 1011
]],[[
  loadImage('assets/pictures/Empty Canals/empty_canals_0015_across.png'), // 1100
  loadImage('assets/pictures/Empty Canals/empty_canals_0003_exitleft.png'), // 1101
],[
  loadImage('assets/pictures/Empty Canals/empty_canals_0001_exitbottom.png'), // 1110
  loadImage('assets/pictures/Empty Canals/empty_canals_0014_4way.png'), // 1111
]]]];

export const fullPoolImage = loadImage('assets/pictures/full_canals/full_canals__0000_full.png');
export const emptyPoolImage = loadImage('assets/pictures/Empty Canals/empty_canals_0016_bigsquare.png');

const sounds = createSoundLibrary({splash: 'assets/audio/sfx/Water2.ogg'});

let timeSinceLastWetDryCalc = 0;
export function calculateWetDryCanals(cells: Array<Array<Cell>>, dt : number) : void {
  if(timeSinceLastWetDryCalc < 250) {
    timeSinceLastWetDryCalc += dt;
    return;
  }
  timeSinceLastWetDryCalc -= 250;

  let playSplashLocation: Point|null = null;
  for(let x=0; x<cells.length; x++) {
    for(let y=0; y<cells[x].length; y++) {
      const cell = cells[x][y];
      if(cell.type !== 'POOL') {
        continue;
      }
      if(cells[x][y].hydration) {
        continue;
      }
      const above = cells[x-1] && cells[x-1][y] && cells[x-1][y].hydration; 
      const below = cells[x+1] && cells[x+1][y] && cells[x+1][y].hydration; 
      const left = cells[x] && cells[x][y-1] && cells[x][y-1].hydration;
      const right = cells[x] && cells[x][y+1] && cells[x][y+1].hydration;
      if(above || below || left || right) {
        cell.hydration = true;
        playSplashLocation = cell.point;
        break;
      };
    }
  }

  if(playSplashLocation) {
    playSoundAtLocation(sounds['splash'], playSplashLocation);
  }
}
