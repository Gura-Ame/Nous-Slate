import { Volume2 } from "lucide-react";
import { CharacterBlock } from "@/components/quiz/CharacterBlock";
import { MarkdownDisplay } from "@/components/shared/MarkdownDisplay";
import { Button } from "@/components/ui/button";
import type { CardType } from "@/types/schema";

interface CardPreviewProps {
	type: CardType;
	stem: string;
	zhuyinRaw: string;
	definition: string;
	audioUrl: string;
	image?: string;
	answer?: string;
	option1?: string;
	option2?: string;
	option3?: string;
}

export function CardPreview({
	type,
	stem,
	zhuyinRaw,
	definition,
	audioUrl,
	image,
	answer,
	option1,
	option2,
	option3,
}: CardPreviewProps) {
	const playAudio = () => {
		if (audioUrl) new Audio(audioUrl).play();
	};

	return (
		<div className="p-8 border-2 border-dashed rounded-xl bg-slate-100/50 dark:bg-slate-800/50 flex flex-col gap-6 justify-center min-h-60 items-center w-full">
			{/* 圖片區 */}
			{image && (
				<img
					src={image}
					alt="Preview"
					className="max-h-40 rounded-lg shadow-sm object-contain"
				/>
			)}

			{/* 題目區 (共用 Markdown) */}
			{(type === "choice" || type === "flashcard" || type === "fill_blank") &&
				stem && (
					<div className="prose dark:prose-invert text-center max-w-none">
						<div className="text-2xl font-bold">
							<MarkdownDisplay content={stem} />
						</div>
					</div>
				)}

			{/* 1. 國字注音 / 聽寫 */}
			{(type === "term" || type === "dictation") &&
				(stem ? (
					<div className="flex flex-wrap justify-center gap-2">
						{stem.split("").map((char, index) => {
							const bopomofos = zhuyinRaw.split(" ");
							const zhuyinStr = bopomofos[index] || "";
							return (
								// biome-ignore lint/suspicious/noArrayIndexKey: 預覽
								<div key={index}>
									<CharacterBlock
										char={char}
										bopomofo={zhuyinStr}
										status="default"
									/>
								</div>
							);
						})}
					</div>
				) : (
					<span className="text-slate-400">輸入國字以預覽...</span>
				))}

			{/* 2. 選擇題選項預覽 */}
			{type === "choice" && (
				<div className="w-full max-w-lg space-y-4 mt-2">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{/* 顯示正確答案 */}
						<div className="p-3 border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-center font-bold text-emerald-600 dark:text-emerald-400 relative">
							<span className="absolute top-0 left-2 text-[10px] bg-emerald-100 dark:bg-emerald-800 px-1 rounded">
								ANS
							</span>
							{answer || "(正確答案)"}
						</div>
						{/* 顯示干擾項 */}
						{[option1, option2, option3].map((opt, i) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: 預覽
								key={i}
								className="p-3 border rounded-lg text-center bg-white dark:bg-slate-900 text-slate-500"
							>
								{opt || `(選項 ${i + 1})`}
							</div>
						))}
					</div>

					{definition && (
						<div className="relative mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-sm">
							<div className="font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
								<span className="text-xs border border-slate-300 dark:border-slate-600 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
									解析
								</span>
							</div>
							<div className="text-slate-600 dark:text-slate-400 max-w-none">
								<MarkdownDisplay content={definition} />
							</div>
						</div>
					)}
				</div>
			)}

			{/* 3. 單字卡功能區 */}
			{type === "flashcard" && (
				<div className="flex flex-col items-center gap-2">
					{audioUrl && (
						<Button
							variant="secondary"
							size="sm"
							onClick={playAudio}
							className="gap-2"
						>
							<Volume2 className="h-4 w-4" /> 試聽發音
						</Button>
					)}
					<div className="text-sm text-muted-foreground mt-2 prose dark:prose-invert text-center">
						<MarkdownDisplay content={definition || "Definitions..."} />
					</div>
				</div>
			)}
		</div>
	);
}
