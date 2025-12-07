import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { MoedictHeteronym } from "@/hooks/useMoedict";

interface PolyphoneSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  word: string;
  candidates: MoedictHeteronym[];
  onSelect: (selected: MoedictHeteronym) => void;
}

export function PolyphoneSelectDialog({ 
  open, 
  onOpenChange, 
  word, 
  candidates, 
  onSelect 
}: PolyphoneSelectDialogProps) {
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>請選擇「{word}」的讀音</DialogTitle>
          <DialogDescription>
            萌典查詢到多種讀音，請選擇您要教學的版本。
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[300px] mt-2 pr-4">
          <div className="space-y-2">
            {candidates.map((item, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full h-auto flex flex-col items-start p-4 text-left justify-start whitespace-normal"
                onClick={() => {
                  onSelect(item);
                  onOpenChange(false);
                }}
              >
                <span className="text-lg font-bold text-primary mb-1">
                  {item.bopomofo}
                </span>
                <span className="text-sm text-muted-foreground line-clamp-2">
                  {item.definition}
                </span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}