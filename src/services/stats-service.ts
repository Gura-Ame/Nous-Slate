// src/services/stats-service.ts
import { db } from "@/lib/firebase";
import type { Review } from "@/types/schema";
import { differenceInCalendarDays, format, startOfDay, subDays } from "date-fns";
import {
    collection,
    getCountFromServer,
    getDocs,
    limit,
    orderBy,
    query,
    Timestamp,
    where
} from "firebase/firestore";

export interface DashboardStats {
  totalReviews: number;
  totalDecks: number;
  streak: number;
  todayCount: number;
  chartData: { name: string; total: number }[];
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

    // 1. 獲取總題庫數
    const decksQuery = query(collection(db, "decks"), where("ownerId", "==", userId));
    const decksSnapshot = await getCountFromServer(decksQuery);
    const totalDecks = decksSnapshot.data().count;

    // 2. 獲取所有複習紀錄
    const reviewsRef = collection(db, "reviews");
    const userReviewsQuery = query(
      reviewsRef, 
      where("userId", "==", userId), 
      orderBy("lastReview", "desc")
    );
    
    // 2.1 總複習數
    const totalReviewsSnapshot = await getCountFromServer(userReviewsQuery);
    const totalReviews = totalReviewsSnapshot.data().count;

    // 2.2 抓取最近的紀錄
    const recentReviewsSnap = await getDocs(query(userReviewsQuery, limit(100)));
    
    // ▼▼▼ 2. 關鍵修正：在這裡明確轉型為 Review ▼▼▼
    const reviews = recentReviewsSnap.docs.map(doc => {
      const data = doc.data() as Review; // 告訴 TS 這是 Review 結構
      return {
        ...data,
        date: (data.lastReview as Timestamp).toDate()
      };
    });

    // 3. 計算今日複習數
    const todayStart = startOfDay(now);
    const todayCount = reviews.filter(r => r.date >= todayStart).length;

    // 4. 計算圖表數據
    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(now, 6 - i);
      const dateStr = format(date, "MM/dd");
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const count = reviews.filter(r => r.date >= dayStart && r.date < dayEnd).length;
      
      return { name: dateStr, total: count };
    });

    // 5. 計算 Streak
    let streak = 0;
    if (reviews.length > 0) {
      const lastReviewDate = reviews[0].date;
      const diffToday = differenceInCalendarDays(now, lastReviewDate);
      
      if (diffToday <= 1) {
        streak = 1;
        let currentDate = startOfDay(lastReviewDate);
        const practiceDates = new Set(reviews.map(r => startOfDay(r.date).toISOString()));
        
        for (let i = 1; i < 365; i++) {
          const prevDate = subDays(currentDate, 1);
          if (practiceDates.has(prevDate.toISOString())) {
            streak++;
            currentDate = prevDate;
          } else {
            break;
          }
        }
      }
    }

    // 6. 整理最近動態
    // 現在 TS 知道 r 裡面有 deckId 和 cardId 了
    const recentActivity = reviews.slice(0, 5).map(r => ({
      id: r.cardId,
      deckId: r.deckId, 
      score: 0, 
      date: r.date
    }));

    return {
      totalReviews,
      totalDecks,
      streak,
      todayCount,
      chartData,
      recentActivity
    };
  }
};