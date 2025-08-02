import React, { useState } from "react";
import { Blueprint, ModuleType } from "../../../types/blueprint";
import { BlueprintReindexer, DuplicationOptions } from "../../../utils/blueprintReindexer";
import { ModuleTypeClassifier } from "../../../utils/moduleTypeClassifier";
import IncrementButtons from "../../../components/common/IncrementButtons";
import ModuleTypeFilter from "../../../components/common/ModuleTypeFilter";
import "./ModuleDuplicator.css";

interface ModuleDuplicatorProps {
	blueprint: Blueprint;
	onUpdate: (blueprint: Blueprint) => void;
}

const ModuleDuplicator: React.FC<ModuleDuplicatorProps> = ({ blueprint, onUpdate }) => {
	const [duplicateAll, setDuplicateAll] = useState(true);
	const [selectedType, setSelectedType] = useState<ModuleType | "">("");
	const [selectedMacros, setSelectedMacros] = useState<string[]>([]);
	const [count, setCount] = useState(1);
	const [directionX, setDirectionX] = useState(0);
	const [directionY, setDirectionY] = useState(0);
	const [directionZ, setDirectionZ] = useState(0);

	const modulesByType = ModuleTypeClassifier.getModulesByType(
		blueprint.entries.map(e => e.macro)
	);

	const uniqueMacros = Array.from(new Set(blueprint.entries.map(e => e.macro))).sort();

	const handleDuplicate = () => {
		const options: DuplicationOptions = {
			count,
			direction: {
				x: directionX,
				y: directionY,
				z: directionZ
			},
			keepPredecessors: true
		};

		if (!duplicateAll) {
			if (selectedType) {
				options.macros = modulesByType[selectedType].map(m => m.macro);
			} else if (selectedMacros.length > 0) {
				options.macros = selectedMacros;
			} else {
				alert("Please select modules to duplicate");
				return;
			}
		}

		const updatedBlueprint = BlueprintReindexer.duplicateModules(blueprint, options);
		onUpdate(updatedBlueprint);

		// Reset form
		setSelectedMacros([]);
		setCount(1);
	};

	return (
		<div className="module-duplicator component-section">
			<h3>Module Duplication</h3>

			<div className="duplication-target">
				<div className="radio-group">
					<label className="radio-label">
						<input
							type="radio"
							checked={duplicateAll}
							onChange={() => setDuplicateAll(true)}
						/>
						Duplicate all modules
					</label>
					
					<label className="radio-label">
						<input
							type="radio"
							checked={!duplicateAll}
							onChange={() => setDuplicateAll(false)}
						/>
						Duplicate specific modules
					</label>
				</div>

				{!duplicateAll && (
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

			<div className="duplication-settings">
				<div className="form-group">
					<label>Number of Copies:</label>
					<input
						type="number"
						min="1"
						max="100"
						value={count}
						onChange={(e) => setCount(parseInt(e.target.value) || 1)}
					/>
				</div>

				<div className="direction-settings">
					<h4>Duplication Spacing</h4>
					
					<div className="coordinate-grid">
						<div className="form-group">
							<label>X Spacing:</label>
							<input
								type="number"
								className="no-arrows"
								value={directionX}
								onChange={(e) => setDirectionX(parseFloat(e.target.value) || 0)}
								step="0.1"
							/>
						</div>
						
						<div className="form-group">
							<label>Y Spacing:</label>
							<input
								type="number"
								className="no-arrows"
								value={directionY}
								onChange={(e) => setDirectionY(parseFloat(e.target.value) || 0)}
								step="0.1"
							/>
						</div>
						
						<div className="form-group">
							<label>Z Spacing:</label>
							<input
								type="number"
								className="no-arrows"
								value={directionZ}
								onChange={(e) => setDirectionZ(parseFloat(e.target.value) || 0)}
								step="0.1"
							/>
						</div>
					</div>

					<IncrementButtons
						x={directionX}
						y={directionY}
						z={directionZ}
						onUpdateX={setDirectionX}
						onUpdateY={setDirectionY}
						onUpdateZ={setDirectionZ}
					/>
				</div>

				<div className="duplication-note">
					Note: Duplicated modules will maintain their predecessor connections to each other.
				</div>
			</div>

			<button 
				className="duplicate-button"
				onClick={handleDuplicate}
				disabled={count < 1}
			>
				Duplicate Modules
			</button>
		</div>
	);
};

export default ModuleDuplicator;