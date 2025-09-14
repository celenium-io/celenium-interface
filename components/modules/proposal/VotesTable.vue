<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Services */
import { comma, space, validateCelestiaAddress } from "@/services/utils"
import { getVoteIcon, getVoteIconColor } from "@/services/utils/states"

/** UI */
import Button from "@/components/ui/Button.vue"
import Checkbox from "@/components/ui/Checkbox.vue"
import Input from "@/components/ui/Input.vue"
import Popover from "@/components/ui/Popover.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Shared Components */
import TablePlaceholderView from "@/components/shared/TablePlaceholderView.vue"

/** Store */
import { useEnumStore } from "@/store/enums.store"
const enumStore = useEnumStore()

const emit = defineEmits(["onPrevPage", "onNextPage", "updatePage", "updateFilters", "onFiltersReset"])
const props = defineProps({
	proposal: {
		type: Object,
		default: {},
	},
	votes: {
		type: Array,
		default: [],
	},
	votesTotal: {
		type: Number,
		default: 0,
	},
	filters: {
		type: Object,
	},
	page: {
		type: Number,
		default: 1,
	},
	isLoadingVotes: {
		type: Boolean,
		default: false,
	},
})

const router = useRouter()

const options = enumStore.enums.voteOption

/** Filter by vote option */
const setDefaultOptionFilter = () => {
	options.forEach((opt) => {
		optionFilter[opt] = false
	})
}
const optionFilter = reactive({})
setDefaultOptionFilter()

const searchTerm = ref("")

const cachedOptionFilter = ref()

const hasActiveOptionFilters = computed(() => {
	let hasActiveFilter = false
	Object.keys(optionFilter).forEach((opt) => {
		if (optionFilter[opt]) {
			hasActiveFilter = true
		}
	})
	return hasActiveFilter
})

const isOptionPopoverOpen = ref(false)
const handleOpenOptionPopover = () => {
	isOptionPopoverOpen.value = true

	cachedOptionFilter.value = { ...optionFilter }
}
const onOptionPopoverClose = () => {
	isOptionPopoverOpen.value = false

	options.forEach((opt) => {
		optionFilter[opt] = cachedOptionFilter.value[opt]
	})
}
const handleApplyOptionFilters = () => {
	isOptionPopoverOpen.value = false

	emit("updateFilters", "option", optionFilter, true)
}
const handleResetOptionFilter = () => {
	isOptionPopoverOpen.value = false

	emit("onFiltersReset", "option", true)
	setDefaultOptionFilter()
}

/** Pagination */
const handlePrevPage = () => {
	if (props.page === 1) return
	emit("onPrevPage")
}

const isNextPageDisabled = computed(() => {
	return !props.votes.length || props.votes.length !== 10
})
const handleNextPage = () => {
	if (isNextPageDisabled.value) return
	emit("onNextPage")
}

watch(
	() => props.filters.option,
	() => {
		if (!props.filters.option) setDefaultOptionFilter()
	},
)
watch(
	() => searchTerm.value,
	() => {
		if (!searchTerm.value) {
			emit("onFiltersReset", "address", true)
		} else if (!validateCelestiaAddress(searchTerm.value)) {
			emit("updateFilters", "address", "", false)
		} else {
			emit("updateFilters", "address", searchTerm.value, true)
		}
	}
)
</script>

<template>
	<Flex direction="column" :class="[$style.wrapper, isLoadingVotes && $style.disabled]">
		<Flex wrap="wrap" align="center" gap="8" :class="$style.filters">
			<Flex align="center" justify="start">
				<Input v-model="searchTerm" size="mini" icon="search" placeholder="Search by address" />
			</Flex>
			<Popover :open="isOptionPopoverOpen" @on-close="onOptionPopoverClose" width="200">
				<Button @click="handleOpenOptionPopover" type="secondary" size="mini" :disabled="!votes.length && !hasActiveOptionFilters">
					<Icon name="plus-circle" size="12" :color="hasActiveOptionFilters ? 'brand' : 'tertiary'" />
					<Text color="secondary">Option<template v-if="hasActiveOptionFilters">:</template></Text>

					<template v-if="hasActiveOptionFilters">
						<Text size="12" weight="600" color="primary" style="text-transform: capitalize">
							{{
								options
									.map((opt) => optionFilter[opt] && opt.replaceAll("_", " "))
									.filter(Boolean)
									.join(", ")
							}}
						</Text>

						<Icon @click.stop="handleResetOptionFilter" name="close-circle" size="12" color="secondary" />
					</template>
				</Button>

				<template #content>
					<Flex direction="column" gap="12">
						<Text size="12" weight="600" color="secondary">Filter by Vote Option</Text>

						<Flex direction="column" gap="8">
							<Checkbox v-for="opt in options" v-model="optionFilter[opt]">
								<Text size="12" weight="600" color="primary" style="text-transform: capitalize">
									{{ opt.replaceAll("_", " ") }}
								</Text>
							</Checkbox>
						</Flex>

						<Flex gap="8">
							<Button @click="handleApplyOptionFilters" type="secondary" size="mini" wide :disabled="!hasActiveOptionFilters">
								Apply
							</Button>
							<Button v-if="hasActiveOptionFilters" @click="handleResetOptionFilter" type="tertiary" size="mini" wide>
								Reset
							</Button>
						</Flex>
					</Flex>
				</template>
			</Popover>
		</Flex>

		<Flex v-if="votes.length" :class="$style.scroller">
			<table>
				<thead>
					<tr>
						<th><Text size="12" weight="600" color="tertiary">Option</Text></th>
						<th><Text size="12" weight="600" color="tertiary">Voter</Text></th>
						<th><Text size="12" weight="600" color="tertiary">Height</Text></th>
						<th><Text size="12" weight="600" color="tertiary">Time</Text></th>
					</tr>
				</thead>

				<tbody>
					<tr v-for="vote in votes" @click="navigateTo(`/address/${vote.voter.hash}`)">
						<td>
							<Flex align="center" gap="4">
								<Icon :name="getVoteIcon(vote.status)" size="12" :color="getVoteIconColor(vote.status)" />
								<Text size="13" weight="600" color="primary" style="text-transform: capitalize">
									{{ vote.status.replaceAll("_", " ") }}
								</Text>
							</Flex>
						</td>
						<td v-if="!vote.validator">
							<NuxtLink :to="`/address/${vote.voter.hash}`">
								<Flex align="center">
									<Text size="13" weight="600" color="primary" class="table_column_alias">
										{{ $getDisplayName("addresses", vote.voter.hash) }}
									</Text>
								</Flex>
							</NuxtLink>
						</td>
						<td v-else>
							<Flex v-if="vote.validator" align="center">
								<Tooltip delay="500">
									<Text size="13" height="120" weight="600" color="primary">
										{{ vote.validator.moniker }}
									</Text>

									<template #content> {{ space(vote.validator.cons_address) }} </template>
								</Tooltip>
							</Flex>
							<Text v-else size="12" weight="600" color="support">No Validator</Text>
						</td>
						<td>
							<Flex align="center" :class="$style.link">
								<Outline @click.prevent="router.push(`/block/${vote.height}`)">
									<Flex align="center" gap="6">
										<Icon name="block" size="14" color="secondary" />

										<Text size="13" weight="600" color="primary" tabular>{{ comma(vote.height) }}</Text>
									</Flex>
								</Outline>
							</Flex>
						</td>
						<td>
							<Flex justify="center" direction="column" gap="4">
								<Text size="12" weight="600" color="primary">
									{{ DateTime.fromISO(vote.deposit_time).toRelative({ locale: "en", style: "short" }) }}
								</Text>
								<Text size="12" weight="500" color="tertiary">
									{{ DateTime.fromISO(vote.deposit_time).setLocale("en").toFormat("LLL d, t") }}
								</Text>
							</Flex>
						</td>
					</tr>
				</tbody>
			</table>
		</Flex>

		<TablePlaceholderView
			v-else
			title="There's no votes"
			description="This proposal does not contain any votes."
			icon="governance"
			subIcon="search"
			:descriptionWidth="260"
			:callback="hasActiveOptionFilters ? () => handleResetOptionFilter() : null"
			callbackText="Reset Filters"
			style="height: 100%"
		/>

		<!-- Pagination -->
		<Flex align="center" gap="6" :class="$style.pagination">
			<Button @click="emit('updatePage', 1)" type="secondary" size="mini" :disabled="page === 1">
				<Icon name="arrow-left-stop" size="12" color="primary" />
			</Button>
			<Button type="secondary" @click="handlePrevPage" size="mini" :disabled="page === 1">
				<Icon name="arrow-left" size="12" color="primary" />
			</Button>

			<Button type="secondary" size="mini" disabled>
				<Text size="12" weight="600" color="primary"> Page {{ comma(page) }} </Text>
			</Button>

			<Button @click="handleNextPage" type="secondary" size="mini" :disabled="isNextPageDisabled">
				<Icon name="arrow-right" size="12" color="primary" />
			</Button>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	height: 100%;

	border-radius: 4px 4px 8px 4px;
	background: var(--card-background);

	& table {
		width: 100%;
		height: fit-content;

		border-spacing: 0px;

		padding-bottom: 8px;

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
			padding-top: 12px;
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
			padding-right: 24px;
			padding-top: 8px;
			padding-bottom: 8px;

			white-space: nowrap;

			&:first-child {
				padding-left: 16px;
			}

			& > a {
				display: flex;
			}
		}
	}
}

.filters {
	border-bottom: 1px solid var(--op-5);

	padding: 12px 8px 12px 8px;
}

.scroller {
	min-width: 100%;
	width: 0;
	height: 100%;

	overflow-x: auto;
}

.table.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.pagination {
	padding: 8px 16px 16px 16px;
}

@media (max-width: 800px) {
	.table {
		border-radius: 4px 4px 8px 8px;
	}
}
</style>
