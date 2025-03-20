export const defaultEnums = {
	status: [
		"success",
		"failed"
	],
	message_type: [
		"MsgUnknown",
		"MsgSetWithdrawAddress",
		"MsgWithdrawDelegatorReward",
		"MsgWithdrawValidatorCommission",
		"MsgFundCommunityPool",
		"MsgCreateValidator",
		"MsgEditValidator",
		"MsgDelegate",
		"MsgBeginRedelegate",
		"MsgUndelegate",
		"MsgCancelUnbondingDelegation",
		"MsgUnjail",
		"MsgSend",
		"MsgMultiSend",
		"MsgCreateVestingAccount",
		"MsgCreatePermanentLockedAccount",
		"MsgCreatePeriodicVestingAccount",
		"MsgPayForBlobs",
		"MsgGrant",
		"MsgExec",
		"MsgRevoke",
		"MsgGrantAllowance",
		"MsgRevokeAllowance",
		"MsgRegisterEVMAddress",
		"MsgSubmitProposal",
		"MsgExecLegacyContent",
		"MsgVote",
		"MsgVoteWeighted",
		"MsgDeposit",
		"IBCTransfer",
		"MsgVerifyInvariant",
		"MsgSubmitEvidence",
		"MsgSendNFT",
		"MsgCreateGroup",
		"MsgUpdateGroupMembers",
		"MsgUpdateGroupAdmin",
		"MsgUpdateGroupMetadata",
		"MsgCreateGroupPolicy",
		"MsgUpdateGroupPolicyAdmin",
		"MsgCreateGroupWithPolicy",
		"MsgUpdateGroupPolicyDecisionPolicy",
		"MsgUpdateGroupPolicyMetadata",
		"MsgSubmitProposalGroup",
		"MsgWithdrawProposal",
		"MsgVoteGroup",
		"MsgExecGroup",
		"MsgLeaveGroup",
		"MsgSoftwareUpgrade",
		"MsgCancelUpgrade",
		"MsgRegisterInterchainAccount",
		"MsgSendTx",
		"MsgRegisterPayee",
		"MsgRegisterCounterpartyPayee",
		"MsgPayPacketFee",
		"MsgPayPacketFeeAsync",
		"MsgTransfer",
		"MsgCreateClient",
		"MsgUpdateClient",
		"MsgUpgradeClient",
		"MsgSubmitMisbehaviour",
		"MsgConnectionOpenInit",
		"MsgConnectionOpenTry",
		"MsgConnectionOpenAck",
		"MsgConnectionOpenConfirm",
		"MsgChannelOpenInit",
		"MsgChannelOpenTry",
		"MsgChannelOpenAck",
		"MsgChannelOpenConfirm",
		"MsgChannelCloseInit",
		"MsgChannelCloseConfirm",
		"MsgRecvPacket",
		"MsgTimeout",
		"MsgTimeoutOnClose",
		"MsgAcknowledgement"
	],
	event_type: [
		"unknown",
		"coin_received",
		"coinbase",
		"coin_spent",
		"burn",
		"mint",
		"message",
		"proposer_reward",
		"rewards",
		"commission",
		"liveness",
		"transfer",
		"celestia.blob.v1.EventPayForBlobs",
		"redelegate",
		"AttestationRequest",
		"withdraw_rewards",
		"withdraw_commission",
		"set_withdraw_address",
		"create_validator",
		"delegate",
		"edit_validator",
		"unbond",
		"tx",
		"complete_redelegation",
		"complete_unbonding",
		"use_feegrant",
		"revoke_feegrant",
		"set_feegrant",
		"update_feegrant",
		"slash",
		"proposal_vote",
		"proposal_deposit",
		"submit_proposal",
		"cosmos.authz.v1beta1.EventGrant",
		"send_packet",
		"ibc_transfer",
		"fungible_token_packet",
		"acknowledge_packet",
		"create_client",
		"update_client",
		"connection_open_try",
		"connection_open_init",
		"connection_open_confirm",
		"connection_open_ack",
		"channel_open_try",
		"channel_open_init",
		"channel_open_confirm",
		"channel_open_ack",
		"recv_packet",
		"write_acknowledgement",
		"timeout",
		"timeout_packet",
		"cosmos.authz.v1beta1.EventRevoke",
		"cosmos.authz.v1.EventRevoke",
		"cancel_unbonding_delegation",
		"active_proposal",
		"inactive_proposal",
		"ics27_packet",
		"channel_close_confirm"
	],
	categories: [
		"uncategorized",
		"finance",
		"gaming",
		"nft",
		"social"
	],
	rollup_type: [
		"sovereign",
		"settled"
	]
}
