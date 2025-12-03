// src/hooks/useDictionary.ts
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
      
      // 1. 音檔 (優先找美式發音 us.mp3)
      const audioSrc = entry.phonetics.find((p: any) => 
        p.audio && p.audio.includes('-us.mp3')
      )?.audio || entry.phonetics.find((p: any) => p.audio)?.audio;
      
      // 2. 釋義 (只取前 3 個最重要的定義，去除例句，避免過長)
      const meanings = entry.meanings.map((m: any) => {
        const partOfSpeech = m.partOfSpeech; // n. v. adj.
        const defs = m.definitions.slice(0, 2).map((d: any) => d.definition).join("; ");
        return `(${partOfSpeech}) ${defs}`;
      }).slice(0, 3).join("\n");

      // 3. 音標 (如果是 KK 音標/IPA，我們保留它但加上括號)
      const phonetic = entry.phonetic || entry.phonetics[0]?.text || "";

      // 組合最終解釋：音標 + 詞性/定義
      // 這裡我們不把音標存在 definition 裡，而是分開回傳，讓 UI 決定怎麼擺
      return {
        word: entry.word,
        phonetic: phonetic,
        audio: audioSrc,
        definition: meanings // 乾淨的定義列表
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