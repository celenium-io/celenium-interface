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
