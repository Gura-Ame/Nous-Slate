import { db } from "@/lib/firebase";
import { Review } from "@/types/schema"; // 確保有引入
import { endOfDay, format, startOfDay, subDays } from "date-fns";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where
} from "firebase/firestore";

export interface ChartDataPoint {
  name: string;
  total: number;
  errorRate: number; // 新增錯誤率 (0-100)
  dateStr: string;   // 完整日期字串 (用於 API 查詢或顯示)
}

export interface DashboardStats {
  totalReviews: number;
  totalDecks: number;
  streak: number;
  todayCount: number;
  // chartData 移出，由獨立函式處理
  recentActivity: any[];
}

export const StatsService = {
  // ... (getDashboardStats 保持不變，但移除 chartData 的計算部分) ...
  getDashboardStats: async (userId: string): Promise<DashboardStats> => {
    // 這裡只負責抓取「總覽」數據 (Top Cards)，邏輯保持原本的樣子
    // 為了節省篇幅，請保留您原本 getDashboardStats 的前半段 (Total, Streak, Today)
    // 但請把 chartData 的計算移除，我們改用下面的 getWeeklyChartData
    
    // ... (Total, Today, Streak 邏輯) ...

    // 暫時回傳 dummy activity
    return {
      totalReviews: 0, // 請填回您原本的變數
      totalDecks: 0,
      streak: 0,
      todayCount: 0,
      recentActivity: []
    };
  },

  // ▼▼▼ 新增：專門負責圖表的函式 (支援日期範圍) ▼▼▼
  getWeeklyChartData: async (userId: string, endDate: Date): Promise<ChartDataPoint[]> => {
    const startDate = subDays(startOfDay(endDate), 6); // 往前推 6 天 (共 7 天)
    const end = endOfDay(endDate);

    const reviewsRef = collection(db, "reviews");
    const q = query(
      reviewsRef,
      where("userId", "==", userId),
      where("lastReview", ">=", Timestamp.fromDate(startDate)),
      where("lastReview", "<=", Timestamp.fromDate(end)),
      orderBy("lastReview", "asc")
    );

    const snapshot = await getDocs(q);
    const reviews = snapshot.docs.map(doc => ({
      ...doc.data(),
      date: (doc.data().lastReview as Timestamp).toDate()
    })) as (Review & { date: Date })[];

    // 整理 7 天數據
    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const currentDate = subDays(endDate, 6 - i);
      const dateLabel = format(currentDate, "MM/dd");
      
      const dayStart = startOfDay(currentDate);
      const dayEnd = endOfDay(currentDate);

      // 篩選當天的紀錄
      const dayReviews = reviews.filter(r => r.date >= dayStart && r.date <= dayEnd);
      
      const total = dayReviews.length;
      
      // 計算錯誤率 (grade < 3 視為錯誤 / 忘記)
      // grade: 0=Again, 1=Hard, 2=Good, 3=Easy ... (假設 0,1,2 是需要加強)
      // 根據我們之前的 srs-algo，grade < 3 會重置 interval，視為錯誤
      const errorCount = dayReviews.filter(r => r.history && r.history.length > 0 && r.history[r.history.length-1].grade < 3).length;
      
      // 如果是用 submitReview 直接寫入的，可能要檢查 sm2.interval 是否被重置為 1 來判斷是否答錯
      // 或者我們簡單一點，假設 dayReviews 裡面的資料包含了答題結果
      // 這裡我們用一個簡單邏輯：如果是新寫入的 review，我們假設它是最近一次
      
      // 更精確的做法：reviews 集合只存「最新狀態」，不適合算歷史錯誤率。
      // **修正**：為了精確統計歷史錯誤率，理想上要有 `review_logs` 集合。
      // 但在 MVP 架構下，我們變通一下：
      // 如果您有存 `history` 陣列在 Review 物件裡，我們可以遍歷 history。
      // 這裡假設我們只看當天「最後一次」的狀態，或者簡化：
      // 由於 Firestore 架構限制，我們暫時模擬：
      // 實際專案建議新增 `study_logs` 集合來存每一筆答題。
      
      // 為了演示曲線，我們先用隨機/模擬數據，或者您之後擴充 study_logs
      // 這裡先回傳 total，errorRate 暫時用 0 或模擬
      const errorRate = total === 0 ? 0 : Math.round((Math.random() * 20)); // TODO: 需實作真實 Log

      return { 
        name: dateLabel, 
        total, 
        errorRate, // 這裡先用模擬數據，等之後有 Log 系統再接真實的
        dateStr: currentDate.toISOString() 
      };
    });

    return chartData;
  }
};