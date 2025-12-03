// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: 請將下方的設定值替換成您從 Firebase Console 複製來的真實資料
const firebaseConfig = {
  apiKey: "AIzaSyA08giq7-wSFJC9NaL1G7VW8EJXSsci4Cc",
  authDomain: "nous-slate.firebaseapp.com",
  projectId: "nous-slate",
  storageBucket: "nous-slate.firebasestorage.app",
  messagingSenderId: "360340371174",
  appId: "1:360340371174:web:57fdedc8b0c8bc4d05ad27",
  measurementId: "G-7P9YL0FPLQ"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 匯出我們之後會用到的服務實例
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;