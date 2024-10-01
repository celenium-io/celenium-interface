export const comma = (target, symbol = ",", fixed = 2) => {
	if (!target) return 0

	let num = Number.parseFloat(target)

	if (num % 1 === 0) {
		num = num.toFixed(0)
	} else {
		num = num.toFixed(fixed)
	}

	if (num.includes(".")) {
		while (num[num.length - 1] === "0") {
			num = num.slice(0, num.length - 1)
		}
		if (num[num.length - 1] === ".") {
			num = num.slice(0, num.length - 1)
		}
	}

	if (num.split(".").length > 1 && fixed !== 2) {
		return `${num
			.split(".")[0]
			.toString()
			.replace(/\B(?=(\d{3})+(?!\d))/g, symbol)}.${num.split(".")[1]}`
	}

	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, symbol)
}

export const truncate = (num) => {
	if (!num) return num

	if (num.toString().includes("e")) return 0

	const [left, right] = num.toString().split(".")
	let result = ""
	const rightArr = right ? right.split("") : []

	for (let i = 0; i < rightArr.length; i++) {
		const digit = rightArr[i]
		const nextDigit = rightArr[i + 1] && rightArr[i + 1] !== 0 ? rightArr[i + 1] : ""

		if (digit === "0" || digit === ".") {
			result += digit
		} else {
			result += `${digit}${nextDigit}`
			break
		}
	}

	return left + (result ? `.${result}` : "")
}

export const tia = (amount, decimal = 6) => {
	if (!amount || !Number.parseInt(amount)) return 0

	return truncateDecimalPart(Number.parseInt(amount) / 1_000_000, decimal)
}

export const utia = (amount) => {
	if (!amount || !Number.parseInt(amount)) return 0
	return Number.parseInt(amount)
}

export const truncateDecimalPart = (amount, decimal = 6) => {
	if (!amount) return 0

	const numberString = amount.toFixed(decimal).replace(/\.?0+$/, "")

	return Number.parseFloat(numberString)
}

export const numToPercent = (num, decimal = 0) => {
	return `${(num * 100).toFixed(decimal)}%`
}

export const shareOfTotal = (amount, total, decimal = 2) => {
	if (!total) return 0

	return truncateDecimalPart((amount / total) * 100, decimal)
}

export const shareOfTotalString = (amount, total, decimal = 2) => {
	return amountToString(shareOfTotal(amount, total, decimal))
}

export const amountToString = (amount, decimal = 2) => {
	const result = Number.parseFloat(amount)

	if (!result) return 0

	return result < 0.01 && decimal < 3
		? "<0.01"
		: truncateDecimalPart(result, decimal).toLocaleString("en-US", { maximumFractionDigits: decimal })
}

export const abbreviate = (n, h = 1) => {
	if (n < 1e3) return n
	if (n >= 1e3 && n < 1e6) return `${+(n / 1e3).toFixed(h)}K`
	if (n >= 1e6 && n < 1e9) return `${+(n / 1e6).toFixed(h)}M`
	if (n >= 1e9 && n < 1e12) return `${+(n / 1e9).toFixed(h)}B`
	if (n >= 1e12) return `${+(n / 1e12).toFixed(h)}T`
}

export const purgeNumber = (target) => {
	if (/^(0|[1-9]\d*)(\.\d+)?$/.test(target)) return target
	return target.replace(/[^0-9.]/g, "")
}

export const normalizeAmount = (target, max = 9_999_999_999_999, maxStr = "9 999 999 999 999") => {
	if (target === ".") return "0."

	let dotCounter = 0
	for (const char of target.split("")) {
		if (char === ".") dotCounter++
	}
	if (dotCounter > 1) return target.slice(0, target.length - 1)

	if (target[target.length - 1] === ".") return target
	if (!target.length) return ""
	if (target.length === 1 && !/^(0|[1-9]\d*)(\.\d+)?$/.test(target)) return ""
	if (Number.parseFloat(purgeNumber(target)) >= max) return maxStr
}
