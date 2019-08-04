import { h, Fragment } from "preact";
import { useCallback } from "preact/hooks";

import Camera from "./Camera.js";
import SVG from "./SVG.js";

import { useDatabase, update } from "./firebase.js";
import { getRegion, regionRadius, getTile } from "./generation.js";
import { hexesInRadius, pointyToPixel } from "./hexes.js";
import sprite from "./sprite.js";
import polygon from "./polygon.js";
import hexRegion from "./hexRegion.js";

const { random, max, sqrt } = Math;
export const margin = 0.2;
export const unit = 10;
const regionVisibility = 2;

const World = ({ uid, regionX, regionY }) => {
  let visibleRegions = hexesInRadius([regionX, regionY], regionVisibility);

  return (
    <Camera uid={uid} style={{ "--margin": margin, "--unit": unit, "--regionRadius": regionRadius }}>
      {visibleRegions.map(coordinates => {
        return <Region key={coordinates.join()} coordinates={coordinates} />;
      })}
      <Players visibleRegions={visibleRegions} uid={uid} />
      <MovementUI uid={uid} regionX={regionX} regionY={regionY} />
    </Camera>
  );
};

const Players = ({ visibleRegions, uid }) => {
  const players = { [uid]: true };
  for (const [x, y] of visibleRegions) {
    for (const playerId in useDatabase(`regions/${x}/${y}/players`) || {}) {
      players[playerId] = true;
    }
  }

  return Object.keys(players).map(playerId => {
    return <Player key={playerId} id={playerId} />;
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
          return <path key={coordinates.join()} d={polygon(1)} transform={`translate(${px}, ${py})`} fill={color} />;
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

const MovementUI = ({ uid, regionX, regionY }) => {
  const data = useDatabase(`players/${uid}/public`);

  if (!data) {
    return null;
  }

  const { x, y, angle } = data;
  const targets = hexesInRadius([x, y], 1).map(coordinates => getTile(coordinates));

  const moveTo = (coordinates, [newRegionX, newRegionY]) => {
    const visibleRegions = hexesInRadius([newRegionX, newRegionY], 1);
    const canSee = {};

    for (const [x, y] of visibleRegions) {
      canSee[x] = canSee[x] || {};
      canSee[x][y] = true;
    }

    const updates = {
      [`players/${uid}/public/x`]: coordinates[0],
      [`players/${uid}/public/y`]: coordinates[1],
      [`players/${uid}/public/regionX`]: newRegionX,
      [`players/${uid}/public/regionY`]: newRegionY,
    };

    if (newRegionX !== regionX || newRegionY !== regionY) {
      updates[`players/${uid}/public/canSee`] = canSee;
      updates[`regions/${regionX}/${regionY}/players/${uid}`] = null;
      updates[`regions/${newRegionX}/${newRegionY}/players/${uid}`] = true;
    }

    update(updates);
  };

  return targets.map(({ coordinates, region, walkable }, index) => (
    <SVG key={index} style={sprite(coordinates[0], coordinates[1])} className="mover no-transition">
      <path
        d={polygon(128)}
        fill="none"
        stroke="currentcolor"
        className={`${walkable ? "events" : "no-events"} button`}
        style={{ opacity: walkable ? 1 : 0 }}
        onClick={() => moveTo(coordinates, region.coordinates)}
      />
    </SVG>
  ));
};

export default World;
