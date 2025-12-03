import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Monitor, Moon, Sun } from "lucide-react";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="container mx-auto p-8 space-y-8 max-w-3xl">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
        設定
      </h2>

      {/* 外觀設定 */}
      <Card>
        <CardHeader>
          <CardTitle>外觀</CardTitle>
          <CardDescription>自訂介面的顏色主題。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>主題模式</Label>
            <div className="flex gap-2">
              <Button 
                variant={theme === 'light' ? 'default' : 'outline'} 
                size="icon" 
                onClick={() => setTheme('light')}
                title="淺色"
              >
                <Sun className="h-4 w-4" />
              </Button>
              <Button 
                variant={theme === 'dark' ? 'default' : 'outline'} 
                size="icon" 
                onClick={() => setTheme('dark')}
                title="深色"
              >
                <Moon className="h-4 w-4" />
              </Button>
              <Button 
                variant={theme === 'system' ? 'default' : 'outline'} 
                size="icon" 
                onClick={() => setTheme('system')}
                title="跟隨系統"
              >
                <Monitor className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 學習設定 */}
      <Card>
        <CardHeader>
          <CardTitle>學習偏好</CardTitle>
          <CardDescription>調整練習時的行為。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>自動播放發音</Label>
              <p className="text-sm text-slate-500">進入題目時自動朗讀</p>
            </div>
            <Switch disabled checked={false} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>音效回饋</Label>
              <p className="text-sm text-slate-500">答對/答錯時播放音效</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}