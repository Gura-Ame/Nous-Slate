import {
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	serverTimestamp,
	setDoc,
	Timestamp,
	where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
	calculateSRS,
	type Grade,
	initialSRS,
	type SRSItem,
} from "@/lib/srs-algo";
import type { Card } from "@/types/schema";

export const ReviewService = {
	// 1. Submit review result (Write SRS data)
	submitReview: async (
		userId: string,
		deckId: string,
		cardId: string,
		grade: Grade,
	) => {
		const reviewId = `${userId}_${cardId}`;
		const reviewRef = doc(db, "reviews", reviewId);

		try {
			// 1.1 Get previous SRS status (if exists)
			const reviewSnap = await getDoc(reviewRef);
			let currentSRS: SRSItem = { ...initialSRS };

			if (reviewSnap.exists()) {
				const data = reviewSnap.data();
				if (data.sm2) {
					currentSRS = data.sm2;
				}
			}

			// 1.2 Calculate new SRS status (using SM-2 algorithm)
			const nextSRS = calculateSRS(currentSRS, grade);

			// 1.3 Calculate next review date
			const nextDate = new Date();
			nextDate.setDate(nextDate.getDate() + nextSRS.interval);

			// 1.4 Write to database
			// Use setDoc + merge: auto-creates if missing, updates if exists.
			await setDoc(
				reviewRef,
				{
					userId,
					deckId,
					cardId,
					sm2: {
						...nextSRS,
						dueDate: Timestamp.fromDate(nextDate),
					},
					lastReview: serverTimestamp(),
				},
				{ merge: true },
			);

			return nextSRS;
		} catch (error) {
			console.error("Error submitting review:", error);
		}
	},

	// 2. Get cards due for review today (For Review Center)
	getDueCards: async (userId: string): Promise<Card[]> => {
		const now = Timestamp.now();

		try {
			// 1.1 Query reviews collection for items belonging to user and due (dueDate <= now)
			// NOTE: Requires composite index (userId ASC, sm2.dueDate ASC)
			const q = query(
				collection(db, "reviews"),
				where("userId", "==", userId),
				where("sm2.dueDate", "<=", now),
			);

			const snapshot = await getDocs(q);

			if (snapshot.empty) return [];

			// 2.2 Collect all Card IDs
			const cardIds = snapshot.docs.map((doc) => doc.data().cardId);

			// 2.3 Fetch actual Card data
			// To avoid performance issues from fetching too many at once, limit to 50
			// If needed, implement batch fetching or pagination
			const limitIds = cardIds.slice(0, 50);
			const cards: Card[] = [];

			// Fetch card content in parallel using Promise.all
			await Promise.all(
				limitIds.map(async (id) => {
					try {
						const cardRef = doc(db, "cards", id);
						const cardSnap = await getDoc(cardRef);

						// Ensure card still exists (sanity check for deleted cards)
						if (cardSnap.exists()) {
							cards.push({ id: cardSnap.id, ...cardSnap.data() } as Card);
						}
					} catch (err) {
						console.warn(`Failed to fetch card ${id}`, err);
					}
				}),
			);

			return cards;
		} catch (error) {
			console.error("Error fetching due cards:", error);
			throw error;
		}
	},
};
