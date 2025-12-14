import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
// Layouts & Pages
import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster } from "@/components/ui/sonner";
import Dashboard from "@/pages/Dashboard";
import DeckEditor from "@/pages/DeckEditor";
import Editor from "@/pages/Editor";
import Library from "@/pages/Library";
import Login from "@/pages/Login"; // 新增
import Profile from "@/pages/Profile";
import QuizSession from "@/pages/QuizSession";
import Settings from "@/pages/Settings";
import AdCenter from "./pages/AdCenter";
import Privacy from "./pages/Privacy";
import ReviewCenter from "./pages/ReviewCenter";
import Terms from "./pages/Terms";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* 1. 公開路由 (不需要 Sidebar) */}
        <Route path="/login" element={<Login />} />

        {/* 2. 受保護路由 (由 AppLayout 保護，未登入會被踢去 /login) */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/library" element={<Library />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/editor/:deckId" element={<DeckEditor />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/ad-center" element={<AdCenter />} />
          <Route path="/review" element={<ReviewCenter />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Route>

        {/* 3. 練習模式 (全螢幕，不需要 Sidebar，但也需要登入保護) */}
        {/* 
           QuizSession 比較特殊，它需要全螢幕，所以不能包在 AppLayout 裡。
           但它又需要保護。
           簡單解法：在 QuizSession 內部檢查 user，若無則 Navigate。
           (我們目前的 QuizSession 已經有依賴 user.uid，如果沒 user 應該會報錯或導向)
           為了安全，建議包一個 <ProtectedRoute> 組件，這裡先簡單處理。
        */}
        <Route path="/quiz/:deckId" element={<QuizSession />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster richColors position="top-center" />
    </HashRouter>
  );
}