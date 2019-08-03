import { h, render, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";

import { auth, useDatabase, update } from "./firebase.js";
import World from "./World.js";

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
        console.log("Signed in as", user);
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
  const world = useDatabase("world");
  const playerPublic = useDatabase(`players/${uid}/public`);
  const playerPrivate = useDatabase(`players/${uid}/private`);

  useEffect(() => {
    if (playerPublic === null) {
      const regionX = 0;
      const regionY = 0;
      const regionId = regionX + "," + regionY;
      const x = 0;
      const y = 0;
      update({
        [`players/${uid}/public`]: {
          regionId,
          regionX,
          regionY,
          x,
          y,
        },
        // [`players/${uid}/private`]: {},
        [`regions/${regionId}/players/${uid}`]: true,
      });
    }
  }, [playerPublic, playerPrivate]);

  // const region = useDatabase(`regions/test`);

  return (
    <Fragment>
      <p>{user.uid}</p>
      <pre>{JSON.stringify({ world, playerPublic, playerPrivate }, null, 2)}</pre>

      <World />
    </Fragment>
  );
};
