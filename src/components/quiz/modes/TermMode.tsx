import { useEffect, useRef, useState } from "react";
import { toast } from "sonner"; // 引入 toast
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

	// 1. 初始化與重置邏輯
	const [prevCardId, setPrevCardId] = useState(card.id);
	if (card.id !== prevCardId) {
		setPrevCardId(card.id);
		setUserInputs([]);
		setFocusedIndex(0);
	}

	// 2. 聚焦邏輯
	useEffect(() => {
		if (status === "question") {
			const timer = setTimeout(() => {
				inputRef.current?.focus();
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [status]);

	const handleCompositionStart = () => {
		// 1. 跳出警告
		toast.warning("請切換至英文模式", {
			description: "本系統內建注音引擎，請關閉您的系統輸入法以正常打字。",
			duration: 3000,
		});

		// 2. 強制中斷 IME 狀態
		// 原理：讓 input 失去焦點再重新聚焦，會強制瀏覽器關閉正在開啟的選字視窗
		if (inputRef.current) {
			inputRef.current.blur();
			setTimeout(() => {
				inputRef.current?.focus();
			}, 50);
		}
	};

	useEffect(() => {
		const blocks = card.content.blocks || [];
		const targetLength = blocks.length;
		const isFilled =
			userInputs.length === targetLength && !userInputs.includes(undefined);

		if (status === "question" && isFilled) {
			const normalize = (str: string) => (str === " " ? "" : str);
			const isCorrect = userInputs.every((input, idx) => {
				if (!blocks[idx] || !input) return false;
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
		}
	}, [userInputs, status, card, onSubmit]);

	// Fix circular dependency by using a ref for the setter
	const setInternalBufferRef = useRef<((char: BopomofoChar) => void) | null>(null);

	const {
		displayBuffer,
		handleKeyDown,
		processInput,
		processBackspace,
		resetBuffer,
		setInternalBuffer,
	} = useBopomofo(
		(newChar) => {
			if (status !== "question") return;
			setUserInputs((prev) => {
				const newArr = [...prev];
				newArr[focusedIndex] = newChar;
				return newArr;
			});
			const targetLength = card.content.blocks?.length || 0;
			if (focusedIndex < targetLength - 1) {
				setFocusedIndex((prev) => prev + 1);
			}
		},
		() => {
			if (status !== "question") return;
			if (focusedIndex > 0) {
				const prevIndex = focusedIndex - 1;
				setFocusedIndex(prevIndex);
				const prevChar = userInputs[prevIndex];
				if (prevChar && setInternalBufferRef.current) {
					// Use ref to call the setter
					setInternalBufferRef.current(prevChar);
					setUserInputs((prev) => {
						const newArr = [...prev];
						newArr[prevIndex] = undefined;
						return newArr;
					});
				}
			}
		},
	);

	// Sync the ref with the actual function returned by the hook
	useEffect(() => {
		setInternalBufferRef.current = setInternalBuffer;
	}, [setInternalBuffer]);

	const handleBlockClick = (index: number) => {
		if (status !== "question") return;
		resetBuffer();
		setFocusedIndex(index);
		const existingChar = userInputs[index];
		if (existingChar) {
			setInternalBuffer(existingChar);
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
		// biome-ignore lint/a11y/useKeyWithClickEvents: 背景點擊僅為 UX 優化
		// biome-ignore lint/a11y/noStaticElementInteractions: 背景點擊僅為 UX 優化
		<div
			className="flex flex-col items-center w-full outline-none"
			onClick={() => {
				if (status === "question") inputRef.current?.focus();
			}}
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
						blockStatus = "error";
					} else {
						if (isFocused) {
							displayBopomofo = displayBuffer;
							blockStatus = "active";
						} else {
							displayBopomofo = inputChar;
							blockStatus = inputChar ? "filled" : "default";
						}
					}

					return (
						<button
							type="button"
							key={`${card.id}-${index}`}
							onClick={(e) => {
								e.stopPropagation();
								handleBlockClick(index);
							}}
							className="focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
						>
							<CharacterBlock
								char={block.char}
								bopomofo={displayBopomofo}
								status={blockStatus}
							/>
						</button>
					);
				})}
			</div>

			<input
				ref={inputRef}
				type="url"
				className="opacity-0 absolute w-0 h-0 pointer-events-none"
				onKeyDown={handleKeyDown}
				onCompositionStart={handleCompositionStart}
				autoCorrect="off"
				autoCapitalize="off"
				spellCheck="false"
				// biome-ignore lint/a11y/noAutofocus: 遊戲體驗核心需求
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
