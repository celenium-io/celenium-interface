<template>
	<Flex direction="column" justify="between" :class="$style.wrapper">
		<Flex justify="between">
			<Flex align="center" gap="16">
				<Flex align="center" gap="6">
					<Icon name="folder" size="16" color="primary" />

					<Flex gap="4" align="end">
						<Text size="16" color="primary" weight="600">0</Text>
						<Text size="12" color="tertiary" weight="600">GB</Text>
					</Flex>
				</Flex>

				<Flex align="center" gap="6">
					<Icon name="blob" size="16" color="primary" />

					<Flex gap="4" align="end">
						<Text size="16" color="primary" weight="600">0</Text>
						<Text size="12" color="tertiary" weight="600">Blobs</Text>
					</Flex>
				</Flex>
			</Flex>

			<Text size="12" weight="600" color="tertiary">24h</Text>
		</Flex>

		<Flex direction="column" gap="8">
			<Flex v-for="row in 3" align="center" justify="between">
				<div v-for="item in 18" :class="$style.item" />
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	height: 122px;

	border-radius: 12px;
	background: var(--card-background);

	padding: 16px;
}

.item {
	width: 12px;
	height: 12px;

	background: var(--op-5);
	border-radius: 2px;
}
</style>
