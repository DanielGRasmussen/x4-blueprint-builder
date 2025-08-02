import React, { useState, useRef } from "react";
import { Blueprint, ModuleType, BlueprintEntry } from "../../../types/blueprint";
import { ModuleTypeClassifier } from "../../../utils/moduleTypeClassifier";
import ModuleTypeFilter from "../../../components/common/ModuleTypeFilter";
import "./ModuleReorderer.css";

interface ModuleReordererProps {
	blueprint: Blueprint;
	onUpdate: (blueprint: Blueprint) => void;
}

interface PrioritySegment {
	macro: string;
	startIndex: number;
	count: number;
	showSlider: boolean;
}

const ModuleReorderer: React.FC<ModuleReordererProps> = ({ blueprint, onUpdate }) => {
	const [priorityOrder, setPriorityOrder] = useState<PrioritySegment[]>([]);
	const [selectedType, setSelectedType] = useState<ModuleType | "">("");
	const [_, setWarnings] = useState<string[]>([]);
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	const moduleReordererRef = useRef<HTMLDivElement>(null);

	const modulesByType = ModuleTypeClassifier.getModulesByType(
		blueprint.entries.map(e => e.macro)
	);


	const getTotalPriorityCount = (macro: string): number => {
		return priorityOrder
			.filter(p => p.macro === macro)
			.reduce((sum, p) => sum + p.count, 0);
	};

	const getOvercountedMacros = (): string[] => {
		const overcounted: string[] = [];
		const macroTotals = new Map<string, number>();
		
		// Count total requested for each macro
		priorityOrder.forEach(segment => {
			const current = macroTotals.get(segment.macro) || 0;
			macroTotals.set(segment.macro, current + segment.count);
		});
		
		// Check against actual counts
		macroTotals.forEach((requested, macro) => {
			const actual = blueprint.entries.filter(e => e.macro === macro).length;
			if (requested > actual) {
				overcounted.push(`Too many ${ModuleTypeClassifier.classifyModule(macro).displayName}: ${requested} requested but only ${actual} available`);
			}
		});
		
		return overcounted;
	};

	const handleAddToPriority = (macro: string) => {
		const totalCount = blueprint.entries.filter(e => e.macro === macro).length;
		const usedCount = getTotalPriorityCount(macro);
		
		if (usedCount < totalCount) {
			const remainingCount = totalCount - usedCount;
			
			// Capture distance from bottom of entire module reorderer container before adding
			let distanceFromBottom = 0;
			if (moduleReordererRef.current) {
				const scrollHeight = moduleReordererRef.current.scrollHeight;
				const scrollTop = moduleReordererRef.current.scrollTop;
				const clientHeight = moduleReordererRef.current.clientHeight;
				distanceFromBottom = scrollHeight - scrollTop - clientHeight;
			}
			
			setPriorityOrder([...priorityOrder, { 
				macro, 
				startIndex: usedCount + 1,
				count: remainingCount, 
				showSlider: false 
			}]);
			
			// Restore distance from bottom after React renders
			requestAnimationFrame(() => {
				if (moduleReordererRef.current) {
					const newScrollHeight = moduleReordererRef.current.scrollHeight;
					const clientHeight = moduleReordererRef.current.clientHeight;
					moduleReordererRef.current.scrollTop = newScrollHeight - clientHeight - distanceFromBottom;
				}
			});
		}
	};

	const handleToggleSlider = (index: number) => {
		setPriorityOrder(priorityOrder.map((p, i) => 
			i === index ? { ...p, showSlider: !p.showSlider } : p
		));
	};

	const handleRemoveFromPriority = (index: number) => {
		setPriorityOrder(priorityOrder.filter((_, i) => i !== index));
	};

	const handleUpdatePriorityCount = (index: number, count: number) => {
		const segment = priorityOrder[index];
		const totalCount = blueprint.entries.filter(e => e.macro === segment.macro).length;
		
		// Update count
		const newPriorityOrder = [...priorityOrder];
		newPriorityOrder[index] = { ...segment, count: Math.min(count, totalCount - segment.startIndex + 1) };
		
		// Update start indices for all segments after this one with the same macro
		for (let i = index + 1; i < newPriorityOrder.length; i++) {
			if (newPriorityOrder[i].macro === segment.macro) {
				const prevSegmentEnd = newPriorityOrder[i - 1].startIndex + newPriorityOrder[i - 1].count;
				newPriorityOrder[i] = { 
					...newPriorityOrder[i], 
					startIndex: prevSegmentEnd,
					count: Math.min(newPriorityOrder[i].count, totalCount - prevSegmentEnd + 1)
				};
			}
		}
		
		setPriorityOrder(newPriorityOrder);
		setWarnings([]);
	};

	const handleAddRemaining = () => {
		const newItems: PrioritySegment[] = [];
		
		// Capture distance from bottom before adding items
		let distanceFromBottom = 0;
		if (moduleReordererRef.current) {
			const scrollHeight = moduleReordererRef.current.scrollHeight;
			const scrollTop = moduleReordererRef.current.scrollTop;
			const clientHeight = moduleReordererRef.current.clientHeight;
			distanceFromBottom = scrollHeight - scrollTop - clientHeight;
		}
		
		// Get macros to add based on filter
		const macrosToAdd = selectedType 
			? modulesByType[selectedType].map(m => m.macro)
			: uniqueMacros;
		
		macrosToAdd.forEach(macro => {
			const totalCount = blueprint.entries.filter(e => e.macro === macro).length;
			const usedCount = getTotalPriorityCount(macro);
			
			if (usedCount < totalCount) {
				newItems.push({
					macro,
					startIndex: usedCount + 1,
					count: totalCount - usedCount,
					showSlider: false
				});
			}
		});
		
		setPriorityOrder([...priorityOrder, ...newItems]);
		
		// Restore distance from bottom after React renders
		requestAnimationFrame(() => {
			if (moduleReordererRef.current) {
				const newScrollHeight = moduleReordererRef.current.scrollHeight;
				const clientHeight = moduleReordererRef.current.clientHeight;
				moduleReordererRef.current.scrollTop = newScrollHeight - clientHeight - distanceFromBottom;
			}
		});
	};

	const handleReorder = () => {
		// Build a list of specific module instances to reorder based on segments
		const instancesToReorder: { macro: string; originalIndex: number }[] = [];
		
		const macroCountMap = new Map<string, number>();
		blueprint.entries.forEach((entry) => {
			const count = macroCountMap.get(entry.macro) || 0;
			macroCountMap.set(entry.macro, count + 1);
		});
		
		priorityOrder.forEach(segment => {
			const instances = blueprint.entries
				.filter(e => e.macro === segment.macro)
				.sort((a, b) => a.index - b.index);
			
			// Select the instances for this segment
			for (let i = 0; i < segment.count; i++) {
				const instanceIndex = segment.startIndex + i - 1;
				if (instanceIndex < instances.length) {
					instancesToReorder.push({
						macro: segment.macro,
						originalIndex: instances[instanceIndex].index
					});
				}
			}
		});
		
		// Create new ordered entries array
		const newEntries: BlueprintEntry[] = [];
		const usedIndices = new Set(instancesToReorder.map(i => i.originalIndex));
		
		instancesToReorder.forEach(instance => {
			const entry = blueprint.entries.find(e => e.index === instance.originalIndex);
			if (entry) {
				newEntries.push({ ...entry });
			}
		});
		
		blueprint.entries.forEach(entry => {
			if (!usedIndices.has(entry.index)) {
				newEntries.push({ ...entry });
			}
		});
		
		const updatedBlueprint: Blueprint = {
			...blueprint,
			entries: newEntries
		};
		
		// Update all indexes and predecessors
		updatedBlueprint.entries.forEach((entry, idx) => {
			entry.index = idx + 1;
		});
		
		// Update predecessor references
		const oldToNewIndexMap = new Map<number, number>();
		
		// Create maps to track macro occurrences efficiently
		const oldMacroOccurrences = new Map<string, number[]>();
		const newMacroOccurrences = new Map<string, number[]>();
		
		blueprint.entries.forEach((entry) => {
			if (!oldMacroOccurrences.has(entry.macro)) {
				oldMacroOccurrences.set(entry.macro, []);
			}
			oldMacroOccurrences.get(entry.macro)!.push(entry.index);
		});
		
		updatedBlueprint.entries.forEach((entry) => {
			if (!newMacroOccurrences.has(entry.macro)) {
				newMacroOccurrences.set(entry.macro, []);
			}
			newMacroOccurrences.get(entry.macro)!.push(entry.index);
		});
		
		// Map old indices to new indices based on occurrence order
		oldMacroOccurrences.forEach((oldIndices, macro) => {
			const newIndices = newMacroOccurrences.get(macro);
			if (newIndices) {
				oldIndices.forEach((oldIndex, occurrenceIndex) => {
					if (occurrenceIndex < newIndices.length) {
						oldToNewIndexMap.set(oldIndex, newIndices[occurrenceIndex]);
					}
				});
			}
		});
		
		updatedBlueprint.entries.forEach(entry => {
			if (entry.predecessor) {
				const newPredecessorIndex = oldToNewIndexMap.get(entry.predecessor.index);
				if (newPredecessorIndex) {
					entry.predecessor.index = newPredecessorIndex;
				}
			}
		});

		onUpdate(updatedBlueprint);
		setWarnings([]);
	};

	const uniqueMacros = Array.from(new Set(blueprint.entries.map(e => e.macro))).sort();
	
	const availableMacros = selectedType
		? modulesByType[selectedType].map(m => m.macro).filter(macro => {
			const totalCount = blueprint.entries.filter(e => e.macro === macro).length;
			const usedCount = getTotalPriorityCount(macro);
			return usedCount < totalCount;
		})
		: uniqueMacros.filter(macro => {
			const totalCount = blueprint.entries.filter(e => e.macro === macro).length;
			const usedCount = getTotalPriorityCount(macro);
			return usedCount < totalCount;
		});

	// Drag and drop handlers
	const handleDragStart = (index: number) => {
		setDraggedIndex(index);
	};

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		if (draggedIndex === null || draggedIndex === index) return;

		const newOrder = [...priorityOrder];
		const draggedItem = newOrder[draggedIndex];
		
		newOrder.splice(draggedIndex, 1);
		
		newOrder.splice(index, 0, draggedItem);
		
		setPriorityOrder(newOrder);
		setDraggedIndex(index);
	};

	const handleDragEnd = () => {
		setDraggedIndex(null);
	};

	return (
		<div className="module-reorderer component-section" ref={moduleReordererRef}>
			<h3>Module Priority Order</h3>

			<div className="filter-controls">
				<ModuleTypeFilter
					selectedType={selectedType}
					onTypeChange={setSelectedType}
					modulesByType={modulesByType}
				/>
			</div>

			<div className="priority-setup">
				<h4>Build Order</h4>
				<div className="priority-list">
					{priorityOrder.map((item, index) => {
						const totalCount = blueprint.entries.filter(e => e.macro === item.macro).length;
						
						return (
							<div 
								key={`${item.macro}-${item.startIndex}`} 
								className="priority-item-expanded"
								onDragOver={(e) => handleDragOver(e, index)}
							>
								<div 
									className="priority-header"
									onClick={() => handleToggleSlider(index)}
								>
									<span 
										className="priority-number draggable"
										title="Drag to reorder"
										draggable
										onDragStart={(e) => {
											e.stopPropagation();
											handleDragStart(index);
										}}
										onDragEnd={handleDragEnd}
									>
										{index + 1}.
									</span>
									<span className="priority-name">
										{ModuleTypeClassifier.classifyModule(item.macro).displayName}
									</span>
									<span className="priority-count">
										{item.count} of {totalCount}
									</span>
									<button 
										className="remove-btn"
										onClick={(e) => {
											e.stopPropagation();
											handleRemoveFromPriority(index);
										}}
									>
										×
									</button>
								</div>
								{item.showSlider && (
									<div className="priority-controls">
										<label className="count-label">
											Build: <span className="count-value">{item.count}</span> modules starting from #{item.startIndex}
										</label>
										<div className="slider-wrapper">
											<div 
												className="slider-fill" 
												style={{ width: `${((item.count - 1) / Math.max(1, totalCount - item.startIndex)) * 100}%` }}
											/>
											<input
												type="range"
												min="1"
												max={totalCount - item.startIndex + 1}
												value={item.count}
												onChange={(e) => handleUpdatePriorityCount(index, parseInt(e.target.value))}
												className="count-slider"
											/>
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>
				
				<div className="add-priority-section">
					<h5>Available Modules</h5>
					<div className="available-modules">
						{availableMacros.map(macro => {
							const totalCount = blueprint.entries.filter(e => e.macro === macro).length;
							const usedCount = getTotalPriorityCount(macro);
							const remainingCount = totalCount - usedCount;
							
							return (
								<div 
									key={macro} 
									className="available-module"
									onClick={() => handleAddToPriority(macro)}
								>
									{ModuleTypeClassifier.classifyModule(macro).displayName}
									<span className="module-count">
										{remainingCount === totalCount 
											? `(${totalCount})`
											: `(${remainingCount} of ${totalCount} remaining)`
										}
									</span>
								</div>
							);
						})}
					</div>
					{availableMacros.length > 0 && (
						<button 
							className="add-remaining-btn"
							onClick={handleAddRemaining}
						>
							Add All Remaining
						</button>
					)}
				</div>
			</div>

			{getOvercountedMacros().length > 0 && (
				<div className="warning-notices">
					{getOvercountedMacros().map((warning, idx) => (
						<div key={idx} className="warning-notice">
							{warning}
						</div>
					))}
				</div>
			)}

			<button 
				className="reorder-button"
				onClick={handleReorder}
				disabled={priorityOrder.length === 0}
			>
				Apply Priority Order
			</button>
		</div>
	);
};

export default ModuleReorderer;