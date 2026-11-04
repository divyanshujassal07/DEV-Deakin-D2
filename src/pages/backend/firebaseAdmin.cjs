const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

// Load service account credentials
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin
const app = getApps().length === 0
    ? initializeApp({
        credential: cert(serviceAccount)
    })
    : getApps()[0];

// Connect to Firestore
const db = getFirestore(app);

// Connect to Firebase Authentication
const auth = getAuth(app);

// Export Firebase services
module.exports = {
    app,
    db,
    auth
};