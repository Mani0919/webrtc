// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBVO9viKn5ya0HAPnNHE2ZB48guPBaiiRo",
  authDomain: "cumapp-32941.firebaseapp.com",
  projectId: "cumapp-32941",
  storageBucket: "cumapp-32941.firebasestorage.app",
  messagingSenderId: "834495022514",
  appId: "1:834495022514:web:f15102e550b276655d90ab",
  measurementId: "G-GB4KRGWT36"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app); 