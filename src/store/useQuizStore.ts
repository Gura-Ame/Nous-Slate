import { create } from "zustand";
import type { Card } from "@/types/schema";

export type QuizStatus =
	| "idle"
	| "question"
	| "success"
	| "failure"
	| "finished";

interface QuizState {
	cards: Card[]; // All cards in this session
	currentIndex: number; // Current card index
	status: QuizStatus; // Current status
	correctCount: number;
	wrongCount: number;

	// Actions
	startQuiz: (cards: Card[]) => void;
	submitAnswer: (isCorrect: boolean) => void;
	nextCard: () => void;
	resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
	cards: [],
	currentIndex: 0,
	status: "idle",
	correctCount: 0,
	wrongCount: 0,

	startQuiz: (cards) => {
		if (cards.length === 0) return;
		set({
			cards,
			currentIndex: 0,
			status: "question",
			correctCount: 0,
			wrongCount: 0,
		});
	},

	submitAnswer: (isCorrect) => {
		set((state) => ({
			status: isCorrect ? "success" : "failure",
			correctCount: state.correctCount + (isCorrect ? 1 : 0),
			wrongCount: state.wrongCount + (isCorrect ? 0 : 1),
		}));
	},

	nextCard: () => {
		const { currentIndex, cards } = get();
		if (currentIndex >= cards.length - 1) {
			set({ status: "finished" });
		} else {
			set({
				currentIndex: currentIndex + 1,
				status: "question", // Return to question state
			});
		}
	},

	resetQuiz: () => set({ status: "idle", cards: [], currentIndex: 0 }),
}));
