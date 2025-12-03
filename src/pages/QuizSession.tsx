import { CheckCircle, X, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

// Components
import { CharacterBlock } from "@/components/quiz/CharacterBlock";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { BopomofoChar } from "@/hooks/useBopomofo";
import { useBopomofo } from "@/hooks/useBopomofo";
import { CardService } from "@/services/card-service";
import { useQuizStore } from "@/store/useQuizStore";

export default function QuizSession() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  
  // Zustand Store
  const { 
    cards, currentIndex, status, 
    startQuiz, submitAnswer, nextCard 
  } = useQuizStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const [userInputs, setUserInputs] = useState<BopomofoChar[]>([]);
  
  const currentCard = cards[currentIndex];
  
  useEffect(() => {
    if (!deckId) return;
    const init = async () => {
      try {
        const data = await CardService.getCardsByDeck(deckId);
        if (data.length > 0) {
          startQuiz(data);
        } else {
          toast.error("這個題庫還沒有卡片");
          navigate(-1);
        }
      } catch (e) {
        toast.error("載入失敗");
      }
    };
    init();
  }, [deckId]);

  // 監聽輸入變化，自動提交
  useEffect(() => {
    if (!currentCard || status !== 'question') return;
    const targetLength = currentCard.content.blocks.length;
    if (userInputs.length > 0 && userInputs.length === targetLength) {
      checkAnswer(userInputs);
    }
  }, [userInputs, currentCard, status]);

  const { displayBuffer, handleKeyDown, resetBuffer } = useBopomofo((char) => {
    if (status !== 'question') return;
    setUserInputs(prev => [...prev, char]);
  });

  const checkAnswer = (inputs: BopomofoChar[]) => {
    if (!currentCard) return;

    const normalize = (str: string) => str === " " ? "" : str

    const isCorrect = inputs.every((input, idx) => {
      const target = currentCard.content.blocks[idx].zhuyin;
      
      // 比對邏輯：針對輕聲特別處理
      const inputTone = normalize(input.tone);
      const targetTone = normalize(target.tone);

      const inputStr = input.initial + input.medial + input.final + inputTone;
      const targetStr = target.initial + target.medial + target.final + targetTone;
      
      return inputStr === targetStr;
    });

    submitAnswer(isCorrect);
  };

  const handleNext = () => {
    setUserInputs([]);
    resetBuffer();
    nextCard();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 只有在 成功 或 失敗 狀態下，Enter 才有效
      if ((status === 'success' || status === 'failure') && e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [status, handleNext]); // 依賴 status 變化

  const handleFocus = () => inputRef.current?.focus();

  if (!currentCard) return <div className="p-10 text-center">載入中...</div>;

  if (status === 'finished') {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-6 bg-slate-50 dark:bg-slate-950">
        <div className="text-4xl font-bold font-serif text-primary">練習完成！</div>
        <Button onClick={() => navigate('/library')}>回到題庫</Button>
      </div>
    );
  }

  return (
    <div 
      className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 cursor-text"
      onClick={handleFocus}
    >
      <header className="h-16 px-6 flex items-center justify-between border-b bg-white dark:bg-slate-900 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <X className="h-5 w-5" />
        </Button>
        <div className="flex-1 max-w-md mx-4">
          <Progress 
            value={((currentIndex + 1) / cards.length) * 100} 
            className="h-2" 
          />
        </div>
        <div className="text-sm font-medium text-slate-500">
          {currentIndex + 1} / {cards.length}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
        
        {/* 題目區 */}
        <div className="text-center space-y-4">
          <h2 className="text-6xl font-serif font-bold text-slate-800 dark:text-slate-100 tracking-widest">
            {currentCard.content.stem}
          </h2>
          <p className="text-lg text-slate-500 max-w-lg mx-auto">
            {status !== 'question' && currentCard.content.meaning}
          </p>
        </div>

        {/* 輸入區 */}
        <div className="flex flex-wrap justify-center gap-4">
          {currentCard.content.blocks.map((block, index) => {
            const inputChar = userInputs[index];
            const isCurrent = index === userInputs.length;
            
            let displayBopomofo: BopomofoChar | string | undefined = undefined;
            let blockStatus: "default" | "active" | "filled" | "error" | "correct" = "default";

            if (inputChar) {
              displayBopomofo = inputChar;
              
              if (status === 'success') {
                blockStatus = 'correct';
              } else if (status === 'failure') {
                const target = block.zhuyin;
                const inputStr = inputChar.initial + inputChar.medial + inputChar.final + inputChar.tone;
                const targetStr = target.initial + target.medial + target.final + target.tone;
                
                // 只有錯的字變紅，對的字顯示綠色(correct)或普通色(filled)
                blockStatus = inputStr === targetStr ? 'correct' : 'error';
              } else {
                blockStatus = 'filled';
              }
            } else if (isCurrent && status === 'question') {
              displayBopomofo = displayBuffer;
              blockStatus = 'active';
            }

            return (
              <CharacterBlock
                key={index}
                char={block.char} 
                bopomofo={displayBopomofo}
                status={blockStatus}
              />
            );
          })}
        </div>

        <input
          ref={inputRef}
          type="url"
          className="opacity-0 absolute w-0 h-0 pointer-events-none"
          onKeyDown={handleKeyDown}
          autoFocus
          disabled={status !== 'question'}
        />

        {/* 結果回饋區 */}
        <div className="min-h-24 flex items-center justify-center w-full">
          {status === 'success' && (
            <div className="flex flex-col items-center gap-4 animate-in slide-in-from-bottom-4 fade-in">
              <div className="flex items-center gap-2 text-emerald-600 text-xl font-bold">
                <CheckCircle className="h-6 w-6" /> 正確！
              </div>
              <Button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700">
                下一題 (Enter)
              </Button>
            </div>
          )}

          {status === 'failure' && (
            <div className="flex flex-col items-center gap-6 animate-in slide-in-from-bottom-4 fade-in w-full max-w-lg">
              <div className="flex items-center gap-2 text-destructive text-xl font-bold">
                <XCircle className="h-6 w-6" /> 錯誤
              </div>
              
              <div className="flex flex-col items-center gap-2 p-4 bg-slate-100 dark:bg-slate-900 rounded-lg w-full">
                <span className="text-sm text-slate-500 font-medium">正確答案</span>
                <div className="flex flex-wrap justify-center gap-3">
                  {currentCard.content.blocks.map((block, i) => {
                    const zhuyin = block.zhuyin.initial + block.zhuyin.medial + block.zhuyin.final + block.zhuyin.tone;
                    return (
                      <div key={i} className="flex flex-col items-center">
                        <span className="text-lg font-serif text-slate-800 dark:text-slate-200">{block.char}</span>
                        <span className="text-sm font-serif text-primary">{zhuyin}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <Button onClick={handleNext} variant="secondary" className="w-full sm:w-auto">
                繼續
              </Button>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}