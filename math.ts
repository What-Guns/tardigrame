export interface Point {
  x: number;
  y: number;
}

export function direction(from: Point, to: Point) {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

export function distanceSquared(from: Point, to: Point) {
  return Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2);
}

export function isPointInBox(pointX: number, pointY: number, boxX: number, boxY: number, boxWidth: number, boxHeight: number) {
  return pointX > boxX && pointX < (boxX + boxWidth) && pointY > boxY && pointY < (boxY + boxHeight);
}
