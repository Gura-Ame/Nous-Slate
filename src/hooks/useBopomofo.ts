import { useCallback, useRef, useState } from "react";
import { getZhuyinType, isToneSymbol, KEY_MAP } from "@/lib/zhuyin-map";

export interface BopomofoChar {
	initial: string;
	medial: string;
	final: string;
	tone: string;
}

const EMPTY_CHAR: BopomofoChar = {
	initial: "",
	medial: "",
	final: "",
	tone: "",
};

export function useBopomofo(
	onCommit: (char: BopomofoChar) => void,
	onBackspaceEmpty?: () => void,
) {
	const [buffer, setBuffer] = useState<BopomofoChar>(EMPTY_CHAR);
	const bufferRef = useRef<BopomofoChar>(EMPTY_CHAR);

	const updateState = (newBuffer: BopomofoChar) => {
		bufferRef.current = newBuffer;
		setBuffer(newBuffer);
	};

	const setInternalBuffer = useCallback((char: BopomofoChar) => {
		updateState(char);
	}, []);

	const processInput = useCallback(
		(charOrTone: string) => {
			const current = bufferRef.current;

			if (charOrTone === " " || isToneSymbol(charOrTone)) {
				const toneSymbol = charOrTone === " " ? "" : charOrTone;
				const charToCommit = { ...current, tone: toneSymbol };

				updateState(EMPTY_CHAR);
				onCommit(charToCommit);
				return;
			}

			const type = getZhuyinType(charOrTone);
			if (type !== "unknown") {
				const nextBuffer = { ...current };
				if (type === "initial") nextBuffer.initial = charOrTone;
				if (type === "medial") nextBuffer.medial = charOrTone;
				if (type === "final") nextBuffer.final = charOrTone;
				updateState(nextBuffer);
			}
		},
		[onCommit],
	);

	const processBackspace = useCallback(() => {
		const current = bufferRef.current;

		// 檢查是否為空
		const isEmpty =
			!current.initial && !current.medial && !current.final && !current.tone;

		if (isEmpty) {
			if (onBackspaceEmpty) onBackspaceEmpty();
			return;
		}

		// 依序刪除邏輯
		const nextBuffer = { ...current };
		if (current.tone) nextBuffer.tone = "";
		else if (current.final) nextBuffer.final = "";
		else if (current.medial) nextBuffer.medial = "";
		else if (current.initial) nextBuffer.initial = "";

		updateState(nextBuffer);
	}, [onBackspaceEmpty]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			const key = e.key.toLowerCase();
			if (key === "backspace") {
				processBackspace();
				return;
			}
			if ([" ", "3", "4", "6", "7"].includes(key)) {
				e.preventDefault();
				const toneMap: Record<string, string> = {
					" ": " ",
					"6": "ˊ",
					"3": "ˇ",
					"4": "ˋ",
					"7": "˙",
				};
				processInput(toneMap[key]);
				return;
			}
			const zhuyin = KEY_MAP[key];
			if (zhuyin) processInput(zhuyin);
		},
		[processInput, processBackspace],
	);

	return {
		buffer,
		displayBuffer: buffer.initial + buffer.medial + buffer.final + buffer.tone,
		handleKeyDown,
		processInput,
		processBackspace,
		resetBuffer: () => updateState(EMPTY_CHAR),
		setInternalBuffer, // 匯出這個新方法
	};
}
