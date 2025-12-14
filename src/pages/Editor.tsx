import {
	BookOpen,
	Globe,
	Lock as LockIcon,
	MoreVertical,
	Pen,
	Plus,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
// ▼▼▼ 這裡只引入 DeckDialog，不要引入 EditDeckDialog ▼▼▼
import { DeckDialog } from "@/components/editor/DeckDialog";
import { ImportDeckDialog } from "@/components/editor/ImportDeckDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageLoading } from "@/components/shared/PageLoading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { DeckService } from "@/services/deck-service";
import type { Deck } from "@/types/schema";

export default function Editor() {
	const { user } = useAuth();
	const [decks, setDecks] = useState<Deck[]>([]);
	const [loading, setLoading] = useState(true);

	// 控制 Dialog
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingDeck, setEditingDeck] = useState<Deck | undefined>(undefined);

	const fetchDecks = async () => {
		if (!user) return;
		setLoading(true);
		try {
			const data = await DeckService.getUserDecks(user.uid);
			setDecks(data);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchDecks();
	}, [user]);

	const handleDelete = async (deckId: string) => {
		if (!confirm("確定要刪除這個題庫嗎？")) return;
		try {
			await DeckService.deleteDeck(deckId);
			toast.success("刪除成功");
			fetchDecks();
		} catch (error) {
			toast.error("刪除失敗");
		}
	};

	// 統一開啟邏輯
	const openDialog = (deck?: Deck) => {
		setEditingDeck(deck); // undefined = 建立模式, 有值 = 編輯模式
		setDialogOpen(true);
	};

	if (loading) return <PageLoading message="讀取題庫中..." />;

	return (
		<div className="container mx-auto p-8 space-y-8">
			<PageHeader title="創作後台" description="管理您的題庫與卡片。">
				<ImportDeckDialog onSuccess={fetchDecks} />
				<Button onClick={() => openDialog()}>
					<Plus className="mr-2 h-4 w-4" /> 建立新題庫
				</Button>
			</PageHeader>

			{/* Grid List */}
			{decks.length === 0 ? (
				<div className="py-20 text-center text-slate-500 border-2 border-dashed rounded-xl">
					<p>還沒有任何題庫，開始建立吧！</p>
				</div>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{decks.map((deck) => (
						<Card
							key={deck.id}
							className="group hover:shadow-md transition-shadow flex flex-col"
						>
							<CardHeader className="flex-1">
								<div className="flex items-start justify-between">
									<div className="space-y-3 w-full pr-2">
										<div className="flex items-center gap-2 flex-wrap">
											<CardTitle className="text-xl font-bold">
												{deck.title}
											</CardTitle>
											{deck.isPublic ? (
												<Badge
													variant="secondary"
													className="text-[10px] h-5 bg-sky-100 text-sky-700 hover:bg-sky-100"
												>
													<Globe className="w-3 h-3 mr-1" /> 公開
												</Badge>
											) : (
												<Badge
													variant="secondary"
													className="text-[10px] h-5 bg-slate-100 text-slate-600 hover:bg-slate-100"
												>
													<LockIcon className="w-3 h-3 mr-1" /> 私有
												</Badge>
											)}
										</div>

										{/* Tags Display */}
										<div className="flex gap-1 flex-wrap min-h-6 items-center">
											{deck.tags && deck.tags.length > 0 ? (
												deck.tags.map((tag) => (
													<span
														key={tag}
														className="text-[10px] px-2 py-0.5 rounded-full border bg-slate-50 dark:bg-slate-900 text-slate-500"
													>
														#{tag}
													</span>
												))
											) : (
												<span className="text-[10px] text-slate-300 italic px-1 h-[22px] flex items-center">
													無標籤
												</span>
											)}
										</div>

										<CardDescription className="line-clamp-2 min-h-10">
											{deck.description || "無描述"}
										</CardDescription>
									</div>

									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 shrink-0"
											>
												<MoreVertical className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											{/* 編輯按鈕：呼叫 openDialog(deck) */}
											<DropdownMenuItem onClick={() => openDialog(deck)}>
												<Pen className="mr-2 h-4 w-4" /> 編輯資訊
											</DropdownMenuItem>
											<DropdownMenuItem
												className="text-destructive focus:text-destructive focus:bg-destructive/10"
												onClick={() => handleDelete(deck.id)}
											>
												<Trash2 className="mr-2 h-4 w-4" /> 刪除
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</CardHeader>

							<CardFooter className="pt-4 border-t bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center text-sm">
								<div className="flex items-center text-muted-foreground gap-2">
									<BookOpen className="h-4 w-4" />
									<span>{deck.stats.cardCount} 張卡片</span>
								</div>
								<Link to={`/editor/${deck.id}`}>
									<Button variant="secondary" size="sm">
										進入編輯
									</Button>
								</Link>
							</CardFooter>
						</Card>
					))}
				</div>
			)}

			{/* 單一 Dialog 實例 */}
			<DeckDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				deck={editingDeck}
				onSuccess={fetchDecks}
			/>
		</div>
	);
}
