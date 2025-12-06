import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Card } from "@/types/schema";
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
  }, [status, isFlipped]);

  return (
    <div className="w-full max-w-md perspective-1000 h-80">
      <div 
        className={cn(
          "relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer",
          isFlipped ? "rotate-y-180" : ""
        )}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 border-2 rounded-2xl flex flex-col items-center justify-center p-8 shadow-sm">
          <h2 className="text-5xl font-bold mb-4 text-center wrap-break-word w-full">{card.content.stem}</h2>
          <p className="text-slate-400 text-sm animate-pulse">點擊翻面 (Space)</p>
        </div>
        
        <div className="absolute inset-0 backface-hidden bg-slate-50 dark:bg-slate-800 border-2 border-primary rounded-2xl flex flex-col items-center justify-center p-8 shadow-sm rotate-y-180">
          <div className="text-lg text-center mb-6 whitespace-pre-wrap overflow-y-auto w-full max-h-[180px]">
            {card.content.meaning}
          </div>
          {card.content.audioUrl && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => { e.stopPropagation(); new Audio(card.content.audioUrl).play(); }}
            >
              播放發音
            </Button>
          )}
        </div>
      </div>

      {isFlipped && (
        <div className="flex justify-center gap-4 mt-8 animate-in fade-in slide-in-from-top-2">
          <Button variant="destructive" className="w-32" onClick={() => onRate(false)}>忘記了 (1)</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 w-32" onClick={() => onRate(true)}>記住了 (2)</Button>
        </div>
      )}
    </div>
  );
}