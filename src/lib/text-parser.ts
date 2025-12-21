export interface ParsedQuestion {
	stem: string;
	options: [string, string, string, string]; // 固定 4 個選項
	correctIndex: number; // 0=A, 1=B, 2=C, 3=D, -1=未偵測
	definition: string;
}

export const TextParser = {
	parseChoiceQuestion: (text: string): ParsedQuestion => {
		const lines = text
			.replace(",", "，")
			.split("\n")
			.map((l) => l.trim())
			.filter(Boolean);

		let stemLines: string[] = [];
		// 預設四個空選項
		const options: [string, string, string, string] = ["", "", "", ""];
		let definitionLines: string[] = [];
		let correctIndex = -1;

		// 狀態機：0=題目, 1=選項區, 2=解析區
		let state = 0;

		// Regex 定義
		// 偵測選項開頭: (A) A. [A] A) 等
		const optionStartRegex = /^[\(（\[]?[A-Da-d][\)）\]\.][:：]?\s*/;
		// 偵測答案行: 答案:A, Ans: (B)
		const ansLineRegex =
			/^(?:答案|Ans|ANS|Answer)[:：]?\s*[\(（\[]?([A-Da-d])[\)）\]]?/;
		// 偵測解析行: 解析: ..., 說明: ...
		const defLineRegex = /^(?:解析|詳解|說明|釋義|Explanation)[:：]/;

		for (const line of lines) {
			// 1. 優先檢查是否為答案行
			const ansMatch = line.match(ansLineRegex);
			if (ansMatch) {
				const char = ansMatch[1].toUpperCase();
				const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
				if (map[char] !== undefined) {
					correctIndex = map[char];
				}
				// 答案行通常不顯示在內容中，跳過
				// 但如果後面還有文字，可能是解析的一部分？通常答案行獨立
				// 這裡假設答案行可能包含解析開頭，例如 "答案：A。因為..."
				const afterAns = line.replace(ansMatch[0], "").trim();
				if (afterAns) {
					state = 2; // 進入解析模式
					definitionLines.push(afterAns);
				}
				continue;
			}

			// 2. 檢查是否進入解析區
			if (defLineRegex.test(line)) {
				state = 2;
				definitionLines.push(line.replace(defLineRegex, "").trim());
				continue;
			}

			// 3. 檢查是否為選項
			const optMatch = line.match(optionStartRegex);
			if (optMatch) {
				state = 1; // 進入選項模式
				// 判斷是哪個選項
				const char = optMatch[0].replace(/[^A-Da-d]/g, "").toUpperCase(); // 抓出 A,B,C,D
				const content = line.replace(optionStartRegex, "").trim();

				const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
				if (map[char] !== undefined) {
					options[map[char]] = content;
				}
				continue;
			}

			// 4. 根據狀態歸類內容
			if (state === 0) {
				stemLines.push(line);
			} else if (state === 1) {
				// 如果在選項區遇到非選項開頭，可能是上一個選項的換行內容
				// 這裡簡單處理：加到最後一個非空選項後面，或是當作題目的一部分？
				// 通常選項不太會換行，如果換行了，我們假設它是題目的一部分比較安全，或是忽略
				// 為了 Smart Paste 的容錯，我們假設它是題目續行 (如果在選項A之前)
				if (options.every((o) => o === "")) {
					stemLines.push(line);
				} else {
					// 這裡比較難判斷，先忽略或加到最後一個選項
				}
			} else if (state === 2) {
				definitionLines.push(line);
			}
		}

		return {
			stem: stemLines.join("\n"),
			options,
			correctIndex,
			definition: definitionLines.join("\n"),
		};
	},
};
