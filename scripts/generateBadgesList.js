import fs from "fs"
import path from "path"

const folders = ["provider", "settled"]
const publicPath = path.resolve("public/img/badges")

let result = {}

for (const folder of folders) {
    const folderPath = path.join(publicPath, folder)
    const files = fs.readdirSync(folderPath)
        .filter(file => !file.startsWith("."))
        .map(file => path.parse(file).name)
    
    result[folder] = files
}

const outputDir = path.resolve("src/data");
fs.mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, "badges.json");
fs.writeFileSync(
    outputPath,
    JSON.stringify(result, null, 2)
)
