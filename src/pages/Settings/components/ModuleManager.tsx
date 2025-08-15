import React, { useState, useMemo } from "react";
import { ModuleType } from "../../../types/blueprint";
import { getAllModules } from "../../../utils/moduleTypeClassifier";
import { SettingsData, CustomModule } from "../SettingsPage";
import { getOrderedCategories } from "../../../utils/categoryUtils";
import styles from "./ModuleManager.module.scss";

interface ModuleManagerProps {
	settings: SettingsData;
	onUpdateSettings: (settings: Partial<SettingsData>) => void;
	className?: string;
}

const ModuleManager: React.FC<ModuleManagerProps> = ({ settings, onUpdateSettings, className }) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedType, setSelectedType] = useState<ModuleType | "all" | "custom">("all");
	const [editingModule, setEditingModule] = useState<string | null>(null);
	const [showAddModule, setShowAddModule] = useState(false);

	const allModules = useMemo(() => {
		const baseModules = getAllModules();
		const modules: Record<string, CustomModule> = {};

		Object.entries(baseModules).forEach(([_type, moduleList]) => {
			moduleList.forEach(module => {
				const override = settings.moduleOverrides[module.macro];
				modules[module.macro] = {
					macro: module.macro,
					displayName: override?.displayName || module.displayName,
					type: (override?.type || module.type) as ModuleType,
					isCustom: false
				};
			});
		});

		Object.entries(settings.customModules).forEach(([macro, module]) => {
			modules[macro] = module;
		});

		return modules;
	}, [settings]);

	const filteredModules = useMemo(() => {
		let modules = Object.values(allModules);

		if (selectedType !== "all") {
			if (selectedType === "custom") {
				modules = modules.filter(m => m.isCustom);
			} else {
				modules = modules.filter(m => m.type === selectedType);
			}
		}

		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			modules = modules.filter(
				m => m.displayName.toLowerCase().includes(term) || m.macro.toLowerCase().includes(term)
			);
		}

		return modules.sort((a, b) => a.displayName.localeCompare(b.displayName));
	}, [allModules, selectedType, searchTerm]);

	const handleEditModule = (module: CustomModule) => {
		setEditingModule(module.macro);
	};

	const handleSaveModule = (macro: string, updates: Partial<CustomModule>) => {
		if (allModules[macro].isCustom) {
			if (updates.macro && updates.macro !== macro) {
				// If the macro is being changed remove old entry and add new one
				const newCustomModules = { ...settings.customModules };
				delete newCustomModules[macro];
				newCustomModules[updates.macro] = {
					...settings.customModules[macro],
					...updates
				};
				onUpdateSettings({ customModules: newCustomModules });
			} else {
				onUpdateSettings({
					customModules: {
						...settings.customModules,
						[macro]: { ...settings.customModules[macro], ...updates }
					}
				});
			}
		} else {
			onUpdateSettings({
				moduleOverrides: {
					...settings.moduleOverrides,
					[macro]: { ...settings.moduleOverrides[macro], ...updates }
				}
			});
		}
		setEditingModule(null);
	};

	const handleDeleteModule = (macro: string) => {
		if (!window.confirm(`Delete module "${allModules[macro].displayName}"?`)) {
			return;
		}

		if (allModules[macro].isCustom) {
			const newCustomModules = { ...settings.customModules };
			delete newCustomModules[macro];
			onUpdateSettings({ customModules: newCustomModules });
		}
	};

	const handleAddModule = (module: CustomModule) => {
		onUpdateSettings({
			customModules: {
				...settings.customModules,
				[module.macro]: module
			}
		});
		setShowAddModule(false);
	};

	const allCategories = getOrderedCategories(settings);
	const typeOptions = [
		{ value: "all", label: "All Modules" },
		{ value: "custom", label: "Custom Modules" },
		...allCategories
	];

	return (
		<div className={`${styles.moduleManager} ${className || ""}`}>
			<div className={styles.managerControls}>
				<div className={styles.controlsLeft}>
					<input
						type="text"
						placeholder="Search modules..."
						value={searchTerm}
						onChange={e => setSearchTerm(e.target.value)}
						className={styles.searchInput}
					/>

					<select
						value={selectedType}
						onChange={e => setSelectedType(e.target.value as ModuleType | "all" | "custom")}
						className={styles.typeFilter}
					>
						{typeOptions.map(option => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>

				<button onClick={() => setShowAddModule(true)} className={styles.addModuleButton}>
					Add Custom Module
				</button>
			</div>

			<div className={styles.modulesList}>
				<div className={styles.modulesGrid}>
					{filteredModules.length === 0 ? (
						<div className={styles.emptyState}>No modules found matching your criteria</div>
					) : (
						filteredModules.map(module => (
							<ModuleItem
								key={module.macro}
								module={module}
								isEditing={editingModule === module.macro}
								onEdit={() => handleEditModule(module)}
								onSave={updates => handleSaveModule(module.macro, updates)}
								onDelete={() => handleDeleteModule(module.macro)}
								onCancel={() => setEditingModule(null)}
								categories={allCategories}
							/>
						))
					)}
				</div>
			</div>

			{showAddModule && (
				<AddModuleDialog
					existingMacros={Object.keys(allModules)}
					onAdd={handleAddModule}
					onCancel={() => setShowAddModule(false)}
					categories={allCategories}
				/>
			)}
		</div>
	);
};

interface ModuleItemProps {
	module: CustomModule;
	isEditing: boolean;
	onEdit: () => void;
	onSave: (updates: Partial<CustomModule>) => void;
	onDelete: () => void;
	onCancel: () => void;
	categories: Array<{ value: string; label: string }>;
}

const ModuleItem: React.FC<ModuleItemProps> = ({
	module,
	isEditing,
	onEdit,
	onSave,
	onDelete,
	onCancel,
	categories
}) => {
	const [displayName, setDisplayName] = useState(module.displayName);
	const [macro, setMacro] = useState(module.macro);
	const [type, setType] = useState(module.type);

	if (isEditing) {
		return (
			<div className={`${styles.moduleItem} ${styles.editing}`}>
				<div className={styles.editForm}>
					<input
						type="text"
						value={displayName}
						onChange={e => setDisplayName(e.target.value)}
						className={styles.editInput}
						placeholder="Display Name"
					/>
					<input
						type="text"
						value={macro}
						onChange={e => setMacro(e.target.value)}
						className={styles.editInput}
						placeholder="Macro"
						disabled={!module.isCustom}
						title={!module.isCustom ? "Cannot edit macro of built-in modules" : ""}
					/>
					<select
						value={type}
						onChange={e => setType(e.target.value as ModuleType)}
						className={styles.editSelect}
					>
						{categories.map(cat => (
							<option key={cat.value} value={cat.value}>
								{cat.label}
							</option>
						))}
					</select>
					<div className={styles.editActions}>
						<button
							onClick={() => onSave({ displayName, macro: module.isCustom ? macro : module.macro, type })}
							className={styles.saveButton}
						>
							Save
						</button>
						<button onClick={onCancel} className={styles.cancelButton}>
							Cancel
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.moduleItem}>
			<div className={styles.moduleCard}>
				<div className={styles.moduleCardHeader}>
					<div className={styles.moduleName} title={module.displayName}>
						{module.displayName}
					</div>
					<div className={styles.moduleActions}>
						<button onClick={onEdit} className={styles.editButton} title="Edit">
							✏️
						</button>
						{module.isCustom && (
							<button onClick={onDelete} className={styles.deleteButton} title="Delete">
								🗑️
							</button>
						)}
					</div>
				</div>
				<div className={styles.moduleMacro} title={module.macro}>
					{module.macro}
				</div>
				<div className={styles.moduleCardFooter}>
					<div className={styles.moduleTypeInfo}>
						{module.isCustom && <span className={styles.customBadge}>Custom</span>}
						<span className={styles.moduleType}>
							{categories.find(c => c.value === module.type)?.label || module.type}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

interface AddModuleDialogProps {
	existingMacros: string[];
	onAdd: (module: CustomModule) => void;
	onCancel: () => void;
	categories: Array<{ value: string; label: string }>;
}

const AddModuleDialog: React.FC<AddModuleDialogProps> = ({
	existingMacros,
	onAdd,
	onCancel,
	categories
}) => {
	const [macro, setMacro] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [type, setType] = useState<string>(categories[0]?.value || ModuleType.Other);
	const [error, setError] = useState("");

	const handleSubmit = () => {
		if (!macro.trim()) {
			setError("Macro name is required");
			return;
		}
		if (!displayName.trim()) {
			setError("Display name is required");
			return;
		}
		if (existingMacros.includes(macro)) {
			setError("A module with this macro already exists");
			return;
		}

		onAdd({
			macro: macro.trim(),
			displayName: displayName.trim(),
			type: type as ModuleType,
			isCustom: true
		});
	};

	return (
		<div className={styles.addModuleDialog}>
			<h3>Add Custom Module</h3>
			{error && <div className={styles.errorMessage}>{error}</div>}
			<div className={styles.formGroup}>
				<label>Macro Name:</label>
				<input
					type="text"
					value={macro}
					onChange={e => setMacro(e.target.value)}
					placeholder="e.g. custom_module_01_macro"
				/>
			</div>
			<div className={styles.formGroup}>
				<label>Display Name:</label>
				<input
					type="text"
					value={displayName}
					onChange={e => setDisplayName(e.target.value)}
					placeholder="e.g. Custom Module"
				/>
			</div>
			<div className={styles.formRowGroup}>
				<div className={styles.formGroup}>
					<label>Category:</label>
					<select value={type} onChange={e => setType(e.target.value)} className={styles.categorySelect}>
						{categories.map(cat => (
							<option key={cat.value} value={cat.value}>
								{cat.label}
							</option>
						))}
					</select>
				</div>
				<div className={styles.dialogActions}>
					<button onClick={handleSubmit} className={styles.addButton}>
						Add Module
					</button>
					<button onClick={onCancel} className={styles.cancelButton}>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
};

export default ModuleManager;
