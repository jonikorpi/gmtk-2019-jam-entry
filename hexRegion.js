import memoize from "fast-memoize";

import { hexWalls, pointyToPixel, hexesInRing } from "./hexes";
import { lerp, rotateAround } from "./maths";

const hexRegion = (radius = 1) => {
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;

  const lines = hexWalls(radius).map(([fromCoordinates, toCoordinates]) => {
    const from = pointyToPixel(fromCoordinates);
    const to = pointyToPixel(toCoordinates);

    const midpoint = [lerp(from[0], to[0], 0.5), lerp(from[1], to[1], 0.5)];
    const start = rotateAround(from, 90, midpoint);
    const end = rotateAround(to, 90, midpoint);

    start[0] = lerp(start[0], midpoint[0], Math.sqrt(3) / 4);
    start[1] = lerp(start[1], midpoint[1], Math.sqrt(3) / 4);
    end[0] = lerp(end[0], midpoint[0], Math.sqrt(3) / 4);
    end[1] = lerp(end[1], midpoint[1], Math.sqrt(3) / 4);

    x1 = Math.min(start[0], end[0], x1);
    x2 = Math.max(start[0], end[0], x2);
    y1 = Math.min(start[1], end[1], y1);
    y2 = Math.max(start[1], end[1], y2);

    return `${start}L${end}`;
  });

  return { path: "M" + lines.join("L") + "Z", width: x2 - x1, height: y2 - y1 };
};

export default memoize(hexRegion);
