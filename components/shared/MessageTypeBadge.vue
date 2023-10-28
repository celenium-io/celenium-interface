<script setup>
/** UI */
import Badge from "@/components/ui/Badge.vue"

/** Services */
import { MessageIconMap } from "@/services/constants/mapping"

defineProps({
	types: {
		type: Array,
		required: true,
	},
})
</script>

<template>
	<Badge>
		<Icon
			:name="
				MessageIconMap[types[0].replace('Msg', '').toLowerCase()]
					? MessageIconMap[types[0].replace('Msg', '').toLowerCase()]
					: 'zap'
			"
			size="14"
			color="secondary"
		/>

		<Text size="13" height="160" weight="600" color="primary" :class="$style.text">
			{{ types[0].replace("Msg", "") }}
		</Text>

		<Text v-if="types.length > 1" size="12" weight="600" color="primary" :class="$style.badge"> +{{ types.length - 1 }} </Text>
	</Badge>
</template>

<style module>
.text {
	text-overflow: ellipsis;
	overflow: hidden;
}
</style>
