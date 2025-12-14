import { useCallback, useEffect, useRef, useState } from "react";
import { CharacterBlock } from "@/components/quiz/CharacterBlock";
import { VirtualKeyboard } from "@/components/quiz/VirtualKeyboard";
import { type BopomofoChar, useBopomofo } from "@/hooks/useBopomofo";
import type { Card } from "@/types/schema";

interface TermModeProps {
	card: Card;
	status: "idle" | "question" | "success" | "failure" | "finished";
	onSubmit: (isCorrect: boolean) => void;
}

export function TermMode({ card, status, onSubmit }: TermModeProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [userInputs, setUserInputs] = useState<(BopomofoChar | undefined)[]>(
		[],
	);
	const [focusedIndex, setFocusedIndex] = useState(0);

	const checkAnswer = useCallback(
		(finalInputs: BopomofoChar[]) => {
			const blocks = card.content.blocks || [];
			const normalize = (str: string) => (str === " " ? "" : str);

			const isCorrect = finalInputs.every((input, idx) => {
				if (!blocks[idx]) return false;
				const target = blocks[idx].zhuyin;
				const inputStr =
					input.initial + input.medial + input.final + normalize(input.tone);
				const targetStr =
					target.initial +
					target.medial +
					target.final +
					normalize(target.tone);
				return inputStr === targetStr;
			});
			onSubmit(isCorrect);
		},
		[card, onSubmit],
	);

	// 初始化
	useEffect(() => {
		setUserInputs([]);
		setFocusedIndex(0);
		if (status === "question") {
			setTimeout(() => inputRef.current?.focus(), 50);
		}
	}, [status]);

	// 檢查答案
	useEffect(() => {
		const blocks = card.content.blocks || [];
		const targetLength = blocks.length;

		// 檢查是否填滿 (無 undefined)
		const isFilled =
			userInputs.length === targetLength && !userInputs.includes(undefined);

		if (status === "question" && isFilled) {
			checkAnswer(userInputs as BopomofoChar[]);
		}
	}, [userInputs, status, card, checkAnswer]);

	const {
		displayBuffer,
		handleKeyDown,
		processInput,
		processBackspace,
		resetBuffer,
		setInternalBuffer,
	} = useBopomofo(
		// onCommit
		(newChar) => {
			if (status !== "question") return;

			setUserInputs((prev) => {
				const newArr = [...prev];
				// 更新當前這一格
				newArr[focusedIndex] = newChar;
				return newArr;
			});

			// 自動跳下一格
			handleNextFocus();
		},
		// onBackspaceEmpty (回退邏輯)
		() => {
			if (status !== "question") return;
			if (focusedIndex > 0) {
				const prevIndex = focusedIndex - 1;
				const prevChar = userInputs[prevIndex];

				// 1. 移動焦點
				setFocusedIndex(prevIndex);

				// 2. 如果上一格有字，把它載入 Buffer 供修改
				if (prevChar) {
					setInternalBuffer(prevChar);

					// 3. 視覺上清空這一格 (變成 Active 狀態)
					setUserInputs((prev) => {
						const newArr = [...prev];
						newArr[prevIndex] = undefined;
						return newArr;
					});
				}
			}
		},
	);

	// ▼▼▼ 修正：跳下一格時，只移動焦點，不動 userInputs ▼▼▼
	const handleNextFocus = () => {
		const targetLength = card.content.blocks?.length || 0;
		if (focusedIndex < targetLength - 1) {
			const nextIndex = focusedIndex + 1;
			setFocusedIndex(nextIndex);

			// 關鍵：如果下一格已經有字了 (例如之前打過)，
			// 我們不載入 Buffer，而是保持它顯示在格子裡 (Filled 狀態)，
			// 直到使用者按下了任何一個鍵，CharacterBlock 的邏輯會自動切換顯示。
			// 這裡不需要做額外動作，只要不設 undefined，它就不會消失。
		}
	};

	// 處理點擊格子
	const handleBlockClick = (index: number) => {
		if (status !== "question") return;

		// 1. 先把當前 Buffer 清空 (放棄輸入到一半的)
		resetBuffer();

		// 2. 設定新焦點
		setFocusedIndex(index);

		// 3. 如果點擊的這格已經有字，把它載入 Buffer 供修改
		const existingChar = userInputs[index];
		if (existingChar) {
			setInternalBuffer(existingChar);

			// 4. 清空這格的已確認狀態
			setUserInputs((prev) => {
				const newArr = [...prev];
				newArr[index] = undefined;
				return newArr;
			});
		}

		inputRef.current?.focus();
	};

	const blocks = card.content.blocks || [];

	return (
		<div
			className="flex flex-col items-center w-full outline-none"
			onClick={() => status === "question" && inputRef.current?.focus()}
		>
			<div className="flex flex-wrap justify-center gap-4">
				{blocks.map((block, index) => {
					const inputChar = userInputs[index];
					const isFocused = index === focusedIndex;

					let displayBopomofo: BopomofoChar | string | undefined;
					let blockStatus:
						| "default"
						| "active"
						| "filled"
						| "error"
						| "correct" = "default";

					if (status === "success") {
						displayBopomofo = inputChar;
						blockStatus = "correct";
					} else if (status === "failure") {
						displayBopomofo = inputChar;
						const normalize = (s: string) => (s === " " ? "" : s);
						const target = block.zhuyin;
						const iTone = normalize(inputChar?.tone || "");
						const tTone = normalize(target.tone);
						const iStr =
							(inputChar?.initial || "") +
							(inputChar?.medial || "") +
							(inputChar?.final || "") +
							iTone;
						const tStr = target.initial + target.medial + target.final + tTone;
						blockStatus = iStr === tStr ? "correct" : "error";
					} else {
						if (isFocused) {
							// 焦點格：顯示 Buffer
							displayBopomofo = displayBuffer;
							blockStatus = "active";
						} else {
							// 非焦點：顯示已輸入
							displayBopomofo = inputChar;
							blockStatus = inputChar ? "filled" : "default";
						}
					}

					return (
						<div
							key={`${card.id}-${index}`}
							onClick={(e) => {
								e.stopPropagation();
								handleBlockClick(index);
							}}
						>
							<CharacterBlock
								char={block.char}
								bopomofo={displayBopomofo}
								status={blockStatus}
							/>
						</div>
					);
				})}
			</div>

			<input
				ref={inputRef}
				type="url"
				className="opacity-0 absolute w-0 h-0 pointer-events-none"
				onKeyDown={handleKeyDown}
				autoFocus
				autoComplete="off"
				disabled={status !== "question"}
			/>

			<div className="xl:hidden">
				{status === "question" && (
					<VirtualKeyboard onInput={processInput} onDelete={processBackspace} />
				)}
			</div>
		</div>
	);
}
