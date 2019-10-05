export interface Point {
  x: number;
  y: number;
}

export interface Rect extends Point {
  width: number;
  height: number;
}

export function direction(from: Point, to: Point) {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

export function distanceSquared(from: Point, to: Point) {
  return Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2);
}

export function addPoints(out: Point, a: Point, b: Point) {
  out.x = a.x + b.x;
  out.y = a.y + b.y;
}

export function isPointInBox(pointX: number, pointY: number, boxX: number, boxY: number, boxWidth: number, boxHeight: number) {
  return pointX > boxX && pointX < (boxX + boxWidth) && pointY > boxY && pointY < (boxY + boxHeight);
}
