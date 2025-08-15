import { useState, useEffect } from "react";
import { ErrorHandler } from "../utils/errorHandler";

export function useLocalStorage<T>(
	key: string,
	defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
	const [value, setValue] = useState<T>(() => {
		try {
			const item = localStorage.getItem(key);
			return item ? JSON.parse(item) : defaultValue;
		} catch (error) {
			ErrorHandler.silent(`Failed to load localStorage key: ${key}`, error);
			return defaultValue;
		}
	});

	const setStoredValue = (newValue: T | ((prev: T) => T)) => {
		try {
			const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
			setValue(valueToStore);
			localStorage.setItem(key, JSON.stringify(valueToStore));
		} catch (error) {
			ErrorHandler.error(`Failed to save to localStorage key: ${key}`, error);
		}
	};

	return [value, setStoredValue];
}

export function useLocalStorageListener<T>(key: string, defaultValue: T): T {
	const [value, setValue] = useState<T>(() => {
		try {
			const item = localStorage.getItem(key);
			return item ? JSON.parse(item) : defaultValue;
		} catch (error) {
			ErrorHandler.silent(`Failed to load localStorage key: ${key}`, error);
			return defaultValue;
		}
	});

	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === key && e.newValue) {
				try {
					setValue(JSON.parse(e.newValue));
				} catch (error) {
					ErrorHandler.silent(`Failed to parse localStorage change for key: ${key}`, error);
				}
			}
		};

		window.addEventListener("storage", handleStorageChange);
		return () => window.removeEventListener("storage", handleStorageChange);
	}, [key]);

	return value;
}
