import {
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	increment,
	query,
	serverTimestamp,
	setDoc,
	updateDoc,
	where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Deck } from "@/types/schema";

export const SubService = {
	// Subscribe
	subscribe: async (userId: string, deck: Deck) => {
		const subId = `${userId}_${deck.id}`;
		const subRef = doc(db, "subscriptions", subId);

		// 1. Create subscription record
		await setDoc(subRef, {
			userId,
			deckId: deck.id,
			deckTitle: deck.title,
			deckOwnerId: deck.ownerId,
			createdAt: serverTimestamp(),
		});

		// 2. Update subscriber count for the Deck
		const deckRef = doc(db, "decks", deck.id);
		await updateDoc(deckRef, {
			"stats.subscribers": increment(1),
		});
	},

	// Unsubscribe
	unsubscribe: async (userId: string, deckId: string) => {
		const subId = `${userId}_${deckId}`;
		await deleteDoc(doc(db, "subscriptions", subId));

		// Update Deck subscriber count
		const deckRef = doc(db, "decks", deckId);
		await updateDoc(deckRef, {
			"stats.subscribers": increment(-1),
		});
	},

	// Check if subscribed
	checkSubscribed: async (userId: string, deckId: string) => {
		const subId = `${userId}_${deckId}`;
		const snap = await getDoc(doc(db, "subscriptions", subId));
		return snap.exists();
	},

	// Get all Deck IDs subscribed by the user
	getUserSubscribedIds: async (userId: string) => {
		const q = query(
			collection(db, "subscriptions"),
			where("userId", "==", userId),
		);
		const snap = await getDocs(q);
		return snap.docs.map((d) => d.data().deckId);
	},
};
