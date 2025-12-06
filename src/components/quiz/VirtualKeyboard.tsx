import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowBigUp, Delete } from "lucide-react"; // 引入 Shift 圖示 (雖然我們用不到 Shift 功能，但為了還原外觀)

interface VirtualKeyboardProps {
  onInput: (char: string) => void;
  onDelete: () => void;
  className?: string;
}

// 依照圖片還原 iOS/Mac 風格的大千式排列
// 注意：這裡直接送出「注音符號」，而不是鍵盤代碼
const ROWS = [
  // 第一排: ㄅ ㄉ ˇ ˋ ㄓ ˊ ˙ ㄚ ㄞ ㄢ ㄦ
  ["ㄅ", "ㄉ", "ˇ", "ˋ", "ㄓ", "ˊ", "˙", "ㄚ", "ㄞ", "ㄢ", "ㄦ"],
  // 第二排: ㄆ ㄊ ㄍ ㄐ ㄔ ㄗ ㄧ ㄛ ㄟ ㄣ
  ["ㄆ", "ㄊ", "ㄍ", "ㄐ", "ㄔ", "ㄗ", "ㄧ", "ㄛ", "ㄟ", "ㄣ"],
  // 第三排: ㄇ ㄋ ㄎ ㄑ ㄕ ㄘ ㄨ ㄜ ㄠ ㄤ ㄥ
  ["ㄇ", "ㄋ", "ㄎ", "ㄑ", "ㄕ", "ㄘ", "ㄨ", "ㄜ", "ㄠ", "ㄤ", "ㄥ"],
  // 第四排: ㄈ ㄌ ㄏ ㄒ ㄖ ㄙ ㄩ ㄝ ㄡ (左右留白給功能鍵)
  ["ㄈ", "ㄌ", "ㄏ", "ㄒ", "ㄖ", "ㄙ", "ㄩ", "ㄝ", "ㄡ"]
];

export function VirtualKeyboard({ onInput, onDelete, className }: VirtualKeyboardProps) {
  
  // 解決 "Unable to preventDefault inside passive event listener"
  // 我們改用 onPointerDown，這是比 onTouchStart 更現代的標準，且預設不是 passive
  const handlePress = (e: React.PointerEvent, action: () => void) => {
    e.preventDefault(); // 防止失去焦點 (Focus Loss)
    action();
  };

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-[#d1d5db] dark:bg-slate-900 border-t border-slate-300 p-1 pb-safe z-50 select-none touch-none", // touch-none 禁止瀏覽器預設手勢
        className
      )}
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-1.5 p-1">
        {ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1.5 w-full">
            
            {/* 第四排左側補一個 Shift 鍵 (裝飾用，還原佈局) */}
            {rowIndex === 3 && (
              <Button 
                variant="secondary" 
                className="flex-1 max-w-6 sm:max-w-12 h-10 sm:h-12 bg-slate-100 shadow-sm rounded-md"
                disabled
              >
                <ArrowBigUp className="h-5 w-5 text-slate-400" />
              </Button>
            )}

            {row.map((char) => (
              <Button
                key={char}
                variant="secondary"
                // 解決 iPad 排版：使用 flex-1 讓按鍵自動均分寬度，但設定 max-w 避免太寬
                className="flex-1 max-w-[2.2rem] sm:max-w-14 h-10 sm:h-12 text-lg sm:text-xl font-serif bg-white dark:bg-slate-800 shadow-[0_1px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-px rounded-md px-0"
                onPointerDown={(e) => handlePress(e, () => onInput(char))}
              >
                {char}
              </Button>
            ))}

            {/* 第四排右側：刪除鍵 */}
            {rowIndex === 3 && (
              <Button
                variant="secondary"
                className="flex-1 max-w-10 sm:max-w-16 h-10 sm:h-12 bg-slate-300 dark:bg-slate-700 shadow-[0_1px_0_rgba(0,0,0,0.2)] rounded-md"
                onPointerDown={(e) => handlePress(e, onDelete)}
              >
                <Delete className="h-5 w-5 sm:h-6 sm:w-6 text-slate-700 dark:text-slate-200" />
              </Button>
            )}
          </div>
        ))}
        
        {/* 第五排：空白鍵 (一聲) */}
        <div className="flex justify-center gap-1.5 mt-1">
           <Button variant="secondary" className="w-12 sm:w-16 h-10 sm:h-12 bg-slate-300 dark:bg-slate-700 text-slate-600 rounded-md shadow-sm">123</Button>
           <Button variant="secondary" className="w-12 sm:w-16 h-10 sm:h-12 bg-slate-300 dark:bg-slate-700 text-slate-600 rounded-md shadow-sm">🌐</Button>
           <Button variant="secondary" className="w-12 sm:w-16 h-10 sm:h-12 bg-slate-300 dark:bg-slate-700 text-slate-600 rounded-md shadow-sm">🎤</Button>
           
           <Button 
             variant="secondary" 
             className="flex-4 max-w-md h-10 sm:h-12 bg-white dark:bg-slate-800 shadow-sm rounded-md text-slate-400 font-serif"
             onPointerDown={(e) => handlePress(e, () => onInput(" "))}
           >
             一聲 (Space)
           </Button>
           
           <Button variant="secondary" className="w-12 sm:w-16 h-10 sm:h-12 bg-slate-300 dark:bg-slate-700 text-slate-600 rounded-md shadow-sm">Enter</Button>
        </div>

      </div>
    </div>
  );
}