// src/hooks/useAuth.ts
import { auth, googleProvider } from "@/lib/firebase";
import {
    type User,
    onAuthStateChanged,
    signInWithPopup,
    signOut
} from "firebase/auth";
import { useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 監聽登入狀態變化 (Firebase 會自動處理 Session)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        console.log("User logged in:", currentUser.displayName);
      } else {
        console.log("User logged out");
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
      alert("登入失敗，請稍後再試。");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return { user, loading, loginWithGoogle, logout };
}