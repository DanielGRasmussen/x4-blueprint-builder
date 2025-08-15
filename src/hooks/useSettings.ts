import { useState, useEffect } from "react";
import { SettingsManager, SettingsData } from "../utils/settingsManager";

export function useSettings() {
	const [settings, setSettings] = useState<SettingsData>(() => {
		return SettingsManager.loadSettings() || SettingsManager.getDefaultSettings();
	});

	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === "x4_blueprint_settings" && e.newValue) {
				try {
					setSettings(JSON.parse(e.newValue));
				} catch {
					// Ignore parsing errors
				}
			}
		};

		window.addEventListener("storage", handleStorageChange);
		return () => window.removeEventListener("storage", handleStorageChange);
	}, []);

	const updateSettings = (updates: Partial<SettingsData>) => {
		const newSettings = { ...settings, ...updates };
		setSettings(newSettings);
		SettingsManager.saveSettings(newSettings);
	};

	const resetSettings = () => {
		const defaultSettings = SettingsManager.getDefaultSettings();
		setSettings(defaultSettings);
		SettingsManager.saveSettings(defaultSettings);
	};

	return {
		settings,
		updateSettings,
		resetSettings,
		exportSettings: () => SettingsManager.exportSettings(),
		importSettings: (json: string) => {
			if (SettingsManager.importSettings(json)) {
				const imported = SettingsManager.loadSettings();
				if (imported) {
					setSettings(imported);
					return true;
				}
			}
			return false;
		}
	};
}
