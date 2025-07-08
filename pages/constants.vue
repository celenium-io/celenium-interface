<script setup>
/** Vendor */
import { Duration } from "luxon"

/** Services */
import { formatBytes, comma, round } from "@/services/utils"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** API */
import { fetchMainnetConstants, fetchMochaConstants, fetchArabicaConstants, fetchMammothConstants } from "@/services/api/main"

/** Store */
import { useNotificationsStore } from "@/store/notifications.store"
const notificationsStore = useNotificationsStore()

useHead({
	title: "Celestia Constants - Celenium",
	link: [
		{
			rel: "canonical",
			href: "https://celenium.io/constants",
		},
	],
	meta: [
		{
			name: "description",
			content: "Complete list of Celestia constants for blockchain data, scripting, and consensus—essential for developers.",
		},
		{
			property: "og:title",
			content: "Celestia Constants - Celenium",
		},
		{
			property: "og:description",
			content: "Complete list of Celestia constants for blockchain data, scripting, and consensus—essential for developers.",
		},
		{
			property: "og:url",
			content: `https://celenium.io/constants`,
		},
		{
			property: "og:image",
			content: "/img/seo/constants.png",
		},
		{
			name: "twitter:title",
			content: "Celestia Constants - Celenium",
		},
		{
			name: "twitter:description",
			content: "Complete list of Celestia constants for blockchain data, scripting, and consensus—essential for developers.",
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
		{
			name: "twitter:image",
			content: "https://celenium.io/img/seo/constants.png",
		},
	],
})

const { data: constants } = await useAsyncData(`all-constants`, async () => {
	const [mainnet, mocha, arabica, mammoth] = await Promise.all([
		fetchMainnetConstants(),
		fetchMochaConstants(),
		fetchArabicaConstants(),
		fetchMammothConstants(),
	])
	return { mainnet, mocha, arabica, mammoth }
})

const networks = ["mainnet", "mocha", "arabica", "mammoth"]
const modules = Object.keys(constants.value.mainnet.module)

const constantsToMb = ["block_max_bytes", "evidence_max_bytes"]
const constantsToDays = ["evidence_max_age_duration", "max_deposit_period", "voting_period", "downtime_jail_duration", "unbonding_time"]
const constantsToTia = ["constant_fee", "min_deposit"]
const constantsToPercentage = [
	"community_tax",
	"quorum",
	"threshold",
	"veto_threshold",
	"min_signed_per_window",
	"slash_fraction_double_sign",
	"slash_fraction_downtime",
	"min_commission_rate",
]

const constantsToFormat = [...constantsToMb, ...constantsToDays, ...constantsToTia, ...constantsToPercentage]

const formatConstant = (key, value) => {
	if (key === "allow_messages")
		return JSON.parse(value)
			.map((v) => v.split(".").slice(-1)[0])
			.join(", ")

	if (constantsToMb.includes(key)) return formatBytes(value)
	if (constantsToDays.includes(key)) {
		const dur = Duration.fromMillis(value / 1_000_000)

		if (dur.toFormat("s") >= 86_400) {
			return `${dur.toFormat("d")} day${dur.toFormat("d") > 1 ? "s" : ""}`
		} else {
			return `${dur.toFormat("s")} seconds`
		}
	}
	if (constantsToTia.includes(key)) return `${comma(value.replace("utia", "") / 1_000_000, ",", 8)} TIA`
	if (constantsToPercentage.includes(key)) return `${round(value * 100, 6)}%`

	return value
}

const DescriptionMap = {
	max_memo_characters: "Largest allowed size for a memo in bytes",
	sig_verify_cost_ed25519: "Gas used to verify Ed25519 signature",
	sig_verify_cost_secp256k1: "Gas used to verify secp256k1 signature",
	tx_sig_limit: "Max number of signatures allowed in a multisig transaction",
	tx_size_cost_per_byte: "Gas used per transaction byte",
	gas_per_blob_byte: "Gas used per blob byte",
	gov_max_square_size:
		"Governance parameter for the maximum square size determined per shares per row or column for the original data square (not yet extended)s. If larger than MaxSquareSize, MaxSquareSize is used",
	constant_fee:
		"Fixed gas cost for invariant verification. Due to the anticipated large gas cost requirement to verify an invariant (and potential to exceed the maximum allowable block gas limit) a constant fee is used instead of the standard gas consumption method",
	base_proposer_reward: "Reward in the mint denomination for proposing a block",
	bonus_proposer_reward: "Extra reward in the mint denomination for proposers based on the voting power included in the commit",
	community_tax: "Percentage of the inflation sent to the community pool",
	withdraw_addr_enabled: "Enables delegators to withdraw funds to a different address",
	max_deposit_period: "Maximum period for token holders to deposit on a proposal in nanoseconds",
	min_deposit: "Minimum deposit for a proposal to enter voting period",
	quorum: "Minimum percentage of total stake needed to vote for a result to be considered valid",
	threshold: "Minimum proportion of Yes votes for proposal to pass",
	veto_threshold: "Minimum value of Veto votes to Total votes ratio for proposal to be vetoed",
	voting_period: "Duration of the voting period in nanoseconds",
	downtime_jail_duration: "Duration of time a validator must stay jailed",
	min_signed_per_window: "The percentage of SignedBlocksWindow that must be signed not to get jailed",
	signed_blocks_window: "The range of blocks used to count for downtime",
	slash_fraction_double_sign: "Percentage slashed after a validator is jailed for double signing",
	slash_fraction_downtime: "Percentage slashed after a validator is jailed for downtime",
	bond_denom: "Bondable coin denomination",
	historical_entries: "Number of historical entries to persist in store",
	max_entries: "Maximum number of entries in the redelegation queue",
	max_validators: "Maximum number of validators",
	min_commission_rate: "Minimum commission rate used by all validators",
	unbonding_time: "Duration of time for unbonding in seconds",
	block_max_bytes: "Governance parameter for the maximum size of the protobuf encoded block",
	block_max_gas: "Maximum gas allowed per block (-1 is infinite)",
	evidence_max_age_duration:
		"The maximum age of evidence before it is considered invalid. This value should be identical to the unbonding period",
	evidence_max_age_num_blocks: "The maximum number of blocks before evidence is considered invalid",
	evidence_max_bytes: "Maximum size in bytes used by evidence in a given block",
	validator_pub_key_types: "The type of public key used by validators",
}

const handleCopy = (text) => {
	window.navigator.clipboard.writeText(text)

	notificationsStore.create({
		notification: {
			type: "info",
			icon: "check",
			title: "Successfully copied to clipboard",
			autoDestroy: true,
		},
	})
}
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Breadcrumbs
			:items="[
				{ link: '/', name: 'Explore' },
				{ link: '/constants', name: `Constants` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex wide direction="column" gap="24">
			<Flex direction="column" gap="8">
				<Text as="h1" size="16" weight="600" color="primary">Celestia Constants</Text>
				<Text size="13" weight="500" height="140" color="tertiary">
					Complete list of Celestia constants for auth, consensus, governance, slashing, staking, etc.
				</Text>
			</Flex>

			<div :class="$style.scroller">
				<table :class="$style.constants_table">
					<thead>
						<tr>
							<th>
								<Icon name="constant" size="14" color="tertiary" />
							</th>
							<th>
								<Text size="13" weight="600" color="tertiary" mono> Mainnet </Text>
							</th>
							<th>
								<Text size="13" weight="600" color="tertiary" mono> Mocha </Text>
							</th>
							<th>
								<Text size="13" weight="600" color="tertiary" mono> Arabica </Text>
							</th>
							<th>
								<Text size="13" weight="600" color="tertiary" mono> Mammoth </Text>
							</th>
						</tr>
					</thead>
					<tbody>
						<template v-for="module in modules">
							<tr>
								<td module>
									<Flex direction="column" gap="6">
										<Text size="13" weight="600" color="secondary" mono style="text-transform: capitalize">
											{{ module }}
										</Text>
										<Text size="12" weight="600" color="tertiary" mono> Module</Text>
									</Flex>
								</td>
								<td module></td>
								<td module></td>
								<td module></td>
								<td module></td>
							</tr>

							<tr v-for="constant in Object.keys(constants.mainnet.module[module])">
								<td>
									<Flex align="center" justify="between" gap="8">
										<Flex align="center" gap="6">
											<Text size="13" weight="600" color="secondary" mono> {{ constant }} </Text>

											<Tooltip side="right" :disabled="!constantsToFormat.includes(constant)">
												<Icon v-if="constantsToFormat.includes(constant)" name="zap" size="10" color="brand" />

												<template #content> Formatting is applied to all values of this constant </template>
											</Tooltip>
										</Flex>

										<Tooltip position="start" width="320px" text-align="left" :disabled="!DescriptionMap[constant]">
											<Icon
												v-if="DescriptionMap[constant]"
												name="info"
												size="12"
												color="support"
												hoverColor="primary"
											/>
											<template #content>
												{{ DescriptionMap[constant] }}
											</template>
										</Tooltip>
									</Flex>
								</td>
								<td
									v-for="network in networks"
									@click="constants[network].module[module] && handleCopy(constants[network].module[module][constant])"
									:copyable="!!constants[network].module[module]"
								>
									<template v-if="constants[network].module[module]">
										<Flex align="center" justify="between">
											<Flex v-if="constantsToFormat.includes(constant)" direction="column" gap="6">
												<Text size="13" weight="600" color="secondary" mono>
													{{ formatConstant(constant, constants[network].module[module][constant]) }}
												</Text>
												<Text size="12" weight="600" color="tertiary" mono>
													{{ constants[network].module[module][constant] }}
												</Text>
											</Flex>

											<Text v-else-if="constant !== 'allow_messages'" size="13" weight="600" color="secondary" mono>
												{{ formatConstant(constant, constants[network].module[module][constant]) }}
											</Text>

											<Tooltip v-else position="start" width="300px" textAlign="start">
												<Flex align="center" gap="6">
													<Icon name="menu" size="12" color="brand" />
													<Text size="13" weight="600" color="secondary">List of items</Text>
												</Flex>

												<template #content>
													{{ formatConstant(constant, constants[network].module[module][constant]) }}
												</template>
											</Tooltip>

											<Icon name="copy" size="12" color="tertiary" :class="$style.copy_button" />
										</Flex>
									</template>
									<template v-else>
										<Flex>
											<Text size="13" weight="600" color="tertiary" mono style="font-style: italic"> Empty </Text>
										</Flex>
									</template>
								</td>
							</tr>
						</template>
					</tbody>
				</table>
			</div>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	padding: 20px 24px 60px 24px;
}

.breadcrumbs {
	margin-bottom: 20px;
}

.scroller {
	border-radius: 8px;
	box-shadow: 0 0 0 1px var(--outline-background);
	overflow: auto;
}

.constants_table {
	width: 100%;
	min-width: 0;

	border-spacing: 0;
	background: var(--card-background);

	& th {
		text-align: start;
		border-bottom: 1px solid var(--outline-background);
		background: var(--card-background);

		padding: 8px 12px;
	}

	& td {
		border-bottom: 1px solid var(--outline-background);

		padding: 12px;

		&:first-child {
			border-right: 1px solid var(--outline-background);
		}

		&[module] {
			height: 52px;

			background: var(--app-background);

			&:first-child {
				border-right: initial;
			}
		}

		&[copyable="true"] {
			cursor: copy;

			transition: background 0.2s ease;

			&:hover {
				background: var(--app-background);

				.copy_button {
					opacity: 1;
				}
			}
		}
	}

	& tr {
		&:last-child {
			& td {
				border-bottom: none;
			}
		}
	}
}

.copy_button {
	opacity: 0;
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}
}
</style>
