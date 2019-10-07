import { loadImage } from "./loader.js";
import {isPointInBox, Point} from './math.js';

export class PopoverButton {
  readonly cb: (ev: MouseEvent) => void;
  constructor(
    readonly popover: Popover,
    readonly x: number,
    readonly y: number,
    readonly image: HTMLImageElement,
    readonly ctx : CanvasRenderingContext2D,
    readonly callback: (ev: MouseEvent) => void
  ) {
    this.cb = (ev: MouseEvent) => {
      if(isPointInBox(ev.offsetX, ev.offsetY, x + popover.getOffset().x, y + popover.getOffset().y, image.width, image.height)) {
        this.callback(ev);
        popover.hide()
      }
    }
    ctx.canvas.addEventListener('mouseup', this.cb);
  }

  draw(offset : Point) {
    this.ctx.drawImage(this.image, this.x + offset.x, this.y + offset.y);
  }

  enable() {
    this.ctx.canvas.addEventListener('mouseup', this.cb);
  }

  disable() {
    this.ctx.canvas.removeEventListener('mouseup',  this.cb);
  }
}

const defaultButton = loadImage('assets/pictures/button.png');
const sorryButton = loadImage('assets/pictures/sorrybutton.png');
const regretButton = loadImage('assets/pictures/regretButton.png');

type PopoverType = 'REGRET'|'EMPTY'|'PAUSE'|'VICTORY';

export class Popover {
  buttons : Array<PopoverButton>;
  offset : Point;
  
  constructor(readonly imageName: PopoverType, readonly ctx : CanvasRenderingContext2D, readonly position: 'CENTER' | 'BOTTOM' ) {
    this.visible = false;
    this.buttons = [];
    this.offset = {x:0, y:0}
  }

  visible: boolean = false;

  show() {
    this.visible = true;
    this.buttons.forEach(b => {
      b.enable();
    })
  }

  hide() {
    this.visible = false;
    this.buttons.forEach(b => {
      b.disable();
    })
  }

  draw(){
    if(this.visible) {
      const image = images[this.imageName];
      switch(this.position) {
        case 'CENTER':
          this.offset = {x: (this.ctx.canvas.width / 2) - (image.width / 2), y:(this.ctx.canvas.height / 2) - (image.height / 2) }
          break;
        case 'BOTTOM':
          this.offset = {x: (this.ctx.canvas.width / 2) - (image.width / 2), y: this.ctx.canvas.height - image.height}
          break;
      }
      this.ctx.drawImage(image, this.offset.x, this.offset.y);
      this.buttons.forEach(b => {
        b.draw(this.offset);
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
}

export const RegretPopover = (ctx : CanvasRenderingContext2D) => {
  const p = new Popover('REGRET', ctx, 'CENTER');
  p.buttons.push(new PopoverButton(
    p, 130, 219, defaultButton, ctx, () => {}
  ));
  p.buttons.push(new PopoverButton(
    p, 360, 219, sorryButton, ctx, () => {}
  ));
  return p;
}

export const EmptyPopover = (ctx : CanvasRenderingContext2D) => {
  return new Popover('EMPTY', ctx, 'CENTER');
}

export const PausePopover = (ctx : CanvasRenderingContext2D) => {
  const p = new Popover('PAUSE', ctx, 'CENTER');
  p.buttons.push(new PopoverButton(
    p, 3, 111, regretButton, ctx, () => {}
  ));
  return p;
}

export const GameWinPopover = (ctx: CanvasRenderingContext2D) => {
  const p = new Popover('VICTORY', ctx, 'BOTTOM');
  p.buttons.push(new PopoverButton(
    p, 30, 160, regretButton, ctx, () => {}
  ));
  return p;
}

