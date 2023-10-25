<script setup>
defineProps({
	hash: {
		type: String,
		required: true,
	},
})
</script>

<template>
	<NuxtLink :to="`/address/${hash}`" @click.stop>
		<Flex align="center" gap="6">
			<template v-if="hash.startsWith('celestiavaloper')">
				<Text size="13" weight="600" color="primary"> celestiavaloper </Text>

				<Flex align="center" gap="3">
					<div v-for="dot in 3" class="dot" />
				</Flex>

				<Text size="13" weight="600" color="primary">
					{{ hash.slice(hash.length - 4, hash.length) }}
				</Text>
			</template>
			<template v-else-if="hash.startsWith('celestiavalcons')">
				<Text size="13" weight="600" color="primary"> celestiavalcons </Text>

				<Flex align="center" gap="3">
					<div v-for="dot in 3" class="dot" />
				</Flex>

				<Text size="13" weight="600" color="primary">
					{{ hash.slice(hash.length - 4, hash.length) }}
				</Text>
			</template>
			<template v-else>
				<Text size="13" weight="600" color="primary"> celestia </Text>

				<Flex align="center" gap="3">
					<div v-for="dot in 3" class="dot" />
				</Flex>

				<Text size="13" weight="600" color="primary">
					{{ hash.slice(hash.length - 4, hash.length) }}
				</Text>
			</template>
		</Flex>
	</NuxtLink>
</template>
