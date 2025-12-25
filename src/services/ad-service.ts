import {
	addDoc,
	collection,
	doc,
	getDocs,
	increment,
	query,
	serverTimestamp,
	updateDoc,
	where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Ad } from "@/types/schema";
import { PointsService } from "./points-service";

export const AdService = {
	// 1. Advertiser registers an ad
	registerAd: async (
		advertiserId: string,
		data: Omit<Ad, "id" | "advertiserId" | "active" | "views" | "createdAt">,
	) => {
		await addDoc(collection(db, "ads"), {
			...data,
			advertiserId,
			active: true,
			views: 0,
			createdAt: serverTimestamp(),
		});
	},

	// 2. Get recommended ads (Algorithm core)
	getRecommendedAds: async (userId: string): Promise<Ad[]> => {
		// Get user interests
		const userProfile = await PointsService.getUserProfile(userId);
		const userInterests = userProfile?.interestTags || [];

		// Get all active ads
		const q = query(collection(db, "ads"), where("active", "==", true));
		const snap = await getDocs(q);
		const allAds = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Ad);

		// --- Recommendation Algorithm (Client Side) ---
		// Score calculation: Base score (Bid Price) + Interest weighting
		const scoredAds = allAds.map((ad) => {
			let score = ad.bidPoints; // Higher bid ranks higher

			// Calculate interest overlap
			const matchCount = ad.targetTags.filter((tag) =>
				userInterests.includes(tag),
			).length;

			// 20% weight for each matching tag
			if (matchCount > 0) {
				score = score * (1 + matchCount * 0.2);
			}

			return { ad, score };
		});

		// Sort and return
		return scoredAds.sort((a, b) => b.score - a.score).map((item) => item.ad);
	},

	// 3. Watch ad reward
	watchAd: async (userId: string, ad: Ad) => {
		// Increment ad view count
		await updateDoc(doc(db, "ads", ad.id), {
			views: increment(1),
		});

		// Reward user points
		await PointsService.updatePoints(
			userId,
			ad.rewardPoints,
			"watch_ad",
			`Watched Ad: ${ad.title}`,
		);
	},
};
