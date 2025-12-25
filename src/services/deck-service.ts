// src/services/deck-service.ts

import {
	addDoc,
	collection,
	doc,
	getDocs,
	orderBy,
	query,
	serverTimestamp,
	updateDoc,
	where,
	writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Deck } from "@/types/schema";

const COLLECTION_NAME = "decks";

export const DeckService = {
	// 1. Create new deck
	createDeck: async (userId: string, title: string, description?: string) => {
		try {
			const docRef = await addDoc(collection(db, COLLECTION_NAME), {
				ownerId: userId,
				title,
				description: description || "",
				tags: [],
				isPublic: false, // Default to private
				stats: {
					cardCount: 0,
					subscribers: 0,
					stars: 0,
				},
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			});
			return { id: docRef.id };
		} catch (error) {
			console.error("Error creating deck:", error);
			throw error;
		}
	},

	// 2. Get all decks for a user
	getUserDecks: async (userId: string) => {
		try {
			const q = query(
				collection(db, COLLECTION_NAME),
				where("ownerId", "==", userId),
				orderBy("createdAt", "desc"),
			);

			const querySnapshot = await getDocs(q);
			// Needs manual casting as Firestore returns DocumentData
			return querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Deck[];
		} catch (error) {
			console.error("Error fetching decks:", error);
			throw error;
		}
	},

	deleteDeck: async (deckId: string) => {
		try {
			const batch = writeBatch(db);

			// 1. Delete the Deck document
			const deckRef = doc(db, COLLECTION_NAME, deckId);
			batch.delete(deckRef);

			// 2. Find all associated Cards and add to batch
			const cardsQuery = query(
				collection(db, "cards"),
				where("deckId", "==", deckId),
			);
			const cardsSnapshot = await getDocs(cardsQuery);
			cardsSnapshot.forEach((doc) => {
				batch.delete(doc.ref);
			});

			// 3. Find all associated Reviews and add to batch
			const reviewsQuery = query(
				collection(db, "reviews"),
				where("deckId", "==", deckId),
			);
			const reviewsSnapshot = await getDocs(reviewsQuery);
			reviewsSnapshot.forEach((doc) => {
				batch.delete(doc.ref);
			});

			// 4. Commit all deletions (NOTE: Max 500 ops per batch, requires chunking for large datasets)
			await batch.commit();

			console.log(`Deck ${deckId} and related data deleted successfully.`);
		} catch (error) {
			console.error("Error deleting deck:", error);
			throw error;
		}
	},

	// 4. Get public decks list
	getPublicDecks: async () => {
		try {
			const q = query(
				collection(db, COLLECTION_NAME),
				where("isPublic", "==", true), // Only public decks
				orderBy("updatedAt", "desc"), // Sort by last update
			);

			const querySnapshot = await getDocs(q);
			return querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Deck[];
		} catch (error) {
			console.error("Error fetching public decks:", error);
			throw error;
		}
	},

	// 5. Update deck information
	updateDeck: async (deckId: string, data: Partial<Deck>) => {
		try {
			const docRef = doc(db, COLLECTION_NAME, deckId);
			await updateDoc(docRef, {
				...data,
				updatedAt: serverTimestamp(),
			});
		} catch (error) {
			console.error("Error updating deck:", error);
			throw error;
		}
	},

	moveDeckToFolder: async (deckId: string, folderId: string | null) => {
		const deckRef = doc(db, "decks", deckId);
		await updateDoc(deckRef, {
			folderId: folderId, // null means move out of folder (becomes uncategorized)
		});
	},

	resetDecksFolder: async (userId: string, folderId: string) => {
		const q = query(
			collection(db, COLLECTION_NAME),
			where("folderId", "==", folderId),
			where("ownerId", "==", userId), // CRITICAL: Security rule requirement
		);
		const snap = await getDocs(q);

		// Use Batch for better performance and atomicity
		const batch = writeBatch(db);
		snap.docs.forEach((doc) => {
			batch.update(doc.ref, {
				folderId: null,
				updatedAt: serverTimestamp(),
			});
		});
		await batch.commit();
	},
};
