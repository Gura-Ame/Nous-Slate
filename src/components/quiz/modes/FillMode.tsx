import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { cn } from "@/lib/utils";
import type { Card } from "@/types/schema";

interface FillModeProps {
	card: Card;
	status: "idle" | "question" | "success" | "failure" | "finished";
	onSubmit: (isCorrect: boolean) => void;
}

export function FillMode({ card, status, onSubmit }: FillModeProps) {
	const { t } = useTranslation();
	const [input, setInput] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	// 1. Initialization
	const [prevCardId, setPrevCardId] = useState(card.id);

	if (card.id !== prevCardId) {
		setPrevCardId(card.id);
		setInput("");
	}

	useEffect(() => {
		// Auto Focus
		if (status === "question") {
			setTimeout(() => inputRef.current?.focus(), 50);
		}
	}, [status]);

	// 2. Handle Submit
	const handleSubmit = (e?: React.FormEvent) => {
		e?.preventDefault();
		if (status !== "question") return;
		const isCorrect = input.trim() === card.content.answer;
		onSubmit(isCorrect);
	};

	// 3. Parse Question
	const parts = useMemo(
		() => card.content.stem.split("___"),
		[card.content.stem],
	);

	// 4. Calculate Dynamic Input Width
	const answerStr = card.content.answer || "";
	const widthStyle = useMemo(() => {
		const len = Math.max(1, answerStr.length); // At least 1 char width
		// Simple check: has Chinese characters (width approx 2x English)
		const hasChinese = /[\u4e00-\u9fa5]/.test(answerStr);

		// Use ch unit (character width)
		// Chinese: 2.2ch per char, English: 1.2ch, plus a bit of buffer
		const widthCh = len * (hasChinese ? 2.5 : 1.5) + 1;

		return { width: `${widthCh}ch` };
	}, [answerStr]);

	// Input Styles
	const inputClass = cn(
		"inline-block mx-1 h-auto border-b-2 border-t-0 border-x-0 rounded-none px-1 py-0 text-center font-bold inherit focus-visible:ring-0 focus-visible:border-primary bg-transparent transition-colors outline-none",
		// Status Colors
		status === "success" && "border-emerald-500 text-emerald-600",
		status === "failure" && "border-destructive text-destructive",
		status === "question" &&
			"border-slate-400 text-slate-800 dark:text-slate-200 border-dashed",
	);

	return (
		<form
			onSubmit={handleSubmit}
			className="w-full max-w-3xl flex flex-col items-center gap-8 animate-in fade-in zoom-in-50 duration-500"
		>
			{/* Question Display Area (Larger Text) */}
			<div className="text-3xl md:text-5xl font-serif font-bold text-slate-800 dark:text-slate-100 leading-normal text-center drop-shadow-sm">
				{parts.map((part, index) => (
					<span key={`${card.id}-part-${index}`}>
						{part}
						{/* Insert Input */}
						{index < parts.length - 1 && (
							<input
								ref={index === 0 ? inputRef : null}
								id={`fill-input-${card.id}`} // Fix Issue 1
								name="fill-answer" // Fix Issue 1
								type="text"
								autoComplete="off"
								className={inputClass}
								style={widthStyle} // Apply dynamic width
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
								disabled={status !== "question"}
								placeholder={status === "question" ? "?" : ""}
							/>
						)}
					</span>
				))}
			</div>

			{status === "question" && (
				<GlassButton
					type="submit"
					size="lg"
					disabled={!input.trim()}
					className="min-w-[200px]"
				>
					{t("quiz.feedback.submit", "Submit")}
				</GlassButton>
			)}
		</form>
	);
}
