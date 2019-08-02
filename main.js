import { h, render } from "preact";

import { database, auth } from "./firebase.js";

let user = null;
auth.onAuthStateChanged(authenticated => {
  if (authenticated) {
    user = authenticated;
    console.log("Signed in as", user);
  } else {
    user = null;
    console.log("Signed out");
  }
});

render(<p>Hello itch</p>, document.body);
