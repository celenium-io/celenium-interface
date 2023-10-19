<script setup>
const props = defineProps({
	items: {
		type: Array,
		required: true,
	},
})
</script>

<template>
	<Flex align="center" gap="6" :class="$style.items">
		<Flex v-for="(item, idx) in items" align="center" gap="6" :class="$style.item">
			<NuxtLink :to="item.link">
				<Text size="12" weight="600" :color="idx < items.length - 1 ? 'secondary' : 'primary'">{{ item.name }}</Text>
			</NuxtLink>

			<Text v-if="idx < items.length - 1" size="12" weight="600" color="tertiary" no-wrap>-></Text>
		</Flex>
	</Flex>
</template>

<style module>
.items {
	overflow: hidden;
}

.item {
	& a {
		display: flex;

		&:hover {
			& span {
				color: var(--txt-primary);
			}
		}
	}
}
</style>
