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
// Import Bopomofo parser
import { parseBopomofoString, parseOneBopomofo } from "@/lib/bopomofo-utils";
import { CardService } from "@/services/card-service";
import type { CardContent, CardType } from "@/types/schema";

interface ImportJsonDialogProps {
	deckId: string;
	onSuccess: () => void;
}

export function ImportJsonDialog({ deckId, onSuccess }: ImportJsonDialogProps) {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [jsonInput, setJsonInput] = useState("");
	const [isImporting, setIsImporting] = useState(false);

	const handleImport = async () => {
		setIsImporting(true);
		try {
			let data: unknown[];
			try {
				data = JSON.parse(jsonInput);
			} catch (error) {
				console.error(error);
				throw new Error(
					t("import.json_error", "JSON format error, please check syntax"),
				);
			}

			if (!Array.isArray(data))
				throw new Error(t("import.must_be_array", "JSON must be an array []"));

			let count = 0;
			for (const rawItem of data) {
				// Basic validation: ensure it's an object
				if (typeof rawItem !== "object" || rawItem === null) continue;
				const item = rawItem as Record<string, unknown>;
				if (!item.stem || !item.type) continue;

				const type: CardType = item.type as CardType; // Cast type after validation
				// Base content
				let content: CardContent = {
					stem: typeof item.stem === "string" ? item.stem : "",
					meaning: typeof item.meaning === "string" ? item.meaning : "",
					image: typeof item.image === "string" ? item.image : undefined,
					audioUrl:
						typeof item.audioUrl === "string" ? item.audioUrl : undefined,
				};

				// Process special fields based on card type
				switch (type) {
					case "term":
						// Term/Bopomofo: auto-parse if zhuyinRaw is provided (e.g., "ㄧㄣˊ ㄏㄤˊ")
						if (item.zhuyinRaw && typeof item.zhuyinRaw === "string") {
							const bopomofoList = parseBopomofoString(item.zhuyinRaw);
							const chars = content.stem.split("");
							content.blocks = chars.map((char: string, index: number) => ({
								char,
								zhuyin: bopomofoList[index] || parseOneBopomofo(""),
							}));
						} else if (item.blocks && Array.isArray(item.blocks)) {
							// If blocks structure is provided directly, use it
							content.blocks = item.blocks as {
								char: string;
								zhuyin: {
									initial: string;
									medial: string;
									final: string;
									tone: string;
								};
								candidates?: {
									initial: string;
									medial: string;
									final: string;
									tone: string;
								}[];
							}[];
						}
						break;

					case "choice":
						content.answer =
							typeof item.answer === "string" ? item.answer : undefined;
						content.options = Array.isArray(item.options)
							? (item.options as string[])
							: [];
						break;

					case "fill_blank":
						content.answer =
							typeof item.answer === "string" ? item.answer : undefined;
						break;

					case "flashcard":
						// Flashcard typically only needs stem, meaning, audioUrl; base content already covers it
						break;

					default:
						// Future card types: spread other fields directly for forward compatibility
						content = { ...content, ...item };
						break;
				}

				await CardService.createCard(deckId, type, content);
				count++;
			}

			toast.success(t("import.success", { count }));
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

	// Example JSON showcasing all supported formats
	const exampleJson = `[
  {
    "type": "term",
    "stem": "Bank",
    "zhuyinRaw": "ㄧㄣˊ ㄏㄤˊ", 
    "meaning": "A financial institution that handles deposits, loans, and exchange."
  },
  {
    "type": "choice",
    "stem": "Where does the sun rise?",
    "answer": "East",
    "options": ["West", "South", "North"]
  },
  {
    "type": "fill_blank",
    "stem": "Break a ___",
    "answer": "leg"
  },
  {
    "type": "flashcard",
    "stem": "Epiphany",
    "meaning": "A moment of sudden revelation",
    "audioUrl": "https://..."
  }
]`;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="gap-2">
					<FileJson className="h-4 w-4" /> JSON Import
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>
						{t("import.batch_title", "Batch Import Cards")}
					</DialogTitle>
					<DialogDescription>
						Supports all card types. Please paste a JSON array [].
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
