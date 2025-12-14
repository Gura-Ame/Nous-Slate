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
	return (
		<Dialog>
			<DialogTrigger asChild>
				<span className="underline underline-offset-4 hover:text-primary cursor-pointer">
					服務條款
				</span>
			</DialogTrigger>
			<DialogContent className="sm:max-w-150">
				<DialogHeader>
					<DialogTitle>服務條款 (Terms of Service)</DialogTitle>
					<DialogDescription>使用本服務前請詳閱。</DialogDescription>
				</DialogHeader>

				{/* 關鍵：設定高度讓 ScrollArea 生效 */}
				<ScrollArea className="h-[60vh] mt-4 pr-4">
					<div className="prose dark:prose-invert text-sm text-slate-600 dark:text-slate-300 space-y-4">
						<p>最後更新日期：2025年</p>

						<section>
							<h4 className="font-bold text-slate-900 dark:text-slate-100">
								1. 認知與接受條款
							</h4>
							<p>
								歡迎使用 Nous
								Slate（以下簡稱「本服務」）。當您使用本服務時，即表示您已閱讀、瞭解並同意接受本服務條款之所有內容。
							</p>
						</section>

						<section>
							<h4 className="font-bold text-slate-900 dark:text-slate-100">
								2. 服務內容
							</h4>
							<p>
								本服務提供國語文學習、間隔重複記憶練習、題庫建立與分享等功能。我們保留隨時修改、暫停或終止本服務之權利。
							</p>
						</section>

						<section>
							<h4 className="font-bold text-slate-900 dark:text-slate-100">
								3. 會員義務
							</h4>
							<p>
								您同意使用 Google
								帳號進行登入。您有義務妥善保管您的帳號，並對該帳號下之一切活動負責。
							</p>
						</section>

						<section>
							<h4 className="font-bold text-slate-900 dark:text-slate-100">
								4. 內容授權
							</h4>
							<p>
								您在平台上設定為「公開」的題庫，視為您授權本平台與其他使用者進行非商業性之學習使用。
							</p>
						</section>

						<section>
							<h4 className="font-bold text-slate-900 dark:text-slate-100">
								5. 免責聲明
							</h4>
							<p>
								本服務以「現狀」提供。對於因使用本服務而產生之任何直接或間接損害，我們不負賠償責任。
							</p>
						</section>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
