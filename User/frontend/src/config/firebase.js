import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCg2wcCITTESRsl38kXJsscGes62cs5kJU",
  authDomain: "apna-decoration.firebaseapp.com",
  projectId: "apna-decoration",
  storageBucket: "apna-decoration.firebasestorage.app",
  messagingSenderId: "977154955614",
  appId: "1:977154955614:web:645c06bfa030f2f18417cf",
  measurementId: "G-HXHEY9HP4V"
};

// Ensure we don't try to initialize the app twice
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);