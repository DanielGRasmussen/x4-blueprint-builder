import React, { useRef } from "react";
import { SettingsData } from "../SettingsPage";
import { ErrorHandler } from "../../../utils/errorHandler";
import styles from "./SettingsExport.module.scss";

interface SettingsExportProps {
	settings: SettingsData;
	onImportSettings: (settings: SettingsData) => void;
	className?: string;
}

const SettingsExport: React.FC<SettingsExportProps> = ({
	settings,
	onImportSettings,
	className
}) => {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleExport = () => {
		const dataStr = JSON.stringify(settings, null, 2);
		const blob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `x4-blueprint-settings-${new Date().toISOString().split("T")[0]}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleImport = () => {
		fileInputRef.current?.click();
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = e => {
			try {
				const content = e.target?.result as string;
				const imported = JSON.parse(content) as SettingsData;

				// Validate the imported data
				if (!imported.customModules || !imported.customCategories) {
					throw new Error("Invalid settings file format");
				}

				onImportSettings(imported);
				ErrorHandler.info("Settings imported successfully!");
			} catch (error) {
				ErrorHandler.error("Failed to import settings", error);
			}
		};
		reader.readAsText(file);

		// Reset file input
		if (event.target) {
			event.target.value = "";
		}
	};

	const handleReset = () => {
		if (
			window.confirm(
				"Reset all settings to defaults? This will remove all custom modules and category names."
			)
		) {
			onImportSettings({
				customModules: {},
				customCategories: {},
				customCategoryTypes: [],
				moduleOverrides: {}
			});
		}
	};

	return (
		<div className={`${styles.settingsExport} ${className || ""}`}>
			<div className={styles.exportSection}>
				<h3>Export Settings</h3>
				<p>Save your custom modules and category names to a file.</p>
				<button onClick={handleExport} className={styles.exportButton}>
					Export Settings
				</button>
			</div>

			<div className={styles.importSection}>
				<h3>Import Settings</h3>
				<p>Load settings from a previously exported file.</p>
				<button onClick={handleImport} className={styles.importButton}>
					Import Settings
				</button>
				<input
					ref={fileInputRef}
					type="file"
					accept=".json"
					style={{ display: "none" }}
					onChange={handleFileUpload}
				/>
			</div>

			<div className={styles.resetSection}>
				<h3>Reset Settings</h3>
				<p>Remove all customizations and return to default settings.</p>
				<button onClick={handleReset} className={`${styles.resetButton} ${styles.danger}`}>
					Reset All Settings
				</button>
			</div>

			<div className={styles.settingsStats}>
				<h3>Current Settings</h3>
				<ul>
					<li>Custom Modules: {Object.keys(settings.customModules).length}</li>
					<li>Module Overrides: {Object.keys(settings.moduleOverrides).length}</li>
					<li>Custom Category Names: {Object.keys(settings.customCategories).length}</li>
				</ul>
			</div>
		</div>
	);
};

export default SettingsExport;
