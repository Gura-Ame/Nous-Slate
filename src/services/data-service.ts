import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ExportBackup, ExportDeck, ExportFolder } from "@/types/export";
import type { Deck, Folder } from "@/types/schema";
import { CardService } from "./card-service";
import { DeckService } from "./deck-service";
import { FolderService } from "./folder-service";

export const DataService = {
	// --- Helper: 下載 JSON 檔案 ---
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

	// --- 1. 匯出邏輯 ---

	// 匯出單一題庫 (包含卡片)
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

	// 匯出單一資料夾 (包含題庫與卡片)
	exportFolder: async (userId: string, folder: Folder) => {
		// 1. 找該資料夾下的所有 Deck
		const decksRef = collection(db, "decks");
		const q = query(
			decksRef,
			where("ownerId", "==", userId),
			where("folderId", "==", folder.id),
		);
		const snap = await getDocs(q);
		const decks = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Deck);

		// 2. 遞迴抓取每個 Deck 的卡片
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

	// 匯出完整備份 (所有資料夾 + 未分類題庫)
	exportFullBackup: async (userId: string) => {
		// 1. 獲取所有資料夾
		const folders = await FolderService.getUserFolders(userId);

		// 2. 獲取所有題庫
		const allDecks = await DeckService.getUserDecks(userId);

		// 3. 組裝資料夾結構
		const exportFolders: ExportFolder[] = [];
		for (const folder of folders) {
			// 篩選出屬於此資料夾的 Decks
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

		// 4. 處理未分類題庫
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

	// --- 2. 匯入邏輯 ---
	importData: async (userId: string, jsonString: string) => {
		// 1. 先解析 JSON，不急著斷言為 ExportBackup，保留其彈性
		const data = JSON.parse(jsonString);

		// 處理資料夾 (檢查是否有 folders 屬性)
		if ("folders" in data && Array.isArray(data.folders)) {
			// 確定有 folders 屬性後，這時再視為 ExportBackup
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

		// 檢查是否有 cards 和 title 屬性，若有則視為單一 Deck 匯入
		if ("cards" in data && "title" in data) {
			await DataService._importDeck(userId, data as ExportDeck, null);
		}
		// 檢查是否有 uncategorizedDecks
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

	// 內部使用：匯入單一 Deck 及其卡片
	_importDeck: async (
		userId: string,
		deckData: ExportDeck,
		folderId: string | null,
	) => {
		// 1. 建立 Deck
		const deckRef = await DeckService.createDeck(
			userId,
			deckData.title,
			deckData.description,
		);
		const newDeckId = deckRef.id;

		// 補上 tags, public, folderId
		await DeckService.updateDeck(newDeckId, {
			tags: deckData.tags || [],
			isPublic: deckData.isPublic || false,
			folderId: folderId,
		});

		// 2. 建立 Cards
		if (deckData.cards) {
			for (const card of deckData.cards) {
				await CardService.createCard(newDeckId, card.type, card.content);
			}
		}
	},
};
