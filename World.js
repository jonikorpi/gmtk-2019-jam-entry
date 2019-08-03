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
const regionVisibility = 1;

const World = ({ uid, regionX, regionY }) => {
  let visibleRegions = hexesInRadius([regionX, regionY], regionVisibility);

  return (
    <Camera x={0} y={0} style={{ "--margin": margin, "--unit": unit, "--regionRadius": regionRadius }}>
      {visibleRegions.map(coordinates => {
        return <Region coordinates={coordinates} />;
      })}

      <Players visibleRegions={visibleRegions} uid={uid} />
    </Camera>
  );
};

const Players = ({ visibleRegions, uid }) => {
  const regionPlayers = useDatabase(visibleRegions.map(([x, y]) => `regions/${x}/${y}/players`));
  const players = { [uid]: true };
  for (const key in regionPlayers) {
    const playersList = regionPlayers[key];
    if (playersList) {
      for (const playerId in playersList) {
        players[playerId] = true;
      }
    }
  }

  return Object.keys(players).map(playerId => {
    return <Player id={playerId} />;
  });
};

const Region = ({ coordinates }) => {
  const worldRadius = useDatabase("world/radius") || 20;
  const data = useDatabase(`regions/${coordinates[0]}/${coordinates[1]}`) || {};

  const { center, color, features, id, type } = { ...getRegion(coordinates, worldRadius), ...data };
  const tiles = hexesInRadius(center, regionRadius).map(coordinates => getTile(coordinates));
  const { width, height, path: outlinePath } = hexRegion(regionRadius);

  return (
    <Fragment>
      <SVG style={sprite(center[0], center[1])} className="region" width={width} height={height}>
        <path d={outlinePath} fill={color} stroke="black" stroke-width={0.25 / max(width, height)} />

        {tiles.map(({ coordinates, type, color }) => {
          const [px, py] = pointyToPixel([coordinates[0] - center[0], coordinates[1] - center[1]]);
          return <path d={polygon(1)} transform={`translate(${px}, ${py})`} fill={color} />;
        })}
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
  return (
    <SVG style={sprite(x, y)} className="mover">
      <path d={polygon(64, 8)} fill="white" />
    </SVG>
  );
};

export default World;
