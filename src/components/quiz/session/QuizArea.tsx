import { Volume2 } from "lucide-react";
import { ChoiceMode } from "@/components/quiz/modes/ChoiceMode";
import { DictationMode } from "@/components/quiz/modes/DictationMode";
import { FillMode } from "@/components/quiz/modes/FillMode";
import { FlashcardMode } from "@/components/quiz/modes/FlashcardMode";
import { TermMode } from "@/components/quiz/modes/TermMode";
import { FirestoreImage } from "@/components/shared/FirestoreImage";
import { MarkdownDisplay } from "@/components/shared/MarkdownDisplay";
import type { Grade } from "@/lib/srs-algo";
import { speak } from "@/lib/tts";
import type { QuizStatus } from "@/store/useQuizStore";
import type { Card } from "@/types/schema";

interface QuizAreaProps {
	card: Card;
	status: QuizStatus;
	onAnswer: (isCorrect: boolean, grade?: Grade) => void;
}

export function QuizArea({ card, status, onAnswer }: QuizAreaProps) {
	const renderQuestionHeader = () => {
		if (
			card.type === "flashcard" ||
			card.type === "fill_blank" ||
			card.type === "dictation" ||
			card.type === "choice"
		)
			return null;

		return (
			<div className="text-center space-y-10 flex flex-col items-center max-w-6xl w-full mb-12">
				{/* Image */}
				{card.content.image && (
					<div className="relative mb-6 rounded-2xl overflow-hidden border bg-white dark:bg-slate-900 shadow-md">
						<FirestoreImage // Use this component
							src={card.content.image}
							alt="Quiz"
							className="max-h-[40vh] w-auto object-contain"
						/>
					</div>
				)}

				{/* Pronunciation Button */}
				<button
					type="button"
					className="relative group cursor-pointer bg-transparent border-none p-4 transition-transform active:scale-95"
					onClick={() => speak(card.content.stem)}
				>
					<h2 className="text-7xl md:text-9xl font-serif font-bold text-slate-800 dark:text-slate-100 leading-tight tracking-wide">
						{card.content.stem}
					</h2>
					<div className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
						<Volume2 className="h-8 w-8 text-slate-400" />
					</div>
				</button>

				{/* Analysis */}
				<div className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto min-h-8 font-medium prose dark:prose-invert markdown-table">
					{status !== "question" && (
						<MarkdownDisplay content={card.content.meaning || ""} />
					)}
				</div>
			</div>
		);
	};

	return (
		// Use flex-col and w-full to ensure width
		<div className="w-full flex flex-col items-center justify-center flex-1">
			{renderQuestionHeader()}

			<div className="w-full flex justify-center">
				{card.type === "term" && (
					<TermMode
						key={card.id}
						card={card}
						status={status}
						onSubmit={(res) => onAnswer(res)}
					/>
				)}

				{card.type === "dictation" && (
					<DictationMode
						key={card.id}
						card={card}
						status={status}
						onSubmit={(isCorrect) => onAnswer(isCorrect, isCorrect ? 5 : 1)}
					/>
				)}

				{card.type === "choice" && (
					<ChoiceMode
						key={card.id}
						card={card}
						status={status}
						onSubmit={(res) => onAnswer(res, res ? 5 : 1)}
					/>
				)}
				{card.type === "fill_blank" && (
					<FillMode
						key={card.id}
						card={card}
						status={status}
						onSubmit={(res) => onAnswer(res, res ? 5 : 1)}
					/>
				)}
				{card.type === "flashcard" && (
					<FlashcardMode
						key={card.id}
						card={card}
						status={status}
						onRate={(rem) => onAnswer(true, rem ? 5 : 1)}
					/>
				)}
			</div>
		</div>
	);
}
