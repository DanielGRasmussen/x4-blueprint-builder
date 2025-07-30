import React, { useState } from "react";
import { Blueprint, ModuleType } from "../types/blueprint";
import { BlueprintReindexer, CoordinateModification } from "../utils/blueprintReindexer";
import { ModuleTypeClassifier } from "../utils/moduleTypeClassifier";
import IncrementButtons from "./IncrementButtons";
import ModuleTypeFilter from "./ModuleTypeFilter";
import "./CoordinateModifier.css";

interface CoordinateModifierProps {
	blueprint: Blueprint;
	onUpdate: (blueprint: Blueprint) => void;
}

const CoordinateModifier: React.FC<CoordinateModifierProps> = ({ blueprint, onUpdate }) => {
	const [modifyAll, setModifyAll] = useState(true);
	const [selectedType, setSelectedType] = useState<ModuleType | "">("");
	const [selectedMacros, setSelectedMacros] = useState<string[]>([]);
	const [offsetX, setOffsetX] = useState(0);
	const [offsetY, setOffsetY] = useState(0);
	const [offsetZ, setOffsetZ] = useState(0);

	const modulesByType = ModuleTypeClassifier.getModulesByType(
		blueprint.entries.map(e => e.macro)
	);

	const uniqueMacros = Array.from(new Set(blueprint.entries.map(e => e.macro))).sort();

	const handleApplyModification = () => {
		const modification: CoordinateModification = {
			offset: {
				x: offsetX,
				y: offsetY,
				z: offsetZ
			}
		};

		if (!modifyAll) {
			if (selectedType) {
				modification.macros = modulesByType[selectedType].map(m => m.macro);
			} else if (selectedMacros.length > 0) {
				modification.macros = selectedMacros;
			} else {
				alert("Please select modules to modify");
				return;
			}
		}

		const updatedBlueprint = BlueprintReindexer.modifyCoordinates(blueprint, modification);
		onUpdate(updatedBlueprint);

		// Reset form
		setOffsetX(0);
		setOffsetY(0);
		setOffsetZ(0);
		setSelectedMacros([]);
	};

	return (
		<div className="coordinate-modifier component-section">
			<h3>Coordinate Modification</h3>

			<div className="modification-target">
				<div className="radio-group">
					<label className="radio-label">
						<input
							type="radio"
							checked={modifyAll}
							onChange={() => setModifyAll(true)}
						/>
						Modify all modules
					</label>
					
					<label className="radio-label">
						<input
							type="radio"
							checked={!modifyAll}
							onChange={() => setModifyAll(false)}
						/>
						Modify specific modules
					</label>
				</div>

				{!modifyAll && (
					<div className="specific-selection">
						<ModuleTypeFilter
							selectedType={selectedType}
							onTypeChange={(type) => {
								setSelectedType(type);
								setSelectedMacros([]);
							}}
							modulesByType={modulesByType}
							label="By Type:"
						/>

						<div className="or-separator">OR</div>

						<div className="form-group">
							<label>By Specific Macros:</label>
							<select 
								multiple
								value={selectedMacros}
								onChange={(e) => {
									const selected = Array.from(e.target.selectedOptions, option => option.value);
									setSelectedMacros(selected);
									setSelectedType("");
								}}
								className="macro-multiselect"
							>
								{uniqueMacros.map(macro => (
									<option key={macro} value={macro}>
										{ModuleTypeClassifier.classifyModule(macro).displayName}
									</option>
								))}
							</select>
							<div className="select-hint">Hold Ctrl/Cmd to select multiple</div>
						</div>
					</div>
				)}
			</div>

			<div className="coordinate-inputs">
				<h4>Offset Values</h4>
				<div className="coordinate-grid">
					<div className="form-group">
						<label>X Offset:</label>
						<input
							type="number"
							className="no-arrows"
							value={offsetX}
							onChange={(e) => setOffsetX(parseFloat(e.target.value) || 0)}
							step="0.1"
						/>
					</div>
					
					<div className="form-group">
						<label>Y Offset:</label>
						<input
							type="number"
							className="no-arrows"
							value={offsetY}
							onChange={(e) => setOffsetY(parseFloat(e.target.value) || 0)}
							step="0.1"
						/>
					</div>
					
					<div className="form-group">
						<label>Z Offset:</label>
						<input
							type="number"
							className="no-arrows"
							value={offsetZ}
							onChange={(e) => setOffsetZ(parseFloat(e.target.value) || 0)}
							step="0.1"
						/>
					</div>
				</div>

				<IncrementButtons
					x={offsetX}
					y={offsetY}
					z={offsetZ}
					onUpdateX={setOffsetX}
					onUpdateY={setOffsetY}
					onUpdateZ={setOffsetZ}
				/>
			</div>

			<button 
				className="apply-button"
				onClick={handleApplyModification}
				disabled={offsetX === 0 && offsetY === 0 && offsetZ === 0}
			>
				Apply Coordinate Changes
			</button>
		</div>
	);
};

export default CoordinateModifier;