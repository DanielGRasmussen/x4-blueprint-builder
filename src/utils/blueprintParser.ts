import { Blueprint, BlueprintEntry, Offset, Upgrades } from "../types/blueprint";

export class BlueprintParser {
	static parseBlueprint(xmlString: string): Blueprint {
		const parser = new DOMParser();
		const doc = parser.parseFromString(xmlString, "text/xml");

		const planElement = doc.querySelector("plan");
		if (!planElement) {
			throw new Error("Invalid blueprint: no plan element found");
		}

		const blueprint: Blueprint = {
			id: planElement.getAttribute("id") || "",
			name: planElement.getAttribute("name") || "",
			description: planElement.getAttribute("description") || undefined,
			patches: [],
			entries: []
		};

		// Parse patches
		const patchElements = doc.querySelectorAll("patches > patch");
		patchElements.forEach(patchEl => {
			blueprint.patches.push({
				extension: patchEl.getAttribute("extension") || "",
				version: patchEl.getAttribute("version") || "",
				name: patchEl.getAttribute("name") || ""
			});
		});

		// Parse entries
		const entryElements = doc.querySelectorAll("plan > entry");
		entryElements.forEach(entryEl => {
			const entry: BlueprintEntry = {
				index: parseInt(entryEl.getAttribute("index") || "0"),
				macro: entryEl.getAttribute("macro") || "",
				connection: entryEl.getAttribute("connection") || undefined
			};

			// Parse predecessor
			const predecessorEl = entryEl.querySelector("predecessor");
			if (predecessorEl) {
				entry.predecessor = {
					index: parseInt(predecessorEl.getAttribute("index") || "0"),
					connection: predecessorEl.getAttribute("connection") || ""
				};
			}

			// Parse offset
			const offsetEl = entryEl.querySelector("offset");
			if (offsetEl) {
				entry.offset = this.parseOffset(offsetEl);
			}

			// Parse upgrades
			const upgradesEl = entryEl.querySelector("upgrades");
			if (upgradesEl) {
				entry.upgrades = this.parseUpgrades(upgradesEl);
			}

			blueprint.entries.push(entry);
		});

		return blueprint;
	}

	private static parseOffset(offsetEl: Element): Offset {
		const offset: Offset = {};

		const positionEl = offsetEl.querySelector("position");
		if (positionEl) {
			offset.position = {
				x: parseFloat(positionEl.getAttribute("x") || "0"),
				y: parseFloat(positionEl.getAttribute("y") || "0"),
				z: parseFloat(positionEl.getAttribute("z") || "0")
			};
		}

		const rotationEl = offsetEl.querySelector("rotation");
		if (rotationEl) {
			offset.rotation = {
				pitch: parseFloat(rotationEl.getAttribute("pitch") || "0"),
				yaw: parseFloat(rotationEl.getAttribute("yaw") || "0"),
				roll: parseFloat(rotationEl.getAttribute("roll") || "0")
			};
		}

		const quaternionEl = offsetEl.querySelector("quaternion");
		if (quaternionEl) {
			offset.quaternion = {
				qx: parseFloat(quaternionEl.getAttribute("qx") || "0"),
				qy: parseFloat(quaternionEl.getAttribute("qy") || "0"),
				qz: parseFloat(quaternionEl.getAttribute("qz") || "0"),
				qw: parseFloat(quaternionEl.getAttribute("qw") || "1")
			};
		}

		return offset;
	}

	private static parseUpgrades(upgradesEl: Element): Upgrades {
		const upgrades: Upgrades = { groups: {} };

		const groupsEl = upgradesEl.querySelector("groups");
		if (groupsEl) {
			const shields = groupsEl.querySelectorAll("shields");
			if (shields.length > 0) {
				upgrades.groups!.shields = Array.from(shields).map(shield => ({
					macro: shield.getAttribute("macro") || "",
					group: shield.getAttribute("group") || "",
					exact: shield.getAttribute("exact") ? parseInt(shield.getAttribute("exact")!) : undefined
				}));
			}

			const turrets = groupsEl.querySelectorAll("turrets");
			if (turrets.length > 0) {
				upgrades.groups!.turrets = Array.from(turrets).map(turret => ({
					macro: turret.getAttribute("macro") || "",
					group: turret.getAttribute("group") || "",
					exact: turret.getAttribute("exact") ? parseInt(turret.getAttribute("exact")!) : undefined
				}));
			}
		}

		return upgrades;
	}

	static blueprintToXml(blueprint: Blueprint): string {
		let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
		xml += "<plans>\n";
		xml += `	<plan id="${blueprint.id}" name="${blueprint.name}"`;
		if (blueprint.description) {
			xml += ` description="${blueprint.description}"`;
		}
		xml += ">\n";

		// Add patches
		if (blueprint.patches.length > 0) {
			xml += "		<patches>\n";
			blueprint.patches.forEach(patch => {
				xml += `			<patch extension="${patch.extension}" version="${patch.version}" name="${patch.name}"/>\n`;
			});
			xml += "		</patches>\n";
		}

		// Add entries
		blueprint.entries.forEach(entry => {
			xml += `		<entry index="${entry.index}" macro="${entry.macro}"`;
			if (entry.connection) {
				xml += ` connection="${entry.connection}"`;
			}

			if (!entry.predecessor && !entry.offset && !entry.upgrades) {
				xml += "/>\n";
			} else {
				xml += ">\n";

				if (entry.predecessor) {
					xml += `			<predecessor index="${entry.predecessor.index}" connection="${entry.predecessor.connection}"/>\n`;
				}

				if (entry.offset) {
					xml += "			<offset>\n";
					if (entry.offset.position) {
						const p = entry.offset.position;
						xml += `				<position x="${p.x}" y="${p.y}" z="${p.z}"/>\n`;
					}
					if (entry.offset.rotation) {
						const r = entry.offset.rotation;
						xml += `				<rotation pitch="${r.pitch || 0}" yaw="${r.yaw || 0}" roll="${r.roll || 0}"/>\n`;
					}
					if (entry.offset.quaternion) {
						const q = entry.offset.quaternion;
						xml += `				<quaternion qx="${q.qx}" qy="${q.qy}" qz="${q.qz}" qw="${q.qw}"/>\n`;
					}
					xml += "			</offset>\n";
				}

				if (entry.upgrades && entry.upgrades.groups) {
					xml += "			<upgrades>\n";
					xml += "				<groups>\n";

					if (entry.upgrades.groups.shields) {
						entry.upgrades.groups.shields.forEach(shield => {
							xml += `					<shields macro="${shield.macro}" group="${shield.group}"`;
							if (shield.exact !== undefined) {
								xml += ` exact="${shield.exact}"`;
							}
							xml += "/>\n";
						});
					}

					if (entry.upgrades.groups.turrets) {
						entry.upgrades.groups.turrets.forEach(turret => {
							xml += `					<turrets macro="${turret.macro}" group="${turret.group}"`;
							if (turret.exact !== undefined) {
								xml += ` exact="${turret.exact}"`;
							}
							xml += "/>\n";
						});
					}

					xml += "				</groups>\n";
					xml += "			</upgrades>\n";
				}

				xml += "		</entry>\n";
			}
		});

		xml += "	</plan>\n";
		xml += "</plans>";

		return xml;
	}
}
