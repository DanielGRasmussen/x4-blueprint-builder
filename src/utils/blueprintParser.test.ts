import { describe, it, expect } from "vitest";
import { BlueprintParser } from "./blueprintParser";
import { Blueprint } from "../types/blueprint";

describe("BlueprintParser", () => {
	describe("parseBlueprint", () => {
		it("should parse a basic blueprint with minimal data", () => {
			const xml = `<?xml version="1.0" encoding="utf-8"?>
<plans>
	<plan id="test_id" name="Test Plan">
		<entry index="0" macro="test_module_macro"/>
	</plan>
</plans>`;

			const result = BlueprintParser.parseBlueprint(xml);

			expect(result).toEqual({
				id: "test_id",
				name: "Test Plan",
				description: undefined,
				patches: [],
				entries: [
					{
						index: 0,
						macro: "test_module_macro",
						connection: undefined,
						predecessor: undefined,
						offset: undefined,
						upgrades: undefined
					}
				]
			});
		});

		it("should parse a blueprint with description", () => {
			const xml = `<?xml version="1.0" encoding="utf-8"?>
<plans>
	<plan id="test_id" name="Test Plan" description="Test Description">
		<entry index="0" macro="test_module_macro"/>
	</plan>
</plans>`;

			const result = BlueprintParser.parseBlueprint(xml);

			expect(result.description).toBe("Test Description");
		});

		it("should parse blueprint with patches", () => {
			const xml = `<?xml version="1.0" encoding="utf-8"?>
<plans>
	<plan id="test_id" name="Test Plan">
		<patches>
			<patch extension="ext1" version="1.0" name="Patch 1"/>
			<patch extension="ext2" version="2.0" name="Patch 2"/>
		</patches>
		<entry index="0" macro="test_module_macro"/>
	</plan>
</plans>`;

			const result = BlueprintParser.parseBlueprint(xml);

			expect(result.patches).toEqual([
				{ extension: "ext1", version: "1.0", name: "Patch 1" },
				{ extension: "ext2", version: "2.0", name: "Patch 2" }
			]);
		});

		it("should parse entry with connection", () => {
			const xml = `<?xml version="1.0" encoding="utf-8"?>
<plans>
	<plan id="test_id" name="Test Plan">
		<entry index="0" macro="test_module_macro" connection="connection_01"/>
	</plan>
</plans>`;

			const result = BlueprintParser.parseBlueprint(xml);

			expect(result.entries[0].connection).toBe("connection_01");
		});

		it("should parse entry with predecessor", () => {
			const xml = `<?xml version="1.0" encoding="utf-8"?>
<plans>
	<plan id="test_id" name="Test Plan">
		<entry index="1" macro="test_module_macro">
			<predecessor index="0" connection="connection_01"/>
		</entry>
	</plan>
</plans>`;

			const result = BlueprintParser.parseBlueprint(xml);

			expect(result.entries[0].predecessor).toEqual({
				index: 0,
				connection: "connection_01"
			});
		});

		it("should parse entry with position offset", () => {
			const xml = `<?xml version="1.0" encoding="utf-8"?>
<plans>
	<plan id="test_id" name="Test Plan">
		<entry index="0" macro="test_module_macro">
			<offset>
				<position x="100.5" y="200.25" z="300.75"/>
			</offset>
		</entry>
	</plan>
</plans>`;

			const result = BlueprintParser.parseBlueprint(xml);

			expect(result.entries[0].offset?.position).toEqual({
				x: 100.5,
				y: 200.25,
				z: 300.75
			});
		});

		it("should parse entry with rotation offset", () => {
			const xml = `<?xml version="1.0" encoding="utf-8"?>
<plans>
	<plan id="test_id" name="Test Plan">
		<entry index="0" macro="test_module_macro">
			<offset>
				<rotation pitch="45.5" yaw="90.25" roll="180.75"/>
			</offset>
		</entry>
	</plan>
</plans>`;

			const result = BlueprintParser.parseBlueprint(xml);

			expect(result.entries[0].offset?.rotation).toEqual({
				pitch: 45.5,
				yaw: 90.25,
				roll: 180.75
			});
		});

		it("should parse entry with quaternion offset", () => {
			const xml = `<?xml version="1.0" encoding="utf-8"?>
<plans>
	<plan id="test_id" name="Test Plan">
		<entry index="0" macro="test_module_macro">
			<offset>
				<quaternion qx="0.1" qy="0.2" qz="0.3" qw="0.4"/>
			</offset>
		</entry>
	</plan>
</plans>`;

			const result = BlueprintParser.parseBlueprint(xml);

			expect(result.entries[0].offset?.quaternion).toEqual({
				qx: 0.1,
				qy: 0.2,
				qz: 0.3,
				qw: 0.4
			});
		});

		it("should parse entry with complete offset (position, rotation, quaternion)", () => {
			const xml = `<?xml version="1.0" encoding="utf-8"?>
<plans>
	<plan id="test_id" name="Test Plan">
		<entry index="0" macro="test_module_macro">
			<offset>
				<position x="100" y="200" z="300"/>
				<rotation pitch="45" yaw="90" roll="180"/>
				<quaternion qx="0.1" qy="0.2" qz="0.3" qw="0.4"/>
			</offset>
		</entry>
	</plan>
</plans>`;

			const result = BlueprintParser.parseBlueprint(xml);

			expect(result.entries[0].offset).toEqual({
				position: { x: 100, y: 200, z: 300 },
				rotation: { pitch: 45, yaw: 90, roll: 180 },
				quaternion: { qx: 0.1, qy: 0.2, qz: 0.3, qw: 0.4 }
			});
		});

		it("should parse entry with shield upgrades", () => {
			const xml = `<?xml version="1.0" encoding="utf-8"?>
<plans>
	<plan id="test_id" name="Test Plan">
		<entry index="0" macro="test_module_macro">
			<upgrades>
				<groups>
					<shields macro="shield_macro_1" group="group1"/>
					<shields macro="shield_macro_2" group="group2" exact="5"/>
				</groups>
			</upgrades>
		</entry>
	</plan>
</plans>`;

			const result = BlueprintParser.parseBlueprint(xml);

			expect(result.entries[0].upgrades?.groups?.shields).toEqual([
				{ macro: "shield_macro_1", group: "group1", exact: undefined },
				{ macro: "shield_macro_2", group: "group2", exact: 5 }
			]);
		});

		it("should parse entry with turret upgrades", () => {
			const xml = `<?xml version="1.0" encoding="utf-8"?>
<plans>
	<plan id="test_id" name="Test Plan">
		<entry index="0" macro="test_module_macro">
			<upgrades>
				<groups>
					<turrets macro="turret_macro_1" group="group1"/>
					<turrets macro="turret_macro_2" group="group2" exact="3"/>
				</groups>
			</upgrades>
		</entry>
	</plan>
</plans>`;

			const result = BlueprintParser.parseBlueprint(xml);

			expect(result.entries[0].upgrades?.groups?.turrets).toEqual([
				{ macro: "turret_macro_1", group: "group1", exact: undefined },
				{ macro: "turret_macro_2", group: "group2", exact: 3 }
			]);
		});

		it("should parse entry with both shield and turret upgrades", () => {
			const xml = `<?xml version="1.0" encoding="utf-8"?>
<plans>
	<plan id="test_id" name="Test Plan">
		<entry index="0" macro="test_module_macro">
			<upgrades>
				<groups>
					<shields macro="shield_macro" group="shield_group" exact="2"/>
					<turrets macro="turret_macro" group="turret_group" exact="1"/>
				</groups>
			</upgrades>
		</entry>
	</plan>
</plans>`;

			const result = BlueprintParser.parseBlueprint(xml);

			expect(result.entries[0].upgrades?.groups).toEqual({
				shields: [{ macro: "shield_macro", group: "shield_group", exact: 2 }],
				turrets: [{ macro: "turret_macro", group: "turret_group", exact: 1 }]
			});
		});

		it("should parse complex blueprint with multiple entries and all features", () => {
			const xml = `<?xml version="1.0" encoding="utf-8"?>
<plans>
	<plan id="complex_id" name="Complex Plan" description="A complex test plan">
		<patches>
			<patch extension="test_ext" version="1.0" name="Test Extension"/>
		</patches>
		<entry index="0" macro="base_module" connection="base_conn"/>
		<entry index="1" macro="connected_module" connection="conn_01">
			<predecessor index="0" connection="base_conn"/>
			<offset>
				<position x="100" y="0" z="0"/>
				<rotation yaw="90"/>
			</offset>
			<upgrades>
				<groups>
					<shields macro="mk3_shield" group="all" exact="4"/>
					<turrets macro="pulse_turret" group="main"/>
				</groups>
			</upgrades>
		</entry>
	</plan>
</plans>`;

			const result = BlueprintParser.parseBlueprint(xml);

			expect(result).toEqual({
				id: "complex_id",
				name: "Complex Plan",
				description: "A complex test plan",
				patches: [{ extension: "test_ext", version: "1.0", name: "Test Extension" }],
				entries: [
					{
						index: 0,
						macro: "base_module",
						connection: "base_conn"
					},
					{
						index: 1,
						macro: "connected_module",
						connection: "conn_01",
						predecessor: { index: 0, connection: "base_conn" },
						offset: {
							position: { x: 100, y: 0, z: 0 },
							rotation: { pitch: 0, yaw: 90, roll: 0 }
						},
						upgrades: {
							groups: {
								shields: [{ macro: "mk3_shield", group: "all", exact: 4 }],
								turrets: [{ macro: "pulse_turret", group: "main", exact: undefined }]
							}
						}
					}
				]
			});
		});

		it("should handle missing attributes gracefully", () => {
			const xml = `<?xml version="1.0" encoding="utf-8"?>
<plans>
	<plan>
		<entry macro="test_module"/>
	</plan>
</plans>`;

			const result = BlueprintParser.parseBlueprint(xml);

			expect(result).toEqual({
				id: "",
				name: "",
				description: undefined,
				patches: [],
				entries: [
					{
						index: 0,
						macro: "test_module",
						connection: undefined
					}
				]
			});
		});

		it("should handle empty blueprint", () => {
			const xml = `<?xml version="1.0" encoding="utf-8"?>
<plans>
	<plan id="empty" name="Empty Plan">
	</plan>
</plans>`;

			const result = BlueprintParser.parseBlueprint(xml);

			expect(result).toEqual({
				id: "empty",
				name: "Empty Plan",
				description: undefined,
				patches: [],
				entries: []
			});
		});

		it("should throw error for invalid XML without plan element", () => {
			const xml = `<?xml version="1.0" encoding="utf-8"?>
<invalid>
</invalid>`;

			expect(() => {
				BlueprintParser.parseBlueprint(xml);
			}).toThrow("Invalid blueprint: no plan element found");
		});

		it("should handle malformed XML gracefully", () => {
			const xml = `<?xml version="1.0" encoding="utf-8"?>
<plans>
	<plan id="test" name="Test">
		<entry index="abc" macro="test_module"/>
	</plan>
</plans>`;

			const result = BlueprintParser.parseBlueprint(xml);

			expect(result.entries[0].index).toBeNaN(); // parseInt("abc") returns NaN
		});
	});

	describe("blueprintToXml", () => {
		it("should convert basic blueprint to XML", () => {
			const blueprint: Blueprint = {
				id: "test_id",
				name: "Test Plan",
				description: undefined,
				patches: [],
				entries: [
					{
						index: 0,
						macro: "test_module_macro"
					}
				]
			};

			const result = BlueprintParser.blueprintToXml(blueprint);

			expect(result).toBe(`<?xml version="1.0" encoding="utf-8"?>
<plans>
	<plan id="test_id" name="Test Plan">
		<entry index="0" macro="test_module_macro"/>
	</plan>
</plans>`);
		});

		it("should include description when provided", () => {
			const blueprint: Blueprint = {
				id: "test_id",
				name: "Test Plan",
				description: "Test Description",
				patches: [],
				entries: []
			};

			const result = BlueprintParser.blueprintToXml(blueprint);

			expect(result).toContain('description="Test Description"');
		});

		it("should include patches when provided", () => {
			const blueprint: Blueprint = {
				id: "test_id",
				name: "Test Plan",
				patches: [
					{ extension: "ext1", version: "1.0", name: "Patch 1" },
					{ extension: "ext2", version: "2.0", name: "Patch 2" }
				],
				entries: []
			};

			const result = BlueprintParser.blueprintToXml(blueprint);

			expect(result).toContain("<patches>");
			expect(result).toContain('<patch extension="ext1" version="1.0" name="Patch 1"/>');
			expect(result).toContain('<patch extension="ext2" version="2.0" name="Patch 2"/>');
			expect(result).toContain("</patches>");
		});

		it("should handle entry with connection", () => {
			const blueprint: Blueprint = {
				id: "test_id",
				name: "Test Plan",
				patches: [],
				entries: [
					{
						index: 0,
						macro: "test_module_macro",
						connection: "connection_01"
					}
				]
			};

			const result = BlueprintParser.blueprintToXml(blueprint);

			expect(result).toContain('connection="connection_01"');
		});

		it("should handle entry with predecessor", () => {
			const blueprint: Blueprint = {
				id: "test_id",
				name: "Test Plan",
				patches: [],
				entries: [
					{
						index: 1,
						macro: "test_module_macro",
						predecessor: {
							index: 0,
							connection: "connection_01"
						}
					}
				]
			};

			const result = BlueprintParser.blueprintToXml(blueprint);

			expect(result).toContain('<predecessor index="0" connection="connection_01"/>');
		});

		it("should handle entry with position offset", () => {
			const blueprint: Blueprint = {
				id: "test_id",
				name: "Test Plan",
				patches: [],
				entries: [
					{
						index: 0,
						macro: "test_module_macro",
						offset: {
							position: { x: 100.5, y: 200.25, z: 300.75 }
						}
					}
				]
			};

			const result = BlueprintParser.blueprintToXml(blueprint);

			expect(result).toContain("<offset>");
			expect(result).toContain('<position x="100.5" y="200.25" z="300.75"/>');
			expect(result).toContain("</offset>");
		});

		it("should handle entry with rotation offset", () => {
			const blueprint: Blueprint = {
				id: "test_id",
				name: "Test Plan",
				patches: [],
				entries: [
					{
						index: 0,
						macro: "test_module_macro",
						offset: {
							rotation: { pitch: 45.5, yaw: 90.25, roll: 180.75 }
						}
					}
				]
			};

			const result = BlueprintParser.blueprintToXml(blueprint);

			expect(result).toContain("<offset>");
			expect(result).toContain('<rotation pitch="45.5" yaw="90.25" roll="180.75"/>');
			expect(result).toContain("</offset>");
		});

		it("should handle entry with quaternion offset", () => {
			const blueprint: Blueprint = {
				id: "test_id",
				name: "Test Plan",
				patches: [],
				entries: [
					{
						index: 0,
						macro: "test_module_macro",
						offset: {
							quaternion: { qx: 0.1, qy: 0.2, qz: 0.3, qw: 0.4 }
						}
					}
				]
			};

			const result = BlueprintParser.blueprintToXml(blueprint);

			expect(result).toContain("<offset>");
			expect(result).toContain('<quaternion qx="0.1" qy="0.2" qz="0.3" qw="0.4"/>');
			expect(result).toContain("</offset>");
		});

		it("should handle entry with upgrades", () => {
			const blueprint: Blueprint = {
				id: "test_id",
				name: "Test Plan",
				patches: [],
				entries: [
					{
						index: 0,
						macro: "test_module_macro",
						upgrades: {
							groups: {
								shields: [
									{ macro: "shield_macro_1", group: "group1" },
									{ macro: "shield_macro_2", group: "group2", exact: 5 }
								],
								turrets: [{ macro: "turret_macro", group: "turret_group", exact: 3 }]
							}
						}
					}
				]
			};

			const result = BlueprintParser.blueprintToXml(blueprint);

			expect(result).toContain("<upgrades>");
			expect(result).toContain("<groups>");
			expect(result).toContain('<shields macro="shield_macro_1" group="group1"/>');
			expect(result).toContain('<shields macro="shield_macro_2" group="group2" exact="5"/>');
			expect(result).toContain('<turrets macro="turret_macro" group="turret_group" exact="3"/>');
			expect(result).toContain("</groups>");
			expect(result).toContain("</upgrades>");
		});

		it("should handle complex blueprint with all features", () => {
			const blueprint: Blueprint = {
				id: "complex_id",
				name: "Complex Plan",
				description: "A complex test plan",
				patches: [{ extension: "test_ext", version: "1.0", name: "Test Extension" }],
				entries: [
					{
						index: 0,
						macro: "base_module",
						connection: "base_conn"
					},
					{
						index: 1,
						macro: "connected_module",
						connection: "conn_01",
						predecessor: { index: 0, connection: "base_conn" },
						offset: {
							position: { x: 100, y: 0, z: 0 },
							rotation: { pitch: 0, yaw: 90, roll: 0 }
						},
						upgrades: {
							groups: {
								shields: [{ macro: "mk3_shield", group: "all", exact: 4 }],
								turrets: [{ macro: "pulse_turret", group: "main" }]
							}
						}
					}
				]
			};

			const result = BlueprintParser.blueprintToXml(blueprint);

			// Verify the XML structure and content
			expect(result).toContain('id="complex_id"');
			expect(result).toContain('name="Complex Plan"');
			expect(result).toContain('description="A complex test plan"');
			expect(result).toContain('<patch extension="test_ext" version="1.0" name="Test Extension"/>');
			expect(result).toContain('<entry index="0" macro="base_module" connection="base_conn"/>');
			expect(result).toContain('<entry index="1" macro="connected_module" connection="conn_01">');
			expect(result).toContain('<predecessor index="0" connection="base_conn"/>');
			expect(result).toContain('<position x="100" y="0" z="0"/>');
			expect(result).toContain('<rotation pitch="0" yaw="90" roll="0"/>');
			expect(result).toContain('<shields macro="mk3_shield" group="all" exact="4"/>');
			expect(result).toContain('<turrets macro="pulse_turret" group="main"/>');
		});
	});

	describe("roundtrip conversion", () => {
		it("should maintain data integrity when parsing and converting back to XML", () => {
			const originalXml = `<?xml version="1.0" encoding="utf-8"?>
<plans>
	<plan id="roundtrip_test" name="Roundtrip Test" description="Testing roundtrip conversion">
		<patches>
			<patch extension="test_ext" version="1.0" name="Test Extension"/>
		</patches>
		<entry index="0" macro="base_module" connection="base_conn"/>
		<entry index="1" macro="connected_module" connection="conn_01">
			<predecessor index="0" connection="base_conn"/>
			<offset>
				<position x="100" y="200" z="300"/>
				<rotation pitch="45" yaw="90" roll="180"/>
				<quaternion qx="0.1" qy="0.2" qz="0.3" qw="0.4"/>
			</offset>
			<upgrades>
				<groups>
					<shields macro="mk3_shield" group="all" exact="4"/>
					<turrets macro="pulse_turret" group="main"/>
				</groups>
			</upgrades>
		</entry>
	</plan>
</plans>`;

			const parsed = BlueprintParser.parseBlueprint(originalXml);
			const converted = BlueprintParser.blueprintToXml(parsed);
			const reparsed = BlueprintParser.parseBlueprint(converted);

			expect(reparsed).toEqual(parsed);
		});
	});
});
