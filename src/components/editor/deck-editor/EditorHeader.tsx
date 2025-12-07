// src/components/editor/deck-editor/EditorHeader.tsx
import { ImportJsonDialog } from "@/components/editor/ImportJsonDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface EditorHeaderProps {
  deckId?: string;
  cardCount: number;
  onImportSuccess: () => void;
}

export function EditorHeader({ deckId, cardCount, onImportSuccess }: EditorHeaderProps) {
  return (
    <header className="h-14 border-b bg-white dark:bg-slate-900 flex items-center px-4 justify-between shrink-0 z-20">
      <div className="flex items-center gap-4">
        <Link to="/editor">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="font-bold text-lg">編輯題庫</h1>
      </div>
      
      <div className="flex items-center gap-2">
         {deckId && (
           <ImportJsonDialog 
             deckId={deckId} 
             onSuccess={onImportSuccess} 
           />
         )}
         <div className="text-sm text-slate-500 ml-2">
           {cardCount} 張卡片
         </div>
      </div>
    </header>
  );
}