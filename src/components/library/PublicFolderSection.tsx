import { Folder } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Folder as FolderType } from "@/types/schema";

interface PublicFolderSectionProps {
	folders: FolderType[];
	activeFolderId: string | null;
	onFolderClick: (folderId: string) => void;
	onClearFilter: () => void;
}

export function PublicFolderSection({
	folders,
	activeFolderId,
	onFolderClick,
	onClearFilter,
}: PublicFolderSectionProps) {
	const { t } = useTranslation();
	if (folders.length === 0) return null;

	return (
		<div className="space-y-6 animate-in slide-in-from-top-4 duration-700">
			<div className="flex items-center justify-between">
				<h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
					<div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
						<Folder className="h-5 w-5" />
					</div>
					{t("library.featured_folders", "Featured Folders")}
				</h3>
				{activeFolderId && (
					<Button
						variant="ghost"
						size="sm"
						onClick={onClearFilter}
						className="text-muted-foreground hover:text-primary hover:bg-primary/5"
					>
						{t("library.show_all", "Show All")}
					</Button>
				)}
			</div>

			<div className="grid gap-6 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
				{folders.map((folder) => {
					const isActive = activeFolderId === folder.id;
					return (
						<button
							type="button"
							key={folder.id}
							onClick={() => onFolderClick(folder.id)}
							className={cn(
								// Basic styles: frosted glass, rounded corners, transition
								"relative group flex flex-col items-center justify-center p-6 rounded-3xl border transition-all duration-300 ease-out cursor-pointer overflow-hidden",
								// Unselected state
								!isActive &&
									"bg-white/40 dark:bg-slate-900/40 border-white/50 dark:border-white/10 backdrop-blur-xl shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-white/80 dark:hover:border-white/20",
								// Selected state (Active): glowing border
								isActive &&
									"bg-primary/5 shadow-[0_0_20px_rgba(var(--primary),0.2)] scale-[1.02]",
							)}
						>
							{/* Background flowing halo (Displayed on hover) */}
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
	);
}
