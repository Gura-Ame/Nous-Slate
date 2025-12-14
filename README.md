# Nous Slate

> **The Tablet for the Mind.**  
> 承載智慧的數位石板 —— 專為深度學習與間隔重複 (SRS) 打造的現代化平台。

![Project Status](https://img.shields.io/badge/Status-Beta-blue)
![License](https://img.shields.io/badge/License-AGPLv3-red)
![Tech](https://img.shields.io/badge/Tech-React%20%7C%20Firebase%20%7C%20Tailwind-black)

## 📖 專案簡介 (Introduction)

**Nous Slate** 是一個結合了現代 Web 技術與傳統語文教學需求的學習平台。它不僅僅是一個單字卡軟體，更針對「繁體中文（注音/漢字）」的學習特性進行了深度優化。

透過內建的 **SM-2 間隔重複演算法 (Spaced Repetition System)**，系統會根據您的答題狀況自動安排最佳複習時間，讓記憶更有效率。

### 核心特色 (Key Features)

*   **🀄 專業級國語文支援**：
    *   **CMEX 風格排版**：完美還原教科書等級的「直式注音」與「田字格」顯示。
    *   **智慧輸入引擎**：仿微軟注音輸入法的邏輯（聲調覆蓋、自動跳格），並支援實體鍵盤與虛擬鍵盤。
    *   **多音字處理**：自動偵測破音字並提供選單。
*   **🧠 多元題型**：
    *   **國字注音 (Term)**：看國字打注音，支援盲測。
    *   **選擇題 (Choice)**：自動亂數排列選項，支援鍵盤快捷鍵 (1-4)。
    *   **填空題 (Fill-in-the-Blank)**：行內輸入體驗，自動判斷答案長度。
    *   **單字卡 (Flashcard)**：翻牌模式，整合 TTS 語音朗讀與圖片顯示。
*   **⚡ 極速創作後台**：
    *   **自動填入**：串接 **萌典 (Moedict)** 與 **Free Dictionary API**，輸入題目自動帶入解釋與發音。
    *   **圖片貼上**：支援 `Ctrl+V` 直接貼上截圖並上傳。
    *   **批次匯入**：支援 JSON 格式整包匯入。
*   **💰 積分經濟系統**：
    *   每日簽到獎勵、答錯扣分機制。
    *   模擬廣告觀看與贊助系統。
*   **🌍 社群互動**：
    *   公開/私有題庫設定。
    *   訂閱他人題庫。
    *   基於興趣標籤的推薦系統。

## 🛠️ 技術架構 (Tech Stack)

本專案採用現代化的前端架構，確保效能與開發體驗：

*   **核心框架**: React 18, Vite, TypeScript
*   **樣式與 UI**: Tailwind CSS (v4), Shadcn/ui, Lucide Icons
*   **狀態管理**: Zustand (Global Store), React Query (Server State)
*   **後端服務 (BaaS)**: Firebase (Auth, Firestore, Storage, Hosting)
*   **圖表視覺化**: Recharts
*   **工具庫**: React Hook Form, Zod, Date-fns

## 📸 畫面預覽 (Screenshots)

*(建議您在此處放幾張截圖，例如儀表板、練習中的田字格、編輯器畫面)*

| 儀表板 (Dashboard) | 練習模式 (Quiz Session) |
| :---: | :---: |
| ![Dashboard](https://via.placeholder.com/400x300?text=Dashboard+Screenshot) | ![Quiz](https://via.placeholder.com/400x300?text=Quiz+Screenshot) |

| 創作後台 (Editor) | 積分中心 (Ad Center) |
| :---: | :---: |
| ![Editor](https://via.placeholder.com/400x300?text=Editor+Screenshot) | ![AdCenter](https://via.placeholder.com/400x300?text=AdCenter+Screenshot) |

## 🚀 快速開始 (Getting Started)

### 前置需求
*   Node.js 18+
*   一個 Firebase 專案 (需開啟 Auth, Firestore, Storage)

### 安裝步驟

1.  **複製專案**
    ```bash
    git clone https://github.com/Gura-Ame/Nous-Slate.git
    cd Nous-Slate
    ```

2.  **安裝依賴**
    ```bash
    npm install
    ```

3.  **設定環境變數**
    複製 `.env.example` (若無則手動建立) 為 `.env`，並填入您的 Firebase 設定：
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

4.  **啟動開發伺服器**
    ```bash
    npm run dev
    ```

5.  **部署 (Firebase Hosting)**
    ```bash
    npm run build
    firebase deploy
    ```

## 📜 授權條款 (License)

本專案採用 **GNU Affero General Public License v3.0 (AGPL-3.0)** 授權。

這意味著：
*   ✅ 您可以自由下載、修改、使用本軟體。
*   ✅ 您可以將本軟體用於商業用途。
*   ⚠️ **但是**，如果您將修改後的版本透過網路提供服務（例如架設網站），您 **必須** 公開您的完整原始碼，並同樣採用 AGPLv3 授權。
*   🚫 禁止將本專案閉源並據為己有。

詳細條款請參閱 [LICENSE](LICENSE) 文件。

## 🙏 致謝 (Acknowledgements)

*   **萌典 (Moedict)**: 提供強大的中文詞條與發音 API。
*   **Free Dictionary API**: 提供英語單字查詢服務。
*   **Shadcn/ui**: 提供精美的 UI 組件庫。
*   **CMEX (中推會)**: 提供直式注音排版的 CSS 靈感。

---

Copyright © 2025 Nous Slate Team.
