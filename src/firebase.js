// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDe4oB2vKidDWZwVsB9Dbw3Nq1R_p5v3Gs",  // 🔑 use your real API key
  authDomain: "studygen-6f0f2.firebaseapp.com",
  projectId: "studygen-6f0f2",
  storageBucket: "studygen-6f0f2.appspot.com ",
  messagingSenderId: "1014293468680",  // ⚡ from your Firebase console
  appId: "1:1014293468680:web:380626d3693abae7a2e3bd"  // ⚡ from your Firebase console
  
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth setup
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };

