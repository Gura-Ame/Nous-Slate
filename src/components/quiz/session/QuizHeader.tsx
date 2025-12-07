import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X } from "lucide-react";

interface QuizHeaderProps {
  currentIndex: number;
  total: number;
  onExit: () => void;
}

export function QuizHeader({ currentIndex, total, onExit }: QuizHeaderProps) {
  return (
    <header className="h-16 px-6 flex items-center justify-between border-b bg-white dark:bg-slate-900 shrink-0">
      <Button variant="ghost" size="icon" onClick={onExit}>
        <X className="h-5 w-5" />
      </Button>
      <div className="flex-1 max-w-md mx-4">
        <Progress value={((currentIndex + 1) / total) * 100} className="h-2" />
      </div>
      <div className="text-sm font-medium text-slate-500">
        {currentIndex + 1} / {total}
      </div>
    </header>
  );
}