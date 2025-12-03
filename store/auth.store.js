/** Services */
import { generateRandomString, generateCodeChallenge } from "@/services/auth"

/** Config */
import { Auth } from "@/services/config"

export const useAuthStore = defineStore("auth", {
	state: () => ({
		user: null,
		isAuthenticated: false,
	}),

	getters: {
		getUser: (state) => state.user,
		getIsAuthenticated: (state) => state.isAuthenticated,
	},

	actions: {
		async initialize() {
			const authToken = localStorage.getItem("access_token")
			if (authToken) {
				await this.fetchUserData()
			}
		},

		async login() {
			try {
				const codeVerifier = generateRandomString(128)
				localStorage.setItem("code_verifier", codeVerifier)
				const codeChallenge = await generateCodeChallenge(codeVerifier)

				const queryParams = new URLSearchParams({
					client_id: Auth.clientId,
					redirect_uri: `${window.location.origin}${Auth.redirectPath}`,
					response_type: "code",
					scope: Auth.scope,
					code_challenge: codeChallenge,
					code_challenge_method: "S256",
				})

				window.location.href = `https://auth-back.celenium.io${Auth.authorizeUrl}?${queryParams.toString()}`
			} catch (error) {
				console.error("Login error:", error)
			}
		},

		async getTokenByCode(code) {
			try {
				const codeVerifier = localStorage.getItem("code_verifier")
				if (!codeVerifier) {
					throw new Error("сode verifier not found")
				}

				const response = await fetch(`https://auth-back.celenium.io${Auth.getTokenUrl}`, {
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
					body: new URLSearchParams({
						grant_type: "authorization_code",
						client_id: Auth.clientId,
						redirect_uri: `${window.location.origin}${Auth.redirectPath}`,
						code,
						code_verifier: codeVerifier,
					}),
				})

				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`)
				}

				const data = await response.json()

				alert(data)

				localStorage.removeItem("code_verifier")
				localStorage.setItem("access_token", data.access_token)
				localStorage.setItem("refresh_token", data.refresh_token)

				await this.fetchUserData()
			} catch (error) {
				console.error("Get token error:", error)
			}
		},

		async fetchUserData() {
			try {
				const token = localStorage.getItem("access_token")
				if (!token) {
					throw new Error("No access token")
				}

				const response = await fetch(`https://auth-back.celenium.io${Auth.getCurrentUserUrl}`, {
					headers: {
						"Authorization": `Bearer ${token}`,
					},
				})

				if (!response.ok) {
					if (response.status === 401) {
						const refreshToken = localStorage.getItem("refresh_token")
						const refreshed = await this.refreshToken(refreshToken)

						if (refreshed) {
							return await this.fetchUserData()
						} else {
							throw new Error("refresh token expired")
						}
					}
					throw new Error(`HTTP error! Status: ${response.status}`)
				}

				const userData = await response.json()
				this.user = userData
				this.isAuthenticated = true
			} catch (error) {
				console.error(error)
				this.logout()
			}
		},

		async refreshToken(refreshToken) {
			try {
				const response = await fetch(`https://auth-back.celenium.io${Auth.getTokenUrl}`, {
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
					body: new URLSearchParams({
						grant_type: "refresh_token",
						client_id: Auth.clientId,
						refresh_token: refreshToken,
					}),
				})

				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`)
				}

				const data = await response.json()

				localStorage.setItem("access_token", data.access_token)
				localStorage.setItem("refresh_token", data.refresh_token)
				return true
			} catch (error) {
				console.error("Error refreshing token:", error)
				return false
			}
		},

		async revokeToken() {
			try {
				const refreshToken = localStorage.getItem("refresh_token")
				const response = await fetch(`https://auth-back.celenium.io${Auth.revokeTokenUrl}`, {
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
					body: new URLSearchParams({
						token: refreshToken,
						client_id: Auth.clientId,
					}),
				})

				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`)
				}
			} catch (error) {
				console.error("Error revoking token:", error)
				this.logout()
			}
		},

		async saveSettings(settings) {
			try {
				const token = localStorage.getItem("access_token")
				if (!token) {
					throw new Error("No access token")
				}

				const response = await fetch(`https://auth-back.celenium.io${Auth.saveSettingsUrl}`, {
						method: "POST",
						headers: {
							"Accept": "application/json",
							"Authorization": `Bearer ${token}`,
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ settings }),
					},
				)

				return (response.ok)
			} catch (error) {
				console.error("Error saving settings:", error)

			}
		},

		logout() {
			localStorage.removeItem("access_token")
			localStorage.removeItem("refresh_token")
			this.user = null
			this.isAuthenticated = false
			this.error = null
		},
	},
})