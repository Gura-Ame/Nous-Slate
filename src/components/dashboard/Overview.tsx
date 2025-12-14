import {
	Area,
	CartesianGrid,
	ComposedChart,
	Line,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface OverviewProps {
	data: { name: string; total: number; errorRate: number }[];
}

// 自定義 Props 介面，解決 TS 報錯與 noExplicitAny
interface CustomTooltipProps {
	active?: boolean;
	payload?: {
		value: number;
		name: string;
		color?: string;
	}[];
	label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
	if (active && payload && payload.length) {
		return (
			<div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
				<p className="text-sm font-bold mb-2 text-popover-foreground">
					{label}
				</p>
				<div className="flex flex-col gap-1">
					{/* 第一個數據：總複習數 (Area) */}
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<div className="w-2 h-2 rounded-full bg-primary" />
						<span>複習題數: </span>
						<span className="font-bold text-foreground">
							{payload[0]?.value}
						</span>
					</div>
					{/* 第二個數據：錯誤率 (Line) */}
					{payload[1] && (
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<div className="w-2 h-2 rounded-full bg-rose-500" />
							<span>錯誤率: </span>
							<span className="font-bold text-rose-500">
								{payload[1]?.value}%
							</span>
						</div>
					)}
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
				<defs>
					<linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
						<stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
					</linearGradient>
				</defs>

				<CartesianGrid
					strokeDasharray="3 3"
					vertical={false}
					stroke="var(--border)"
					opacity={0.4}
				/>

				<XAxis
					dataKey="name"
					stroke="var(--muted-foreground)"
					fontSize={12}
					tickLine={false}
					axisLine={false}
					dy={10}
				/>

				{/* 左軸：題數 */}
				<YAxis
					yAxisId="left"
					stroke="var(--muted-foreground)"
					fontSize={12}
					tickLine={false}
					axisLine={false}
					tickFormatter={(value) => `${value}`}
					allowDecimals={false}
				/>

				{/* 右軸：錯誤率 */}
				<YAxis
					yAxisId="right"
					orientation="right"
					stroke="var(--destructive)"
					fontSize={12}
					tickLine={false}
					axisLine={false}
					tickFormatter={(value) => `${value}%`}
					domain={[0, 100]}
				/>

				<Tooltip
					cursor={{
						stroke: "var(--muted-foreground)",
						strokeWidth: 1,
						strokeDasharray: "5 5",
					}}
					content={<CustomTooltip />}
				/>

				{/* 面積圖：總數 */}
				<Area
					yAxisId="left"
					type="monotone"
					dataKey="total"
					stroke="var(--primary)"
					strokeWidth={2}
					fillOpacity={1}
					fill="url(#colorTotal)"
				/>

				{/* 折線圖：錯誤率 */}
				<Line
					yAxisId="right"
					type="monotone"
					dataKey="errorRate"
					stroke="var(--destructive)"
					strokeWidth={2}
					dot={{ r: 4, fill: "var(--background)", strokeWidth: 2 }}
					activeDot={{ r: 6 }}
				/>
			</ComposedChart>
		</ResponsiveContainer>
	);
}
