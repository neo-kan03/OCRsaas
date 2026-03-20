const firebaseConfig = {
    apiKey: "AIzaSyCiTiWTZS7s-cEkl-lZlkkHliJ6u0o9XEY",
    authDomain: "loginfirebase2-36ea2.firebaseapp.com",
    projectId: "loginfirebase2-36ea2",
    storageBucket: "loginfirebase2-36ea2.firebasestorage.app",
    messagingSenderId: "929563914094",
    appId: "1:929563914094:web:7822b0132e1514556f9b7f",
    measurementId: "G-CGLWXD94KQ"
};

// Initialize Firebase usando la versión "compat" que ya has cargado en el HTML
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();