import { ModuleType, ModuleInfo } from "../types/blueprint";

interface ModuleDefinition {
	displayName: string;
	type: ModuleType;
}

export class ModuleTypeClassifier {
	private static readonly MODULE_DICTIONARY: Record<string, ModuleDefinition> = {
		// ---- Refined Goods ----
		"prod_gen_energycells_macro": { displayName: "Energy Cell Production", type: ModuleType.RefinedGoods },
		"prod_ter_energycells_macro": { displayName: "Terran Energy Cell Production", type: ModuleType.RefinedGoods },
		"prod_gen_antimattercells_macro": { displayName: "Antimatter Cell Production", type: ModuleType.RefinedGoods },
		"prod_gen_graphene_macro": { displayName: "Graphene Production", type: ModuleType.RefinedGoods },
		"prod_gen_refinedmetals_macro": { displayName: "Refined Metal Production", type: ModuleType.RefinedGoods },
		"prod_gen_siliconwafers_macro": { displayName: "Silicon Wafer Production", type: ModuleType.RefinedGoods },
		"prod_gen_superfluidcoolant_macro": { displayName: "Superfluid Coolant Production", type: ModuleType.RefinedGoods },
		"prod_tel_teladianium_macro": { displayName: "Teladianium Production", type: ModuleType.RefinedGoods },
		"prod_bor_bogas_macro": { displayName: "BoGas Production", type: ModuleType.RefinedGoods },
		// ---- High Tech Goods ----
		"prod_gen_advancedcomposites_macro": { displayName: "Advanced Composite Production", type: ModuleType.HighTechGoods },
		"prod_tel_advancedcomposites_macro": { displayName: "Teladi Advanced Composite Production", type: ModuleType.HighTechGoods },
		"prod_gen_engineparts_macro": { displayName: "Engine Part Production", type: ModuleType.HighTechGoods },
		"prod_tel_engineparts_macro": { displayName: "Teladi Engine Part Production", type: ModuleType.HighTechGoods },
		"prod_gen_hullparts_macro": { displayName: "Hull Part Production", type: ModuleType.HighTechGoods },
		"prod_tel_hullparts_macro": { displayName: "Teladi Hull Part Production", type: ModuleType.HighTechGoods },
		"prod_gen_microchips_macro": { displayName: "Microchip Production", type: ModuleType.HighTechGoods },
		"prod_gen_plasmaconductors_macro": { displayName: "Plasma Conductor Production", type: ModuleType.HighTechGoods },
		"prod_gen_quantumtubes_macro": { displayName: "Quantum Tube Production", type: ModuleType.HighTechGoods },
		"prod_gen_scanningarrays_macro": { displayName: "Scanning Array Production", type: ModuleType.HighTechGoods },
		"prod_tel_scanningarrays_macro": { displayName: "Teladi Scanning Array Production", type: ModuleType.HighTechGoods },
		"prod_ter_computronicsubstrate_macro": { displayName: "Computronic Substrate Production", type: ModuleType.HighTechGoods },
		"prod_ter_metallicmicrolattice_macro": { displayName: "Metallic Microlattice Production", type: ModuleType.HighTechGoods },
		"prod_ter_siliconcarbide_macro": { displayName: "Silicon Carbide Production", type: ModuleType.HighTechGoods },
		// ---- Ship Technology ----
		"prod_gen_advancedelectronics_macro": { displayName: "Advanced Electronics Production", type: ModuleType.ShipTechnology }, // The literal only plural one in game?
		"prod_gen_antimatterconverters_macro": { displayName: "Antimatter Converter Production", type: ModuleType.ShipTechnology },
		"prod_gen_claytronics_macro": { displayName: "Claytronics Production", type: ModuleType.ShipTechnology },
		"prod_gen_dronecomponents_macro": { displayName: "Drone Component Production", type: ModuleType.ShipTechnology },
		"prod_gen_fieldcoils_macro": { displayName: "Field Coil Production", type: ModuleType.ShipTechnology },
		"prod_gen_missilecomponents_macro": { displayName: "Missile Component Production", type: ModuleType.ShipTechnology },
		"prod_gen_shieldcomponents_macro": { displayName: "Shield Component Production", type: ModuleType.ShipTechnology },
		"prod_gen_smartchips_macro": { displayName: "Smart Chip Production", type: ModuleType.ShipTechnology },
		"prod_gen_turretcomponents_macro": { displayName: "Turret Component Production", type: ModuleType.ShipTechnology },
		"prod_gen_weaponcomponents_macro": { displayName: "Weapon Component Production", type: ModuleType.ShipTechnology },
		// ---- Recycling ----
		"proc_gen_scrapworks_macro": { displayName: "Scrap Processor", type: ModuleType.Recycling },
		"prod_gen_scrap_recycler_macro": { displayName: "Scrap Recycler", type: ModuleType.Recycling },
		"prod_ter_scrap_recycler_macro": { displayName: "Terran Scrap Recycler", type: ModuleType.Recycling },
		// ---- Agricultural Goods L1 ----
		"prod_gen_spices_macro": { displayName: "Spice Production", type: ModuleType.AgriculturalGoodsL1 },
		"prod_gen_water_macro": { displayName: "Water Productio", type: ModuleType.AgriculturalGoodsL1 },
		"prod_arg_meat_macro": { displayName: "Meat Production", type: ModuleType.AgriculturalGoodsL1 },
		"prod_arg_wheat_macro": { displayName: "Wheat Production", type: ModuleType.AgriculturalGoodsL1 },
		"prod_bor_plankton_macro": { displayName: "Plankton Production", type: ModuleType.AgriculturalGoodsL1 },
		"prod_par_majasnails_macro": { displayName: "Maja Snail Production", type: ModuleType.AgriculturalGoodsL1 },
		"prod_par_sojabeans_macro": { displayName: "Soja Bean Production", type: ModuleType.AgriculturalGoodsL1 },
		"prod_spl_cheltmeat_macro": { displayName: "Chelt Meat Production", type: ModuleType.AgriculturalGoodsL1 },
		"prod_spl_scruffinfruit_macro": { displayName: "Scruffin Fruit Production", type: ModuleType.AgriculturalGoodsL1 },
		"prod_tel_sunriseflowers_macro": { displayName: "Sunrise Flower Production", type: ModuleType.AgriculturalGoodsL1 },
		"prod_tel_swampplant_macro": { displayName: "Swamp Plant Production", type: ModuleType.AgriculturalGoodsL1 },
		"prod_ter_proteinpaste_macro": { displayName: "Protein Paste Production", type: ModuleType.AgriculturalGoodsL1 },
		// ---- Agricultural Goods L2 ----
		"prod_arg_foodrations_macro": { displayName: "Food Ration Production", type: ModuleType.AgriculturalGoodsL2 },
		"prod_bor_bofu_macro": { displayName: "BoFu Production", type: ModuleType.AgriculturalGoodsL2 },
		"prod_par_sojahusk_macro": { displayName: "Soja Husk Production", type: ModuleType.AgriculturalGoodsL2 },
		"prod_tel_nostropoil_macro": { displayName: "Nostop Oil Production", type: ModuleType.AgriculturalGoodsL2 },
		"prod_ter_mre_macro": { displayName: "Terran MRE Production", type: ModuleType.AgriculturalGoodsL2 },
		// ---- Pharmaceutical Goods ----
		"prod_arg_medicalsupplies_macro": { displayName: "Argon Medical Supply Production", type: ModuleType.PharmaceuticalGoods },
		"prod_bor_medicalsupplies_macro": { displayName: "Boron Medical Supply Production", type: ModuleType.PharmaceuticalGoods },
		"prod_par_medicalsupplies_macro": { displayName: "Paranid Medical Supply Production", type: ModuleType.PharmaceuticalGoods },
		"prod_spl_medicalsupplies_macro": { displayName: "Split Medical Supply Production", type: ModuleType.PharmaceuticalGoods },
		"prod_tel_medicalsupplies_macro": { displayName: "Teladi Medical Supply Production", type: ModuleType.PharmaceuticalGoods },
		"prod_ter_medicalsupplies_macro": { displayName: "Terran Medical Supply Production", type: ModuleType.PharmaceuticalGoods },
		"prod_arg_spacefuel_macro": { displayName: "Spacefuel Production", type: ModuleType.PharmaceuticalGoods },
		"prod_par_majadust_macro": { displayName: "Majadust Production", type: ModuleType.PharmaceuticalGoods },
		"prod_tel_spaceweed_macro": { displayName: "Spaceweed Production", type: ModuleType.PharmaceuticalGoods },
		"prod_ter_stimulants_macro": { displayName: "Stimulants Production", type: ModuleType.PharmaceuticalGoods },
		// ---- Habitation ----
		// ARG
		"hab_arg_s_01_macro": { displayName: "Argon S Habitat", type: ModuleType.Habitation },
		"hab_arg_m_01_macro": { displayName: "Argon M Habitat", type: ModuleType.Habitation },
		"hab_arg_l_01_macro": { displayName: "Argon L Habitat", type: ModuleType.Habitation },
		"hab_pir_s_01_macro": { displayName: "Argon S Dormitory", type: ModuleType.Habitation },
		"hab_pir_m_01_macro": { displayName: "Argon M Dormitory", type: ModuleType.Habitation },
		"hab_pir_l_01_macro": { displayName: "Argon L Dormitory", type: ModuleType.Habitation },
		"landmarks_arg_antigonepillar_01_macro": { displayName: "Argon L Housing Spire", type: ModuleType.Habitation },
		"landmarks_arg_antigonespire_01_macro": { displayName: "Argon XL Housing Spire", type: ModuleType.Habitation },
		// BOR
		"hab_bor_s_01_macro": { displayName: "Boron S Oasis", type: ModuleType.Habitation },
		"hab_bor_m_01_macro": { displayName: "Boron M Oasis", type: ModuleType.Habitation },
		"hab_bor_l_01_macro": { displayName: "Boron L Oasis", type: ModuleType.Habitation },
		// PAR
		"hab_par_s_01_macro": { displayName: "Paranid S Dome", type: ModuleType.Habitation },
		"hab_par_m_01_macro": { displayName: "Paranid M Dome", type: ModuleType.Habitation },
		"hab_par_l_01_macro": { displayName: "Paranid L Dome", type: ModuleType.Habitation },
		// SPL
		"hab_spl_s_01_macro": { displayName: "Split S Parlour", type: ModuleType.Habitation },
		"hab_spl_m_01_macro": { displayName: "Split M Parlour", type: ModuleType.Habitation },
		"hab_spl_l_01_macro": { displayName: "Split L Parlour", type: ModuleType.Habitation },
		// TEL
		"hab_tel_s_01_macro": { displayName: "Teladi S Biome", type: ModuleType.Habitation },
		"hab_tel_m_01_macro": { displayName: "Teladi M Biome", type: ModuleType.Habitation },
		"hab_tel_l_01_macro": { displayName: "Teladi L Biome", type: ModuleType.Habitation },
		// TER
		"hab_ter_s_01_macro": { displayName: "Terran S Living Quarters", type: ModuleType.Habitation },
		"hab_ter_m_01_macro": { displayName: "Terran M Living Quarters", type: ModuleType.Habitation },
		"hab_ter_l_01_macro": { displayName: "Terran L Living Quarters", type: ModuleType.Habitation },
		// ---- Dock Area ----
		"dockarea_arg_m_station_01_macro": { displayName: "1M6S Standard Dock Area", type: ModuleType.DockArea }, // Name isn't argon
		"dockarea_arg_m_station_01_lowtech_macro": { displayName: "1M6S Basic Dock Area", type: ModuleType.DockArea },
		"dockarea_arg_m_station_01_hightech_macro": { displayName: "1M6S Luxury Dock Area", type: ModuleType.DockArea },
		"dockarea_arg_m_station_02_macro": { displayName: "3M6S Standard Dock Area", type: ModuleType.DockArea },
		"dockarea_arg_m_station_02_lowtech_macro": { displayName: "3M6S Basic Dock Area", type: ModuleType.DockArea },
		"dockarea_arg_m_station_02_hightech_macro": { displayName: "3M6S Luxury Dock Area", type: ModuleType.DockArea },
		"dockarea_arg_m_02_tradestation_01_macro": { displayName: "8M Luxury Dock Area", type: ModuleType.DockArea },
		"dockarea_bor_m_station_01_standard_macro": { displayName: "Boron 4M14S Luxury Dock Area", type: ModuleType.DockArea },
		"dockarea_ter_m_station_01_hightech_macro": { displayName: "Terran 4M10S Luxury Dock Area", type: ModuleType.DockArea },
		// ---- Pier ----
		// ARG
		"pier_arg_harbor_01_macro": { displayName: "Argon 4-Dock T Pier", type: ModuleType.Pier },
		"pier_arg_harbor_02_macro": { displayName: "Argon 1-Dock Pier", type: ModuleType.Pier },
		"pier_arg_harbor_03_macro": { displayName: "Argon 3-Dock E Pier", type: ModuleType.Pier },
		"pier_arg_harbor_04_macro": { displayName: "Argon 1-Dock Short Pier", type: ModuleType.Pier },
		// BOR
		"pier_bor_harbor_01_macro": { displayName: "Boron 4-Dock T Pier", type: ModuleType.Pier },
		"pier_bor_harbor_02_macro": { displayName: "Boron 1-Dock Pier", type: ModuleType.Pier },
		"pier_bor_harbor_03_macro": { displayName: "Boron 3-Dock E Pier", type: ModuleType.Pier },
		"pier_bor_harbor_04_macro": { displayName: "Boron Trading Station 4-Dock Pier", type: ModuleType.Pier },
		"pier_bor_tradestation_01_macro": { displayName: "Boron Trading Station Hexa-Dock Pier", type: ModuleType.Pier },
		// PAR
		"pier_par_harbor_01_macro": { displayName: "Paranid 3-Dock T Pier", type: ModuleType.Pier },
		"pier_par_harbor_02_macro": { displayName: "Paranid 1-Dock Pier", type: ModuleType.Pier },
		"pier_par_harbor_03_macro": { displayName: "Paranid 3-Dock E Pier", type: ModuleType.Pier },
		// SPL
		"pier_spl_harbor_01_macro": { displayName: "Split 4-Dock T Pier", type: ModuleType.Pier },
		"pier_spl_harbor_02_macro": { displayName: "Split 1-Dock Pier", type: ModuleType.Pier },
		"pier_spl_harbor_03_macro": { displayName: "Split 3-Dock E Pier", type: ModuleType.Pier },
		// TEL
		"pier_tel_harbor_01_macro": { displayName: "Teladi 3-Dock T Pier", type: ModuleType.Pier },
		"pier_tel_harbor_02_macro": { displayName: "Teladi 1-Dock Pier", type: ModuleType.Pier },
		"pier_tel_harbor_03_macro": { displayName: "Teladi 3-Dock E Pier", type: ModuleType.Pier },
		// TER
		"pier_ter_harbor_01_macro": { displayName: "Terran 3-Dock E Pier", type: ModuleType.Pier },
		"pier_ter_harbor_02_macro": { displayName: "Terran 1-Dock Pier", type: ModuleType.Pier },
		"pier_ter_harbor_03_macro": { displayName: "Terran 3-Dock T Pier", type: ModuleType.Pier },
		"pier_ter_harbor_04_macro": { displayName: "Terran 4-Dock T Pier", type: ModuleType.Pier },
		"pier_ter_tradestation_01_macro": { displayName: "Terran Trading Station Hexa-Dock Pier", type: ModuleType.Pier },
		// ---- Build Module ----
		// GEN
		"buildmodule_gen_ships_m_dockarea_01_macro": { displayName: "S/M Ship Fabrication Bay", type: ModuleType.BuildModule },
		"buildmodule_gen_ships_l_macro": { displayName: "L Ship Fabrication Bay", type: ModuleType.BuildModule },
		"buildmodule_gen_ships_xl_macro": { displayName: "XL Ship Fabrication Bay", type: ModuleType.BuildModule },
		"buildmodule_gen_equip_m_dockarea_01_macro": { displayName: "S/M Ship Maintenance Bay", type: ModuleType.BuildModule },
		"buildmodule_gen_equip_l_macro": { displayName: "L Ship Maintenance Bay", type: ModuleType.BuildModule },
		"buildmodule_gen_equip_xl_macro": { displayName: "XL Ship Maintenance Bay", type: ModuleType.BuildModule },
		// BOR
		"buildmodule_bor_ships_m_dockarea_01_macro": { displayName: "Boron S/M Ship Fabrication Bay", type: ModuleType.BuildModule },
		"buildmodule_bor_ships_l_macro": { displayName: "Boron L Ship Fabrication Bay", type: ModuleType.BuildModule },
		"buildmodule_bor_ships_xl_macro": { displayName: "Boron XL Ship Fabrication Bay", type: ModuleType.BuildModule },
		"buildmodule_bor_equip_m_dockarea_01_macro": { displayName: "Boron S/M Ship Maintenance Bay", type: ModuleType.BuildModule },
		"buildmodule_bor_equip_l_macro": { displayName: "Boron L Ship Maintenance Bay", type: ModuleType.BuildModule },
		"buildmodule_bor_equip_xl_macro": { displayName: "Boron XL Ship Maintenance Bay", type: ModuleType.BuildModule },
		// TER
		"buildmodule_ter_ships_m_dockarea_01_macro": { displayName: "Terran S/M Ship Fabrication Bay", type: ModuleType.BuildModule },
		"buildmodule_ter_ships_l_macro": { displayName: "Terran L Ship Fabrication Bay", type: ModuleType.BuildModule },
		"buildmodule_ter_ships_xl_macro": { displayName: "Terran XL Ship Fabrication Bay", type: ModuleType.BuildModule },
		"buildmodule_ter_equip_m_dockarea_01_macro": { displayName: "Terran S/M Ship Maintenance Bay", type: ModuleType.BuildModule },
		"buildmodule_ter_equip_l_macro": { displayName: "Terran L Ship Maintenance Bay", type: ModuleType.BuildModule },
		"buildmodule_ter_equip_xl_macro": { displayName: "Terran XL Ship Maintenance Bay", type: ModuleType.BuildModule },
		// ---- Storage ----
		"storage_pir_l_condensate_01_macro": { displayName: "Protectyon Shield Generator", type: ModuleType.Storage },
		// ARG
		"storage_arg_s_container_01_macro": { displayName: "Argon S Container Storage", type: ModuleType.Storage },
		"storage_arg_m_container_01_macro": { displayName: "Argon M Container Storage", type: ModuleType.Storage },
		"storage_arg_l_container_01_macro": { displayName: "Argon L Container Storage", type: ModuleType.Storage },
		"storage_arg_s_solid_01_macro": { displayName: "Argon S Solid Storage", type: ModuleType.Storage },
		"storage_arg_m_solid_01_macro": { displayName: "Argon M Solid Storage", type: ModuleType.Storage },
		"storage_arg_l_solid_01_macro": { displayName: "Argon L Solid Storage", type: ModuleType.Storage },
		"storage_arg_s_liquid_01_macro": { displayName: "Argon S Liquid Storage", type: ModuleType.Storage },
		"storage_arg_m_liquid_01_macro": { displayName: "Argon M Liquid Storage", type: ModuleType.Storage },
		"storage_arg_l_liquid_01_macro": { displayName: "Argon L Liquid Storage", type: ModuleType.Storage },
		// BOR
		"storage_bor_s_container_01_macro": { displayName: "Boron S Container Storage", type: ModuleType.Storage },
		"storage_bor_m_container_01_macro": { displayName: "Boron M Container Storage", type: ModuleType.Storage },
		"storage_bor_l_container_01_macro": { displayName: "Boron L Container Storage", type: ModuleType.Storage },
		"storage_bor_s_solid_01_macro": { displayName: "Boron S Solid Storage", type: ModuleType.Storage },
		"storage_bor_m_solid_01_macro": { displayName: "Boron M Solid Storage", type: ModuleType.Storage },
		"storage_bor_l_solid_01_macro": { displayName: "Boron L Solid Storage", type: ModuleType.Storage },
		"storage_bor_s_liquid_01_macro": { displayName: "Boron S Liquid Storage", type: ModuleType.Storage },
		"storage_bor_m_liquid_01_macro": { displayName: "Boron M Liquid Storage", type: ModuleType.Storage },
		"storage_bor_l_liquid_01_macro": { displayName: "Boron L Liquid Storage", type: ModuleType.Storage },
		// PAR
		"storage_par_s_container_01_macro": { displayName: "Paranid S Container Storage", type: ModuleType.Storage },
		"storage_par_m_container_01_macro": { displayName: "Paranid M Container Storage", type: ModuleType.Storage },
		"storage_par_l_container_01_macro": { displayName: "Paranid L Container Storage", type: ModuleType.Storage },
		"storage_par_s_solid_01_macro": { displayName: "Paranid S Solid Storage", type: ModuleType.Storage },
		"storage_par_m_solid_01_macro": { displayName: "Paranid M Solid Storage", type: ModuleType.Storage },
		"storage_par_l_solid_01_macro": { displayName: "Paranid L Solid Storage", type: ModuleType.Storage },
		"storage_par_s_liquid_01_macro": { displayName: "Paranid S Liquid Storage", type: ModuleType.Storage },
		"storage_par_m_liquid_01_macro": { displayName: "Paranid M Liquid Storage", type: ModuleType.Storage },
		"storage_par_l_liquid_01_macro": { displayName: "Paranid L Liquid Storage", type: ModuleType.Storage },
		// SPL
		"storage_spl_s_container_01_macro": { displayName: "Split S Container Storage", type: ModuleType.Storage },
		"storage_spl_m_container_01_macro": { displayName: "Split M Container Storage", type: ModuleType.Storage },
		"storage_spl_l_container_01_macro": { displayName: "Split L Container Storage", type: ModuleType.Storage },
		"storage_spl_s_solid_01_macro": { displayName: "Split S Solid Storage", type: ModuleType.Storage },
		"storage_spl_m_solid_01_macro": { displayName: "Split M Solid Storage", type: ModuleType.Storage },
		"storage_spl_l_solid_01_macro": { displayName: "Split L Solid Storage", type: ModuleType.Storage },
		"storage_spl_s_liquid_01_macro": { displayName: "Split S Liquid Storage", type: ModuleType.Storage },
		"storage_spl_m_liquid_01_macro": { displayName: "Split M Liquid Storage", type: ModuleType.Storage },
		"storage_spl_l_liquid_01_macro": { displayName: "Split L Liquid Storage", type: ModuleType.Storage },
		// TEL
		"storage_tel_s_container_01_macro": { displayName: "Teladi S Container Storage", type: ModuleType.Storage },
		"storage_tel_m_container_01_macro": { displayName: "Teladi M Container Storage", type: ModuleType.Storage },
		"storage_tel_l_container_01_macro": { displayName: "Teladi L Container Storage", type: ModuleType.Storage },
		"storage_tel_s_solid_01_macro": { displayName: "Teladi S Solid Storage", type: ModuleType.Storage },
		"storage_tel_m_solid_01_macro": { displayName: "Teladi M Solid Storage", type: ModuleType.Storage },
		"storage_tel_l_solid_01_macro": { displayName: "Teladi L Solid Storage", type: ModuleType.Storage },
		"storage_tel_s_liquid_01_macro": { displayName: "Teladi S Liquid Storage", type: ModuleType.Storage },
		"storage_tel_m_liquid_01_macro": { displayName: "Teladi M Liquid Storage", type: ModuleType.Storage },
		"storage_tel_l_liquid_01_macro": { displayName: "Teladi L Liquid Storage", type: ModuleType.Storage },
		// TER
		"storage_ter_s_container_01_macro": { displayName: "Terran S Container Storage", type: ModuleType.Storage },
		"storage_ter_m_container_01_macro": { displayName: "Terran M Container Storage", type: ModuleType.Storage },
		"storage_ter_l_container_01_macro": { displayName: "Terran L Container Storage", type: ModuleType.Storage },
		"storage_ter_s_solid_01_macro": { displayName: "Terran S Solid Storage", type: ModuleType.Storage },
		"storage_ter_m_solid_01_macro": { displayName: "Terran M Solid Storage", type: ModuleType.Storage },
		"storage_ter_l_solid_01_macro": { displayName: "Terran L Solid Storage", type: ModuleType.Storage },
		"storage_ter_s_liquid_01_macro": { displayName: "Terran S Liquid Storage", type: ModuleType.Storage },
		"storage_ter_m_liquid_01_macro": { displayName: "Terran M Liquid Storage", type: ModuleType.Storage },
		"storage_ter_l_liquid_01_macro": { displayName: "Terran L Liquid Storage", type: ModuleType.Storage },
		// ---- Defense ----
		// ARG
		"defence_arg_claim_01_macro": { displayName: "Argon Administrative Centre", type: ModuleType.Defense },
		"defence_arg_disc_01_macro": { displayName: "Argon Disc Defense Platform", type: ModuleType.Defense },
		"defence_arg_tube_01_macro": { displayName: "Argon Bridge Defense Platform", type: ModuleType.Defense },
		// BOR
		"defence_bor_claim_01_macro": { displayName: "Boron Administrative Centre", type: ModuleType.Defense },
		"defence_bor_disc_01_macro": { displayName: "Boron Disc Defense Platform", type: ModuleType.Defense },
		"defence_bor_tube_01_macro": { displayName: "Boron Bridge Defense Platform", type: ModuleType.Defense },
		// PAR
		"defence_par_claim_01_macro": { displayName: "Paranid Administrative Centre", type: ModuleType.Defense },
		"defence_par_disc_01_macro": { displayName: "Paranid Disc Defense Platform", type: ModuleType.Defense },
		"defence_par_tube_01_macro": { displayName: "Paranid Bridge Defense Platform", type: ModuleType.Defense },
		// SPL
		"defence_spl_claim_01_macro": { displayName: "Split Administrative Centre", type: ModuleType.Defense },
		"defence_spl_disc_01_macro": { displayName: "Split Disc Defense Platform", type: ModuleType.Defense },
		"defence_spl_tube_01_macro": { displayName: "Split Bridge Defense Platform", type: ModuleType.Defense },
		// TEL
		"defence_tel_claim_01_macro": { displayName: "Teladi Administrative Centre", type: ModuleType.Defense },
		"defence_tel_disc_01_macro": { displayName: "Teladi Disc Defense Platform", type: ModuleType.Defense },
		"defence_tel_tube_01_macro": { displayName: "Teladi Bridge Defense Platform", type: ModuleType.Defense },
		// TER
		"defence_ter_claim_01_macro": { displayName: "Terran Administrative Centre", type: ModuleType.Defense },
		"defence_ter_disc_01_macro": { displayName: "Terran Disc Defense Platform", type: ModuleType.Defense },
		"defence_ter_tube_01_macro": { displayName: "Terran Bridge Defense Platform", type: ModuleType.Defense },
		// ---- Connection ----
		// ARG
		"landmarks_arg_antigonearc_01_macro": { displayName: "Argon Arc Connection Structure", type: ModuleType.Connection },
		"struct_arg_base_01_macro": { displayName: "Argon Base Connection Structure 01", type: ModuleType.Connection },
		"struct_arg_base_02_macro": { displayName: "Argon Base Connection Structure 02", type: ModuleType.Connection },
		"struct_arg_base_03_macro": { displayName: "Argon Base Connection Structure 03", type: ModuleType.Connection },
		"struct_arg_cross_01_macro": { displayName: "Argon Cross Connection Structure 01", type: ModuleType.Connection },
		"struct_arg_vertical_01_macro": { displayName: "Argon Vertical Connection Structure 01", type: ModuleType.Connection },
		"struct_arg_vertical_02_macro": { displayName: "Argon Vertical Connection Structure 02", type: ModuleType.Connection },
		"landmarks_arg_antigonestraight_01_macro": { displayName: "Argon Span Connection Structure 01", type: ModuleType.Connection },
		"landmarks_arg_antigonescaffolding_01_macro": { displayName: "Argon Span Connection Structure 02", type: ModuleType.Connection },
		// BOR
		"struct_bor_base_01_macro": { displayName: "Boron Base Connection Structure 01", type: ModuleType.Connection },
		"struct_bor_base_02_macro": { displayName: "Boron Base Connection Structure 02", type: ModuleType.Connection },
		"struct_bor_base_03_macro": { displayName: "Boron Base Connection Structure 03", type: ModuleType.Connection },
		"struct_bor_base_04_macro": { displayName: "Boron Base Connection Structure 04", type: ModuleType.Connection },
		"struct_bor_base_05_macro": { displayName: "Boron Base Connection Structure 05", type: ModuleType.Connection },
		"struct_bor_cross_01_macro": { displayName: "Boron Cross Connection Structure 01", type: ModuleType.Connection },
		"struct_bor_cross_02_macro": { displayName: "Boron Cross Connection Structure 02", type: ModuleType.Connection },
		"struct_bor_vertical_01_macro": { displayName: "Boron Vertical Connection Structure 01", type: ModuleType.Connection },
		"struct_bor_vertical_02_macro": { displayName: "Boron Vertical Connection Structure 02", type: ModuleType.Connection },
		// PAR
		"struct_par_base_01_macro": { displayName: "Paranid Base Connection Structure 01", type: ModuleType.Connection },
		"struct_par_base_02_macro": { displayName: "Paranid Base Connection Structure 02", type: ModuleType.Connection },
		"struct_par_base_03_macro": { displayName: "Paranid Base Connection Structure 03", type: ModuleType.Connection },
		"struct_par_cross_01_macro": { displayName: "Paranid Cross Connection Structure 01", type: ModuleType.Connection },
		"struct_par_cross_02_macro": { displayName: "Paranid Cross Connection Structure 02", type: ModuleType.Connection },
		"struct_par_cross_03_macro": { displayName: "Paranid Cross Connection Structure 03", type: ModuleType.Connection },
		"struct_par_vertical_01_macro": { displayName: "Paranid Vertical Connection Structure 01", type: ModuleType.Connection },
		"struct_par_vertical_02_macro": { displayName: "Paranid Vertical Connection Structure 01", type: ModuleType.Connection },
		// SPL
		"struct_spl_base_01_macro": { displayName: "Split Base Connection Structure 01", type: ModuleType.Connection },
		"struct_spl_base_02_macro": { displayName: "Split Base Connection Structure 02", type: ModuleType.Connection },
		"struct_spl_base_03_macro": { displayName: "Split Base Connection Structure 03", type: ModuleType.Connection },
		"struct_spl_cross_01_macro": { displayName: "Split Cross Connection Structure 01", type: ModuleType.Connection },
		"struct_spl_vertical_01_macro": { displayName: "Split Vertical Connection Structure 01", type: ModuleType.Connection },
		"struct_spl_vertical_02_macro": { displayName: "Split Vertical Connection Structure 02", type: ModuleType.Connection },
		// TEL
		"struct_tel_base_01_macro": { displayName: "Teladi Base Connection Structure 01", type: ModuleType.Connection },
		"struct_tel_base_02_macro": { displayName: "Teladi Base Connection Structure 02", type: ModuleType.Connection },
		"struct_tel_base_03_macro": { displayName: "Teladi Base Connection Structure 03", type: ModuleType.Connection },
		"struct_tel_cross_01_macro": { displayName: "Teladi Cross Connection Structure 01", type: ModuleType.Connection },
		"struct_tel_vertical_01_macro": { displayName: "Teladi Vertical Connection Structure 01", type: ModuleType.Connection },
		"struct_tel_vertical_02_macro": { displayName: "Teladi Vertical Connection Structure 02", type: ModuleType.Connection },
		// TER
		"struct_ter_base_01_macro": { displayName: "Terran Base Connection Structure 01", type: ModuleType.Connection },
		"struct_ter_base_02_macro": { displayName: "Terran Base Connection Structure 02", type: ModuleType.Connection },
		"struct_ter_base_03_macro": { displayName: "Terran Base Connection Structure 03", type: ModuleType.Connection },
		"struct_ter_cross_01_macro": { displayName: "Terran Cross Connection Structure 01", type: ModuleType.Connection },
		"struct_ter_vertical_01_macro": { displayName: "Terran Vertical Connection Structure 01", type: ModuleType.Connection },
		"struct_ter_vertical_02_macro": { displayName: "Terran Vertical Connection Structure 02", type: ModuleType.Connection },
		// ---- Other ----
		"struct_gen_observationdeck_01_macro": { displayName: "Conservatory Observation Deck", type: ModuleType.Other },
		"struct_gen_observationdeck_02_macro": { displayName: "Pavilion Observation Deck", type: ModuleType.Other },
		"struct_gen_observationdeck_03_macro": { displayName: "Penthouse Observation Deck", type: ModuleType.Other },
		"radar_arg_dish_01_macro": { displayName: "Wide Area Sensor Aray", type: ModuleType.Other },
		"welfare_gen_casino_01_macro": { displayName: "Casino", type: ModuleType.Other },
		"welfare_gen_gamblinghall_01_macro": { displayName: "Gambling Den", type: ModuleType.Other }
	};

	static classifyModule(macro: string): ModuleInfo {
		// Check if module is in dictionary
		const definition = this.MODULE_DICTIONARY[macro];
		
		if (definition) {
			return {
				macro,
				type: definition.type,
				displayName: definition.displayName // "-------" // Testing purposes
			};
		}
		
		// Not in dictionary - return raw macro name
		return {
			macro,
			type: ModuleType.Other,
			displayName: macro
		};
	}


	static getModulesByType(macros: string[]): Record<ModuleType, ModuleInfo[]> {
		const grouped: Record<ModuleType, ModuleInfo[]> = {
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

		macros.forEach(macro => {
			const moduleInfo = this.classifyModule(macro);
			grouped[moduleInfo.type].push(moduleInfo);
		});

		return grouped;
	}

}