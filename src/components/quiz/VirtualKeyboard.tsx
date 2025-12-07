import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowBigUp, Delete } from "lucide-react";

interface VirtualKeyboardProps {
  onInput: (char: string) => void;
  onDelete: () => void;
  className?: string;
}

const ROWS = [
  // Row 1: 加入 Backspace (DEL) 在最後
  ["ㄅ", "ㄉ", "ˇ", "ˋ", "ㄓ", "ˊ", "˙", "ㄚ", "ㄞ", "ㄢ", "ㄦ", "DEL"],
  // Row 2
  ["ㄆ", "ㄊ", "ㄍ", "ㄐ", "ㄔ", "ㄗ", "ㄧ", "ㄛ", "ㄟ", "ㄣ"],
  // Row 3
  ["ㄇ", "ㄋ", "ㄎ", "ㄑ", "ㄕ", "ㄘ", "ㄨ", "ㄜ", "ㄠ", "ㄤ", "ㄥ"],
  // Row 4
  ["ㄈ", "ㄌ", "ㄏ", "ㄒ", "ㄖ", "ㄙ", "ㄩ", "ㄝ", "ㄡ"]
];

export function VirtualKeyboard({ onInput, onDelete, className }: VirtualKeyboardProps) {
  
  const handlePress = (e: React.PointerEvent, action: () => void) => {
    e.preventDefault();
    action();
  };

  return (
    <div 
      className={cn(
        // 修正：移除 border-slate-300，背景改為更乾淨的顏色
        "fixed bottom-0 left-0 right-0 bg-slate-200 dark:bg-slate-900 p-1 pb-safe z-50 select-none touch-none shadow-inner",
        className
      )}
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-1.5 p-1">
        {ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 w-full">
            
            {/* Row 4 左側裝飾 Shift */}
            {rowIndex === 3 && (
              <Button 
                variant="ghost" 
                className="flex-[1.5] h-10 sm:h-12 bg-slate-300 dark:bg-slate-800 shadow-sm rounded-md"
                disabled
              >
                <ArrowBigUp className="h-5 w-5 text-slate-500" />
              </Button>
            )}

            {row.map((char) => {
              // 特殊處理 Backspace (在第一排最後一個)
              if (char === "DEL") {
                return (
                  <Button
                    key="del"
                    variant="secondary"
                    className="flex-[1.5] h-10 sm:h-12 bg-slate-300 dark:bg-slate-700 shadow-sm rounded-md active:scale-95 transition-transform"
                    onPointerDown={(e) => handlePress(e, onDelete)}
                  >
                    <Delete className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                  </Button>
                );
              }

              return (
                <Button
                  key={char}
                  variant="secondary"
                  className="flex-1 h-10 sm:h-12 text-lg sm:text-xl font-serif bg-white dark:bg-slate-800 shadow-[0_1px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-px rounded-md px-0"
                  onPointerDown={(e) => handlePress(e, () => onInput(char))}
                >
                  {char}
                </Button>
              );
            })}

            {/* Row 4 右側留白或放 Enter (這裡留白讓版面平衡) */}
            {rowIndex === 3 && (
               <div className="flex-[1.5]" /> 
            )}
          </div>
        ))}
        
        {/* Row 5: 空白鍵 */}
        <div className="flex justify-center gap-1.5 mt-1">
           <Button variant="ghost" className="w-12 bg-slate-300 dark:bg-slate-700 text-slate-500 rounded-md">123</Button>
           <Button variant="ghost" className="w-12 bg-slate-300 dark:bg-slate-700 text-slate-500 rounded-md">🌐</Button>
           
           <Button 
             variant="secondary" 
             className="flex-4 h-10 sm:h-12 bg-white dark:bg-slate-800 shadow-sm rounded-md text-slate-400 font-serif"
             onPointerDown={(e) => handlePress(e, () => onInput(" "))}
           >
             一聲 (Space)
           </Button>
           
           <Button variant="ghost" className="w-24 bg-slate-300 dark:bg-slate-700 text-slate-500 rounded-md">Enter</Button>
        </div>

      </div>
    </div>
  );
}