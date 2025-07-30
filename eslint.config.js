import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
	js.configs.recommended,
	{
		files: ["**/*.{ts,tsx,js,jsx}"],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "module",
			parser: tsParser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				...globals.browser,
				...globals.es2022,
			},
		},
		plugins: {
			"@typescript-eslint": tseslint,
			"react": react,
			"react-hooks": reactHooks,
		},
		settings: {
			react: {
				version: "detect",
			},
		},
		rules: {
			...tseslint.configs.recommended.rules,
			...react.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,
			"react/react-in-jsx-scope": "off",
			"react/jsx-uses-react": "off",
			"@typescript-eslint/explicit-module-boundary-types": "off",
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/no-unused-vars": ["warn", { 
				argsIgnorePattern: "^_",
				varsIgnorePattern: "^_" 
			}],
			"quotes": ["error", "double"],
			"indent": ["error", "tab"],
			"semi": ["error", "always"],
			"comma-dangle": ["error", "never"],
			"object-curly-spacing": ["error", "always"],
			"array-bracket-spacing": ["error", "never"],
			"jsx-quotes": ["error", "prefer-double"]
		},
	},
	{
		ignores: ["node_modules/", "build/", "dist/", "*.config.js", "*.config.ts"],
	},
];