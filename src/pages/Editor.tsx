import {
	CheckSquare,
	Download,
	Folder,
	FolderOpen,
	FolderPlus,
	Plus,
	Printer,
	X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { DeckCard } from "@/components/editor/DeckCard"; // 確保您已建立此組件
import { DeckDialog } from "@/components/editor/DeckDialog";
import { FolderDialog } from "@/components/editor/FolderDialog"; // 確保您已建立此組件
import { ImportDeckDialog } from "@/components/editor/ImportDeckDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageLoading } from "@/components/shared/PageLoading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { DataService } from "@/services/data-service";
import { DeckService } from "@/services/deck-service";
import { FolderService } from "@/services/folder-service";
import { PdfService } from "@/services/pdf-service";
import type { Deck, Folder as FolderType } from "@/types/schema";

export default function Editor() {
	const { user } = useAuth();
	const [decks, setDecks] = useState<Deck[]>([]);
	const [folders, setFolders] = useState<FolderType[]>([]);
	const [loading, setLoading] = useState(true);

	// Dialogs
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingDeck, setEditingDeck] = useState<Deck | undefined>(undefined);
	const [folderDialogOpen, setFolderDialogOpen] = useState(false);
	const [editingFolder, setEditingFolder] = useState<FolderType | undefined>(
		undefined,
	);

	const [isSelectionMode, setIsSelectionMode] = useState(false);
	const [selectedDeckIds, setSelectedDeckIds] = useState<Set<string>>(
		new Set(),
	);

	const toggleSelectionMode = () => {
		if (isSelectionMode) {
			// 取消模式時清空
			setIsSelectionMode(false);
			setSelectedDeckIds(new Set());
		} else {
			setIsSelectionMode(true);
		}
	};

	// 單選/取消單選 Deck
	const toggleSelectDeck = (deckId: string) => {
		const newSet = new Set(selectedDeckIds);
		if (newSet.has(deckId)) newSet.delete(deckId);
		else newSet.add(deckId);
		setSelectedDeckIds(newSet);
	};

	// 匯出 PDF
	const handleExportPdf = async () => {
		if (selectedDeckIds.size === 0) return toast.error("請至少選擇一個題庫");

		const selectedDecks = decks.filter((d) => selectedDeckIds.has(d.id));
		toast.info("正在準備列印...");
		await PdfService.generatePrintView(selectedDecks);

		// 匯出後退出選取模式
		toggleSelectionMode();
	};

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

	const handleDeleteDeck = async (deckId: string) => {
		if (!confirm("確定要刪除這個題庫嗎？此操作無法復原。")) return;
		try {
			await DeckService.deleteDeck(deckId);
			toast.success("刪除成功");
			fetchData();
		} catch (error) {
			console.error(error);
			toast.error("刪除失敗");
		}
	};

	const handleDeleteFolder = async (folderId: string) => {
		if (!user) return;
		if (
			!confirm(
				"確定刪除資料夾？\n注意：內部的題庫不會被刪除，而是會移至「未分類」。",
			)
		)
			return;
		try {
			await DeckService.resetDecksFolder(user.uid, folderId);
			await FolderService.deleteFolder(folderId);
			toast.success("資料夾已刪除");
			fetchData();
		} catch (e) {
			console.error(e);
			toast.error("刪除失敗");
		}
	};

	const handleMoveDeck = async (deckId: string, folderId: string | null) => {
		try {
			await DeckService.moveDeckToFolder(deckId, folderId);
			toast.success("移動成功");
			fetchData();
		} catch (error) {
			console.error(error);
			toast.error("移動失敗");
		}
	};

	const openDeckDialog = (deck?: Deck) => {
		setEditingDeck(deck);
		setDialogOpen(true);
	};

	const openFolderDialog = (folder?: FolderType) => {
		setEditingFolder(folder);
		setFolderDialogOpen(true);
	};

	const handleFolderSubmit = async (data: {
		name: string;
		color: string;
		isPublic: boolean;
	}) => {
		if (!user) return;
		try {
			if (editingFolder) {
				await FolderService.updateFolder(editingFolder.id, data);
				toast.success("資料夾已更新");
			} else {
				await FolderService.createFolder(
					user.uid,
					data.name,
					data.color,
					data.isPublic,
				);
				toast.success("資料夾已建立");
			}
			fetchData();
		} catch (error) {
			console.error(error);
			toast.error("操作失敗");
		}
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
				<div className="flex gap-2 flex-wrap">
					{isSelectionMode ? (
						<>
							<Button
								variant="default"
								onClick={handleExportPdf}
								className="bg-purple-600 hover:bg-purple-700"
							>
								<Printer className="mr-2 h-4 w-4" /> 列印 / 轉 PDF (
								{selectedDeckIds.size})
							</Button>
							<Button variant="outline" onClick={toggleSelectionMode}>
								<X className="mr-2 h-4 w-4" /> 取消選取
							</Button>
						</>
					) : (
						<>
							<Button variant="outline" onClick={toggleSelectionMode}>
								<CheckSquare className="mr-2 h-4 w-4" /> 多選匯出
							</Button>
							<ImportDeckDialog onSuccess={fetchData} />
							<Button variant="outline" onClick={() => openFolderDialog()}>
								<FolderPlus className="mr-2 h-4 w-4" /> 新增資料夾
							</Button>
							<Button onClick={() => openDeckDialog()}>
								<Plus className="mr-2 h-4 w-4" /> 建立新題庫
							</Button>
						</>
					)}
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
								<div className="flex items-center gap-3">
									<div
										className={cn(
											"p-2 rounded-lg text-white shadow-sm",
											folder.color || "bg-blue-500",
										)}
									>
										<FolderOpen className="h-5 w-5" />
									</div>

									<div className="flex flex-col">
										<div className="flex items-center gap-2">
											<h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
												{folder.name}
											</h3>
											{folder.isPublic && (
												<Badge
													variant="secondary"
													className="text-[10px] bg-sky-100 text-sky-700 h-5 px-1.5"
												>
													公開
												</Badge>
											)}
										</div>
										<span className="text-xs text-muted-foreground">
											{folderDecks.length} 個題庫
										</span>
									</div>
								</div>

								<div className="flex gap-2">
									<Button
										variant="ghost"
										size="sm"
										onClick={() =>
											user && DataService.exportFolder(user.uid, folder)
										}
										title="匯出此資料夾"
									>
										<Download className="h-4 w-4 text-slate-500" />
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => openFolderDialog(folder)}
									>
										編輯
									</Button>
									<Button
										variant="ghost"
										size="sm"
										className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
										onClick={() => handleDeleteFolder(folder.id)}
									>
										刪除
									</Button>
								</div>
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
											onEdit={() => openDeckDialog(deck)}
											onDelete={() => handleDeleteDeck(deck.id)}
											onMove={handleMoveDeck}
											isSelectionMode={isSelectionMode}
											isSelected={selectedDeckIds.has(deck.id)}
											onToggleSelect={() => toggleSelectDeck(deck.id)}
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
						<div className="flex items-center gap-2 border-b pb-2 dark:border-slate-800 mt-8">
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
									onEdit={() => openDeckDialog(deck)}
									onDelete={() => handleDeleteDeck(deck.id)}
									onMove={handleMoveDeck}
									isSelectionMode={isSelectionMode}
									isSelected={selectedDeckIds.has(deck.id)}
									onToggleSelect={() => toggleSelectDeck(deck.id)}
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

			<FolderDialog
				open={folderDialogOpen}
				onOpenChange={setFolderDialogOpen}
				folder={editingFolder}
				onSubmit={handleFolderSubmit}
			/>
		</div>
	);
}
