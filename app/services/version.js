export const watchForUpdate = (currentVersion, callback) => {
	return setInterval(async () => {
		try {
			const { version } = await $fetch("/api/version")
			if (currentVersion !== version) callback(version)
		} catch (error) {
			console.error(`Error watchForUpdate: `, error)
		}
	}, 60_000)
}
