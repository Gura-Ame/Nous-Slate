import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CardService } from "@/services/card-service";
import type { CardType } from "@/types/schema";
import { FileJson, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ImportJsonDialogProps {
  deckId: string;
  onSuccess: () => void;
}

export function ImportJsonDialog({ deckId, onSuccess }: ImportJsonDialogProps) {
  const [open, setOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const data = JSON.parse(jsonInput);
      if (!Array.isArray(data)) throw new Error("JSON 必須是一個陣列 []");

      let count = 0;
      // 批次寫入 (簡單迴圈)
      for (const item of data) {
        // 簡單驗證
        if (!item.stem || !item.type) continue;

        const type: CardType = item.type;
        let content: any = { stem: item.stem, meaning: item.meaning || "" };

        if (type === 'choice') {
          content.answer = item.answer;
          content.options = item.options || [];
        } else if (type === 'fill_blank') {
          content.answer = item.answer;
        } else if (type === 'term') {
           // 這裡省略複雜的注音解析，假設 JSON 已經是正確結構或由後台自動補
           // 如果要支援 Term 匯入，需要在这里呼叫 parseBopomofoString
           continue; 
        }

        await CardService.createCard(deckId, type, content);
        count++;
      }

      toast.success(`成功匯入 ${count} 筆題目`);
      setOpen(false);
      setJsonInput("");
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("匯入失敗，請檢查 JSON 格式");
    } finally {
      setIsImporting(false);
    }
  };

  const exampleJson = `[
  {
    "type": "choice",
    "stem": "太陽從哪邊升起？",
    "answer": "東邊",
    "options": ["西邊", "南邊", "北邊"],
    "meaning": "自然常識"
  },
  {
    "type": "fill_blank",
    "stem": "一___驚人",
    "answer": "鳴"
  }
]`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileJson className="h-4 w-4" /> JSON 匯入
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>批次匯入題目</DialogTitle>
          <DialogDescription>
            請貼上符合格式的 JSON 陣列。目前支援選擇題與填空題。
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Textarea 
            className="font-mono text-xs h-[300px]" 
            placeholder={exampleJson}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            * 提示：上方是範例格式，請複製參考。
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleImport} disabled={isImporting || !jsonInput}>
            {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            開始匯入
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}