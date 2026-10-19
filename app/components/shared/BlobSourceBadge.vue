<script setup>
/** UI */
import Outline from "~/components/Outline.vue"

const props = defineProps({
	source: {
		type: String,
		required: true,
	},
})

const getIconName = () => {
	if (props.source === "pfb") return "coins"
	if (props.source === "fibre") return "fibre"
}

const getIconColor = () => {
	if (props.source === "pfb") return "brand"
	if (props.source === "fibre") return "orange"
}

const getText = () => {
	if (props.source === "pfb") return "PFB"
	if (props.source === "fibre") return "Fibre"
}
</script>

<template>
	<Outline :hoverEffect="false">
		<Flex align="center" gap="6">
			<Icon :name="getIconName()" size="14" :color="getIconColor()" />
			<Text size="13" weight="600" color="primary">
				{{ getText() }}
			</Text>
		</Flex>
	</Outline>
</template>
