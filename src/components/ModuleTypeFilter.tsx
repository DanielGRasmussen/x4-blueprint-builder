import React from "react";
import { ModuleType } from "../types/blueprint";
import "./ModuleTypeFilter.css";

interface ModuleTypeFilterProps {
	selectedType: ModuleType | "";
	onTypeChange: (type: ModuleType | "") => void;
	modulesByType: Record<ModuleType, { macro: string; displayName: string }[]>;
	label?: string;
}

const ModuleTypeFilter: React.FC<ModuleTypeFilterProps> = ({ 
	selectedType, 
	onTypeChange, 
	modulesByType,
	label = "Filter by Type:"
}) => {
	return (
		<div className="module-type-filter">
			<div className="form-group">
				<label>{label}</label>
				<select 
					value={selectedType} 
					onChange={(e) => onTypeChange(e.target.value as ModuleType | "")}
				>
					<option value="">All Types</option>
					{Object.entries(modulesByType)
						.filter(([_, modules]) => modules.length > 0)
						.map(([type, modules]) => (
							<option key={type} value={type}>
								{type.replace(/([A-Z])/g, " $1").trim()} ({modules.length})
							</option>
						))
					}
				</select>
			</div>
		</div>
	);
};

export default ModuleTypeFilter;