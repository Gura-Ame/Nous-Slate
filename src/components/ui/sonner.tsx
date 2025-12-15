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
				success: <Check className="size-5 text-emerald-500" />,
				info: <Info className="size-5 text-blue-500" />,
				warning: <TriangleAlert className="size-5 text-amber-500" />,
				error: <X className="size-5 text-red-500" />,
			}}
			toastOptions={{
				classNames: {
					toast:
						// 使用 ! 強制覆蓋 Sonner 預設樣式
						// 淺色：白底黑字；深色：深藍底白字 (Slate-950)
						"group toast group-[.toaster]:!bg-white dark:group-[.toaster]:!bg-slate-950 group-[.toaster]:!text-slate-950 dark:group-[.toaster]:!text-slate-50 group-[.toaster]:!border-slate-200 dark:group-[.toaster]:!border-slate-800 group-[.toaster]:!shadow-xl rounded-xl p-4 gap-3 font-sans border",
					description:
						"group-[.toast]:!text-slate-500 dark:group-[.toast]:!text-slate-400 font-normal",
					actionButton:
						"group-[.toast]:!bg-slate-900 group-[.toast]:!text-slate-50 dark:group-[.toast]:!bg-slate-50 dark:group-[.toast]:!text-slate-900 font-medium",
					cancelButton:
						"group-[.toast]:!bg-slate-100 group-[.toast]:!text-slate-500 dark:group-[.toast]:!bg-slate-800 dark:group-[.toast]:!text-slate-400",
					title: "text-base font-bold",
					icon: "self-start mt-0.5", // 讓圖標對齊標題頂部
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
