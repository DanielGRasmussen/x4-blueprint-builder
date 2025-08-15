import React, { useState } from "react";
import { ModuleType } from "../../../types/blueprint";
import styles from "./AddModuleModal.module.scss";

interface AddModuleModalProps {
	macro: string;
	isOpen: boolean;
	onClose: () => void;
	onSave: (macro: string, displayName: string, type: ModuleType) => void;
	categories: Array<{ value: string; label: string }>;
	className?: string;
}

const AddModuleModal: React.FC<AddModuleModalProps> = ({
	macro,
	isOpen,
	onClose,
	onSave,
	categories,
	className
}) => {
	const [displayName, setDisplayName] = useState("");
	const [selectedType, setSelectedType] = useState<string>(ModuleType.Other);
	const [error, setError] = useState("");

	if (!isOpen) return null;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!displayName.trim()) {
			setError("Display name is required");
			return;
		}

		onSave(macro, displayName.trim(), selectedType as ModuleType);

		// Reset form
		setDisplayName("");
		setSelectedType(ModuleType.Other);
		setError("");
		onClose();
	};

	const handleCancel = () => {
		// Reset form
		setDisplayName("");
		setSelectedType(ModuleType.Other);
		setError("");
		onClose();
	};

	return (
		<div className={`${styles.modalOverlay} ${className || ""}`} onClick={handleCancel}>
			<div className={styles.modalContent} onClick={e => e.stopPropagation()}>
				<h2>Add Module to System</h2>
				<p className={styles.modalDescription}>
					This module is not recognized by the system. Add it with a custom name and category.
				</p>

				<form onSubmit={handleSubmit}>
					<div className={styles.formGroup}>
						<label htmlFor="macro">Module Macro</label>
						<input
							id="macro"
							type="text"
							value={macro}
							disabled
							className={`${styles.formInput} ${styles.disabled}`}
						/>
					</div>

					<div className={styles.formGroup}>
						<label htmlFor="displayName">Display Name</label>
						<input
							id="displayName"
							type="text"
							value={displayName}
							onChange={e => {
								setDisplayName(e.target.value);
								setError("");
							}}
							placeholder="e.g., Custom Energy Cell Production"
							className={`${styles.formInput} ${error ? styles.error : ""}`}
							autoFocus
						/>
						{error && <span className={styles.errorMessage}>{error}</span>}
					</div>

					<div className={styles.formGroup}>
						<label htmlFor="category">Category</label>
						<select
							id="category"
							value={selectedType}
							onChange={e => setSelectedType(e.target.value)}
							className={styles.formSelect}
						>
							{categories.map(cat => (
								<option key={cat.value} value={cat.value}>
									{cat.label}
								</option>
							))}
						</select>
					</div>

					<div className={styles.modalActions}>
						<button type="button" onClick={handleCancel} className={styles.buttonSecondary}>
							Cancel
						</button>
						<button type="submit" className={styles.buttonPrimary}>
							Add to System
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AddModuleModal;
