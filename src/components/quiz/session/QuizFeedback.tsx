import { CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import type { Card } from "@/types/schema";

interface QuizFeedbackProps {
	status: string;
	card: Card;
	isProcessing: boolean;
	onNext: () => void;
}

export function QuizFeedback({
	status,
	card,
	isProcessing,
	onNext,
}: QuizFeedbackProps) {
	const { t } = useTranslation();
	// Flashcards don't need a feedback area (they handle their own flip and next-question logic)
	if (card.type === "flashcard") return null;

	// Correct answer display logic
	const renderCorrectAnswer = () => {
		if (card.type === "term") {
			const blocks = card.content.blocks || [];
			return (
				<div className="flex flex-wrap justify-center gap-3">
					{blocks.map((block, i) => {
						const zhuyin =
							block.zhuyin.initial +
							block.zhuyin.medial +
							block.zhuyin.final +
							block.zhuyin.tone;
						return (
							<div
								key={`${block.char}-${i}`}
								className="flex flex-col items-center"
							>
								<span className="text-lg font-serif dark:text-slate-200">
									{block.char}
								</span>
								<span className="text-sm font-serif text-primary">
									{zhuyin}
								</span>
							</div>
						);
					})}
				</div>
			);
		}
		// Other types display answer directly
		return (
			<div className="text-xl font-bold dark:text-slate-200">
				{card.content.answer}
			</div>
		);
	};

	if (status === "success") {
		return (
			<div className="flex flex-col items-center gap-4 animate-in slide-in-from-bottom-4 fade-in">
				<div className="flex items-center gap-2 text-emerald-600 text-xl font-bold drop-shadow-sm">
					<CheckCircle className="h-6 w-6" />{" "}
					{t("quiz.feedback.correct", "Correct!")}
				</div>
				{card.type === "fill_blank" && (
					<p className="text-slate-500 text-sm">{card.content.meaning}</p>
				)}
				<GlassButton
					onClick={onNext}
					disabled={isProcessing}
					className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500"
				>
					{t("quiz.feedback.next", "Next")}
				</GlassButton>
			</div>
		);
	}

	if (status === "failure") {
		return (
			<div className="flex flex-col items-center gap-6 animate-in slide-in-from-bottom-4 fade-in w-full max-w-lg">
				<div className="flex items-center gap-2 text-destructive text-xl font-bold drop-shadow-sm">
					<XCircle className="h-6 w-6" />{" "}
					{t("quiz.feedback.incorrect", "Incorrect")}
				</div>

				{card.type !== "choice" && (
					<div className="flex flex-col items-center gap-2 p-4 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm w-full">
						<span className="text-sm text-slate-500 font-medium">
							{t("quiz.feedback.correct_answer", "Correct Answer")}
						</span>
						{renderCorrectAnswer()}
						<p className="text-sm text-muted-foreground mt-2">
							{card.content.meaning}
						</p>
					</div>
				)}

				<GlassButton
					onClick={onNext}
					disabled={isProcessing}
					variant="secondary"
					className="w-full sm:w-auto min-w-[120px]"
				>
					{t("quiz.continue", "Continue")}
				</GlassButton>
			</div>
		);
	}

	return null;
}
