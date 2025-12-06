import { Button } from "@/components/ui/button";
import type { Card } from "@/types/schema";
import { useEffect, useRef, useState } from "react";

interface FillModeProps {
  card: Card;
  status: string;
  onSubmit: (isCorrect: boolean) => void;
}

export function FillMode({ card, status, onSubmit }: FillModeProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInput("");
    if (status === 'question') {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [card.id, status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'question') return;
    const isCorrect = input.trim() === card.content.answer;
    onSubmit(isCorrect);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md flex gap-4">
      <input
        ref={inputRef}
        type="text"
        className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-lg focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        placeholder="請輸入答案..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={status !== 'question'}
        autoComplete="off"
      />
      <Button type="submit" size="lg" disabled={!input || status !== 'question'}>
        提交
      </Button>
    </form>
  );
}