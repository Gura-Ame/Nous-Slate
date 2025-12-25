import { ArrowRight, ClipboardPaste } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { TextParser } from "@/lib/text-parser";

interface SmartPasteDialogProps {
	onParsed: (data: {
		stem: string;
		options: [string, string, string, string];
		correctIndex: number;
		definition: string;
	}) => void;
}

export function SmartPasteDialog({ onParsed }: SmartPasteDialogProps) {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [text, setText] = useState("");

	const handleParse = () => {
		const result = TextParser.parseChoiceQuestion(text);

		const filledOptions = result.options.filter(Boolean).length;
		if (filledOptions < 2) {
			toast.error(
				t(
					"smart_paste.parse_error",
					"Parse error: need at least options A and B",
				),
			);
			return;
		}

		onParsed(result);
		setOpen(false);
		setText("");
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="gap-2 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
				>
					<ClipboardPaste className="h-4 w-4" />{" "}
					{t("card_form.smart_paste_btn", "Smart Paste")}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-lg w-[95vw]">
				{/* Ensure margins on mobile */}
				<DialogHeader>
					<DialogTitle>{t("smart_paste.title", "Smart Paste")}</DialogTitle>
					<DialogDescription>
						{t(
							"smart_paste.desc",
							"Support format: Question... (A) Option... Answer: A Analysis: ...",
						)}
					</DialogDescription>
				</DialogHeader>
				{/* 
                   ▼▼▼ Refactoring Highlights ▼▼▼ 
                   1. min-w-0: Prevent Flex/Grid children from expanding parent
                   2. w-full: Ensure full width
                */}
				<div className="space-y-4 py-2 w-full min-w-0">
					<Textarea
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder={t(
							"smart_paste.placeholder",
							"Example: Question... (A) ... (B) ... Answer: B ...",
						)}
						// 3. Style overrides
						// field-sizing-fixed: (via style) Force fixed height
						// h-64: Fixed height 16rem
						// resize-none: Disable user resize
						// break-all: Ensure long strings wrap
						className="h-64 w-full resize-none break-all whitespace-pre-wrap"
						style={{ fieldSizing: "fixed" } as React.CSSProperties}
					/>
				</div>
				<DialogFooter>
					<Button type="button" variant="ghost" onClick={() => setOpen(false)}>
						{t("common.cancel", "Cancel")}
					</Button>
					<Button type="button" onClick={handleParse} disabled={!text.trim()}>
						{t("smart_paste.submit", "Parse and Fill")}{" "}
						<ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
