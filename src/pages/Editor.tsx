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
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { DeckDialog } from "@/components/editor/DeckDialog";
import { FolderDialog } from "@/components/editor/FolderDialog";
import { ImportDeckDialog } from "@/components/editor/ImportDeckDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { DeckCard } from "@/components/shared/DeckCard";
import { PageLoading } from "@/components/shared/PageLoading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassPage } from "@/components/ui/glass/GlassPage";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { DataService } from "@/services/data-service";
import { DeckService } from "@/services/deck-service";
import { FolderService } from "@/services/folder-service";
import { PdfService } from "@/services/pdf-service";
import type { Deck, Folder as FolderType } from "@/types/schema";

export default function Editor() {
	const { t } = useTranslation();
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
			// Clear on cancel
			setIsSelectionMode(false);
			setSelectedDeckIds(new Set());
		} else {
			setIsSelectionMode(true);
		}
	};

	// Select/Deselect single deck
	const toggleSelectDeck = (deckId: string) => {
		const newSet = new Set(selectedDeckIds);
		if (newSet.has(deckId)) newSet.delete(deckId);
		else newSet.add(deckId);
		setSelectedDeckIds(newSet);
	};

	// Export PDF
	const handleExportPdf = async () => {
		if (selectedDeckIds.size === 0)
			return toast.error(
				t("editor.select_at_least_one", "Please select at least one deck."),
			);

		const selectedDecks = decks.filter((d) => selectedDeckIds.has(d.id));
		toast.info(t("common.loading", "Preparing for print..."));
		await PdfService.generatePrintView(selectedDecks);

		// Exit selection mode after export
		toggleSelectionMode();
	};

	// 1. Load Data (Deck + Folders)
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
			toast.error(t("common.error_loading", "Loading failed"));
		} finally {
			setLoading(false);
		}
	}, [user, t]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// --- Handlers ---

	const handleDeleteDeck = async (deckId: string) => {
		if (
			!confirm(
				t(
					"editor.confirm_delete_deck",
					"Are you sure you want to delete this deck? This action cannot be undone.",
				),
			)
		)
			return;
		try {
			await DeckService.deleteDeck(deckId);
			toast.success(t("editor.delete_success", "Deleted successfully"));
			fetchData();
		} catch (error) {
			console.error(error);
			toast.error(t("common.error", "Delete failed"));
		}
	};

	const handleDeleteFolder = async (folderId: string) => {
		if (!user) return;
		if (
			!confirm(
				t(
					"editor.delete_folder_confirm",
					"Are you sure you want to delete this folder?\nNote: Decks inside will NOT be deleted; they will be moved to 'Uncategorized'.",
				),
			)
		)
			return;
		try {
			await DeckService.resetDecksFolder(user.uid, folderId);
			await FolderService.deleteFolder(folderId);
			toast.success(t("editor.delete_success", "Folder deleted"));
			fetchData();
		} catch (e) {
			console.error(e);
			toast.error(t("common.error", "Delete failed"));
		}
	};

	const handleMoveDeck = async (deckId: string, folderId: string | null) => {
		try {
			await DeckService.moveDeckToFolder(deckId, folderId);
			toast.success(t("editor.move_success", "Moved successfully"));
			fetchData();
		} catch (error) {
			console.error(error);
			toast.error(t("common.error", "Move failed"));
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
				toast.success(t("common.save", "Folder updated"));
			} else {
				await FolderService.createFolder(
					user.uid,
					data.name,
					data.color,
					data.isPublic,
				);
				toast.success(t("common.save", "Folder created"));
			}
			fetchData();
		} catch (error) {
			console.error(error);
			toast.error(t("common.error", "Operation failed"));
		}
	};

	// --- Render Helpers ---

	const getDecksInFolder = (folderId: string | null) => {
		return decks.filter(
			(d) => d.folderId === folderId || (!d.folderId && folderId === null),
		);
	};

	if (loading)
		return <PageLoading message={t("common.loading", "Loading data...")} />;

	return (
		<GlassPage className="flex justify-center">
			<div className="container p-8 space-y-10 max-w-7xl">
				<PageHeader
					title={t("editor.title", "Creator Studio")}
					description={t(
						"editor.subtitle",
						"Manage your decks and organize them into folders.",
					)}
				>
					<div className="flex gap-2 flex-wrap">
						{isSelectionMode ? (
							<>
								<GlassButton
									variant="primary"
									onClick={handleExportPdf}
									className="bg-purple-600 hover:bg-purple-700 border-none text-white shadow-purple-500/20"
								>
									<Printer className="mr-2 h-4 w-4" />{" "}
									{t("editor.print_pdf", "Print / PDF")} ({selectedDeckIds.size}
									)
								</GlassButton>
								<Button variant="outline" onClick={toggleSelectionMode}>
									<X className="mr-2 h-4 w-4" />{" "}
									{t("editor.cancel_select", "Cancel Selection")}
								</Button>
							</>
						) : (
							<>
								<Button variant="outline" onClick={toggleSelectionMode}>
									<CheckSquare className="mr-2 h-4 w-4" />{" "}
									{t("editor.multi_select_export", "Select to Export")}
								</Button>
								<ImportDeckDialog onSuccess={fetchData} />
								<Button variant="outline" onClick={() => openFolderDialog()}>
									<FolderPlus className="mr-2 h-4 w-4" />{" "}
									{t("editor.new_folder", "New Folder")}
								</Button>
								<GlassButton onClick={() => openDeckDialog()}>
									<Plus className="mr-2 h-4 w-4" />{" "}
									{t("editor.new_deck", "New Deck")}
								</GlassButton>
							</>
						)}
					</div>
				</PageHeader>

				{/* Empty State */}
				{decks.length === 0 && folders.length === 0 && (
					<div className="py-20 text-center text-slate-500 border-2 border-dashed rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
						<p>{t("editor.no_decks", "No decks yet.")}</p>
					</div>
				)}

				<div className="space-y-12">
					{/* 1. Render Folders Area */}
					{folders.map((folder) => {
						const folderDecks = getDecksInFolder(folder.id);
						return (
							<section
								key={folder.id}
								className="space-y-4 animate-in fade-in duration-500"
							>
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
														Public
													</Badge>
												)}
											</div>
											<span className="text-xs text-muted-foreground">
												{t("editor.folder_count", {
													count: folderDecks.length,
												})}
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
											title={t("editor.export_folder", "Export This Folder")}
										>
											<Download className="h-4 w-4 text-slate-500" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => openFolderDialog(folder)}
										>
											{t("common.edit", "Edit")}
										</Button>
										<Button
											variant="ghost"
											size="sm"
											className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
											onClick={() => handleDeleteFolder(folder.id)}
										>
											{t("common.delete", "Delete")}
										</Button>
									</div>
								</div>

								{folderDecks.length === 0 ? (
									<div className="text-sm text-muted-foreground py-8 text-center bg-slate-50/30 dark:bg-slate-900/30 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
										{t("editor.empty_folder", "This folder is empty.")}
									</div>
								) : (
									<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
										{folderDecks.map((deck) => (
											<DeckCard
												key={deck.id}
												deck={deck}
												variant="editor"
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

					{/* 2. Uncategorized Area */}
					{getDecksInFolder(null).length > 0 && (
						<section className="space-y-4 animate-in fade-in duration-700">
							<div className="flex items-center gap-2 border-b pb-2 dark:border-slate-800 mt-8">
								<Folder className="h-5 w-5 text-slate-400" />
								<h3 className="text-xl font-bold text-slate-600 dark:text-slate-300">
									{t("editor.uncategorized_decks", "Uncategorized Decks")}
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
										variant="editor"
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
		</GlassPage>
	);
}
