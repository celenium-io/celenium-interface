import { space } from "./strings.js"

export const formatBytes = (bytes, decimals = 2) => {
	if (!+bytes) return "0 Byte"

	const dm = decimals < 0 ? 0 : decimals
	const sizes = ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB"]

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

export const getNamespaceIDFromBase64 = (target) => {
	let s = base64ToHex(target)

	return s.substring(2)
}

export const getShortNamespaceID = (id) => {
	let s = getNamespaceID(id)

	if (s.length > 8) {
		return `${s.slice(0, 4)} ••• ${s.slice(-4)}`
	} else {
		return space(s)
	}
}

export const shortHash = (hash) => {
	return `${hash.slice(0, 4).toUpperCase()} ••• ${hash.slice(-4).toUpperCase()}`
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

export const midHex = (hex) => {
	if (hex.length > 32) {
		return `${hex.slice(0, 16)} ••• ${hex.slice(-16)}`
	} else {
		return hex
	}
}

export const round = (num, decimals) => {
	const factor = Math.pow(10, decimals)
	return Math.round((num + Number.EPSILON) * factor) / factor
}

export const splitAddress = (address, format = "string") => {
	if (!address) return

	if (address.startsWith("celestiavaloper")) {
		return format === "array" ? [`celestiavaloper`, address.slice(-4)] : `celestiavaloper ••• ${address.slice(-4)}`
	} else if (address.startsWith("celestiavalcons")) {
		return format === "array" ? [`celestiavalcons`, address.slice(-4)] : `celestiavalcons ••• ${address.slice(-4)}`
	} else {
		return format === "array" ? ["celestia", address.slice(-4)] : `celestia ••• ${address.slice(-4)}`
	}
}

const REGEX_MOBILE1 =
	/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|FBAN|FBAV|fennec|hiptop|iemobile|ip(hone|od)|Instagram|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i
const REGEX_MOBILE2 =
	/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i
export const isMobile = () => {
	let userAgent

	if (import.meta.server) {
		const headers = useRequestHeaders()
		userAgent = headers["user-agent"]
	} else {
		userAgent = navigator.userAgent
	}

	return (
		REGEX_MOBILE1.test(userAgent) ||
		REGEX_MOBILE2.test(userAgent.slice(0, 4)) ||
		(typeof window !== "undefined" && window.innerWidth < 1300)
	)
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

		case "mammoth.celenium.io":
			return "Mammoth"

		case "dev.celenium.io":
			return "Development"

		case "localhost":
			return "Local"

		default:
			return "Unknown"
	}
}

export const isMainnet = () => {
	return getNetworkName() === "Mainnet"
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

export function base64ToHex(base64) {
	const raw = atob(base64)
	let hex = ""

	for (let i = 0; i < raw.length; i++) {
		let hexByte = raw.charCodeAt(i).toString(16)
		if (hexByte.length === 1) {
			hexByte = "0" + hexByte
		}
		hex += hexByte
	}

	return hex
}

export function sortArrayOfObjects(arr, path, asc = true) {
	if (!arr || !arr?.length) return []

	return arr.sort((a, b) => {
		const getValue = (obj, path) => path.split(".").reduce((o, key) => o?.[key], obj) ?? 0

		let valueA = getValue(a, path)
		let valueB = getValue(b, path)

		const dateA = Date.parse(valueA)
		const dateB = Date.parse(valueB)

		const bothAreDates = typeof valueA === "string" && typeof valueB === "string" && !isNaN(dateA) && !isNaN(dateB)

		if (bothAreDates) {
			valueA = dateA
			valueB = dateB
		}

		return asc ? valueA - valueB : valueB - valueA
	})
}

export function hexToRgba(hex, alpha = 255) {
	let h = hex.replace(/^#/, "")

	if (h.length === 3) {
		h = h
			.split("")
			.map((c) => c + c)
			.join("")
	}

	const int = parseInt(h, 16)
	const r = (int >> 16) & 255
	const g = (int >> 8) & 255
	const b = int & 255

	let a = alpha
	if (alpha > 1) {
		a = Math.max(0, Math.min(255, alpha)) / 255
	}

	return `rgba(${r}, ${g}, ${b}, ${a})`
}
