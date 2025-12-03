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
  
  // Zustand Store
  const { 
    cards, currentIndex, status, 
    startQuiz, submitAnswer, nextCard 
  } = useQuizStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [textInput, setTextInput] = useState("");
  const [userInputs, setUserInputs] = useState<BopomofoChar[]>([]);
  
  const currentCard = cards[currentIndex];

  // 1. 初始化：載入題庫
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
  }, [deckId, startQuiz, navigate]);

  // 2. 題目切換時的重置與初始化
  useEffect(() => {
    if (!currentCard || status !== 'question') return;

    // A. 選擇題：洗牌選項
    if (currentCard.type === 'choice') {
      // 修正 Error 2: answer 可能是 undefined，給予預設空字串
      const answer = currentCard.content.answer || "";
      const options = currentCard.content.options || [];
      // 確保陣列內都是 string
      const opts = [answer, ...options];
      setShuffledOptions(shuffleArray(opts));
    }
    // B. 填空題：清空輸入
    if (currentCard.type === 'fill_blank') {
      setTextInput("");
    }
    // C. 注音題：清空輸入
    if (currentCard.type === 'term') {
      setUserInputs([]);
    }
  }, [currentCard, status]);

  // 3. 自動 Focus 邏輯
  useEffect(() => {
    if (status === 'question' && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [status, currentIndex, currentCard?.type]);

  // 4. 全域鍵盤監聽
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((status === 'success' || status === 'failure') && e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [status]);

  useEffect(() => {
    // 只有在「選擇題」且「作答中」才生效
    if (status !== 'question' || currentCard?.type !== 'choice') return;

    const handleChoiceKeys = (e: KeyboardEvent) => {
      // 支援主鍵盤數字與 Numpad 數字
      const keyMap: Record<string, number> = {
        '1': 0, '2': 1, '3': 2, '4': 3,
        'NumPad1': 0, 'NumPad2': 1, 'NumPad3': 2, 'NumPad4': 3
      };

      if (keyMap[e.key] !== undefined) {
        const index = keyMap[e.key];
        // 確保選項存在
        if (shuffledOptions[index]) {
          handleChoiceSelect(shuffledOptions[index]);
        }
      }
    };

    window.addEventListener('keydown', handleChoiceKeys);
    return () => window.removeEventListener('keydown', handleChoiceKeys);
  }, [status, currentCard, shuffledOptions]); // 依賴 shuffledOptions 確保對應正確

  // --- 處理函式 ---

  const handleChoiceSelect = (selectedOption: string) => {
    if (status !== 'question') return;
    const isCorrect = selectedOption === currentCard.content.answer;
    submitAnswer(isCorrect);
  };

  const handleFillBlankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'question') return;
    // 安全存取 answer，若無則預設為空字串
    const targetAnswer = currentCard.content.answer || "";
    const isCorrect = textInput.trim() === targetAnswer;
    submitAnswer(isCorrect);
  };

  const { displayBuffer, handleKeyDown, resetBuffer } = useBopomofo((char) => {
    if (status !== 'question' || currentCard?.type !== 'term') return;
    setUserInputs(prev => [...prev, char]);
  });

  // 注音題自動檢查
  useEffect(() => {
    if (!currentCard || currentCard.type !== 'term' || status !== 'question') return;
    
    // 修正 Error 1: blocks 可能是 undefined，加上安全存取
    const blocks = currentCard.content.blocks || [];
    const targetLength = blocks.length;
    
    if (targetLength > 0 && userInputs.length === targetLength) {
      checkTermAnswer(userInputs);
    }
  }, [userInputs, currentCard, status]);

  const checkTermAnswer = (inputs: BopomofoChar[]) => {
    if (!currentCard) return;
    const normalize = (str: string) => str === " " ? "" : str;
    
    // 再次安全存取 blocks
    const blocks = currentCard.content.blocks || [];

    const isCorrect = inputs.every((input, idx) => {
      // 防呆：如果 blocks 長度不對
      if (!blocks[idx]) return false;

      const target = blocks[idx].zhuyin;
      
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
  };

  const handleFocus = () => inputRef.current?.focus();

  // --- Render 邏輯 ---

  if (!currentCard) return <div className="p-10 text-center">載入中...</div>;

  if (status === 'finished') {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-6 bg-slate-50 dark:bg-slate-950">
        <div className="text-4xl font-bold text-primary">練習完成！</div>
        <Button onClick={() => navigate('/library')}>回到題庫</Button>
      </div>
    );
  }

  // 介面：選擇題
  const renderChoiceQuiz = () => (
    <div className="w-full max-w-lg space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shuffledOptions.map((opt, idx) => {
          let btnVariant: "outline" | "default" | "destructive" = "outline";
          if (status !== 'question') {
            if (opt === currentCard.content.answer) btnVariant = "default";
          }

          return (
            <Button
              key={idx}
              variant={btnVariant}
              className="h-16 text-lg justify-start px-6 whitespace-normal text-left"
              onClick={() => handleChoiceSelect(opt)}
              disabled={status !== 'question'}
            >
              <span className="mr-3 text-muted-foreground font-mono text-sm border border-slate-200 dark:border-slate-700 px-1.5 rounded bg-slate-50 dark:bg-slate-800">
                {idx + 1}
              </span>
              {opt}
            </Button>
          );
        })}
      </div>
    </div>
  );

  // 介面：填空題
  const renderFillBlankQuiz = () => (
    <form onSubmit={handleFillBlankSubmit} className="w-full max-w-md flex gap-4">
      <input
        ref={inputRef}
        type="text"
        className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-lg ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        placeholder="請輸入答案..."
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        disabled={status !== 'question'}
        autoComplete="off"
      />
      <Button type="submit" size="lg" disabled={!textInput || status !== 'question'}>
        提交
      </Button>
    </form>
  );

  // 介面：國字注音題
  const renderTermQuiz = () => {
    // 安全存取 blocks
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
                if (status === 'success') {
                  blockStatus = 'correct';
                } else if (status === 'failure') {
                  const normalize = (str: string) => str === " " ? "" : str;
                  const target = block.zhuyin;
                  
                  const inputTone = normalize(inputChar.tone);
                  const targetTone = normalize(target.tone);

                  const inputStr = inputChar.initial + inputChar.medial + inputChar.final + inputTone;
                  const targetStr = target.initial + target.medial + target.final + targetTone;
                  
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
      </>
    );
  };

  // 介面：正確答案顯示
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
    <div 
      className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 cursor-default"
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
        
        <div className="text-center space-y-6">
          <h2 className="text-5xl font-serif font-bold text-slate-800 dark:text-slate-100 leading-tight">
            {currentCard.type === 'fill_blank' 
              ? currentCard.content.stem.split('___').map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className="inline-block w-16 border-b-4 border-slate-300 mx-2"></span>
                    )}
                  </span>
                ))
              : currentCard.content.stem
            }
          </h2>
          
          <p className="text-lg text-slate-500 max-w-lg mx-auto">
             {status !== 'question' && currentCard.content.meaning}
          </p>
        </div>

        {currentCard.type === 'choice' && renderChoiceQuiz()}
        {currentCard.type === 'fill_blank' && renderFillBlankQuiz()}
        {currentCard.type === 'term' && renderTermQuiz()}

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
                {renderCorrectAnswer()}
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