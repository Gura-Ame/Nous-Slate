import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StorageService } from "@/services/storage-service";
import { Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ImageUploaderProps {
  value?: string;           // 目前的圖片 URL
  onChange: (url: string) => void; // 回傳新 URL
  disabled?: boolean;
}

export function ImageUploader({ value, onChange, disabled }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 核心上傳處理
  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const url = await StorageService.uploadImage(file);
      onChange(url);
      toast.success("圖片上傳成功");
    } catch (error: any) {
      toast.error(error.message || "上傳失敗");
    } finally {
      setIsUploading(false);
    }
  };

  // 1. 處理檔案選擇
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  // 2. 處理剪貼簿貼上 (Paste)
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault(); // 阻止貼上文字
        const file = items[i].getAsFile();
        if (file) handleUpload(file);
        return; // 只處理第一張圖
      }
    }
  };

  // 3. 處理拖曳 (Drag & Drop)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleUpload(file);
    }
  };

  // 移除圖片
  const handleRemove = () => {
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      {/* 預覽區 (如果有圖片) */}
      {value ? (
        <div className="relative w-full h-48 rounded-lg border overflow-hidden group bg-slate-100 dark:bg-slate-800">
          <img 
            src={value} 
            alt="Card Image" 
            className="w-full h-full object-contain" 
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        // 上傳區 (如果沒圖片)
        <div
          className={cn(
            "relative w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors outline-none",
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => !disabled && fileInputRef.current?.click()}
          onPaste={handlePaste} // 監聽貼上
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          tabIndex={0} // 讓 div 可以被 focus，才能觸發 onPaste
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-xs">上傳中...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Upload className="h-8 w-8" />
              <p className="text-xs font-medium">
                點擊上傳、拖曳檔案，或是 <span className="text-primary font-bold">Ctrl+V</span> 貼上
              </p>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}