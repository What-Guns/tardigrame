export function direction(from, to) {
    return Math.atan2(to.y - from.y, to.x - from.x);
}
export function distanceSquared(from, to = ZERO) {
    return Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2);
}
export function addPoints(out, a, b) {
    out.x = a.x + b.x;
    out.y = a.y + b.y;
}
export function assignPoint(out, p) {
    out.x = p.x;
    out.y = p.y;
}
export function isPointInBox(pointX, pointY, boxX, boxY, boxWidth, boxHeight) {
    return pointX > boxX && pointX < (boxX + boxWidth) && pointY > boxY && pointY < (boxY + boxHeight);
}
export function findNearestVeryExpensive(items, near, howMany) {
    return Array.from(items)
        .map(item => ({ item, dist2: distanceSquared(near, item.point) }))
        .sort((a, b) => a.dist2 - b.dist2)
        .slice(0, howMany)
        .map(item => item.item);
}
export const ZERO = { x: 0, y: 0, };
