export const generateRandomString = (length) => {
	const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
	let text = ""
	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length))
	}
	return text
}

export const generateCodeChallenge = async (codeVerifier) => {
	const encoder = new TextEncoder()
	const data = encoder.encode(codeVerifier)
	const hashBuffer = await crypto.subtle.digest("SHA-256", data)
	const hashArray = Array.from(new Uint8Array(hashBuffer))
	const hashBase64 = btoa(String.fromCharCode.apply(null, hashArray))
	return hashBase64
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "")
}