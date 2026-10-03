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


// =====================================
// INITIALIZE FIREBASE
// =====================================

firebase.initializeApp(firebaseConfig);


// =====================================
// FIREBASE SERVICES
// =====================================

const db = firebase.firestore();

const auth = firebase.auth();

const storage = firebase.storage();