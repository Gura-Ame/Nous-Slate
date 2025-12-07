import { db } from "@/lib/firebase";
import type { UserProfile } from "@/types/schema";
import { isSameDay } from "date-fns";
import {
    addDoc,
    arrayUnion,
    collection,
    doc,
    getDoc, increment,
    runTransaction,
    serverTimestamp,
    updateDoc
} from "firebase/firestore";

export const PointsService = {
  // 1. 初始化或獲取使用者積分資料
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    const ref = doc(db, "users", userId);
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data() as UserProfile;
    return null;
  },

  // 2. 領取每日獎勵 (50分)
  checkAndClaimDailyBonus: async (userId: string) => {
    const userRef = doc(db, "users", userId);
    
    // 使用 Transaction 確保併發安全
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) return;

      const userData = userDoc.data() as UserProfile;
      const lastBonus = userData.lastDailyBonus?.toDate();
      const now = new Date();

      // 如果今天還沒領過 (或是第一次)
      if (!lastBonus || !isSameDay(lastBonus, now)) {
        // 更新使用者
        transaction.update(userRef, {
          points: increment(50),
          lastDailyBonus: serverTimestamp()
        });

        // 寫入交易明細
        const transRef = doc(collection(db, "transactions"));
        transaction.set(transRef, {
          userId,
          type: "daily_bonus",
          amount: 50,
          description: "每日登入獎勵",
          createdAt: serverTimestamp()
        });
        
        return 50; // 回傳領到的分數
      }
    });
  },

  // 3. 一般扣分/加分 (練習扣 0.5, 答錯扣 0.2, 捐贈加分)
  updatePoints: async (userId: string, amount: number, type: string, description: string) => {
    const userRef = doc(db, "users", userId);
    
    // 簡單檢查：如果是扣分，確認餘額足夠 (這裡做前端檢查，後端需 Rule 配合)
    const snap = await getDoc(userRef);
    const currentPoints = snap.data()?.points || 0;
    
    if (amount < 0 && currentPoints + amount < 0) {
      throw new Error("積分不足");
    }

    await updateDoc(userRef, {
      points: increment(amount)
    });

    await addDoc(collection(db, "transactions"), {
      userId,
      type,
      amount,
      description,
      createdAt: serverTimestamp()
    });
  },

  // 4. 更新使用者興趣標籤 (用於廣告推薦)
  // 當使用者練習某個 Deck 時，把該 Deck 的 Tags 加入使用者的興趣
  updateInterests: async (userId: string, newTags: string[]) => {
    if (!newTags.length) return;
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      interestTags: arrayUnion(...newTags)
    });
  }
};