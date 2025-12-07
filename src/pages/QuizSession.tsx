import { PageLoading } from "@/components/shared/PageLoading";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// 1. 引入 Logic Hook
import { useQuizController } from "@/hooks/useQuizController";

// 2. 引入 UI Components
import { ExitDialog } from "@/components/quiz/session/ExitDialog";
import { QuizArea } from "@/components/quiz/session/QuizArea";
import { QuizFeedback } from "@/components/quiz/session/QuizFeedback";
import { QuizHeader } from "@/components/quiz/session/QuizHeader";

export default function QuizSession() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // 3. 使用 Hook 取得所有狀態與控制函式
  const {
    authLoading,
    isLoading,
    isProcessing,
    status,
    cards,
    currentIndex,
    currentCard,
    showExitDialog,
    setShowExitDialog,
    handleAnswer,
    handleNext,
    handleExitClick,
    confirmExit
  } = useQuizController();

  // 4. 全域鍵盤監聽 (只處理 Enter)
  // (個別題型的鍵盤邏輯，已經封裝在 TermMode/ChoiceMode 裡面了)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((status === 'success' || status === 'failure') && e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      }
      if (status === 'finished' && e.key === 'Enter') {
        e.preventDefault();
        navigate('/library');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [status, handleNext, navigate]);

  // --- Renders ---

  if (authLoading || isLoading) return <PageLoading message="準備練習中..." />;

  if (status === 'finished') {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-6 bg-slate-50 dark:bg-slate-950 animate-in fade-in zoom-in duration-500">
        <CheckCircle className="w-24 h-24 text-emerald-500 mb-4" />
        <div className="text-4xl font-bold font-serif text-slate-800 dark:text-slate-100">練習完成！</div>
        <p className="text-muted-foreground">本次練習：{cards.length} 題</p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate('/review')}>回到複習中心</Button>
          <Button onClick={() => navigate('/library')}>探索新題庫</Button>
        </div>
        <p className="text-xs text-slate-400 mt-8">按 Enter 返回</p>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4 bg-slate-50 dark:bg-slate-950">
        <div className="text-xl font-bold text-slate-700 dark:text-slate-300">⚠️ 無法載入題目</div>
        <Button onClick={() => navigate(-1)} variant="outline">返回</Button>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 cursor-default outline-none"
      tabIndex={0}
    >
      <QuizHeader 
        currentIndex={currentIndex} 
        total={cards.length} 
        onExit={handleExitClick} 
      />

      <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-12 pb-32 overflow-y-auto">
        
        {/* 中間：題目與作答區 */}
        <QuizArea 
          card={currentCard} 
          status={status} 
          onAnswer={handleAnswer} 
        />

        {/* 底部：結果回饋區 */}
        <div className="min-h-24 flex items-center justify-center w-full">
          <QuizFeedback 
            status={status} 
            card={currentCard} 
            isProcessing={isProcessing} 
            onNext={handleNext} 
          />
        </div>

      </main>

      {/* 退出確認對話框 */}
      <ExitDialog 
        open={showExitDialog} 
        onOpenChange={setShowExitDialog} 
        onConfirm={confirmExit} 
      />
    </div>
  );
}