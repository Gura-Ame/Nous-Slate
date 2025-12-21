import { Lightbulb } from "lucide-react"; // 引入燈泡圖示
import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Card } from "@/types/schema";
import remarkGfm from "remark-gfm";

function shuffleArray<T>(array: T[]): T[] {
	const newArr = [...array];
	for (let i = newArr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[newArr[i], newArr[j]] = [newArr[j], newArr[i]];
	}
	return newArr;
}

interface ChoiceModeProps {
	card: Card;
	status: string;
	onSubmit: (isCorrect: boolean) => void;
}

const keyMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };

export function ChoiceMode({ card, status, onSubmit }: ChoiceModeProps) {
	const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

	useEffect(() => {
		const answer = card.content.answer || "";
		const options = card.content.options || [];

		// ▼▼▼ 判斷是否為新格式 (固定順序) ▼▼▼
		// 如果 options 陣列裡已經包含答案，代表這是我們新存的 [A, B, C, D]
		if (options.includes(answer)) {
			setShuffledOptions(options); // 不洗牌，直接用
		} else {
			// 舊格式 (options 是干擾項)，需要合併後洗牌
			const opts = [answer, ...options];
			setShuffledOptions(shuffleArray(opts));
		}
	}, [card.content.answer, card.content.options]);

	const handleSelect = useCallback(
		(option: string) => {
			if (status !== "question") return;
			const isCorrect = option === card.content.answer;
			onSubmit(isCorrect);
		},
		[status, card.content.answer, onSubmit],
	);

	useEffect(() => {
		if (status !== "question") return;
		const handleKey = (e: KeyboardEvent) => {
			const upperCaseKey = e.key.toUpperCase();
			if (
				keyMap[upperCaseKey] !== undefined &&
				shuffledOptions[keyMap[upperCaseKey]]
			) {
				handleSelect(shuffledOptions[keyMap[upperCaseKey]]);
			}
		};
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [status, shuffledOptions, handleSelect]);

	return (
		<div className="w-full max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* Liquid Glass 題目區塊 */}
			{card.content.stem && (
				<div
					className={cn(
						"relative overflow-hidden rounded-2xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-xl p-8",
						"transition-all duration-300 ease-out hover:shadow-2xl hover:border-white/60 hover:-translate-y-1 hover:scale-[1.005] cursor-default",
					)}
				>
					<div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
					<div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

					<div className="relative z-10 text-2xl md:text-2xl font-bold leading-relaxed text-slate-800 dark:text-slate-100 drop-shadow-sm prose dark:prose-invert max-w-none">
						<ReactMarkdown remarkPlugins={[remarkGfm]}>
							{card.content.stem}
						</ReactMarkdown>
					</div>
				</div>
			)}

			{/* 選項區塊 */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
				{shuffledOptions.map((opt, idx) => {
					let btnVariant: "outline" | "default" | "secondary" | "destructive" =
						"outline";
					let customClass = "";

					const defaultGlassClass =
						"bg-white/50 dark:bg-slate-800/40 border-white/50 dark:border-white/10 backdrop-blur-md shadow-sm hover:bg-white/80 dark:hover:bg-slate-700/60 hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:scale-[1.01]";

					if (status !== "question") {
						if (opt === card.content.answer) {
							btnVariant = "default";
							customClass =
								"bg-emerald-500/90 hover:bg-emerald-500 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] ring-0 scale-[1.02] z-10 opacity-100";
						} else {
							btnVariant = "secondary";
							customClass =
								"bg-slate-200/30 dark:bg-slate-900/30 border-transparent opacity-40 grayscale blur-[1px] pointer-events-none";
						}
					} else {
						customClass = defaultGlassClass;
					}

					return (
						<Button
							// biome-ignore lint/suspicious/noArrayIndexKey: 選項內容可能重複
							key={`${opt}-${idx}`}
							variant={btnVariant}
							className={cn(
								"h-auto min-h-24 md:min-h-32 text-2xl justify-start px-8 py-6 text-left whitespace-normal rounded-2xl border-2 transition-all duration-300 ease-out",
								customClass,
							)}
							onClick={() => handleSelect(opt)}
							disabled={status !== "question"}
						>
							<span
								className={cn(
									"mr-5 font-mono text-xl border px-3 py-1 rounded-lg shrink-0 backdrop-blur-sm transition-colors",
									status === "question"
										? "bg-white/50 dark:bg-slate-950/30 border-white/30 text-slate-600 dark:text-slate-300"
										: opt === card.content.answer
											? "bg-white/20 border-white/40 text-white"
											: "bg-transparent border-transparent text-slate-400",
								)}
							>
								{Object.keys(keyMap)[idx]}
							</span>

							<span className="leading-snug drop-shadow-sm">{opt}</span>
						</Button>
					);
				})}
			</div>

			{/* ▼▼▼ 新增：毛玻璃便利貼 (Sticky Note) 風格解析區 ▼▼▼ */}
			{status !== "question" && card.content.meaning && (
				<div className="relative mt-8 animate-in slide-in-from-bottom-8 fade-in duration-500 z-20">
					{/* 便利貼本體 */}
					<div className="relative mx-auto max-w-3xl transform -rotate-1 hover:rotate-0 transition-transform duration-300">
						{/* 頂部膠帶效果 */}
						<div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/30 backdrop-blur-sm rotate-2 shadow-sm z-10 border border-white/20" />

						<div
							className={cn(
								"rounded-xl border border-yellow-200/50 dark:border-yellow-700/30 p-8 shadow-xl",
								// 液態黃色玻璃背景
								"bg-linear-to-br from-yellow-50/90 to-yellow-100/80 dark:from-yellow-900/40 dark:to-yellow-950/40 backdrop-blur-xl",
							)}
						>
							<div className="flex items-center gap-3 mb-4 text-yellow-700 dark:text-yellow-400">
								<div className="p-2 bg-yellow-200/50 rounded-full">
									<Lightbulb className="w-6 h-6" />
								</div>
								<h3 className="text-xl font-bold">解析與筆記</h3>
							</div>

							<div className="prose prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
								<ReactMarkdown remarkPlugins={[remarkGfm]}>
									{card.content.meaning}
								</ReactMarkdown>
							</div>
						</div>
					</div>
				</div>
			)}
			{/* ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ */}
		</div>
	);
}
