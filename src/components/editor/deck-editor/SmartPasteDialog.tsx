import { ArrowRight, ClipboardPaste } from "lucide-react";
import { useState } from "react";
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
	const [open, setOpen] = useState(false);
	const [text, setText] = useState("");

	const handleParse = () => {
		const result = TextParser.parseChoiceQuestion(text);

		const filledOptions = result.options.filter(Boolean).length;
		if (filledOptions < 2) {
			toast.error("解析失敗：找不到足夠的選項 (至少要有 A, B)");
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
					<ClipboardPaste className="h-4 w-4" /> 智慧貼上
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-lg w-[95vw]">
				{" "}
				{/* 確保在手機版有邊距 */}
				<DialogHeader>
					<DialogTitle>智慧貼上 (Smart Paste)</DialogTitle>
					<DialogDescription>
						支援格式：題目... (A) 選項... 答案：A 解析：...
					</DialogDescription>
				</DialogHeader>
				{/* 
                   ▼▼▼ 修正重點 ▼▼▼ 
                   1. min-w-0: 防止 Flex/Grid 子元素撐開父層
                   2. w-full: 確保佔滿寬度
                */}
				<div className="space-y-4 py-2 w-full min-w-0">
					<Textarea
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder={`範例：\n請問台灣最高的山是？\n(A) 阿里山\n(B) 玉山\n(C) 陽明山\n(D) 雪山\n\n答案：B\n解析：玉山主峰海拔 3952 公尺。`}
						// 3. 強制樣式覆蓋
						// field-sizing-fixed: (透過 style) 強制固定高度，不隨內容長高
						// h-64: 固定高度 16rem
						// resize-none: 禁止使用者拉大
						// break-all: 確保長字串會換行，不會撐破寬度
						className="h-64 w-full resize-none break-all whitespace-pre-wrap"
						style={{ fieldSizing: "fixed" } as React.CSSProperties}
					/>
				</div>
				<DialogFooter>
					<Button type="button" variant="ghost" onClick={() => setOpen(false)}>
						取消
					</Button>
					<Button type="button" onClick={handleParse} disabled={!text.trim()}>
						解析並填入 <ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
