import React, { useState, useEffect } from "react";
import { BlueprintEntry, Position, Rotation } from "../../../types/blueprint";
import { ErrorHandler } from "../../../utils/errorHandler";
import styles from "./ModuleEditor.module.scss";

interface ModuleEditorProps {
	selectedEntries: BlueprintEntry[];
	totalEntries: number;
	onUpdateModules: (updates: Partial<BlueprintEntry>) => void;
	onDeleteModules: () => void;
	onDuplicateModules: (count: number) => void;
	onDeselectAll?: () => void;
	className?: string;
}

const ModuleEditor: React.FC<ModuleEditorProps> = ({
	selectedEntries,
	totalEntries,
	onUpdateModules,
	onDeleteModules,
	onDuplicateModules,
	onDeselectAll,
	className
}) => {
	const [predecessorIndex, setPredecessorIndex] = useState<string>("");
	const [predecessorConnection, setPredecessorConnection] = useState<string>("01");
	const [position, setPosition] = useState<Position>({ x: 0, y: 0, z: 0 });
	const [rotation, setRotation] = useState<Rotation>({ yaw: 0, pitch: 0, roll: 0 });
	const [duplicateCount, setDuplicateCount] = useState<number>(1);

	// Update form values when selection changes
	useEffect(() => {
		if (selectedEntries.length === 1) {
			const entry = selectedEntries[0];
			setPredecessorIndex(entry.predecessor ? (entry.predecessor.index + 1).toString() : "");
			setPredecessorConnection(entry.predecessor?.connection || "01");
			setPosition(entry.offset?.position || { x: 0, y: 0, z: 0 });
			setRotation(entry.offset?.rotation || { yaw: 0, pitch: 0, roll: 0 });
		} else if (selectedEntries.length > 1) {
			// For multiple selection, show common values or defaults
			const firstPredecessor = selectedEntries[0].predecessor;
			const allSamePredecessor = selectedEntries.every(
				e =>
					e.predecessor?.index === firstPredecessor?.index &&
					e.predecessor?.connection === firstPredecessor?.connection
			);

			if (allSamePredecessor && firstPredecessor) {
				setPredecessorIndex((firstPredecessor.index + 1).toString());
				setPredecessorConnection(firstPredecessor.connection);
			} else {
				setPredecessorIndex("");
				setPredecessorConnection("01");
			}

			setPosition({ x: 0, y: 0, z: 0 });
			setRotation({ yaw: 0, pitch: 0, roll: 0 });
		}
	}, [selectedEntries]);

	const handlePredecessorUpdate = () => {
		const userIndex = parseInt(predecessorIndex);
		if (isNaN(userIndex) || userIndex < 1 || userIndex > totalEntries) {
			ErrorHandler.warning("Invalid predecessor index");
			return;
		}

		// Convert from 1-based to 0-based
		const index = userIndex - 1;

		if (selectedEntries.some(e => e.index === index)) {
			ErrorHandler.warning("A module cannot be its own predecessor");
			return;
		}

		onUpdateModules({
			predecessor: {
				index,
				connection: predecessorConnection
			}
		});
	};

	const handlePositionUpdate = () => {
		onUpdateModules({
			offset: {
				position: { ...position },
				rotation: { ...rotation }
			}
		});
	};

	const handleDuplicate = () => {
		if (duplicateCount < 1 || duplicateCount > 100) {
			ErrorHandler.warning("Duplicate count must be between 1 and 100");
			return;
		}
		onDuplicateModules(duplicateCount);
	};

	const isMultiSelection = selectedEntries.length > 1;

	return (
		<div className={`${styles.moduleEditor} ${className || ""}`}>
			<div className={styles.editorInfo}>
				<div className={styles.selectionInfo}>
					<strong>
						Selected: {selectedEntries.length} module{selectedEntries.length !== 1 ? "s" : ""}
					</strong>
					{selectedEntries.length === 1 && <span> (Index: {selectedEntries[0].index + 1})</span>}
				</div>
				{onDeselectAll && selectedEntries.length > 0 && (
					<button onClick={onDeselectAll} className={styles.deselectButton}>
						Deselect All
					</button>
				)}
			</div>

			<div className={styles.editorSection}>
				<h4>Predecessor Connection</h4>
				<div className={styles.formGroup}>
					<label>
						Predecessor Index:
						<input
							type="number"
							value={predecessorIndex}
							onChange={e => setPredecessorIndex(e.target.value)}
							min="1"
							max={totalEntries}
							placeholder={isMultiSelection ? "Multiple values" : "Index"}
						/>
					</label>
					<label>
						Connection:
						<input
							type="text"
							value={predecessorConnection}
							onChange={e => setPredecessorConnection(e.target.value)}
							placeholder="01"
						/>
					</label>
					<button onClick={handlePredecessorUpdate} className={styles.updateButton}>
						Update Predecessor
					</button>
				</div>
			</div>

			<div className={styles.editorSection}>
				<h4>Position & Rotation</h4>
				<div className={styles.formSubsection}>
					<h5>Position Offset</h5>
					<div className={`${styles.formGroup} ${styles.coordinates}`}>
						<label>
							X:
							<input
								type="number"
								value={position.x}
								onChange={e => setPosition({ ...position, x: parseFloat(e.target.value) || 0 })}
								step="0.1"
							/>
						</label>
						<label>
							Y:
							<input
								type="number"
								value={position.y}
								onChange={e => setPosition({ ...position, y: parseFloat(e.target.value) || 0 })}
								step="0.1"
							/>
						</label>
						<label>
							Z:
							<input
								type="number"
								value={position.z}
								onChange={e => setPosition({ ...position, z: parseFloat(e.target.value) || 0 })}
								step="0.1"
							/>
						</label>
					</div>
				</div>
				<div className={styles.formSubsection}>
					<h5>Rotation</h5>
					<div className={`${styles.formGroup} ${styles.coordinates}`}>
						<label>
							Yaw:
							<input
								type="number"
								value={rotation.yaw || 0}
								onChange={e => setRotation({ ...rotation, yaw: parseFloat(e.target.value) || 0 })}
								step="0.1"
							/>
						</label>
						<label>
							Pitch:
							<input
								type="number"
								value={rotation.pitch || 0}
								onChange={e => setRotation({ ...rotation, pitch: parseFloat(e.target.value) || 0 })}
								step="0.1"
							/>
						</label>
						<label>
							Roll:
							<input
								type="number"
								value={rotation.roll || 0}
								onChange={e => setRotation({ ...rotation, roll: parseFloat(e.target.value) || 0 })}
								step="0.1"
							/>
						</label>
					</div>
				</div>
				<button onClick={handlePositionUpdate} className={styles.updateButton}>
					Update Position & Rotation
				</button>
			</div>

			<div className={`${styles.editorSection} ${styles.duplicateSection}`}>
				<h4>Duplicate Module{selectedEntries.length !== 1 ? "s" : ""}</h4>
				<div className={styles.formGroup}>
					<label>
						Number of copies:
						<input
							type="number"
							value={duplicateCount}
							onChange={e => setDuplicateCount(parseInt(e.target.value) || 1)}
							min="1"
							max="100"
						/>
					</label>
					<button onClick={handleDuplicate} className={styles.duplicateButton}>
						Duplicate Selected
					</button>
				</div>
			</div>

			<div className={`${styles.editorSection} ${styles.dangerZone}`}>
				<h4>Delete Module{selectedEntries.length !== 1 ? "s" : ""}</h4>
				<button onClick={onDeleteModules} className={styles.deleteButton}>
					Delete Selected Module{selectedEntries.length !== 1 ? "s" : ""}
				</button>
			</div>
		</div>
	);
};

export default ModuleEditor;
