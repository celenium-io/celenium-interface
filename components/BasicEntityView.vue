<script setup>
/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Store */
import { useBookmarksStore } from "@/store/bookmarks"
const bookmarksStore = useBookmarksStore()

const props = defineProps({
	id: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: true,
	},
	copyable: {
		type: Boolean,
		default: false,
	},
	styles: {
		type: Object,
		default: {},
	},
})

const defaultStyles = {
	color: "primary",
	size: "13",
	weight: "600",
}

const calculatedStyles = computed(() => {
	return {
		...defaultStyles,
		...props.styles,
	}
})

const displayName = computed(() => {
	return bookmarksStore.getBookmarkAlias(props.type, props.id)
})

</script>

<template>
	<Flex align="center" gap="8">
		<template v-if="type === 'address'">
			<AddressBadge :hash="id" :displayName="displayName" />
		</template>

		<template v-else-if="type === 'block'">
			<Text
				:size="calculatedStyles.size"
				:weight="calculatedStyles.weight"
				:color="calculatedStyles.color"
				tabular
			>
				{{ displayName !== id ? displayName : comma(block.height) }}
			</Text>
		</template>

		<!-- <template v-else-if="type === 'namespace'">
			<Tooltip position="start" delay="500">
				<Flex align="center" gap="8">
					<AddressBadge :hash="id" />

					<CopyButton :text="id" />
				</Flex>

				<template #content>
					{{ address.hash }}
				</template>
			</Tooltip>
		</template> -->

		<!-- <template v-else-if="type === 'tx'">
			<Tooltip position="start" delay="500">
				<Flex align="center" gap="8">
					<AddressBadge :hash="id" />

					<CopyButton :text="id" />
				</Flex>

				<template #content>
					{{ address.hash }}
				</template>
			</Tooltip>
		</template> -->

		<CopyButton v-if="copyable" :text="id" />
	</Flex>

	<Text
		:color="calculatedStyles.color"
		:size="calculatedStyles.size"
		:weight="calculatedStyles.weight"
	> {{ displayName }} </Text>
</template>

<style module>
.wrapper {
	width: fit-content;
}

.text {
	text-overflow: ellipsis;
	overflow: hidden;
}
</style>
