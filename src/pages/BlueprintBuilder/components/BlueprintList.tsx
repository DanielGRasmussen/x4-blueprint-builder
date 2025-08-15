import React, { useState, useRef, useEffect } from "react";
import { BlueprintEntry, ModuleType } from "../../../types/blueprint";
import { classifyModule } from "../../../utils/moduleTypeClassifier";
import { useSettings } from "../../../hooks/useSettings";
import { SettingsData } from "../../../utils/settingsManager";
import { getOrderedCategories } from "../../../utils/categoryUtils";
import AddModuleModal from "./AddModuleModal";
import styles from "./BlueprintList.module.scss";

interface BlueprintListProps {
	entries: BlueprintEntry[];
	selectedIndices: Set<number>;
	onSelectModule: (index: number, event: React.MouseEvent) => void;
	onSelectGroup?: (startIndex: number, endIndex: number, event: React.MouseEvent) => void;
	onReorderModules?: (draggedIndices: number[], targetIndex: number) => void;
	onDeleteModule?: (index: number) => void;
	shouldAutoScroll?: boolean;
	onScrollStateChange?: (isAtBottom: boolean) => void;
	className?: string;
}

interface ModuleGroup {
	startIndex: number;
	endIndex: number;
	macro: string;
	displayName: string;
	count: number;
	isExpanded: boolean;
}

const BlueprintList: React.FC<BlueprintListProps> = ({
	entries,
	selectedIndices,
	onSelectModule,
	onSelectGroup,
	onReorderModules,
	onDeleteModule,
	shouldAutoScroll,
	onScrollStateChange,
	className
}) => {
	const [_isDragging, setIsDragging] = useState(false);
	const [draggedIndices, setDraggedIndices] = useState<number[]>([]);
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
	const dragImageRef = useRef<HTMLDivElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const { settings, updateSettings } = useSettings();
	const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
	const [modalData, setModalData] = useState<{ isOpen: boolean; macro: string }>({
		isOpen: false,
		macro: ""
	});

	// Auto-scroll to bottom if shouldAutoScroll is true
	useEffect(() => {
		if (shouldAutoScroll && scrollContainerRef.current) {
			// Use setTimeout to ensure DOM has updated with new content
			setTimeout(() => {
				if (scrollContainerRef.current) {
					scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
				}
			}, 0);
		}
	}, [entries.length, shouldAutoScroll]);

	// Track scroll position
	useEffect(() => {
		const scrollContainer = scrollContainerRef.current;
		if (!scrollContainer || !onScrollStateChange) return;

		const handleScroll = () => {
			const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
			const isAtBottom = scrollHeight - scrollTop - clientHeight < 5; // 5px threshold
			onScrollStateChange(isAtBottom);
		};

		// Check initial state
		handleScroll();

		scrollContainer.addEventListener("scroll", handleScroll);
		return () => scrollContainer.removeEventListener("scroll", handleScroll);
	}, [onScrollStateChange]);

	// Helper function to get module info with settings
	const getModuleInfo = (entry: BlueprintEntry, settings: SettingsData | null) => {
		let moduleInfo = classifyModule(entry.macro);

		if (settings?.customModules && settings.customModules[entry.macro]) {
			const customModule = settings.customModules[entry.macro];
			moduleInfo = {
				macro: entry.macro,
				displayName: customModule.displayName,
				type: customModule.type
			};
		} else if (settings?.moduleOverrides && settings.moduleOverrides[entry.macro]) {
			const override = settings.moduleOverrides[entry.macro];
			moduleInfo = {
				...moduleInfo,
				displayName: override.displayName || moduleInfo.displayName,
				type: override.type || moduleInfo.type
			};
		}

		return moduleInfo;
	};

	// Group consecutive identical modules
	const moduleGroups = React.useMemo(() => {
		const threshold = settings?.moduleCollapseThreshold || 5;
		const groups: (ModuleGroup | BlueprintEntry)[] = [];
		let currentGroup: ModuleGroup | null = null;

		entries.forEach((entry, index) => {
			const moduleInfo = getModuleInfo(entry, settings);

			if (currentGroup !== null && currentGroup.macro === entry.macro) {
				currentGroup.endIndex = index;
				currentGroup.count++;
			} else {
				// End current group if it exists and meets threshold
				if (currentGroup !== null) {
					if (currentGroup.count >= threshold) {
						currentGroup.isExpanded = expandedGroups.has(currentGroup.startIndex);
						groups.push(currentGroup);
					} else {
						// Add individual entries for groups below threshold
						for (let i = currentGroup.startIndex; i <= currentGroup.endIndex; i++) {
							groups.push(entries[i]);
						}
					}
				}

				// Start a new group
				currentGroup = {
					startIndex: index,
					endIndex: index,
					macro: entry.macro,
					displayName: moduleInfo.displayName,
					count: 1,
					isExpanded: false
				};
			}
		});

		if (currentGroup !== null) {
			const group: ModuleGroup = currentGroup;
			if (group.count >= threshold) {
				group.isExpanded = expandedGroups.has(group.startIndex);
				groups.push(group);
			} else {
				for (let i = group.startIndex; i <= group.endIndex; i++) {
					groups.push(entries[i]);
				}
			}
		}

		return groups;
	}, [entries, settings, expandedGroups]);

	const handleDragStart = (e: React.DragEvent, index: number) => {
		// If the dragged module is selected, drag all selected modules
		const indicesToDrag = selectedIndices.has(index)
			? Array.from(selectedIndices).sort((a, b) => a - b)
			: [index];

		setDraggedIndices(indicesToDrag);
		setIsDragging(true);

		// Set drag data
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", indicesToDrag.join(","));

		// Create custom drag image showing number of items
		if (dragImageRef.current) {
			dragImageRef.current.textContent =
				indicesToDrag.length > 1 ? `Moving ${indicesToDrag.length} modules` : "Moving 1 module";
			e.dataTransfer.setDragImage(dragImageRef.current, 0, 0);
		}
	};

	const handleGroupDragStart = (e: React.DragEvent, group: ModuleGroup) => {
		const indicesToDrag = Array.from({ length: group.count }, (_, i) => group.startIndex + i);

		setDraggedIndices(indicesToDrag);
		setIsDragging(true);

		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", indicesToDrag.join(","));

		if (dragImageRef.current) {
			dragImageRef.current.textContent = `Moving ${group.displayName} × ${group.count}`;
			e.dataTransfer.setDragImage(dragImageRef.current, 0, 0);
		}
	};

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
		setDragOverIndex(index);
	};

	const handleDragLeave = () => {
		setDragOverIndex(null);
	};

	const handleDrop = (e: React.DragEvent, targetIndex: number) => {
		e.preventDefault();

		if (onReorderModules && draggedIndices.length > 0) {
			onReorderModules(draggedIndices, targetIndex);
		}

		setIsDragging(false);
		setDraggedIndices([]);
		setDragOverIndex(null);
	};

	const handleDragEnd = () => {
		setIsDragging(false);
		setDraggedIndices([]);
		setDragOverIndex(null);
	};

	const handleModuleClick = (e: React.MouseEvent, index: number) => {
		// Prevent text selection when clicking
		if (e.detail > 1) {
			e.preventDefault();
		}
		onSelectModule(index, e);
	};

	const toggleGroupExpansion = (groupStartIndex: number) => {
		setExpandedGroups(prev => {
			const newSet = new Set(prev);
			if (newSet.has(groupStartIndex)) {
				newSet.delete(groupStartIndex);
			} else {
				newSet.add(groupStartIndex);
			}
			return newSet;
		});
	};

	const isModuleGroup = (item: ModuleGroup | BlueprintEntry): item is ModuleGroup => {
		return "count" in item && "startIndex" in item;
	};

	// Check if a module is unknown (not in dictionary or custom modules)
	const isUnknownModule = (macro: string): boolean => {
		// Check if it's in the base dictionary
		const baseInfo = classifyModule(macro);
		if (baseInfo.displayName !== macro) {
			return false;
		}

		// Check if it's a custom module
		if (settings?.customModules && settings.customModules[macro]) {
			return false;
		}

		// Check if it has an override
		if (settings?.moduleOverrides && settings.moduleOverrides[macro]) {
			return false;
		}

		return true;
	};

	// Get available categories
	const getCategories = (): Array<{ value: string; label: string }> => {
		return getOrderedCategories(settings);
	};

	// Handle saving a custom module
	const handleSaveCustomModule = (macro: string, displayName: string, type: ModuleType) => {
		if (!settings) return;

		const newCustomModule = {
			macro,
			displayName,
			type,
			isCustom: true
		};

		const updatedSettings = {
			...settings,
			customModules: {
				...settings.customModules,
				[macro]: newCustomModule
			}
		};

		// Save the updated settings
		updateSettings(updatedSettings);
	};

	return (
		<div className={`${styles.blueprintList} ${className || ""}`} ref={scrollContainerRef}>
			{entries.length === 0 ? (
				<div className={styles.emptyState}>
					No modules added yet. Select modules from the catalog to add them to your blueprint.
				</div>
			) : (
				<div className={styles.moduleEntries}>
					{moduleGroups.map((item, _idx) => {
						if (isModuleGroup(item)) {
							// Render collapsed group
							const allSelected = Array.from({ length: item.count }, (_, i) =>
								selectedIndices.has(item.startIndex + i)
							).every(Boolean);
							const someSelected = Array.from({ length: item.count }, (_, i) =>
								selectedIndices.has(item.startIndex + i)
							).some(Boolean);

							// Check if any module in the group is being dragged
							const isGroupBeingDragged = Array.from({ length: item.count }, (_, i) =>
								draggedIndices.includes(item.startIndex + i)
							).some(Boolean);

							const isGroupDragOver =
								dragOverIndex !== null &&
								dragOverIndex >= item.startIndex &&
								dragOverIndex <= item.endIndex;

							return (
								<div
									key={`group-${item.startIndex}`}
									className={`${styles.moduleGroup} ${isGroupBeingDragged ? styles.dragging : ""} ${isGroupDragOver ? styles.dragOver : ""}`}
									onDragOver={e => handleDragOver(e, item.startIndex)}
									onDragLeave={handleDragLeave}
									onDrop={e => handleDrop(e, item.startIndex)}
								>
									<div
										className={`${styles.groupHeader} ${allSelected ? styles.selected : someSelected ? styles.partialSelected : ""}`}
										onClick={e => {
											// Don't trigger if clicking on child elements that have their own handlers
											if (
												(e.target as HTMLElement).classList.contains("group-toggle") ||
												(e.target as HTMLElement).classList.contains("drag-symbol") ||
												(e.target as HTMLElement).classList.contains("group-drag-handle")
											) {
												return;
											}

											e.stopPropagation();
											const startIdx = item.startIndex;
											const endIdx = item.endIndex;

											// Use onSelectGroup if available, otherwise fall back to individual selection
											if (onSelectGroup) {
												onSelectGroup(startIdx, endIdx, e);
											} else {
												// Fallback: handle group selection with individual calls
												if (e.shiftKey) {
													// Shift-click: simulate shift-click from current position to start and end of group
													for (let i = startIdx; i <= endIdx; i++) {
														onSelectModule(i, e);
													}
												} else if (e.ctrlKey || e.metaKey) {
													// Ctrl/Cmd-click: add all items in group to selection if any are unselected
													const allInGroupSelected = Array.from({ length: item.count }, (_, i) =>
														selectedIndices.has(startIdx + i)
													).every(Boolean);

													if (!allInGroupSelected) {
														// Add all items in the group by ctrl-clicking each one
														for (let i = startIdx; i <= endIdx; i++) {
															if (!selectedIndices.has(i)) {
																onSelectModule(i, e);
															}
														}
													} else {
														// Remove all items in the group by ctrl-clicking each one
														for (let i = startIdx; i <= endIdx; i++) {
															onSelectModule(i, e);
														}
													}
												} else {
													// Regular click: select only this group
													// We need to simulate this by first clicking without modifiers to clear,
													// then ctrl-clicking the rest
													const baseEvent = new MouseEvent("click", {
														ctrlKey: false,
														metaKey: false,
														shiftKey: false,
														bubbles: true
													});

													// Click first item to clear selection and select it
													onSelectModule(startIdx, baseEvent as unknown as React.MouseEvent);

													// Then add the rest with ctrl
													if (item.count > 1) {
														const ctrlEvent = new MouseEvent("click", {
															ctrlKey: true,
															metaKey: false,
															bubbles: true
														});
														for (let i = startIdx + 1; i <= endIdx; i++) {
															onSelectModule(i, ctrlEvent as unknown as React.MouseEvent);
														}
													}
												}
											}
										}}
										title="Click to select all modules in group, Ctrl/Cmd+Click to add to selection"
									>
										<span
											className={styles.groupDragHandle}
											draggable
											onDragStart={e => handleGroupDragStart(e, item)}
											onDragEnd={handleDragEnd}
											title="Drag to reorder group"
										>
											<span className={styles.dragSymbol}>⋮⋮</span>
										</span>
										<span
											className={styles.groupToggle}
											onClick={e => {
												e.stopPropagation();
												toggleGroupExpansion(item.startIndex);
											}}
											title="Click to expand/collapse group"
										>
											{item.isExpanded ? "▼" : "▶"}
										</span>
										<span className={styles.groupInfo}>
											{item.displayName} × {item.count}
										</span>
										<span className={styles.groupRange}>
											#{item.startIndex + 1} - #{item.endIndex + 1}
										</span>
									</div>
									{item.isExpanded && (
										<div className={styles.groupItems}>
											{entries.slice(item.startIndex, item.endIndex + 1).map(entry => {
												const moduleInfo = getModuleInfo(entry, settings);
												const isSelected = selectedIndices.has(entry.index);
												const isBeingDragged = draggedIndices.includes(entry.index);
												const isDragOver = dragOverIndex === entry.index;

												return (
													<div
														key={entry.index}
														className={`${styles.blueprintEntry} ${isSelected ? styles.selected : ""} ${isBeingDragged ? styles.dragging : ""} ${isDragOver ? styles.dragOver : ""}`}
														onClick={e => handleModuleClick(e, entry.index)}
														onDragOver={e => handleDragOver(e, entry.index)}
														onDragLeave={handleDragLeave}
														onDrop={e => handleDrop(e, entry.index)}
														title="Click to select, Ctrl+Click to multi-select, Shift+Click to select range"
													>
														<div className={styles.entryHeader}>
															<span
																className={`${styles.entryIndex} ${styles.dragHandle}`}
																draggable
																onDragStart={e => handleDragStart(e, entry.index)}
																onDragEnd={handleDragEnd}
																title="Drag to reorder"
															>
																<span className={styles.indexNumber}>#{entry.index + 1}</span>
																<span className={styles.dragSymbol}>⋮⋮</span>
															</span>
															<span className={styles.entryName} title={moduleInfo.displayName}>
																{moduleInfo.displayName}
															</span>
															{isUnknownModule(entry.macro) && (
																<button
																	className={styles.addToSystemButton}
																	onClick={e => {
																		e.stopPropagation();
																		setModalData({ isOpen: true, macro: entry.macro });
																	}}
																	title="Add to system"
																>
																	+
																</button>
															)}
															<button
																className={styles.deleteModuleButton}
																onClick={e => {
																	e.stopPropagation();
																	if (onDeleteModule) {
																		onDeleteModule(entry.index);
																	}
																}}
																title="Delete module"
															>
																×
															</button>
														</div>
														<div className={styles.entryDetails}>
															<span className={styles.entryMacro} title={entry.macro}>
																{entry.macro}
															</span>
															{entry.predecessor && (
																<span className={styles.entryPredecessor}>
																	← #{entry.predecessor.index + 1} ({entry.predecessor.connection})
																</span>
															)}
															{entry.connection && !entry.predecessor && (
																<span className={styles.entryConnection}>Connection: {entry.connection}</span>
															)}
														</div>
														{entry.offset && (
															<div className={styles.entryOffset}>
																{entry.offset.position && (
																	<span>
																		Pos: ({entry.offset.position.x.toFixed(1)}, {entry.offset.position.y.toFixed(1)},{" "}
																		{entry.offset.position.z.toFixed(1)})
																	</span>
																)}
															</div>
														)}
													</div>
												);
											})}
										</div>
									)}
								</div>
							);
						}

						// Render individual entry
						const entry = item as BlueprintEntry;
						const moduleInfo = getModuleInfo(entry, settings);
						const isSelected = selectedIndices.has(entry.index);
						const isBeingDragged = draggedIndices.includes(entry.index);
						const isDragOver = dragOverIndex === entry.index;

						return (
							<div
								key={entry.index}
								className={`${styles.blueprintEntry} ${isSelected ? styles.selected : ""} ${isBeingDragged ? styles.dragging : ""} ${isDragOver ? styles.dragOver : ""}`}
								onClick={e => handleModuleClick(e, entry.index)}
								onDragOver={e => handleDragOver(e, entry.index)}
								onDragLeave={handleDragLeave}
								onDrop={e => handleDrop(e, entry.index)}
								title="Click to select, Ctrl+Click to multi-select, Shift+Click to select range"
							>
								<div className={styles.entryHeader}>
									<span
										className={`${styles.entryIndex} ${styles.dragHandle}`}
										draggable
										onDragStart={e => handleDragStart(e, entry.index)}
										onDragEnd={handleDragEnd}
										title="Drag to reorder"
									>
										<span className={styles.indexNumber}>#{entry.index + 1}</span>
										<span className={styles.dragSymbol}>⋮⋮</span>
									</span>
									<span className={styles.entryName} title={moduleInfo.displayName}>
										{moduleInfo.displayName}
									</span>
									{isUnknownModule(entry.macro) && (
										<button
											className={styles.addToSystemButton}
											onClick={e => {
												e.stopPropagation();
												setModalData({ isOpen: true, macro: entry.macro });
											}}
											title="Add to system"
										>
											+
										</button>
									)}
									<button
										className={styles.deleteModuleButton}
										onClick={e => {
											e.stopPropagation();
											if (onDeleteModule) {
												onDeleteModule(entry.index);
											}
										}}
										title="Delete module"
									>
										×
									</button>
								</div>
								<div className={styles.entryDetails}>
									<span className={styles.entryMacro} title={entry.macro}>
										{entry.macro}
									</span>
									{entry.predecessor && (
										<span className={styles.entryPredecessor}>
											← #{entry.predecessor.index + 1} ({entry.predecessor.connection})
										</span>
									)}
									{entry.connection && !entry.predecessor && (
										<span className={styles.entryConnection}>Connection: {entry.connection}</span>
									)}
								</div>
								{entry.offset && (
									<div className={styles.entryOffset}>
										{entry.offset.position && (
											<span>
												Pos: ({entry.offset.position.x.toFixed(1)}, {entry.offset.position.y.toFixed(1)},{" "}
												{entry.offset.position.z.toFixed(1)})
											</span>
										)}
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
			<div ref={dragImageRef} className={styles.dragImage} />

			<AddModuleModal
				macro={modalData.macro}
				isOpen={modalData.isOpen}
				onClose={() => setModalData({ isOpen: false, macro: "" })}
				onSave={handleSaveCustomModule}
				categories={getCategories()}
			/>
		</div>
	);
};

export default BlueprintList;
