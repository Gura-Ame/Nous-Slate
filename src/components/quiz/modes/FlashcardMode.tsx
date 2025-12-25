import { Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FirestoreImage } from "@/components/shared/FirestoreImage";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { speak } from "@/lib/tts";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/useSettingsStore";
import type { Card } from "@/types/schema";

interface FlashcardModeProps {
	card: Card;
	status: string;
	onRate: (remembered: boolean) => void;
}

export function FlashcardMode({ card, status, onRate }: FlashcardModeProps) {
	const { t } = useTranslation();
	const [isFlipped, setIsFlipped] = useState(false);
	const { autoPlayAudio } = useSettingsStore();

	// 1. Reset state when prop changes
	const [prevCardId, setPrevCardId] = useState(card.id);
	if (card.id !== prevCardId) {
		setPrevCardId(card.id);
		setIsFlipped(false);
	}

	useEffect(() => {
		if (status === "question" && autoPlayAudio) {
			const timer = setTimeout(() => {
				if (card.content.audioUrl) {
					new Audio(card.content.audioUrl).play().catch(() => {});
				} else {
					speak(card.content.stem);
				}
			}, 500);
			return () => clearTimeout(timer);
		}
	}, [status, autoPlayAudio, card.content.audioUrl, card.content.stem]);

	useEffect(() => {
		if (status !== "question") return;
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === " ") {
				e.preventDefault();
				setIsFlipped((p) => !p);
			} else if (isFlipped) {
				if (e.key === "1") onRate(false);
				if (e.key === "2") onRate(true);
			}
		};
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [status, isFlipped, onRate]);

	const handlePlayAudio = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (card.content.audioUrl) {
			new Audio(card.content.audioUrl).play();
		} else {
			speak(card.content.stem);
		}
	};

	return (
		<div className="w-full max-w-md perspective-1000 h-[50vh] max-h-[500px] flex flex-col justify-center">
			<button
				type="button"
				className={cn(
					"relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer group text-left appearance-none bg-transparent border-none p-0 outline-none block font-inherit",
					isFlipped ? "rotate-y-180" : "",
				)}
				onClick={() => setIsFlipped(!isFlipped)}
			>
				{/* --- Front --- */}
				<div
					className={cn(
						"absolute inset-0 backface-hidden",
						"rounded-3xl border border-white/50 dark:border-white/10",
						"bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl",
						"shadow-xl hover:shadow-2xl hover:border-white/80 dark:hover:border-white/20 transition-all duration-300",
						"flex flex-col items-center justify-center p-8",
						isFlipped ? "invisible pointer-events-none" : "visible",
					)}
				>
					{/* Inner Highlight */}
					<div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 pointer-events-none rounded-3xl" />

					<div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
						{card.content.image ? (
							<>
								<FirestoreImage
									src={card.content.image}
									alt="Flashcard"
									className="h-32 w-auto object-contain mb-4 rounded-xl shadow-sm"
								/>
								<h2 className="text-3xl font-bold mb-2 text-center text-slate-800 dark:text-slate-100 wrap-break-word w-full">
									{card.content.stem}
								</h2>
							</>
						) : (
							<div className="flex-1 flex items-center justify-center w-full">
								<h2 className="text-5xl md:text-6xl font-bold text-center text-slate-800 dark:text-slate-100 wrap-break-word leading-tight">
									{card.content.stem}
								</h2>
							</div>
						)}

						<p className="text-slate-500/70 dark:text-slate-400/70 text-sm animate-pulse mt-auto pt-4 font-medium uppercase tracking-wider">
							{t("quiz.flashcard.flip_hint", "Click to flip (Space)")}
						</p>
					</div>
				</div>

				{/* --- Back --- */}
				<div
					className={cn(
						"absolute inset-0 backface-hidden rotate-y-180",
						"rounded-3xl border border-primary/30 dark:border-primary/20",
						"bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl",
						"shadow-xl transition-all duration-300",
						"flex flex-col items-center justify-center p-8",
						!isFlipped ? "invisible pointer-events-none" : "visible",
					)}
				>
					{/* Inner Highlight */}
					<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none rounded-3xl" />

					<div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
						<div className="text-lg md:text-xl text-center mb-6 whitespace-pre-wrap overflow-y-auto w-full flex-1 flex flex-col justify-center leading-relaxed text-slate-700 dark:text-slate-200 scrollbar-hide">
							{card.content.meaning}
						</div>

						<GlassButton
							variant="outline"
							size="sm"
							onClick={handlePlayAudio}
							className="gap-2 shrink-0 mt-auto rounded-full"
						>
							<Volume2 className="h-4 w-4" />
							{card.content.audioUrl
								? t("quiz.flashcard.play_audio", "Play Audio")
								: t("quiz.flashcard.tts", "Read (TTS)")}
						</GlassButton>
					</div>
				</div>
			</button>

			{/* Rating Area */}
			{isFlipped && (
				<div className="absolute -bottom-24 left-0 right-0 flex justify-center gap-6 animate-in fade-in slide-in-from-top-4 duration-300 z-20">
					{/* Forgot Option */}
					<GlassButton
						className="w-36 h-14 bg-rose-500/90 hover:bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-500/20 rounded-2xl"
						onClick={() => onRate(false)}
					>
						<div className="flex flex-col items-center">
							<span className="text-lg font-bold">
								{t("quiz.flashcard.forgot", "Forgot")}
							</span>
							<span className="text-[10px] opacity-80 font-mono">key: 1</span>
						</div>
					</GlassButton>

					{/* Remembered Option */}
					<GlassButton
						className="w-36 h-14 bg-emerald-600/90 hover:bg-emerald-700 text-white border-emerald-500 shadow-lg shadow-emerald-600/20 rounded-2xl"
						onClick={() => onRate(true)}
					>
						<div className="flex flex-col items-center">
							<span className="text-lg font-bold">
								{t("quiz.flashcard.remembered", "Remembered")}
							</span>
							<span className="text-[10px] opacity-80 font-mono">key: 2</span>
						</div>
					</GlassButton>
				</div>
			)}
		</div>
	);
}
