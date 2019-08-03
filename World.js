import { h, Fragment } from "preact";

import Camera from "./Camera.js";
import SVG from "./SVG.js";

import { useDatabase } from "./firebase.js";
import { getRegion, regionRadius, getTile } from "./generation.js";
import { hexesInRadius, pointyToPixel } from "./hexes.js";
import sprite from "./sprite.js";
import polygon from "./polygon.js";
import hexRegion from "./hexRegion.js";

const { random, max, sqrt } = Math;
export const margin = 0.2;
export const unit = 10;

const World = ({ uid, regionX, regionY }) => {
  let visibleRegions = hexesInRadius([regionX, regionY], 1);
  const regionData = useDatabase(visibleRegions.map(([x, y]) => `regions/${x}/${y}`));

  let regions = [];
  for (const key in regionData) {
    const fragments = key.split("/");
    const x = +fragments[1];
    const y = +fragments[2];
    regions.push({ ...getRegion([x, y]), ...regionData[key] });
  }

  const players = { [uid]: true };
  for (const region of regions) {
    if (region.players) {
      for (const playerId in region.players) {
        players[playerId] = true;
      }
    }
  }

  return (
    <Camera x={0} y={0} style={{ "--margin": margin, "--unit": unit, "--regionRadius": regionRadius }}>
      {regions.map(region => {
        return <Region {...region} />;
      })}

      {Object.keys(players).map(playerId => {
        return <Player id={playerId} />;
      })}
    </Camera>
  );
};

const Region = ({ coordinates, center, color, features, id, type }) => {
  const tiles = hexesInRadius(center, regionRadius).map(coordinates => getTile(coordinates));
  const { width, height, path: outlinePath } = hexRegion(regionRadius);

  return (
    <Fragment>
      <SVG style={sprite(center[0], center[1])} className="region" width={width} height={height}>
        <path d={outlinePath} fill="grey" stroke="white" stroke-width={1 / max(width, height)} />

        {/* {tiles.map(({ coordinates }) => {
          const [px, py] = pointyToPixel([coordinates[0] - center[0], coordinates[1] - center[1]]);
          return <path d={polygon()} transform={`translate(${px}, ${py})`} fill="grey" />;
        })} */}
      </SVG>
    </Fragment>
  );
};

const Player = ({ id }) => {
  const data = useDatabase(`players/${id}/public`);

  if (!data) {
    return null;
  }

  const { x, y, angle } = data;
  return hexesInRadius([x, y], regionRadius).map(([x, y]) => (
    <SVG style={sprite(x, y)}>
      <path d={polygon(128)} fill="none" stroke="white" />
    </SVG>
  ));
};

export default World;
