import { readFileSync } from "fs"
import { join } from "path"

export default defineEventHandler(() => {
	const { version } = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf-8"))
	return {
		version,
	}
})
