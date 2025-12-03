import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function RecentActivity() {
  const activities = [
    {
      deck: "國一國文 - 第一課",
      action: "完成了 20 題複習",
      time: "2 分鐘前",
      score: "+20 XP",
      initial: "國",
    },
    {
      deck: "成語 - 動物篇",
      action: "新增了 5 張新卡片",
      time: "1 小時前",
      score: "New",
      initial: "成",
    },
    {
      deck: "進階字音字形",
      action: "達成 7 日連續打卡",
      time: "5 小時前",
      score: "Streak",
      initial: "字",
    },
    {
      deck: "唐詩三百首",
      action: "練習正確率 95%",
      time: "昨天",
      score: "A+",
      initial: "詩",
    },
    {
      deck: "易錯字總複習",
      action: "訂正了 3 個錯誤",
      time: "昨天",
      score: "Fix",
      initial: "錯",
    },
  ];

  return (
    <div className="space-y-8">
      {activities.map((item, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9 bg-slate-100 dark:bg-slate-800 border">
            <AvatarImage src="/avatars/01.png" alt="Avatar" />
            <AvatarFallback className="text-slate-700 dark:text-slate-300">
              {item.initial}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{item.deck}</p>
            <p className="text-xs text-muted-foreground">{item.action}</p>
          </div>
          <div className="ml-auto font-medium text-xs text-slate-500">
            {item.time}
          </div>
        </div>
      ))}
    </div>
  );
}