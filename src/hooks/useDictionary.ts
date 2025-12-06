import { useState } from 'react';
import { toast } from "sonner";

interface DictionaryResult {
  word: string;
  phonetic: string;
  audio?: string;
  definition: string;
}

export function useDictionary() {
  const [loading, setLoading] = useState(false);

  const search = async (word: string): Promise<DictionaryResult | null> => {
    if (!word) return null;
    setLoading(true);
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      const entry = data[0];
      
      // 1. 音檔 (優先找美式發音)
      const audioSrc = entry.phonetics.find((p: any) => 
        p.audio && p.audio.includes('-us.mp3')
      )?.audio || entry.phonetics.find((p: any) => p.audio)?.audio;
      
      // 2. 釋義清洗 (移除例句，只留定義)
      // 過濾掉包含 "example" 的雜訊，只取前 2 個定義
      const meanings = entry.meanings.map((m: any) => {
        const partOfSpeech = m.partOfSpeech; // n. v. adj.
        // 只取 definition 欄位，忽略 example
        const defs = m.definitions.slice(0, 2).map((d: any) => d.definition).join("; ");
        return `(${partOfSpeech}) ${defs}`;
      }).slice(0, 3).join("\n");

      // 3. 音標 (KK/IPA)
      // 如果您完全不想看到音標，可以把這行改成 const phonetic = "";
      const phonetic = entry.phonetic || entry.phonetics[0]?.text || "";

      return {
        word: entry.word,
        phonetic: phonetic, // 這裡保留音標欄位，但編輯器可以決定要不要填入 definition
        audio: audioSrc,
        definition: meanings // 現在這裡只有純解釋，沒有例句了
      };
    } catch (e) {
      console.error(e);
      toast.error("字典查無此字");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { search, loading };
}