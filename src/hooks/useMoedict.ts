// src/hooks/useMoedict.ts
import { useState } from 'react';

// 定義萌典 API 回傳的精簡結構
interface MoedictResult {
  title: string;
  bopomofo: string; // "ㄧㄣˊ ㄏㄤˊ"
  definition: string;
}

export function useMoedict() {
  const [loading, setLoading] = useState(false);

  const search = async (word: string): Promise<MoedictResult | null> => {
    if (!word) return null;
    
    setLoading(true);
    try {
      // 萌典 API: https://www.moedict.tw/uni/{詞}
      const response = await fetch(`https://www.moedict.tw/uni/${encodeURIComponent(word)}`);
      
      if (!response.ok) {
        throw new Error("Not found");
      }

      const data = await response.json();
      
      // 解析資料 (萌典的結構有點複雜，我們取第一個最常用的讀音)
      // data.heteronyms 是「異讀字」陣列 (破音字)
      const firstHeteronym = data.heteronyms?.[0];
      
      if (!firstHeteronym) return null;

      // 組合解釋：取第一個 definition
      const firstDefinition = firstHeteronym.definitions?.[0]?.def || "";

      return {
        title: data.title,
        bopomofo: firstHeteronym.bopomofo, // e.g., "ㄧㄣˊ ㄏㄤˊ"
        definition: firstDefinition
      };

    } catch (error) {
      console.warn("Moedict search failed:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { search, loading };
}