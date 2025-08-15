import React from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import styles from "./App.module.scss";
import BlueprintBuilderPage from "./pages/BlueprintBuilder/BlueprintBuilderPage";
import SettingsPage from "./pages/Settings/SettingsPage";

function App() {
	return (
		<div className={styles.app}>
			<header className={styles.header}>
				<h1>X4 Foundations Blueprint Builder</h1>
				<nav className={styles.tabNavigation}>
					<NavLink
						to="/builder"
						className={({ isActive }) => `${styles.tabButton} ${isActive ? styles.active : ""}`}
					>
						Blueprint Builder
					</NavLink>
					<NavLink
						to="/settings"
						className={({ isActive }) => `${styles.tabButton} ${isActive ? styles.active : ""}`}
					>
						Settings
					</NavLink>
				</nav>
			</header>

			<main className={styles.main}>
				<Routes>
					<Route path="/" element={<Navigate to="/builder" replace />} />
					<Route path="/builder" element={<BlueprintBuilderPage />} />
					<Route path="/settings" element={<SettingsPage />} />
				</Routes>
			</main>

			<footer className={styles.footer}>
				<p>
					Made with ❤️ • © {new Date().getFullYear()} •{" "}
					<a
						href="https://github.com/DanielGRasmussen/x4-reindexer"
						target="_blank"
						rel="noopener noreferrer"
					>
						Github
					</a>
				</p>
			</footer>
		</div>
	);
}

export default App;
