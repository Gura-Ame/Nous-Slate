import { create, type StateCreator } from "zustand"; // 1. Import StateCreator
import { persist } from "zustand/middleware";

interface SettingsState {
	autoPlayAudio: boolean;
	soundEffects: boolean;
	dailyNewLimit: number;

	setAutoPlayAudio: (enable: boolean) => void;
	setSoundEffects: (enable: boolean) => void;
	setDailyNewLimit: (limit: number) => void;
	increaseDailyLimit: () => void;
	decreaseDailyLimit: () => void;
}

export const useSettingsStore = create<SettingsState>()(
	persist(
		(set) => ({
			autoPlayAudio: false,
			soundEffects: true,
			dailyNewLimit: 20,

			setAutoPlayAudio: (enable) => set({ autoPlayAudio: enable }),
			setSoundEffects: (enable) => set({ soundEffects: enable }),
			setDailyNewLimit: (limit) => set({ dailyNewLimit: limit }),

			increaseDailyLimit: () =>
				set((state) => ({
					dailyNewLimit: Math.min(state.dailyNewLimit + 5, 100),
				})),
			decreaseDailyLimit: () =>
				set((state) => ({
					dailyNewLimit: Math.max(state.dailyNewLimit - 5, 5),
				})),
		}),
		{
			name: "nous-settings-storage",
		},
	) as StateCreator<SettingsState>,
);
