// src/hooks/useBopomofo.ts
import { getZhuyinType, KEY_MAP, TONES } from "@/lib/zhuyin-map";
import { useCallback, useState } from "react";

// 一個注音字的結構
export interface BopomofoChar {
  initial: string; // 聲母 (e.g., ㄅ)
  medial: string;  // 介音 (e.g., ㄧ)
  final: string;   // 韻母 (e.g., ㄢ)
  tone: string;    // 聲調 (e.g., ˇ)
}

const EMPTY_CHAR: BopomofoChar = { initial: "", medial: "", final: "", tone: "" };

export function useBopomofo(
  onCommit: (char: BopomofoChar) => void // 當使用者按 Enter 或聲調鍵完成一個字時觸發
) {
  // 當前正在拼湊的字 (Buffer)
  const [buffer, setBuffer] = useState<BopomofoChar>(EMPTY_CHAR);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const key = e.key.toLowerCase();

    // 1. 處理刪除鍵 (Backspace) - 逐符號刪除
    if (key === "backspace") {
      setBuffer((prev) => {
        // 優先刪除聲調
        if (prev.tone) return { ...prev, tone: "" };
        // 再來刪除韻母
        if (prev.final) return { ...prev, final: "" };
        // 再來刪除介音
        if (prev.medial) return { ...prev, medial: "" };
        // 最後刪除聲母
        if (prev.initial) return { ...prev, initial: "" };
        return prev;
      });
      return;
    }

    // 2. 處理聲調鍵 (3, 4, 6, 7, Space)
    // Space 比較特別，它代表「一聲」
    if (key === " " || key === "3" || key === "4" || key === "6" || key === "7") {
      e.preventDefault(); // 防止網頁捲動

      let toneSymbol = "";
      if (key === "3") toneSymbol = TONES[3];
      else if (key === "4") toneSymbol = TONES[4];
      else if (key === "6") toneSymbol = TONES[2]; // 鍵盤上的 6 對應二聲
      else if (key === "7") toneSymbol = TONES[5]; // 鍵盤上的 7 對應輕聲
      else if (key === " ") toneSymbol = TONES[1]; // 空白鍵 對應一聲 (空字串)

      // 更新 Buffer 並 Commit
      const newBuffer = { ...buffer, tone: toneSymbol };
      setBuffer(EMPTY_CHAR); // 清空緩衝區
      onCommit(newBuffer);   // 提交這個字
      return;
    }

    // 3. 處理注音符號輸入
    const zhuyin = KEY_MAP[key];
    if (zhuyin) {
      const type = getZhuyinType(zhuyin);

      setBuffer((prev) => {
        // Microsoft Logic: 同類型的符號，後者覆蓋前者
        // 例如：已輸入 'ㄅ' (initial), 再輸入 'ㄉ' (initial) -> 變成 'ㄉ'
        if (type === "initial") return { ...prev, initial: zhuyin };
        if (type === "medial") return { ...prev, medial: zhuyin };
        if (type === "final") return { ...prev, final: zhuyin };
        return prev;
      });
    }
  }, [buffer, onCommit]);

  // 輔助：將目前的 Buffer 轉成顯示用的字串 (e.g., "ㄅㄧㄢ")
  const displayBuffer = 
    buffer.initial + buffer.medial + buffer.final + buffer.tone;

  return {
    buffer,
    displayBuffer,
    handleKeyDown,
    resetBuffer: () => setBuffer(EMPTY_CHAR)
  };
}