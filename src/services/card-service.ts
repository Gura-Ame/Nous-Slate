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
	// 1. Get all cards for a specific deck
	getCardsByDeck: async (deckId: string) => {
		try {
			const q = query(
				collection(db, COLLECTION_NAME),
				where("deckId", "==", deckId),
				orderBy("createdAt", "asc"), // Sort by creation order
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

	// 2. Create card
	createCard: async (deckId: string, type: CardType, content: CardContent) => {
		try {
			// 1. Create card document
			const docRef = await addDoc(collection(db, COLLECTION_NAME), {
				deckId,
				type,
				content,
				stats: { totalAttempts: 0, totalErrors: 0 },
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			});

			// 2. Update cardCount in corresponding Deck (+1)
			const deckRef = doc(db, "decks", deckId);
			await updateDoc(deckRef, {
				"stats.cardCount": increment(1), // Atomic operation: increment by 1
				updatedAt: serverTimestamp(),
			});

			return { id: docRef.id };
		} catch (error) {
			console.error("Error creating card:", error);
			throw error;
		}
	},

	// 3. Update card
	updateCard: async (cardId: string, content: Partial<CardContent>) => {
		try {
			const docRef = doc(db, COLLECTION_NAME, cardId);
			await updateDoc(docRef, {
				content: content, // NOTE: This overwrites the entire content object. Adjust if partial update is needed.
				updatedAt: serverTimestamp(),
			});
		} catch (error) {
			console.error("Error updating card:", error);
			throw error;
		}
	},

	// 4. Delete card
	deleteCard: async (cardId: string) => {
		try {
			// 1. Get card data first to identify parent Deck
			const cardRef = doc(db, COLLECTION_NAME, cardId);
			const cardSnap = await getDoc(cardRef);

			if (cardSnap.exists()) {
				const deckId = cardSnap.data().deckId;

				// 2. Delete card document
				await deleteDoc(cardRef);

				// 3. Update cardCount in Deck (-1)
				const deckRef = doc(db, "decks", deckId);
				await updateDoc(deckRef, {
					"stats.cardCount": increment(-1), // Atomic operation: decrement by 1
					updatedAt: serverTimestamp(),
				});
			}
		} catch (error) {
			console.error("Error deleting card:", error);
			throw error;
		}
	},
};
