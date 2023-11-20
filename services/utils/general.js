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

export const strToHex = (str) => {
	let hex = ""
	for (let i = 0; i < str.length; i++) {
		const charCode = str.charCodeAt(i)
		const hexValue = charCode.toString(16)

		hex += hexValue.padStart(2, "0")
	}
	return hex
}

export const splitAddress = (address, format = "string") => {
	if (address.startsWith("celestiavaloper")) {
		return format === "array" ? [`celestiavaloper`, address.slice(-4)] : `celestiavaloper ••• ${address.slice(-4)}`
	} else if (address.startsWith("celestiavalcons")) {
		return format === "array" ? [`celestiavalcons`, address.slice(-4)] : `celestiavalcons ••• ${address.slice(-4)}`
	} else {
		return format === "array" ? ["celestia", address.slice(-4)] : `celestia ••• ${address.slice(-4)}`
	}
}

export const getNetworkName = () => {
	const { hostname } = useRequestURL()

	switch (hostname) {
		case "celenium.io":
			return "Mainnet"

		case "mocha-4.celenium.io":
			return "Mocha-4"

		case "dev.celenium.io":
			return "Development"

		case "localhost":
			return "Local Environment"

		default:
			return "Unknown"
	}
}

export const isMac = () => {
	return navigator.platform.toUpperCase().indexOf("MAC") >= 0
}
