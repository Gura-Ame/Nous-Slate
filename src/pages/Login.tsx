import { UserAuthForm } from "@/components/auth/UserAuthForm";
import { useAuth } from "@/hooks/useAuth";
import { Link, Navigate } from "react-router-dom";

export default function Login() {
  const { user, loading } = useAuth();

  // 如果已經登入，直接踢回首頁
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      
      {/* 右上角按鈕 (可選) */}
      <Link
        to="/signup" // 暫時指向 login，或是你可以做註冊頁
        className="absolute right-4 top-4 md:right-8 md:top-8 text-sm font-medium hover:underline"
      >
        註冊帳號
      </Link>

      {/* 左側：品牌形象區 (深色背景) */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-slate-900" />
        
        {/* 這裡可以放一張漂亮的背景圖，例如 Unsplash */}
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-50 mix-blend-overlay"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1544396821-4dd40b938ad3?q=80&w=2073&auto=format&fit=crop)' }}
        />

        <div className="relative z-20 flex items-center text-lg font-medium">
          <div className="w-8 h-8 bg-white text-slate-900 rounded flex items-center justify-center text-lg font-bold mr-2">
            N
          </div>
          Nous Slate
        </div>
        
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;學習是心靈唯一不會耗盡、不會恐懼、更不會後悔的事。&rdquo;
            </p>
            <footer className="text-sm opacity-80">Leonardo da Vinci</footer>
          </blockquote>
        </div>
      </div>

      {/* 右側：登入表單區 */}
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              登入您的帳戶
            </h1>
            <p className="text-sm text-muted-foreground">
              請輸入 Email 或使用 Google 快速登入
            </p>
          </div>
          
          <UserAuthForm />
          
          <p className="px-8 text-center text-sm text-muted-foreground">
            點擊登入即代表您同意我們的{" "}
            <Link to="/terms" className="underline underline-offset-4 hover:text-primary">
              服務條款
            </Link>{" "}
            與{" "}
            <Link to="/privacy" className="underline underline-offset-4 hover:text-primary">
              隱私權政策
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}