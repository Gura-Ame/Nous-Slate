// src/services/card-service.ts

import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	increment,
	orderBy,
	query,
	serverTimestamp,
	updateDoc,
	where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Card, CardContent, CardType } from "@/types/schema";

const COLLECTION_NAME = "cards";

export const CardService = {
	// 1. 取得某個題庫的所有卡片
	getCardsByDeck: async (deckId: string) => {
		try {
			const q = query(
				collection(db, COLLECTION_NAME),
				where("deckId", "==", deckId),
				orderBy("createdAt", "asc"), // 按照建立順序排列
			);

			const querySnapshot = await getDocs(q);
			return querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Card[];
		} catch (error) {
			console.error("Error fetching cards:", error);
			throw error;
		}
	},

	// 2. 新增卡片
	createCard: async (deckId: string, type: CardType, content: CardContent) => {
		try {
			// 1. 新增卡片
			const docRef = await addDoc(collection(db, COLLECTION_NAME), {
				deckId,
				type,
				content,
				stats: { totalAttempts: 0, totalErrors: 0 },
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			});

			// 2. 更新對應 Deck 的 cardCount (+1)
			const deckRef = doc(db, "decks", deckId);
			await updateDoc(deckRef, {
				"stats.cardCount": increment(1), // 原子操作：加 1
				updatedAt: serverTimestamp(),
			});

			return { id: docRef.id };
		} catch (error) {
			console.error("Error creating card:", error);
			throw error;
		}
	},

	// 3. 更新卡片
	updateCard: async (cardId: string, content: Partial<CardContent>) => {
		try {
			const docRef = doc(db, COLLECTION_NAME, cardId);
			await updateDoc(docRef, {
				content: content, // 注意：這裡會覆蓋整個 content 物件，若只需局部更新需調整寫法
				updatedAt: serverTimestamp(),
			});
		} catch (error) {
			console.error("Error updating card:", error);
			throw error;
		}
	},

	// 4. 刪除卡片
	deleteCard: async (cardId: string) => {
		try {
			// 1. 先抓出卡片資料，才知道它是屬於哪個 Deck
			const cardRef = doc(db, COLLECTION_NAME, cardId);
			const cardSnap = await getDoc(cardRef);

			if (cardSnap.exists()) {
				const deckId = cardSnap.data().deckId;

				// 2. 刪除卡片
				await deleteDoc(cardRef);

				// 3. 更新 Deck 的 cardCount (-1)
				const deckRef = doc(db, "decks", deckId);
				await updateDoc(deckRef, {
					"stats.cardCount": increment(-1), // 原子操作：減 1
					updatedAt: serverTimestamp(),
				});
			}
		} catch (error) {
			console.error("Error deleting card:", error);
			throw error;
		}
	},
};
