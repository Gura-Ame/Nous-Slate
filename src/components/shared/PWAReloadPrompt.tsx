import { useRegisterSW } from "virtual:pwa-register/react";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function PWAReloadPrompt() {
	const { t } = useTranslation();
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

	// Show notification when app is ready for offline use (show once)
	useEffect(() => {
		if (offlineReady) {
			toast.success(
				t("pwa.offline_ready_title", "App is ready for offline use!"),
				{
					description: t(
						"pwa.offline_ready_desc",
						"You can now use the app even without internet.",
					),
					action: {
						label: t("pwa.offline_ready_action", "Got it"),
						onClick: close,
					},
				},
			);
		}
	}, [offlineReady, close, t]);

	// Show notification asking for update when new version is available
	useEffect(() => {
		if (needRefresh) {
			toast.info(t("pwa.update_available_title", "New version available"), {
				description: t(
					"pwa.update_available_desc",
					"Click update to load the latest features.",
				),
				duration: Infinity,
				action: {
					label: t("pwa.update_action", "Update Now"),
					onClick: () => updateServiceWorker(true),
				},
				cancel: {
					label: t("pwa.update_later", "Later"),
					onClick: close,
				},
			});
		}
	}, [needRefresh, updateServiceWorker, close, t]);

	return null; // This component doesn't render any DOM; it only triggers toasts
}
