import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CharacterBlock } from "@/components/quiz/CharacterBlock";
import { MarkdownDisplay } from "@/components/shared/MarkdownDisplay";

import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { cn } from "@/lib/utils";
import type { Card } from "@/types/schema";

interface DictationModeProps {
	card: Card;
	status: "idle" | "question" | "success" | "failure" | "finished";
	onSubmit: (isCorrect: boolean) => void;
}

export function DictationMode({ card, status, onSubmit }: DictationModeProps) {
	const { t } = useTranslation();
	// Stores answers for each masked index: { index: char }
	const [answers, setAnswers] = useState<Record<number, string>>({});
	const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

	// 1. Init & Reset
	const [prevCardId, setPrevCardId] = useState(card.id);
	const [prevStatus, setPrevStatus] = useState(status);

	// Derived state for maskedIndices (stable for same card)
	const maskedIndices = useMemo(() => {
		const stemLength = card.content.stem.length;
		const savedIndices = card.content.maskedIndices;
		return savedIndices && savedIndices.length > 0
			? savedIndices
			: Array.from({ length: stemLength }, (_, i) => i);
	}, [card.content.stem.length, card.content.maskedIndices]);

	// Reset answers when card changes or status switches to question
	if (
		card.id !== prevCardId ||
		(status === "question" && status !== prevStatus)
	) {
		setPrevCardId(card.id);
		setPrevStatus(status);
		setAnswers({});
	}

	// Focus effect
	useEffect(() => {
		if (status === "question") {
			setTimeout(() => {
				const firstIndex = maskedIndices[0];
				inputRefs.current[firstIndex]?.focus();
			}, 100);
		}
	}, [status, maskedIndices]);

	// 2. Handle Input
	const handleInputChange = (index: number, value: string) => {
		// Limit to 1 char, strict non-zhuyin filtering could be done here
		const char = value.slice(-1);

		setAnswers((prev) => ({
			...prev,
			[index]: char,
		}));

		if (char) {
			const nextIndex = maskedIndices.find((i) => i > index);
			if (nextIndex !== undefined) {
				inputRefs.current[nextIndex]?.focus();
			}
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
		if (e.key === "Backspace" && !answers[index]) {
			const prevIndex = [...maskedIndices].reverse().find((i) => i < index);
			if (prevIndex !== undefined) {
				e.preventDefault();
				inputRefs.current[prevIndex]?.focus();
			}
		}
	};

	const handleSubmit = (e?: React.FormEvent) => {
		e?.preventDefault();
		if (status !== "question") return;

		const stem = card.content.stem;
		const isCorrect = maskedIndices.every((index) => {
			const userInput = answers[index] || "";
			return userInput === stem[index];
		});

		onSubmit(isCorrect);
	};

	const blocks = card.content.blocks || [];

	return (
		<div className="flex flex-col items-center w-full space-y-8 max-w-3xl animate-in fade-in zoom-in-50 duration-500">
			{/* Question Area */}
			<form
				onSubmit={handleSubmit}
				className="flex flex-wrap justify-center gap-4"
			>
				{blocks.map((block, index) => {
					const isMasked = maskedIndices.includes(index);
					const z = block.zhuyin;
					const bopomofoStr = z.initial + z.medial + z.final + z.tone;

					// Not masked: Show as CharacterBlock
					if (!isMasked) {
						return (
							<div key={`${card.id}-char-${index}`}>
								<CharacterBlock
									char={block.char}
									bopomofo={bopomofoStr}
									status="default"
								/>
							</div>
						);
					}

					// Masked
					let displayChar = answers[index] || "";
					let inputStatus: "default" | "error" | "correct" = "default";

					if (status !== "question") {
						const isUserCorrect = answers[index] === block.char;
						if (status === "failure" && !isUserCorrect) {
							displayChar = block.char;
							inputStatus = "error";
						} else if (status === "success" || isUserCorrect) {
							displayChar = block.char;
							inputStatus = "correct";
						}
					}

					return (
						<div key={`${card.id}-input-${index}`} className="relative">
							<div
								className={cn(
									"relative inline-flex items-stretch rounded-xl overflow-hidden border-2 transition-all duration-300 shadow-md",
									// Default state (Question)
									inputStatus === "default" &&
										"border-blue-300 dark:border-blue-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md",
									// Correct state
									inputStatus === "correct" &&
										"border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 shadow-emerald-500/20",
									// Error state
									inputStatus === "error" &&
										"border-red-500 bg-red-50/50 dark:bg-red-900/20 shadow-red-500/20",
								)}
							>
								{/* Left: Input */}
								<div className="w-20 h-24 relative flex items-center justify-center border-r-2 border-inherit">
									<input
										ref={(el) => {
											inputRefs.current[index] = el;
										}}
										type="text"
										className={cn(
											"w-full h-full text-center text-5xl font-serif bg-transparent outline-none p-0 caret-primary text-slate-900 dark:text-slate-100 placeholder-transparent",
											status !== "question" &&
												inputStatus === "error" &&
												"text-red-500 dark:text-red-400 font-bold",
										)}
										value={displayChar}
										onChange={(e) => handleInputChange(index, e.target.value)}
										onKeyDown={(e) => handleKeyDown(e, index)}
										disabled={status !== "question"}
										autoComplete="off"
									/>
								</div>

								{/* Right: Zhuyin Hint */}
								<div className="w-10 flex flex-col items-center justify-center bg-slate-100/50 dark:bg-slate-900/50">
									<div className="flex flex-col items-center justify-center gap-0.5 transform scale-90">
										{bopomofoStr.split("").map((s, i) => (
											<span
												// biome-ignore lint/suspicious/noArrayIndexKey: static list
												key={i}
												className="text-lg font-serif text-slate-500 dark:text-slate-400 font-medium leading-none"
											>
												{s}
											</span>
										))}
									</div>
								</div>
							</div>
						</div>
					);
				})}

				{/* Hidden Submit Button for Enter key support */}
				<button type="submit" className="hidden" />
			</form>

			{/* Result & Explanation */}
			{status !== "question" && (
				<GlassCard
					className="w-full max-w-lg p-6 animate-in slide-in-from-bottom-2"
					variant="hover-glow"
				>
					<h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-slate-100">
						{t("quiz.feedback.definitions", "Definitions & Analysis")}
					</h3>

					<div className="text-slate-600 dark:text-slate-300 leading-relaxed prose dark:prose-invert max-w-none">
						<MarkdownDisplay
							content={
								card.content.meaning ||
								t("quiz.feedback.no_meaning", "No definition available.")
							}
						/>
					</div>
				</GlassCard>
			)}

			{/* Submit Button */}
			{status === "question" && (
				<GlassButton
					size="lg"
					className="px-8 min-w-[200px]"
					onClick={handleSubmit}
					disabled={Object.keys(answers).length === 0}
				>
					{t("quiz.feedback.submit", "Submit (Enter)")}
				</GlassButton>
			)}
		</div>
	);
}
