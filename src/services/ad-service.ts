import { db } from "@/lib/firebase";
import type { Ad } from "@/types/schema";
import {
    addDoc,
    collection,
    doc,
    getDocs,
    increment,
    query,
    serverTimestamp, updateDoc,
    where
} from "firebase/firestore";
import { PointsService } from "./points-service";

export const AdService = {
  // 1. 廣告主登錄廣告
  registerAd: async (advertiserId: string, data: Omit<Ad, "id" | "advertiserId" | "active" | "views" | "createdAt">) => {
    await addDoc(collection(db, "ads"), {
      ...data,
      advertiserId,
      active: true,
      views: 0,
      createdAt: serverTimestamp()
    });
  },

  // 2. 獲取推薦廣告 (演算法核心)
  getRecommendedAds: async (userId: string): Promise<Ad[]> => {
    // 取得使用者興趣
    const userProfile = await PointsService.getUserProfile(userId);
    const userInterests = userProfile?.interestTags || [];

    // 取得所有啟用中的廣告
    const q = query(collection(db, "ads"), where("active", "==", true));
    const snap = await getDocs(q);
    const allAds = snap.docs.map(d => ({ id: d.id, ...d.data() } as Ad));

    // --- 推薦演算法 (Client Side) ---
    // 分數計算：基礎分 (Bid Price) + 興趣加權
    const scoredAds = allAds.map(ad => {
      let score = ad.bidPoints; // 錢出越多的排越前面
      
      // 計算興趣重疊
      const matchCount = ad.targetTags.filter(tag => userInterests.includes(tag)).length;
      
      // 每個命中標籤加權 20%
      if (matchCount > 0) {
        score = score * (1 + matchCount * 0.2);
      }

      return { ad, score };
    });

    // 排序並回傳
    return scoredAds.sort((a, b) => b.score - a.score).map(item => item.ad);
  },

  // 3. 觀看廣告領獎
  watchAd: async (userId: string, ad: Ad) => {
    // 廣告瀏覽數 +1
    await updateDoc(doc(db, "ads", ad.id), {
      views: increment(1)
    });

    // 使用者加分
    await PointsService.updatePoints(
      userId, 
      ad.rewardPoints, 
      "watch_ad", 
      `觀看廣告：${ad.title}`
    );
  }
};