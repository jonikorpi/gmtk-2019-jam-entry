import { pointyToPixel } from "./hexes";
import { unit } from "./World.js";

const sprite = (x = 0, y = 0, z = 0, angle = 0) => {
  const [px, py] = pointyToPixel([x, y]);
  return {
    transform: `translate(-50%, -50%) translate3d(${px * unit}vh, ${py * unit}vh, ${-z * 0.75}vh) rotate(${angle}deg)`,
  };
};

export default sprite;
