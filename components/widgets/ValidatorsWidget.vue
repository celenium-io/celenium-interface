<script setup>
/** API */
import { fetchSummary } from "@/services/api/stats"

const totalValidators = ref(0)

onMounted(async () => {
	const data = await fetchSummary({ table: "validator", func: "count" })
	totalValidators.value = data
})
</script>

<template>
	<Flex direction="column" :class="$style.wrapper">
		<Flex align="center" justify="between">
			<Flex align="center" gap="6">
				<Icon name="addresses" size="12" color="secondary" />
				<Text size="13" weight="600" height="110" color="secondary">Validators</Text>
			</Flex>

			<Text size="12" weight="600" color="secondary"> {{ totalValidators }} </Text>
		</Flex>

		<div :class="$style.bar">
			<div :style="{ width: totalValidators ? '100%' : '0%' }" :class="$style.fill" />
		</div>
	</Flex>
</template>

<style module>
.wrapper {
	min-height: 80px;

	background: var(--card-background);
	border-radius: 12px;
	overflow: hidden;

	padding: 16px;
}

.bar {
	width: 100%;
	height: 14px;

	border-radius: 4px;
	background: var(--op-5);
	border: 1px solid var(--op-5);
	overflow: hidden;

	margin-top: 16px;
}

.fill {
	height: 100%;

	background: var(--neutral-green);

	transition: width 1s ease;
}
</style>
