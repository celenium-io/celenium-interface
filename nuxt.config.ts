import fs from "node:fs"

import wasm from "vite-plugin-wasm"

import path from "path"

function ignorePosthogSm() {
	return {
		name: "ignore-posthog-sm",
		enforce: "pre" as const,
		load(id: string) {
			const file = id.split("?")[0]
			if (!file.includes("/node_modules/posthog-js/") || !/\.(?:[cm]?js)$/.test(file)) return null

			let code: string
			try {
				code = fs.readFileSync(file, "utf8")
			} catch {
				return null
			}

			if (!code.includes("sourceMappingURL")) return null
			return code.replace(/\/\/[#@]\s*sourceMappingURL=\S+/g, "")
		},
	}
}

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
		client: "hidden",
	},

	posthogConfig: {
		publicKey: process.env.NUXT_PUBLIC_POSTHOG_KEY,
		host: process.env.NUXT_PUBLIC_POSTHOG_HOST,
		debug: false,
	},

	runtimeConfig: {
		public: {
			AMP: process.env.AMP,
			version: "1.26.0",

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
		preset: "cloudflare-module",
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
		plugins: [ignorePosthogSm(), wasm()],
		build: {
			target: "esnext",
			rolldownOptions: {
				devtools: true,
			},
		},
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
			plugins: () => [wasm()],
		},
		optimizeDeps: { exclude: ["lumina-node"] },
	},

	compatibilityDate: "2026-09-22",
})
