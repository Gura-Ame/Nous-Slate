export interface ParsedQuestion {
	stem: string;
	options: [string, string, string, string];
	correctIndex: number;
	definition: string;
}

export const TextParser = {
	parseChoiceQuestion: (text: string): ParsedQuestion => {
		// 1. 過濾引用
		const cleanText = text.replace(/\[\[\d+\]\([^)]+\)\]/g, "");

		const lines = cleanText
			.split("\n")
			.map((l) => l.trim())
			.filter(Boolean);

		const stemLines: string[] = [];
		const options: [string, string, string, string] = ["", "", "", ""];
		const definitionLines: string[] = [];
		let correctIndex = -1;

		let state = 0; // 0=題目, 1=選項, 2=解析

		const optionStartRegex = /^[(（[]?[A-Da-d][)）\].][:：]?\s*/;
		const ansLineRegex =
			/^(?:答案|Ans|ANS|Answer)[:：]?\s*[(（[]?([A-Da-d])[)）\]]?/;
		const defLineRegex = /^(?:解析|詳解|說明|釋義|Explanation)[:：]/;

		for (const line of lines) {
			// A. 檢查答案行
			const ansMatch = line.match(ansLineRegex);
			if (ansMatch) {
				const char = ansMatch[1].toUpperCase();
				const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
				if (map[char] !== undefined) {
					correctIndex = map[char];
				}
				// 檢查答案行後是否緊跟著解析文字
				const afterAns = line.replace(ansMatch[0], "").trim();
				// ▼▼▼ 修正：只有內容不為空才加入 ▼▼▼
				if (afterAns) {
					state = 2;
					definitionLines.push(afterAns);
				}
				continue;
			}

			// B. 檢查解析行
			if (defLineRegex.test(line)) {
				state = 2;
				// ▼▼▼ 修正：去除前綴後，只有內容不為空才加入 ▼▼▼
				const content = line.replace(defLineRegex, "").trim();
				if (content) {
					definitionLines.push(content);
				}
				continue;
			}

			// C. 檢查選項
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

			// D. 歸類內容
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
			definition: definitionLines.join("\n").trim(), // 最後再 trim 一次保險
		};
	},
};
