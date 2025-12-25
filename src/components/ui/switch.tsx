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
				// 1. Base layout: Add cursor-pointer, set dimensions
				"peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",

				// 2. Animation effects: Scale up on hover, scale down on active
				"hover:scale-110 active:scale-95",

				// 3. Color and theme adapted
				// Checked (On) state
				"data-[state=checked]:bg-primary hover:data-[state=checked]:bg-primary/90",

				// Unchecked (Off) state:
				// Default is input color (gray) in light mode, darkens on hover
				// Noticeable slate-700 in dark mode, lightens on hover
				"data-[state=unchecked]:bg-input hover:data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-700 dark:hover:data-[state=unchecked]:bg-slate-600",

				className,
			)}
			{...props}
		>
			<SwitchPrimitive.Thumb
				data-slot="switch-thumb"
				className={cn(
					// 4. Button thumb: Add shadow for better depth
					"pointer-events-none block h-5 w-5 rounded-full bg-background shadow-md ring-0 transition-transform duration-200",
					// Translation logic
					"data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
				)}
			/>
		</SwitchPrimitive.Root>
	);
}

export { Switch };
