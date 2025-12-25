import { Download, FileJson, RefreshCw, Upload } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { DataService } from "@/services/data-service";

export function DataManagement() {
	const { t } = useTranslation();
	const { user } = useAuth();
	const [isImporting, setIsImporting] = useState(false);
	const [isExporting, setIsExporting] = useState(false);

	const handleExportAll = async () => {
		if (!user) return;
		setIsExporting(true);
		try {
			await DataService.exportFullBackup(user.uid);
			toast.success(
				t("data_management.export_success", "Backup file downloaded"),
			);
		} catch (e) {
			console.error(e);
			toast.error(t("data_management.export_error", "Export failed"));
		} finally {
			setIsExporting(false);
		}
	};

	const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file || !user) return;

		const reader = new FileReader();
		reader.onload = async (event) => {
			setIsImporting(true);
			try {
				const json = event.target?.result as string;
				await DataService.importData(user.uid, json);
				toast.success(
					t("data_management.import_success", "Data imported successfully!"),
				);
			} catch (error) {
				console.error(error);
				toast.error(
					t(
						"data_management.import_error",
						"Import failed, please check file format",
					),
				);
			} finally {
				setIsImporting(false);
				// Reset input so the same file can be selected again
				e.target.value = "";
			}
		};
		reader.readAsText(file);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("data_management.title", "Data Management")}</CardTitle>
				<CardDescription>
					{t(
						"data_management.description",
						"Export all your study data for backup, or restore from a backup file.",
					)}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex flex-col gap-4 sm:flex-row">
					{/* Export button */}
					<Button
						variant="outline"
						className="flex-1 gap-2 h-20 sm:h-24 text-lg border-2"
						onClick={handleExportAll}
						disabled={isExporting}
					>
						{isExporting ? (
							<RefreshCw className="h-6 w-6 animate-spin" />
						) : (
							<Download className="h-6 w-6" />
						)}
						<div className="flex flex-col items-start">
							<span className="font-bold">
								{t("data_management.export_backup", "Export Full Backup")}
							</span>
							<span className="text-xs font-normal text-muted-foreground">
								Contains all folders and decks
							</span>
						</div>
					</Button>

					{/* Import button (hidden input triggered by label) */}
					<div className="flex-1 relative">
						<input
							type="file"
							accept=".json"
							className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
							onChange={handleImport}
							disabled={isImporting}
						/>
						<Button
							variant="outline"
							className="w-full h-20 sm:h-24 text-lg gap-2 border-2 border-dashed"
							disabled={isImporting}
						>
							{isImporting ? (
								<RefreshCw className="h-6 w-6 animate-spin" />
							) : (
								<Upload className="h-6 w-6" />
							)}
							<div className="flex flex-col items-start">
								<span className="font-bold">
									{t("data_management.import_data", "Import Data")}
								</span>
								<span className="text-xs font-normal text-muted-foreground">
									Supports full backup or specific deck JSON
								</span>
							</div>
						</Button>
					</div>
				</div>

				<div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-sm text-muted-foreground">
					<p className="font-bold mb-1 flex items-center gap-2">
						<FileJson className="h-4 w-4" />{" "}
						{t("data_management.formats", "Supported Formats:")}
					</p>
					<ul className="list-disc list-inside space-y-1 ml-1">
						<li>{t("data_management.backup", "Full Backup Pack")}</li>
						<li>{t("data_management.folder", "Single Folder")}</li>
						<li>{t("data_management.deck", "Single Deck")}</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
}
