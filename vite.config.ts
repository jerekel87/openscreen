import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const isElectron = process.env.ELECTRON === "true";

// https://vitejs.dev/config/
export default defineConfig(async () => {
	const plugins = [react()];

	if (isElectron) {
		const { default: electron } = await import("vite-plugin-electron/simple");
		plugins.push(
			electron({
				main: {
					entry: "electron/main.ts",
					vite: {
						build: {},
					},
				},
				preload: {
					input: path.join(__dirname, "electron/preload.ts"),
				},
				renderer:
					process.env.NODE_ENV === "test"
						? undefined
						: {},
			}),
		);
	}

	return {
		plugins,
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "src"),
			},
		},
		build: {
			target: "esnext",
			minify: "terser",
			terserOptions: {
				compress: {
					drop_console: true,
					drop_debugger: true,
					pure_funcs: ["console.log", "console.debug"],
				},
			},
			rollupOptions: {
				output: {
					manualChunks: {
						pixi: ["pixi.js"],
						"react-vendor": ["react", "react-dom"],
						"video-processing": ["mediabunny", "mp4box", "@fix-webm-duration/fix"],
					},
				},
			},
			chunkSizeWarningLimit: 1000,
		},
	};
});
