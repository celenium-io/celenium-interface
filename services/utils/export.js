/** Services */
import amp from "@/services/amp"

export async function exportToCSV(data, fileName) {
	amp.log("exportCSV", { file: fileName })

	const blob = new Blob([data], { type: "text/csv;charset=utf-8;" })
	const link = document.createElement("a")

    link.href = URL.createObjectURL(blob)
	link.download = `${fileName}.csv`

	link.style.visibility = "hidden"
	document.body.appendChild(link)

	setTimeout(() => {
		link.click()
	}, 100);
    
	document.body.removeChild(link)
}

export async function exportSVGToPNG(svgElement, fileName, width = 1920, height = 1080) {
	amp.log("exportPNG", { file: fileName })

	// Load SVG styles
	const styleSheets = Array.from(document.styleSheets)
		.filter(style => style.href === null)
		.map(sheet => {
			try {
				return Array.from(sheet.cssRules)
					.map(rule => rule.cssText)
					.join('\n')
			} catch (e) {
				console.warn('Failed to read styles from', sheet.href)
				
				return ''
			}
		}).join('\n')

	// Create clone and <style> element and add to SVG
	const svgStyle = document.createElement('style')
	svgStyle.textContent = styleSheets
	
	let svgClone = svgElement.cloneNode(true)
	svgClone.prepend(svgStyle)
	
	// Set SVG size
    svgClone.setAttribute('width', width);
    svgClone.setAttribute('height', height);

	// Convert SVG to string
	const serializer = new XMLSerializer()
	const svgString = serializer.serializeToString(svgClone)

	// Convert and export SVG
	const img = new Image()
	const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
	const url = URL.createObjectURL(svgBlob)

	img.onload = function() {
		const canvas = document.createElement('canvas')
		canvas.width = width
		canvas.height = height
		const ctx = canvas.getContext('2d')
		ctx.drawImage(img, 0, 0, width, height)
		const png = canvas.toDataURL('image/png')

		// Create link for download
		const link = document.createElement('a')
		link.href = png
		link.download = `${fileName}.png`
		document.body.appendChild(link)
		link.click();
		document.body.removeChild(link)

		URL.revokeObjectURL(url)

		svgClone = null
	}

	img.src = url
}
