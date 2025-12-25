import i18next from "i18next";

export interface ParsedQuestion {
	stem: string;
	options: [string, string, string, string];
	correctIndex: number;
	definition: string;
}

export const TextParser = {
	parseChoiceQuestion: (text: string): ParsedQuestion => {
		// 1. Filter citations
		const cleanText = text.replace(/\[\[\d+\]\([^)]+\)\]/g, "");

		const lines = cleanText
			.split("\n")
			.map((l) => l.trim())
			.filter(Boolean);

		const stemLines: string[] = [];
		const options: [string, string, string, string] = ["", "", "", ""];
		const definitionLines: string[] = [];
		let correctIndex = -1;

		let state = 0; // 0=Stem, 1=Options, 2=Explanation

		const optionStartRegex = /^[(（[]?[A-Da-d][)）\].][:：]?\s*/;

		// Use i18n for regex prefixes if available, fallback to hardcoded defaults
		const ansPrefixes = i18next.t("parser.ans_prefix", {
			defaultValue: "答案|Ans|ANS|Answer",
		});
		const defPrefixes = i18next.t("parser.def_prefix", {
			defaultValue: "解析|詳解|說明|釋義|Explanation",
		});

		const ansLineRegex = new RegExp(
			`^(?:${ansPrefixes})[:：]?\\s*[(（[]?([A-Da-d])[)）\\]]?`,
		);
		const defLineRegex = new RegExp(`^(?:${defPrefixes})[:：]`);

		for (const line of lines) {
			// A. Check for Answer line
			const ansMatch = line.match(ansLineRegex);
			if (ansMatch) {
				const char = ansMatch[1].toUpperCase();
				const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
				if (map[char] !== undefined) {
					correctIndex = map[char];
				}
				// Check if explanation text follows answer on the same line
				const afterAns = line.replace(ansMatch[0], "").trim();
				// FIXED: Only add if content is not empty
				if (afterAns) {
					state = 2;
					definitionLines.push(afterAns);
				}
				continue;
			}

			// B. Check for Explanation line
			if (defLineRegex.test(line)) {
				state = 2;
				// FIXED: Only add after removing prefix if content is not empty
				const content = line.replace(defLineRegex, "").trim();
				if (content) {
					definitionLines.push(content);
				}
				continue;
			}

			// C. Check for Options
			const optMatch = line.match(optionStartRegex);
			if (optMatch) {
				state = 1;
				const char = optMatch[0].replace(/[^A-Da-d]/g, "").toUpperCase();
				const content = line.replace(optionStartRegex, "").trim();
				const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
				if (map[char] !== undefined) {
					options[map[char]] = content;
				}
				continue;
			}

			// D. Classify content
			if (state === 0) {
				stemLines.push(line);
			} else if (state === 1) {
				if (options.every((o) => o === "")) {
					stemLines.push(line);
				}
			} else if (state === 2) {
				definitionLines.push(line);
			}
		}

		return {
			stem: stemLines.join("\n"),
			options,
			correctIndex,
			definition: definitionLines.join("\n").trim(), // Final trim for safety
		};
	},
};
