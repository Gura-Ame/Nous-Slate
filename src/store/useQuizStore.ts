import type { Card } from '@/types/schema';
import { create } from 'zustand';

type QuizStatus = 'idle' | 'question' | 'success' | 'failure' | 'finished';

interface QuizState {
  cards: Card[];           // 本次練習的所有卡片
  currentIndex: number;    // 目前在第幾題
  status: QuizStatus;      // 當前狀態
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
  status: 'idle',
  correctCount: 0,
  wrongCount: 0,

  startQuiz: (cards) => {
    if (cards.length === 0) return;
    set({
      cards,
      currentIndex: 0,
      status: 'question',
      correctCount: 0,
      wrongCount: 0,
    });
  },

  submitAnswer: (isCorrect) => {
    set((state) => ({
      status: isCorrect ? 'success' : 'failure',
      correctCount: state.correctCount + (isCorrect ? 1 : 0),
      wrongCount: state.wrongCount + (isCorrect ? 0 : 1),
    }));
  },

  nextCard: () => {
    const { currentIndex, cards } = get();
    if (currentIndex >= cards.length - 1) {
      set({ status: 'finished' });
    } else {
      set({
        currentIndex: currentIndex + 1,
        status: 'question', // 回到出題狀態
      });
    }
  },

  resetQuiz: () => set({ status: 'idle', cards: [], currentIndex: 0 }),
}));