import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-xl shadow-sm border overflow-hidden flex flex-col h-[90vh]">
        
        <div className="p-6 border-b flex items-center gap-4 shrink-0">
          <Link to="/login">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">隱私權政策 (Privacy Policy)</h1>
        </div>

        <ScrollArea className="flex-1 p-6 sm:p-10">
          <div className="prose dark:prose-invert max-w-none space-y-6 text-slate-600 dark:text-slate-300">
            <section>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">1. 我們收集的資料</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>**帳號資訊**：當您使用 Google 登入時，我們會取得您的 Email、顯示名稱與頭像 URL。</li>
                <li>**學習紀錄**：我們會儲存您的題庫、卡片內容、練習進度與 SRS 記憶參數。</li>
                <li>**互動紀錄**：包含積分交易、訂閱紀錄等。</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">2. 資料使用方式</h3>
              <p>
                我們收集的資料僅用於：
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>提供個人化的學習服務（如 SRS 演算法排程）。</li>
                <li>同步您的資料至不同裝置。</li>
                <li>改善本服務的效能與體驗。</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">3. 資料儲存與安全</h3>
              <p>
                本服務使用 **Google Firebase** 進行資料儲存與驗證。您的資料受 Google 的安全架構保護。
                我們不會將您的個人資料販售給第三方。
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">4. Cookie 與追蹤技術</h3>
              <p>
                本服務使用 Cookie 與 LocalStorage 來維持您的登入狀態與偏好設定（如深色模式）。
                我們亦使用 reCAPTCHA 機制來防止惡意機器人攻擊。
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">5. 您的權利</h3>
              <p>
                您隨時可以要求刪除您的帳號與所有相關資料。如需行使此權利，請透過 GitHub 或應用程式內的管道聯繫開發者。
              </p>
            </section>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}