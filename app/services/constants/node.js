const StatusMap = {
	Default: 0,
	Initialized: 1,
	Starting: 2,
	Started: 3,
	Failed: 100,
}

const StatusLabelMap = {
	[StatusMap.Default]: "Preparing",
	[StatusMap.Initialized]: "Initialized",
	[StatusMap.Starting]: "Starting",
	[StatusMap.Started]: "Running",
	[StatusMap.Failed]: "Something went wrong",
}

const NodeSpeedMap = {
	Fast: 0,
	Medium: 1,
	Slow: 2,
	Silence: 100,
}

const NodeSpeedLabelMap = {
	[NodeSpeedMap.Fast]: "Fast",
	[NodeSpeedMap.Medium]: "Medium",
	[NodeSpeedMap.Slow]: "Slow",
	[NodeSpeedMap.Silence]: "Silence",
}

export { StatusMap, StatusLabelMap, NodeSpeedMap, NodeSpeedLabelMap }
