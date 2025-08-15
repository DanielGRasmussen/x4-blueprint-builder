import React, { useState } from "react";
import { ModuleType } from "../../../types/blueprint";
import { SettingsData, CustomCategory } from "../SettingsPage";
import { DEFAULT_CATEGORY_NAMES, getOrderedCategories } from "../../../utils/categoryUtils";
import styles from "./CategoryManager.module.scss";

interface CategoryManagerProps {
	settings: SettingsData;
	onUpdateSettings: (settings: Partial<SettingsData>) => void;
	className?: string;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
	settings,
	onUpdateSettings,
	className
}) => {
	const [editingCategory, setEditingCategory] = useState<string | null>(null);
	const [showAddCategory, setShowAddCategory] = useState(false);
	const [draggedCategory, setDraggedCategory] = useState<string | null>(null);
	const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);

	const orderedCategories = getOrderedCategories(settings);

	// Transform ordered categories to include additional metadata
	const allCategories = orderedCategories.map(cat => {
		const isBuiltin = Object.values(ModuleType).includes(cat.value as ModuleType);
		const custom = settings.customCategories[cat.value];
		return {
			id: cat.value,
			displayName: cat.label,
			isCustom: !!custom,
			isBuiltin
		};
	});

	const handleEditCategory = (category: string) => {
		setEditingCategory(category);
	};

	const handleSaveCategory = (category: string, displayName: string) => {
		if (displayName === DEFAULT_CATEGORY_NAMES[category as ModuleType]) {
			const newCustomCategories = { ...settings.customCategories };
			delete newCustomCategories[category];
			onUpdateSettings({ customCategories: newCustomCategories });
		} else {
			onUpdateSettings({
				customCategories: {
					...settings.customCategories,
					[category]: {
						id: category,
						displayName,
						isCustom: true
					}
				}
			});
		}
		setEditingCategory(null);
	};

	const handleResetCategory = (category: string) => {
		const newCustomCategories = { ...settings.customCategories };
		delete newCustomCategories[category];
		onUpdateSettings({ customCategories: newCustomCategories });
	};

	const handleResetAll = () => {
		if (window.confirm("Reset all category names to defaults?")) {
			onUpdateSettings({ customCategories: {} });
		}
	};

	const handleAddCategory = () => {
		setShowAddCategory(true);
	};

	const handleSaveNewCategory = (categoryId: string, displayName: string) => {
		const newCustomCategoryTypes = [...settings.customCategoryTypes, categoryId];

		const newCustomCategories = {
			...settings.customCategories,
			[categoryId]: {
				id: categoryId,
				displayName,
				isCustom: true
			}
		};

		onUpdateSettings({
			customCategoryTypes: newCustomCategoryTypes,
			customCategories: newCustomCategories
		});

		setShowAddCategory(false);
	};

	const handleDeleteCategory = (categoryId: string) => {
		if (
			window.confirm(
				`Delete custom category "${categoryId}"? This will not delete modules in this category.`
			)
		) {
			const newCustomCategoryTypes = settings.customCategoryTypes.filter(id => id !== categoryId);

			const newCustomCategories = { ...settings.customCategories };
			delete newCustomCategories[categoryId];

			onUpdateSettings({
				customCategoryTypes: newCustomCategoryTypes,
				customCategories: newCustomCategories
			});
		}
	};

	const handleDragStart = (categoryId: string) => {
		setDraggedCategory(categoryId);
	};

	const handleDragOver = (e: React.DragEvent, categoryId: string) => {
		e.preventDefault();
		setDragOverCategory(categoryId);
	};

	const handleDragLeave = () => {
		setDragOverCategory(null);
	};

	const handleDrop = (e: React.DragEvent, targetCategoryId: string) => {
		e.preventDefault();

		if (!draggedCategory || draggedCategory === targetCategoryId) {
			setDraggedCategory(null);
			setDragOverCategory(null);
			return;
		}

		const currentOrder = allCategories.map(c => c.id);
		const draggedIndex = currentOrder.indexOf(draggedCategory);
		const targetIndex = currentOrder.indexOf(targetCategoryId);

		currentOrder.splice(draggedIndex, 1);
		currentOrder.splice(targetIndex, 0, draggedCategory);

		onUpdateSettings({
			categoryOrder: currentOrder
		});

		setDraggedCategory(null);
		setDragOverCategory(null);
	};

	const handleDragEnd = () => {
		setDraggedCategory(null);
		setDragOverCategory(null);
	};

	return (
		<div className={`${styles.categoryManager} ${className || ""}`}>
			<div className={styles.managerHeader}>
				<h3>Category Names</h3>
				<div className={styles.headerActions}>
					<button onClick={handleAddCategory} className={styles.addCategoryButton}>
						Add Category
					</button>
					<button onClick={handleResetAll} className={styles.resetAllButton}>
						Reset All to Defaults
					</button>
				</div>
			</div>

			<div className={styles.categoriesList}>
				{allCategories.map(category => (
					<CategoryItem
						key={category.id}
						category={category}
						isEditing={editingCategory === category.id}
						isDragging={draggedCategory === category.id}
						isDragOver={dragOverCategory === category.id}
						onEdit={() => handleEditCategory(category.id)}
						onSave={name => handleSaveCategory(category.id, name)}
						onReset={() => handleResetCategory(category.id)}
						onCancel={() => setEditingCategory(null)}
						onDelete={category.isBuiltin ? undefined : () => handleDeleteCategory(category.id)}
						onDragStart={() => handleDragStart(category.id)}
						onDragOver={e => handleDragOver(e, category.id)}
						onDragLeave={handleDragLeave}
						onDrop={e => handleDrop(e, category.id)}
						onDragEnd={handleDragEnd}
					/>
				))}
			</div>

			{showAddCategory && (
				<AddCategoryDialog
					existingCategories={allCategories.map(c => c.id)}
					onSave={handleSaveNewCategory}
					onCancel={() => setShowAddCategory(false)}
				/>
			)}
		</div>
	);
};

interface CategoryItemProps {
	category: CustomCategory & { isBuiltin?: boolean };
	isEditing: boolean;
	isDragging: boolean;
	isDragOver: boolean;
	onEdit: () => void;
	onSave: (name: string) => void;
	onReset: () => void;
	onCancel: () => void;
	onDelete?: () => void;
	onDragStart: () => void;
	onDragOver: (e: React.DragEvent) => void;
	onDragLeave: () => void;
	onDrop: (e: React.DragEvent) => void;
	onDragEnd: () => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
	category,
	isEditing,
	isDragging,
	isDragOver,
	onEdit,
	onSave,
	onReset,
	onCancel,
	onDelete,
	onDragStart,
	onDragOver,
	onDragLeave,
	onDrop,
	onDragEnd
}) => {
	const [displayName, setDisplayName] = useState(category.displayName);

	if (isEditing) {
		return (
			<div className={`${styles.categoryItem} ${styles.editing}`}>
				<span className={`${styles.dragHandle} ${styles.disabled}`}>⋮⋮</span>
				<span className={styles.categoryId}>{category.id}</span>
				<input
					type="text"
					value={displayName}
					onChange={e => setDisplayName(e.target.value)}
					className={styles.editInput}
				/>
				<div className={styles.editActions}>
					<button onClick={() => onSave(displayName)} className={styles.saveButton}>
						Save
					</button>
					<button onClick={onCancel} className={styles.cancelButton}>
						Cancel
					</button>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`${styles.categoryItem} ${isDragging ? styles.dragging : ""} ${isDragOver ? styles.dragOver : ""}`}
			onDragOver={onDragOver}
			onDragLeave={onDragLeave}
			onDrop={onDrop}
		>
			<span
				className={styles.dragHandle}
				draggable
				onDragStart={onDragStart}
				onDragEnd={onDragEnd}
				title="Drag to reorder"
			>
				⋮⋮
			</span>
			<span className={styles.categoryId}>{category.id}</span>
			<span className={styles.categoryName}>
				{category.displayName}
				{category.isCustom && <span className={styles.customIndicator}> (Custom)</span>}
			</span>
			<div className={styles.categoryActions}>
				<button onClick={onEdit} className={styles.editButton} title="Edit">
					✏️
				</button>
				{category.isCustom && category.isBuiltin && (
					<button onClick={onReset} className={styles.resetButton} title="Reset to Default">
						↺
					</button>
				)}
				{onDelete && (
					<button onClick={onDelete} className={styles.deleteButton} title="Delete Category">
						🗑️
					</button>
				)}
			</div>
		</div>
	);
};

interface AddCategoryDialogProps {
	existingCategories: string[];
	onSave: (categoryId: string, displayName: string) => void;
	onCancel: () => void;
}

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({
	existingCategories,
	onSave,
	onCancel
}) => {
	const [categoryId, setCategoryId] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Validate
		if (!categoryId.trim()) {
			setError("Category ID is required");
			return;
		}

		if (!displayName.trim()) {
			setError("Display name is required");
			return;
		}

		if (existingCategories.includes(categoryId)) {
			setError("A category with this ID already exists");
			return;
		}

		// Check if ID is alphanumeric with underscores only
		if (!/^[a-zA-Z0-9_]+$/.test(categoryId)) {
			setError("Category ID must contain only letters, numbers, and underscores");
			return;
		}

		onSave(categoryId, displayName);
	};

	return (
		<div className={styles.addCategoryDialog}>
			<h3>Add Custom Category</h3>

			{error && <div className={styles.errorMessage}>{error}</div>}

			<form onSubmit={handleSubmit}>
				<div className={styles.formGroup}>
					<label>Category ID</label>
					<input
						type="text"
						value={categoryId}
						onChange={e => {
							setCategoryId(e.target.value);
							setError("");
						}}
						placeholder="e.g., custom_modules"
						autoFocus
					/>
					<small>Unique identifier (letters, numbers, underscores only)</small>
				</div>

				<div className={styles.formGroup}>
					<label>Display Name</label>
					<input
						type="text"
						value={displayName}
						onChange={e => {
							setDisplayName(e.target.value);
							setError("");
						}}
						placeholder="e.g., Custom Modules"
					/>
				</div>

				<div className={styles.dialogActions}>
					<button type="submit" className={styles.addButton}>
						Add Category
					</button>
					<button type="button" onClick={onCancel} className={styles.cancelButton}>
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
};

export default CategoryManager;
