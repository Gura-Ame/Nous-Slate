import { useEffect, useMemo, useRef, useState } from "react";
import { CharacterBlock } from "@/components/quiz/CharacterBlock";
import { MarkdownDisplay } from "@/components/shared/MarkdownDisplay";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Card } from "@/types/schema";

interface DictationModeProps {
	card: Card;
	status: "idle" | "question" | "success" | "failure" | "finished";
	onSubmit: (isCorrect: boolean) => void;
}

export function DictationMode({ card, status, onSubmit }: DictationModeProps) {
	// 儲存每個挖空位置的答案： { index: char }
	const [answers, setAnswers] = useState<Record<number, string>>({});
	const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

	// 1. 初始化與重置
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
	if (card.id !== prevCardId || (status === "question" && status !== prevStatus)) {
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

	// 2. 處理輸入
	const handleInputChange = (index: number, value: string) => {
		// 限制只能輸入一個字，且過濾掉注音符號 (簡單防呆)
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
		<div className="flex flex-col items-center w-full space-y-8 max-w-3xl">
			{/* 題目區域 */}
			<form
				onSubmit={handleSubmit}
				className="flex flex-wrap justify-center gap-4"
			>
				{blocks.map((block, index) => {
					const isMasked = maskedIndices.includes(index);
					const z = block.zhuyin;
					const bopomofoStr = z.initial + z.medial + z.final + z.tone;

					// 沒挖空：直接顯示
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

					// 有挖空
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
									"relative inline-flex items-stretch rounded-lg overflow-hidden border-2 bg-white dark:bg-slate-900 transition-all duration-200 shadow-sm",
									inputStatus === "default"
										? "border-primary border-dashed bg-blue-50/30 dark:bg-blue-900/10"
										: "",
									inputStatus === "correct"
										? "border-emerald-500 bg-emerald-50/20"
										: "",
									inputStatus === "error"
										? "border-destructive bg-destructive/10"
										: "",
								)}
							>
								{/* 左側 Input */}
								<div className="w-20 h-20 relative flex items-center justify-center border-r-2 border-inherit">
									<input
										ref={(el) => {
											inputRefs.current[index] = el;
										}}
										type="text"
										className={cn(
											"w-full h-full text-center text-5xl font-serif bg-transparent outline-none p-0 caret-primary text-slate-900 dark:text-slate-100",
											status !== "question" &&
												inputStatus === "error" &&
												"text-destructive",
										)}
										value={displayChar}
										onChange={(e) => handleInputChange(index, e.target.value)}
										onKeyDown={(e) => handleKeyDown(e, index)}
										disabled={status !== "question"}
										autoComplete="off"
									/>
								</div>

								{/* 右側注音 (永遠顯示作為提示) */}
								<div className="w-10 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800/50">
									<div className="flex flex-col items-center justify-center gap-0.5">
										{bopomofoStr.split("").map((s, i) => (
											<span
												// biome-ignore lint/suspicious/noArrayIndexKey: 靜態
												key={i}
												className="text-lg font-serif text-slate-600 dark:text-slate-400 font-medium leading-none"
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

				{/* 隱藏的 Submit 按鈕，確保 Enter 可提交 */}
				<button type="submit" className="hidden" />
			</form>

			{/* 結果與解釋顯示區 (新增) */}
			{status !== "question" && (
				<div className="w-full max-w-lg bg-slate-100 dark:bg-slate-800 p-6 rounded-xl animate-in slide-in-from-bottom-2">
					<h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-slate-100">
						釋義與解析
					</h3>

					<div className="text-slate-600 dark:text-slate-300 leading-relaxed prose dark:prose-invert max-w-none">
						<MarkdownDisplay content={card.content.meaning || "暫無解釋。"} />
					</div>
				</div>
			)}

			{/* 提示 (僅問答時顯示) */}
			{status === "question" && (
				<Button
					size="lg"
					className="px-8"
					onClick={handleSubmit}
					disabled={Object.keys(answers).length === 0}
				>
					提交答案 (Enter)
				</Button>
			)}
		</div>
	);
}
