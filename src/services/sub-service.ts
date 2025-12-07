import { db } from "@/lib/firebase";
import type { Deck } from "@/types/schema";
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    increment,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from "firebase/firestore";

export const SubService = {
  // 訂閱 (Subscribe)
  subscribe: async (userId: string, deck: Deck) => {
    const subId = `${userId}_${deck.id}`;
    const subRef = doc(db, "subscriptions", subId);
    
    // 1. 建立訂閱紀錄
    await setDoc(subRef, {
      userId,
      deckId: deck.id,
      deckTitle: deck.title,
      deckOwnerId: deck.ownerId,
      createdAt: serverTimestamp()
    });

    // 2. 更新 Deck 的訂閱數
    const deckRef = doc(db, "decks", deck.id);
    await updateDoc(deckRef, {
      "stats.subscribers": increment(1)
    });
  },

  // 取消訂閱 (Unsubscribe)
  unsubscribe: async (userId: string, deckId: string) => {
    const subId = `${userId}_${deckId}`;
    await deleteDoc(doc(db, "subscriptions", subId));

    // 更新 Deck 訂閱數
    const deckRef = doc(db, "decks", deckId);
    await updateDoc(deckRef, {
      "stats.subscribers": increment(-1)
    });
  },

  // 檢查是否已訂閱
  checkSubscribed: async (userId: string, deckId: string) => {
    const subId = `${userId}_${deckId}`;
    const snap = await getDoc(doc(db, "subscriptions", subId));
    return snap.exists();
  },

  // 獲取使用者訂閱的所有 Deck IDs
  getUserSubscribedIds: async (userId: string) => {
    const q = query(collection(db, "subscriptions"), where("userId", "==", userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data().deckId);
  }
};