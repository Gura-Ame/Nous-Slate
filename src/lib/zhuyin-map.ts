// src/lib/zhuyin-map.ts

export const INITIALS = [
  "ㄅ", "ㄆ", "ㄇ", "ㄈ", "ㄉ", "ㄊ", "ㄋ", "ㄌ", "ㄍ", "ㄎ", "ㄏ", 
  "ㄐ", "ㄑ", "ㄒ", "ㄓ", "ㄔ", "ㄕ", "ㄖ", "ㄗ", "ㄘ", "ㄙ"
] as const;

export const MEDIALS = ["ㄧ", "ㄨ", "ㄩ"] as const;

export const FINALS = [
  "ㄚ", "ㄛ", "ㄜ", "ㄝ", "ㄞ", "ㄟ", "ㄠ", "ㄡ", "ㄢ", "ㄣ", "ㄤ", "ㄥ", "ㄦ"
] as const;

// 這裡定義系統唯一認可的聲調符號
export const TONES = {
  1: " ",    // 一聲 (空白鍵)
  2: "ˊ",   // 二聲 (U+02CA)
  3: "ˇ",   // 三聲 (U+02C7)
  4: "ˋ",   // 四聲 (U+02CB)
  5: "˙",   // 輕聲 (U+02D9)
} as const;

export const TONE_SYMBOLS = Object.values(TONES);

export const KEY_MAP: Record<string, string> = {
  // 聲母
  "1": "ㄅ", "q": "ㄆ", "a": "ㄇ", "z": "ㄈ",
  "2": "ㄉ", "w": "ㄊ", "s": "ㄋ", "x": "ㄌ",
  "e": "ㄍ", "d": "ㄎ", "c": "ㄏ",
  "r": "ㄐ", "f": "ㄑ", "v": "ㄒ",
  "5": "ㄓ", "t": "ㄔ", "g": "ㄕ", "b": "ㄖ",
  "y": "ㄗ", "h": "ㄘ", "n": "ㄙ",
  
  // 介音 & 韻母
  "u": "ㄧ", "j": "ㄨ", "m": "ㄩ",
  "8": "ㄚ", "i": "ㄛ", "k": "ㄜ", ",": "ㄝ",
  "9": "ㄞ", "o": "ㄟ", "l": "ㄠ", ".": "ㄡ",
  "0": "ㄢ", "p": "ㄣ", ";": "ㄤ", "/": "ㄥ",
  "-": "ㄦ",
  
  // 聲調鍵映射
  " ": TONES[1],
  "6": TONES[2],
  "3": TONES[3],
  "4": TONES[4],
  "7": TONES[5],
};

// 輔助函式：判斷是否為聲調
export const isToneSymbol = (char: string) => TONE_SYMBOLS.includes(char as any);

// 輔助函式：判斷注音類型
export const getZhuyinType = (char: string) => {
  if (INITIALS.includes(char as any)) return "initial";
  if (MEDIALS.includes(char as any)) return "medial";
  if (FINALS.includes(char as any)) return "final";
  return "unknown";
};