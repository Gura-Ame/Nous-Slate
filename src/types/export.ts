import type { CardContent, CardType } from "./schema";

// 匯出的最小單位：卡片
export interface ExportCard {
	type: CardType;
	content: CardContent;
}

// 匯出的題庫
export interface ExportDeck {
	title: string;
	description?: string;
	tags: string[];
	isPublic: boolean;
	cards: ExportCard[];
}

// 匯出的資料夾 (包含裡面的題庫)
export interface ExportFolder {
	name: string;
	color: string;
	isPublic: boolean;
	decks: ExportDeck[];
}

// 匯出的完整備份包 (包含使用者設定、所有資料夾、未分類題庫)
export interface ExportBackup {
	version: number; // 版本控制，方便未來升級
	timestamp: number;
	type: "full_backup" | "folder" | "deck"; // 標記這份檔案是什麼

	// 如果是 full_backup
	userProfile?: {
		displayName: string;
		points: number;
		// 不匯出敏感資訊如 email/uid
	};

	folders: ExportFolder[]; // 資料夾及其內容
	uncategorizedDecks: ExportDeck[]; // 未分類的題庫
}
