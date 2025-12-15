import { Folder, FolderOpen, FolderPlus, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { DeckCard } from "@/components/editor/DeckCard"; // 引入剛建立的組件
import { DeckDialog } from "@/components/editor/DeckDialog";
import { ImportDeckDialog } from "@/components/editor/ImportDeckDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageLoading } from "@/components/shared/PageLoading";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/hooks/useAuth";
import { DeckService } from "@/services/deck-service";
import { FolderService } from "@/services/folder-service";
import type { Deck, Folder as FolderType } from "@/types/schema";

export default function Editor() {
	const { user } = useAuth();
	const [decks, setDecks] = useState<Deck[]>([]);
	const [folders, setFolders] = useState<FolderType[]>([]);
	const [loading, setLoading] = useState(true);

	// Dialog 控制
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingDeck, setEditingDeck] = useState<Deck | undefined>(undefined);

	// 1. 載入資料 (Deck + Folders)
	const fetchData = useCallback(async () => {
		if (!user) return;
		setLoading(true);
		try {
			const [decksData, foldersData] = await Promise.all([
				DeckService.getUserDecks(user.uid),
				FolderService.getUserFolders(user.uid),
			]);
			setDecks(decksData);
			setFolders(foldersData);
		} catch (error) {
			console.error(error);
			toast.error("載入失敗");
		} finally {
			setLoading(false);
		}
	}, [user]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// --- Handlers ---

	// 刪除題庫
	const handleDeleteDeck = async (deckId: string) => {
		if (!confirm("確定要刪除這個題庫嗎？此操作無法復原。")) return;
		try {
			await DeckService.deleteDeck(deckId);
			toast.success("刪除成功");
			fetchData();
		} catch (_error) {
			toast.error("刪除失敗");
		}
	};

	// 建立資料夾
	const handleCreateFolder = async () => {
		if (!user) return;
		const name = prompt("請輸入資料夾名稱：");
		if (!name || !name.trim()) return;

		try {
			await FolderService.createFolder(user.uid, name.trim());
			toast.success("資料夾已建立");
			fetchData();
		} catch (_e) {
			toast.error("建立失敗");
		}
	};

	// 刪除資料夾
	const handleDeleteFolder = async (folderId: string) => {
		if (
			!confirm(
				"確定刪除資料夾？\n注意：內部的題庫不會被刪除，而是會移至「未分類」。",
			)
		)
			return;
		try {
			// 先將內部 Deck 移出 (Reset folderId)
			await DeckService.resetDecksFolder(folderId);
			// 再刪除資料夾
			await FolderService.deleteFolder(folderId);
			toast.success("資料夾已刪除");
			fetchData();
		} catch (_e) {
			toast.error("刪除失敗");
		}
	};

	// 移動題庫
	const handleMoveDeck = async (deckId: string, folderId: string | null) => {
		try {
			await DeckService.moveDeckToFolder(deckId, folderId);
			toast.success("移動成功");
			fetchData();
		} catch (_e) {
			toast.error("移動失敗");
		}
	};

	// 開啟編輯/新增 Dialog
	const openDialog = (deck?: Deck) => {
		setEditingDeck(deck);
		setDialogOpen(true);
	};

	// --- Render Helpers ---

	const getDecksInFolder = (folderId: string | null) => {
		return decks.filter(
			(d) => d.folderId === folderId || (!d.folderId && folderId === null),
		);
	};

	if (loading) return <PageLoading message="讀取資料中..." />;

	return (
		<div className="container mx-auto p-8 space-y-10">
			<PageHeader title="創作後台" description="管理您的題庫與資料夾分類。">
				<div className="flex gap-2">
					<ImportDeckDialog onSuccess={fetchData} />
					<Button variant="outline" onClick={handleCreateFolder}>
						<FolderPlus className="mr-2 h-4 w-4" /> 新增資料夾
					</Button>
					<Button onClick={() => openDialog()}>
						<Plus className="mr-2 h-4 w-4" /> 建立新題庫
					</Button>
				</div>
			</PageHeader>

			{/* 空狀態 */}
			{decks.length === 0 && folders.length === 0 && (
				<div className="py-20 text-center text-slate-500 border-2 border-dashed rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
					<p>還沒有任何題庫，點擊右上角開始建立吧！</p>
				</div>
			)}

			<div className="space-y-12">
				{/* 1. 渲染資料夾區域 */}
				{folders.map((folder) => {
					const folderDecks = getDecksInFolder(folder.id);
					return (
						<section key={folder.id} className="space-y-4 animate-in fade-in">
							<div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
								<div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
									<FolderOpen className="h-5 w-5 text-blue-500" />
									<h3 className="text-xl font-bold">{folder.name}</h3>
									<span className="text-sm text-muted-foreground ml-2">
										({folderDecks.length})
									</span>
								</div>
								<Button
									variant="ghost"
									size="sm"
									className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-8"
									onClick={() => handleDeleteFolder(folder.id)}
								>
									刪除資料夾
								</Button>
							</div>

							{folderDecks.length === 0 ? (
								<div className="text-sm text-muted-foreground py-8 text-center bg-slate-50/30 dark:bg-slate-900/30 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
									此資料夾是空的，請將題庫移動至此。
								</div>
							) : (
								<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
									{folderDecks.map((deck) => (
										<DeckCard
											key={deck.id}
											deck={deck}
											folders={folders}
											onEdit={() => openDialog(deck)}
											onDelete={() => handleDeleteDeck(deck.id)}
											onMove={handleMoveDeck}
										/>
									))}
								</div>
							)}
						</section>
					);
				})}

				{/* 2. 未分類區域 */}
				{getDecksInFolder(null).length > 0 && (
					<section className="space-y-4 animate-in fade-in">
						<div className="flex items-center gap-2 border-b pb-2 dark:border-slate-800">
							<Folder className="h-5 w-5 text-slate-400" />
							<h3 className="text-xl font-bold text-slate-600 dark:text-slate-300">
								未分類題庫
							</h3>
							<span className="text-sm text-muted-foreground ml-2">
								({getDecksInFolder(null).length})
							</span>
						</div>
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{getDecksInFolder(null).map((deck) => (
								<DeckCard
									key={deck.id}
									deck={deck}
									folders={folders}
									onEdit={() => openDialog(deck)}
									onDelete={() => handleDeleteDeck(deck.id)}
									onMove={handleMoveDeck}
								/>
							))}
						</div>
					</section>
				)}
			</div>

			{/* Dialogs */}
			<DeckDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				deck={editingDeck}
				onSuccess={fetchData}
			/>
		</div>
	);
}
