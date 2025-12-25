import { Globe, Monitor, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataManagement } from "@/components/settings/DataManagement";
import { useTheme } from "@/components/theme-context";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassPage } from "@/components/ui/glass/GlassPage";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettingsStore } from "@/store/useSettingsStore";

export default function Settings() {
	const { t, i18n } = useTranslation();
	const { theme, setTheme } = useTheme();

	const { autoPlayAudio, setAutoPlayAudio, soundEffects, setSoundEffects } =
		useSettingsStore();

	const changeLanguage = (lng: string) => {
		i18n.changeLanguage(lng);
	};

	return (
		<GlassPage className="flex justify-center">
			<div className="container p-8 space-y-8 max-w-3xl">
				<PageHeader
					title={t("settings.title", "Settings")}
					description={t("settings.description", "Manage preferences.")}
				/>

				{/* Appearance Settings */}
				<GlassCard className="p-6">
					<div className="space-y-4">
						<div className="border-b pb-4 dark:border-slate-800">
							<h3 className="text-lg font-bold">
								{t("settings.appearance", "Appearance")}
							</h3>
							<p className="text-sm text-muted-foreground">
								{t("settings.appearance_desc", "Customize interface.")}
							</p>
						</div>

						{/* Language */}
						<div className="flex items-center justify-between">
							<Label className="flex items-center gap-2">
								<Globe className="h-4 w-4" />
								{t("settings.language", "Language")}
							</Label>
							<div className="flex gap-2">
								<Button
									variant={i18n.language === "zh-TW" ? "default" : "outline"}
									size="sm"
									onClick={() => changeLanguage("zh-TW")}
								>
									{t("settings_page.language_zh_tw", "Traditional Chinese")}
								</Button>
								<Button
									variant={i18n.language === "en" ? "default" : "outline"}
									size="sm"
									onClick={() => changeLanguage("en")}
								>
									English
								</Button>
							</div>
						</div>

						{/* Theme */}
						<div className="flex items-center justify-between">
							<Label>{t("settings.theme_mode", "Theme Mode")}</Label>
							<div className="flex gap-2">
								<Button
									variant={theme === "light" ? "default" : "outline"}
									size="icon"
									onClick={() => setTheme("light")}
									title={t("settings.light", "Light")}
								>
									<Sun className="h-4 w-4" />
								</Button>
								<Button
									variant={theme === "dark" ? "default" : "outline"}
									size="icon"
									onClick={() => setTheme("dark")}
									title={t("settings.dark", "Dark")}
								>
									<Moon className="h-4 w-4" />
								</Button>
								<Button
									variant={theme === "system" ? "default" : "outline"}
									size="icon"
									onClick={() => setTheme("system")}
									title={t("settings.system", "System")}
								>
									<Monitor className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				</GlassCard>

				{/* Learning Settings */}
				<GlassCard className="p-6">
					<div className="space-y-6">
						<div className="border-b pb-4 dark:border-slate-800">
							<h3 className="text-lg font-bold">
								{t("settings.learning_pref", "Learning Preferences")}
							</h3>
							<p className="text-sm text-muted-foreground">
								{t("settings.learning_pref_desc", "Adjust study behavior.")}
							</p>
						</div>

						{/* Auto-play Pronunciation */}
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>{t("settings.auto_play", "Auto-play Audio")}</Label>
								<p className="text-sm text-slate-500">
									{t(
										"settings.auto_play_desc",
										"Read aloud when entering a card",
									)}
								</p>
							</div>
							<Switch
								checked={autoPlayAudio}
								onCheckedChange={setAutoPlayAudio}
							/>
						</div>

						<div className="h-px bg-slate-100 dark:bg-slate-800" />

						{/* Sound Effects */}
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>{t("settings.sound_effects", "Sound Effects")}</Label>
								<p className="text-sm text-slate-500">
									{t("settings.sound_effects_desc", "Play sounds for answers")}
								</p>
							</div>
							<Switch
								checked={soundEffects}
								onCheckedChange={setSoundEffects}
							/>
						</div>
					</div>
				</GlassCard>

				<DataManagement />
			</div>
		</GlassPage>
	);
}
