import { Timestamp } from "firebase/firestore";

// 1. 卡片類型 (Card)
// ▼▼▼ 修改 1: 加入 "fill_blank" ▼▼▼
export type CardType = "char" | "term" | "dictation" | "choice" | "fill_blank";

// 注音結構
export interface BopomofoData {
  initial: string;
  medial: string;
  final: string;
  tone: string;
}

export interface CardContent {
  stem: string;       // 題目
  
  // ▼▼▼ 修改 2: 改為選填 (Optional)，因為選擇題/填空題可能不需要詳細注音結構 ▼▼▼
  blocks?: {
    char: string;
    zhuyin: BopomofoData;
    candidates?: BopomofoData[]; 
  }[];

  meaning?: string;
  audioUrl?: string;
  image?: string;
  
  // ▼▼▼ 修改 3: 新增 answer 欄位 (用於儲存標準答案) ▼▼▼
  answer?: string;

  options?: string[]; // 干擾項 (選擇題用)
}

export interface Card {
  id: string;
  deckId: string;
  type: CardType;
  content: CardContent;
  
  stats: {
    totalAttempts: number;
    totalErrors: number;
    lastReportedAt?: Timestamp;
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 2. 題組類型 (Deck)
export interface Deck {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  tags: string[];
  
  isPublic: boolean;
  forkedFrom?: string;
  
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
  id: string;
  userId: string;
  deckId: string;
  cardId: string;
  
  sm2: {
    ease: number;
    interval: number;
    repetitions: number;
    dueDate: Timestamp;
  };

  lastReview: Timestamp;
  history: {
    date: Timestamp;
    grade: 0 | 1 | 2 | 3 | 4 | 5;
  }[];
}