// src/types/schema.ts
import { Timestamp } from "firebase/firestore";

// 1. 卡片類型 (Card)
export type CardType = "char" | "term" | "dictation" | "choice";

// 注音結構 (存入資料庫用，比前端的 BopomofoChar 更精簡)
export interface BopomofoData {
  initial: string;
  medial: string;
  final: string;
  tone: string;
}

export interface CardContent {
  stem: string;       // 題目 (例如: "一鳴驚人")
  
  // 序列化後的字元結構 (用於核心引擎)
  blocks: {
    char: string;     // "一"
    zhuyin: BopomofoData;
    // 如果是破音字，這裡可以放候選清單
    candidates?: BopomofoData[]; 
  }[];

  meaning?: string;   // 解釋 (純文字)
  audioUrl?: string;  // 發音連結
  image?: string;     // 圖片連結
  
  // 選擇題專用
  options?: string[]; // 干擾項
}

export interface Card {
  id: string;
  deckId: string;
  type: CardType;
  content: CardContent;
  
  // 統計數據 (全域)
  stats: {
    totalAttempts: number;
    totalErrors: number;
    lastReportedAt?: Timestamp; // 錯誤回報時間
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 2. 題組類型 (Deck)
export interface Deck {
  id: string;
  ownerId: string; // 建立者
  title: string;
  description?: string;
  tags: string[];  // e.g., ["國一", "成語"]
  
  isPublic: boolean;
  forkedFrom?: string; // 若是複製來的，指向原 Deck ID
  
  stats: {
    cardCount: number;
    subscribers: number;
    stars: number;
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 3. SRS 學習紀錄 (Review)
export interface Review {
  id: string; // 通常是 `{userId}_{cardId}`
  userId: string;
  deckId: string;
  cardId: string;
  
  // SM-2 演算法參數
  sm2: {
    ease: number;       // 易度因子 (預設 2.5)
    interval: number;   // 下次複習間隔 (天)
    repetitions: number;// 連續答對次數
    dueDate: Timestamp; // 下次複習時間
  };

  lastReview: Timestamp;
  history: {
    date: Timestamp;
    grade: 0 | 1 | 2 | 3 | 4 | 5; // SM-2 評分
  }[];
}