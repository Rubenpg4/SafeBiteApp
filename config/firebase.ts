import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
// @ts-ignore
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "REMOVED_API_KEY",
    authDomain: "safebite-f4915.firebaseapp.com",
    projectId: "safebite-f4915",
    storageBucket: "safebite-f4915.firebasestorage.app",
    messagingSenderId: "856801488212",
    appId: "1:856801488212:web:3ea2e0963649aca7ccecc1",
    measurementId: "G-4P460XJ7P8"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

