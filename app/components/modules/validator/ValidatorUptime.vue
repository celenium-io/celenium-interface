<script setup>
/** UI */
import Tooltip from "~/components/ui/Tooltip.vue"

/** Services */
import { comma } from "~/services/utils/index.js"

/** API */
import { fetchValidatorUptime } from "~/services/api/validator.js"

const props = defineProps({
	validator: {
		type: Object,
		required: true,
	},
})

const uptime = ref([])
const getUptime = async () => {
	const { data } = await fetchValidatorUptime({
		id: props.validator?.id,
		limit: 100,
	})

	if (data.value?.blocks?.length) {
		uptime.value = data.value.blocks.sort((a, b) => a.height - b.height)
	}
}
await getUptime()
</script>

<template>
	<Flex direction="column" gap="4" wide>
		<Flex align="center" justify="between" :class="$style.header">
			<Flex align="center" gap="8">
				<Icon name="zap" size="14" color="primary" />
				<Text size="13" weight="600" color="primary">Validator Uptime</Text>
			</Flex>

			<Text size="12" weight="600" color="tertiary">
				Blocks: <Text color="secondary">{{ comma(uptime[0].height) }}</Text> ->
				<Text color="secondary">{{ comma(uptime.at(-1).height) }}</Text>
			</Text>
		</Flex>

		<div :class="$style.content">
			<Tooltip v-for="t in uptime" @click="navigateTo(`/block/${t.height}`)" wide>
				<Flex
					align="center"
					justify="center"
					:class="$style.uptime"
					:style="{
						background: `color-mix(in srgb, ${t.signed ? 'var(--brand)' : 'var(--red)'} 20%, transparent)`,
					}"
				>
					<Icon :name="t.signed ? 'check-circle' : 'close-circle'" size="10" :color="t.signed ? 'brand' : 'red'" />
				</Flex>

				<template #content>
					<Flex direction="column" gap="4">
						<Text color="primary">{{ t.height }}</Text>
						<Text color="secondary">{{ t.signed ? "Signed" : "Missed" }}</Text>
					</Flex>
				</template>
			</Tooltip>
		</div>
	</Flex>
</template>

<style module>
.header {
	height: 40px;

	border-radius: 8px 8px 4px 4px;
	background: var(--card-background);

	padding: 0 12px;
}

.content {
	display: grid;
	grid-template-columns: repeat(10, 1fr);
	gap: 8px;

	border-radius: 4px 4px 8px 8px;
	background: var(--card-background);

	padding: 16px;
}

.uptime {
	width: 100%;
	height: 16px;

	border-radius: 4px;
	cursor: pointer;
}
</style>
