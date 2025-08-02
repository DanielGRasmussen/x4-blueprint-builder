import React, { useState } from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import "./App.css";
import { Blueprint } from "./types/blueprint";
import { BlueprintParser } from "./utils/blueprintParser";
import BlueprintEditorPage from "./pages/BlueprintEditor/BlueprintEditorPage";
import BlueprintBuilderPage from "./pages/BlueprintBuilder/BlueprintBuilderPage";

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
				<h1>X4 Foundations Blueprint Editor</h1>
				<nav className="tab-navigation">
					<NavLink
						to="/editor"
						className={({ isActive }) => `tab-button ${isActive ? "active" : ""}`}
					>
						Blueprint Editor
					</NavLink>
					<NavLink
						to="/builder"
						className={({ isActive }) => `tab-button ${isActive ? "active" : ""}`}
					>
						Blueprint Builder
					</NavLink>
				</nav>
			</header>
			
			<main className="App-main">
				<Routes>
					<Route path="/" element={<Navigate to="/editor" replace />} />
					<Route 
						path="/editor" 
						element={
							<BlueprintEditorPage
								blueprint={blueprint}
								blueprintName={blueprintName}
								createNewId={createNewId}
								error={error}
								onFileUpload={handleFileUpload}
								onBlueprintNameChange={setBlueprintName}
								onCreateNewIdChange={setCreateNewId}
								onBlueprintUpdate={setBlueprint}
								onReset={() => setBlueprint(null)}
							/>
						} 
					/>
					<Route path="/builder" element={<BlueprintBuilderPage />} />
				</Routes>
			</main>
		</div>
	);
}

export default App;