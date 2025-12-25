// src/services/stats-service.ts

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
	errorRate: number;
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
	getDashboardStats: async (userId: string): Promise<DashboardStats> => {
		const now = new Date();
		const todayStart = startOfDay(now);

		// 1. Total decks count
		const decksQuery = query(
			collection(db, "decks"),
			where("ownerId", "==", userId),
		);
		const decksSnapshot = await getCountFromServer(decksQuery);
		const totalDecks = decksSnapshot.data().count;

		// 2. Total reviews count
		const reviewsRef = collection(db, "reviews");
		const userReviewsQuery = query(
			reviewsRef,
			where("userId", "==", userId),
			orderBy("lastReview", "desc"),
		);
		const totalReviewsSnapshot = await getCountFromServer(userReviewsQuery);
		const totalReviews = totalReviewsSnapshot.data().count;

		// 3. Today's review count
		const todayQuery = query(
			reviewsRef,
			where("userId", "==", userId),
			where("lastReview", ">=", Timestamp.fromDate(todayStart)),
		);
		const todaySnapshot = await getCountFromServer(todayQuery);
		const todayCount = todaySnapshot.data().count;

		// 4. Calculate streak
		const recentSnapshot = await getDocs(query(userReviewsQuery, limit(50)));
		const recentReviews = recentSnapshot.docs.map((doc) => {
			const data = doc.data() as Review;
			return {
				...data,
				date: (data.lastReview as Timestamp).toDate(),
			};
		});

		let streak = 0;
		if (recentReviews.length > 0) {
			const practiceDates = new Set(
				recentReviews.map((r) => format(r.date, "yyyy-MM-dd")),
			);
			const todayStr = format(now, "yyyy-MM-dd");
			const yesterdayStr = format(subDays(now, 1), "yyyy-MM-dd");

			if (practiceDates.has(todayStr) || practiceDates.has(yesterdayStr)) {
				streak = 1;
				for (let i = 1; i < 365; i++) {
					const checkDate = subDays(
						now,
						practiceDates.has(todayStr) ? i : i + 1,
					);
					const checkStr = format(checkDate, "yyyy-MM-dd");
					if (practiceDates.has(checkStr)) {
						streak++;
					} else {
						break;
					}
				}
			}
		}

		// 5. Recent Activity
		const recentActivity = recentReviews.slice(0, 5).map((r) => ({
			id: r.cardId,
			deckId: r.deckId,
			score: r.sm2?.interval || 0,
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

	// getWeeklyChartData remains unchanged...
	getWeeklyChartData: async (
		userId: string,
		endDate: Date,
	): Promise<ChartDataPoint[]> => {
		const startDate = subDays(startOfDay(endDate), 6);
		const end = endOfDay(endDate);

		const reviewsRef = collection(db, "reviews");
		const q = query(
			reviewsRef,
			where("userId", "==", userId),
			where("lastReview", ">=", Timestamp.fromDate(startDate)),
			orderBy("lastReview", "desc"),
		);

		const snapshot = await getDocs(q);
		const reviews = snapshot.docs.map((doc) => doc.data() as Review);

		const dailyStats = new Map<string, { total: number; errors: number }>();

		for (let i = 0; i < 7; i++) {
			const d = subDays(endDate, 6 - i);
			const dateKey = format(d, "yyyy-MM-dd");
			dailyStats.set(dateKey, { total: 0, errors: 0 });
		}

		reviews.forEach((review) => {
			if (review.history && Array.isArray(review.history)) {
				review.history.forEach((log) => {
					const logDate = (log.date as Timestamp).toDate();
					if (isWithinInterval(logDate, { start: startDate, end })) {
						const dateKey = format(logDate, "yyyy-MM-dd");
						const stat = dailyStats.get(dateKey);
						if (stat) {
							stat.total += 1;
							if (log.grade < 3) {
								stat.errors += 1;
							}
						}
					}
				});
			} else {
				const logDate = (review.lastReview as Timestamp).toDate();
				if (isWithinInterval(logDate, { start: startDate, end })) {
					const dateKey = format(logDate, "yyyy-MM-dd");
					const stat = dailyStats.get(dateKey);
					if (stat) stat.total += 1;
				}
			}
		});

		const chartData: ChartDataPoint[] = Array.from(dailyStats.entries())
			.map(([dateKey, stat]) => {
				const displayDate = format(new Date(dateKey), "MM/dd");
				const errorRate =
					stat.total === 0 ? 0 : Math.round((stat.errors / stat.total) * 100);
				return {
					name: displayDate,
					total: stat.total,
					errorRate: errorRate,
					dateStr: dateKey,
				};
			})
			.sort((a, b) => a.dateStr.localeCompare(b.dateStr));

		return chartData;
	},
};
