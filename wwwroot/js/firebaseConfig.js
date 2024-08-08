// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDsIU2vrjU7AJmz-2OQEp9REY5p6wrmqn4",
    authDomain: "peerchatvideo-4c77f.firebaseapp.com",
    projectId: "peerchatvideo-4c77f",
    storageBucket: "peerchatvideo-4c77f.appspot.com",
    messagingSenderId: "536880557200",
    appId: "1:536880557200:web:ed9f18b1a340db567afc15"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {db}