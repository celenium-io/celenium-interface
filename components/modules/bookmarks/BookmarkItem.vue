<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"

const props = defineProps({
	item: Object,
})
const emit = defineEmits(["onRemove"])

const getIcon = () => {
	switch (props.item.type.toLowerCase()) {
		case "namespace":
			return "folder"

		case "transaction":
			return "tx"

		case "block":
		case "address":
			return props.item.type.toLowerCase()

		default:
			break
	}
}

const getLink = () => {
	switch (props.item.type.toLowerCase()) {
		case "namespace":
			return `/namespace/${props.item.id}`

		case "transaction":
			return `/tx/${props.item.id}`

		case "block":
			return `/block/${props.item.id}`

		case "address":
			return `/address/${props.item.id}`
	}
}
</script>

<template>
	<NuxtLink :to="getLink()">
		<Flex justify="between" align="center" :class="$style.wrapper">
			<Flex align="center" gap="8">
				<Icon :name="getIcon()" size="14" color="secondary" />
				<Text size="13" weight="600" color="primary">{{ item.id }}</Text>
			</Flex>

			<Flex align="center" gap="12">
				<Text size="13" weight="600" color="tertiary">
					{{
						DateTime.fromSeconds(item.ts / 1_000)
							.setLocale("en")
							.toFormat("ff")
					}}
				</Text>
				<Button @click="emit('onRemove')" type="secondary" size="mini">Remove</Button>
			</Flex>
		</Flex>
	</NuxtLink>
</template>

<style module>
.wrapper {
	border-radius: 6px;
	border: 1px solid var(--op-5);
	background: var(--op-5);

	padding: 4px 4px 4px 8px;
}
</style>
