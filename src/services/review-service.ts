// src/services/review-service.ts
import { db } from "@/lib/firebase";
import { calculateSRS, initialSRS, type Grade, type SRSItem } from "@/lib/srs-algo"; // 假設您已建立 srs-algo.ts
import {
    doc, getDoc,
    serverTimestamp,
    setDoc,
    Timestamp
} from "firebase/firestore";

export const ReviewService = {
  // 提交複習結果
  submitReview: async (userId: string, deckId: string, cardId: string, grade: Grade) => {
    const reviewId = `${userId}_${cardId}`;
    const reviewRef = doc(db, "reviews", reviewId);

    try {
      // 1. 取得舊的 SRS 狀態 (如果有的話)
      const reviewSnap = await getDoc(reviewRef);
      let currentSRS: SRSItem = { ...initialSRS };

      if (reviewSnap.exists()) {
        const data = reviewSnap.data();
        if (data.sm2) {
          currentSRS = data.sm2;
        }
      }

      // 2. 計算新的 SRS 狀態
      const nextSRS = calculateSRS(currentSRS, grade);

      // 3. 計算下次複習日期
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + nextSRS.interval);

      // 4. 寫入資料庫
      const reviewData = {
        userId,
        deckId,
        cardId,
        sm2: {
          ...nextSRS,
          dueDate: Timestamp.fromDate(nextDate)
        },
        lastReview: serverTimestamp(),
        // 這裡可以選擇是否要保留完整的 history array，或是只留最近一次
        // 為了效能，通常只存必要的 meta
      };

      // 使用 setDoc (merge: true) 來同時處理新增或更新
      await setDoc(reviewRef, reviewData, { merge: true });

      return nextSRS;
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  }
};