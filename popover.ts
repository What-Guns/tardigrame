import { loadImage } from "./loader.js";
import {isPointInBox, Point} from './math.js';
import { Game } from "./game.js";

export class PopoverButton {
  readonly cb: (ev: MouseEvent) => void;
  constructor(
    readonly popover: Popover,
    readonly x: number,
    readonly y: number,
    readonly image: HTMLImageElement,
    ctx: CanvasRenderingContext2D,
    readonly callback: (ev: MouseEvent) => void
  ) {
    this.cb = (ev: MouseEvent) => {
      if(isPointInBox(ev.offsetX, ev.offsetY, x + popover.getOffset().x, y + popover.getOffset().y, image.width, image.height)) {
        popover.hide(ctx)
        this.callback(ev);
      }
    }
    ctx.canvas.addEventListener('mouseup', this.cb);
  }

  draw(ctx: CanvasRenderingContext2D, offset : Point) {
    ctx.drawImage(this.image, this.x + offset.x, this.y + offset.y);
  }

  enable(ctx: CanvasRenderingContext2D) {
    ctx.canvas.addEventListener('mouseup', this.cb);
  }

  disable(ctx: CanvasRenderingContext2D) {
    ctx.canvas.removeEventListener('mouseup',  this.cb);
  }
}

const defaultButton = loadImage('assets/pictures/button.png');
const sorryButton = loadImage('assets/pictures/sorrybutton.png');
const regretButton = loadImage('assets/pictures/regretButton.png');

type PopoverType = 'REGRET'|'EMPTY'|'PAUSE'|'VICTORY'|'GEN1'|'INST1';

export class Popover {
  buttons : Array<PopoverButton>;
  offset : Point;
  
  constructor(readonly imageName: PopoverType, readonly position: 'CENTER' | 'BOTTOM' ) {
    this.visible = false;
    this.buttons = [];
    this.offset = {x:0, y:0}
  }

  visible: boolean = false;

  show(ctx: CanvasRenderingContext2D) {
    this.visible = true;
    this.buttons.forEach(b => {
      b.enable(ctx);
    })
  }

  hide(ctx: CanvasRenderingContext2D) {
    this.visible = false;
    this.buttons.forEach(b => {
      b.disable(ctx);
    })
  }

  draw(ctx: CanvasRenderingContext2D){
    if(this.visible) {
      const image = images[this.imageName];
      switch(this.position) {
        case 'CENTER':
          this.offset = {x: (ctx.canvas.width / 2) - (image.width / 2), y:(ctx.canvas.height / 2) - (image.height / 2) }
          break;
        case 'BOTTOM':
          this.offset = {x: (ctx.canvas.width / 2) - (image.width / 2), y: ctx.canvas.height - image.height}
          break;
      }
      ctx.drawImage(image, this.offset.x, this.offset.y);
      this.buttons.forEach(b => {
        b.draw(ctx, this.offset);
      });
    }
  }

  getOffset() {
    return this.offset;
  }
}

const images: {[key in PopoverType]: HTMLImageElement} = {
  'REGRET': loadImage('assets/pictures/popovers/regret.png'),
  'EMPTY': loadImage('assets/pictures/empty1.png'),
  'PAUSE' : loadImage('assets/pictures/regret.png'),
  'VICTORY' : loadImage('assets/pictures/popovers/victory.png'),
  'GEN1' : loadImage('assets/pictures/popovers/1_minergrade_canals.png'),
  'INST1' : loadImage('assets/pictures/popovers/popover_gen1.png'),
}

export const RegretPopover = (ctx : CanvasRenderingContext2D) => {
  const p = new Popover('REGRET', 'BOTTOM');
  p.buttons.push(new PopoverButton(
    p, 130, 219, defaultButton, ctx, () => {}
  ));
  p.buttons.push(new PopoverButton(
    p, 360, 219, sorryButton, ctx, () => {}
  ));
  return p;
}

export const EmptyPopover = () => {
  return new Popover('EMPTY', 'CENTER');
}

export const PausePopover = (ctx : CanvasRenderingContext2D) => {
  const p = new Popover('PAUSE', 'CENTER');
  p.buttons.push(new PopoverButton(
    p, 3, 111, regretButton, ctx, () => {}
  ));
  return p;
}

export const GameWinPopover = (game: Game, ctx : CanvasRenderingContext2D) => {
  const p = new Popover('VICTORY', 'BOTTOM');
  function cb() {
    game.showPopover(RegretPopover(ctx));
  }
  p.buttons.push(new PopoverButton(
    p, 30, 160, regretButton, ctx, cb
  ));
  return p;
}

export const Gen1Popover = (game: Game, ctx: CanvasRenderingContext2D) => {
  const p = new Popover('GEN1', 'BOTTOM');
  function cb() {
    game.showPopover(Inst1Popover(ctx));
  }
  p.buttons.push(new PopoverButton(
    p, 30, 160, regretButton, ctx, cb
  ));
  return p;
}

export const Inst1Popover = (ctx: CanvasRenderingContext2D) => {
  const p = new Popover('INST1', 'BOTTOM');
  p.buttons.push(new PopoverButton(
    p, 30, 160, regretButton, ctx, () => {}
  ));
  return p;
}

