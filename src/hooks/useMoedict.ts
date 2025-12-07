import { useState } from 'react';
import { toast } from "sonner";

// 定義單個讀音的結構
export interface MoedictHeteronym {
  bopomofo: string; // "ㄧㄣˊ ㄏㄤˊ"
  definition: string; // 已清洗的釋義
}

export interface MoedictResult {
  title: string;
  heteronyms: MoedictHeteronym[]; // 改成陣列
}

export function useMoedict() {
  const [loading, setLoading] = useState(false);

  const search = async (word: string): Promise<MoedictResult | null> => {
    if (!word) return null;
    setLoading(true);
    try {
      const response = await fetch(`https://www.moedict.tw/uni/${encodeURIComponent(word)}`);
      if (!response.ok) throw new Error("Not found");

      const data = await response.json();
      
      // 解析所有異讀字 (Heteronyms)
      const heteronyms: MoedictHeteronym[] = (data.heteronyms || []).map((h: any) => {
        // 清洗定義 (移除 HTML 標籤，只取前 2 個)
        const defs = (h.definitions || [])
          .slice(0, 2)
          .map((d: any) => d.def.replace(/<[^>]*>?/gm, ''))
          .join("\n");

        return {
          bopomofo: h.bopomofo || "",
          definition: defs
        };
      }).filter((h: MoedictHeteronym) => h.bopomofo); // 過濾掉沒注音的

      if (heteronyms.length === 0) return null;

      return {
        title: data.title,
        heteronyms
      };

    } catch (error) {
      console.warn("Moedict search failed:", error);
      toast.error("萌典查無此詞");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { search, loading };
}