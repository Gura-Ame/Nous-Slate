import { Download, FileJson, RefreshCw, Upload } from "lucide-react";
import { useState } from "react";
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
	const { user } = useAuth();
	const [isImporting, setIsImporting] = useState(false);
	const [isExporting, setIsExporting] = useState(false);

	const handleExportAll = async () => {
		if (!user) return;
		setIsExporting(true);
		try {
			await DataService.exportFullBackup(user.uid);
			toast.success("備份檔案已下載");
		} catch (e) {
			console.error(e);
			toast.error("匯出失敗");
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
				toast.success("資料匯入成功！");
			} catch (error) {
				console.error(error);
				toast.error("匯入失敗，請檢查檔案格式");
			} finally {
				setIsImporting(false);
				// 清空 input 讓同個檔案可以再選一次
				e.target.value = "";
			}
		};
		reader.readAsText(file);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>資料管理</CardTitle>
				<CardDescription>
					匯出您的所有學習資料以進行備份，或從備份檔案還原。
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex flex-col gap-4 sm:flex-row">
					{/* 匯出按鈕 */}
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
							<span className="font-bold">匯出完整備份</span>
							<span className="text-xs font-normal text-muted-foreground">
								包含所有資料夾與題庫
							</span>
						</div>
					</Button>

					{/* 匯入按鈕 (隱藏 input 透過 label 觸發) */}
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
								<span className="font-bold">匯入資料</span>
								<span className="text-xs font-normal text-muted-foreground">
									支援完整備份檔或單一題庫 JSON
								</span>
							</div>
						</Button>
					</div>
				</div>

				<div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-sm text-muted-foreground">
					<p className="font-bold mb-1 flex items-center gap-2">
						<FileJson className="h-4 w-4" /> 支援格式：
					</p>
					<ul className="list-disc list-inside space-y-1 ml-1">
						<li>完整備份包 (Backup)</li>
						<li>單一資料夾 (Folder)</li>
						<li>單一題庫 (Deck)</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
}
