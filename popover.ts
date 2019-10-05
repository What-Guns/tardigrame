import { loadImage } from "./loader.js";
import {isPointInBox} from './math.js';

export class PopoverButton {
  readonly cb: (ev: MouseEvent) => void;
  constructor(
    readonly popover: Popover,
    readonly x: number,
    readonly y: number,
    readonly width: number,
    readonly height: number,
    readonly image: HTMLImageElement,
    readonly ctx : CanvasRenderingContext2D,
    readonly callback: (ev: MouseEvent) => void
  ) {
    this.cb = (ev: MouseEvent) => {
      if(isPointInBox(ev.offsetX, ev.offsetY, x, y, width, height)) {
        this.callback(ev);
        popover.hide()
      }
    }
    ctx.canvas.addEventListener('mouseup', this.cb);
  }

  draw() {
    this.ctx.drawImage(this.image, this.x, this.y);
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

type PopoverType = 'REGRET';

export class Popover {
  buttons : Array<PopoverButton>;
  constructor(readonly imageName: PopoverType, readonly ctx : CanvasRenderingContext2D ) {
    this.visible = false;
    this.buttons = [];
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
      this.ctx.drawImage(images[this.imageName], 0, 0);
      this.buttons.forEach(b => {
        b.draw();
      });
    }
  }
}

const images: {[key in PopoverType]: HTMLImageElement} = {
  'REGRET': loadImage('assets/pictures/popovers/regret.png'),
}

export const RegretPopover = (ctx : CanvasRenderingContext2D) => {
  const p = new Popover('REGRET', ctx);
  p.buttons.push(new PopoverButton(
    p, 130, 219, 159, 35, defaultButton, ctx, () => {}
  ));
  p.buttons.push(new PopoverButton(
    p, 360, 219, 159, 35, sorryButton, ctx, () => {}
  ));
  return p;
}

