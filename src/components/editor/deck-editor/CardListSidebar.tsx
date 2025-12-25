import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
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
	const { t } = useTranslation();
	return (
		<aside className="w-80 border-r bg-white dark:bg-slate-900 flex flex-col h-full overflow-hidden">
			<ScrollArea className="h-full">
				<div className="p-4 space-y-3">
					{loading ? (
						Array.from({ length: 5 }).map((_, i) => (
							<Skeleton
								// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton indices are safe here
								key={`skeleton-${i}`} // Simplified key
								className="h-16 w-full"
							/>
						))
					) : cards.length === 0 ? (
						<div className="text-center py-10 text-slate-400 text-sm">
							{t("card_list.empty", "No cards yet")}
						</div>
					) : (
						cards.map((card) => (
							// biome-ignore lint/a11y/useSemanticElements: Using div to avoid nested buttons (delete button) causing Hydration Error
							<div
								key={card.id}
								role="button"
								tabIndex={0}
								onClick={() => onSelect(card)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										onSelect(card);
									}
								}}
								className={cn(
									"w-full text-left group flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary",
									editingCardId === card.id
										? "border-primary bg-primary/5 dark:bg-primary/10"
										: "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700",
								)}
							>
								<div className="overflow-hidden flex-1">
									<div className="font-bold text-lg truncate pr-2">
										{card.type === "term" ||
										card.type === "flashcard" ||
										card.type === "dictation"
											? card.content.stem
											: card.type === "fill_blank"
												? t("card_list.type_fillblank", "Fill Blank")
												: t("card_list.type_choice", "Multiple Choice")}
									</div>
									<div className="text-xs text-muted-foreground truncate flex gap-2 items-center">
										<span className="uppercase text-[10px] border px-1 rounded bg-white dark:bg-slate-900 shrink-0">
											{card.type === "term"
												? t("card_list.indicator_term", "Z")
												: card.type === "dictation"
													? t("card_list.indicator_dictation", "D")
													: card.type === "choice"
														? t("card_list.indicator_choice", "C")
														: card.type === "fill_blank"
															? t("card_list.indicator_fillblank", "F")
															: t("card_list.indicator_flashcard", "W")}
										</span>
										<span className="truncate max-w-[140px]">
											{card.type === "term" ||
											card.type === "flashcard" ||
											card.type === "dictation"
												? card.content.meaning ||
													t("common.no_definition", "No definition")
												: card.content.stem}
										</span>
									</div>
								</div>

								<Button
									variant="ghost"
									size="icon"
									className="opacity-0 group-hover:opacity-100 h-8 w-8 text-red-500 shrink-0 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
									onClick={(e) => {
										e.stopPropagation(); // Prevent triggering onSelect
										onDelete(card.id);
									}}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						))
					)}
				</div>
			</ScrollArea>
		</aside>
	);
}
