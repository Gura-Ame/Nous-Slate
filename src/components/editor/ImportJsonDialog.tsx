import { FileJson, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
// 引入注音解析器
import { parseBopomofoString, parseOneBopomofo } from "@/lib/bopomofo-utils";
import { CardService } from "@/services/card-service";
import type { CardContent, CardType } from "@/types/schema";

interface ImportJsonDialogProps {
	deckId: string;
	onSuccess: () => void;
}

export function ImportJsonDialog({ deckId, onSuccess }: ImportJsonDialogProps) {
	const [open, setOpen] = useState(false);
	const [jsonInput, setJsonInput] = useState("");
	const [isImporting, setIsImporting] = useState(false);

	const handleImport = async () => {
		setIsImporting(true);
		try {
			// biome-ignore lint/suspicious/noExplicitAny: JSON.parse returns any
			let data: any[];
			try {
				data = JSON.parse(jsonInput);
			} catch (_e) {
				throw new Error("JSON 格式錯誤，請檢查語法");
			}

			if (!Array.isArray(data)) throw new Error("JSON 必須是一個陣列 []");

			let count = 0;
			for (const item of data) {
				// 基礎驗證
				if (!item.stem || !item.type) continue;

				const type: CardType = item.type;

				// 基礎內容
				let content: CardContent = {
					stem: item.stem,
					meaning: item.meaning || "",
					image: item.image || undefined,
					audioUrl: item.audioUrl || undefined,
				};

				// 根據題型處理特殊欄位
				switch (type) {
					case "term":
						// 國字注音：如果 JSON 有給 zhuyinRaw (例如 "ㄧㄣˊ ㄏㄤˊ")，自動解析
						if (item.zhuyinRaw) {
							const bopomofoList = parseBopomofoString(item.zhuyinRaw);
							const chars = item.stem.split("");
							content.blocks = chars.map((char: string, index: number) => ({
								char,
								zhuyin: bopomofoList[index] || parseOneBopomofo(""),
							}));
						} else if (item.blocks) {
							// 如果 JSON 直接提供 blocks 結構，直接用
							content.blocks = item.blocks;
						}
						break;

					case "choice":
						content.answer = item.answer;
						content.options = item.options || [];
						break;

					case "fill_blank":
						content.answer = item.answer;
						break;

					case "flashcard":
						// Flashcard 通常只需要 stem, meaning, audioUrl，基礎內容已包含
						break;

					default:
						// 未來的新題型：如果 JSON 有給其他欄位，直接 spread 進去
						// 這讓匯入器具有向前兼容性
						content = { ...content, ...item };
						break;
				}

				await CardService.createCard(deckId, type, content);
				count++;
			}

			toast.success(`成功匯入 ${count} 筆題目`);
			setOpen(false);
			setJsonInput("");
			onSuccess();
		} catch (error: unknown) {
			console.error(error);

			const msg = error instanceof Error ? error.message : "匯入失敗";
			toast.error(msg);
		} finally {
			setIsImporting(false);
		}
	};

	// 範例 JSON，展示所有支援格式
	const exampleJson = `[
  {
    "type": "term",
    "stem": "銀行",
    "zhuyinRaw": "ㄧㄣˊ ㄏㄤˊ", 
    "meaning": "辦理存款、放款、匯兌等業務的金融機構。"
  },
  {
    "type": "choice",
    "stem": "太陽從哪邊升起？",
    "answer": "東邊",
    "options": ["西邊", "南邊", "北邊"]
  },
  {
    "type": "fill_blank",
    "stem": "一___驚人",
    "answer": "鳴"
  },
  {
    "type": "flashcard",
    "stem": "Epiphany",
    "meaning": "頓悟 (n.)",
    "audioUrl": "https://..."
  }
]`;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="gap-2">
					<FileJson className="h-4 w-4" /> JSON 匯入
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>批次匯入題目</DialogTitle>
					<DialogDescription>
						支援所有題型。請貼上 JSON 陣列。
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 py-4 min-h-0">
					<Textarea
						className="font-mono text-xs h-full min-h-[300px] resize-none"
						placeholder={exampleJson}
						value={jsonInput}
						onChange={(e) => setJsonInput(e.target.value)}
					/>
				</div>

				<div className="flex justify-end gap-2 shrink-0">
					<Button variant="outline" onClick={() => setJsonInput(exampleJson)}>
						載入範例
					</Button>
					<Button onClick={handleImport} disabled={isImporting || !jsonInput}>
						{isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						開始匯入
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
