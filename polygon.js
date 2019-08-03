import memoize from "fast-memoize";

const polygon = (radius = 1, corners = 6) => {
  const shape = [...Array(corners)].map((value, index) => {
    const angleDeg = (360 / corners) * index - 360 / corners / 2;
    const angleRad = (Math.PI / 180) * angleDeg;
    return [radius * Math.cos(angleRad), radius * Math.sin(angleRad)];
  });

  return "M" + shape.map(coordinates => coordinates.join()).join("L") + "Z";
};

export default memoize(polygon);
