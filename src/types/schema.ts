import type { Timestamp } from "firebase/firestore";

// 1. 卡片類型 (Card)
export type CardType =
	| "char"
	| "term"
	| "dictation"
	| "choice"
	| "fill_blank"
	| "flashcard";

// 注音結構
export interface BopomofoData {
	initial: string;
	medial: string;
	final: string;
	tone: string;
}

export interface CardContent {
	stem: string; // 題目

	blocks?: {
		char: string;
		zhuyin: BopomofoData;
		candidates?: BopomofoData[];
	}[];

	meaning?: string;
	audioUrl?: string;
	image?: string;

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

export interface UserProfile {
	uid: string;
	displayName: string;
	photoURL?: string;
	email?: string;

	// ▼▼▼ 新增積分相關 ▼▼▼
	points: number; // 目前積分
	lastDailyBonus: Timestamp | null; // 上次領取每日獎勵的時間
	interestTags: string[]; // 用於廣告推薦的興趣標籤 (根據做過的題庫累積)
	isAdvertiser?: boolean; // 是否為廣告主
}

// 5. 廣告 (Ad)
export interface Ad {
	id: string;
	advertiserId: string; // 誰刊登的
	title: string;
	content: string; // 廣告內容 (文字或圖片URL)
	targetTags: string[]; // 目標受眾標籤 (e.g., "國文", "英文", "考試")

	bidPoints: number; // 廣告主願意支付的積分 (登錄時設定)
	// 使用者看一次獲得的積分 (通常是 bidPoints 的一部分，這裡假設全給或打折)
	rewardPoints: number;

	active: boolean; // 是否上架
	views: number; // 被觀看次數
	createdAt: Timestamp;
}

// 6. 交易紀錄 (Transaction) - 用於帳務明細
export type TransactionType =
	| "daily_bonus"
	| "quiz_cost"
	| "quiz_penalty"
	| "watch_ad"
	| "donation"
	| "create_ad";

export interface PointTransaction {
	id: string;
	userId: string;
	type: TransactionType;
	amount: number; // 正數為加分，負數為扣分
	description: string; // e.g., "觀看廣告: Nike球鞋", "練習: 國文第一課"
	createdAt: Timestamp;
}

export interface Subscription {
	id: string; // userId_deckId
	userId: string;
	deckId: string;
	deckTitle: string; // 快取標題，方便列表顯示
	deckOwnerId: string;
	createdAt: Timestamp;
}
