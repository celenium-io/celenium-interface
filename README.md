### Official Deployment

-   Production: [celenium.io](https://celenium.io)
-   Development: [dev.celenium.io](https://dev.celenium.io)

### Local Setup

Clone the repository and run on the root folder:

```
pnpm i
pnpm dev
```
### Node.js Server

When running `nuxt build` with the Node server preset, the result will be an entry point that launches a ready-to-run Node server.

```
node .output/server/index.mjs
```

This will launch your production Nuxt server that listens on port 3000 by default.

To use `pm2`, use an `ecosystem.config.js`:

```js
module.exports = {
	apps: [
		{
			name: "CeleniumInterface",
			port: "3000",
			exec_mode: "cluster",
			instances: "max",
			script: "./.output/server/index.mjs",
		},
	],
}
```

Also, you can use different [presets](https://nuxt.com/docs/getting-started/deployment#hosting-providers). E.g. **Cloudflare Pages**: `cloudflare_pages`.

Note, some providers do not support server-side rendering.


### Docker Setup

You can also run the application in Docker.
Build the image and run the container:
```
docker build -t celenium-app .  
docker run -p 3000:3000 --env-file .env celenium-app
```
Make sure to create a ```.env``` file in the root directory or pass the required environment variables directly with ```-e```.

### Environment Variables

#### Required for App Startup
-   NUXT_PUBLIC_API_DEV — API endpoint (e.g. https://api.localhost:8888/v1)
-   NUXT_PUBLIC_WSS_DEV — WebSocket endpoint (e.g. wss://api.localhost:8888/v1/ws)
-   NUXT_PUBLIC_SELFHOSTED — set to ```true``` when running self-hosted

#### Blobstream Configuration
-   NUXT_PUBLIC_BLOBSTREAM_MAINNET — API endpoint for blobstream data

#### Faucet Configuration
-   NUXT_PUBLIC_FAUCET_ADDRESS — faucet service address
-   NUXT_PUBLIC_FAUCET_MOCHA — faucet API for Mocha network
-   NUXT_PUBLIC_FAUCET_ARABICA — faucet API for Arabica network
-   NUXT_PUBLIC_FAUCET_MAMMOTH — faucet API for Mammoth network

#### External Services Configuration
-   NUXT_PUBLIC_BLOCKSCOUT — Blockscout explorer URL
-   NUXT_PUBLIC_GITHUB — GitHub repo/URL
-   NUXT_PUBLIC_NODE_STATS — Node stats service URL
-   NUXT_PUBLIC_QUOTE — Quotes API endpoint
-   NUXT_PUBLIC_ROLLUP_RANKING — Rollup ranking API endpoint
-   NUXT_PUBLIC_TVL — Total value locked service URL
