## 1. 專案願景 (Overview)
一個基於 Web 的現代化國語文學習平台，結合 **SRS (間隔重複系統)** 與 **嚴謹的國字注音輸入邏輯**。目標受眾為國中至成人自學群體。強調「共筆/訂閱」機制與「高效率內容建立」。

## 2. 技術架構 (Tech Stack)

### 2.1 核心框架
*   **Frontend:** React 18 (Vite) + TypeScript.
*   **State Management:** React Context (Global Auth/Theme) + React Query (Server State/Caching) + Zustand (Complex Local State like Quiz Engine).
*   **Routing:** `react-router-dom` (使用 **HashRouter** 以相容 GitHub Pages)。
*   **Build & Deploy:** GitHub Pages (via `gh-pages` branch).
*   **PWA:** Vite PWA Plugin (Manifest, Service Worker, Offline Fallback).

### 2.2 UI/UX
*   **Styling:** Tailwind CSS.
*   **Components:** Shadcn/ui (Radix Primitives).
*   **Visual Style:** **Modern Minimalist (現代簡潔)**。
    *   去除多餘裝飾，使用黑/白/灰階為主色調。
    *   **字體策略 (Hybrid):** UI 使用系統黑體 (Inter/Noto Sans)；題目國字區塊使用 **標楷體 (KaiTi)** 或教育部標準字體。
    *   **配色:** 主色 Slate-900 (深灰墨色)，錯誤紅 (Red-500)，正確綠 (Emerald-500)。
*   **Layout Engine:** CMEX CSS (Vertical Zhuyin via `::after` pseudo-elements).

### 2.3 Backend (Firebase Free Tier)
*   **Auth:** Google Sign-in, Email/Password.
*   **Database:** Cloud Firestore (NoSQL).
*   **Storage:** Firebase Storage (User uploaded images).
*   **Hosting:** (僅用於開發測試，生產環境使用 GitHub Pages).

---

## 3. 資料庫結構 (Firestore Schema)

### `users/{userId}`
*   `profile`: { `displayName`, `photoURL`, `email` }
*   `settings`: { `dailyNewLimit`: 20, `autoPlayAudio`: false, `inputMode`: "daigian" }
*   `stats`: { `streak`: 3, `totalReviews`: 150 }

### `decks/{deckId}` (題組)
*   `title`: string ("國一第一課")
*   `ownerId`: string (Creator)
*   `isPublic`: boolean
*   `tags`: string[] (e.g., "grade-7", "idiom")
*   `description`: string (Markdown)
*   `stats`: { `subscribers`: 100, `stars`: 45 }
*   `forkedFrom`: string | null (若為副本，指向原 DeckId)
*   `version`: number (用於通知訂閱者更新)

### `cards/{cardId}` (題目)
*   `deckId`: string
*   `type`: "char" | "term" | "dictation" | "choice"
*   `content`: {
    *   `stem`: string (題目 "一鳴驚人")
    *   `blocks`: Array<{ // 序列化後的字元結構
          `char`: "一",
          `zhuyin`: "ㄧ",
          `tone`: 1,
          `polyphones`: [...] // 多音字選項
       }>
    *   `meaning`: string (純文字清洗後的解釋)
    *   `audioUrl`: string (Moedict URL or Storage URL)
    *   `options`: string[] (選擇題干擾項)
    *   `image`: string | null (Storage URL)
    *   `config`: { `skipPunctuation`: boolean }
    }
*   `validation`: { // 後台驗證狀態
    *   `status`: "pending" | "verified" | "flagged"
    *   `source`: "moedict" | "manual"
    }

### `reviews/{userId}_{cardId}` (SRS 狀態)
*   `deckId`: string
*   `sm2`: { `ease`: 2.5, `interval`: 1, `repetitions`: 0, `dueDate`: Timestamp }
*   `lastAttempt`: "correct" | "wrong"
*   `history`: Array<{ date, quality }>

---

## 4. 核心功能模組 (Detailed Specs)

### 4.1 虛擬輸入引擎 (Headless Zhuyin Engine)
這是本專案最核心的「黑科技」。
*   **DOM 結構:** 一個 `opacity: 0` 的 `<input>` 負責接收鍵盤事件，上方覆蓋 React 渲染的 CMEX 方塊 `<div>`。
*   **State Machine:**
    *   `buffer`: string (暫存使用者輸入，如 "mu3")
    *   `cursorIndex`: number (當前在打第幾個字)
*   **Mapping Rules (大千式):**
    *   Key `1` -> `ㄅ`, `q` -> `ㄆ`...
    *   Tone Keys: `Space`(1聲), `6`(2聲), `3`(3聲), `4`(4聲), `7`(輕聲)。
*   **交互邏輯:**
    *   **Focus Highlighting:** 當前輸入的字，背景色塊變更 (e.g., 淺灰/Slate-100)。
    *   **Sequential Logic:** 嚴格比對 `聲母` -> `韻母` -> `介音` -> `聲調` 順序。
    *   **Microsoft Overwrite:** 若 Buffer 中已有聲母 `ㄅ`，使用者又輸入 `ㄉ`，則 `ㄉ` 取代 `ㄅ`。
    *   **Backspace:** 逐符號刪除 (Stack Pop)。
    *   **Auto-Advance:** 當輸入「聲調鍵」且拼音合法，游標自動跳下一格。
    *   **Invalid Warning:** 拼出不存在的注音 (如 `ㄅㄉ`)，該符號顯示紅色，且**不允許**跳下一格，直到修正。

### 4.2 練習與 SRS 循環
*   **盲測模式 (Blind Test):**
    *   題目顯示國字 (或注音)，輸入框全空。
    *   **不即時報錯:** 除非拼寫邏輯錯誤 (Invalid Combo)，否則就算打錯字 (Answer mismatch) 也不會變紅。
    *   **提交機制:** 
        1. 使用者打完所有字。
        2. 按 `Enter` 或點擊「提交」。
        3. **結算:** 
           *   **全對:** 顯示綠色勾勾 -> 跳出 SRS 評分按鈕 (簡單/普通/困難) -> 排程下次複習。
           *   **有錯:** 顯示正確答案 (紅字標註錯誤處) -> 標記為 `Again (0)` -> 強制放入「今日重練」隊列。
*   **Fallback 機制:**
    *   若無音檔，使用 `window.speechSynthesis.speak()` 朗讀，並 Toast 提示「使用合成語音」。
    *   若使用者完全不會，點擊「放棄 (Give Up)」，視為錯誤，顯示答案。

### 4.3 創作後台 (Creator Studio)
*   **介面佈局:** 左側列表，右側「聚焦卡片 (Focused Card)」。
*   **鍵盤流 (Keyboard Flow):**
    *   `Tab`: 切換欄位。
    *   `Ctrl+V`: 貼上圖片 (觸發 Clipboard API -> Upload -> 填入 URL)。
    *   `Ctrl+Enter`: 儲存本題並新增下一題。
*   **多音字處理:** 
    *   輸入國字後，系統自動填入預設注音。
    *   若需修改，按快捷鍵 (e.g., `Alt+1`, `Alt+2`) 快速切換候選音。
*   **非同步驗證:**
    *   輸入時不卡頓。存檔後，後台 Process (React Query mutation) 默默去打 Moedict API。
    *   列表上顯示狀態燈號：🟢 (已驗證/吻合) 🟡 (未驗證) 🔴 (需人工檢查/API 查無此詞)。
*   **行動版編輯:** 提供簡化版 Form，禁用複雜快捷鍵，僅允許文字修正。

### 4.4 社群與同步 (Community & Sync)
*   **訂閱 (Subscribe):** B 使用者訂閱 A 的牌組。Firestore 紀錄 `subscriptions` 關聯。A 更新題目時，B 下次練習會看到新版。
*   **推薦系統:** 首頁根據 `user.settings.tags` 與 `deck.tags` 進行簡單過濾推薦 (Client-side filtering for MVP)。
*   **離線支援 (PWA):** 快取最近練習的 50 題 (Review Queue) 到 IndexedDB。斷網時仍可練習這些題目，恢復連線後同步 SRS 紀錄。

---

## 5. 專案目錄結構 (Directory Structure)

```text
src/
├── assets/             # Logo, Static Images
├── components/
│   ├── ui/             # Shadcn: Button, Dialog, Toast, Card...
│   ├── layout/         # Navbar, Sidebar, MobileDrawer
│   ├── quiz/
│   │   ├── HeadlessInput.tsx  # 核心：虛擬輸入框邏輯
│   │   ├── CharacterBlock.tsx # 核心：CMEX 方塊渲染 (Grid/Char)
│   │   ├── VirtualKeyboard.tsx # 手機版軟鍵盤
│   │   └── ProgressBar.tsx
│   ├── editor/
│   │   ├── DeckBuilder.tsx    # 聚焦卡片編輯器
│   │   └── ImageUploader.tsx  # 剪貼簿處理
│   └── shared/
│       ├── AudioPlayer.tsx    # 包含 Fallback 邏輯
│       └── MeaningDrawer.tsx  # 手機版解釋抽屜
├── hooks/
│   ├── useAuth.ts
│   ├── useInputEngine.ts      # 處理注音 State Machine, Mapping, Validation
│   ├── useSRS.ts              # SM-2 算法與 Firestore Batch Sync
│   └── useMoedict.ts          # API Fetching & Parsing
├── lib/
│   ├── firebase.ts            # SDK Init
│   ├── zhuyin-map.ts          # 大千式對照表
│   └── utils.ts               # cn(), date helpers
├── pages/
│   ├── Dashboard.tsx          # 任務導向首頁
│   ├── Library.tsx            # 探索/訂閱
│   ├── QuizSession.tsx        # 練習主畫面
│   └── Editor.tsx             # 後台
├── store/
│   └── useQuizStore.ts        # Zustand (Quiz State)
└── types/
    └── schema.d.ts            # Firestore Types
```

---

## 6. 開發階段規劃 (Phases)

### Phase 1: 基礎建設與輸入引擎 (The Core)
1.  初始化 Vite + React + TS + Tailwind + Shadcn。
2.  配置 HashRouter 與 GitHub Pages Deploy Action。
3.  **實作 `HeadlessInput` 與 `CharacterBlock` (重中之重):** 確保注音排版正確，且鍵盤輸入邏輯 (Microsoft-style) 順暢。

### Phase 2: 後端與資料流 (The Spine)
1.  Firebase Auth 與 Firestore 連接。
2.  實作 `Deck` 與 `Card` 的 CRUD。
3.  實作 Moedict API 串接 (Client-side proxy function) 與非同步驗證邏輯。

### Phase 3: 練習模式與 SRS (The Loop)
1.  實作 Quiz UI (盲測、提交、結果顯示)。
2.  實作 SM-2 演算法。
3.  整合 TTS Fallback。

### Phase 4: 創作者後台 (The Power Tool)
1.  實作「聚焦卡片」編輯器。
2.  實作「剪貼簿貼上圖片」功能。
3.  優化 Tab 鍵與快捷鍵流程。

### Phase 5: 優化與發布 (Polishing)
1.  行動版 RWD 調整 (Bottom Sheet, RWD Grid)。
2.  PWA `manifest.json` 配置。
3.  最終部署與測試。
