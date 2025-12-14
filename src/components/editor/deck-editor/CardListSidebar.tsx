// src/components/editor/deck-editor/CardListSidebar.tsx

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Card } from "@/types/schema";

interface CardListSidebarProps {
	cards: Card[];
	loading: boolean;
	editingCardId: string | null;
	onSelect: (card: Card) => void;
	onDelete: (cardId: string) => void;
}

export function CardListSidebar({
	cards,
	loading,
	editingCardId,
	onSelect,
	onDelete,
}: CardListSidebarProps) {
	return (
		<aside className="w-80 border-r bg-white dark:bg-slate-900 flex flex-col h-full">
			<ScrollArea className="flex-1 p-4">
				<div className="space-y-3">
					{loading ? (
						Array.from({ length: 5 }).map((_, i) => (
							<Skeleton
								key={`skeleton-${Math.random()}-${i}`}
								className="h-16 w-full"
							/>
						))
					) : cards.length === 0 ? (
						<div className="text-center py-10 text-slate-400 text-sm">
							暫無卡片
						</div>
					) : (
						cards.map((card) => (
							<button
								type="button" // 務必加上 type="button" 避免觸發 form submit
								key={card.id}
								onClick={() => onSelect(card)}
								className={cn(
									// 加入 w-full text-left 確保排版不變
									"w-full text-left group flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer",
									editingCardId === card.id
										? "border-primary bg-primary/5 dark:bg-primary/10"
										: "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700",
								)}
							>
								<div className="overflow-hidden flex-1">
									<div className="font-bold text-lg truncate pr-2">
										{/* 根據題型顯示標題 */}
										{card.type === "term" || card.type === "flashcard"
											? card.content.stem
											: card.type === "fill_blank"
												? "填空題"
												: "選擇題"}
									</div>
									<div className="text-xs text-muted-foreground truncate flex gap-2 items-center">
										<span className="uppercase text-[10px] border px-1 rounded bg-white dark:bg-slate-900 shrink-0">
											{card.type === "term"
												? "國"
												: card.type === "choice"
													? "選"
													: card.type === "fill_blank"
														? "填"
														: "英"}
										</span>
										<span className="truncate max-w-[140px]">
											{card.type === "term" || card.type === "flashcard"
												? card.content.meaning || "無釋義"
												: card.content.stem}
										</span>
									</div>
								</div>

								<Button
									variant="ghost"
									size="icon"
									className="opacity-0 group-hover:opacity-100 h-8 w-8 text-red-500 shrink-0"
									onClick={(e) => {
										e.stopPropagation(); // 防止冒泡觸發 onSelect
										onDelete(card.id);
									}}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</button>
						))
					)}
				</div>
			</ScrollArea>
		</aside>
	);
}
