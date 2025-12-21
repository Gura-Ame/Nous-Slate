import {
	BookOpen,
	Check,
	Folder,
	Globe,
	Lock as LockIcon,
	MoreVertical,
	Pen,
	Play,
	Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Deck, Folder as FolderType } from "@/types/schema";

interface DeckCardProps {
	deck: Deck;
	folders: FolderType[];
	onEdit: () => void;
	onDelete: () => void;
	onMove: (deckId: string, folderId: string | null) => void;
	isSelectionMode?: boolean;
	isSelected?: boolean;
	onToggleSelect?: () => void;
}

export function DeckCard({
	deck,
	folders,
	onEdit,
	onDelete,
	onMove,
	isSelectionMode = false,
	isSelected = false,
	onToggleSelect,
}: DeckCardProps) {
	return (
		<div
			className={cn(
				"relative group transition-all duration-300 ease-out hover:-translate-y-1 cursor-default",
				isSelected ? "scale-[1.02]" : "",
			)}
			onClick={() => isSelectionMode && onToggleSelect && onToggleSelect()}
		>
			{/* 背景光暈 (裝飾用) */}
			<div
				className={cn(
					"absolute -inset-0.5 bg-gradient-to-br from-primary/30 to-blue-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500",
					isSelected && "opacity-100 from-primary to-primary",
				)}
			/>

			<Card
				className={cn(
					// ▼▼▼ 液態玻璃核心樣式：深色、統一背景 ▼▼▼
					"relative h-full flex flex-col overflow-hidden border-0 rounded-xl",
					"bg-slate-900/80 backdrop-blur-xl", // 加深背景不透明度，讓文字更清楚
					"border border-white/10 shadow-xl",
					isSelected ? "ring-2 ring-primary bg-slate-900/90" : "",
				)}
			>
				{/* 移除所有子層的背景色，讓上層的玻璃材質透下來 */}
				<CardHeader className="flex-1 pb-3 relative z-10">
					<div className="flex items-start justify-between gap-3">
						{/* 選取 Checkbox */}
						{isSelectionMode && (
							<div
								className={cn(
									"w-5 h-5 rounded flex items-center justify-center shrink-0 mt-1.5 transition-all duration-200 border",
									isSelected
										? "bg-primary border-primary text-white shadow-lg shadow-primary/40"
										: "border-slate-600 bg-slate-800/50 hover:border-slate-500",
								)}
							>
								{isSelected && <Check size={14} strokeWidth={3} />}
							</div>
						)}

						<div className="space-y-3 flex-1 min-w-0">
							<div className="flex flex-col gap-2">
								<CardTitle
									className="text-lg md:text-xl font-bold line-clamp-2 break-words leading-tight min-h-[3.5rem] text-slate-100 group-hover:text-primary transition-colors"
									title={deck.title}
								>
									{deck.title}
								</CardTitle>

								<div className="flex items-center gap-2">
									{deck.isPublic ? (
										<Badge
											variant="secondary"
											className="text-[10px] h-5 bg-sky-500/20 text-sky-300 border border-sky-500/30"
										>
											<Globe className="w-3 h-3 mr-1" /> 公開
										</Badge>
									) : (
										<Badge
											variant="secondary"
											className="text-[10px] h-5 bg-slate-700/50 text-slate-300 border border-slate-700"
										>
											<LockIcon className="w-3 h-3 mr-1" /> 私有
										</Badge>
									)}
									<Badge
										variant="outline"
										className="text-[10px] h-5 px-1.5 font-normal text-slate-400 border-slate-700"
									>
										{deck.stats.cardCount} 卡
									</Badge>
								</div>
							</div>

							<div className="flex gap-1 flex-wrap min-h-6 items-center content-start">
								{deck.tags && deck.tags.length > 0 ? (
									deck.tags.map((tag) => (
										<span
											key={tag}
											className="text-[10px] px-2 py-0.5 rounded-md border border-slate-700 bg-slate-800/50 text-slate-400"
										>
											#{tag}
										</span>
									))
								) : (
									<span className="text-[10px] text-slate-500 italic px-1 h-[22px] flex items-center">
										無標籤
									</span>
								)}
							</div>
						</div>

						{!isSelectionMode && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 shrink-0 text-slate-400 hover:text-white hover:bg-white/10"
									>
										<MoreVertical className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									className="w-48 bg-slate-900 border-slate-800 text-slate-300"
								>
									<DropdownMenuItem
										onClick={onEdit}
										className="focus:bg-slate-800 focus:text-white"
									>
										<Pen className="mr-2 h-4 w-4" /> 編輯資訊
									</DropdownMenuItem>

									<DropdownMenuSub>
										<DropdownMenuSubTrigger className="focus:bg-slate-800 focus:text-white">
											<Folder className="mr-2 h-4 w-4" /> 移動到...
										</DropdownMenuSubTrigger>
										<DropdownMenuSubContent className="w-40 bg-slate-900 border-slate-800 text-slate-300">
											<DropdownMenuItem
												onClick={() => onMove(deck.id, null)}
												className="focus:bg-slate-800 focus:text-white"
											>
												(移出資料夾)
											</DropdownMenuItem>
											{folders.length > 0 && (
												<DropdownMenuSeparator className="bg-slate-800" />
											)}
											{folders.map((f) => (
												<DropdownMenuItem
													key={f.id}
													onClick={() => onMove(deck.id, f.id)}
													disabled={deck.folderId === f.id}
													className="focus:bg-slate-800 focus:text-white"
												>
													<Folder className="mr-2 h-4 w-4 text-blue-500" />
													{f.name}
												</DropdownMenuItem>
											))}
										</DropdownMenuSubContent>
									</DropdownMenuSub>

									<DropdownMenuSeparator className="bg-slate-800" />
									<DropdownMenuItem
										className="text-red-400 focus:text-red-300 focus:bg-red-900/20"
										onClick={onDelete}
									>
										<Trash2 className="mr-2 h-4 w-4" /> 刪除
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
				</CardHeader>

				<CardContent className="flex-1 pt-0 relative z-10">
					<p className="text-sm text-slate-400 line-clamp-2 min-h-[2.5rem] leading-relaxed">
						{deck.description || "無描述"}
					</p>
				</CardContent>

				{/* ▼▼▼ Footer 修改：移除 bg-black/20，只保留邊框線 ▼▼▼ */}
				<CardFooter className="pt-3 pb-3 border-t border-white/10 flex justify-between items-center text-sm gap-2 relative z-10">
					<div className="flex items-center text-slate-500 gap-2 text-xs font-mono">
						<BookOpen className="h-3.5 w-3.5" />
						<span>{deck.stats.cardCount}</span>
					</div>

					<div className="flex items-center gap-2">
						<Link to={`/quiz/${deck.id}`}>
							<Button
								size="sm"
								className="h-8 gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 border border-emerald-500/50"
								onClick={(e) => isSelectionMode && e.preventDefault()}
							>
								<Play className="h-3 w-3 fill-current" />
								練習
							</Button>
						</Link>
						<Link to={`/editor/${deck.id}`}>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
								onClick={(e) => isSelectionMode && e.preventDefault()}
							>
								編輯
							</Button>
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
