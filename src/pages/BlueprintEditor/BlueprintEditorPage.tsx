import React from "react";
import { Blueprint } from "../../types/blueprint";
import FileUpload from "../../components/common/FileUpload";
import BlueprintViewer from "./components/BlueprintViewer";
import ModuleReorderer from "./components/ModuleReorderer";
import CoordinateModifier from "./components/CoordinateModifier";
import ModuleDuplicator from "./components/ModuleDuplicator";
import ExportControls from "./components/ExportControls";

interface BlueprintEditorPageProps {
	blueprint: Blueprint | null;
	blueprintName: string;
	createNewId: boolean;
	error: string;
	onFileUpload: (content: string) => void;
	onBlueprintNameChange: (name: string) => void;
	onCreateNewIdChange: (value: boolean) => void;
	onBlueprintUpdate: (blueprint: Blueprint) => void;
	onReset: () => void;
}

const BlueprintEditorPage: React.FC<BlueprintEditorPageProps> = ({
	blueprint,
	blueprintName,
	createNewId,
	error,
	onFileUpload,
	onBlueprintNameChange,
	onCreateNewIdChange,
	onBlueprintUpdate,
	onReset
}) => {
	if (!blueprint) {
		return (
			<div className="upload-section">
				<FileUpload onFileUpload={onFileUpload} />
				{error && <div className="error-message">{error}</div>}
			</div>
		);
	}

	return (
		<div className="blueprint-editor">
			<div className="blueprint-info">
				<div className="blueprint-name-edit">
					<input
						type="text"
						value={blueprintName}
						onChange={(e) => onBlueprintNameChange(e.target.value)}
						className="blueprint-name-input"
					/>
				</div>
				{blueprint.description && <p>{blueprint.description}</p>}
				<p>Total modules: {blueprint.entries.length}</p>
				<div className="blueprint-options">
					<label className="checkbox-group">
						<input
							type="checkbox"
							checked={createNewId}
							onChange={(e) => onCreateNewIdChange(e.target.checked)}
						/>
						<span>Create as new blueprint (don&apos;t replace original)</span>
					</label>
				</div>
				<button onClick={onReset} className="reset-button">
					Load New Blueprint
				</button>
			</div>

			<div className="editor-sections">
				<div className="left-column">
					<BlueprintViewer blueprint={blueprint} />
					
					<ModuleDuplicator
						blueprint={blueprint}
						onUpdate={onBlueprintUpdate}
					/>
				</div>
				
				<div className="modification-tools">
					<ModuleReorderer 
						blueprint={blueprint} 
						onUpdate={onBlueprintUpdate} 
					/>
					
					<CoordinateModifier
						blueprint={blueprint}
						onUpdate={onBlueprintUpdate}
					/>
				</div>
			</div>

			<ExportControls 
				blueprint={blueprint} 
				blueprintName={blueprintName}
				createNewId={createNewId}
			/>
		</div>
	);
};

export default BlueprintEditorPage;