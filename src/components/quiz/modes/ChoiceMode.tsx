import { Lightbulb } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MarkdownDisplay } from "@/components/shared/MarkdownDisplay";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { cn } from "@/lib/utils";
import type { Card } from "@/types/schema";

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
	const { t } = useTranslation();

	const shuffledOptions = useMemo(() => {
		const answer = card.content.answer || "";
		const options = card.content.options || [];

		if (options.includes(answer)) {
			return options;
		}
		const opts = [answer, ...options];
		return shuffleArray(opts);
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
			{/* Liquid Glass Stem */}
			{card.content.stem && (
				<GlassCard
					variant="hover-glow"
					className="relative overflow-hidden p-8 cursor-default"
				>
					<div className="relative z-10 text-2xl md:text-2xl leading-relaxed text-slate-800 dark:text-slate-100 drop-shadow-sm prose dark:prose-invert max-w-none">
						<MarkdownDisplay content={card.content.stem} />
					</div>
				</GlassCard>
			)}

			{/* Options */}
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
							// biome-ignore lint/suspicious/noArrayIndexKey: Options might duplicate
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

			{status !== "question" && card.content.meaning && (
				<div className="relative mt-8 animate-in slide-in-from-bottom-8 fade-in duration-500 z-20">
					<div className="relative mx-auto max-w-3xl">
						<GlassCard className="p-8" variant="hover-glow">
							<div className="flex items-center gap-3 mb-4 text-slate-700 dark:text-slate-200">
								<div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-full shadow-sm">
									<Lightbulb className="w-6 h-6" />
								</div>
								<h3 className="text-xl font-bold">
									{t("quiz.feedback.analysis", "Analysis & Notes")}
								</h3>
							</div>

							<div className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
								<MarkdownDisplay content={card.content.meaning} />
							</div>
						</GlassCard>
					</div>
				</div>
			)}
		</div>
	);
}
