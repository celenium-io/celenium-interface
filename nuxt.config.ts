import { nodePolyfills } from "vite-plugin-node-polyfills"
import wasm from "vite-plugin-wasm"
import topLevelAwait from "vite-plugin-top-level-await"

import { updateSiteConfig } from "nuxt-site-config/kit"

import path from "path"

export default defineNuxtConfig({
	modules: ["nuxt-site-config", "@pinia/nuxt", "nuxt-og-image", "@nuxtjs/sitemap"],

	hooks: {
		"site-config:resolve": () => {
			updateSiteConfig({
				url: process.env.CF_PAGES_URL ?? "https://celenium.io",
			})
		},
	},

	sitemap: {
		xsl: false,
	},

	routeRules: {
		"/": {
			sitemap: {
				changefreq: "daily",
				priority: 1,
			},
		},
		"/blocks": {
			sitemap: {
				changefreq: "daily",
				priority: 0.9,
			},
		},
		"/namespaces": {
			sitemap: {
				changefreq: "daily",
				priority: 0.8,
			},
		},
		"/txs": {
			sitemap: {
				changefreq: "daily",
				priority: 0.7,
			},
		},
		"/addresses": {
			sitemap: {
				changefreq: "daily",
				priority: 0.6,
			},
		},
		"/gas": {
			sitemap: {
				changefreq: "daily",
				priority: 0.5,
			},
		},
		"/namespaces/treemap": {
			sitemap: {
				changefreq: "weekly",
				priority: 0.4,
			},
		},
	},

	runtimeConfig: {
		public: {
			AMP: process.env.AMP,
			version: "1.16.0-test",
		},
	},

	app: {
		head: {
			htmlAttrs: {
				lang: "en",
			},
			meta: [
				{ name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" },
				{
					name: "lang",
					content: "en",
				},
			],
			link: [
				{
					id: "favicon",
					rel: "icon",
					type: "image/png",
				},
				{
					rel: "preconnect",
					href: "https://fonts.googleapis.com",
				},
				{
					rel: "preconnect",
					href: "https://fonts.gstatic.com",
					crossorigin: "anonymous",
				},
				{
					rel: "preload",
					as: "style",
					href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
					onload: "this.onload=null;this.rel='stylesheet'",
				},
				{
					rel: "preload",
					as: "style",
					href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700&display=swap",
					onload: "this.onload=null;this.rel='stylesheet'",
				},
				{
					rel: "preload",
					as: "style",
					href: "https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap",
					onload: "this.onload=null;this.rel='stylesheet'",
				},
			],
		},
	},

	css: ["@/assets/styles/base.scss", "@/assets/styles/flex.scss", "@/assets/styles/text.scss"],

	pinia: {
		autoImports: ["defineStore"],
	},

	ogImage: {
		fonts: ["Inter:400", "Inter:600", "IBM+Plex+Mono:400"],
	},

	devtools: {
		enabled: true,
	},

	vite: {
		define: {
			global: "globalThis",
		},
		resolve: {
			alias: {
				"unenv/runtime/node/buffer/index/": path.resolve(__dirname, "./node_modules/buffer/index"),
			},
		},
		plugins: [wasm(), topLevelAwait(), nodePolyfills()],
		worker: {
			format: "es",
			plugins: () => [wasm(), topLevelAwait()],
		},
	},

	compatibilityDate: "2025-04-02",
})
