import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-xl shadow-sm border overflow-hidden flex flex-col h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b flex items-center gap-4 shrink-0">
          <Link to="/login">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">服務條款 (Terms of Service)</h1>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6 sm:p-10">
          <div className="prose dark:prose-invert max-w-none space-y-6 text-slate-600 dark:text-slate-300">
            <p>最後更新日期：2025年</p>

            <section>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">1. 認知與接受條款</h3>
              <p>
                歡迎使用 Nous Slate（以下簡稱「本服務」）。本服務係由開發團隊（以下簡稱「我們」）所提供。
                當您使用本服務時，即表示您已閱讀、瞭解並同意接受本服務條款之所有內容。
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">2. 服務內容與變更</h3>
              <p>
                本服務提供國語文學習、間隔重複記憶練習、題庫建立與分享等功能。我們保留隨時修改、暫停或終止本服務之權利，恕不另行通知。
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">3. 會員註冊與義務</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>您同意使用 Google 帳號進行登入，並保證帳號資訊之真實性。</li>
                <li>您有義務妥善保管您的帳號，並對該帳號下之一切活動負責。</li>
                <li>若發現帳號遭盜用，請立即通知我們。</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">4. 內容授權與規範</h3>
              <p>
                您在平台上建立的公開題庫，視為您授權本平台與其他使用者進行非商業性之學習使用。
                嚴禁上傳暴力、色情、侵權或違法之內容。我們有權在無通知的情況下移除違規內容。
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">5. 免責聲明</h3>
              <p>
                本服務以「現狀」提供，不保證服務絕對穩定、無誤。對於因使用本服務而產生之任何直接或間接損害，我們不負賠償責任。
                積分與廣告系統僅為模擬與趣味性質，不具有實際法幣價值。
              </p>
            </section>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}