import { h, render, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";

import { auth, useDatabase } from "./firebase.js";

const App = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    auth.signInAnonymously().catch(function(error) {
      setError(error);
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
  const test = useDatabase("test");

  return (
    <Fragment>
      <p>{user.uid}</p>
      <p>{test}</p>
    </Fragment>
  );
};
