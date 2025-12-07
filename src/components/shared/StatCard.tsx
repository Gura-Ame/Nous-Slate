import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: React.ReactNode; // 允許傳入字串或 JSX
  className?: string;           // 卡片本身的樣式
  iconClassName?: string;       // 圖標的顏色樣式
  valueClassName?: string;      // 數字的顏色樣式
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  className,
  iconClassName,
  valueClassName,
}: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {/* 統一管理圖標大小：h-5 w-5 (20px) */}
        <Icon className={cn("h-6 w-6 opacity-70", iconClassName)} />
      </CardHeader>
      <CardContent>
        {/* 統一管理數字大小：text-2xl (24px) */}
        <div className={cn("text-2xl font-bold", valueClassName)}>
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}