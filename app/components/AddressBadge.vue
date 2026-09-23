<script setup>
const props = defineProps({
	account: {
		type: Object,
		required: true,
	},
	color: {
		type: String,
		default: "primary",
	},
})

const alias = computed(() => {
	const { $getDisplayName } = useNuxtApp()
	return $getDisplayName("addresses", "", props.account)
})
</script>

<template>
	<NuxtLink :to="`/address/${account.hash}`" @click.stop>
		<Flex align="center" gap="6">
			<Text size="13" weight="600" :color="color"> {{ alias }} </Text>
		</Flex>
	</NuxtLink>
</template>
