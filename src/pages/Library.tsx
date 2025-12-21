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
		<div className="container mx-auto p-8 space-y-12">
			<PageHeader
				title="探索題庫"
				description="瀏覽社群分享的教材，加入您的學習計畫。"
			>
				<div className="relative w-full md:w-80 group">
					<div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
					<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
					<Input
						placeholder="搜尋標題或標籤..."
						className="pl-9 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-slate-200 dark:border-slate-700 focus:border-primary transition-all relative z-0"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			</PageHeader>

			{/* --- 1. 公開資料夾區塊 (Liquid Glass 風格) --- */}
			{publicFolders.length > 0 && !searchTerm && (
				<div className="space-y-6 animate-in slide-in-from-top-4 duration-700">
					<div className="flex items-center justify-between">
						<h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
							<div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
								<Folder className="h-5 w-5" />
							</div>
							精選主題資料夾
						</h3>
						{activeFolderId && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setSearchParams({})}
								className="text-muted-foreground hover:text-primary hover:bg-primary/5"
							>
								顯示全部
							</Button>
						)}
					</div>

					<div className="grid gap-6 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
						{publicFolders.map((folder) => {
							const isActive = activeFolderId === folder.id;
							return (
								<button
									type="button"
									key={folder.id}
									onClick={() => toggleFolderFilter(folder.id)}
									className={cn(
										// 基礎樣式：毛玻璃、圓角、過渡
										"relative group flex flex-col items-center justify-center p-6 rounded-3xl border transition-all duration-300 ease-out cursor-pointer overflow-hidden",
										// 未選取狀態
										!isActive &&
											"bg-white/40 dark:bg-slate-900/40 border-white/50 dark:border-white/10 backdrop-blur-xl shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-white/80 dark:hover:border-white/20",
										// 選取狀態 (Active)：發光邊框
										isActive &&
											"bg-primary/5shadow-[0_0_20px_rgba(var(--primary),0.2)] scale-[1.02]",
									)}
								>
									{/* 背景流動光暈 (Hover 時顯示) */}
									<div
										className={cn(
											"absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none",
											folder.color || "from-blue-400 to-cyan-300",
										)}
									/>

									<div
										className={cn(
											"w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300",
											folder.color || "bg-blue-500",
										)}
									>
										<Folder className="h-7 w-7 drop-shadow-md" />
									</div>

									<span className="font-bold text-slate-700 dark:text-slate-200 text-center truncate w-full px-1 text-sm tracking-wide group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
										{folder.name}
									</span>
								</button>
							);
						})}
					</div>
				</div>
			)}

			{/* --- 2. 題庫列表區塊 --- */}
			<div className="space-y-6">
				<h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-10 flex items-center gap-2">
					{activeFolderId ? "資料夾內容" : "最新公開題庫"}
					{filteredDecks.length > 0 && (
						<Badge
							variant="secondary"
							className="ml-2 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
						>
							{filteredDecks.length}
						</Badge>
					)}
				</h3>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{loading ? (
						Array.from({ length: 8 }).map((_vaule, id) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton
							<Skeleton key={id} className="h-64 w-full rounded-3xl" />
						))
					) : filteredDecks.length === 0 ? (
						<div className="col-span-full py-20 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
							<BookOpen className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
							<p className="text-xl font-medium">
								{activeFolderId ? "此資料夾中沒有題庫" : "找不到相關題庫"}
							</p>
							{activeFolderId && (
								<Button
									variant="link"
									onClick={() => setSearchParams({})}
									className="mt-2 text-primary"
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
									// 玻璃擬態卡片樣式
									className="flex flex-col h-full rounded-3xl border-white/50 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
								>
									<CardHeader className="space-y-4 pb-3">
										<div className="flex justify-between items-start gap-3">
											<div className="space-y-2 flex-1 min-w-0">
												{/* 
                                                    ▼▼▼ 標題修復 ▼▼▼
                                                    使用 line-clamp-2 限制兩行
                                                    使用 break-words 強制長單字換行
                                                    增加 min-h-[3.5rem] 確保對齊
                                                */}
												<CardTitle
													className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2 wrap-break-word leading-snug min-h-14"
													title={deck.title}
												>
													{deck.title}
												</CardTitle>
												{/* ▲▲▲▲▲▲▲▲▲▲▲▲▲▲ */}

												<div className="flex flex-wrap gap-1.5 h-6 overflow-hidden">
													{deck.tags && deck.tags.length > 0 ? (
														deck.tags.map((tag) => (
															<Badge
																key={tag}
																variant="secondary"
																className="text-[10px] px-2 py-0.5 font-normal bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md"
															>
																#{tag}
															</Badge>
														))
													) : (
														<Badge
															variant="outline"
															className="text-[10px] px-2 py-0.5 font-normal text-muted-foreground border-dashed border-slate-300"
														>
															未分類
														</Badge>
													)}
												</div>
											</div>

											<Button
												variant="ghost"
												size="sm"
												className={cn(
													"h-8 px-2 shrink-0 transition-colors rounded-full",
													isSubscribed
														? "text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100"
														: "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800",
												)}
												onClick={(e) => {
													e.preventDefault();
													handleToggleSub(deck);
												}}
											>
												<Star
													className={cn(
														"h-5 w-5 mr-1 transition-transform active:scale-125",
														isSubscribed && "fill-current",
													)}
												/>
												<span className="text-sm font-bold">
													{deck.stats.subscribers || 0}
												</span>
											</Button>
										</div>
									</CardHeader>

									<CardContent className="flex-1 pt-0">
										<p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 min-h-12 leading-relaxed">
											{deck.description || "這個題庫沒有描述。"}
										</p>
									</CardContent>

									<CardFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex justify-between items-center text-sm">
										<div className="flex items-center text-slate-500 dark:text-slate-400 font-medium">
											<UserIcon className="h-3.5 w-3.5 mr-2 opacity-70" />
											<OwnerInfo userId={deck.ownerId} showAvatar={false} />
										</div>

										<Link to={`/quiz/${deck.id}`}>
											<Button
												size="sm"
												className="gap-2 shadow-sm rounded-full px-4 hover:scale-105 transition-transform"
											>
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
