import type { CardContent, CardType } from "./schema";

// Smallest unit of export: Card
export interface ExportCard {
	type: CardType;
	content: CardContent;
}

// Exported Deck
export interface ExportDeck {
	title: string;
	description?: string;
	tags: string[];
	isPublic: boolean;
	cards: ExportCard[];
}

// Exported Folder (including decks within)
export interface ExportFolder {
	name: string;
	color: string;
	isPublic: boolean;
	decks: ExportDeck[];
}

// Full Export Backup (includes settings, all folders, and uncategorized decks)
export interface ExportBackup {
	version: number; // Version control for future upgrades
	timestamp: number;
	type: "full_backup" | "folder";
	// If full_backup
	userProfile?: {
		displayName: string;
		points: number;
		// Do not export sensitive info like email/uid
	};

	folders: ExportFolder[]; // Folders and their content
	uncategorizedDecks: ExportDeck[]; // Uncategorized decks
}
