// src/lib/zhuyin-map.ts

// 1. 聲母 (Initials)
export const INITIALS = [
  "ㄅ", "ㄆ", "ㄇ", "ㄈ", "ㄉ", "ㄊ", "ㄋ", "ㄌ", "ㄍ", "ㄎ", "ㄏ", 
  "ㄐ", "ㄑ", "ㄒ", "ㄓ", "ㄔ", "ㄕ", "ㄖ", "ㄗ", "ㄘ", "ㄙ"
] as const;

// 2. 介音 (Medials)
export const MEDIALS = ["ㄧ", "ㄨ", "ㄩ"] as const;

// 3. 韻母 (Finals) - 包含單韻母與複韻母
export const FINALS = [
  "ㄚ", "ㄛ", "ㄜ", "ㄝ", "ㄞ", "ㄟ", "ㄠ", "ㄡ", "ㄢ", "ㄣ", "ㄤ", "ㄥ", "ㄦ"
] as const;

// 4. 聲調 (Tones)
export const TONES = {
  1: "",    // 一聲 (空白鍵，通常不顯示符號)
  2: "ˊ",   // 二聲
  3: "ˇ",   // 三聲
  4: "ˋ",   // 四聲
  5: "˙",   // 輕聲
} as const;

// 5. 大千式鍵盤對應表 (Standard Layout)
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
  
  // 聲調鍵 (注意：空白鍵需要額外邏輯處理)
  "6": "ˊ", // 二聲
  "3": "ˇ", // 三聲
  "4": "ˋ", // 四聲
  "7": "˙", // 輕聲
};

// 輔助函式：判斷注音類型
export const getZhuyinType = (char: string) => {
  if (INITIALS.includes(char as any)) return "initial";
  if (MEDIALS.includes(char as any)) return "medial";
  if (FINALS.includes(char as any)) return "final";
  return "unknown";
};