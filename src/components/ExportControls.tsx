import React from "react";
import { Blueprint } from "../types/blueprint";
import { BlueprintParser } from "../utils/blueprintParser";
import "./ExportControls.css";

interface ExportControlsProps {
	blueprint: Blueprint;
	blueprintName: string;
	createNewId: boolean;
}

const ExportControls: React.FC<ExportControlsProps> = ({ blueprint, blueprintName, createNewId }) => {
	const handleExport = () => {
		const modifiedBlueprint = { ...blueprint, name: blueprintName };
		
		if (createNewId) {
			const timestamp = Date.now();
			const randomNum = Math.floor(Math.random() * 1000000000);
			modifiedBlueprint.id = `player_${timestamp}_${randomNum}`;
		}
		
		const xml = BlueprintParser.blueprintToXml(modifiedBlueprint);
		const blob = new Blob([xml], { type: "text/xml" });
		const url = URL.createObjectURL(blob);
		
		const a = document.createElement("a");
		a.href = url;
		a.download = `${blueprintName.replace(/[^a-z0-9]/gi, "_")}.xml`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const handleCopyToClipboard = async () => {
		const modifiedBlueprint = { ...blueprint, name: blueprintName };
		
		if (createNewId) {
			const timestamp = Date.now();
			const randomNum = Math.floor(Math.random() * 1000000000);
			modifiedBlueprint.id = `player_${timestamp}_${randomNum}`;
		}
		
		const xml = BlueprintParser.blueprintToXml(modifiedBlueprint);
		try {
			await navigator.clipboard.writeText(xml);
			alert("Blueprint XML copied to clipboard!");
		} catch (err) {
			alert("Failed to copy to clipboard. Please use the download button instead.");
		}
	};

	const handlePreview = () => {
		const modifiedBlueprint = { ...blueprint, name: blueprintName };
		
		if (createNewId) {
			const timestamp = Date.now();
			const randomNum = Math.floor(Math.random() * 1000000000);
			modifiedBlueprint.id = `player_${timestamp}_${randomNum}`;
		}
		
		const xml = BlueprintParser.blueprintToXml(modifiedBlueprint);
		const blob = new Blob([xml], { type: "text/xml" });
		const url = URL.createObjectURL(blob);
		window.open(url, "_blank");
		
		// Clean up after a delay
		setTimeout(() => URL.revokeObjectURL(url), 60000);
	};

	return (
		<div className="export-controls component-section">
			<h3>Export Modified Blueprint</h3>
			
			<div className="export-info">
				<p>Your modified blueprint is ready for export.</p>
				<p>Total modules: {blueprint.entries.length}</p>
			</div>

			<div className="export-buttons">
				<button onClick={handleExport} className="export-button primary">
					<svg className="button-icon" viewBox="0 0 24 24" width="20" height="20">
						<path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z" fill="currentColor"/>
					</svg>
					Download XML
				</button>
				
				<button onClick={handleCopyToClipboard} className="export-button">
					<svg className="button-icon" viewBox="0 0 24 24" width="20" height="20">
						<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
					</svg>
					Copy to Clipboard
				</button>
				
				<button onClick={handlePreview} className="export-button">
					<svg className="button-icon" viewBox="0 0 24 24" width="20" height="20">
						<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
					</svg>
					Preview XML
				</button>
			</div>

			<div className="export-note">
				<strong>Note:</strong> Place the exported file in your X4 constructionplans folder:
				<code>Documents\Egosoft\X4\[YourSteamID]\constructionplans\</code>
			</div>
			
			<div className="export-footer">
				<p>Made with ❤️ • © 2025 • <a href="https://github.com/DanielGRasmussen/x4-reindexer" target="_blank" rel="noopener noreferrer">Github</a></p>
			</div>
		</div>
	);
};

export default ExportControls;