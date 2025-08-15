import { describe, it, expect } from "vitest";
import { classifyModule, getModulesByType, getAllModules } from "./moduleTypeClassifier";
import { ModuleType } from "../types/blueprint";

describe("ModuleTypeClassifier", () => {
	describe("classifyModule", () => {
		it("should classify known refined goods modules", () => {
			const result = classifyModule("prod_gen_energycells_macro");

			expect(result).toEqual({
				macro: "prod_gen_energycells_macro",
				type: ModuleType.RefinedGoods,
				displayName: "Energy Cell Production"
			});
		});

		it("should classify known high tech goods modules", () => {
			const result = classifyModule("prod_gen_advancedcomposites_macro");

			expect(result).toEqual({
				macro: "prod_gen_advancedcomposites_macro",
				type: ModuleType.HighTechGoods,
				displayName: "Advanced Composite Production"
			});
		});

		it("should classify known ship technology modules", () => {
			const result = classifyModule("prod_gen_advancedelectronics_macro");

			expect(result).toEqual({
				macro: "prod_gen_advancedelectronics_macro",
				type: ModuleType.ShipTechnology,
				displayName: "Advanced Electronics Production"
			});
		});

		it("should classify known recycling modules", () => {
			const result = classifyModule("proc_gen_scrapworks_macro");

			expect(result).toEqual({
				macro: "proc_gen_scrapworks_macro",
				type: ModuleType.Recycling,
				displayName: "Scrap Processor"
			});
		});

		it("should classify known agricultural goods L1 modules", () => {
			const result = classifyModule("prod_gen_spices_macro");

			expect(result).toEqual({
				macro: "prod_gen_spices_macro",
				type: ModuleType.AgriculturalGoodsL1,
				displayName: "Spice Production"
			});
		});

		it("should classify known agricultural goods L2 modules", () => {
			const result = classifyModule("prod_arg_foodrations_macro");

			expect(result).toEqual({
				macro: "prod_arg_foodrations_macro",
				type: ModuleType.AgriculturalGoodsL2,
				displayName: "Food Ration Production"
			});
		});

		it("should classify known pharmaceutical goods modules", () => {
			const result = classifyModule("prod_arg_medicalsupplies_macro");

			expect(result).toEqual({
				macro: "prod_arg_medicalsupplies_macro",
				type: ModuleType.PharmaceuticalGoods,
				displayName: "Argon Medical Supply Production"
			});
		});

		it("should classify known habitation modules", () => {
			const result = classifyModule("hab_arg_s_01_macro");

			expect(result).toEqual({
				macro: "hab_arg_s_01_macro",
				type: ModuleType.Habitation,
				displayName: "Argon S Habitat"
			});
		});

		it("should classify known dock area modules", () => {
			const result = classifyModule("dockarea_arg_m_station_01_macro");

			expect(result).toEqual({
				macro: "dockarea_arg_m_station_01_macro",
				type: ModuleType.DockArea,
				displayName: "1M6S Standard Dock Area"
			});
		});

		it("should classify known pier modules", () => {
			const result = classifyModule("pier_arg_harbor_01_macro");

			expect(result).toEqual({
				macro: "pier_arg_harbor_01_macro",
				type: ModuleType.Pier,
				displayName: "Argon 4-Dock T Pier"
			});
		});

		it("should classify known build modules", () => {
			const result = classifyModule("buildmodule_gen_ships_m_dockarea_01_macro");

			expect(result).toEqual({
				macro: "buildmodule_gen_ships_m_dockarea_01_macro",
				type: ModuleType.BuildModule,
				displayName: "S/M Ship Fabrication Bay"
			});
		});

		it("should classify known storage modules", () => {
			const result = classifyModule("storage_arg_s_container_01_macro");

			expect(result).toEqual({
				macro: "storage_arg_s_container_01_macro",
				type: ModuleType.Storage,
				displayName: "Argon S Container Storage"
			});
		});

		it("should classify known defense modules", () => {
			const result = classifyModule("defence_arg_claim_01_macro");

			expect(result).toEqual({
				macro: "defence_arg_claim_01_macro",
				type: ModuleType.Defense,
				displayName: "Argon Administrative Centre"
			});
		});

		it("should classify known connection modules", () => {
			const result = classifyModule("struct_arg_base_01_macro");

			expect(result).toEqual({
				macro: "struct_arg_base_01_macro",
				type: ModuleType.Connection,
				displayName: "Argon Base Connection Structure 01"
			});
		});

		it("should classify known other modules", () => {
			const result = classifyModule("welfare_gen_casino_01_macro");

			expect(result).toEqual({
				macro: "welfare_gen_casino_01_macro",
				type: ModuleType.Other,
				displayName: "Casino"
			});
		});

		it("should classify unknown modules as Other with raw macro name", () => {
			const result = classifyModule("unknown_custom_module_macro");

			expect(result).toEqual({
				macro: "unknown_custom_module_macro",
				type: ModuleType.Other,
				displayName: "unknown_custom_module_macro"
			});
		});

		it("should handle empty macro string", () => {
			const result = classifyModule("");

			expect(result).toEqual({
				macro: "",
				type: ModuleType.Other,
				displayName: ""
			});
		});

		it("should handle null-like macro strings", () => {
			const result1 = classifyModule("null");
			const result2 = classifyModule("undefined");

			expect(result1.type).toBe(ModuleType.Other);
			expect(result2.type).toBe(ModuleType.Other);
		});
	});

	describe("getModulesByType", () => {
		it("should group modules by their types", () => {
			const macros = [
				"prod_gen_energycells_macro", // RefinedGoods
				"prod_gen_advancedcomposites_macro", // HighTechGoods
				"hab_arg_s_01_macro", // Habitation
				"unknown_module_macro" // Other
			];

			const result = getModulesByType(macros);

			expect(result[ModuleType.RefinedGoods]).toHaveLength(1);
			expect(result[ModuleType.RefinedGoods][0]).toEqual({
				macro: "prod_gen_energycells_macro",
				type: ModuleType.RefinedGoods,
				displayName: "Energy Cell Production"
			});

			expect(result[ModuleType.HighTechGoods]).toHaveLength(1);
			expect(result[ModuleType.HighTechGoods][0]).toEqual({
				macro: "prod_gen_advancedcomposites_macro",
				type: ModuleType.HighTechGoods,
				displayName: "Advanced Composite Production"
			});

			expect(result[ModuleType.Habitation]).toHaveLength(1);
			expect(result[ModuleType.Habitation][0]).toEqual({
				macro: "hab_arg_s_01_macro",
				type: ModuleType.Habitation,
				displayName: "Argon S Habitat"
			});

			expect(result[ModuleType.Other]).toHaveLength(1);
			expect(result[ModuleType.Other][0]).toEqual({
				macro: "unknown_module_macro",
				type: ModuleType.Other,
				displayName: "unknown_module_macro"
			});

			// Check that other categories are empty
			expect(result[ModuleType.ShipTechnology]).toHaveLength(0);
			expect(result[ModuleType.Recycling]).toHaveLength(0);
			expect(result[ModuleType.AgriculturalGoodsL1]).toHaveLength(0);
			expect(result[ModuleType.AgriculturalGoodsL2]).toHaveLength(0);
			expect(result[ModuleType.PharmaceuticalGoods]).toHaveLength(0);
			expect(result[ModuleType.DockArea]).toHaveLength(0);
			expect(result[ModuleType.Pier]).toHaveLength(0);
			expect(result[ModuleType.BuildModule]).toHaveLength(0);
			expect(result[ModuleType.Storage]).toHaveLength(0);
			expect(result[ModuleType.Defense]).toHaveLength(0);
			expect(result[ModuleType.Connection]).toHaveLength(0);
		});

		it("should handle empty macro array", () => {
			const result = getModulesByType([]);

			Object.values(result).forEach(typeGroup => {
				expect(typeGroup).toHaveLength(0);
			});
		});

		it("should remove duplicate macros", () => {
			const macros = [
				"prod_gen_energycells_macro",
				"prod_gen_energycells_macro", // Duplicate
				"hab_arg_s_01_macro"
			];

			const result = getModulesByType(macros);

			expect(result[ModuleType.RefinedGoods]).toHaveLength(1);
			expect(result[ModuleType.Habitation]).toHaveLength(1);
		});

		it("should handle mixed known and unknown modules", () => {
			const macros = [
				"prod_gen_energycells_macro", // Known
				"unknown_module_1", // Unknown
				"hab_arg_s_01_macro", // Known
				"unknown_module_2" // Unknown
			];

			const result = getModulesByType(macros);

			expect(result[ModuleType.RefinedGoods]).toHaveLength(1);
			expect(result[ModuleType.Habitation]).toHaveLength(1);
			expect(result[ModuleType.Other]).toHaveLength(2);
		});

		it("should maintain the structure for all module types", () => {
			const result = getModulesByType(["prod_gen_energycells_macro"]);

			// Verify all module types are present in the result
			const expectedTypes = Object.values(ModuleType);
			expectedTypes.forEach(type => {
				expect(result).toHaveProperty(type);
				expect(Array.isArray(result[type])).toBe(true);
			});
		});
	});

	describe("getAllModules", () => {
		it("should return all modules grouped by type", () => {
			const result = getAllModules();

			// Verify structure
			Object.values(ModuleType).forEach(type => {
				expect(result).toHaveProperty(type);
				expect(Array.isArray(result[type])).toBe(true);
			});

			// Check that we have modules in various categories
			expect(result[ModuleType.RefinedGoods].length).toBeGreaterThan(0);
			expect(result[ModuleType.HighTechGoods].length).toBeGreaterThan(0);
			expect(result[ModuleType.ShipTechnology].length).toBeGreaterThan(0);
			expect(result[ModuleType.Habitation].length).toBeGreaterThan(0);
			expect(result[ModuleType.Storage].length).toBeGreaterThan(0);
			expect(result[ModuleType.Other].length).toBeGreaterThan(0);
		});

		it("should contain expected sample modules", () => {
			const result = getAllModules();

			// Check for specific modules across different categories
			const energyCellModule = result[ModuleType.RefinedGoods].find(
				m => m.macro === "prod_gen_energycells_macro"
			);
			expect(energyCellModule).toBeDefined();
			expect(energyCellModule?.displayName).toBe("Energy Cell Production");

			const habitatModule = result[ModuleType.Habitation].find(m => m.macro === "hab_arg_s_01_macro");
			expect(habitatModule).toBeDefined();
			expect(habitatModule?.displayName).toBe("Argon S Habitat");

			const casinoModule = result[ModuleType.Other].find(
				m => m.macro === "welfare_gen_casino_01_macro"
			);
			expect(casinoModule).toBeDefined();
			expect(casinoModule?.displayName).toBe("Casino");
		});

		it("should not contain duplicates", () => {
			const result = getAllModules();

			Object.values(result).forEach(modules => {
				const macros = modules.map(m => m.macro);
				const uniqueMacros = new Set(macros);
				expect(macros.length).toBe(uniqueMacros.size);
			});
		});

		it("should have consistent module structure", () => {
			const result = getAllModules();

			Object.values(result).forEach(modules => {
				modules.forEach(module => {
					expect(module).toHaveProperty("macro");
					expect(module).toHaveProperty("type");
					expect(module).toHaveProperty("displayName");

					expect(typeof module.macro).toBe("string");
					expect(typeof module.type).toBe("string");
					expect(typeof module.displayName).toBe("string");

					expect(module.macro).toBeTruthy();
					expect(module.type).toBeTruthy();
					expect(module.displayName).toBeTruthy();
				});
			});
		});

		it("should classify all modules correctly", () => {
			const result = getAllModules();

			// Verify that modules are in the correct categories
			Object.entries(result).forEach(([type, modules]) => {
				modules.forEach(module => {
					expect(module.type).toBe(type);
				});
			});
		});
	});

	describe("module dictionary consistency", () => {
		it("should have consistent naming patterns for faction modules", () => {
			const result = getAllModules();

			// Test that Argon modules generally have "Argon" in their display names
			const argonHabitats = result[ModuleType.Habitation].filter(m => m.macro.startsWith("hab_arg_"));
			argonHabitats.forEach(module => {
				expect(module.displayName.toLowerCase()).toMatch(/argon/);
			});

			// Test that Teladi modules generally have "Teladi" in their display names
			const teladiHabitats = result[ModuleType.Habitation].filter(m => m.macro.startsWith("hab_tel_"));
			teladiHabitats.forEach(module => {
				expect(module.displayName.toLowerCase()).toMatch(/teladi/);
			});
		});

		it("should have production modules in appropriate categories", () => {
			const result = getAllModules();

			// All energy cell production should be refined goods
			const energyModules = Object.values(result)
				.flat()
				.filter(m => m.displayName.toLowerCase().includes("energy cell"));
			energyModules.forEach(module => {
				expect(module.type).toBe(ModuleType.RefinedGoods);
			});

			// All ship fabrication bays should be build modules
			const shipFabModules = Object.values(result)
				.flat()
				.filter(m => m.displayName.toLowerCase().includes("ship fabrication"));
			shipFabModules.forEach(module => {
				expect(module.type).toBe(ModuleType.BuildModule);
			});
		});

		it("should have storage modules with consistent naming", () => {
			const result = getAllModules();

			const storageModules = result[ModuleType.Storage];
			const containerStorageModules = storageModules.filter(m =>
				m.displayName.toLowerCase().includes("container storage")
			);

			// Should have container storage for each faction and size
			expect(containerStorageModules.length).toBeGreaterThan(10);

			// Each should have the word "Storage" in the name
			containerStorageModules.forEach(module => {
				expect(module.displayName.toLowerCase()).toMatch(/storage/);
			});
		});

		it("should classify defense platforms correctly", () => {
			const result = getAllModules();

			const defensePlatforms = result[ModuleType.Defense].filter(m =>
				m.displayName.toLowerCase().includes("defense platform")
			);

			// Should have defense platforms for multiple factions
			expect(defensePlatforms.length).toBeGreaterThan(5);

			defensePlatforms.forEach(module => {
				expect(module.displayName.toLowerCase()).toMatch(/defense platform/);
			});
		});
	});
});
