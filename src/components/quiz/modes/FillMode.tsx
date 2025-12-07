import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Card } from "@/types/schema";
import { useEffect, useMemo, useRef, useState } from "react";

interface FillModeProps {
  card: Card;
  status: "idle" | "question" | "success" | "failure" | "finished";
  onSubmit: (isCorrect: boolean) => void;
}

export function FillMode({ card, status, onSubmit }: FillModeProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. 初始化
  useEffect(() => {
    // 只有當「題目ID」改變時才清空，這樣答對/答錯時文字會保留
    setInput("");
    
    // 自動 Focus
    if (status === 'question') {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [card.id]); 

  // 2. 處理提交
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (status !== 'question') return;
    const isCorrect = input.trim() === card.content.answer;
    onSubmit(isCorrect);
  };

  // 3. 解析題目
  const parts = useMemo(() => card.content.stem.split("___"), [card.content.stem]);

  // 4. 計算輸入框動態寬度
  const answerStr = card.content.answer || "";
  const widthStyle = useMemo(() => {
    const len = Math.max(1, answerStr.length); // 至少 1 字寬
    // 簡單判斷：是否有中文字 (中文字寬度約為英文 2 倍)
    const hasChinese = /[\u4e00-\u9fa5]/.test(answerStr);
    
    // 使用 ch 單位 (字元寬度)
    // 中文: 每個字給 2.2ch，英文給 1.2ch，最後加一點 buffer
    const widthCh = len * (hasChinese ? 2.5 : 1.5) + 1;
    
    return { width: `${widthCh}ch` };
  }, [answerStr]);

  // Input 樣式
  const inputClass = cn(
    "inline-block mx-1 h-auto border-b-2 border-t-0 border-x-0 rounded-none px-1 py-0 text-center font-bold inherit focus-visible:ring-0 focus-visible:border-primary bg-transparent transition-colors outline-none",
    // 狀態顏色
    status === 'success' && "border-emerald-500 text-emerald-600",
    status === 'failure' && "border-destructive text-destructive",
    status === 'question' && "border-slate-400 text-slate-800 dark:text-slate-200 border-dashed"
  );

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl flex flex-col items-center gap-8">
      
      {/* 題目顯示區 (Text 放大) */}
      <div className="text-3xl md:text-5xl font-serif font-bold text-slate-800 dark:text-slate-100 leading-normal text-center">
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {/* 插入 Input */}
            {index < parts.length - 1 && (
              <input
                ref={index === 0 ? inputRef : null}
                id={`fill-input-${card.id}`} // 解決 Issue 1
                name="fill-answer"           // 解決 Issue 1
                type="text"
                autoComplete="off"
                className={inputClass}
                style={widthStyle} // 套用動態寬度
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                disabled={status !== 'question'}
              />
            )}
          </span>
        ))}
      </div>

      {status === 'question' && (
        <Button type="submit" size="lg" disabled={!input.trim()}>
          提交答案
        </Button>
      )}
    </form>
  );
}