// ⚙️ CONFIGURATION FIREBASE
// À REMPLIR AVEC VOS PARAMÈTRES DEPUIS FIREBASE CONSOLE

const firebaseConfig = {
    apiKey: "AIzaSyDBrFox9e3lYVmsPeF-tOT6pFYBjQ3NSVA",
    authDomain: "suivi-perf-athletes.firebaseapp.com",
    projectId: "suivi-perf-athletes",
    databaseURL: "https://suivi-perf-athletes-default-rtdb.firebaseio.com",
    storageBucket: "suivi-perf-athletes.firebasestorage.app",
    messagingSenderId: "774088845868",
    appId: "1:774088845868:web:6fa4e175bd88decf8f3f89",
    measurementId: "G-WBRZP9HBSN"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);

// Référence à la base de données
const db = firebase.database();
