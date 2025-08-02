import React from "react";

const BlueprintBuilderPage: React.FC = () => {
	return (
		<div className="blueprint-builder">
			<div className="component-section">
				<h2>Blueprint Builder</h2>
				<p>Build blueprints by selecting modules from a catalog. This feature is coming soon!</p>
				<div style={{ marginTop: "20px" }}>
					<p>Planned features:</p>
					<ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
						<li>Module catalog on the left side with dropdown selection</li>
						<li>Add selected modules to blueprint on the right side</li>
						<li>Click on a module to:
							<ul style={{ marginLeft: "20px", marginTop: "5px" }}>
								<li>View and edit predecessor connection</li>
								<li>View and edit X, Y, Z coordinates</li>
								<li>Duplicate the module X amount of times</li>
							</ul>
						</li>
						<li>Multi-selection support:
							<ul style={{ marginLeft: "20px", marginTop: "5px" }}>
								<li>Shift+click to select a range of modules</li>
								<li>Ctrl+click to add/remove individual modules from selection</li>
								<li>Modify multiple selected modules at once</li>
							</ul>
						</li>
						<li>Export to X4 blueprint format</li>
					</ul>
					<p style={{ marginTop: "15px", fontStyle: "italic" }}>
						Note: Module loadout editing will not be supported - modules will use their default configurations.
					</p>
				</div>
			</div>
		</div>
	);
};

export default BlueprintBuilderPage;