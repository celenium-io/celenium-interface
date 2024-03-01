export const comma = (target, symbol = ",", fixed = 2) => {
	if (!target) return 0

	let num = parseFloat(target)

	if (num % 1 === 0) {
		num = num.toFixed(0)
	} else {
		num = num.toFixed(fixed)
	}

	if (num.split(".").length && fixed !== 2) {
		return `${num
			.split(".")[0]
			.toString()
			.replace(/\B(?=(\d{3})+(?!\d))/g, symbol)}.${num.split(".")[1]}`
	} else {
		return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, symbol)
	}
}

export const truncate = (num) => {
	if (!num) return num

	/** todo: refactor */
	if (num.toString().includes("e")) return 0

	const [left, right] = num.toString().split(".")
	let result = ""
	const rightArr = right ? right.split("") : []

	for (let i = 0; i < rightArr.length; i++) {
		const digit = rightArr[i]
		const nextDigit = rightArr[i + 1] && rightArr[i + 1] != 0 ? rightArr[i + 1] : ""

		if (digit == "0" || digit == ".") {
			result += digit
		} else {
			result += `${digit}${nextDigit}`
			break
		}
	}

	return left + (result ? `.${result}` : "")
}

export const tia = (amount) => {
	if (!amount || !parseInt(amount)) return 0

	return truncateDecimalPart(parseInt(amount) / 1_000_000)
}

export const utia = (amount) => {
	if (!amount || !parseInt(amount)) return 0
	return parseInt(amount)
}

export const truncateDecimalPart = (amount, decimal = 6) => {
	const numberString = amount.toFixed(decimal).replace(/\.?0+$/, '')

	return parseFloat(numberString)
}

export const numToPercent = (num) => {
	return (num * 100).toFixed(0) + "%"
}

export const shareOfTotal = (amount, total, decimal = 2) => {
	return truncateDecimalPart((amount / total * 100), decimal)
}

export const abbreviate = (n, h = 1) => {
	if (n < 1e3) return n
	if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(h) + "K"
	if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(h) + "M"
	if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(h) + "B"
	if (n >= 1e12) return +(n / 1e12).toFixed(h) + "T"
}
