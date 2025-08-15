import React, { useState, useMemo } from "react";
import { ModuleInfo } from "../../../types/blueprint";
import { getAllModules } from "../../../utils/moduleTypeClassifier";
import { useSettings } from "../../../hooks/useSettings";
import { getOrderedCategories } from "../../../utils/categoryUtils";
import styles from "./ModuleCatalog.module.scss";

interface ModuleCatalogProps {
	onAddModule: (moduleInfo: ModuleInfo) => void;
	className?: string;
}

const ModuleCatalog: React.FC<ModuleCatalogProps> = ({ onAddModule, className }) => {
	const { settings } = useSettings();
	const [selectedType, setSelectedType] = useState<string>("all");
	const [searchTerm, setSearchTerm] = useState("");

	const modulesByType = useMemo((): Record<string, ModuleInfo[]> => {
		const baseModules = getAllModules();

		if (!settings) return baseModules as Record<string, ModuleInfo[]>;

		// Apply module overrides and add custom modules
		const updatedModules: Record<string, ModuleInfo[]> = {};

		Object.entries(baseModules).forEach(([type, modules]) => {
			updatedModules[type] = modules.map((module: ModuleInfo) => {
				const override = settings.moduleOverrides[module.macro];
				if (override) {
					return {
						...module,
						displayName: override.displayName || module.displayName,
						type: override.type || module.type
					};
				}
				return module;
			});
		});

		if (settings.customModules) {
			Object.values(settings.customModules).forEach(customModule => {
				const type = customModule.type as string;
				if (!updatedModules[type]) {
					updatedModules[type] = [];
				}
				updatedModules[type].push({
					macro: customModule.macro,
					displayName: customModule.displayName,
					type: customModule.type
				});
			});
		}

		return updatedModules;
	}, [settings]);

	const allModules = useMemo(() => {
		const modules: ModuleInfo[] = [];
		Object.values(modulesByType).forEach(typeModules => {
			modules.push(...typeModules);
		});
		return modules;
	}, [modulesByType]);

	// Filter modules based on search term
	const filteredModules = useMemo(() => {
		const modules = selectedType === "all" ? allModules : modulesByType[selectedType] || [];
		if (!searchTerm) return modules;

		return modules.filter(
			(module: ModuleInfo) =>
				module.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				module.macro.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [modulesByType, allModules, selectedType, searchTerm]);

	const getCategoryOptions = useMemo(() => {
		const orderedCategories = getOrderedCategories(settings);
		// Add count information and filter out empty categories
		const options = orderedCategories
			.map(cat => ({
				...cat,
				count: modulesByType[cat.value]?.length || 0
			}))
			.filter(opt => opt.count > 0);

		return options;
	}, [settings, modulesByType]);

	return (
		<div className={`${styles.moduleCatalog} ${className || ""}`}>
			<div className={styles.catalogControls}>
				<select
					className={styles.typeSelector}
					value={selectedType}
					onChange={e => setSelectedType(e.target.value)}
				>
					<option value="all">All ({allModules.length})</option>
					{getCategoryOptions.map((option: { value: string; label: string; count: number }) => (
						<option key={option.value} value={option.value}>
							{option.label} ({option.count})
						</option>
					))}
				</select>

				<input
					type="text"
					className={styles.moduleSearch}
					placeholder="Search modules..."
					value={searchTerm}
					onChange={e => setSearchTerm(e.target.value)}
				/>
			</div>

			<div className={styles.moduleList}>
				{filteredModules.length === 0 ? (
					<div className={styles.emptyState}>
						{searchTerm ? "No modules found matching your search" : "No modules in this category"}
					</div>
				) : (
					filteredModules.map((module: ModuleInfo) => (
						<div
							key={module.macro}
							className={styles.moduleItem}
							onClick={() => onAddModule(module)}
							title={module.displayName}
						>
							<span className={styles.moduleName}>{module.displayName}</span>
							<span className={styles.moduleMacro} title={module.macro}>
								{module.macro}
							</span>
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default ModuleCatalog;
