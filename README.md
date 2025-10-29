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

---

### Docker Setup

You can also run the application in Docker.
Build the image and run the container:
```
docker build -t celenium-app
docker run -p 3000:3000 --env-file .env celenium-app
```
Make sure to create a ```.env``` file in the root directory or pass the required environment variables directly with ```-e```.

### Run with Docker Compose  
Start with:
```
docker-compose up -d
```

By default:  
- Builds the image from the local `Dockerfile`  
- Runs the app on `127.0.0.1:3000`  
- Automatically restarts the container on failure  
- Uses `npm run start` as the startup command  
- Limits logs (10 MB per file, max 5 files)  

If you want to use a prebuilt image from **GitHub Container Registry**, specify a tag:  
- `TAG=latest docker-compose up -d`  

---

### Environment Variables

#### Required for App Startup
- **NUXT_PUBLIC_API_DEV** — indexer API (e.g. `https://api.localhost:9876/v1`).
- **NUXT_PUBLIC_WSS_DEV** — webSocket endpoint (e.g. `wss://api.localhost:9876/v1/ws`).
- **NUXT_PUBLIC_SELFHOSTED** — set to `true` when running in self-hosted mode.

#### Blobstream Configuration
- **NUXT_PUBLIC_BLOBSTREAM_MAINNET** — API for blobstream data.

#### Faucet Configuration
- **NUXT_PUBLIC_FAUCET_ADDRESS** — faucet address.
- **NUXT_PUBLIC_FAUCET_MOCHA** — faucet API for the Mocha network.
- **NUXT_PUBLIC_FAUCET_ARABICA** — faucet API for the Arabica network.

#### External Services Configuration
- **NUXT_PUBLIC_BLOCKSCOUT** — used to check whether a batch exists in Blockscout. If found, a dedicated button will appear on the blob form/page.
- **NUXT_PUBLIC_NODE_STATS** — provides statistics about node types, versions, and geographic distribution across the Celestia ecosystem.
- **NUXT_PUBLIC_QUOTE** — provides price data. It is used to display the current TIA price in the header and to convert all values from TIA to USD.
- **NUXT_PUBLIC_ROLLUP_RANKING** — fetches rollup ranking data displayed on the rollup leaderboard, individual rollup pages, and a dedicated rollup ranking page. The ranking page also includes detailed calculations, as well as repository and commit statistics.  
- **NUXT_PUBLIC_GITHUB** — required for retrieving repository statistics on a rollup ranking page.
- **NUXT_PUBLIC_TVL** — provides TVL (Total Value Locked) statistics for rollups and TVS (Total Value Secured) for the Celestia network. These values are displayed in the header, on the statistics page, and on individual rollup pages.
