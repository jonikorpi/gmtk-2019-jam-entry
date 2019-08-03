import { h, render, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";

import { auth, useDatabase, update } from "./firebase.js";
import World from "./World.js";
import { hexesInRadius } from "./hexes.js";

const App = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    auth.signInAnonymously().catch(function(error) {
      setError(error);
      console.error(error);
    });

    auth.onAuthStateChanged(user => {
      if (user) {
        setUser(user);
        console.log("Signed in as", user.uid, user);
      } else {
        setUser(null);
        console.log("Signed out");
      }
    });
  }, []);

  if (error) {
    return (
      <Fragment>
        <h1>Authentication error</h1> <pre>{JSON.stringify(error.message, null, 2)}</pre>
      </Fragment>
    );
  }

  return user ? <Game user={user} /> : "Connecting…";
};
render(<App />, document.body);

const Game = ({ user }) => {
  const { uid } = user;
  const regionX = useDatabase(`players/${uid}/public/regionX`);
  const regionY = useDatabase(`players/${uid}/public/regionY`);

  const hasConnected = regionX !== undefined && regionY !== undefined;
  const hasSpawned = typeof regionX === "number" && typeof regionY === "number";

  useEffect(() => {
    if (hasConnected && !hasSpawned) {
      const regionX = 0;
      const regionY = 0;
      const x = 0;
      const y = 0;
      const visibleRegions = hexesInRadius([regionX, regionY], 1);
      const canSee = {};

      for (const [x, y] of visibleRegions) {
        canSee[x] = canSee[x] || {};
        canSee[x][y] = true;
      }

      update({
        [`players/${uid}/public`]: {
          regionX,
          regionY,
          x,
          y,
          canSee,
        },
        [`players/${uid}/private`]: null,
        [`regions/${regionX}/${regionY}/players/${uid}`]: true,
      });
    }
  }, [regionX, regionY]);

  return hasConnected && hasSpawned ? <World uid={uid} regionX={regionX} regionY={regionY} /> : null;
};
