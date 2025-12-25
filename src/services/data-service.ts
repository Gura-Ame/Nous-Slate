import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ExportBackup, ExportDeck, ExportFolder } from "@/types/export";
import type { Deck, Folder } from "@/types/schema";
import { CardService } from "./card-service";
import { DeckService } from "./deck-service";
import { FolderService } from "./folder-service";

export const DataService = {
	// --- Helper: Download JSON file ---
	downloadJson: (data: object, filename: string) => {
		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `${filename}_${new Date().toISOString().split("T")[0]}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	},

	// --- 1. Export Logic ---

	// Export single deck (including cards)
	_exportDeckData: async (deck: Deck): Promise<ExportDeck> => {
		const cards = await CardService.getCardsByDeck(deck.id);
		return {
			title: deck.title,
			description: deck.description,
			tags: deck.tags,
			isPublic: deck.isPublic,
			cards: cards.map((c) => ({
				type: c.type,
				content: c.content,
			})),
		};
	},

	// Export single folder (including decks and cards)
	exportFolder: async (userId: string, folder: Folder) => {
		// 1. Find all decks under this folder
		const decksRef = collection(db, "decks");
		const q = query(
			decksRef,
			where("ownerId", "==", userId),
			where("folderId", "==", folder.id),
		);
		const snap = await getDocs(q);
		const decks = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Deck);

		// 2. Recursively fetch cards for each deck
		const exportDecks = await Promise.all(
			decks.map((d) => DataService._exportDeckData(d)),
		);

		const data: ExportBackup = {
			version: 1,
			timestamp: Date.now(),
			type: "folder",
			folders: [
				{
					name: folder.name,
					color: folder.color || "bg-blue-500",
					isPublic: folder.isPublic,
					decks: exportDecks,
				},
			],
			uncategorizedDecks: [],
		};

		DataService.downloadJson(data, `Folder_${folder.name}`);
	},

	// Export full backup (all folders + uncategorized decks)
	exportFullBackup: async (userId: string) => {
		// 1. Get all folders
		const folders = await FolderService.getUserFolders(userId);

		// 2. Get all decks
		const allDecks = await DeckService.getUserDecks(userId);

		// 3. Assemble folder structure
		const exportFolders: ExportFolder[] = [];
		for (const folder of folders) {
			// Filter decks belonging to this folder
			const decksInFolder = allDecks.filter((d) => d.folderId === folder.id);
			const exportDecks = await Promise.all(
				decksInFolder.map((d) => DataService._exportDeckData(d)),
			);
			exportFolders.push({
				name: folder.name,
				color: folder.color || "bg-blue-500",
				isPublic: folder.isPublic,
				decks: exportDecks,
			});
		}

		// 4. Process uncategorized decks
		const uncategorized = allDecks.filter((d) => !d.folderId);
		const exportUncategorized = await Promise.all(
			uncategorized.map((d) => DataService._exportDeckData(d)),
		);

		const data: ExportBackup = {
			version: 1,
			timestamp: Date.now(),
			type: "full_backup",
			folders: exportFolders,
			uncategorizedDecks: exportUncategorized,
		};

		DataService.downloadJson(data, "NousSlate_Backup");
	},

	// --- 2. Import Logic ---
	importData: async (userId: string, jsonString: string) => {
		// 1. Parse JSON first, don't assert ExportBackup yet for flexibility
		const data = JSON.parse(jsonString);

		// Process folders (check for folders property)
		if ("folders" in data && Array.isArray(data.folders)) {
			// Now that folders exist, treat as ExportBackup
			const backup = data as ExportBackup;
			for (const folder of backup.folders) {
				const newFolder = await FolderService.createFolder(
					userId,
					folder.name,
					folder.color,
					folder.isPublic,
				);

				if (folder.decks) {
					for (const deck of folder.decks) {
						await DataService._importDeck(userId, deck, newFolder.id);
					}
				}
			}
		}

		// Check for cards and title properties, if exists treat as single Deck import
		if ("cards" in data && "title" in data) {
			await DataService._importDeck(userId, data as ExportDeck, null);
		}
		// Check for uncategorizedDecks
		else if (
			"uncategorizedDecks" in data &&
			Array.isArray(data.uncategorizedDecks)
		) {
			const backup = data as ExportBackup;
			for (const deck of backup.uncategorizedDecks) {
				await DataService._importDeck(userId, deck, null);
			}
		}
	},

	// Internal helper: Import single Deck and its cards
	_importDeck: async (
		userId: string,
		deckData: ExportDeck,
		folderId: string | null,
	) => {
		// 1. Create Deck
		const deckRef = await DeckService.createDeck(
			userId,
			deckData.title,
			deckData.description,
		);
		const newDeckId = deckRef.id;

		// Supplement tags, public status, and folderId
		await DeckService.updateDeck(newDeckId, {
			tags: deckData.tags || [],
			isPublic: deckData.isPublic || false,
			folderId: folderId,
		});

		// 2. Create Cards
		if (deckData.cards) {
			for (const card of deckData.cards) {
				await CardService.createCard(newDeckId, card.type, card.content);
			}
		}
	},
};
