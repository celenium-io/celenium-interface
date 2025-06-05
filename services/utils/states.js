/**
 * Proposals
 */

export const getProposalIcon = (status) => {
	if (status === "inactive") return "close-circle"
	if (status === "active") return "zap-circle"
	if (status === "removed") return "close-circle"
	if (status === "applied") return "check-circle"
	if (status === "rejected") return "close-circle"
}

export const getProposalIconColor = (status) => {
	if (status === "inactive") return "tertiary"
	if (status === "active") return "blue"
	if (status === "removed") return "tertiary"
	if (status === "applied") return "brand"
	if (status === "rejected") return "red"
}

export const getProposalType = (type) => {
	if (type === "param_changed") return "Update Param"
	if (type === "text") return "Text"
	if (type === "client_update") return "Update Client"
	if (type === "community_pool_spend") return "Community Pool Spend"
}

export const getVoteIcon = (status) => {
	if (status === "yes") return "check-circle"
	if (status === "no") return "close-circle"
	if (status === "no_with_veto") return "close-circle"
	if (status === "abstain") return "close-circle"
}

export const getVoteIconColor = (status) => {
	if (status === "yes") return "brand"
	if (status === "no") return "red"
	if (status === "no_with_veto") return "red"
	if (status === "abstain") return "tertiary"
}
