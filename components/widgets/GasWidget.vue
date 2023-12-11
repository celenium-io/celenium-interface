<template>
	<Flex direction="column" gap="20" :class="$style.wrapper">
		<Flex align="center" justify="between">
			<Flex align="center" gap="6">
				<Icon name="gas" size="12" color="secondary" />
				<Text size="13" weight="600" height="110" color="secondary">Gas Tracker</Text>
			</Flex>

			<Text size="12" weight="600" color="support">Not Available</Text>
		</Flex>

		<Text size="12" weight="500" color="tertiary" align="center"> Data will be available soon</Text>
	</Flex>
</template>

<style module>
.wrapper {
	min-height: 80px;

	background: var(--card-background);
	border-radius: 12px;
	overflow: hidden;

	padding: 12px;
}
</style>
