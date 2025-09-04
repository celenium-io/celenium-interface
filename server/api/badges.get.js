import fs from 'fs'
import path from 'path'

export default defineEventHandler(() => {
    const baseDir = path.join(process.cwd(), 'public/img/badges')

    function getFiles(folder) {
        const dir = path.join(baseDir, folder)
        return fs.readdirSync(dir)
            .filter(file => !file.startsWith('.'))
            .map(file => path.parse(file).name)
    }

    return {
        provider: getFiles('provider'),
        settled: getFiles('settled')
    }
})
