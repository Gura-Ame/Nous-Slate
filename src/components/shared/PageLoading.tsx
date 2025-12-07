import { Loader2 } from "lucide-react";

interface PageLoadingProps {
  className?: string;
  message?: string;
}

export function PageLoading({ className, message = "載入中..." }: PageLoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] w-full gap-3 animate-in fade-in duration-500 ${className}`}>
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground font-medium animate-pulse">
        {message}
      </p>
    </div>
  );
}