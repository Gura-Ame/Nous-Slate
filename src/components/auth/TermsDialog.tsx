import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MarkdownDisplay } from "@/components/shared/MarkdownDisplay";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function TermsDialog() {
	const { t, i18n } = useTranslation();
	const [content, setContent] = useState("");

	useEffect(() => {
		const loadContent = async () => {
			try {
				const response = await fetch(`/legal/terms_${i18n.language}.md`);
				const text = await response.text();
				setContent(text);
			} catch (error) {
				console.error("Failed to load terms of service:", error);
			}
		};
		loadContent();
	}, [i18n.language]);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<span className="underline underline-offset-4 hover:text-primary cursor-pointer">
					{t("terms_of_service", "Terms of Service")}
				</span>
			</DialogTrigger>
			<DialogContent className="sm:max-w-150">
				<DialogHeader>
					<DialogTitle>
						{t("terms_content.title", "Terms of Service")}
					</DialogTitle>
					<DialogDescription>
						{t("terms_content.desc", "Please read before using.")}
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="h-[60vh] mt-4 pr-4">
					<MarkdownDisplay
						content={content || t("common.loading", "Loading...")}
					/>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
