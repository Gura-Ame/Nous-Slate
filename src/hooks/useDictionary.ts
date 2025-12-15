import { useState } from "react";
import { toast } from "sonner";

// 1. 定義 API 回傳的資料結構
interface Phonetic {
	text?: string;
	audio?: string;
}

interface Definition {
	definition: string;
	example?: string;
	synonyms?: string[];
	antonyms?: string[];
}

interface Meaning {
	partOfSpeech: string;
	definitions: Definition[];
}

interface DictionaryEntry {
	word: string;
	phonetic?: string;
	phonetics: Phonetic[];
	meanings: Meaning[];
	sourceUrls?: string[];
}

// 這是 Hook 回傳給前端使用的精簡結構
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
			const res = await fetch(
				`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
			);
			if (!res.ok) throw new Error("Not found");

			// 2. 在這裡轉型 (Cast) 為我們定義的介面陣列
			const data = (await res.json()) as DictionaryEntry[];
			const entry = data[0];

			// 3. 移除 :any，現在 TypeScript 知道 p 是 Phonetic 類型
			const audioSrc =
				entry.phonetics.find((p) => p.audio?.includes("-us.mp3"))?.audio ||
				entry.phonetics.find((p) => p.audio)?.audio;

			// 4. 移除 :any，現在 TypeScript 知道 m 是 Meaning, d 是 Definition
			const meanings = entry.meanings
				.map((m) => {
					const partOfSpeech = m.partOfSpeech; // n. v. adj.
					const defs = m.definitions
						.slice(0, 2)
						.map((d) => d.definition)
						.join("; ");
					return `(${partOfSpeech}) ${defs}`;
				})
				.slice(0, 3)
				.join("\n");

			const phonetic = entry.phonetic || entry.phonetics[0]?.text || "";

			return {
				word: entry.word,
				phonetic: phonetic,
				audio: audioSrc,
				definition: meanings,
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
