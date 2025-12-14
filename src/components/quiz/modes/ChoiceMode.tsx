import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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

export function ChoiceMode({ card, status, onSubmit }: ChoiceModeProps) {
	const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

	useEffect(() => {
		const opts = [card.content.answer || "", ...(card.content.options || [])];
		setShuffledOptions(shuffleArray(opts));
	}, [card.content.answer, card.content.options]);

	const handleSelect = useCallback(
		(option: string) => {
			if (status !== "question") return;
			const isCorrect = option === card.content.answer;
			onSubmit(isCorrect);
		},
		[status, card.content.answer, onSubmit],
	);

	// 鍵盤監聽
	useEffect(() => {
		if (status !== "question") return;
		const handleKey = (e: KeyboardEvent) => {
			const keyMap: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3 };
			if (keyMap[e.key] !== undefined && shuffledOptions[keyMap[e.key]]) {
				handleSelect(shuffledOptions[keyMap[e.key]]);
			}
		};
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [status, shuffledOptions, handleSelect]);

	return (
		<div className="w-full max-w-lg space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{shuffledOptions.map((opt, idx) => {
					let btnVariant: "outline" | "default" | "destructive" = "outline";
					if (status !== "question") {
						if (opt === card.content.answer) btnVariant = "default";
						else btnVariant = "destructive"; // 簡單標示
					}
					return (
						<Button
							key={`${opt}-${idx}`}
							variant={btnVariant}
							className="h-16 text-lg justify-start px-6 text-left whitespace-normal"
							onClick={() => handleSelect(opt)}
							disabled={status !== "question"}
						>
							<span className="mr-3 text-muted-foreground font-mono text-sm border px-1.5 rounded bg-slate-50 dark:bg-slate-800">
								{idx + 1}
							</span>
							{opt}
						</Button>
					);
				})}
			</div>
		</div>
	);
}
