import type { BopomofoChar } from "@/hooks/useBopomofo";
import { cn } from "@/lib/utils";

interface CharacterBlockProps {
	char?: string;
	bopomofo?: BopomofoChar | string;
	status?: "default" | "active" | "filled" | "error" | "correct";
	showGrid?: boolean;
}

export function CharacterBlock({
	char,
	bopomofo,
	status = "default",
	showGrid = true,
}: CharacterBlockProps) {
	// 1. 解析注音
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

	// 2. 狀態顏色管理
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
			{/* --- 左側：國字區 (維持不變) --- */}
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
          --- 右側：注音區 (架構重構) --- 
          使用 Flex Row 將「符號」與「聲調」左右並排
      */}
			<div
				className={cn(
					"w-10 relative flex items-center justify-center", // 垂直置中容器
					status === "active" && "bg-blue-50/20",
					status === "error" && "bg-destructive/10",
					status === "correct" && "bg-emerald-50/20",
					tone && tone !== " " && !isLightTone && "pl-1", // 有聲調且非輕聲時，右側留點空間
				)}
			>
				{/* 
            Wrapper: 負責包住「符號」和「聲調」
            這裡我們不設定高度，讓它隨內容撐開 
        */}
				<div className="relative inline-flex flex-row">
					{/* Column 1: 符號堆疊 (ㄅㄆㄇ) */}
					<div className="flex flex-col items-center justify-center leading-none">
						{symbols.split("").map((s, i) => (
							<div
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
              Column 2: 聲調欄位 (ˊˇˋ) 
              不使用 absolute！使用 Flexbox 對齊策略
           */}
					{tone && tone !== " " && !isLightTone && (
						<div
							className={cn(
								"flex flex-col",

								// 關鍵邏輯：
								// 單字 (isSingleSymbol) -> justify-start (對齊頂部)
								// 多字 (!isSingleSymbol) -> justify-center (對齊中間)
								isSingleSymbol ? "justify-start" : "justify-center",
							)}
						>
							<span className="text-sm font-serif text-slate-600 dark:text-slate-300 font-medium scale-90 origin-left">
								{tone}
							</span>
						</div>
					)}

					{/* 
              Special Case: 輕聲 (˙)
              因為它必須在「正上方」，還是得用 absolute，這是物理限制
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
