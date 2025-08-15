import React, { useState, useEffect } from "react";
import { useSettings } from "../../hooks/useSettings";
import { SettingsData } from "../../utils/settingsManager";
import ModuleManager from "./components/ModuleManager";
import CategoryManager from "./components/CategoryManager";
import SettingsExport from "./components/SettingsExport";
import styles from "./SettingsPage.module.scss";

export type { CustomModule, CustomCategory, SettingsData } from "../../utils/settingsManager";

const SettingsPage: React.FC = () => {
	const { settings, updateSettings, importSettings } = useSettings();

	const getInitialTab = () => {
		const hash = window.location.hash.slice(1);
		if (hash === "general" || hash === "modules" || hash === "categories" || hash === "export") {
			return hash;
		}
		return "general";
	};

	const [activeTab, setActiveTab] = useState<"general" | "modules" | "categories" | "export">(
		getInitialTab()
	);

	useEffect(() => {
		window.location.hash = activeTab;
	}, [activeTab]);

	useEffect(() => {
		const handleHashChange = () => {
			const hash = window.location.hash.slice(1);
			if (hash === "modules" || hash === "categories" || hash === "export") {
				setActiveTab(hash);
			}
		};

		window.addEventListener("hashchange", handleHashChange);
		return () => window.removeEventListener("hashchange", handleHashChange);
	}, []);

	const handleUpdateSettings = (newSettings: Partial<SettingsData>) => {
		updateSettings(newSettings);
	};

	const handleImportSettings = (imported: SettingsData) => {
		const json = JSON.stringify(imported);
		importSettings(json);
	};

	return (
		<div className={styles.settingsPage}>
			<div className={styles.settingsHeader}>
				<h2>Settings</h2>
				<p>Customize modules, categories, and other blueprint editor settings</p>
			</div>

			<div className={styles.settingsTabs}>
				<button
					className={`${styles.tabButton} ${activeTab === "general" ? styles.active : ""}`}
					onClick={() => setActiveTab("general")}
				>
					General
				</button>
				<button
					className={`${styles.tabButton} ${activeTab === "modules" ? styles.active : ""}`}
					onClick={() => setActiveTab("modules")}
				>
					Modules
				</button>
				<button
					className={`${styles.tabButton} ${activeTab === "categories" ? styles.active : ""}`}
					onClick={() => setActiveTab("categories")}
				>
					Categories
				</button>
				<button
					className={`${styles.tabButton} ${activeTab === "export" ? styles.active : ""}`}
					onClick={() => setActiveTab("export")}
				>
					Import/Export
				</button>
			</div>

			<div className={styles.settingsContent}>
				{activeTab === "general" && (
					<div className={styles.generalSettings}>
						<h3>General Settings</h3>
						<div className={styles.settingItem}>
							<label htmlFor="collapse-threshold">
								Module Collapse Threshold
								<span className={styles.settingDescription}>
									When this many or more identical modules appear in a row, they will be collapsed into a
									group
								</span>
							</label>
							<input
								id="collapse-threshold"
								type="number"
								min="2"
								max="50"
								value={settings.moduleCollapseThreshold || 5}
								onChange={e =>
									handleUpdateSettings({ moduleCollapseThreshold: parseInt(e.target.value) || 5 })
								}
								className={styles.settingInput}
							/>
						</div>
					</div>
				)}
				{activeTab === "modules" && (
					<ModuleManager settings={settings} onUpdateSettings={handleUpdateSettings} />
				)}
				{activeTab === "categories" && (
					<CategoryManager settings={settings} onUpdateSettings={handleUpdateSettings} />
				)}
				{activeTab === "export" && (
					<SettingsExport settings={settings} onImportSettings={handleImportSettings} />
				)}
			</div>
		</div>
	);
};

export default SettingsPage;
