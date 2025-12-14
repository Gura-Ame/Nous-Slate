// src/components/editor/deck-editor/CardPreview.tsx

import { Volume2 } from "lucide-react";
import { CharacterBlock } from "@/components/quiz/CharacterBlock";
import { Button } from "@/components/ui/button";
import type { CardType } from "@/types/schema";

interface CardPreviewProps {
	type: CardType;
	stem: string;
	zhuyinRaw: string;
	definition: string;
	audioUrl: string;
	image?: string;
}

export function CardPreview({
	type,
	stem,
	zhuyinRaw,
	definition,
	audioUrl,
	image,
}: CardPreviewProps) {
	const playAudio = () => {
		if (audioUrl) new Audio(audioUrl).play();
	};

	return (
		<div className="p-8 border-2 border-dashed rounded-xl bg-slate-100/50 dark:bg-slate-800/50 flex flex-wrap gap-4 justify-center min-h-40 items-center">
			{/* 國字注音預覽 */}
			{type === "term" &&
				(stem ? (
					stem.split("").map((char, index) => {
						const bopomofos = zhuyinRaw.split(" ");
						const zhuyinStr = bopomofos[index] || "";
						return (
							<CharacterBlock
								key={index}
								char={char}
								bopomofo={zhuyinStr}
								status="default"
							/>
						);
					})
				) : (
					<span className="text-slate-400">輸入國字以預覽...</span>
				))}

			{/* 單字卡預覽 */}
			{type === "flashcard" && (
				<div className="flex flex-col items-center justify-center gap-4 text-center w-full">
					<h2 className="text-4xl font-bold">{stem || "Vocabulary"}</h2>
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
					<p className="text-sm text-muted-foreground line-clamp-3 max-w-md whitespace-pre-wrap">
						{definition || "Definitions will appear here..."}
					</p>
				</div>
			)}

			{/* 下方：圖片預覽 */}
			{image && (
				<img
					src={image}
					alt="Preview"
					className="max-h-40 rounded-lg shadow-sm object-contain"
				/>
			)}

			{/* 其他題型暫無預覽，顯示提示 */}
			{(type === "choice" || type === "fill_blank") && (
				<span className="text-slate-400 text-sm">
					{stem || "請輸入題目..."}
				</span>
			)}
		</div>
	);
}
