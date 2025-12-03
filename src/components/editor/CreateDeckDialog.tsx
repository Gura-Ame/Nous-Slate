// src/components/editor/CreateDeckDialog.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { DeckService } from "@/services/deck-service";
import { toast } from "sonner";

// 定義表單驗證規則
const formSchema = z.object({
  title: z.string().min(1, "標題不能為空").max(50, "標題太長了"),
  description: z.string().max(200, "描述太長了").optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  onDeckCreated: () => void; // 成功後通知父層重整列表
}

export function CreateDeckDialog({ onDeckCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      await DeckService.createDeck(user.uid, data.title, data.description);
      
      toast.success("建立成功", {
        description: `題庫「${data.title}」已建立。`,
      });
      
      setOpen(false);
      reset();
      onDeckCreated(); // 觸發列表更新
    } catch (error) {
      toast.error("建立失敗", {
        description: "請稍後再試。",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> 建立新題庫
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>建立新題庫</DialogTitle>
            <DialogDescription>
              建立一個新的單元來分類您的卡片。例如：「國一第一課」、「成語集錦」。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">標題</Label>
              <Input
                id="title"
                placeholder="例如：基礎注音符號"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">描述 (選填)</Label>
              <Textarea
                id="description"
                placeholder="簡單描述這個題庫的內容..."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              建立
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}