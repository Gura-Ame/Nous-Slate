// src/lib/bopomofo-utils.ts
import type { BopomofoData } from "@/types/schema";
import { FINALS, INITIALS, MEDIALS } from "./zhuyin-map";

// 判斷字元類型的輔助函式
const isInitial = (c: string) => (INITIALS as readonly string[]).includes(c);
const isMedial = (c: string) => (MEDIALS as readonly string[]).includes(c);
const isFinal = (c: string) => (FINALS as readonly string[]).includes(c);
const isTone = (c: string) => [" ", "ˊ", "ˇ", "ˋ", "˙"].includes(c);

/**
 * 將單一字的注音字串 (e.g., "ㄏㄤˊ") 解析為結構物件
 */
export function parseOneBopomofo(str: string): BopomofoData {
  let remaining = str;
  let tone = ""; // 預設一聲
  
  // 1. 抓聲調 (通常在最後，除了輕聲可能在最前，但萌典格式通常在最後)
  const lastChar = remaining.slice(-1);
  if (isTone(lastChar)) {
    tone = lastChar;
    remaining = remaining.slice(0, -1);
  } else if (remaining.startsWith("˙")) {
    // 處理輕聲在前面的狀況 (較少見，但防呆)
    tone = "˙";
    remaining = remaining.slice(1);
  }

  // 2. 依序抓取聲母、介音、韻母
  let initial = "";
  let medial = "";
  let final = "";

  // 嘗試匹配聲母 (取第一個字)
  if (remaining.length > 0 && isInitial(remaining[0])) {
    initial = remaining[0];
    remaining = remaining.slice(1);
  }

  // 嘗試匹配介音
  if (remaining.length > 0 && isMedial(remaining[0])) {
    medial = remaining[0];
    remaining = remaining.slice(1);
  }

  // 剩下的是韻母
  if (remaining.length > 0 && isFinal(remaining[0])) {
    final = remaining[0];
  } else if (remaining.length > 0) {
    // 如果還有剩，可能是介音誤判或複韻母，這裡做簡單 fallback
    if (!medial && isMedial(remaining[0])) medial = remaining[0];
    else final = remaining;
  }

  return { initial, medial, final, tone };
}

/**
 * 將整句注音字串 (e.g., "ㄧㄣˊ ㄏㄤˊ") 轉為陣列
 */
export function parseBopomofoString(fullString: string): BopomofoData[] {
  // 萌典通常用空白分隔字
  return fullString.split(" ").map(s => parseOneBopomofo(s.trim()));
}