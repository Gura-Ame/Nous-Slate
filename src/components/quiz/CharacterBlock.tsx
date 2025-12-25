import type { BopomofoChar } from "@/hooks/useBopomofo";
import { cn } from "@/lib/utils";

interface CharacterBlockProps {
	char?: string;
	bopomofo?: BopomofoChar | string;
	answer?: string;
	option1?: string;
	option2?: string;
	option3?: string;
	option4?: string;
	status?: "default" | "active" | "filled" | "error" | "correct";
	showGrid?: boolean;
}

export function CharacterBlock({
	char,
	bopomofo,
	status = "default",
	showGrid = true,
}: CharacterBlockProps) {
	// 1. Parse Bopomofo
	let symbols = "";
	let tone = "";

	if (typeof bopomofo === "string") {
		const lastChar = bopomofo.slice(-1);
		const isTone = [" ", "ˊ", "ˇ", "ˋ", "˙"].includes(lastChar);
		if (isTone) {
			symbols = bopomofo.slice(0, -1);
			tone = lastChar;
		} else {
			symbols = bopomofo;
		}
	} else if (bopomofo) {
		symbols = bopomofo.initial + bopomofo.medial + bopomofo.final;
		tone = bopomofo.tone;
	}

	const isLightTone = tone === "˙";
	const isSingleSymbol = symbols.length === 1;
	const hasToSetLowerBox = symbols.length !== 2;

	// 2. Status Color Management
	const borderColor = {
		default: "border-slate-300 dark:border-slate-600",
		active: "border-primary",
		filled: "border-slate-400 dark:border-slate-500",
		error: "border-destructive",
		correct: "border-emerald-500",
	}[status];

	return (
		<div
			className={cn(
				"relative inline-flex items-stretch rounded-lg overflow-hidden border-2 bg-white dark:bg-slate-900 transition-all duration-200 select-none",
				borderColor,
				status === "active" &&
					"shadow-[0_0_0_4px_rgba(var(--primary),0.1)] scale-105 z-10",
			)}
		>
			{/* --- Left: Character Area (Static) --- */}
			<div
				className={cn(
					"w-20 h-20 relative flex items-center justify-center border-r-2",
					borderColor,
					showGrid && status !== "error" && "bg-tian-zi-ge",
					status === "active" && "bg-blue-50/10",
					status === "error" && "bg-destructive/10",
					status === "correct" && "bg-emerald-50/20",
				)}
			>
				<span className="text-5xl font-serif leading-none -mt-1 z-10">
					{char || "\u3000"}
				</span>

				{status === "active" && !char && !symbols && (
					<span className="absolute inset-0 flex items-center justify-center animate-pulse text-slate-300 text-4xl pointer-events-none">
						_
					</span>
				)}
			</div>

			{/*
          --- Right: Bopomofo Area (Refactored) ---
          Use Flex Row to align "symbols" and "tone" side-by-side
      */}
			<div
				className={cn(
					"w-10 relative flex items-center justify-center", // Vertical centering container
					status === "active" && "bg-blue-50/20",
					status === "error" && "bg-destructive/10",
					status === "correct" && "bg-emerald-50/20",
					tone && tone !== " " && !isLightTone && "pl-1", // Add space if tone exists and not light tone
				)}
			>
				{/*
            Wrapper: Handles "symbols" and "tone"
            Height is dynamic based on content
        */}
				<div className="relative inline-flex flex-row">
					{/* Column 1: Symbol Stack (Bopomofo) */}
					<div className="flex flex-col items-center justify-center leading-none">
						{symbols.split("").map((s, i) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: Character order is fixed
								key={i}
								className={cn(
									"text-xl font-serif text-slate-600 dark:text-slate-300 font-medium flex items-center justify-center",
									hasToSetLowerBox ? "h-[1.0em]" : "h-[1.2em]",
								)}
							>
								{s}
							</div>
						))}
					</div>

					{/*
              Column 2: Tone (ˊˇˋ)
              Use Flexbox alignment instead of absolute positioning
           */}
					{tone && tone !== " " && !isLightTone && (
						<div
							className={cn(
								"flex flex-col",

								// Logic:
								// Single char (isSingleSymbol) -> justify-start (top aligned)
								// Multiple chars (!isSingleSymbol) -> justify-center (middle aligned)
								isSingleSymbol ? "justify-start" : "justify-center",
							)}
						>
							<span className="text-sm font-serif text-slate-600 dark:text-slate-300 font-medium scale-90 origin-left">
								{tone}
							</span>
						</div>
					)}

					{/*
              Special Case: Light Tone (˙)
              Must be placed at the top via absolute positioning
           */}
					{isLightTone && (
						<div className="absolute -top-3 left-1/2 -translate-x-1/2 text-sm font-serif text-slate-600 dark:text-slate-300 font-medium scale-90">
							{tone}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
