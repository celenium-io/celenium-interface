export async function exportToCSV(data, fileName) {
    const blob = new Blob([data], { type: "text/csv;charset=utf-8;" })
	const link = document.createElement("a")

    link.href = URL.createObjectURL(blob)
	link.download = `${fileName}.csv`

	link.style.visibility = "hidden"
	document.body.appendChild(link)
	link.click()
    
	document.body.removeChild(link)
}

export async function exportSVGToPNG(svgElement, fileName) {
	// Load SVG styles
	const styleSheets = Array.from(document.styleSheets)
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

	// Create <style> element and add to SVG
	const svgStyle = document.createElement('style')
	svgStyle.textContent = styleSheets
	svgElement.prepend(svgStyle)

	// Convert SVG to string
	const serializer = new XMLSerializer()
	const svgString = serializer.serializeToString(svgElement)

	// Remove internal styles
	svgElement.removeChild(svgStyle)

	// Convert and export SVG
	const img = new Image()
	const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
	const url = URL.createObjectURL(svgBlob)

	img.onload = function() {
		const canvas = document.createElement('canvas')
		canvas.width = svgElement.clientWidth
		canvas.height = svgElement.clientHeight
		const ctx = canvas.getContext('2d')
		ctx.drawImage(img, 0, 0)
		const png = canvas.toDataURL('image/png')

		// Create link for download
		const link = document.createElement('a')
		link.href = png
		link.download = `${fileName}.png`
		document.body.appendChild(link)
		link.click();
		document.body.removeChild(link)

		URL.revokeObjectURL(url)
	}

	img.src = url
}