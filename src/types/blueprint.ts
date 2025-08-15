export interface Position {
	x: number;
	y: number;
	z: number;
}

export interface Rotation {
	pitch?: number;
	yaw?: number;
	roll?: number;
}

export interface Quaternion {
	qx: number;
	qy: number;
	qz: number;
	qw: number;
}

export interface Offset {
	position?: Position;
	rotation?: Rotation;
	quaternion?: Quaternion;
}

export interface Predecessor {
	index: number;
	connection: string;
}

export interface ShieldUpgrade {
	macro: string;
	group: string;
	exact?: number;
}

export interface TurretUpgrade {
	macro: string;
	group: string;
	exact?: number;
}

export interface Upgrades {
	groups?: {
		shields?: ShieldUpgrade[];
		turrets?: TurretUpgrade[];
	};
}

export interface BlueprintEntry {
	index: number;
	macro: string;
	connection?: string;
	predecessor?: Predecessor;
	offset?: Offset;
	upgrades?: Upgrades;
}

export interface Patch {
	extension: string;
	version: string;
	name: string;
}

export interface Blueprint {
	id: string;
	name: string;
	description?: string;
	patches: Patch[];
	entries: BlueprintEntry[];
}

export enum ModuleType {
	RefinedGoods = "RefinedGoods",
	HighTechGoods = "HighTechGoods",
	ShipTechnology = "ShipTechnology",
	Recycling = "Recycling",
	AgriculturalGoodsL1 = "AgriculturalGoodsL1",
	AgriculturalGoodsL2 = "AgriculturalGoodsL2",
	PharmaceuticalGoods = "PharmaceuticalGoods",
	Habitation = "Habitation",
	DockArea = "DockArea",
	Pier = "Pier",
	BuildModule = "BuildModule",
	Storage = "Storage",
	Defense = "Defense",
	Connection = "Connection",
	Other = "Other"
}

export interface ModuleInfo {
	macro: string;
	type: ModuleType;
	faction?: string;
	product?: string;
	size?: string;
	variant?: string;
	displayName: string;
}
