<script setup>
const props = defineProps({
	hash: {
		type: String,
		required: true,
	},
	color: {
		type: String,
		default: "primary",
	},
})

const alias = computed(() => {
	const { $getDisplayName } = useNuxtApp()

	return $getDisplayName("addresses", props.hash)
})
</script>

<template>
	<NuxtLink :to="`/address/${hash}`" @click.stop>
		<Flex align="center" gap="6">
			<Text size="13" weight="600" :color="color"> {{ alias }} </Text>
		</Flex>
	</NuxtLink>
</template>