import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw"; // Support HTML tags
import remarkGfm from "remark-gfm"; // Support tables
import { cn } from "@/lib/utils";

interface MarkdownDisplayProps {
	content: string;
	className?: string;
}

export function MarkdownDisplay({ content, className }: MarkdownDisplayProps) {
	if (!content) return null;

	// Pre-processing: Convert ==text== to <mark>text</mark>
	const processedContent = content.replace(/==([^=]+)==/g, "<mark>$1</mark>");

	return (
		<div
			className={cn(
				// Base style: Prose (typography), Markdown Table (our custom table style)
				"prose dark:prose-invert max-w-none markdown-table",
				// Styles for highlighter (<mark>)
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
