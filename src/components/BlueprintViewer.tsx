import React, { useState } from "react";
import { Blueprint, BlueprintEntry, ModuleType } from "../types/blueprint";
import { ModuleTypeClassifier } from "../utils/moduleTypeClassifier";
import "./BlueprintViewer.css";

interface BlueprintViewerProps {
	blueprint: Blueprint;
}

const BlueprintViewer: React.FC<BlueprintViewerProps> = ({ blueprint }) => {
	const [expandedTypes, setExpandedTypes] = useState<Set<ModuleType>>(new Set());
	const [searchTerm, setSearchTerm] = useState("");

	const toggleType = (type: ModuleType) => {
		const newExpanded = new Set(expandedTypes);
		if (newExpanded.has(type)) {
			newExpanded.delete(type);
		} else {
			newExpanded.add(type);
		}
		setExpandedTypes(newExpanded);
	};

	// Group entries by type while preserving individual entries
	const entriesByType: Record<ModuleType, Array<{entry: BlueprintEntry, moduleInfo: ReturnType<typeof ModuleTypeClassifier.classifyModule>}>> = {
		[ModuleType.RefinedGoods]: [],
		[ModuleType.HighTechGoods]: [],
		[ModuleType.ShipTechnology]: [],
		[ModuleType.Recycling]: [],
		[ModuleType.AgriculturalGoodsL1]: [],
		[ModuleType.AgriculturalGoodsL2]: [],
		[ModuleType.PharmaceuticalGoods]: [],
		[ModuleType.Habitation]: [],
		[ModuleType.DockArea]: [],
		[ModuleType.Pier]: [],
		[ModuleType.BuildModule]: [],
		[ModuleType.Storage]: [],
		[ModuleType.Defense]: [],
		[ModuleType.Connection]: [],
		[ModuleType.Other]: []
	};

	blueprint.entries.forEach(entry => {
		const moduleInfo = ModuleTypeClassifier.classifyModule(entry.macro);
		if (
			moduleInfo.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			entry.macro.toLowerCase().includes(searchTerm.toLowerCase())
		) {
			entriesByType[moduleInfo.type].push({ entry, moduleInfo });
		}
	});

	// Filter out empty types
	const filteredEntriesByType = Object.entries(entriesByType).reduce((acc, [type, entries]) => {
		if (entries.length > 0) {
			acc[type as ModuleType] = entries;
		}
		return acc;
	}, {} as typeof entriesByType);

	return (
		<div className="blueprint-viewer component-section">
			<h3>Blueprint Modules</h3>
			<div className="search-container">
				<input
					type="text"
					placeholder="Search modules..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="search-input"
				/>
			</div>

			<div className="module-tree">
				{Object.entries(filteredEntriesByType).map(([type, entries]) => (
					<div key={type} className="module-type-group">
						<div 
							className="module-type-header"
							onClick={() => toggleType(type as ModuleType)}
						>
							<span className="expand-icon">
								{expandedTypes.has(type as ModuleType) ? "▼" : "▶"}
							</span>
							<span className="type-name">{type.replace(/([A-Z])/g, " $1").trim()}</span>
							<span className="module-count">({entries.length})</span>
						</div>

						{expandedTypes.has(type as ModuleType) && (
							<div className="module-list">
								{entries.map(({ entry, moduleInfo }) => (
									<div key={`entry-${entry.index}`} className="module-item">
										<div className="module-name">{moduleInfo.displayName}</div>
										<div className="module-details">
											<span className="module-index">Index: {entry.index}</span>
											{entry.predecessor && (
												<span className="predecessor-info">
													{entry.predecessor.index} ({entry.predecessor.connection})
												</span>
											)}
										</div>
										<div className="module-macro">{entry.macro}</div>
									</div>
								))}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

export default BlueprintViewer;