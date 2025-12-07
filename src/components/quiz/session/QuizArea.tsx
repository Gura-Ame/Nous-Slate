import { speak } from "@/lib/tts";
import type { Card } from "@/types/schema";
import { Volume2 } from "lucide-react";
// 引入我們寫好的各個模式
import { ChoiceMode } from "@/components/quiz/modes/ChoiceMode";
import { FillMode } from "@/components/quiz/modes/FillMode";
import { FlashcardMode } from "@/components/quiz/modes/FlashcardMode";
import { TermMode } from "@/components/quiz/modes/TermMode";
import type { QuizStatus } from "@/store/useQuizStore";

interface QuizAreaProps {
  card: Card;
  status: QuizStatus;
  onAnswer: (isCorrect: boolean, grade?: any) => void;
}

export function QuizArea({ card, status, onAnswer }: QuizAreaProps) {
  
  // 1. 渲染題目區塊 (Flashcard/Fill 模式不顯示，因為它們內建了)
  const renderQuestionHeader = () => {
    if (card.type === 'flashcard' || card.type === 'fill_blank') return null;

    return (
      <div className="text-center space-y-6 flex flex-col items-center max-w-3xl w-full mb-8">
        {/* 圖片 */}
        {card.content.image && (
          <div className="relative mb-4 rounded-lg overflow-hidden border bg-white dark:bg-slate-900 shadow-sm">
            <img 
              src={card.content.image} 
              alt="Quiz" 
              className="max-h-64 w-auto object-contain"
            />
          </div>
        )}

        {/* 題目與發音 */}
        <div className="relative group cursor-pointer" onClick={() => speak(card.content.stem)}>
           <h2 className="text-5xl font-serif font-bold text-slate-800 dark:text-slate-100 leading-tight">
             {card.content.stem}
           </h2>
           <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
             <Volume2 className="h-5 w-5 text-slate-400" />
           </div>
        </div>
        
        {/* 解釋 (非作答時顯示) */}
        <p className="text-lg text-slate-500 max-w-lg mx-auto min-h-7">
           {status !== 'question' && card.content.meaning}
        </p>
      </div>
    );
  };

  return (
    <>
      {renderQuestionHeader()}

      {/* 2. 根據題型渲染對應組件 */}
      {/* 加上 key 確保切換題目時強制重新渲染 (解決殘留問題) */}
      {card.type === 'term' && (
        <TermMode key={card.id} card={card} status={status as any} onSubmit={(res) => onAnswer(res)} />
      )}
      {card.type === 'choice' && (
        <ChoiceMode key={card.id} card={card} status={status} onSubmit={(res) => onAnswer(res, res ? 5 : 1)} />
      )}
      {card.type === 'fill_blank' && (
        <FillMode key={card.id} card={card} status={status} onSubmit={(res) => onAnswer(res, res ? 5 : 1)} />
      )}
      {card.type === 'flashcard' && (
        <FlashcardMode key={card.id} card={card} status={status} onRate={(rem) => onAnswer(true, rem ? 5 : 1)} />
      )}
    </>
  );
}