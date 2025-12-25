import { isSameDay } from "date-fns";
import {
	addDoc,
	arrayUnion,
	collection,
	doc,
	getDoc,
	increment,
	runTransaction,
	serverTimestamp,
	updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserProfile } from "@/types/schema";

export const PointsService = {
	// 1. Initialize or fetch user point data
	getUserProfile: async (userId: string): Promise<UserProfile | null> => {
		const ref = doc(db, "users", userId);
		const snap = await getDoc(ref);
		if (snap.exists()) return snap.data() as UserProfile;
		return null;
	},

	// 2. Claim daily bonus (50 points)
	checkAndClaimDailyBonus: async (userId: string) => {
		const userRef = doc(db, "users", userId);

		// Use Transaction for concurrency safety
		await runTransaction(db, async (transaction) => {
			const userDoc = await transaction.get(userRef);
			if (!userDoc.exists()) return;

			const userData = userDoc.data() as UserProfile;
			const lastBonus = userData.lastDailyBonus?.toDate();
			const now = new Date();

			// If bonus hasn't been claimed today (or first time)
			if (!lastBonus || !isSameDay(lastBonus, now)) {
				// Update user
				transaction.update(userRef, {
					points: increment(50),
					lastDailyBonus: serverTimestamp(),
				});

				// Write transaction logs
				const transRef = doc(collection(db, "transactions"));
				transaction.set(transRef, {
					userId,
					type: "daily_bonus",
					amount: 50,
					description: "Daily login reward",
					createdAt: serverTimestamp(),
				});

				return 50; // Return points claimed
			}
		});
	},

	// 3. General point updates (Deduct 0.5 for quiz, 0.2 for error, add for gift)
	updatePoints: async (
		userId: string,
		amount: number,
		type: string,
		description: string,
	) => {
		const userRef = doc(db, "users", userId);

		// Simple check: For deductions, verify sufficient balance
		// (Frontend check here, should be paired with backend rules)
		const snap = await getDoc(userRef);
		const currentPoints = snap.data()?.points || 0;

		if (amount < 0 && currentPoints + amount < 0) {
			throw new Error("Insufficient points");
		}

		await updateDoc(userRef, {
			points: increment(amount),
		});

		await addDoc(collection(db, "transactions"), {
			userId,
			type,
			amount,
			description,
			createdAt: serverTimestamp(),
		});
	},

	// 4. Update user interest tags (for ad recommendations)
	// When a user practices a Deck, add the Deck's tags to user interests
	updateInterests: async (userId: string, newTags: string[]) => {
		if (!newTags.length) return;
		const userRef = doc(db, "users", userId);
		await updateDoc(userRef, {
			interestTags: arrayUnion(...newTags),
		});
	},
};
