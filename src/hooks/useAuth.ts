// src/hooks/useAuth.ts

import {
	onAuthStateChanged,
	signInWithPopup,
	signOut,
	type User,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";

export function useAuth() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// 監聽登入狀態變化 (Firebase 會自動處理 Session)
		const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
			setUser(currentUser);
			setLoading(false);

			if (currentUser) {
				try {
					const userRef = doc(db, "users", currentUser.uid);
					// 使用 setDoc + merge: true，確保只更新欄位而不覆蓋整個文件
					await setDoc(
						userRef,
						{
							uid: currentUser.uid,
							displayName: currentUser.displayName || "匿名使用者",
							photoURL: currentUser.photoURL,
							email: currentUser.email,
							lastSeen: serverTimestamp(),
						},
						{ merge: true },
					);
				} catch (error) {
					console.error("Error syncing user profile:", error);
				}
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
