import { loadImage } from "./loader.js";
import {isPointInBox, Point} from './math.js';

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
      if(isPointInBox(ev.offsetX, ev.offsetY, x + popover.getOffset().x, y + popover.getOffset().y, width, height)) {
        this.callback(ev);
        popover.hide()
      }
    }
    console.log(new Date())
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

type PopoverType = 'REGRET'|'EMPTY'|'PAUSE';

export class Popover {
  buttons : Array<PopoverButton>;
  offset : Point;
  constructor(readonly imageName: PopoverType, readonly ctx : CanvasRenderingContext2D ) {
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
      this.offset = {x: (this.ctx.canvas.width) / 2 - (image.width / 2), y:(this.ctx.canvas.height) / 2 - (image.height / 2) }
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
  'PAUSE' : loadImage('assets/pictures/popovers/pause.png'),
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

export const EmptyPopover = (ctx : CanvasRenderingContext2D) => {
  return new Popover('EMPTY', ctx);
}

export const PausePopover = (ctx : CanvasRenderingContext2D) => {
  const p = new Popover('PAUSE', ctx);
  p.buttons.push(new PopoverButton(
    p, 221, 155, 159, 35, sorryButton, ctx, () => {}
  ));
  return p;
}

