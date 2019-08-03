import { h } from "preact";

import Sprite from "./Sprite.js";
import Camera from "./Camera.js";
import { useDatabase } from "./firebase.js";
import { getRegion } from "./generation.js";
import { hexesInRadius } from "./hexes.js";
const { random } = Math;

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
    <Camera x={0} y={0}>
      {regions.map(region => {
        const { center } = region;
        return <Sprite x={center[0]} y={center[1]} />;
      })}

      {Object.keys(players).map(playerId => {
        return <Sprite x={0} y={0} angle={random() * 360} />;
      })}
    </Camera>
  );
};

export default World;
