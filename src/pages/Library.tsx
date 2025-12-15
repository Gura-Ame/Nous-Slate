import {
	BookOpen,
	Folder,
	Play,
	Search,
	Star,
	User as UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { OwnerInfo } from "@/components/shared/OwnerInfo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { DeckService } from "@/services/deck-service";
import { FolderService } from "@/services/folder-service";
import { SubService } from "@/services/sub-service";
import type { Deck, Folder as FolderType } from "@/types/schema";

export default function Library() {
	const { user } = useAuth();
	const [searchParams, setSearchParams] = useSearchParams();
	const activeFolderId = searchParams.get("folder");

	const [decks, setDecks] = useState<Deck[]>([]);
	const [publicFolders, setPublicFolders] = useState<FolderType[]>([]);
	const [filteredDecks, setFilteredDecks] = useState<Deck[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [subscribedIds, setSubscribedIds] = useState<Set<string>>(new Set());

	useEffect(() => {
		const loadData = async () => {
			try {
				const [publicDecks, foldersData, userSubs] = await Promise.all([
					DeckService.getPublicDecks(),
					FolderService.getPublicFolders(),
					user
						? SubService.getUserSubscribedIds(user.uid)
						: Promise.resolve([]),
				]);

				setDecks(publicDecks);
				setPublicFolders(foldersData);
				setSubscribedIds(new Set(userSubs));
			} catch (error) {
				console.error(error);
				toast.error("載入失敗");
			} finally {
				setLoading(false);
			}
		};
		loadData();
	}, [user]);

	useEffect(() => {
		const lowerTerm = searchTerm.toLowerCase();

		// 1. 篩選 Decks
		let filtered = decks.filter(
			(deck) =>
				deck.title.toLowerCase().includes(lowerTerm) ||
				deck.tags?.some((tag) => tag.toLowerCase().includes(lowerTerm)),
		);

		// 2. 排序
		filtered.sort(
			(a, b) => (b.stats.subscribers || 0) - (a.stats.subscribers || 0),
		);

		// 3. 資料夾過濾 (如果有選)
		if (activeFolderId) {
			filtered = filtered.filter((d) => d.folderId === activeFolderId);
		}

		setFilteredDecks(filtered);
	}, [searchTerm, decks, activeFolderId]);

	const handleToggleSub = async (deck: Deck) => {
		if (!user) return toast.error("請先登入");

		const isSub = subscribedIds.has(deck.id);
		const newSet = new Set(subscribedIds);
		if (isSub) newSet.delete(deck.id);
		else newSet.add(deck.id);
		setSubscribedIds(newSet);

		setDecks((prev) =>
			prev.map((d) => {
				if (d.id === deck.id) {
					return {
						...d,
						stats: {
							...d.stats,
							subscribers: d.stats.subscribers + (isSub ? -1 : 1),
						},
					};
				}
				return d;
			}),
		);

		try {
			if (isSub) {
				await SubService.unsubscribe(user.uid, deck.id);
				toast.success("已取消收藏");
			} else {
				await SubService.subscribe(user.uid, deck);
				toast.success("已收藏題庫");
			}
		} catch (_e) {
			toast.error("操作失敗");
		}
	};

	const toggleFolderFilter = (folderId: string) => {
		if (activeFolderId === folderId) {
			setSearchParams({});
		} else {
			setSearchParams({ folder: folderId });
		}
	};

	return (
		<div className="container mx-auto p-8 space-y-8">
			<PageHeader
				title="探索題庫"
				description="瀏覽社群分享的教材，加入您的學習計畫。"
			>
				<div className="relative w-full md:w-72">
					<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="搜尋標題或標籤..."
						className="pl-9 bg-white dark:bg-slate-900"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			</PageHeader>

			{/* 公開資料夾區塊 */}
			{publicFolders.length > 0 && !searchTerm && (
				<div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
							<Folder className="h-5 w-5 text-blue-500" /> 精選主題資料夾
						</h3>
						{activeFolderId && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setSearchParams({})}
								className="text-muted-foreground"
							>
								顯示全部
							</Button>
						)}
					</div>
					<div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
						{publicFolders.map((folder) => (
							<button
								type="button"
								key={folder.id}
								onClick={() => toggleFolderFilter(folder.id)}
								className={cn(
									"flex flex-col items-center justify-center p-4 rounded-xl border transition-all group cursor-pointer hover:-translate-y-1 relative overflow-hidden",
									activeFolderId === folder.id
										? "bg-slate-100 border-primary dark:bg-slate-800"
										: "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:shadow-md",
								)}
							>
								{activeFolderId === folder.id && (
									<div className="absolute inset-0 bg-primary/5 pointer-events-none" />
								)}

								<div
									className={cn(
										"w-12 h-12 rounded-full flex items-center justify-center mb-3 text-white shadow-sm group-hover:scale-110 transition-transform",
										folder.color || "bg-blue-500",
									)}
								>
									<Folder className="h-6 w-6" />
								</div>
								<span className="font-bold text-slate-700 dark:text-slate-200 text-center truncate w-full px-2 text-sm">
									{folder.name}
								</span>
							</button>
						))}
					</div>
				</div>
			)}

			<div className="space-y-4">
				<h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mt-8 flex items-center gap-2">
					{activeFolderId ? "資料夾內容" : "最新公開題庫"}
					{filteredDecks.length > 0 && (
						<Badge variant="secondary" className="ml-2">
							{filteredDecks.length}
						</Badge>
					)}
				</h3>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{loading ? (
						Array.from({ length: 8 }).map((_vaule, id) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton
							<Skeleton key={id} className="h-60 w-full rounded-xl" />
						))
					) : filteredDecks.length === 0 ? (
						<div className="col-span-full py-16 text-center text-slate-500 border-2 border-dashed rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
							<BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-300" />
							<p className="text-lg font-medium">
								{activeFolderId ? "此資料夾中沒有題庫" : "找不到相關題庫"}
							</p>
							{activeFolderId && (
								<Button
									variant="link"
									onClick={() => setSearchParams({})}
									className="mt-2"
								>
									查看所有題庫
								</Button>
							)}
						</div>
					) : (
						filteredDecks.map((deck) => {
							const isSubscribed = subscribedIds.has(deck.id);

							return (
								<Card
									key={deck.id}
									className="flex flex-col h-full hover:shadow-lg transition-all hover:-translate-y-1 duration-300 group border-slate-200 dark:border-slate-800"
								>
									<CardHeader className="space-y-3 pb-3">
										<div className="flex justify-between items-start gap-3">
											<div className="space-y-2 flex-1 min-w-0">
												<CardTitle
													className="text-xl font-bold group-hover:text-primary transition-colors truncate"
													title={deck.title}
												>
													{deck.title}
												</CardTitle>
												<div className="flex flex-wrap gap-1.5 h-6 overflow-hidden">
													{deck.tags && deck.tags.length > 0 ? (
														deck.tags.map((tag) => (
															<Badge
																key={tag}
																variant="secondary"
																className="text-[10px] px-1.5 py-0 font-normal"
															>
																#{tag}
															</Badge>
														))
													) : (
														<Badge
															variant="outline"
															className="text-[10px] px-1.5 py-0 font-normal text-muted-foreground border-dashed"
														>
															未分類
														</Badge>
													)}
												</div>
											</div>

											<Button
												variant="ghost"
												size="sm"
												className={`h-8 px-2 shrink-0 transition-colors mr-1 ${
													isSubscribed
														? "text-amber-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
														: "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
												}`}
												onClick={(e) => {
													e.preventDefault();
													handleToggleSub(deck);
												}}
											>
												<Star
													className={`h-5 w-5 mr-1 ${
														isSubscribed ? "fill-current" : ""
													}`}
												/>
												<span className="text-sm font-medium text-slate-600 dark:text-slate-400">
													{deck.stats.subscribers || 0}
												</span>
											</Button>
										</div>
									</CardHeader>

									<CardContent className="flex-1 pt-0">
										<p className="text-sm text-muted-foreground line-clamp-3 min-h-12">
											{deck.description || "這個題庫沒有描述。"}
										</p>
									</CardContent>

									<CardFooter className="pt-4 border-t bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center text-sm">
										<div className="flex items-center text-muted-foreground">
											<UserIcon className="h-3.5 w-3.5 mr-2" />
											<OwnerInfo userId={deck.ownerId} showAvatar={false} />
										</div>

										<Link to={`/quiz/${deck.id}`}>
											<Button size="sm" className="gap-2 shadow-sm">
												<Play className="h-3.5 w-3.5 fill-current" />
												開始練習
											</Button>
										</Link>
									</CardFooter>
								</Card>
							);
						})
					)}
				</div>
			</div>
		</div>
	);
}
