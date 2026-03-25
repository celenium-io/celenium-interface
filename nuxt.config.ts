import wasm from "vite-plugin-wasm"
import topLevelAwait from "vite-plugin-top-level-await"

import path from "path"

export default defineNuxtConfig({
	modules: ["@nuxt/fonts", "nuxt-site-config", "@nuxtjs/robots", "@pinia/nuxt", "nuxt-og-image", "@nuxtjs/sitemap", "@posthog/nuxt"],

	site: {
		url: "https://celenium.io",
	},

	sitemap: {
		xsl: false,
		zeroRuntime: true,
	},

	robots: {
		sitemap: "/sitemap.xml",
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

	sourcemap: {
		server: false,
		client: false,
	},

	posthogConfig: {
		publicKey: "phc_tcqeIINi9GbfhqO7JwuIJc6YcbyEdhdiv1QKGNYi6MN",
		host: "https://lt.celenium.io",
	},

	hooks: {
		"build:before": () => {
			const interval = setInterval(() => {
				const mem = process.memoryUsage()
				console.log(
					`🧠 [RAM] RSS: ${(mem.rss / 1024 / 1024).toFixed(0)} MB ` +
						`| Heap Used: ${(mem.heapUsed / 1024 / 1024).toFixed(0)} MB`,
				)
			}, 1000)

			interval.unref()
		},
	},

	runtimeConfig: {
		public: {
			AMP: process.env.AMP,
			version: "1.26.0",

			posthogPublicKey: "phc_tcqeIINi9GbfhqO7JwuIJc6YcbyEdhdiv1QKGNYi6MN",
			posthogHost: "https://lt.celenium.io/",
			posthogDefaults: "2026-01-30",

			API_MAINNET: "",
			API_MOCHA: "",
			API_ARABICA: "",
			API_DEV: "",

			WSS_MAINNET: "",
			WSS_MOCHA: "",
			WSS_ARABICA: "",
			WSS_DEV: "",

			BLOBSTREAM_MAINNET: "",
			BLOBSTREAM_TESTNET: "",

			FAUCET_ADDRESS: "",
			FAUCET_MOCHA: "",
			FAUCET_ARABICA: "",

			BLOCKSCOUT: "",
			GITHUB: "",
			NODE_STATS: "",
			QUOTE: "",
			ROLLUP_RANKING: "",
			TVL: "",

			SELFHOSTED: false,
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
			script: [{ src: "https://analytics.ahrefs.com/analytics.js", "data-key": "/cIm/4LxIX1R+OK+XMnXRg", async: true }],
			link: [
				{
					id: "favicon",
					rel: "icon",
					type: "image/png",
				},
			],
		},
	},

	nitro: {
		sourceMap: false,
		experimental: {
			wasm: true,
		},
	},

	css: ["@/assets/styles/base.scss", "@/assets/styles/flex.scss", "@/assets/styles/text.scss"],

	fonts: {
		families: [
			{
				name: "Inter",
				weights: [400, 500, 600, 700],
				provider: "google",
				global: true,
			},
			{
				name: "JetBrains Mono",
				weights: [500, 600],
				provider: "google",
				global: true,
			},
		],
	},

	pinia: {
		autoImports: ["defineStore"],
	},

	devtools: {
		enabled: true,
	},

	plugins: ["~/plugins/force.client.js"],

	vite: {
		plugins: [wasm(), topLevelAwait()],
		define: {
			global: "globalThis",
			"process.env": "{}",
		},
		resolve: {
			alias: {
				"@data": path.resolve(__dirname, "src/data"),
			},
		},
		worker: {
			format: "es",
			plugins: () => [wasm(), topLevelAwait()],
		},
	},

	compatibilityDate: "2025-04-02",
})
