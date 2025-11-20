const updates = [
	{
		name: "hardfork_1",
		kind: "hardfork",
		title: "Hardfork Title",
		description: "Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description.",
		block: 9_000_000,
		expiry: 1757416857,
	},
	{
		name: "Ginger",
		kind: "node_upgrade",
		version: 3,
		title: "Ginger upgrade",
		description: "This upgrade (v3) was the first to use the in-protocol signaling mechanism.",
		link: "https://docs.celestia.org/how-to-guides/network-upgrade-process#ginger-network-upgrade",
		timeline: {
			mainnet: {
				time: 1734013612,
				block: 2993219,
			},
			development: {
				time: 1734013612,
				block: 2993219,
			},
			mocha: {
				time: 1731609071,
				block: 3140052,
			},
			arabica: {
				time: 1730843713,
				block: 2348907,
			},
		},
	},
	{
		name: "Lotus",
		kind: "node_upgrade",
		version: 4,
		title: "Lotus upgrade",
		description: "This upgrade (v4) included several important changes.",
		link: "https://docs.celestia.org/how-to-guides/network-upgrade-process#lotus-network-upgrade",
		timeline: {
			mainnet: {
				time: 1753710387,
				block: 6680339,
			},
			development: {
				time: 1753710387,
				block: 6680339,
			},
			mocha: {
				time: 1751370718,
				block: 6915786,
			},
			arabica: {
				time: 1747381895,
				block: 5975265,
			},
		},
	},
	{
		name: "v5",
		kind: "node_upgrade",
		version: 5,
		title: "v5 upgrade",
		description: "This upgrade (v4) included a fix to restore IBC support which was broken in v4.",
		link: "https://docs.celestia.org/how-to-guides/network-upgrade-process#v5-network-upgrade",
		timeline: {
			mainnet: {
				time: 1754058629,
				block: 6748821,
			},
			development: {
				time: 1754058629,
				block: 6748821,
			},
			mocha: {
				time: 1753895249,
				block: 7401191,
			},
			arabica: {
				time: 1753819140,
				block: 7316464,
			},
		},
	},
	{
		name: "Matcha",
		kind: "node_upgrade",
		version: 6,
		title: "Matcha upgrade",
		description: "This upgrade (v6) included several important changes.",
		link: "https://docs.celestia.org/how-to-guides/network-upgrade-process#matcha-network-upgrade",
		timeline: {
			mainnet: {
				time: 0,
				block: 0,
			},
			development: {
				time: 0,
				block: 0,
			},
			mocha: {
				time: 1759454702,
				block: 8236886,
			},
			arabica: {
				time: 1757398091,
				block: 8105605,
			},
		},
	},
]

export function getActiveUpdates(network) {
	const now = Math.floor(Date.now() / 1_000)

	return updates.filter(upd => {
		if (upd.timeline?.[network] && network) {
			return !upd.timeline[network].time || upd.timeline[network].time > now
		}

		return upd.expiry > now
	})
}

export function getNodeUpgrades(version) {
	return updates.filter(upd => upd.kind === "node_upgrade" && (version ? upd.version === version : true))
}
