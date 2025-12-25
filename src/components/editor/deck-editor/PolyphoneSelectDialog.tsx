import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { MoedictHeteronym } from "@/hooks/useMoedict";

interface PolyphoneSelectDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	word: string;
	candidates: MoedictHeteronym[];
	onSelect: (selected: MoedictHeteronym) => void;
}

export function PolyphoneSelectDialog({
	open,
	onOpenChange,
	word,
	candidates,
	onSelect,
}: PolyphoneSelectDialogProps) {
	const { t } = useTranslation();
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{t(
							"editor.select_pronunciation",
							"Please select pronunciation for {{word}}",
							{ word },
						)}
					</DialogTitle>
					<DialogDescription>
						{t(
							"editor.polyphone_desc",
							"Multiple pronunciations found in Moedict, please select the version you want to teach.",
						)}
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="max-h-[300px] mt-2 pr-4">
					<div className="space-y-2">
						{candidates.map((item, index) => (
							<Button
								// biome-ignore lint/suspicious/noArrayIndexKey: Standard order for options
								key={index}
								variant="outline"
								className="w-full h-auto flex flex-col items-start p-4 text-left justify-start whitespace-normal"
								onClick={() => {
									onSelect(item);
									onOpenChange(false);
								}}
							>
								<span className="text-lg font-bold text-primary mb-1">
									{item.bopomofo}
								</span>
								<span className="text-sm text-muted-foreground line-clamp-2">
									{item.definition}
								</span>
							</Button>
						))}
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
