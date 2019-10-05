import { loadImage } from "./loader.js";

// 0 is right, 1 is left, 2 is bottom, index 3 is top

export const fullCanalImages = [[[[
  loadImage('assets/pictures/full canals v2/full_canals_0017_lonely.png'), //0000
  loadImage('assets/pictures/full canals v2/full_canals__0010_endfromtop.png'), // 0001
],[
  loadImage('assets/pictures/full canals v2/full_canals__0011_endfrombottom.png'), // 0010
  loadImage('assets/pictures/full canals v2/full_canals__0015_straight.png'), // 0011
]],[[
  loadImage('assets/pictures/full canals v2/full_canals__0009_endfromright.png'), // 0100
  loadImage('assets/pictures/full canals v2/full_canals__0007_lefttotop.png'), // 0101
],[
  loadImage('assets/pictures/full canals v2/full_canals__0004_lefttobottom.png'), // 0110
  loadImage('assets/pictures/full canals v2/full_canals__0001_leftexit.png'), // 0111
]]],[[[
  loadImage('assets/pictures/full canals v2/full_canals__0008_endfromleft.png'), // 1000
  loadImage('assets/pictures/full canals v2/full_canals__0005_righttotop.png'), // 1001
],[
  loadImage('assets/pictures/full canals v2/full_canals__0012_righttobottom.png'), // 1010
  loadImage('assets/pictures/full canals v2/full_canals__0003_rightexit.png'), // 1011
]],[[
  loadImage('assets/pictures/full canals v2/full_canals__0006_straightcenter.png'), // 1100
  loadImage('assets/pictures/full canals v2/full_canals__0002_topexit.png'), // 1101
],[
  loadImage('assets/pictures/full canals v2/full_canals__0013_bottomexit.png'), // 1110
  loadImage('assets/pictures/full canals v2/full_canals__0014_4way.png'), // 1111
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

export const fullWaterImage = loadImage('assets/pictures/full canals v2/full_canals__0000_full.png')