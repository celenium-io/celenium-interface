<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"
import Button from "@/components/ui/Button.vue"

/** Services */
import { comma } from "@/services/utils"

/** API */
import { fetchIbcChannels } from "@/services/api/ibc"

const emit = defineEmits(["onClose"])
const props = defineProps({
	connection: {
		type: Object,
		default: {},
	},
})

const isOpened = ref(false)

const channels = ref([])

const hasOpenedChannels = ref(false)

const expandedChannelId = ref()
const handleOpenChannel = (target) => {
	if (!expandedChannelId.value) {
		expandedChannelId.value = target.id
	} else if (expandedChannelId.value === target.id) {
		expandedChannelId.value = null
	} else {
		expandedChannelId.value = target.id
	}
}

const getChannels = async () => {
	channels.value = await fetchIbcChannels({ connection_id: props.connection.id })
}

onMounted(async () => {
	await getChannels()

	hasOpenedChannels.value = channels.value.some((c) => c.status === "opened")
})

const handleNavigate = (target) => {
	emit("onClose")
	navigateTo(target)
}
</script>

<template>
	<Flex wide direction="column" gap="16" :class="$style.wrapper">
		<Flex @click="isOpened = !isOpened" align="center" justify="between" class="clickable">
			<Flex align="center" gap="6">
				<Icon name="zap" size="12" :color="hasOpenedChannels ? 'brand' : 'secondary'" />
				<Text size="12" weight="600" color="secondary">{{ connection.id }}</Text>
			</Flex>

			<Icon name="chevron" size="12" color="secondary" :style="{ transform: `rotate(${isOpened ? '180deg' : '0deg'})` }" />
		</Flex>

		<template v-if="isOpened">
			<template v-if="channels.length">
				<Flex v-for="channel in channels" @click="handleOpenChannel(channel)" direction="column" gap="16" :class="$style.channel">
					<Flex wide align="center" justify="between" :class="$style.header">
						<Text size="13" weight="600" color="primary" mono>
							{{ channel.id }}
						</Text>

						<Flex align="center" gap="6" :class="$style.status">
							<div
								v-for="dot in 3"
								class="dot"
								:style="{ background: channel.status === 'opened' ? 'var(--brand)' : 'var(--red)' }"
							/>
							<Icon
								:name="channel.status === 'opened' ? 'check-circle' : 'close-circle'"
								size="12"
								:color="channel.status === 'opened' ? 'brand' : 'red'"
							/>
							<div
								v-for="dot in 3"
								class="dot"
								:style="{ background: channel.status === 'opened' ? 'var(--brand)' : 'var(--red)' }"
							/>
						</Flex>

						<Text size="13" weight="600" color="primary" mono>
							{{ channel.counterparty_channel_id }}
						</Text>
					</Flex>

					<template v-if="expandedChannelId === channel.id">
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Port</Text>
							<Text size="12" weight="600" color="primary">
								{{ channel.port_id }}
							</Text>
						</Flex>

						<Flex align="center" justify="between" gap="12">
							<Text size="12" weight="600" color="tertiary">Version</Text>
							<Text size="12" weight="600" color="primary" class="overflow_ellipsis">
								{{ channel.version }}
							</Text>
						</Flex>

						<Flex v-if="channel.confirmation_tx_hash" align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Confirmed at</Text>

							<Tooltip position="end">
								<Text size="12" weight="600" color="primary">
									{{ DateTime.fromISO(channel.confirmed_at).toRelative() }}
								</Text>

								<template #content>
									{{ DateTime.fromISO(channel.confirmed_at).setLocale("en").toFormat("LLL d, t") }}</template
								>
							</Tooltip>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Created at</Text>

							<Tooltip position="end">
								<Text size="12" weight="600" color="primary">
									{{ DateTime.fromISO(channel.created_at).toRelative() }}
								</Text>

								<template #content>
									{{ DateTime.fromISO(channel.created_at).setLocale("en").toFormat("LLL d, t") }}</template
								>
							</Tooltip>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Height</Text>
							<Text
								@click="handleNavigate(`/block/${channel.height}`)"
								size="12"
								weight="600"
								color="primary"
								class="clickable"
							>
								{{ comma(channel.height) }}
							</Text>
						</Flex>

						<Flex v-if="channel.confirmation_tx_hash" align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Confirmed with txn</Text>

							<Flex @click="handleNavigate(`/tx/${channel.confirmation_tx_hash}`)" align="center" gap="6" class="clickable">
								<Text size="12" weight="600" color="primary" mono>
									{{ channel.confirmation_tx_hash.slice(0, 4).toUpperCase() }}
								</Text>
								<Flex align="center" gap="4">
									<div v-for="dot in 3" class="dot" />
								</Flex>
								<Text size="12" weight="600" color="primary" mono>
									{{ channel.confirmation_tx_hash.slice(-4).toUpperCase() }}
								</Text>
							</Flex>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Created with txn</Text>

							<Flex @click="handleNavigate(`/tx/${channel.created_tx_hash}`)" align="center" gap="6" class="clickable">
								<Text size="12" weight="600" color="primary" mono>
									{{ channel.created_tx_hash.slice(0, 4).toUpperCase() }}
								</Text>
								<Flex align="center" gap="4">
									<div v-for="dot in 3" class="dot" />
								</Flex>
								<Text size="12" weight="600" color="primary" mono>
									{{ channel.created_tx_hash.slice(-4).toUpperCase() }}
								</Text>
							</Flex>
						</Flex>
					</template>
				</Flex>
			</template>
			<template v-else>
				<Flex justify="center" :class="$style.channel">
					<Text size="12" weight="600" color="tertiary">There is no channels</Text>
				</Flex>
			</template>

			<Text size="12" weight="600" color="secondary"> Connection details </Text>

			<Flex v-if="connection.connected_tx_hash" align="center" justify="between">
				<Text size="12" weight="600" color="tertiary">Connected at</Text>

				<Tooltip position="end">
					<Text size="12" weight="600" color="primary"> {{ DateTime.fromISO(connection.connected_at).toRelative() }} </Text>

					<template #content> {{ DateTime.fromISO(connection.connected_at).setLocale("en").toFormat("LLL d, t") }}</template>
				</Tooltip>
			</Flex>

			<Flex align="center" justify="between">
				<Text size="12" weight="600" color="tertiary">Created at</Text>

				<Tooltip position="end">
					<Text size="12" weight="600" color="primary"> {{ DateTime.fromISO(connection.created_at).toRelative() }} </Text>

					<template #content> {{ DateTime.fromISO(connection.created_at).setLocale("en").toFormat("LLL d, t") }}</template>
				</Tooltip>
			</Flex>

			<Flex align="center" justify="between">
				<Text size="12" weight="600" color="tertiary">Height</Text>
				<Text @click="handleNavigate(`/block/${connection.height}`)" size="12" weight="600" color="primary" class="clickable">
					{{ comma(connection.height) }}
				</Text>
			</Flex>

			<Flex align="center" justify="between">
				<Text size="12" weight="600" color="tertiary">Created with txn</Text>

				<Flex @click="handleNavigate(`/tx/${connection.created_tx_hash}`)" align="center" gap="6" class="clickable">
					<Text size="12" weight="600" color="primary" mono>
						{{ connection.created_tx_hash.slice(0, 4).toUpperCase() }}
					</Text>
					<Flex align="center" gap="4">
						<div v-for="dot in 3" class="dot" />
					</Flex>
					<Text size="12" weight="600" color="primary" mono>
						{{ connection.created_tx_hash.slice(-4).toUpperCase() }}
					</Text>
				</Flex>
			</Flex>

			<Flex v-if="connection.connected_tx_hash" align="center" justify="between">
				<Text size="12" weight="600" color="tertiary">Connected with txn</Text>

				<Flex @click="handleNavigate(`/tx/${connection.connected_tx_hash}`)" align="center" gap="6" class="clickable">
					<Text size="12" weight="600" color="primary" mono>
						{{ connection.connected_tx_hash.slice(0, 4).toUpperCase() }}
					</Text>
					<Flex align="center" gap="4">
						<div v-for="dot in 3" class="dot" />
					</Flex>
					<Text size="12" weight="600" color="primary" mono>
						{{ connection.connected_tx_hash.slice(-4).toUpperCase() }}
					</Text>
				</Flex>
			</Flex>

			<Flex align="center" justify="between">
				<Text size="12" weight="600" color="tertiary">Known channels</Text>
				<Text size="12" weight="600" color="primary">
					{{ connection.channels_count }}
				</Text>
			</Flex>
		</template>
	</Flex>
</template>

<style module>
.wrapper {
	border-radius: 8px;
	background: var(--op-5);

	padding: 8px 12px 8px 8px;
}

.channel {
	border-radius: 10px;
	background: var(--card-background);
	cursor: pointer;

	padding: 12px;

	transition: all 0.2s ease;

	&:hover {
		box-shadow: 0 0 0 1px var(--op-5);
	}

	& .header {
		position: relative;
	}

	& .status {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
	}
}
</style>
