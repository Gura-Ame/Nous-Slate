import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { DeckService } from "@/services/deck-service";
import type { Deck } from "@/types/schema";

const formSchema = z.object({
  title: z.string().min(1, "標題不能為空").max(50),
  description: z.string().max(200).optional(),
  isPublic: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface EditDeckDialogProps {
  deck: Deck | null; // 當前要編輯的 Deck，null 代表關閉
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditDeckDialog({ deck, open, onOpenChange, onSuccess }: EditDeckDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Tags 狀態管理
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      isPublic: false,
    },
  });

  // 當 deck 改變時，重置表單與 Tags
  useEffect(() => {
    if (deck) {
      reset({
        title: deck.title,
        description: deck.description || "",
        isPublic: deck.isPublic,
      });
      setTags(deck.tags || []);
    }
  }, [deck, reset]);

  // 處理 Tag 新增
  const handleAddTag = (e?: React.KeyboardEvent) => {
    if (e && e.key !== 'Enter') return;
    e?.preventDefault(); // 防止 Enter 觸發 submit

    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag)) {
      if (tags.length >= 5) {
        toast.error("最多只能新增 5 個標籤");
        return;
      }
      setTags([...tags, newTag]);
      setTagInput("");
    }
  };

  // 處理 Tag 移除
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const onSubmit = async (data: FormData) => {
    if (!deck) return;
    setIsSubmitting(true);
    try {
      await DeckService.updateDeck(deck.id, {
        title: data.title,
        description: data.description,
        isPublic: data.isPublic,
        tags: tags, // 儲存 Tags
      });
      
      toast.success("更新成功");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error("更新失敗");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>編輯題庫資訊</DialogTitle>
            <DialogDescription>
              修改標題、描述、標籤與公開權限。
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            
            {/* 標題 */}
            <div className="grid gap-2">
              <Label htmlFor="title">標題</Label>
              <Input id="title" {...register("title")} />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            {/* 描述 */}
            <div className="grid gap-2">
              <Label htmlFor="description">描述</Label>
              <Textarea id="description" {...register("description")} />
            </div>

            {/* 標籤管理 (Tags) */}
            <div className="grid gap-2">
              <Label>標籤 (Tags)</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="輸入標籤後按 Enter (例如: 國文, 成語)" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                />
                <Button type="button" variant="secondary" onClick={() => handleAddTag()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Tag List */}
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="px-2 py-1 gap-1 text-sm font-normal">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors" 
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
                {tags.length === 0 && (
                  <span className="text-xs text-slate-400">尚無標籤</span>
                )}
              </div>
            </div>

            {/* 公開設定 (Switch) */}
            <div className="flex items-center justify-between border p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
              <div className="space-y-0.5">
                <Label className="text-base">設為公開題庫</Label>
                <p className="text-xs text-muted-foreground">
                  公開後，所有使用者都可以在「探索題庫」看到並練習。
                </p>
              </div>
              <Switch 
                checked={watch("isPublic")}
                onCheckedChange={(val) => setValue("isPublic", val)}
              />
            </div>

          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              儲存變更
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}