import { CheckCircle, X, XCircle } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import type { Grade } from "@/lib/srs-algo";
import { CardService } from "@/services/card-service";
import { ReviewService } from "@/services/review-service";
import { useQuizStore } from "@/store/useQuizStore";

// Modes
import { ChoiceMode } from "@/components/quiz/modes/ChoiceMode";
import { FillMode } from "@/components/quiz/modes/FillMode";
import { FlashcardMode } from "@/components/quiz/modes/FlashcardMode";
import { TermMode } from "@/components/quiz/modes/TermMode";

export default function QuizSession() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { 
    cards, currentIndex, status, 
    startQuiz, submitAnswer, nextCard, resetQuiz // 引入 resetQuiz
  } = useQuizStore();

  const currentCard = cards[currentIndex];

  // 1. 初始化與銷毀
  useEffect(() => {
    // 進入時重置
    resetQuiz();

    if (!deckId) return;
    const init = async () => {
      try {
        const data = await CardService.getCardsByDeck(deckId);
        if (data.length > 0) startQuiz(data);
        else {
          toast.error("題庫無卡片");
          navigate(-1);
        }
      } catch (e) {
        toast.error("載入失敗");
      }
    };
    init();

    // 離開時重置 (避免下次進來閃一下)
    return () => {
      resetQuiz();
    };
  }, [deckId]);

  // 2. 處理退出確認
  const handleExit = () => {
    if (status === 'question' || status === 'success' || status === 'failure') {
      if (!window.confirm("確定要退出嗎？本次練習進度將不會保存 (SRS 已即時存檔)。")) {
        return;
      }
    }
    navigate('/library');
  };

  // ... (processAnswer, handleNext 保持不變) ...
  const handleAnswerSubmit = async (isCorrect: boolean, grade: Grade = isCorrect ? 5 : 1) => {
    submitAnswer(isCorrect);
    if (user && deckId && currentCard) {
      ReviewService.submitReview(user.uid, deckId, currentCard.id, grade).catch(console.error);
    }
    if (currentCard.type === 'flashcard') {
      setTimeout(() => handleNext(), 100); 
    }
  };

  const handleNext = () => {
    nextCard();
  };

  // 3. 全域鍵盤 (包含結束畫面的 Enter)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((status === 'success' || status === 'failure') && e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      }
      // 結束畫面按 Enter 回列表
      if (status === 'finished' && e.key === 'Enter') {
        e.preventDefault();
        navigate('/library');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [status]);

  // ... Renders ...

  if (!currentCard && status !== 'finished') return <div className="p-10 text-center">載入中...</div>;

  if (status === 'finished') {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-6 bg-slate-50 dark:bg-slate-950">
        <div className="text-4xl font-bold font-serif text-primary">練習完成！</div>
        <Button onClick={() => navigate('/library')}>回到題庫 (Enter)</Button>
      </div>
    );
  }

  // Helper
  const CorrectAnswerDisplay = () => {
    if (currentCard.type === 'term') {
      const blocks = currentCard.content.blocks || [];
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
    return <div className="text-xl font-bold dark:text-slate-200">{currentCard.content.answer}</div>;
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 cursor-default">
      <header className="h-16 px-6 flex items-center justify-between border-b bg-white dark:bg-slate-900 shrink-0">
        <Button variant="ghost" size="icon" onClick={handleExit}><X className="h-5 w-5" /></Button>
        <div className="flex-1 max-w-md mx-4"><Progress value={((currentIndex + 1) / cards.length) * 100} className="h-2" /></div>
        <div className="text-sm font-medium text-slate-500">{currentIndex + 1} / {cards.length}</div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-12 pb-32">
        
        {currentCard.type !== 'flashcard' && (
          <div className="text-center space-y-6">
            <h2 className="text-5xl font-serif font-bold text-slate-800 dark:text-slate-100 leading-tight">
              {currentCard.type === 'fill_blank' 
                ? currentCard.content.stem.split('___').map((part, i, arr) => (
                    <span key={i}>{part}{i < arr.length - 1 && <span className="inline-block w-16 border-b-4 border-slate-300 mx-2"></span>}</span>
                  ))
                : currentCard.content.stem
              }
            </h2>
            <p className="text-lg text-slate-500 max-w-lg mx-auto">
               {status !== 'question' && currentCard.content.meaning}
            </p>
          </div>
        )}

        {/* 
           ▼▼▼ 關鍵修正：加上 key={currentCard.id} ▼▼▼ 
           這會強制 React 銷毀舊的 Mode 組件並建立新的，
           徹底清除任何上一題殘留的 State。
        */}
        {currentCard.type === 'term' && (
          <TermMode key={currentCard.id} card={currentCard} status={status} onSubmit={(res) => handleAnswerSubmit(res)} />
        )}
        {currentCard.type === 'choice' && (
          <ChoiceMode key={currentCard.id} card={currentCard} status={status} onSubmit={(res) => handleAnswerSubmit(res)} />
        )}
        {currentCard.type === 'fill_blank' && (
          <FillMode key={currentCard.id} card={currentCard} status={status} onSubmit={(res) => handleAnswerSubmit(res)} />
        )}
        {currentCard.type === 'flashcard' && (
          <FlashcardMode key={currentCard.id} card={currentCard} status={status} onRate={(rem) => handleAnswerSubmit(true, rem ? 5 : 1)} />
        )}

        {currentCard.type !== 'flashcard' && (
          <div className="min-h-24 flex items-center justify-center w-full">
            {status === 'success' && (
              <div className="flex flex-col items-center gap-4 animate-in slide-in-from-bottom-4 fade-in">
                <div className="flex items-center gap-2 text-emerald-600 text-xl font-bold">
                  <CheckCircle className="h-6 w-6" /> 正確！
                </div>
                <Button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700">下一題 (Enter)</Button>
              </div>
            )}
            {status === 'failure' && (
              <div className="flex flex-col items-center gap-6 animate-in slide-in-from-bottom-4 fade-in w-full max-w-lg">
                <div className="flex items-center gap-2 text-destructive text-xl font-bold">
                  <XCircle className="h-6 w-6" /> 錯誤
                </div>
                <div className="flex flex-col items-center gap-2 p-4 bg-slate-100 dark:bg-slate-900 rounded-lg w-full">
                  <span className="text-sm text-slate-500 font-medium">正確答案</span>
                  <CorrectAnswerDisplay />
                </div>
                <Button onClick={handleNext} variant="secondary" className="w-full sm:w-auto">繼續</Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}