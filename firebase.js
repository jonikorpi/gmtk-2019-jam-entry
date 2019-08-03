import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import { useState, useEffect } from "preact/hooks";

firebase.initializeApp({
  apiKey: "AIzaSyBAnI-vYV1r6OXlQLpgctIoYHtMfLQdq68",
  authDomain: "gmtk-2019-jam-entry.firebaseapp.com",
  databaseURL: "https://gmtk-2019-jam-entry.firebaseio.com",
  projectId: "gmtk-2019-jam-entry",
  storageBucket: "",
  messagingSenderId: "467818711006",
  appId: "1:467818711006:web:2fde8a2b01e3e732",
});

const database = firebase.database();
const auth = firebase.auth();

const useDatabase = path => {
  const [data, setData] = useState(undefined);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const ref = database.ref(path);
    let retry;
    const listener = ref.on(
      "value",
      function(snapshot) {
        setData(snapshot.val());
      },
      error => {
        console.error(error);
        if (attempt < 5) {
          retry = window.setTimeout(() => {
            setAttempt(attempt + 1);
          }, 2000);
        }
      }
    );

    return () => {
      ref.off("value", listener);
      if (retry) {
        window.clearTimeout(retry);
      }
    };
  }, [path, attempt]);

  return data;
};

const update = (updates = {}) => {
  console.log("Updating", updates);
  return database.ref().update(updates, error => {
    if (error) {
      console.error(error);
    }
  });
};

const transaction = (path = "", updater) => {
  database.ref(path).transaction(updater);
};

export { database, auth, useDatabase, update, transaction };
