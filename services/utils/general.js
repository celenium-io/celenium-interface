export const formatBytes = (bytes, decimals = 2) => {
	if (!+bytes) return "0 Byte"

	const dm = decimals < 0 ? 0 : decimals
	const sizes = ["Bytes", "Kb", "Mb", "Gb", "Tb", "Pb"]

	const i = Math.floor(Math.log(bytes) / Math.log(1000))

	return `${parseFloat((bytes / Math.pow(1000, i)).toFixed(dm))} ${sizes[i]}`
}

export const getNamespaceID = (target) => {
	let s = target

	while (s.startsWith("00")) {
		s = s.substring(2)
	}

	return s
}
