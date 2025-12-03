import { CheckCircle, X, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

// Components & Hooks
import { CharacterBlock } from "@/components/quiz/CharacterBlock";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth"; // 需要 User ID
import type { BopomofoChar } from "@/hooks/useBopomofo";
import { useBopomofo } from "@/hooks/useBopomofo";
import { cn } from "@/lib/utils";

// Services
import type { Grade } from "@/lib/srs-algo";
import { CardService } from "@/services/card-service";
import { ReviewService } from "@/services/review-service"; // 新增
import { useQuizStore } from "@/store/useQuizStore";

// Utils
function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default function QuizSession() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { 
    cards, currentIndex, status, 
    startQuiz, submitAnswer: updateStoreStats, nextCard 
  } = useQuizStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [textInput, setTextInput] = useState("");
  const [userInputs, setUserInputs] = useState<BopomofoChar[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = cards[currentIndex];

  // --- 初始化與重置 ---

  useEffect(() => {
    setIsFlipped(false);
    setTextInput("");
    setUserInputs([]);
    
    if (currentCard?.type === 'choice' && status === 'question') {
      const opts = [currentCard.content.answer || "", ...(currentCard.content.options || [])];
      setShuffledOptions(shuffleArray(opts));
    }
  }, [currentIndex, status, currentCard]); // 加入 currentIndex 確保切題時重置

  useEffect(() => {
    if (!deckId) return;
    const init = async () => {
      try {
        const data = await CardService.getCardsByDeck(deckId);
        if (data.length > 0) startQuiz(data);
        else {
          toast.error("這個題庫還沒有卡片");
          navigate(-1);
        }
      } catch (e) {
        toast.error("載入失敗");
      }
    };
    init();
  }, [deckId, startQuiz, navigate]);

  // --- 核心邏輯：提交答案與 SRS ---

  const processAnswer = async (isCorrect: boolean, grade: Grade) => {
    // 1. 更新前端 Store 狀態 (計數器)
    updateStoreStats(isCorrect);

    // 2. 寫入後端 SRS (如果已登入)
    if (user && deckId && currentCard) {
      // 不等待寫入完成，直接繼續 UI 流程 (Optimistic UI)
      ReviewService.submitReview(user.uid, deckId, currentCard.id, grade);
    }

    // 3. 特殊流程：如果是 Flashcard，直接跳下一題，不顯示回饋畫面
    if (currentCard.type === 'flashcard') {
      handleNext(); 
    }
  };

  const handleNext = () => {
    setUserInputs([]);
    nextCard(); // Zustand 切換到下一題
    // 自動 Focus
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // --- 各題型 Handler ---

  // Flashcard: 記住了(5分) / 忘記了(1分)
  const handleFlashcardRate = (remembered: boolean) => {
    const grade = remembered ? 5 : 1;
    processAnswer(remembered, grade);
  };

  // Choice
  const handleChoiceSelect = (selectedOption: string) => {
    if (status !== 'question') return;
    const isCorrect = selectedOption === currentCard.content.answer;
    processAnswer(isCorrect, isCorrect ? 5 : 1);
  };

  // Fill Blank
  const handleFillBlankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'question') return;
    const isCorrect = textInput.trim() === currentCard.content.answer;
    processAnswer(isCorrect, isCorrect ? 5 : 1);
  };

  // Term (Auto check)
  const checkTermAnswer = (inputs: BopomofoChar[]) => {
    if (!currentCard) return;
    const normalize = (str: string) => str === " " ? "" : str;
    const blocks = currentCard.content.blocks || [];

    const isCorrect = inputs.every((input, idx) => {
      if (!blocks[idx]) return false;
      const target = blocks[idx].zhuyin;
      const inputStr = input.initial + input.medial + input.final + normalize(input.tone);
      const targetStr = target.initial + target.medial + target.final + normalize(target.tone);
      return inputStr === targetStr;
    });

    processAnswer(isCorrect, isCorrect ? 5 : 1);
  };

  // --- Input Hooks & Effects ---

  const { displayBuffer, handleKeyDown } = useBopomofo((char) => {
    if (status !== 'question' || currentCard?.type !== 'term') return;
    setUserInputs(prev => [...prev, char]);
  });

  useEffect(() => {
    if (currentCard?.type === 'term' && status === 'question') {
      const targetLength = currentCard.content.blocks?.length || 0;
      if (targetLength > 0 && userInputs.length === targetLength) {
        checkTermAnswer(userInputs);
      }
    }
  }, [userInputs, currentCard, status]);

  // Auto Focus
  useEffect(() => {
    if (status === 'question' && inputRef.current) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [status, currentIndex]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 成功/失敗畫面按 Enter 下一題
      if ((status === 'success' || status === 'failure') && e.key === 'Enter') {
        e.preventDefault();
        handleNext();
        return;
      }
      // 選擇題數字鍵
      if (status === 'question' && currentCard?.type === 'choice') {
        const keyMap: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3 };
        if (keyMap[e.key] !== undefined && shuffledOptions[keyMap[e.key]]) {
          handleChoiceSelect(shuffledOptions[keyMap[e.key]]);
        }
      }
      // Flashcard 快捷鍵 (Space 翻面, 1 忘記, 2 記得)
      if (status === 'question' && currentCard?.type === 'flashcard') {
        if (e.key === ' ') {
          e.preventDefault();
          setIsFlipped(prev => !prev);
        } else if (isFlipped) {
          if (e.key === '1') handleFlashcardRate(false);
          if (e.key === '2') handleFlashcardRate(true);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [status, currentCard, shuffledOptions, isFlipped]);

  const handleFocus = () => inputRef.current?.focus();

  // --- Render ---

  if (!currentCard) return <div className="p-10 text-center">載入中...</div>;

  if (status === 'finished') {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-6 bg-slate-50 dark:bg-slate-950">
        <div className="text-4xl font-bold font-serif text-primary">練習完成！</div>
        <Button onClick={() => navigate('/library')}>回到題庫</Button>
      </div>
    );
  }

  // Renders... (Choice, FillBlank, Term 保持不變，省略以節省篇幅)
  const renderChoiceQuiz = () => (
    <div className="w-full max-w-lg space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shuffledOptions.map((opt, idx) => {
          let btnVariant: "outline" | "default" | "destructive" = "outline";
          if (status !== 'question') {
            if (opt === currentCard.content.answer) btnVariant = "default";
            else if (opt !== currentCard.content.answer) btnVariant = "destructive"; // 標示錯誤
          }
          return (
            <Button
              key={idx}
              variant={btnVariant}
              className="h-16 text-lg justify-start px-6 whitespace-normal text-left"
              onClick={() => handleChoiceSelect(opt)}
              disabled={status !== 'question'}
            >
              <span className="mr-3 text-muted-foreground font-mono text-sm border border-slate-200 dark:border-slate-700 px-1.5 rounded bg-slate-50 dark:bg-slate-800">{idx + 1}</span>
              {opt}
            </Button>
          );
        })}
      </div>
    </div>
  );

  const renderFillBlankQuiz = () => (
    <form onSubmit={handleFillBlankSubmit} className="w-full max-w-md flex gap-4">
      <input ref={inputRef} type="text" className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-lg focus-visible:ring-2 focus-visible:ring-ring" placeholder="請輸入答案..." value={textInput} onChange={(e) => setTextInput(e.target.value)} disabled={status !== 'question'} autoComplete="off" />
      <Button type="submit" size="lg" disabled={!textInput || status !== 'question'}>提交</Button>
    </form>
  );

  const renderTermQuiz = () => {
    const blocks = currentCard.content.blocks || [];
    return (
      <>
        <div className="flex flex-wrap justify-center gap-4">
          {blocks.map((block, index) => {
            const inputChar = userInputs[index];
            const isCurrent = index === userInputs.length;
            let displayBopomofo: BopomofoChar | string | undefined = undefined;
            let blockStatus: "default" | "active" | "filled" | "error" | "correct" = "default";

            if (inputChar) {
              displayBopomofo = inputChar;
              if (status === 'success') blockStatus = 'correct';
              else if (status === 'failure') {
                 // 詳細比對
                 const normalize = (s: string) => s === " " ? "" : s;
                 const target = block.zhuyin;
                 const iStr = inputChar.initial + inputChar.medial + inputChar.final + normalize(inputChar.tone);
                 const tStr = target.initial + target.medial + target.final + normalize(target.tone);
                 blockStatus = iStr === tStr ? 'correct' : 'error';
              } else blockStatus = 'filled';
            } else if (isCurrent && status === 'question') {
              displayBopomofo = displayBuffer;
              blockStatus = 'active';
            }
            return <CharacterBlock key={index} char={block.char} bopomofo={displayBopomofo} status={blockStatus} />;
          })}
        </div>
        <input ref={inputRef} type="url" className="opacity-0 absolute w-0 h-0 pointer-events-none" onKeyDown={handleKeyDown} autoFocus disabled={status !== 'question'} />
      </>
    );
  };

  const renderFlashcardQuiz = () => (
    <div className="w-full max-w-md perspective-1000 h-80">
      <div 
        className={cn(
          "relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer",
          isFlipped ? "rotate-y-180" : ""
        )}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 border-2 rounded-2xl flex flex-col items-center justify-center p-8 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-5xl font-bold mb-4 text-center wrap-break-word w-full">{currentCard.content.stem}</h2>
          <p className="text-slate-400 text-sm animate-pulse">點擊翻面 (Space)</p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden bg-slate-50 dark:bg-slate-800 border-2 border-primary rounded-2xl flex flex-col items-center justify-center p-8 shadow-sm rotate-y-180">
          <div className="text-lg text-center mb-6 whitespace-pre-wrap overflow-y-auto max-h-[180px] w-full">
            {currentCard.content.meaning}
          </div>
          {currentCard.content.audioUrl && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                new Audio(currentCard.content.audioUrl).play();
              }}
            >
              播放發音
            </Button>
          )}
        </div>
      </div>

      {isFlipped && (
        <div className="flex justify-center gap-4 mt-8 animate-in fade-in slide-in-from-top-2">
          <Button variant="destructive" className="w-32" onClick={() => handleFlashcardRate(false)}>
            <span className="mr-2 opacity-50">1</span> 忘記了
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 w-32" onClick={() => handleFlashcardRate(true)}>
            <span className="mr-2 opacity-50">2</span> 記住了
          </Button>
        </div>
      )}
    </div>
  );

  // 正確答案顯示
  const renderCorrectAnswer = () => {
    if (currentCard.type === 'term') {
      const blocks = currentCard.content.blocks || [];
      return (
        <div className="flex flex-wrap justify-center gap-3">
          {blocks.map((block, i) => {
            const zhuyin = block.zhuyin.initial + block.zhuyin.medial + block.zhuyin.final + block.zhuyin.tone;
            return (
              <div key={i} className="flex flex-col items-center">
                <span className="text-lg font-serif text-slate-800 dark:text-slate-200">{block.char}</span>
                <span className="text-sm font-serif text-primary">{zhuyin}</span>
              </div>
            )
          })}
        </div>
      );
    } else {
      return (
        <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
          {currentCard.content.answer}
        </div>
      );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 cursor-default" onClick={handleFocus}>
      <header className="h-16 px-6 flex items-center justify-between border-b bg-white dark:bg-slate-900 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><X className="h-5 w-5" /></Button>
        <div className="flex-1 max-w-md mx-4"><Progress value={((currentIndex + 1) / cards.length) * 100} className="h-2" /></div>
        <div className="text-sm font-medium text-slate-500">{currentIndex + 1} / {cards.length}</div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
        {/* 對於 Flashcard，我們隱藏上方的題目顯示，因為卡片正面就是題目 */}
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

        {currentCard.type === 'choice' && renderChoiceQuiz()}
        {currentCard.type === 'fill_blank' && renderFillBlankQuiz()}
        {currentCard.type === 'term' && renderTermQuiz()}
        {currentCard.type === 'flashcard' && renderFlashcardQuiz()}

        {/* 只有非 Flashcard 題型才顯示下方的成功/失敗區 */}
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
                  {renderCorrectAnswer()}
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