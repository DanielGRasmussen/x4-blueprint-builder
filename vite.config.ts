import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	base: "/x4-reindexer/",
	publicDir: "public",
	server: {
		port: 3000,
	},
	build: {
		outDir: "build",
		sourcemap: true,
		rollupOptions: {
			output: {
				manualChunks: undefined,
			},
		},
	},
})