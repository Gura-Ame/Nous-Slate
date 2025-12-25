// src/lib/firebase.ts

import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { env } from "@/lib/env";

const firebaseConfig = {
	apiKey: env.VITE_FIREBASE_API_KEY,
	authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: env.VITE_FIREBASE_APP_ID,
	measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

if (typeof window !== "undefined") {
	if (location.hostname === "localhost") {
		// Firebase debug token for local development
		(self as unknown as Record<string, unknown>).FIREBASE_APPCHECK_DEBUG_TOKEN =
			true;
	}

	initializeAppCheck(app, {
		provider: new ReCaptchaV3Provider(env.VITE_RECAPTCHA_SITE_KEY),
		isTokenAutoRefreshEnabled: true,
	});
}

export default app;
