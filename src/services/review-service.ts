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
	// 1. 提交複習結果 (寫入 SRS 數據)
	submitReview: async (
		userId: string,
		deckId: string,
		cardId: string,
		grade: Grade,
	) => {
		const reviewId = `${userId}_${cardId}`;
		const reviewRef = doc(db, "reviews", reviewId);

		try {
			// 1.1 取得舊的 SRS 狀態 (如果有的話)
			const reviewSnap = await getDoc(reviewRef);
			let currentSRS: SRSItem = { ...initialSRS };

			if (reviewSnap.exists()) {
				const data = reviewSnap.data();
				if (data.sm2) {
					currentSRS = data.sm2;
				}
			}

			// 1.2 計算新的 SRS 狀態 (使用 SM-2 演算法)
			const nextSRS = calculateSRS(currentSRS, grade);

			// 1.3 計算下次複習日期
			const nextDate = new Date();
			nextDate.setDate(nextDate.getDate() + nextSRS.interval);

			// 1.4 寫入資料庫
			// 使用 setDoc + merge，這樣如果文檔不存在會自動建立，存在則更新
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

	// 2. 獲取今日需複習的卡片 (Review Center 用)
	getDueCards: async (userId: string): Promise<Card[]> => {
		const now = Timestamp.now();

		try {
			// 2.1 查詢 reviews 集合中，屬於該使用者且到期 (dueDate <= now) 的項目
			// 注意：這需要建立複合索引 (userId ASC, sm2.dueDate ASC)
			const q = query(
				collection(db, "reviews"),
				where("userId", "==", userId),
				where("sm2.dueDate", "<=", now),
			);

			const snapshot = await getDocs(q);

			if (snapshot.empty) return [];

			// 2.2 收集所有 Card ID
			const cardIds = snapshot.docs.map((doc) => doc.data().cardId);

			// 2.3 抓取實際的 Card 資料
			// 為了避免一次抓太多導致效能問題，這裡簡單限制前 50 筆
			// 若需完整實作，可分批 (Batch) 抓取或使用分頁
			const limitIds = cardIds.slice(0, 50);
			const cards: Card[] = [];

			// 使用 Promise.all 平行抓取卡片內容
			await Promise.all(
				limitIds.map(async (id) => {
					try {
						const cardRef = doc(db, "cards", id);
						const cardSnap = await getDoc(cardRef);

						// 確保卡片還存在 (可能已被刪除)
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
