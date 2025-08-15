import { ModuleType } from "../types/blueprint";
import { SettingsData } from "./settingsManager";

export const DEFAULT_CATEGORY_NAMES: Record<ModuleType, string> = {
	[ModuleType.RefinedGoods]: "Refined Goods",
	[ModuleType.HighTechGoods]: "High Tech Goods",
	[ModuleType.ShipTechnology]: "Ship Technology",
	[ModuleType.Recycling]: "Recycling",
	[ModuleType.AgriculturalGoodsL1]: "Agricultural Goods L1",
	[ModuleType.AgriculturalGoodsL2]: "Agricultural Goods L2",
	[ModuleType.PharmaceuticalGoods]: "Pharmaceutical Goods",
	[ModuleType.Habitation]: "Habitation",
	[ModuleType.DockArea]: "Dock Area",
	[ModuleType.Pier]: "Pier",
	[ModuleType.BuildModule]: "Build Module",
	[ModuleType.Storage]: "Storage",
	[ModuleType.Defense]: "Defense",
	[ModuleType.Connection]: "Connection",
	[ModuleType.Other]: "Other"
};

export function getCategoryDisplayName(
	type: ModuleType,
	customCategories?: Record<string, { displayName: string }>
): string {
	const custom = customCategories?.[type];
	return custom?.displayName || DEFAULT_CATEGORY_NAMES[type];
}

export function getAllCategories(customCategories?: Record<string, { displayName: string }>) {
	return Object.values(ModuleType).map(type => ({
		id: type,
		displayName: getCategoryDisplayName(type, customCategories),
		isCustom: !!customCategories?.[type],
		isBuiltin: true
	}));
}

export interface CategoryOption {
	value: string;
	label: string;
}

export function getOrderedCategories(settings?: SettingsData | null): CategoryOption[] {
	const categories: CategoryOption[] = [];

	// Add built-in categories
	Object.values(ModuleType).forEach(type => {
		const custom = settings?.customCategories[type];
		categories.push({
			value: type,
			label: custom?.displayName || DEFAULT_CATEGORY_NAMES[type]
		});
	});

	// Add custom categories
	settings?.customCategoryTypes?.forEach(type => {
		const custom = settings.customCategories[type];
		categories.push({
			value: type,
			label: custom?.displayName || type
		});
	});

	// Sort according to categoryOrder if available
	if (settings?.categoryOrder) {
		categories.sort((a, b) => {
			const aIndex = settings.categoryOrder!.indexOf(a.value);
			const bIndex = settings.categoryOrder!.indexOf(b.value);
			// If not in order array, put at end
			if (aIndex === -1 && bIndex === -1) return 0;
			if (aIndex === -1) return 1;
			if (bIndex === -1) return -1;
			return aIndex - bIndex;
		});
	}

	return categories;
}
