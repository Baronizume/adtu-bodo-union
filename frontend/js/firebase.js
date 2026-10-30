// =====================================
// FIREBASE CONFIGURATION
// =====================================


const firebaseConfig = {
    apiKey: "AIzaSyBmz7qt4nV8rdTj_lJ_NdNGhV-Acyc2OSw",
    authDomain: "adtu-bodo-union.firebaseapp.com",
    projectId: "adtu-bodo-union",
    storageBucket: "adtu-bodo-union.firebasestorage.app",
    messagingSenderId: "673474044129",
    appId: "1:673474044129:web:543c9d2dd787e5079657a0",
    measurementId: "G-MR683YR6LL"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Make services available to other JavaScript files
window.auth = auth;
window.db = db;
window.storage = storage;
