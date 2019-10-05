export interface Point {
  x: number;
  y: number;
}

export function isPointInBox(pointX: number, pointY: number, boxX: number, boxY: number, boxWidth: number, boxHeight: number) {
  return pointX > boxX && pointX < (boxX + boxWidth) && pointY > boxY && pointY < (boxY + boxHeight);
}
