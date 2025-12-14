import {
	endOfDay,
	format,
	isWithinInterval,
	startOfDay,
	subDays,
} from "date-fns";
import {
	collection,
	getCountFromServer,
	getDocs,
	limit,
	orderBy,
	query,
	Timestamp,
	where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Review } from "@/types/schema";

export interface ChartDataPoint {
	name: string;
	total: number;
	errorRate: number; // 0-100
	dateStr: string;
}

export interface DashboardStats {
	totalReviews: number;
	totalDecks: number;
	streak: number;
	todayCount: number;
	recentActivity: {
		id: string;
		deckId: string;
		score: number;
		date: Date;
	}[];
}

export const StatsService = {
	// 1. 獲取儀表板上方卡片數據
	getDashboardStats: async (userId: string): Promise<DashboardStats> => {
		const now = new Date();
		const todayStart = startOfDay(now);

		// --- A. 獲取總題庫數 ---
		const decksQuery = query(
			collection(db, "decks"),
			where("ownerId", "==", userId),
		);
		const decksSnapshot = await getCountFromServer(decksQuery);
		const totalDecks = decksSnapshot.data().count;

		// --- B. 獲取複習紀錄 (用於計算 Streak, Today, Total) ---
		const reviewsRef = collection(db, "reviews");
		const userReviewsQuery = query(
			reviewsRef,
			where("userId", "==", userId),
			orderBy("lastReview", "desc"),
		);

		// B-1. 總複習次數 (Server Count 較省資源)
		const totalReviewsSnapshot = await getCountFromServer(userReviewsQuery);
		const totalReviews = totalReviewsSnapshot.data().count;

		// B-2. 抓取最近紀錄 (用於計算 Streak 與 Recent Activity)
		// 抓 50 筆通常足夠判斷 Streak
		const recentSnapshot = await getDocs(query(userReviewsQuery, limit(50)));
		const recentReviews = recentSnapshot.docs.map((doc) => {
			const data = doc.data() as Review;
			return {
				...data,
				date: (data.lastReview as Timestamp).toDate(),
			};
		});

		// --- C. 計算今日複習數 ---
		const todayCount = recentReviews.filter((r) => r.date >= todayStart).length;

		// --- D. 計算 Streak (連續打卡) ---
		let streak = 0;
		if (recentReviews.length > 0) {
			// 邏輯：收集所有獨一無二的「練習日期」字串 (YYYY-MM-DD)
			const practiceDates = new Set(
				recentReviews.map((r) => format(r.date, "yyyy-MM-dd")),
			);

			const todayStr = format(now, "yyyy-MM-dd");
			const yesterdayStr = format(subDays(now, 1), "yyyy-MM-dd");

			// 如果今天或昨天有練習，Streak 至少為 1
			if (practiceDates.has(todayStr) || practiceDates.has(yesterdayStr)) {
				streak = 1;
				// 往回推，直到斷掉為止
				for (let i = 1; i < 365; i++) {
					const checkDate = subDays(
						now,
						practiceDates.has(todayStr) ? i : i + 1,
					); // 如果今天有練，從昨天開始查；今天沒練，從前天開始查
					const checkStr = format(checkDate, "yyyy-MM-dd");

					if (practiceDates.has(checkStr)) {
						streak++;
					} else {
						break;
					}
				}
			}
		}

		// --- E. 整理最近動態 ---
		const recentActivity = recentReviews.slice(0, 5).map((r) => ({
			id: r.cardId,
			deckId: r.deckId,
			score: r.sm2?.interval || 0, // 用下次間隔天數當作分數指標
			date: r.date,
		}));

		return {
			totalReviews,
			totalDecks,
			streak,
			todayCount,
			recentActivity,
		};
	},

	// 2. 獲取圖表數據 (精確計算歷史錯誤率)
	getWeeklyChartData: async (
		userId: string,
		endDate: Date,
	): Promise<ChartDataPoint[]> => {
		const startDate = subDays(startOfDay(endDate), 6); // 過去 7 天
		const end = endOfDay(endDate);

		// 1. 查詢範圍內有「更新」過的 Reviews
		// 注意：這可能漏掉「很久以前做過，但这七天內也做過，但 lastReview 被更新到今天」的歷史紀錄
		// 但這是 Firestore 架構下最高效的做法。
		// 我們抓取範圍稍微大一點，確保能涵蓋到 data points
		const reviewsRef = collection(db, "reviews");
		const q = query(
			reviewsRef,
			where("userId", "==", userId),
			where("lastReview", ">=", Timestamp.fromDate(startDate)), // 至少這週有動靜的卡片
			orderBy("lastReview", "desc"), // 這裡不需要 limit，因為要統計圖表
		);

		const snapshot = await getDocs(q);
		const reviews = snapshot.docs.map((doc) => doc.data() as Review);

		// 2. 準備 7 天的數據桶 (Buckets)
		const dailyStats = new Map<string, { total: number; errors: number }>();

		// 初始化 Map
		for (let i = 0; i < 7; i++) {
			const d = subDays(endDate, 6 - i);
			const dateKey = format(d, "yyyy-MM-dd");
			dailyStats.set(dateKey, { total: 0, errors: 0 });
		}

		// 3. 遍歷 Review History 進行精確統計
		// 這是關鍵：我們不只看 lastReview，而是把每張卡片的 history 陣列攤開來算
		reviews.forEach((review) => {
			if (review.history && Array.isArray(review.history)) {
				review.history.forEach((log) => {
					const logDate = (log.date as Timestamp).toDate();

					// 檢查這筆歷史紀錄是否在我們需要的 7 天範圍內
					if (isWithinInterval(logDate, { start: startDate, end })) {
						const dateKey = format(logDate, "yyyy-MM-dd");
						const stat = dailyStats.get(dateKey);

						if (stat) {
							stat.total += 1;
							// Grade < 3 (0:Again, 1:Hard, 2:Good) 視為廣義的錯誤/不熟
							if (log.grade < 3) {
								stat.errors += 1;
							}
						}
					}
				});
			} else {
				// Fallback: 如果沒有 history 陣列 (舊資料)，就用 lastReview 頂著
				const logDate = (review.lastReview as Timestamp).toDate();
				if (isWithinInterval(logDate, { start: startDate, end })) {
					const dateKey = format(logDate, "yyyy-MM-dd");
					const stat = dailyStats.get(dateKey);
					if (stat) stat.total += 1;
				}
			}
		});

		// 4. 轉換為圖表格式
		const chartData: ChartDataPoint[] = Array.from(dailyStats.entries())
			.map(([dateKey, stat]) => {
				// 格式化顯示日期 (例如 12/15)
				const displayDate = format(new Date(dateKey), "MM/dd");

				// 計算錯誤率
				const errorRate =
					stat.total === 0 ? 0 : Math.round((stat.errors / stat.total) * 100);

				return {
					name: displayDate,
					total: stat.total,
					errorRate: errorRate,
					dateStr: dateKey,
				};
			})
			.sort((a, b) => a.dateStr.localeCompare(b.dateStr)); // 確保日期排序

		return chartData;
	},
};
