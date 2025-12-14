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
	return (
		<Dialog>
			<DialogTrigger asChild>
				<span className="underline underline-offset-4 hover:text-primary cursor-pointer">
					隱私權政策
				</span>
			</DialogTrigger>
			<DialogContent className="sm:max-w-150">
				<DialogHeader>
					<DialogTitle>隱私權政策 (Privacy Policy)</DialogTitle>
					<DialogDescription>我們如何處理您的資料。</DialogDescription>
				</DialogHeader>

				<ScrollArea className="h-[60vh] mt-4 pr-4">
					<div className="prose dark:prose-invert text-sm text-slate-600 dark:text-slate-300 space-y-4">
						<section>
							<h4 className="font-bold text-slate-900 dark:text-slate-100">
								1. 資料收集
							</h4>
							<p>
								當您使用 Google 登入時，我們會取得您的 Email、顯示名稱與頭像
								URL。我們會儲存您的學習紀錄、積分交易與訂閱內容。
							</p>
						</section>

						<section>
							<h4 className="font-bold text-slate-900 dark:text-slate-100">
								2. 資料使用
							</h4>
							<p>
								資料僅用於提供個人化的學習服務（如 SRS
								演算法排程）與同步您的裝置進度。
							</p>
						</section>

						<section>
							<h4 className="font-bold text-slate-900 dark:text-slate-100">
								3. 資料安全
							</h4>
							<p>
								本服務使用 Google Firebase 進行資料儲存。您的資料受 Google
								的安全架構保護。我們不會將您的個人資料販售給第三方。
							</p>
						</section>

						<section>
							<h4 className="font-bold text-slate-900 dark:text-slate-100">
								4. Cookie
							</h4>
							<p>本服務使用 Cookie 與 LocalStorage 維持登入狀態與偏好設定。</p>
						</section>

						<section>
							<h4 className="font-bold text-slate-900 dark:text-slate-100">
								5. 使用者權利
							</h4>
							<p>您隨時可以要求刪除您的帳號與所有相關資料。</p>
						</section>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
