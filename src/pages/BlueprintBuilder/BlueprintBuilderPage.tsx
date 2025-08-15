import React, { useState, useEffect, useRef } from "react";
import { Blueprint, BlueprintEntry, ModuleInfo } from "../../types/blueprint";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import ModuleCatalog from "./components/ModuleCatalog";
import BlueprintList from "./components/BlueprintList";
import ModuleEditor from "./components/ModuleEditor";
import { v4 as uuidv4 } from "uuid";
import { BlueprintParser } from "../../utils/blueprintParser";
import { ErrorHandler } from "../../utils/errorHandler";
import styles from "./BlueprintBuilderPage.module.scss";
console.log("BlueprintBuilderPage styles:", styles);

interface SavedState {
	blueprint: Blueprint;
	blueprintName: string;
}

const getDefaultState = (): SavedState => ({
	blueprint: {
		id: uuidv4(),
		name: "New Blueprint",
		patches: [
			{
				extension: "base",
				version: "1",
				name: "Base Game"
			}
		],
		entries: []
	},
	blueprintName: "New Blueprint"
});

const BlueprintBuilderPage: React.FC = () => {
	const [savedState, setSavedState] = useLocalStorage<SavedState>(
		"blueprintBuilder_savedState",
		getDefaultState()
	);
	const [blueprint, setBlueprint] = useState<Blueprint>(() => savedState.blueprint);
	const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
	const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
	const [blueprintName, setBlueprintName] = useState(() => savedState.blueprintName);
	const [generateNewId, setGenerateNewId] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
	const [isAtBottom, setIsAtBottom] = useState(true);
	const lastSavedRef = useRef<string>("");

	// Update blueprint name when it changes
	useEffect(() => {
		setBlueprint(prev => ({ ...prev, name: blueprintName }));
	}, [blueprintName]);

	useEffect(() => {
		const newState = {
			blueprint,
			blueprintName
		};
		const serialized = JSON.stringify(newState);
		// Only update if actually changed to prevent infinite loop
		if (lastSavedRef.current !== serialized) {
			lastSavedRef.current = serialized;
			setSavedState(newState);
		}
	}, [blueprint, blueprintName, setSavedState]);

	const handleAddModule = (moduleInfo: ModuleInfo) => {
		// Check if we should auto-scroll before adding
		setShouldAutoScroll(isAtBottom);

		const newEntry: BlueprintEntry = {
			index: blueprint.entries.length,
			macro: moduleInfo.macro,
			connection: blueprint.entries.length === 0 ? "01" : undefined,
			predecessor:
				blueprint.entries.length > 0
					? {
							index: blueprint.entries.length - 1,
							connection: "01"
						}
					: undefined
		};

		setBlueprint(prev => ({
			...prev,
			entries: [...prev.entries, newEntry]
		}));
	};

	const handleSelectModule = (index: number, event: React.MouseEvent) => {
		if (event.shiftKey && lastSelectedIndex !== null) {
			// Shift+click: select range
			const start = Math.min(lastSelectedIndex, index);
			const end = Math.max(lastSelectedIndex, index);
			const newSelection = new Set(selectedIndices);
			for (let i = start; i <= end; i++) {
				newSelection.add(i);
			}
			setSelectedIndices(newSelection);
		} else if (event.ctrlKey || event.metaKey) {
			// Ctrl/Cmd+click: toggle selection
			const newSelection = new Set(selectedIndices);
			if (newSelection.has(index)) {
				newSelection.delete(index);
			} else {
				newSelection.add(index);
			}
			setSelectedIndices(newSelection);
			setLastSelectedIndex(index);
		} else {
			// Regular click: select only this one
			setSelectedIndices(new Set([index]));
			setLastSelectedIndex(index);
		}
	};

	const handleSelectGroup = (startIndex: number, endIndex: number, event: React.MouseEvent) => {
		if (event.shiftKey && lastSelectedIndex !== null) {
			// Shift+click: select range from last selected to entire group
			const start = Math.min(lastSelectedIndex, startIndex);
			const end = Math.max(lastSelectedIndex, endIndex);
			const newSelection = new Set(selectedIndices);
			for (let i = start; i <= end; i++) {
				newSelection.add(i);
			}
			setSelectedIndices(newSelection);
			// Don't update lastSelectedIndex on shift-click
		} else if (event.ctrlKey || event.metaKey) {
			// Ctrl/Cmd+click: toggle all items in group
			const groupIndices = [];
			for (let i = startIndex; i <= endIndex; i++) {
				groupIndices.push(i);
			}

			// Check if any in the group are unselected
			const anyUnselected = groupIndices.some(i => !selectedIndices.has(i));

			const newSelection = new Set(selectedIndices);
			if (anyUnselected) {
				// Add all items in the group
				groupIndices.forEach(i => newSelection.add(i));
			} else {
				// Remove all items in the group
				groupIndices.forEach(i => newSelection.delete(i));
			}
			setSelectedIndices(newSelection);
			setLastSelectedIndex(endIndex);
		} else {
			// Regular click: select only this group
			const newSelection = new Set<number>();
			for (let i = startIndex; i <= endIndex; i++) {
				newSelection.add(i);
			}
			setSelectedIndices(newSelection);
			setLastSelectedIndex(endIndex);
		}
	};

	const handleUpdateModules = (updates: Partial<BlueprintEntry>) => {
		setBlueprint(prev => ({
			...prev,
			entries: prev.entries.map(entry =>
				selectedIndices.has(entry.index) ? { ...entry, ...updates } : entry
			)
		}));
	};

	const handleDeleteModules = () => {
		const indicesToDelete = Array.from(selectedIndices).sort((a, b) => b - a);

		setBlueprint(prev => {
			let newEntries = [...prev.entries];

			// Remove selected entries
			indicesToDelete.forEach(index => {
				newEntries.splice(index, 1);
			});

			// Reindex remaining entries
			newEntries = newEntries.map((entry, idx) => ({
				...entry,
				index: idx,
				// Update predecessor indices
				predecessor: entry.predecessor
					? {
							...entry.predecessor,
							index:
								entry.predecessor.index - indicesToDelete.filter(i => i < entry.predecessor!.index).length
						}
					: undefined
			}));

			return { ...prev, entries: newEntries };
		});

		setSelectedIndices(new Set());
		setLastSelectedIndex(null);
	};

	const handleDeleteSingleModule = (index: number) => {
		setBlueprint(prev => {
			let newEntries = [...prev.entries];

			// Remove the entry
			newEntries.splice(index, 1);

			// Reindex remaining entries
			newEntries = newEntries.map((entry, idx) => ({
				...entry,
				index: idx,
				// Update predecessor indices
				predecessor: entry.predecessor
					? {
							...entry.predecessor,
							index: idx > 0 ? idx - 1 : 0
						}
					: idx > 0
						? { index: idx - 1, connection: "01" }
						: undefined
			}));

			return { ...prev, entries: newEntries };
		});

		// Update selection if needed
		if (selectedIndices.has(index)) {
			const newSelection = new Set(selectedIndices);
			newSelection.delete(index);
			// Adjust indices for items after the deleted one
			const adjustedSelection = new Set<number>();
			newSelection.forEach(idx => {
				if (idx > index) {
					adjustedSelection.add(idx - 1);
				} else {
					adjustedSelection.add(idx);
				}
			});
			setSelectedIndices(adjustedSelection);
		}
	};

	const handleDuplicateModules = (count: number) => {
		const sortedIndices = Array.from(selectedIndices).sort((a, b) => a - b);
		let insertOffset = 0;
		const newSelectedIndices: number[] = [];

		setBlueprint(prev => {
			let newEntries = [...prev.entries];

			sortedIndices.forEach(originalIndex => {
				const adjustedIndex = originalIndex + insertOffset;
				const originalEntry = newEntries[adjustedIndex];

				for (let i = 0; i < count; i++) {
					const duplicatedEntry: BlueprintEntry = {
						...originalEntry,
						index: adjustedIndex + i + 1,
						predecessor: {
							index: adjustedIndex + i,
							connection: originalEntry.predecessor?.connection || "01"
						}
					};

					newEntries.splice(adjustedIndex + i + 1, 0, duplicatedEntry);
					// Track the indices of duplicated entries
					newSelectedIndices.push(adjustedIndex + i + 1);
				}

				insertOffset += count;
			});

			// Reindex all entries
			newEntries = newEntries.map((entry, idx) => ({
				...entry,
				index: idx
			}));

			// Update predecessor indices
			newEntries = newEntries.map((entry, idx) => ({
				...entry,
				predecessor:
					entry.predecessor && idx > 0
						? {
								...entry.predecessor,
								index: Math.min(entry.predecessor.index, idx - 1)
							}
						: entry.predecessor
			}));

			return { ...prev, entries: newEntries };
		});

		// Select the duplicated modules
		setSelectedIndices(new Set(newSelectedIndices));
		setLastSelectedIndex(newSelectedIndices[newSelectedIndices.length - 1] || null);
	};

	const handleExport = () => {
		// Create a copy of the blueprint with a new ID if checkbox is checked
		const exportBlueprint = generateNewId ? { ...blueprint, id: uuidv4() } : blueprint;

		const xml = BlueprintParser.blueprintToXml(exportBlueprint);
		const blob = new Blob([xml], { type: "application/xml" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		// Only replace characters that are problematic for file systems
		const sanitizedName =
			blueprintName
				.replace(/[<>:"|?*]/g, "_") // Windows forbidden characters
				.replace(/\//g, "_") // Forward slash (path separator)
				.replace(/\\/g, "_") // Backslash (Windows path separator)
				// eslint-disable-next-line no-control-regex
				.replace(/[\x00-\x1f\x80-\x9f]/g, "") // Control characters
				.replace(/^\./, "_") // Don't start with a dot
				.replace(/\.$/, "_") // Don't end with a dot
				.trim() || "blueprint"; // Fallback if empty
		a.download = `${sanitizedName}.xml`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleCopyBlueprint = async () => {
		// Create a copy of the blueprint with a new ID if checkbox is checked
		const exportBlueprint = generateNewId ? { ...blueprint, id: uuidv4() } : blueprint;

		const xml = BlueprintParser.blueprintToXml(exportBlueprint);

		try {
			await navigator.clipboard.writeText(xml);
			// Show success feedback
			const button = document.querySelector(`.${styles.blueprintCopy}`) as HTMLButtonElement;
			if (button) {
				const span = button.querySelector("span");
				if (span) {
					const originalText = span.textContent;
					span.textContent = "Copied!";
					button.classList.add(styles.success);
					setTimeout(() => {
						span.textContent = originalText;
						button.classList.remove(styles.success);
					}, 2000);
				}
			}
		} catch (error) {
			ErrorHandler.error("Failed to copy blueprint to clipboard", error);
		}
	};

	const handleImport = () => {
		fileInputRef.current?.click();
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = e => {
			try {
				const content = e.target?.result as string;
				const importedBlueprint = BlueprintParser.parseBlueprint(content);

				setBlueprint(importedBlueprint);
				setBlueprintName(importedBlueprint.name);
				setSelectedIndices(new Set());
				setLastSelectedIndex(null);
			} catch (error) {
				ErrorHandler.error("Failed to import blueprint", error);
			}
		};
		reader.readAsText(file);

		// Reset file input
		if (event.target) {
			event.target.value = "";
		}
	};

	const handleClear = () => {
		if (
			blueprint.entries.length > 0 &&
			!window.confirm("Clear all modules? This cannot be undone.")
		) {
			return;
		}

		// Clear the blueprint
		const clearedBlueprint = {
			...blueprint,
			entries: []
		};

		setBlueprint(clearedBlueprint);
		setSelectedIndices(new Set());
		setLastSelectedIndex(null);

		// Clear the saved state
		setSavedState(getDefaultState());
	};

	const handleReorderModules = (draggedIndices: number[], targetIndex: number) => {
		// Don't reorder if dropping on one of the dragged items
		if (draggedIndices.includes(targetIndex)) {
			return;
		}

		setBlueprint(prev => {
			const newEntries = [...prev.entries];
			const draggedEntries = draggedIndices.map(idx => newEntries[idx]);

			// Remove dragged entries (in reverse order to maintain indices)
			const sortedDraggedIndices = [...draggedIndices].sort((a, b) => b - a);
			sortedDraggedIndices.forEach(idx => {
				newEntries.splice(idx, 1);
			});

			let insertPos = targetIndex;
			const removedBeforeTarget = draggedIndices.filter(idx => idx < targetIndex).length;
			insertPos -= removedBeforeTarget;

			newEntries.splice(insertPos, 0, ...draggedEntries);

			// Reindex all entries and update predecessors
			const reindexedEntries = newEntries.map((entry, idx) => ({
				...entry,
				index: idx,
				predecessor: entry.predecessor
					? {
							...entry.predecessor,
							index: idx > 0 ? idx - 1 : 0
						}
					: idx > 0
						? { index: idx - 1, connection: "01" }
						: undefined
			}));

			return { ...prev, entries: reindexedEntries };
		});

		// Update selection to the new indices
		const numDragged = draggedIndices.length;
		let newInsertPos = targetIndex;
		const removedBeforeTarget = draggedIndices.filter(idx => idx < targetIndex).length;
		newInsertPos -= removedBeforeTarget;

		// Create new selection with the moved items at their new positions
		const newSelection = new Set<number>();
		for (let i = 0; i < numDragged; i++) {
			newSelection.add(newInsertPos + i);
		}
		setSelectedIndices(newSelection);
		setLastSelectedIndex(newInsertPos + numDragged - 1);
	};

	return (
		<div className={styles.blueprintBuilder}>
			<div className={styles.builderHeader}>
				<div className={styles.blueprintNameSection}>
					<input
						type="text"
						className={styles.blueprintNameInput}
						value={blueprintName}
						onChange={e => setBlueprintName(e.target.value)}
						placeholder="Blueprint Name"
					/>
					<label className={styles.nameCheckboxLabel} title="Generate new ID when exporting">
						<input
							type="checkbox"
							checked={generateNewId}
							onChange={e => setGenerateNewId(e.target.checked)}
							className={styles.nameCheckbox}
						/>
						<span>Generate new ID</span>
					</label>
				</div>
				<div className={styles.headerActions}>
					<button
						onClick={handleImport}
						className={`${styles.blueprintActionButton} ${styles.blueprintImport}`}
					>
						<svg className={styles.buttonIcon} viewBox="0 0 24 24" width="16" height="16">
							<path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" fill="currentColor" />
						</svg>
						<span>Import Blueprint</span>
					</button>
					<button
						onClick={handleExport}
						className={`${styles.blueprintActionButton} ${styles.blueprintExport}`}
						disabled={blueprint.entries.length === 0}
					>
						<svg className={styles.buttonIcon} viewBox="0 0 24 24" width="16" height="16">
							<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor" />
						</svg>
						<span>Export Blueprint</span>
					</button>
					<button
						onClick={handleCopyBlueprint}
						className={`${styles.blueprintActionButton} ${styles.blueprintCopy}`}
						disabled={blueprint.entries.length === 0}
						title="Copy blueprint XML to clipboard"
					>
						<svg className={styles.buttonIcon} viewBox="0 0 24 24" width="16" height="16">
							<path
								d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
								fill="currentColor"
							/>
						</svg>
						<span>Copy Blueprint</span>
					</button>
					<button
						onClick={handleClear}
						className={`${styles.blueprintActionButton} ${styles.blueprintClear}`}
						disabled={blueprint.entries.length === 0}
					>
						<svg className={styles.buttonIcon} viewBox="0 0 24 24" width="16" height="16">
							<path
								d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
								fill="currentColor"
							/>
						</svg>
						<span>Clear All</span>
					</button>
				</div>
			</div>

			<div className={styles.builderContent}>
				<div className={styles.catalogSection}>
					<h3>Module Catalog</h3>
					<ModuleCatalog onAddModule={handleAddModule} className={styles.moduleCatalogContainer} />
				</div>

				<div className={styles.blueprintSection}>
					<h3>Blueprint Modules ({blueprint.entries.length})</h3>
					<BlueprintList
						entries={blueprint.entries}
						selectedIndices={selectedIndices}
						onSelectModule={handleSelectModule}
						onSelectGroup={handleSelectGroup}
						onReorderModules={handleReorderModules}
						onDeleteModule={handleDeleteSingleModule}
						shouldAutoScroll={shouldAutoScroll}
						onScrollStateChange={setIsAtBottom}
						className={styles.blueprintListContainer}
					/>
				</div>

				<div className={styles.editorSection}>
					<h3>Module Editor</h3>
					{selectedIndices.size > 0 ? (
						<ModuleEditor
							selectedEntries={blueprint.entries.filter(e => selectedIndices.has(e.index))}
							totalEntries={blueprint.entries.length}
							onUpdateModules={handleUpdateModules}
							onDeleteModules={handleDeleteModules}
							onDuplicateModules={handleDuplicateModules}
							onDeselectAll={() => {
								setSelectedIndices(new Set());
								setLastSelectedIndex(null);
							}}
							className={styles.moduleEditorContainer}
						/>
					) : (
						<div className={styles.noSelection}>Select one or more modules to edit</div>
					)}
				</div>
			</div>

			<input
				ref={fileInputRef}
				type="file"
				accept=".xml"
				style={{ display: "none" }}
				onChange={handleFileUpload}
			/>
		</div>
	);
};

export default BlueprintBuilderPage;
