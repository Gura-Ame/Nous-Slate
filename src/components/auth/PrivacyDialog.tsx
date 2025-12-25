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

export function PrivacyDialog() {
	const { t, i18n } = useTranslation();
	const [content, setContent] = useState("");

	useEffect(() => {
		const loadContent = async () => {
			try {
				const response = await fetch(`/legal/privacy_${i18n.language}.md`);
				const text = await response.text();
				setContent(text);
			} catch (error) {
				console.error("Failed to load privacy policy:", error);
			}
		};
		loadContent();
	}, [i18n.language]);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<span className="underline underline-offset-4 hover:text-primary cursor-pointer">
					{t("privacy_policy", "Privacy Policy")}
				</span>
			</DialogTrigger>
			<DialogContent className="sm:max-w-150">
				<DialogHeader>
					<DialogTitle>
						{t("privacy_content.title", "Privacy Policy")}
					</DialogTitle>
					<DialogDescription>
						{t("privacy_content.desc", "How we handle your data.")}
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
