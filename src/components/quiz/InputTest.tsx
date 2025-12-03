import { type BopomofoChar, useBopomofo } from "@/hooks/useBopomofo";
import { useRef, useState } from "react";
import { CharacterBlock } from "./CharacterBlock"; // 引入新組件

export function InputTest() {
  const [committedChars, setCommittedChars] = useState<BopomofoChar[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { displayBuffer, handleKeyDown } = useBopomofo((char) => {
    setCommittedChars((prev) => [...prev, char]);
  });

  const handleFocus = () => inputRef.current?.focus();

  return (
    <div
      className="p-8 border rounded-xl bg-slate-50 dark:bg-slate-950/50 cursor-text min-h-[300px]"
      onClick={handleFocus}
    >
      <h3 className="text-lg font-bold mb-6 text-slate-700 dark:text-slate-200">
        數位生字簿 (Digital Grid Test)
      </h3>

      <input
        ref={inputRef}
        type="url"
        className="opacity-0 absolute w-0 h-0 pointer-events-none"
        onKeyDown={handleKeyDown}
        autoFocus
      />

      {/* 方塊排列區 */}
      <div className="flex flex-wrap gap-6 p-4">

        {/* 1. 已經打完的字 */}
        {committedChars.map((char, index) => (
          <CharacterBlock
            key={index}
            bopomofo={char}
            status="filled"
          />
        ))}

        {/* 2. 正在打的字 (Active) */}
        <CharacterBlock
          bopomofo={displayBuffer}
          status="active"
        />

        {/* 3. 佔位符 (模擬後面還有題目) */}
        <CharacterBlock status="default" />
        <CharacterBlock status="default" />

      </div>

      <p className="mt-8 text-sm text-slate-400 text-center">
        *請嘗試輸入注音。注意觀察「標楷體」與「田字格」的效果。
      </p>
    </div>
  );
}