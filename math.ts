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

export function distanceSquared(from: Point, to: Point = ZERO) {
  return Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2);
}

export function addPoints(out: Point, a: Point, b: Point) {
  out.x = a.x + b.x;
  out.y = a.y + b.y;
}

export function assignPoint(out: Point, p: Point) {
  out.x = p.x;
  out.y = p.y;
}

export function isPointInBox(pointX: number, pointY: number, boxX: number, boxY: number, boxWidth: number, boxHeight: number) {
  return pointX > boxX && pointX < (boxX + boxWidth) && pointY > boxY && pointY < (boxY + boxHeight);
}

export function findNearestVeryExpensive<T extends {point: Point}>(items: T[], near: Point, howMany: number) {
  return Array.from(items)
    .map(item => ({item, dist2: distanceSquared(near, item.point)}))
    .sort((a, b) => a.dist2 - b.dist2)
    .slice(0, howMany)
    .map(item => item.item);
}

export const ZERO = { x: 0, y: 0, };
