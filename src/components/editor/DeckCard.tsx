import {
	BookOpen,
	Folder,
	FolderOpen,
	Globe,
	Lock as LockIcon,
	MoreVertical,
	Pen,
	Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
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
import type { Deck, Folder as FolderType } from "@/types/schema";

interface DeckCardProps {
	deck: Deck;
	folders: FolderType[];
	onEdit: () => void;
	onDelete: () => void;
	onMove: (deckId: string, folderId: string | null) => void;
}

export function DeckCard({
	deck,
	folders,
	onEdit,
	onDelete,
	onMove,
}: DeckCardProps) {
	return (
		<Card className="group hover:shadow-md transition-all duration-200 hover:-translate-y-1 flex flex-col border-slate-200 dark:border-slate-800">
			<CardHeader className="flex-1">
				<div className="flex items-start justify-between">
					<div className="space-y-3 w-full pr-2 min-w-0">
						<div className="flex items-center gap-2 flex-wrap">
							<CardTitle
								className="text-xl font-bold truncate max-w-full"
								title={deck.title}
							>
								{deck.title}
							</CardTitle>
							{deck.isPublic ? (
								<Badge
									variant="secondary"
									className="text-[10px] h-5 bg-sky-100 text-sky-700 hover:bg-sky-100 dark:bg-sky-900/30 dark:text-sky-300"
								>
									<Globe className="w-3 h-3 mr-1" /> 公開
								</Badge>
							) : (
								<Badge
									variant="secondary"
									className="text-[10px] h-5 bg-slate-100 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400"
								>
									<LockIcon className="w-3 h-3 mr-1" /> 私有
								</Badge>
							)}
						</div>

						{/* Tags */}
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
								<span className="text-[10px] text-slate-300 italic px-1">
									無標籤
								</span>
							)}
						</div>

						<CardDescription className="line-clamp-2 min-h-10 text-sm">
							{deck.description || "沒有描述。"}
						</CardDescription>
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 shrink-0 text-slate-400 hover:text-slate-600"
							>
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48">
							<DropdownMenuItem onClick={onEdit}>
								<Pen className="mr-2 h-4 w-4" /> 編輯資訊
							</DropdownMenuItem>

							{/* 移動選單 */}
							<DropdownMenuSub>
								<DropdownMenuSubTrigger>
									<Folder className="mr-2 h-4 w-4" /> 移動到...
								</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="w-40">
									<DropdownMenuItem onClick={() => onMove(deck.id, null)}>
										<FolderOpen className="mr-2 h-4 w-4 text-slate-400" />
										(移出資料夾)
									</DropdownMenuItem>
									{folders.length > 0 && <DropdownMenuSeparator />}
									{folders.map((f) => (
										<DropdownMenuItem
											key={f.id}
											onClick={() => onMove(deck.id, f.id)}
											disabled={deck.folderId === f.id}
										>
											<Folder className="mr-2 h-4 w-4 text-blue-500" />
											{f.name}
										</DropdownMenuItem>
									))}
								</DropdownMenuSubContent>
							</DropdownMenuSub>

							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="text-destructive focus:text-destructive focus:bg-destructive/10"
								onClick={onDelete}
							>
								<Trash2 className="mr-2 h-4 w-4" /> 刪除
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>

			<CardContent className="py-0" />

			<CardFooter className="pt-4 border-t bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center text-sm rounded-b-xl">
				<div className="flex items-center text-muted-foreground gap-2">
					<BookOpen className="h-4 w-4" />
					<span>{deck.stats.cardCount} 張卡片</span>
				</div>
				<Link to={`/editor/${deck.id}`}>
					<Button variant="secondary" size="sm" className="h-8">
						進入編輯
					</Button>
				</Link>
			</CardFooter>
		</Card>
	);
}
