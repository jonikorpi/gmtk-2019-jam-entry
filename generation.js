import {
  pointyDistance,
  flatDistance,
  pointyToPixel,
  hexesInRadius,
  hexToStaggeredRegion,
  flatAngles,
  distanceBetween,
  pointyHexesInRectangle,
  axialToPointyTile,
  pointyTileToAxial,
  regionToStaggeredCenter,
  neighborHexes,
  pointyAngles,
} from "./hexes.js";
import { createRNG } from "./maths.js";

export const regionRadius = 3;
export const worldRadius = 10;
export const heightLevels = 4;

const defaultTile = {
  color: "red",
  sprites: [],
  walkable: true,
  sailable: false,
  waterlineVisible: false,
  groundVisible: true,
};

const tileTypes = {
  water: {
    ...defaultTile,
    color: "royalblue",
    sprites: [],
    walkable: false,
    sailable: true,
    waterlineVisible: true,
    groundVisible: false,
  },
  plains: {
    ...defaultTile,
    color: "darkseagreen",
    sprites: ["Grass"],
  },
};
const tileOverrides = {
  "0,0": { type: "plains" },
};

const defaultFeature = { tiles: [], height: 0 };
const featureTypes = {
  water: {
    ...defaultFeature,
    tiles: ["water"],
  },
  plains: {
    ...defaultFeature,
    tiles: ["plains"],
  },
};

const defaultRegion = { color: "black" };
const regionTypes = {
  plains: { ...defaultRegion, color: "darkseagreen", features: ["plains"] },
  ocean: {
    ...defaultRegion,
    color: "royalblue",
    features: ["water"],
  },
};
const regionTypeList = Object.keys(regionTypes);

const regionOverrides = {
  "0,0": { type: "plains" },
};

const generateTile = coordinates => {
  const id = coordinates.join();
  const random = createRNG("tile" + id);

  const homeRegionCoordinates = hexToStaggeredRegion(coordinates, regionRadius);
  const homeRegion = getRegion(homeRegionCoordinates);

  const features = hexesInRadius(homeRegionCoordinates, 1)
    .map(getRegion)
    .flatMap(region => region.features);

  const featureBag = [
    ...homeRegion.features,
    ...features.flatMap(feature =>
      Array(Math.max(0, Math.round(regionRadius * 1 - distanceBetween(coordinates, feature.coordinates)))).fill(feature)
    ),
  ];

  const mainFeature = random.pick(featureBag);
  const feature = featureTypes[mainFeature.type];

  const type = tileOverrides[id] ? tileOverrides[id].type : random.pick(feature.tiles);
  const tileType = tileTypes[type];

  const height =
    type === "water"
      ? 0
      : Math.round(featureBag.reduce((height, feature) => height + feature.height, 0) / featureBag.length);

  return {
    coordinates,
    id: id,
    angle: random.pick(flatAngles),
    xScale: random() < 0.5 ? 1 : -1,
    yScale: random() < 0.5 ? 1 : -1,
    region: homeRegion,
    type,
    height,
    ...tileType,
    ...tileOverrides[id],
  };
};

export const tileCache = new Map();
export const getTile = coordinates => {
  const id = coordinates.join();
  const cached = tileCache.get(id);

  if (cached) {
    return cached;
  } else {
    const generated = generateTile(coordinates);
    tileCache.set(id, generated);
    return generated;
  }
};

const generateRegion = coordinates => {
  const id = coordinates.join();
  const random = createRNG("region" + id);

  const center = regionToStaggeredCenter(coordinates, regionRadius);
  const type = regionOverrides[id]
    ? regionOverrides[id].type
    : distanceBetween([0, 0], coordinates) > worldRadius - 1
    ? "ocean"
    : random.pick(regionTypeList);
  const regionType = regionTypes[type];

  const possibleCoordinates = hexesInRadius(center, regionRadius);

  const features = [...Array(Math.round(1 + random() * regionRadius))].map(() => {
    const index = Math.round(random() * (possibleCoordinates.length - 1));
    const coordinates = possibleCoordinates[index];
    possibleCoordinates.splice(index, index);
    const id = coordinates.join();
    const type = random.pick(regionType.features);
    const height = Math.round(random() * (heightLevels - 1));

    return {
      id,
      coordinates,
      type,
      height,
    };
  });

  return {
    id,
    coordinates,
    center,
    type,
    ...regionTypes[type],
    ...regionOverrides[id],
    features,
  };
};

export const regionCache = new Map();
export const getRegion = coordinates => {
  const id = coordinates.join();
  const cached = regionCache.get(id);

  if (cached) {
    return cached;
  } else {
    const generated = generateRegion(coordinates);
    regionCache.set(id, generated);
    return generated;
  }
};
