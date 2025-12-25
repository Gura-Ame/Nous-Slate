import { useState } from "react";
import { toast } from "sonner";

// 1. Define API response structure
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

// Simplified structure for frontend consumption
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

			// 2. Cast response to defined interface array
			const data = (await res.json()) as DictionaryEntry[];
			const entry = data[0];

			// 3. Removed :any, now TypeScript knows p is Type Phonetic
			const audioSrc =
				entry.phonetics.find((p) => p.audio?.includes("-us.mp3"))?.audio ||
				entry.phonetics.find((p) => p.audio)?.audio;

			// 4. Removed :any, now TypeScript knows m is Meaning, d is Definition
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
			toast.error("Word not found in dictionary");
			return null;
		} finally {
			setLoading(false);
		}
	};

	return { search, loading };
}
