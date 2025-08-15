/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	base: "/",
	publicDir: "public",
	server: {
		port: 3000
	},
	build: {
		outDir: "build",
		sourcemap: true,
		rollupOptions: {
			output: {
				manualChunks: undefined
			}
		}
	},
	css: {
		modules: {
			localsConvention: "camelCaseOnly"
		}
	},
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./src/test/setup.ts"],
		css: {
			modules: {
				classNameStrategy: "non-scoped"
			}
		}
	}
});
