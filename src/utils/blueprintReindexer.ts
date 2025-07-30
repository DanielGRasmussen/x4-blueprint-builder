import { Blueprint, BlueprintEntry, Position } from "../types/blueprint";

export interface ReorderOptions {
	targetIndex: number | "percentage" | "priority";
	percentage?: number;
	priorityOrder?: string[];
}

export interface CoordinateModification {
	macros?: string[];
	offset: Position;
}

export interface DuplicationOptions {
	macros?: string[];
	direction: Position;
	count: number;
	keepPredecessors?: boolean;
}

export interface ReorderValidation {
	isValid: boolean;
	warnings: string[];
}

export class BlueprintReindexer {
	static validateReordering(
		blueprint: Blueprint,
		macrosToReorder: string[],
		options: ReorderOptions
	): ReorderValidation {
		const warnings: string[] = [];
		const entriesToReorder = blueprint.entries.filter(e => macrosToReorder.includes(e.macro));
		
		// Check for predecessor conflicts
		entriesToReorder.forEach(entry => {
			if (entry.predecessor) {
				const predecessorEntry = blueprint.entries.find(e => e.index === entry.predecessor!.index);
				if (predecessorEntry && macrosToReorder.includes(predecessorEntry.macro)) {
					// Both the entry and its predecessor are being reordered
					warnings.push(`Module "${entry.macro}" (index ${entry.index}) depends on "${predecessorEntry.macro}" (index ${predecessorEntry.index}). Make sure the predecessor comes first in the new order.`);
				}
			}
		});

		// Check if any non-reordered modules depend on reordered ones
		blueprint.entries.forEach(entry => {
			if (!macrosToReorder.includes(entry.macro) && entry.predecessor) {
				const predecessorEntry = blueprint.entries.find(e => e.index === entry.predecessor!.index);
				if (predecessorEntry && macrosToReorder.includes(predecessorEntry.macro)) {
					warnings.push(`Module "${entry.macro}" (index ${entry.index}) depends on "${predecessorEntry.macro}" which is being reordered. This may cause build order issues.`);
				}
			}
		});

		return {
			isValid: true, // We allow the operation but show warnings
			warnings
		};
	}

	static reorderModules(
		blueprint: Blueprint,
		macrosToReorder: string[],
		options: ReorderOptions
	): Blueprint {
		const newBlueprint = JSON.parse(JSON.stringify(blueprint)) as Blueprint;
		const entriesToReorder = newBlueprint.entries.filter(e => macrosToReorder.includes(e.macro));
		const otherEntries = newBlueprint.entries.filter(e => !macrosToReorder.includes(e.macro));

		let targetStartIndex: number;

		if (options.targetIndex === "percentage" && options.percentage !== undefined) {
			targetStartIndex = Math.floor((otherEntries.length + entriesToReorder.length) * (options.percentage / 100)) + 1;
		} else if (options.targetIndex === "priority" && options.priorityOrder) {
			newBlueprint.entries = this.reorderByPriority(newBlueprint.entries, options.priorityOrder);
			return this.updateAllIndexesAndPredecessors(newBlueprint);
		} else if (typeof options.targetIndex === "number") {
			targetStartIndex = options.targetIndex;
		} else {
			throw new Error("Invalid reorder options");
		}

		// Create new ordered array
		const newEntries: BlueprintEntry[] = [];
		let currentIndex = 1;

		// Add entries before target index
		for (const entry of otherEntries) {
			if (currentIndex === targetStartIndex) {
				// Insert reordered entries
				entriesToReorder.forEach(e => {
					newEntries.push(e);
					currentIndex++;
				});
			}
			newEntries.push(entry);
			currentIndex++;
		}

		// Add reordered entries at the end if not already added
		if (currentIndex <= targetStartIndex) {
			entriesToReorder.forEach(e => {
				newEntries.push(e);
			});
		}

		newBlueprint.entries = newEntries;
		return this.updateAllIndexesAndPredecessors(newBlueprint);
	}

	private static reorderByPriority(entries: BlueprintEntry[], priorityOrder: string[]): BlueprintEntry[] {
		const priorityMap = new Map<string, number>();
		priorityOrder.forEach((macro, index) => {
			priorityMap.set(macro, index);
		});

		return entries.sort((a, b) => {
			const priorityA = priorityMap.get(a.macro) ?? Number.MAX_SAFE_INTEGER;
			const priorityB = priorityMap.get(b.macro) ?? Number.MAX_SAFE_INTEGER;
			
			if (priorityA !== priorityB) {
				return priorityA - priorityB;
			}
			
			// Keep original order for entries with same priority
			return a.index - b.index;
		});
	}

	private static updateAllIndexesAndPredecessors(blueprint: Blueprint): Blueprint {
		const oldToNewIndexMap = new Map<number, number>();

		// Update indexes
		blueprint.entries.forEach((entry, idx) => {
			oldToNewIndexMap.set(entry.index, idx + 1);
			entry.index = idx + 1;
		});

		// Update predecessor references
		blueprint.entries.forEach(entry => {
			if (entry.predecessor) {
				const newPredecessorIndex = oldToNewIndexMap.get(entry.predecessor.index);
				if (newPredecessorIndex) {
					entry.predecessor.index = newPredecessorIndex;
				}
			}
		});

		return blueprint;
	}

	static modifyCoordinates(
		blueprint: Blueprint,
		modification: CoordinateModification
	): Blueprint {
		const newBlueprint = JSON.parse(JSON.stringify(blueprint)) as Blueprint;

		newBlueprint.entries.forEach(entry => {
			if (!modification.macros || modification.macros.includes(entry.macro)) {
				if (!entry.offset) {
					entry.offset = {};
				}
				if (!entry.offset.position) {
					entry.offset.position = { x: 0, y: 0, z: 0 };
				}

				entry.offset.position.x += modification.offset.x;
				entry.offset.position.y += modification.offset.y;
				entry.offset.position.z += modification.offset.z;
			}
		});

		return newBlueprint;
	}

	static duplicateModules(
		blueprint: Blueprint,
		options: DuplicationOptions
	): Blueprint {
		const newBlueprint = JSON.parse(JSON.stringify(blueprint)) as Blueprint;
		const entriesToDuplicate = newBlueprint.entries.filter(e => 
			!options.macros || options.macros.includes(e.macro)
		);

		let maxIndex = Math.max(...newBlueprint.entries.map(e => e.index));
		const newEntries: BlueprintEntry[] = [];
		const oldToNewIndexMap = new Map<number, number[]>();

		// First pass: create duplicated entries
		for (let i = 1; i <= options.count; i++) {
			entriesToDuplicate.forEach(originalEntry => {
				const duplicatedEntry = JSON.parse(JSON.stringify(originalEntry)) as BlueprintEntry;
				const newIndex = ++maxIndex;
				duplicatedEntry.index = newIndex;

				// Track index mapping for predecessor updates
				if (!oldToNewIndexMap.has(originalEntry.index)) {
					oldToNewIndexMap.set(originalEntry.index, []);
				}
				oldToNewIndexMap.get(originalEntry.index)!.push(newIndex);

				// Update position
				if (!duplicatedEntry.offset) {
					duplicatedEntry.offset = {};
				}
				if (!duplicatedEntry.offset.position) {
					duplicatedEntry.offset.position = { x: 0, y: 0, z: 0 };
				}

				duplicatedEntry.offset.position.x += options.direction.x * i;
				duplicatedEntry.offset.position.y += options.direction.y * i;
				duplicatedEntry.offset.position.z += options.direction.z * i;

				// Handle predecessors based on option
				if (!options.keepPredecessors) {
					delete duplicatedEntry.predecessor;
				}

				newEntries.push(duplicatedEntry);
			});
		}

		// Second pass: update predecessors if keeping them
		if (options.keepPredecessors) {
			newEntries.forEach((entry, idx) => {
				if (entry.predecessor) {
					const copyNumber = Math.floor(idx / entriesToDuplicate.length);
					const newPredecessorIndices = oldToNewIndexMap.get(entry.predecessor.index);
					
					if (newPredecessorIndices && newPredecessorIndices[copyNumber]) {
						// Update to point to the corresponding duplicated predecessor
						entry.predecessor.index = newPredecessorIndices[copyNumber];
					} else {
						// Predecessor wasn't duplicated, remove the reference
						delete entry.predecessor;
					}
				}
			});
		}

		newBlueprint.entries.push(...newEntries);
		return newBlueprint;
	}

	static renameModules(
		blueprint: Blueprint,
		renameMap: Map<string, string>
	): Blueprint {
		const newBlueprint = JSON.parse(JSON.stringify(blueprint)) as Blueprint;

		newBlueprint.entries.forEach(entry => {
			const newName = renameMap.get(entry.macro);
			if (newName) {
				entry.macro = newName;
			}
		});

		return newBlueprint;
	}
}