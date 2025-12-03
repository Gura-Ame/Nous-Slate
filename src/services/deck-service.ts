// src/services/deck-service.ts
import { db } from "@/lib/firebase";
import type { Deck } from "@/types/schema";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "firebase/firestore";

const COLLECTION_NAME = "decks";

export const DeckService = {
  // 1. 建立新題庫
  createDeck: async (userId: string, title: string, description?: string) => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ownerId: userId,
        title,
        description: description || "",
        tags: [],
        isPublic: false, // 預設私有
        stats: {
          cardCount: 0,
          subscribers: 0,
          stars: 0
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id };
    } catch (error) {
      console.error("Error creating deck:", error);
      throw error;
    }
  },

  // 2. 取得使用者的所有題庫
  getUserDecks: async (userId: string) => {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("ownerId", "==", userId),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      // 這裡需要手動轉型，因為 Firestore 返回的是 DocumentData
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Deck[];
    } catch (error) {
      console.error("Error fetching decks:", error);
      throw error;
    }
  },

  // 3. 刪除題庫
  deleteDeck: async (deckId: string) => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, deckId));
      // TODO: 這裡之後應該要用 Batch Delete 把該題庫底下的 Cards 也刪掉
    } catch (error) {
      console.error("Error deleting deck:", error);
      throw error;
    }
  },

// 4. 取得公開題庫列表
  getPublicDecks: async () => {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("isPublic", "==", true), // 只抓公開的
        orderBy("updatedAt", "desc")   // 按更新時間排序
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Deck[];
    } catch (error) {
      console.error("Error fetching public decks:", error);
      throw error;
    }
  },
  
  // 5. 更新題庫資訊
  updateDeck: async (deckId: string, data: Partial<Deck>) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, deckId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating deck:", error);
      throw error;
    }
  },
};