import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

interface OverviewProps {
  data: { name: string; total: number; errorRate: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
        <p className="text-sm font-bold mb-2 text-popover-foreground">{label}</p>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>複習題數: </span>
            <span className="font-bold text-foreground">{payload[0].value}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <span>錯誤率: </span>
            <span className="font-bold text-rose-500">{payload[1].value}%</span>
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
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
        
        <XAxis
          dataKey="name"
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        
        {/* 左側 Y 軸：總數 */}
        <YAxis
          yAxisId="left"
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
          allowDecimals={false}
        />

        {/* 右側 Y 軸：錯誤率 (%) */}
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="var(--destructive)" // 紅色系
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}%`}
          domain={[0, 100]} // 固定 0-100%
        />
        
        <Tooltip cursor={{ fill: 'var(--muted)', opacity: 0.2 }} content={<CustomTooltip />} />
        
        {/* 柱狀圖：總數 */}
        <Bar
          yAxisId="left"
          dataKey="total"
          fill="var(--primary)"
          radius={[4, 4, 0, 0]}
          barSize={30}
          fillOpacity={0.8}
        />

        {/* 線圖：錯誤率 */}
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="errorRate"
          stroke="var(--destructive)" // 使用 Shadcn 的 destructive 顏色 (紅色)
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--background)", strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}