import { Volume2 } from "lucide-react";
import { ChoiceMode } from "@/components/quiz/modes/ChoiceMode";
import { DictationMode } from "@/components/quiz/modes/DictationMode";
import { FillMode } from "@/components/quiz/modes/FillMode";
import { FlashcardMode } from "@/components/quiz/modes/FlashcardMode";
import { TermMode } from "@/components/quiz/modes/TermMode";
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
		// Dictation 模式也不顯示標題 (因為標題就是注音方塊本身)
		if (
			card.type === "flashcard" ||
			card.type === "fill_blank" ||
			card.type === "dictation" // 新增 dictation
		)
			return null;

		return (
			<div className="text-center space-y-6 flex flex-col items-center max-w-3xl w-full mb-8">
				{card.content.image && (
					<div className="relative mb-4 rounded-lg overflow-hidden border bg-white dark:bg-slate-900 shadow-sm">
						<img
							src={card.content.image}
							alt="Quiz"
							className="max-h-64 w-auto object-contain"
						/>
					</div>
				)}

				<button
					type="button"
					className="relative group cursor-pointer bg-transparent border-none p-0"
					onClick={() => speak(card.content.stem)}
				>
					<h2 className="text-5xl font-serif font-bold text-slate-800 dark:text-slate-100 leading-tight">
						{card.content.stem}
					</h2>
					<div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
						<Volume2 className="h-5 w-5 text-slate-400" />
					</div>
				</button>

				<p className="text-lg text-slate-500 max-w-lg mx-auto min-h-7">
					{status !== "question" && card.content.meaning}
				</p>
			</div>
		);
	};

	return (
		<>
			{renderQuestionHeader()}

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
		</>
	);
}
