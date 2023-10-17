export const space = (s) => {
	if (!s.length) return ""
	return s.match(/.{1,4}/g).join(" ")
}
