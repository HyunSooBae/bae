import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  apiKey: "AIzaSyD4O8pe8orEIJkI01ZvNhU67_XGqMIeRY4",
  authDomain: "bae-f81e8.firebaseapp.com",
  projectId: "bae-f81e8",
  storageBucket: "bae-f81e8.appspot.com",
  messagingSenderId: "1054019526668",
  appId: "1:1054019526668:web:e826b351deeb49a1c30e29"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)