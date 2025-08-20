const updates = [
	{
		name: "hardfork_1",
		kind: "hardfork",
		title: "Hardfork Title",
		description: "Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description Hardfork Description.",
		block: 9_000_000,
		expiry: 1758282382,
	},
	{
		name: "node_upgrade_1",
		kind: "node_upgrade",
		title: "Node Upgrade Title",
		description: "Node Upgrade\nDescription Node Upgrade Description Node Upgrade Description Node Upgrade Description Upgrade Description Node Upgrade Description Upgrade Description Node Upgrade Description Upgrade Description Node Upgrade Description Upgrade Description Node Upgrade Description Node\nUpgrade Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Node Upgrade\nDescription Node Upgrade Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Description Node Upgrade Description Node Upgrade Description Node Upgrade\n Node Upgrade Description Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Description Node Upgrade Description Description Node Upgrade Description Node Upgrade Description Node Upgrade Description Node Upgrade Description.",
		block: 9_000_001,
		expiry: 1758282382,
	},
]

export function getActiveUpdates() {
  const now = Math.floor(Date.now() / 1000)

  return updates.filter(upd => upd.expiry > now)
}
