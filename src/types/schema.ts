import type { Timestamp } from "firebase/firestore";

export interface Folder {
	id: string;
	ownerId: string;
	name: string;
	createdAt: Timestamp;
	color?: string; // Tailwind class, e.g., "bg-red-500"
	isPublic: boolean; // Is it public?
}

// 1. Card Types
export type CardType =
	| "char"
	| "term"
	| "dictation"
	| "choice"
	| "fill_blank"
	| "flashcard";

// Bopomofo Structure
export interface BopomofoData {
	initial: string;
	medial: string;
	final: string;
	tone: string;
}

export interface CardContent {
	stem: string; // Question stem

	blocks?: {
		char: string;
		zhuyin: BopomofoData;
		candidates?: BopomofoData[];
	}[];

	meaning?: string;
	audioUrl?: string;
	image?: string;

	answer?: string;

	options?: string[]; // Distractors (for multiple choice)
	maskedIndices?: number[];
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

// 2. Deck Types
export interface Deck {
	id: string;
	ownerId: string;
	title: string;
	description?: string;
	tags: string[];

	folderId?: string | null;

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

// 3. SRS Review Record
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

	interestTags: string[]; // Interest tags for ad recommendation (accumulated based on decks practiced)
	isAdvertiser?: boolean; // Is an advertiser?
	advertiserId?: string; // If advertiser, their ID
	points: number; // Current points
	lastDailyBonus?: Timestamp; // Last time they claimed daily bonus
}

// 5. Ad Types
export interface Ad {
	id: string;
	advertiserId: string; // Published by whom
	title: string;
	content: string; // Ad content (text or image URL)
	targetTags: string[]; // Target audience tags (e.g., "Chinese", "English", "Exam")

	bidPoints: number; // Points the advertiser is willing to pay (set during registration)
	// Points the user gets per view (usually a part of bidPoints)
	rewardPoints: number;

	active: boolean; // Is it active?
	views: number; // View count
	createdAt: Timestamp;
}

// 6. Transaction Record - For accounting details
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
	amount: number; // Positive for addition, negative for deduction
	description: string; // e.g., "Watch ad: Nike Shoes", "Practice: Chinese Lesson 1"
	createdAt: Timestamp;
}

export interface Subscription {
	userId: string;
	deckId: string;
	deckTitle: string; // Cached title for easier list display
	deckOwnerId: string;
	createdAt: Timestamp;
}
