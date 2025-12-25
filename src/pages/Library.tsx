import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { LibraryDeckGrid } from "@/components/library/LibraryDeckGrid";
import { PublicFolderSection } from "@/components/library/PublicFolderSection";
import { GlassPage } from "@/components/ui/glass";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { DeckService } from "@/services/deck-service";
import { FolderService } from "@/services/folder-service";
import { SubService } from "@/services/sub-service";
import type { Deck, Folder as FolderType } from "@/types/schema";

export default function Library() {
	const { t } = useTranslation();
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
				toast.error(t("common.error_loading", "Loading failed"));
			} finally {
				setLoading(false);
			}
		};
		loadData();
	}, [user, t]);

	useEffect(() => {
		const lowerTerm = searchTerm.toLowerCase();

		// 1. Filter Decks
		let filtered = decks.filter(
			(deck) =>
				deck.title.toLowerCase().includes(lowerTerm) ||
				deck.tags?.some((tag) => tag.toLowerCase().includes(lowerTerm)),
		);

		// 2. Sort
		filtered.sort(
			(a, b) => (b.stats.subscribers || 0) - (a.stats.subscribers || 0),
		);

		// 3. Folder filtering (if selected)
		if (activeFolderId) {
			filtered = filtered.filter((d) => d.folderId === activeFolderId);
		}

		setFilteredDecks(filtered);
	}, [searchTerm, decks, activeFolderId]);

	const handleToggleSub = async (deck: Deck) => {
		if (!user)
			return toast.error(t("common.login_required", "Please login first"));

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
				toast.success(t("library.unsubscribe_success", "Unsubscribed"));
			} else {
				await SubService.subscribe(user.uid, deck);
				toast.success(t("library.subscribe_success", "Subscribed"));
			}
		} catch {
			toast.error(t("common.error", "Operation failed"));
		}
	};

	const toggleFolderFilter = (folderId: string) => {
		if (activeFolderId === folderId) {
			setSearchParams({});
		} else {
			setSearchParams({ folder: folderId });
		}
	};

	const clearFilter = () => {
		setSearchParams({});
	};

	return (
		<GlassPage className="flex justify-center">
			<div className="container p-8 space-y-12 max-w-7xl">
				<PageHeader
					title={t("library.title", "Explore Library")}
					description={t("library.subtitle", "Browse shared decks.")}
				>
					<div className="relative w-full md:w-80 group">
						<div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
						<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
						<Input
							placeholder={t(
								"common.search_placeholder",
								"Search title or tags...",
							)}
							className="pl-9 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-slate-200 dark:border-slate-700 focus:border-primary transition-all relative z-0"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
				</PageHeader>

				{/* --- 1. Featured Folders --- */}
				{!searchTerm && (
					<PublicFolderSection
						folders={publicFolders}
						activeFolderId={activeFolderId}
						onFolderClick={toggleFolderFilter}
						onClearFilter={clearFilter}
					/>
				)}

				{/* --- 2. Deck Grid --- */}
				<LibraryDeckGrid
					decks={filteredDecks}
					loading={loading}
					activeFolderId={activeFolderId}
					subscribedIds={subscribedIds}
					onToggleSub={handleToggleSub}
					onClearFilter={clearFilter}
				/>
			</div>
		</GlassPage>
	);
}
