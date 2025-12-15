import * as SwitchPrimitive from "@radix-ui/react-switch";
import type * as React from "react";

import { cn } from "@/lib/utils";

function Switch({
	className,
	...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
	return (
		<SwitchPrimitive.Root
			data-slot="switch"
			className={cn(
				// 1. 基礎佈局：增加 cursor-pointer，設定長寬
				"peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",

				// 2. 動畫效果：Hover 時稍微放大，點擊 (Active) 時微縮
				"hover:scale-110 active:scale-95",

				// 3. 顏色與深淺色模式適配
				// Checked (開啟) 狀態
				"data-[state=checked]:bg-primary hover:data-[state=checked]:bg-primary/90",

				// Unchecked (關閉) 狀態：
				// 淺色模式下預設是 input 顏色 (灰)，Hover 變深一點
				// 深色模式下給一個明顯的 slate-700，Hover 變亮一點
				"data-[state=unchecked]:bg-input hover:data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-700 dark:hover:data-[state=unchecked]:bg-slate-600",

				className,
			)}
			{...props}
		>
			<SwitchPrimitive.Thumb
				data-slot="switch-thumb"
				className={cn(
					// 4. 按鈕圓點：增加陰影讓立體感更強
					"pointer-events-none block h-5 w-5 rounded-full bg-background shadow-md ring-0 transition-transform duration-200",
					// 位移邏輯
					"data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
				)}
			/>
		</SwitchPrimitive.Root>
	);
}

export { Switch };
