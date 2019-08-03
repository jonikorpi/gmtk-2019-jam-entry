import { h, Fragment } from "preact";
import { useMemo } from "preact/hooks";
import { pointyToPixel } from "./hexes";

const { max, min, round, floor, ceil, random } = Math;

const Sprite = ({ x = 0, y = 0, z = 0, angle = 0, style = {} }) => {
  const color = useMemo(() => `hsl(${random() * 360}, 61.8%, 61.8%)`, []);
  const [px, py] = pointyToPixel([x, y]);

  return (
    <div
      class="sprite mover"
      style={{
        backgroundColor: color,
        transform: `translate(-50%, -50%) translate3d(${px * 10}vh, ${py * 10}vh, ${-z * 0.75}vh) rotate(${angle}deg)`,
        // ...style,
      }}
    />
  );
};

export default Sprite;
