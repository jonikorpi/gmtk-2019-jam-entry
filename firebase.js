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
  const [data, setData] = useState(null);

  useEffect(() => {
    const ref = database.ref(path);
    const listener = ref.on("value", function(snapshot) {
      setData(snapshot.val());
    });

    return () => {
      ref.off(listener);
    };
  }, [path]);

  return data;
};

export { database, auth, useDatabase };
