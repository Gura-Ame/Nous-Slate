import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface OverviewProps {
  data: { name: string; total: number }[];
}

// 為了避開 Recharts 型別定義問題，暫時使用 any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-popover p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {label}
            </span>
            <span className="font-bold text-popover-foreground">
              {payload[0].value} 題
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function Overview({ data }: OverviewProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="var(--muted-foreground)" // 直接使用 CSS 變數 (Oklch)
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--muted-foreground)" // 直接使用 CSS 變數
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
          allowDecimals={false}
        />
        
        <Tooltip 
          cursor={{ fill: 'var(--muted)', opacity: 0.3 }} // 使用 muted 顏色並加上透明度
          content={<CustomTooltip />}
        />
        
        <Bar
          dataKey="total"
          fill="var(--primary)" // 直接使用主色變數
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}