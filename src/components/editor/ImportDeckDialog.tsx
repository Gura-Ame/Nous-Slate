import { FileJson, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
// Reuse previous parsing logic
import { parseBopomofoString, parseOneBopomofo } from "@/lib/bopomofo-utils";
import { CardService } from "@/services/card-service";
import { DeckService } from "@/services/deck-service";
import type { CardContent, CardType } from "@/types/schema";

interface ImportDeckDialogProps {
	onSuccess: () => void;
}

export function ImportDeckDialog({ onSuccess }: ImportDeckDialogProps) {
	const { user } = useAuth();
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [jsonInput, setJsonInput] = useState("");
	const [isImporting, setIsImporting] = useState(false);

	const handleImport = async () => {
		if (!user) return;
		setIsImporting(true);
		try {
			const data = JSON.parse(jsonInput);

			// Basic format validation
			if (!data.title || !Array.isArray(data.cards)) {
				throw new Error(
					t(
						"import.deck_error",
						"JSON format error: must contain title and cards array",
					),
				);
			}

			// 1. Create deck
			const deckRef = await DeckService.createDeck(
				user.uid,
				data.title,
				data.description,
			);
			const newDeckId = deckRef.id;

			// Update tags if present (assuming createDeck doesn't handle tags yet)
			if (Array.isArray(data.tags)) {
				await DeckService.updateDeck(newDeckId, {
					tags: data.tags,
					isPublic: !!data.isPublic,
				});
			}

			// 2. Create cards batch
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

			toast.success(t("import.deck_success", { title: data.title, count }));
			setOpen(false);
			setJsonInput("");
			onSuccess();
		} catch (error: unknown) {
			console.error(error);
			const msg =
				error instanceof Error
					? error.message
					: t("import.error", "Import failed");
			toast.error(msg);
		} finally {
			setIsImporting(false);
		}
	};

	const exampleJson = `{
  "title": "Import Deck Example",
  "description": "This is a JSON import test",
  "isPublic": false,
  "tags": ["test", "import"],
  "cards": [
    {
      "type": "term",
      "stem": "Bank",
      "zhuyinRaw": "ㄧㄣˊ ㄏㄤˊ",
      "meaning": "Financial Institution"
    },
    {
      "type": "choice",
      "stem": "Sun direction?",
      "answer": "East",
      "options": ["West", "South", "North"]
    }
  ]
}`;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="gap-2">
					<FileJson className="h-4 w-4" /> Import Deck
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>
						{t("import.deck_title", "Import Complete Deck")}
					</DialogTitle>
					<DialogDescription>
						Please paste the JSON object containing title and cards.
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
						Load Example
					</Button>
					<Button onClick={handleImport} disabled={isImporting || !jsonInput}>
						{isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Start Import
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
