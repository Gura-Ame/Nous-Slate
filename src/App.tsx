import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster } from "@/components/ui/sonner";
import Dashboard from "@/pages/Dashboard";
import Editor from "@/pages/Editor";
import Library from "@/pages/Library";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import DeckEditor from "./pages/DeckEditor";
import QuizSession from "./pages/QuizSession";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/library" element={<Library />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/editor/:deckId" element={<DeckEditor />} />
          <Route path="/quiz/:deckId" element={<QuizSession />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>

      <Toaster />
    </HashRouter>
  );
}