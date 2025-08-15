import { ModuleType } from "../types/blueprint";

export interface CustomModule {
	macro: string;
	displayName: string;
	type: ModuleType;
	isCustom: boolean;
}

export interface CustomCategory {
	id: string;
	displayName: string;
	isCustom: boolean;
}

export interface SettingsData {
	customModules: Record<string, CustomModule>;
	customCategories: Record<string, CustomCategory>;
	customCategoryTypes: string[];
	categoryOrder?: string[];
	moduleOverrides: Record<string, Partial<CustomModule>>;
	moduleCollapseThreshold?: number;
}

const SETTINGS_KEY = "x4_blueprint_settings";
const BLUEPRINT_STATE_KEY = "blueprintBuilder_savedState";

export class SettingsManager {
	static loadSettings(): SettingsData | null {
		try {
			const saved = localStorage.getItem(SETTINGS_KEY);
			if (saved) {
				return JSON.parse(saved);
			}
		} catch (error) {
			console.error("Failed to load settings:", error);
		}
		return null;
	}

	static saveSettings(settings: SettingsData): boolean {
		try {
			localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
			return true;
		} catch (error) {
			console.error("Failed to save settings:", error);
			return false;
		}
	}

	static updateSettings(updates: Partial<SettingsData>): boolean {
		const current = this.loadSettings() || this.getDefaultSettings();
		const updated = { ...current, ...updates };
		return this.saveSettings(updated);
	}

	static getDefaultSettings(): SettingsData {
		return {
			customModules: {},
			customCategories: {},
			customCategoryTypes: [],
			moduleOverrides: {},
			moduleCollapseThreshold: 5
		};
	}

	static loadBlueprintState<T>(): T | null {
		try {
			const saved = localStorage.getItem(BLUEPRINT_STATE_KEY);
			if (saved) {
				return JSON.parse(saved) as T;
			}
		} catch (error) {
			console.error("Failed to load blueprint state:", error);
		}
		return null;
	}

	static saveBlueprintState<T>(state: T): boolean {
		try {
			localStorage.setItem(BLUEPRINT_STATE_KEY, JSON.stringify(state));
			return true;
		} catch (error) {
			console.error("Failed to save blueprint state:", error);
			return false;
		}
	}

	static exportSettings(): string {
		const settings = this.loadSettings() || this.getDefaultSettings();
		return JSON.stringify(settings, null, 2);
	}

	static importSettings(json: string): boolean {
		try {
			const settings = JSON.parse(json);
			return this.saveSettings(settings);
		} catch (error) {
			console.error("Failed to import settings:", error);
			return false;
		}
	}
}
