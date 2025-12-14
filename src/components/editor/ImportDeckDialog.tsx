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
import { useAuth } from "@/hooks/useAuth";
// 重用之前的解析邏輯
import { parseBopomofoString, parseOneBopomofo } from "@/lib/bopomofo-utils";
import { CardService } from "@/services/card-service";
import { DeckService } from "@/services/deck-service";
import type { CardContent, CardType } from "@/types/schema";

interface ImportDeckDialogProps {
	onSuccess: () => void;
}

export function ImportDeckDialog({ onSuccess }: ImportDeckDialogProps) {
	const { user } = useAuth();
	const [open, setOpen] = useState(false);
	const [jsonInput, setJsonInput] = useState("");
	const [isImporting, setIsImporting] = useState(false);

	const handleImport = async () => {
		if (!user) return;
		setIsImporting(true);
		try {
			const data = JSON.parse(jsonInput);

			// 簡單驗證格式
			if (!data.title || !Array.isArray(data.cards)) {
				throw new Error("JSON 格式錯誤：必須包含 title 和 cards 陣列");
			}

			// 1. 建立題庫
			const deckRef = await DeckService.createDeck(
				user.uid,
				data.title,
				data.description,
			);
			const newDeckId = deckRef.id;

			// 如果有 tags，更新上去 (假設 createDeck 還沒支援 tags 參數)
			if (Array.isArray(data.tags)) {
				await DeckService.updateDeck(newDeckId, {
					tags: data.tags,
					isPublic: !!data.isPublic,
				});
			}

			// 2. 批次建立卡片
			let count = 0;
			for (const item of data.cards) {
				if (!item.stem || !item.type) continue;
				const type: CardType = item.type;
				const content: CardContent = {
					stem: item.stem,
					meaning: item.meaning || "",
					audioUrl: item.audioUrl,
				};

				if (type === "term") {
					if (item.zhuyinRaw) {
						const bopomofoList = parseBopomofoString(item.zhuyinRaw);
						const chars = item.stem.split("");
						content.blocks = chars.map((char: string, index: number) => ({
							char,
							zhuyin: bopomofoList[index] || parseOneBopomofo(""),
						}));
					} else if (item.blocks) {
						content.blocks = item.blocks;
					}
				} else if (type === "choice") {
					content.answer = item.answer;
					content.options = item.options || [];
				} else if (type === "fill_blank") {
					content.answer = item.answer;
				}

				await CardService.createCard(newDeckId, type, content);
				count++;
			}

			toast.success(`題庫「${data.title}」已匯入，共 ${count} 張卡片`);
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

	const exampleJson = `{
  "title": "匯入的題庫範例",
  "description": "這是一個 JSON 匯入測試",
  "isPublic": false,
  "tags": ["測試", "匯入"],
  "cards": [
    {
      "type": "term",
      "stem": "銀行",
      "zhuyinRaw": "ㄧㄣˊ ㄏㄤˊ",
      "meaning": "金融機構"
    },
    {
      "type": "choice",
      "stem": "太陽方位？",
      "answer": "東",
      "options": ["西", "南", "北"]
    }
  ]
}`;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="gap-2">
					<FileJson className="h-4 w-4" /> 匯入題庫
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>匯入完整題庫</DialogTitle>
					<DialogDescription>
						請貼上包含 title 與 cards 的 JSON 物件。
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
