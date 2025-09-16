<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { comma, tia } from "@/services/utils"
import { getVoteIcon, getVoteIconColor } from "@/services/utils/states"

const router = useRouter()

const props = defineProps({
	votes: {
		type: Array,
		required: true,
	},
})
</script>

<template>
	<div :class="$style.wrapper_blocks">
		<table :class="$style.table">
			<thead>
				<tr>
					<th><Text size="12" weight="600" color="tertiary">Option</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Block</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Time</Text></th>
				</tr>
			</thead>

			<tbody>
				<tr v-for="v in votes" @click="navigateTo(`/proposal/${v.proposal_id}`)">
					<td>
						<NuxtLink :to="`/proposal/${v.proposal_id}`">
							<Flex align="center" gap="4">
								<Icon :name="getVoteIcon(v.status)" size="12" :color="getVoteIconColor(v.status)" />
								<Text size="13" weight="600" color="primary" style="text-transform: capitalize">
									{{ v.status.replaceAll("_", " ") }}
								</Text>
							</Flex>
						</NuxtLink>
					</td>
					<td>
						<NuxtLink :to="`/block/${v.height}`">
							<Flex align="center">
								<Outline>
									<Flex align="center" gap="6">
										<Icon name="block" size="14" color="secondary" />

										<Text size="13" weight="600" color="primary" tabular>{{ comma(v.height) }}</Text>
									</Flex>
								</Outline>
							</Flex>
						</NuxtLink>
					</td>
					<td>
						<NuxtLink :to="`/proposal/${v.proposal_id}`">
							<Flex justify="center" direction="column" gap="4">
								<Text size="12" weight="600" color="primary">
									{{ DateTime.fromISO(v.deposit_time).toRelative({ locale: "en", style: "short" }) }}
								</Text>
								<Text size="12" weight="500" color="tertiary">
									{{ DateTime.fromISO(v.deposit_time).setLocale("en").toFormat("LLL d, t") }}
								</Text>
							</Flex>
						</NuxtLink>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style module>
.wrapper_blocks {
	min-width: 100%;
	width: 0;
	height: 100%;

	overflow-x: auto;
}

.table {
	width: 100%;
	height: fit-content;

	border-spacing: 0px;

	padding-bottom: 2px;

	& tbody {
		& tr {
			cursor: pointer;

			transition: all 0.05s ease;

			&:hover {
				background: var(--op-5);
			}

			&:active {
				background: var(--op-8);
			}
		}
	}

	& tr th {
		text-align: left;
		padding: 0;
		padding-right: 16px;
		padding-top: 16px;
		padding-bottom: 8px;

		&:first-child {
			padding-left: 16px;
		}

		& span {
			display: flex;
		}
	}

	& tr td {
		padding: 0;
		padding-top: 2px;
		padding-bottom: 2px;
		padding-right: 24px;

		white-space: nowrap;

		cursor: default;

		&:first-child {
			padding-left: 16px;
		}

		& > a {
			display: flex;

			min-height: 40px;

			padding-right: 24px;
		}
	}
}
</style>
