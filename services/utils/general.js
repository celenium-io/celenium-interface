export const formatBytes = (bytes, decimals = 2) => {
	if (!+bytes) return "0 Byte"

	const dm = decimals < 0 ? 0 : decimals
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"]

	const i = Math.floor(Math.log(bytes) / Math.log(1024))

	return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(dm))} ${sizes[i]}`
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

export const shortHex = (hex) => {
	if (hex.length > 16) {
		return `${hex.slice(0, 8)} ••• ${hex.slice(-8)}`
	} else {
		return hex
	}
}

export const splitAddress = (address, format = "string") => {
	if (!address) return

	address = address.replace(/"/g,'')
	
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

		case "mocha.celenium.io":
			return "Mocha-4"

		case "arabica.celenium.io":
			return "Arabica"

		case "dev.celenium.io":
			return "Development"

		case "localhost":
			return "Local"

		default:
			return "Unknown"
	}
}

export const isMac = () => {
	return navigator.platform.toUpperCase().indexOf("MAC") >= 0
}

export const isPrefersDarkScheme = () => {
	return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
}

export function reverseMapping(obj) {
	const reversedObj = {}
	Object.entries(obj).forEach(([key, value]) => {
		reversedObj[value] = key
	})
	return reversedObj
}
