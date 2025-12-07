import { Button } from "@/components/ui/button";
import type { Card } from "@/types/schema";
import { CheckCircle, XCircle } from "lucide-react";

interface QuizFeedbackProps {
  status: string;
  card: Card;
  isProcessing: boolean;
  onNext: () => void;
}

export function QuizFeedback({ status, card, isProcessing, onNext }: QuizFeedbackProps) {
  // Flashcard 不需要回饋區 (它自己處理翻面和下一題)
  if (card.type === 'flashcard') return null;

  // 正確答案顯示邏輯
  const renderCorrectAnswer = () => {
    if (card.type === 'term') {
      const blocks = card.content.blocks || [];
      return (
        <div className="flex flex-wrap justify-center gap-3">
          {blocks.map((block, i) => {
            const zhuyin = block.zhuyin.initial + block.zhuyin.medial + block.zhuyin.final + block.zhuyin.tone;
            return (
              <div key={i} className="flex flex-col items-center">
                <span className="text-lg font-serif dark:text-slate-200">{block.char}</span>
                <span className="text-sm font-serif text-primary">{zhuyin}</span>
              </div>
            )
          })}
        </div>
      );
    }
    // 其他題型直接顯示 answer
    return <div className="text-xl font-bold dark:text-slate-200">{card.content.answer}</div>;
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 animate-in slide-in-from-bottom-4 fade-in">
        <div className="flex items-center gap-2 text-emerald-600 text-xl font-bold">
          <CheckCircle className="h-6 w-6" /> 正確！
        </div>
        {card.type === 'fill_blank' && (
          <p className="text-slate-500 text-sm">{card.content.meaning}</p>
        )}
        <Button onClick={onNext} disabled={isProcessing} className="bg-emerald-600 hover:bg-emerald-700">
          下一題 (Enter)
        </Button>
      </div>
    );
  }

  if (status === 'failure') {
    return (
      <div className="flex flex-col items-center gap-6 animate-in slide-in-from-bottom-4 fade-in w-full max-w-lg">
        <div className="flex items-center gap-2 text-destructive text-xl font-bold">
          <XCircle className="h-6 w-6" /> 錯誤
        </div>
        
        <div className="flex flex-col items-center gap-2 p-4 bg-slate-100 dark:bg-slate-900 rounded-lg w-full">
          <span className="text-sm text-slate-500 font-medium">正確答案</span>
          {renderCorrectAnswer()}
          <p className="text-sm text-muted-foreground mt-2">{card.content.meaning}</p>
        </div>

        <Button onClick={onNext} disabled={isProcessing} variant="secondary" className="w-full sm:w-auto">
          繼續
        </Button>
      </div>
    );
  }

  return null;
}