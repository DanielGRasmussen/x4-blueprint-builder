import React, { useState } from "react";
import "./App.css";
import { Blueprint } from "./types/blueprint";
import { BlueprintParser } from "./utils/blueprintParser";
import FileUpload from "./components/FileUpload";
import BlueprintViewer from "./components/BlueprintViewer";
import ModuleReorderer from "./components/ModuleReorderer";
import CoordinateModifier from "./components/CoordinateModifier";
import ModuleDuplicator from "./components/ModuleDuplicator";
import ExportControls from "./components/ExportControls";

function App() {
	const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
	const [error, setError] = useState<string>("");
	const [blueprintName, setBlueprintName] = useState<string>("");
	const [createNewId, setCreateNewId] = useState<boolean>(false);

	const handleFileUpload = (content: string) => {
		try {
			const parsedBlueprint = BlueprintParser.parseBlueprint(content);
			setBlueprint(parsedBlueprint);
			setBlueprintName(parsedBlueprint.name);
			setError("");
		} catch (err) {
			setError(`Failed to parse blueprint: ${err instanceof Error ? err.message : "Unknown error"}`);
			setBlueprint(null);
		}
	};

	return (
		<div className="App">
			<header className="App-header">
				<h1>X4 Foundations Blueprint Reindexer</h1>
			</header>
			
			<main className="App-main">
				{!blueprint ? (
					<div className="upload-section">
						<FileUpload onFileUpload={handleFileUpload} />
						{error && <div className="error-message">{error}</div>}
					</div>
				) : (
					<div className="blueprint-editor">
						<div className="blueprint-info">
							<div className="blueprint-name-edit">
								<input
									type="text"
									value={blueprintName}
									onChange={(e) => setBlueprintName(e.target.value)}
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
										onChange={(e) => setCreateNewId(e.target.checked)}
									/>
									<span>Create as new blueprint (don&apos;t replace original)</span>
								</label>
							</div>
							<button onClick={() => setBlueprint(null)} className="reset-button">
								Load New Blueprint
							</button>
						</div>

						<div className="editor-sections">
							<div className="left-column">
								<BlueprintViewer blueprint={blueprint} />
								
								<ModuleDuplicator
									blueprint={blueprint}
									onUpdate={setBlueprint}
								/>
							</div>
							
							<div className="modification-tools">
								<ModuleReorderer 
									blueprint={blueprint} 
									onUpdate={setBlueprint} 
								/>
								
								<CoordinateModifier
									blueprint={blueprint}
									onUpdate={setBlueprint}
								/>
							</div>
						</div>

						<ExportControls 
							blueprint={blueprint} 
							blueprintName={blueprintName}
							createNewId={createNewId}
						/>
					</div>
				)}
			</main>
		</div>
	);
}

export default App;