import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCiTiWTZS7s-cEkl-lZlkkHliJ6u0o9XEY",
    authDomain: "loginfirebase2-36ea2.firebaseapp.com",
    projectId: "loginfirebase2-36ea2",
    storageBucket: "loginfirebase2-36ea2.firebasestorage.app",
    messagingSenderId: "929563914094",
    appId: "1:929563914094:web:7822b0132e1514556f9b7f",
    measurementId: "G-CGLWXD94KQ"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const db = firebase.firestore();

export default firebase;