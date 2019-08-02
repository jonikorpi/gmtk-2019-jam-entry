import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";

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
let user = null;

firebase
  .auth()
  .signInAnonymously()
  .catch(function(error) {
    throw error;
  });

const auth = firebase.auth();

export { database, auth };
