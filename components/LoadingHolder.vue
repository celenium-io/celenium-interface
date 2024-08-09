<script setup>
import Spinner from "@/components/ui/Spinner.vue"
const props = defineProps({
	title: {
		type: String,
		required: true,
	},
	subtitle: {
		type: String,
		required: false,
	},
})
</script>

<template>
	<ClientOnly>
		<Transition name="fade">
			<Flex direction="column" align="center" gap="16" :class="$style.loading">
				<Spinner size="16" />

				<Flex direction="column" align="center" gap="8">
					<Text size="14" weight="500" color="primary"> {{ title }} </Text>
					<Text v-if="subtitle" size="13" weight="500" color="tertiary"> {{ subtitle }} </Text>
				</Flex>
			</Flex>
		</Transition>
	</ClientOnly>
</template>

<style module>
.loading {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}
</style>
