"use client";

import { Check, Info, TriangleAlert, X } from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			richColors={false}
			icons={{
				success: <Check className="size-5 text-emerald-500 drop-shadow-sm" />,
				info: <Info className="size-5 text-blue-500 drop-shadow-sm" />,
				warning: (
					<TriangleAlert className="size-5 text-amber-500 drop-shadow-sm" />
				),
				error: <X className="size-5 text-red-500 drop-shadow-sm" />,
			}}
			toastOptions={{
				classNames: {
					toast:
						// 1. 背景半透明 + 高斯模糊
						"group toast group-[.toaster]:!bg-white/80 dark:group-[.toaster]:!bg-slate-950/80 group-[.toaster]:backdrop-blur-xl " +
						// 2. 邊框：細緻的白色/深色半透明邊框
						"group-[.toaster]:!border-white/40 dark:group-[.toaster]:!border-white/10 group-[.toaster]:border " +
						// 3. 陰影：深邃的陰影增加層次
						"group-[.toaster]:!shadow-2xl dark:group-[.toaster]:!shadow-black/50 " +
						// 4. 文字與佈局
						"group-[.toaster]:!text-slate-900 dark:group-[.toaster]:!text-slate-100 rounded-2xl p-4 gap-3 font-sans items-start",

					description:
						"group-[.toast]:!text-slate-500 dark:group-[.toast]:!text-slate-400 font-normal leading-relaxed",

					actionButton:
						"group-[.toast]:!bg-slate-900 group-[.toast]:!text-white dark:group-[.toast]:!bg-white dark:group-[.toast]:!text-slate-900 font-medium rounded-lg",

					cancelButton:
						"group-[.toast]:!bg-slate-100 group-[.toast]:!text-slate-500 dark:group-[.toast]:!bg-slate-800 dark:group-[.toast]:!text-slate-400 rounded-lg",

					title: "text-base font-bold tracking-tight",
					icon: "self-start mt-0.5",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
