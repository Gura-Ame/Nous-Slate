import {
	CheckCircle2,
	Circle,
	Edit,
	FolderInput,
	MoreVertical,
	Play,
	Settings,
	Star,
	Trash,
	User as UserIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { OwnerInfo } from "@/components/shared/OwnerInfo";
import { Badge } from "@/components/ui/badge";
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
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { cn } from "@/lib/utils";
import type { Deck, Folder } from "@/types/schema";

interface DeckCardProps {
	deck: Deck;
	// Context props
	variant?: "library" | "editor" | "profile";

	// Library Props
	isSubscribed?: boolean;
	onToggleSub?: (deck: Deck) => void;

	// Editor Props
	folders?: Folder[];
	onEdit?: (deck: Deck) => void;
	onDelete?: (deck: Deck) => void;
	onMove?: (deckId: string, folderId: string | null) => void;

	// Selection Mode
	isSelectionMode?: boolean;
	isSelected?: boolean;
	onToggleSelect?: () => void;
}

export function DeckCard({
	deck,
	variant = "library",
	isSubscribed = false,
	onToggleSub,
	folders = [],
	onEdit,
	onDelete,
	onMove,
	isSelectionMode = false,
	isSelected = false,
	onToggleSelect,
}: DeckCardProps) {
	const { t } = useTranslation();

	const handleCardClick = (e: React.MouseEvent) => {
		if (isSelectionMode && onToggleSelect) {
			e.preventDefault();
			onToggleSelect();
		}
	};

	return (
		<GlassCard
			interactive
			className={cn(
				"flex flex-col h-full group relative",
				isSelected && "ring-2 ring-primary border-primary/50 bg-primary/5",
			)}
			onClick={handleCardClick}
		>
			{/* Selection Overlay/Indicator */}
			{isSelectionMode && (
				<div className="absolute top-4 right-4 z-20">
					{isSelected ? (
						<CheckCircle2 className="h-6 w-6 text-primary fill-white dark:fill-slate-900" />
					) : (
						<Circle className="h-6 w-6 text-slate-300 dark:text-slate-600" />
					)}
				</div>
			)}

			<div className="p-6 flex flex-col h-full space-y-4">
				{/* 1. Header: Title & Meta */}
				<div className="flex justify-between items-start gap-3">
					<div className="space-y-2 flex-1 min-w-0">
						<h3
							className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors line-clamp-2 leading-snug min-h-[3.5rem]"
							title={deck.title}
						>
							{deck.title}
						</h3>

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
									{t("library.uncategorized", "Uncategorized")}
								</Badge>
							)}
						</div>
					</div>

					{/* Library Action: Subscribe Toggle */}
					{variant === "library" && onToggleSub && (
						<GlassButton
							variant="ghost"
							size="sm"
							className={cn(
								"h-8 px-2 shrink-0 rounded-full",
								isSubscribed
									? "text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20"
									: "text-slate-400 hover:text-slate-600",
							)}
							onClick={(e) => {
								e.stopPropagation();
								e.preventDefault();
								onToggleSub(deck);
							}}
						>
							<Star
								className={cn(
									"h-5 w-5 mr-1 transition-transform active:scale-125",
									isSubscribed && "fill-yellow-400",
								)}
							/>
							<span className="text-sm font-bold">
								{deck.stats.subscribers || 0}
							</span>
						</GlassButton>
					)}
				</div>

				{/* 2. Content: Description */}
				<div className="flex-1">
					<p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
						{deck.description ||
							t("common.no_description", "No description available.")}
					</p>
				</div>

				{/* 3. Footer: Actions */}
				<div className="pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center text-sm">
					{/* Left: Owner Info (Library) or Created Date (Editor) */}
					<div className="flex items-center text-slate-500 dark:text-slate-400 font-medium">
						{variant === "library" || variant === "profile" ? (
							<>
								{/* Removed opacity-70 for cleaner look */}
								<UserIcon className="h-3.5 w-3.5 mr-2 text-slate-400" />
								<OwnerInfo userId={deck.ownerId} showAvatar={false} />
							</>
						) : (
							<span className="text-xs opacity-70">
								{typeof deck.createdAt?.toDate === "function"
									? deck.createdAt.toDate().toLocaleDateString()
									: new Date(
											deck.createdAt as unknown as string | number | Date,
										).toLocaleDateString()}
							</span>
						)}
					</div>

					{/* Right: Primary Action */}
					{/* Right: Primary Action */}
					{!isSelectionMode && (
						<div className="flex gap-2 items-center">
							{/* Always show Play button if not selecting */}
							<Link to={`/quiz/${deck.id}`}>
								<GlassButton
									size="sm"
									className="gap-2 rounded-full px-4 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
									aria-label={t("library.start_practice", "Start")}
								>
									<Play className="h-3.5 w-3.5 fill-current" />
									{variant !== "editor" && t("library.start_practice", "Start")}
								</GlassButton>
							</Link>

							{/* Explicit Edit Cards Button for Editor Mode */}
							{variant === "editor" && (
								<Link to={`/editor/${deck.id}`}>
									<GlassButton
										size="sm"
										variant="ghost"
										className="gap-2 rounded-full px-4 text-slate-500 hover:text-primary"
									>
										<Edit className="h-4 w-4" />
										{t("common.edit_cards", "Edit Cards")}
									</GlassButton>
								</Link>
							)}

							{variant === "editor" && (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<GlassButton
											size="icon"
											variant="ghost"
											className="h-8 w-8 text-slate-400 hover:text-primary"
										>
											<MoreVertical className="h-4 w-4" />
										</GlassButton>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										{/* Edit Info (Dialog) */}
										<DropdownMenuItem onClick={() => onEdit?.(deck)}>
											<Settings className="h-4 w-4 mr-2" />{" "}
											{t("common.edit_info", "Info")}
										</DropdownMenuItem>

										{onMove && (
											<DropdownMenuSub>
												<DropdownMenuSubTrigger>
													<FolderInput className="h-4 w-4 mr-2" />{" "}
													{t("common.move_to", "Move to")}
												</DropdownMenuSubTrigger>
												<DropdownMenuSubContent>
													<DropdownMenuItem
														onClick={() => onMove(deck.id, null)}
													>
														{t("library.uncategorized", "Uncategorized")}
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													{folders.map((folder) => (
														<DropdownMenuItem
															key={folder.id}
															onClick={() => onMove(deck.id, folder.id)}
															disabled={deck.folderId === folder.id}
														>
															<span
																className={cn(
																	"w-2 h-2 rounded-full mr-2",
																	folder.color,
																)}
															/>
															{folder.name}
														</DropdownMenuItem>
													))}
												</DropdownMenuSubContent>
											</DropdownMenuSub>
										)}

										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() => onDelete?.(deck)}
											className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
										>
											<Trash className="h-4 w-4 mr-2" />{" "}
											{t("common.delete", "Delete")}
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							)}
						</div>
					)}
				</div>
			</div>
		</GlassCard>
	);
}
