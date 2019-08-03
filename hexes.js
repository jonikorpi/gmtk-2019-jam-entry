import { normalize, createRNG, mapBy, rotateArray } from "./maths";

const origo = [0, 0];

export const flatSize = Math.sqrt(3);
export const pointySize = 2;
export const flatDistance = flatSize;
export const pointyDistance = 1.5;

// Commonly used coordinate systems: cube and axial
export const cubeToAxial = cube => {
  let q = cube[0];
  let r = cube[2];
  return [q, r];
};
export const axialToCube = hex => {
  let x = hex[0];
  let z = hex[1];
  let y = -x - z;
  return [x, y, z];
};

// tile = odd-r/odd-q offset coordinate system
export const axialToPointyTile = ([q, r]) => {
  const x = q + (r - (r & 1)) / 2;
  const y = r;
  return [x, y];
};
export const pointyTileToAxial = ([tileX, tileY]) => {
  const x = tileX - (tileY - (tileY & 1)) / 2;
  const z = tileY;
  return [x, z];
};
export const axialToFlatTile = ([q, r]) => {
  const x = q;
  const y = r + (q - (q & 1)) / 2;
  return [x, y];
};
export const flatTileToAxial = ([tileX, tileY]) => {
  const x = tileX;
  const z = tileY - (tileX - (tileX & 1)) / 2;
  return [x, z];
};

// Pixel conversions (multiply results with hex size)
export const pointyToPixel = ([q, r]) => {
  let x = flatSize * q + (flatSize / 2) * r;
  let y = pointyDistance * r;
  return [x, y];
};
export const pixelToPointy = (x, y, size = 1) => {
  let q = ((flatSize / 3) * x - (1 / 3) * -y) / size;
  let r = ((2 / 3) * -y) / size;
  return cubeToAxial(roundCube(axialToCube([q, r])));
};
export const flatToPixel = ([q, r]) => {
  let x = (3 / 2) * q;
  let y = (Math.sqrt(3) / 2) * q + Math.sqrt(3) * r;
  return [x, y];
};
export const pixelToFlat = (x, y, size = 1) => {
  let q = ((2 / 3) * x) / size;
  let r = ((-1 / 3) * x + (Math.sqrt(3) / 3) * y) / size;
  return cubeToAxial(roundCube(axialToCube([q, r])));
};

export const pointyAngles = [330, 30, 90, 150, 210, 270];

export const pointyDirections = {
  NW: [0, -1],
  NE: [1, -1],
  E: [1, 0],
  SE: [0, 1],
  SW: [-1, 1],
  W: [-1, 0],
};
export const pointyDirectionNames = {
  "0,-1": "NW",
  "1,-1": "NE",
  "1,0": "E",
  "0,1": "SE",
  "-1,1": "SW",
  "-1,0": "W",
};

export const flatAngles = [0, 60, 120, 180, 240, 300];
export const flatDirections = {
  N: [0, -1],
  NE: [1, -1],
  SE: [1, 0],
  S: [0, 1],
  SW: [-1, 1],
  NW: [-1, 0],
};
export const flatDirectionNames = {
  "0,-1": "N",
  "1,-1": "NE",
  "1,0": "SE",
  "0,1": "S",
  "-1,1": "SW",
  "-1,0": "NW",
};

const hexDirections = Object.values(pointyDirections);

export const neighborHexes = ([x, y]) =>
  hexDirections.map(([dx, dy]) => [x + dx, y + dy]);

export const neighborInDirection = ([x, y], direction) => [
  x + direction[0],
  y + direction[1],
];

export const roundCube = ([x, y, z]) => {
  let rx = Math.round(x);
  let ry = Math.round(y);
  let rz = Math.round(z);

  const x_diff = Math.abs(rx - x);
  const y_diff = Math.abs(ry - y);
  const z_diff = Math.abs(rz - z);

  if (x_diff > y_diff && x_diff > z_diff) {
    rx = -ry - rz;
  } else if (y_diff > z_diff) {
    ry = -rx - rz;
  } else {
    rz = -rx - ry;
  }

  return [rx, ry, rz];
};

export const roundHex = hex => cubeToAxial(roundCube(axialToCube(hex)));

export const distanceBetween = ([fromX, fromY], [toX, toY]) => {
  const x = toX - fromX;
  const y = toY - fromY;
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + x * y);
};

export const hexesInRadius = (from = origo, radius) => {
  const [fromX, fromY, fromZ] = axialToCube(from);
  let results = [];

  for (let x = -radius; x <= radius; x++) {
    for (
      let y = Math.max(-radius, -x - radius);
      y <= Math.min(radius, -x + radius);
      y++
    ) {
      let z = -x - y;
      results.push(cubeToAxial([x + fromX, y + fromY, z + fromZ]));
    }
  }
  return results;
};

export const flatHexesInRectangle = (
  from = origo,
  width = 2,
  height = width
) => {
  const rectangle = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const hex = flatTileToAxial([x, y]);
      hex[0] += from[0];
      hex[1] += from[1];
      rectangle.push(hex);
    }
  }

  return rectangle;
};

export const pointyHexesInRectangle = (
  from = origo,
  width = 2,
  height = width
) => {
  const rectangle = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const hex = pointyTileToAxial([x, y]);
      hex[0] += from[0];
      hex[1] += from[1];
      rectangle.push(hex);
    }
  }

  return rectangle;
};

export const directionBetween = (from, to) => {
  const normalized = normalize([to[0] - from[0], to[1] - from[1]]);

  if (Math.round(normalized[0]) === -1 && Math.round(normalized[1]) === -1) {
    if (normalized[0] === normalized[1]) {
      return [0, -1];
    }

    return normalized[0] < normalized[1]
      ? [Math.floor(normalized[0]), Math.ceil(normalized[1])]
      : [Math.ceil(normalized[0]), Math.floor(normalized[1])];
  }

  if (Math.round(normalized[0]) === 1 && Math.round(normalized[1]) === 1) {
    if (normalized[0] === normalized[1]) {
      return [0, 1];
    }

    return normalized[0] < normalized[1]
      ? [Math.floor(normalized[0]), Math.ceil(normalized[1])]
      : [Math.ceil(normalized[0]), Math.floor(normalized[1])];
  }

  return normalized.map(Math.round);
};

export const pointyAngleBetween = (from, to) => {
  const direction = directionBetween(from, to);
  const directionIndex = Object.keys(pointyDirectionNames).indexOf(
    direction.join()
  );
  return pointyAngles[directionIndex];
};

export const flatAngleBetween = (from, to) => {
  const direction = directionBetween(from, to);
  const directionIndex = Object.keys(flatDirectionNames).indexOf(
    direction.join()
  );
  return flatAngles[directionIndex];
};

export const rotate = (hex, times) => {
  const cube = axialToCube(hex);
  let [x, y, z] = cube;

  for (
    let time = 0;
    times < 0 ? time > times : time < times;
    time += Math.sign(times)
  ) {
    let x2, y2, z2;

    if (times > 0) {
      x2 = -z;
      y2 = -x;
      z2 = -y;
    } else {
      x2 = -y;
      y2 = -z;
      z2 = -x;
    }

    x = x2;
    y = y2;
    z = z2;
  }

  return cubeToAxial([x, y, z]);
};

export const closestSpacedRegion = (hex, regionSpacing) =>
  roundHex([hex[0] / regionSpacing, hex[1] / regionSpacing]);

export const hexIsBetweenSpacedRegions = (hex, regionSpacing) => {
  const from = closestSpacedRegion(hex, regionSpacing);
  const fromCenter = [from[0] * regionSpacing, from[1] * regionSpacing];

  const direction = directionBetween(fromCenter, hex);

  if (direction[0] === 0 && direction[1] === 0) {
    direction[1] = 1;
  }

  const to = [from[0] + direction[0], from[1] + direction[1]];

  return [from, to].sort(sortFlatCoordinates);
};

export const sortFlatCoordinates = (a, b) =>
  a[1] === b[1] ? (a[0] > b[0] ? -1 : 1) : a[1] > b[1] ? -1 : 1;
export const sortPointyCoordinates = (a, b) =>
  a[1] === b[1] ? (a[0] < b[0] ? -1 : 1) : a[1] > b[1] ? -1 : 1;

// from/to inverted as a hack to make the 0th location appear at the top
export const locationsOnPath = ([to, from], pathRadius) => {
  const distance = distanceBetween(from.center, to.center);
  const forwardDirection = directionBetween(from.center, to.center);

  const forwardIndex = Object.keys(pointyDirectionNames).indexOf(
    forwardDirection.join()
  );

  const leftIndex = forwardIndex === 0 ? 5 : forwardIndex - 1;
  const rightIndex = forwardIndex === 5 ? 0 : forwardIndex + 1;
  const leftDirection = Object.values(pointyDirections)[leftIndex];
  const rightDirection = Object.values(pointyDirections)[rightIndex];

  const locations = [];

  for (let forward = -pathRadius; forward <= distance + pathRadius; forward++) {
    const middle = [
      from.center[0] + forward * forwardDirection[0],
      from.center[1] + forward * forwardDirection[1],
    ];
    locations.push(middle);

    for (
      let left = 1;
      left <= pathRadius - Math.max(0, forward - distance);
      left++
    ) {
      locations.push([
        middle[0] + left * leftDirection[0],
        middle[1] + left * leftDirection[1],
      ]);
    }

    for (
      let right = 1;
      right <= pathRadius - Math.max(0, forward - distance);
      right++
    ) {
      locations.push([
        middle[0] + right * rightDirection[0],
        middle[1] + right * rightDirection[1],
      ]);
    }
  }

  return locations;
};

export const pathsAroundRegions = (regions, regionMap) => {
  return regions
    .flatMap(({ id, coordinates }) =>
      neighborHexes(coordinates).map(neighborCoordinates => {
        const neighbor =
          regionMap[`${neighborCoordinates[0]},${neighborCoordinates[1]}`];

        return neighbor
          ? [coordinates, neighborCoordinates]
              .sort(sortFlatCoordinates)
              .join(";")
          : null;
      })
    )
    .filter((path, index, list) => path && list.indexOf(path) === index)
    .map(path =>
      path.split(";").map(id => {
        const coordinates = id.split(",");
        coordinates[0] = +coordinates[0];
        coordinates[1] = +coordinates[1];
        return coordinates;
      })
    );
};

//   +O+O+
//  +O+O+O+
// +O+O+O+O+
//  +O+O+O+
//   +O+O+
export const createSpacedRegions = ({ regionSpacing = 2, ...otherArguments }) =>
  createRegions(
    ([x, y]) => [x * regionSpacing, y * regionSpacing],
    otherArguments
  );

export const regionToStaggeredCenter = ([x, y], r) => {
  const a = x * 2 * r + x + r * y;
  const b = y * -2 * r - y - x + -r * x;

  return [a, b];
};

// https://observablehq.com/@sanderevers/hexagon-tiling-of-an-hexagonal-grid
export const hexToStaggeredRegion = (axialCoordinates, regionRadius) => {
  const area = 3 * Math.pow(regionRadius, 2) + 3 * regionRadius + 1;
  const shift = 3 * regionRadius + 2;

  const [x, y, z] = axialToCube(axialCoordinates);

  const xh = Math.floor((y + shift * x) / area),
    yh = Math.floor((z + shift * y) / area),
    zh = Math.floor((x + shift * z) / area);
  const i = Math.floor((1 + xh - yh) / 3),
    // j = Math.floor((1 + yh - zh) / 3),
    k = Math.floor((1 + zh - xh) / 3);

  // [xh, yh, zh] may be useful for something

  // I don't know why this matches the results of regionToStaggeredCenter,
  // but it does
  return [i, -k - i];
};

export const createRegions = (
  centerGetter,
  {
    center = origo,
    worldRadius = 1,
    regionOverrides = {},
    regionTypes = {},
    seed = "vuoro",
  }
) => {
  const RNG = createRNG(seed);
  const regionTypeList = Object.keys(regionTypes).filter(
    key => key !== "default"
  );

  const regions = hexesInRadius(center, worldRadius).map(regionCoordinates => {
    const id = `${regionCoordinates[0]},${regionCoordinates[1]}`;
    const type =
      regionOverrides[id] && regionOverrides[id].type
        ? regionOverrides[id].type
        : regionTypeList.length > 0
        ? RNG.pick(regionTypeList)
        : null;

    const center = centerGetter(regionCoordinates);
    const centerId = `${center[0]},${center[1]}`;

    return {
      id,
      coordinates: regionCoordinates,
      centerId,
      center,
      type,
      ...regionTypes["default"],
      ...regionTypes[type],
      ...regionOverrides[id],
    };
  });

  return {
    regions,
    regionMap: regions.reduce(mapBy("id"), []),
  };
};

export const hexesInRing = (from = origo, radius = 1) => {
  const [fromX, fromY, fromZ] = axialToCube(from);
  const found = new Set();

  for (let x = -radius; x <= radius; x++) {
    for (
      let y = Math.max(-radius, -x - radius);
      y <= Math.min(radius, -x + radius);
      y++
    ) {
      let z = -x - y;

      if (
        Math.abs(x) === radius ||
        Math.abs(y) === radius ||
        Math.abs(z) === radius
      ) {
        found.add(cubeToAxial([x + fromX, y + fromY, z + fromZ]));
      }
    }
  }

  // Order the hexes by walking them
  const size = found.size;
  const walked = new Set();
  let walkingOn = found.values().next().value;
  walked.add(walkingOn);
  found.delete(walkingOn);

  const walkHex = hex => {
    if (distanceBetween(walkingOn, hex) === 1) {
      walkingOn = hex;
      walked.add(hex);
      found.delete(hex);
    }
  };

  while (walked.size < size) {
    found.forEach(walkHex);
  }

  return [...walked];
};

export const hexWalls = radius => {
  const results = [];

  hexesInRing(undefined, radius).forEach((hex, index, hexes) => {
    const neighbors = hexesInRing(hex, 1);
    const rotated = rotateArray(
      neighbors,
      Math.round(
        ((index + Math.round(hexes.length / 2)) / hexes.length) *
          neighbors.length
      )
    );
    // const neighbors = hexesInRing(hex, 1);
    rotated.forEach(neighbor => {
      if (distanceBetween(origo, neighbor) > radius) {
        results.push([hex, neighbor]);
      }
    });
  });

  return results;
};
