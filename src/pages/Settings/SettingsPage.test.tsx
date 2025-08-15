import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsPage from "./SettingsPage";
import { ModuleType } from "../../types/blueprint";

// Mock localStorage
const mockLocalStorage = {
	storage: {} as Record<string, string>,
	getItem: vi.fn((key: string) => mockLocalStorage.storage[key] || null),
	setItem: vi.fn((key: string, value: string) => {
		mockLocalStorage.storage[key] = value;
	}),
	removeItem: vi.fn((key: string) => {
		delete mockLocalStorage.storage[key];
	}),
	clear: vi.fn(() => {
		mockLocalStorage.storage = {};
	})
};

Object.defineProperty(window, "localStorage", {
	value: mockLocalStorage
});

// Mock URL hash changes
const mockLocation = {
	hash: "#general"
};

Object.defineProperty(window, "location", {
	value: mockLocation,
	writable: true
});

describe("SettingsPage", () => {
	beforeEach(() => {
		mockLocalStorage.clear();
		mockLocation.hash = "#general";
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should render with default settings when no localStorage data", () => {
		render(<SettingsPage />);

		expect(screen.getByText("Settings")).toBeInTheDocument();
		expect(
			screen.getByText("Customize modules, categories, and other blueprint editor settings")
		).toBeInTheDocument();

		// Check that tabs are present
		expect(screen.getByText("General")).toBeInTheDocument();
		expect(screen.getByText("Modules")).toBeInTheDocument();
		expect(screen.getByText("Categories")).toBeInTheDocument();
		expect(screen.getByText("Import/Export")).toBeInTheDocument();
	});

	it("should load settings from localStorage", () => {
		const savedSettings = {
			customModules: {
				test_module: {
					macro: "test_module",
					displayName: "Test Module",
					type: ModuleType.Other,
					isCustom: true
				}
			},
			customCategories: {},
			customCategoryTypes: [],
			moduleOverrides: {},
			moduleCollapseThreshold: 10
		};

		mockLocalStorage.setItem("x4_blueprint_settings", JSON.stringify(savedSettings));

		render(<SettingsPage />);

		// Verify localStorage was called
		expect(mockLocalStorage.getItem).toHaveBeenCalledWith("x4_blueprint_settings");
	});

	it("should handle invalid JSON in localStorage gracefully", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		mockLocalStorage.setItem("x4_blueprint_settings", "invalid json");

		// Should not throw an error
		expect(() => {
			render(<SettingsPage />);
		}).not.toThrow();

		// Should render with default settings
		expect(screen.getByText("Settings")).toBeInTheDocument();

		// Restore console.error
		consoleSpy.mockRestore();
	});

	it("should save settings to localStorage when updated", async () => {
		render(<SettingsPage />);

		// Switch to general tab and update collapse threshold
		const generalTab = screen.getByText("General");
		await userEvent.click(generalTab);

		const thresholdInput = screen.getByLabelText(/Module Collapse Threshold/i);

		// Fire the onChange event directly
		fireEvent.change(thresholdInput, { target: { value: "7" } });

		// Wait for the settings to be saved
		await waitFor(() => {
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
				"x4_blueprint_settings",
				expect.stringContaining('"moduleCollapseThreshold":7')
			);
		});
	});

	it("should switch tabs when clicked", async () => {
		render(<SettingsPage />);

		// Initially on General tab
		expect(screen.getByRole("button", { name: "General" })).toHaveClass("active");

		// Click on Modules tab
		const modulesTab = screen.getByText("Modules");
		await userEvent.click(modulesTab);

		expect(screen.getByRole("button", { name: "Modules" })).toHaveClass("active");
		expect(screen.getByRole("button", { name: "General" })).not.toHaveClass("active");
	});

	it("should update URL hash when tab changes", async () => {
		render(<SettingsPage />);

		const modulesTab = screen.getByText("Modules");
		await userEvent.click(modulesTab);

		expect(window.location.hash).toBe("modules");
	});

	it("should initialize with hash from URL", () => {
		mockLocation.hash = "#categories";

		render(<SettingsPage />);

		expect(screen.getByRole("button", { name: "Categories" })).toHaveClass("active");
	});

	it("should handle invalid hash gracefully", () => {
		mockLocation.hash = "#invalid";

		render(<SettingsPage />);

		// Should default to general tab
		expect(screen.getByRole("button", { name: "General" })).toHaveClass("active");
	});

	it("should render general settings with collapse threshold input", async () => {
		render(<SettingsPage />);

		const generalTab = screen.getByText("General");
		await userEvent.click(generalTab);

		expect(screen.getByLabelText(/Module Collapse Threshold/i)).toBeInTheDocument();
		expect(
			screen.getByText(/When this many or more identical modules appear in a row/)
		).toBeInTheDocument();
	});

	it("should validate collapse threshold input bounds", async () => {
		render(<SettingsPage />);

		const generalTab = screen.getByText("General");
		await userEvent.click(generalTab);

		const thresholdInput = screen.getByLabelText(/Module Collapse Threshold/i) as HTMLInputElement;

		// Should have min and max attributes
		expect(thresholdInput).toHaveAttribute("min", "2");
		expect(thresholdInput).toHaveAttribute("max", "50");
		expect(thresholdInput).toHaveAttribute("type", "number");
	});

	it("should handle module collapse threshold edge cases", async () => {
		render(<SettingsPage />);

		const generalTab = screen.getByText("General");
		await userEvent.click(generalTab);

		const thresholdInput = screen.getByLabelText(/Module Collapse Threshold/i);

		// Test with empty value (should default to 5)
		fireEvent.change(thresholdInput, { target: { value: "" } });

		await waitFor(() => {
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
				"x4_blueprint_settings",
				expect.stringContaining('"moduleCollapseThreshold":5')
			);
		});
	});

	it("should preserve backward compatibility with old settings format", () => {
		const oldSettings = {
			customModules: {},
			customCategories: {},
			moduleOverrides: {}
			// Missing customCategoryTypes and moduleCollapseThreshold
		};

		mockLocalStorage.setItem("x4_blueprint_settings", JSON.stringify(oldSettings));

		// Should not crash and should add missing fields
		expect(() => {
			render(<SettingsPage />);
		}).not.toThrow();

		expect(screen.getByText("Settings")).toBeInTheDocument();
	});

	it("should display correct tab content", async () => {
		render(<SettingsPage />);

		// Test Modules tab
		await userEvent.click(screen.getByText("Modules"));
		expect(screen.getByText("Add Custom Module")).toBeInTheDocument();

		// Test Categories tab
		await userEvent.click(screen.getByText("Categories"));
		expect(screen.getByText("Add Category")).toBeInTheDocument();

		// Test Import/Export tab
		await userEvent.click(screen.getByText("Import/Export"));
		expect(screen.getAllByText("Export Settings")).toHaveLength(2); // h3 and button
		expect(screen.getAllByText("Import Settings")).toHaveLength(2); // h3 and button
		expect(screen.getByRole("button", { name: "Reset All Settings" })).toBeInTheDocument();
	});

	it("should handle settings update correctly", async () => {
		render(<SettingsPage />);

		// Go to general tab and update the threshold
		await userEvent.click(screen.getByText("General"));

		const thresholdInput = screen.getByLabelText(/Module Collapse Threshold/i);
		fireEvent.change(thresholdInput, { target: { value: "8" } });

		// Verify the settings were updated
		await waitFor(() => {
			// Get the last call to setItem
			const lastCall =
				mockLocalStorage.setItem.mock.calls[mockLocalStorage.setItem.mock.calls.length - 1];
			const savedData = JSON.parse(lastCall[1]);
			expect(savedData.moduleCollapseThreshold).toBe(8);
		});
	});
});
