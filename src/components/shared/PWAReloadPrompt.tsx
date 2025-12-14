import { useRegisterSW } from "virtual:pwa-register/react";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";

export function PWAReloadPrompt() {
	const {
		offlineReady: [offlineReady, setOfflineReady],
		needRefresh: [needRefresh, setNeedRefresh],
		updateServiceWorker,
	} = useRegisterSW({
		onRegistered(r) {
			console.log(`SW Registered: ${r}`);
		},
		onRegisterError(error) {
			console.log("SW registration error", error);
		},
	});

	const close = useCallback(() => {
		setOfflineReady(false);
		setNeedRefresh(false);
	}, [setOfflineReady, setNeedRefresh]);

	// 當 App 準備好離線使用時，跳一個通知 (只顯示一次)
	useEffect(() => {
		if (offlineReady) {
			toast.success("App 已準備好離線使用！", {
				description: "現在即使沒有網路，您也可以開啟 App。",
				action: {
					label: "知道了",
					onClick: close,
				},
			});
		}
	}, [offlineReady, close]);

	// 當有新版本時，跳一個通知要求更新
	useEffect(() => {
		if (needRefresh) {
			toast.info("發現新版本", {
				description: "請點擊更新以載入最新功能。",
				duration: Infinity, // 不自動消失
				action: {
					label: "立即更新",
					onClick: () => updateServiceWorker(true),
				},
				cancel: {
					label: "稍後",
					onClick: close,
				},
			});
		}
	}, [needRefresh, updateServiceWorker, close]);

	return null; // 這個組件不需要渲染任何 DOM，它只負責觸發 Toast
}
