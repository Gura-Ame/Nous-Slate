import { Button } from "@/components/ui/button";
import { speak } from "@/lib/tts";
import { cn } from "@/lib/utils";
import type { Card } from "@/types/schema";
import { Volume2 } from "lucide-react";
import { useEffect, useState } from "react";

interface FlashcardModeProps {
  card: Card;
  status: string;
  onRate: (remembered: boolean) => void;
}

export function FlashcardMode({ card, status, onRate }: FlashcardModeProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
  }, [card.id]);

  useEffect(() => {
    if (status !== 'question') return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        setIsFlipped(p => !p);
      } else if (isFlipped) {
        if (e.key === '1') onRate(false);
        if (e.key === '2') onRate(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [status, isFlipped, onRate]);

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (card.content.audioUrl) {
      new Audio(card.content.audioUrl).play();
    } else {
      speak(card.content.stem);
    }
  };

  return (
    // 修改：h-[400px] 改為 h-[50vh] max-h-[500px]，確保在各種螢幕都大致居中
    <div className="w-full max-w-md perspective-1000 h-[50vh] max-h-[500px] flex flex-col justify-center">
      <div 
        className={cn(
          "relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer",
          isFlipped ? "rotate-y-180" : ""
        )}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* --- Front (正面) --- */}
        <div className={cn(
          "absolute inset-0 backface-hidden bg-white dark:bg-slate-900 border-2 rounded-2xl flex flex-col items-center justify-center p-8 shadow-xl hover:shadow-2xl transition-all",
          isFlipped ? "invisible pointer-events-none" : "visible"
        )}>
          {card.content.image ? (
            <>
              <img 
                src={card.content.image} 
                alt="Flashcard" 
                className="h-32 w-auto object-contain mb-4 rounded-md"
              />
              <h2 className="text-3xl font-bold mb-2 text-center wrap-break-word w-full">
                {card.content.stem}
              </h2>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center w-full">
              <h2 className="text-6xl font-bold text-center wrap-break-word leading-tight">
                {card.content.stem}
              </h2>
            </div>
          )}

          <p className="text-slate-400 text-sm animate-pulse mt-auto pt-4">
            點擊翻面 (Space)
          </p>
        </div>
        
        {/* --- Back (背面) --- */}
        <div className={cn(
          "absolute inset-0 backface-hidden bg-slate-50 dark:bg-slate-800 border-2 border-primary rounded-2xl flex flex-col items-center justify-center p-8 shadow-xl rotate-y-180",
          !isFlipped ? "invisible pointer-events-none" : "visible"
        )}>
          <div className="text-lg text-center mb-6 whitespace-pre-wrap overflow-y-auto w-full flex-1 flex flex-col justify-center leading-relaxed">
            {card.content.meaning}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePlayAudio}
            className="gap-2 shrink-0 mt-auto"
          >
            <Volume2 className="h-4 w-4" />
            {card.content.audioUrl ? "播放發音" : "朗讀 (TTS)"}
          </Button>
        </div>
      </div>

      {/* 評分按鈕 (優化顏色) */}
      {isFlipped && (
        // 使用 absolute positioning 讓按鈕懸浮在卡片下方，不影響卡片本身的置中
        <div className="absolute -bottom-20 left-0 right-0 flex justify-center gap-6 animate-in fade-in slide-in-from-top-2">
          
          {/* 忘記了：使用 Rose 色系，實心背景 */}
          <Button 
            className="w-32 bg-rose-500 hover:bg-rose-600 text-white border-rose-600 shadow-md font-bold text-lg h-12" 
            onClick={() => onRate(false)}
          >
            <span className="mr-2 opacity-70 text-sm font-normal">1</span> 忘記了
          </Button>
          
          {/* 記住了：使用 Emerald 色系，實心背景 */}
          <Button 
            className="w-32 bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-md font-bold text-lg h-12" 
            onClick={() => onRate(true)}
          >
            <span className="mr-2 opacity-70 text-sm font-normal">2</span> 記住了
          </Button>
        </div>
      )}
    </div>
  );
}