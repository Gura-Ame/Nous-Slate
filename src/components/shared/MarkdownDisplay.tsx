import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw"; // 支援 HTML 標籤
import remarkGfm from "remark-gfm"; // 支援表格
import { cn } from "@/lib/utils";

interface MarkdownDisplayProps {
	content: string;
	className?: string;
}

export function MarkdownDisplay({ content, className }: MarkdownDisplayProps) {
	if (!content) return null;

	// 前處理：將 ==文字== 轉換為 <mark>文字</mark>
	const processedContent = content.replace(/==([^=]+)==/g, "<mark>$1</mark>");

	return (
		<div
			className={cn(
				// 基礎樣式：Prose (排版), Markdown Table (我們自訂的表格樣式)
				"prose dark:prose-invert max-w-none markdown-table",
				// 針對螢光筆 (<mark>) 的樣式設定
				"[&_mark]:bg-yellow-200 [&_mark]:dark:bg-yellow-500/30 [&_mark]:text-slate-900 [&_mark]:dark:text-yellow-100 [&_mark]:px-1 [&_mark]:rounded-sm",
				className,
			)}
		>
			<ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
				{processedContent}
			</ReactMarkdown>
		</div>
	);
}
