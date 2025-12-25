import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DeckCard } from "@/components/shared/DeckCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Deck } from "@/types/schema";

interface LibraryDeckGridProps {
	decks: Deck[];
	loading: boolean;
	activeFolderId: string | null;
	subscribedIds: Set<string>;
	onToggleSub: (deck: Deck) => void;
	onClearFilter: () => void;
}

export function LibraryDeckGrid({
	decks,
	loading,
	activeFolderId,
	subscribedIds,
	onToggleSub,
	onClearFilter,
}: LibraryDeckGridProps) {
	const { t } = useTranslation();

	return (
		<div className="space-y-6">
			<h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-10 flex items-center gap-2">
				{activeFolderId
					? t("library.folder_content", "Folder Content")
					: t("library.latest_decks", "Latest Decks")}
				{decks.length > 0 && (
					<Badge
						variant="secondary"
						className="ml-2 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
					>
						{decks.length}
					</Badge>
				)}
			</h3>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{loading ? (
					Array.from({ length: 8 }).map((_v, id) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton
						<Skeleton key={id} className="h-64 w-full rounded-3xl" />
					))
				) : decks.length === 0 ? (
					<div className="col-span-full py-20 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
						<BookOpen className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
						<p className="text-xl font-medium">
							{activeFolderId
								? t("library.no_decks_in_folder", "No decks in this folder")
								: t("library.no_decks", "No decks found")}
						</p>
						{activeFolderId && (
							<Button
								variant="link"
								onClick={onClearFilter}
								className="mt-2 text-primary"
							>
								{t("library.view_all_decks", "View all decks")}
							</Button>
						)}
					</div>
				) : (
					decks.map((deck) => (
						<DeckCard
							key={deck.id}
							deck={deck}
							variant="library"
							isSubscribed={subscribedIds.has(deck.id)}
							onToggleSub={onToggleSub}
						/>
					))
				)}
			</div>
		</div>
	);
}
