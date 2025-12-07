import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface OverviewProps {
  data: { name: string; total: number }[];
}

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
      <AreaChart data={data}>
        {/* 定義漸層顏色 */}
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
          </linearGradient>
        </defs>

        <XAxis
          dataKey="name"
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
          allowDecimals={false}
        />
        
        <Tooltip 
          cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '5 5' }}
          content={<CustomTooltip />}
        />
        
        <Area
          type="monotone" // 設定為曲線
          dataKey="total"
          stroke="var(--primary)"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorTotal)" // 使用上面定義的漸層
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}