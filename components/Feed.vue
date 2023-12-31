<script setup>
/** Services */
import { comma, formatBytes, abbreviate } from "@/services/utils"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

const head = computed(() => appStore.head)
</script>

<template>
	<Flex tag="section" justify="center" wide :class="$style.wrapper">
		<Flex align="center" justify="between" gap="24" wide :class="$style.container">
			<Flex align="center" gap="20" :class="$style.stats">
				<Tooltip>
					<Flex align="center" gap="6" :class="$style.stat">
						<Icon name="tx" size="12" color="secondary" :class="$style.icon" />
						<Flex align="center" gap="4">
							<Text size="12" weight="500" color="tertiary" noWrap :class="$style.key">Total Txs:</Text>

							<Text v-if="head" size="12" weight="600" noWrap :class="$style.value">{{ abbreviate(head.total_tx) }}</Text>
							<Skeleton v-else w="40" h="12" />
						</Flex>
					</Flex>

					<template #content>
						{{ comma(head.total_tx) }}
					</template>
				</Tooltip>

				<div :class="$style.dot" />

				<Tooltip>
					<Flex align="center" gap="6" :class="$style.stat">
						<Icon name="coins" size="12" color="secondary" :class="$style.icon" />
						<Flex align="center" gap="4">
							<Text size="12" weight="500" color="tertiary" noWrap :class="$style.key">Total Supply:</Text>

							<Text v-if="head" size="12" weight="600" noWrap :class="$style.value">
								{{ abbreviate(head.total_supply / 1_000_000, 2) }} TIA
							</Text>
							<Skeleton v-else w="55" h="12" />
						</Flex>
					</Flex>

					<template #content> {{ comma(head.total_supply) }} UTIA </template>
				</Tooltip>

				<div :class="$style.dot" />

				<Tooltip>
					<Flex align="center" gap="6" :class="$style.stat">
						<Icon name="folder" size="12" color="secondary" :class="$style.icon" />
						<Flex align="center" gap="4">
							<Text size="12" weight="500" color="tertiary" noWrap :class="$style.key">Total Blobs Size:</Text>

							<Text v-if="head" size="12" weight="600" noWrap :class="$style.value">{{
								formatBytes(head.total_blobs_size)
							}}</Text>
							<Skeleton v-else w="60" h="12" />
						</Flex>
					</Flex>

					<template #content> {{ comma(head.total_blobs_size) }} Bytes</template>
				</Tooltip>

				<div :class="$style.dot" />

				<Tooltip>
					<Flex align="center" gap="6" :class="$style.stat">
						<Icon name="tag" size="12" color="secondary" :class="$style.icon" />
						<Flex align="center" gap="4">
							<Text size="12" weight="500" color="tertiary" noWrap :class="$style.key">Total Fees:</Text>

							<Text v-if="head" size="12" weight="600" noWrap :class="$style.value">
								{{ abbreviate(parseInt(head.total_fee / 1_000_000)) }} TIA
							</Text>
							<Skeleton v-else w="55" h="12" />
						</Flex>
					</Flex>

					<template #content> {{ comma(head.total_fee) }} UTIA </template>
				</Tooltip>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	height: 32px;

	border-top: 1px solid var(--op-5);
	border-bottom: 1px solid var(--op-5);

	background: var(--feed-background);
}

.container {
	max-width: var(--base-width);
	height: 100%;

	margin: 0 24px;

	&::-webkit-scrollbar {
		display: none;
	}
}

.dot {
	width: 4px;
	height: 4px;
	background-color: var(--op-10);
	border-radius: 50%;
}

.key,
.value,
.icon {
	transition: all 0.2s ease;
}

.value {
	color: var(--op-40);
}

.stat:hover {
	.icon {
		fill: var(--txt-primary);
	}

	.key {
		color: var(--txt-secondary);
	}

	.value {
		color: var(--txt-secondary);
	}
}

@media (max-width: 900px) {
	.wrapper {
		height: initial;

		padding: 12px 0;
	}

	.container {
		flex-direction: column;
	}

	.stats {
		width: 100%;
		justify-content: center;
		flex-wrap: wrap;
	}
}

@media (max-width: 500px) {
	.container {
		margin: 0 12px;
	}
}
</style>
