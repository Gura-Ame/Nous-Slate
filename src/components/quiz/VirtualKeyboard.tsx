import { Delete } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const ROWS = [
	["ㄅ", "ㄆ", "ㄇ", "ㄈ", "ㄉ", "ㄊ", "ㄋ", "ㄌ", "ㄍ", "ㄎ", "ㄏ"],
	["ㄐ", "ㄑ", "ㄒ", "ㄓ", "ㄔ", "ㄕ", "ㄖ", "ㄗ", "ㄘ", "ㄙ"],
	["ㄧ", "ㄨ", "ㄩ", "ㄚ", "ㄛ", "ㄜ", "ㄝ", "ㄞ", "ㄟ", "ㄠ", "ㄡ"],
	["ㄢ", "ㄣ", "ㄤ", "ㄥ", "ㄦ"],
	["˙", "ˊ", "ˇ", "ˋ"],
];

interface VirtualKeyboardProps {
	onInput: (char: string) => void;
	onDelete: () => void;
}

export function VirtualKeyboard({ onInput, onDelete }: VirtualKeyboardProps) {
	const { t } = useTranslation();

	const handlePress = useCallback(
		(e: React.PointerEvent, action: () => void) => {
			e.preventDefault();
			action();
		},
		[],
	);

	// Handle physical keyboard mapping for certain keys if needed (optional)
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Backspace") {
				onDelete();
			} else if (e.key === " ") {
				onInput(" ");
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onInput, onDelete]);

	return (
		<div className="w-full bg-slate-200/80 dark:bg-slate-900/80 p-2 border-t backdrop-blur-md select-none touch-none h-auto sm:h-auto">
			<div className="max-w-5xl mx-auto flex flex-col gap-1.5 p-1">
				{ROWS.map((row, rowIndex) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: Standard order for options
					<div key={rowIndex} className="flex justify-center gap-1 w-full">
						{/* Row 4 left decoration Shift */}
						{rowIndex === 3 && (
							<div className="flex-1 min-w-[30px] sm:min-w-[40px]" />
						)}

						{row.map((char) => (
							<Button
								key={char}
								variant="secondary"
								className="flex-1 min-w-0 h-10 sm:h-12 bg-white dark:bg-slate-800 shadow-sm rounded-md active:scale-95 transition-transform text-slate-700 dark:text-slate-200 font-serif text-lg p-0"
								onPointerDown={(e) => handlePress(e, () => onInput(char))}
							>
								{char}
							</Button>
						))}

						{/* Row 1: Add Backspace (DEL) at the end */}
						{rowIndex === 0 && (
							<Button
								key="del"
								variant="secondary"
								className="flex-[1.5] h-10 sm:h-12 bg-slate-300 dark:bg-slate-700 shadow-sm rounded-md active:scale-95 transition-transform"
								onPointerDown={(e) => {
									e.stopPropagation();
									handlePress(e, onDelete);
								}}
							>
								<Delete className="h-5 w-5 text-slate-700 dark:text-slate-200" />
							</Button>
						)}

						{/* Row 4 right decoration */}
						{rowIndex === 3 && (
							<div className="flex-1 min-w-[30px] sm:min-w-[40px]" />
						)}
					</div>
				))}

				{/* Bottom row: Space and Enter */}
				<div className="flex justify-center gap-2 mt-1">
					<div className="flex-1" />

					<Button
						variant="secondary"
						className="flex-4 h-10 sm:h-12 bg-white dark:bg-slate-800 shadow-sm rounded-md text-slate-400 font-serif"
						onPointerDown={(e) => handlePress(e, () => onInput(" "))}
					>
						{t("quiz.first_tone", "1st Tone")} (Space)
					</Button>

					<Button
						variant="ghost"
						className="w-24 bg-slate-300 dark:bg-slate-700 text-slate-500 rounded-md"
					>
						Enter
					</Button>
					<div className="flex-1" />
				</div>
			</div>
		</div>
	);
}
