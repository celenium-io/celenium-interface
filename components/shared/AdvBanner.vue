<script setup>
/** Services */
import { getAdvByName, getRandomAdv } from "@/services/constants/advertising"

const props = defineProps({
	advName: {
		type: String,
		required: false,
	},
})

const adv = computed(() => {
	if (props.advName) {
		return getAdvByName(props.advName)
	} else {
		return getRandomAdv()
	}
})
</script>

<template>
	<NuxtLink v-if="adv.link" :to="adv.link" target="_blank">
		<Flex direction="column" gap="12" :class="$style.ad">
			<Flex direction="column" gap="8">
				<Flex align="center" gap="6">
					<Icon v-if="adv.icon" :name="adv.icon" size="14" color="brand" />
					<Text size="13" weight="600" color="primary"> {{ adv.header }} </Text>
				</Flex>

				<Text size="13" weight="600" color="tertiary" height="140"> {{ adv.body }} </Text>
			</Flex>

			<Text size="13" weight="600" color="brand"> {{ adv.footer }} </Text>
		</Flex>
	</NuxtLink>
</template>

<style module>
.wrapper {
	width: fit-content;
}

.ad {
	position: relative;

	border-radius: 12px;
	box-shadow: inset 0 0 0 2px var(--op-10);

	padding: 16px;

	transition: all 0.2s ease;

	&:hover {
		background: var(--op-3);
	}

	& .close_icon {
		position: absolute;
		top: 16px;
		right: 16px;

		cursor: pointer;

		transition: all 0.2s ease;

		&:hover {
			fill: var(--txt-secondary);
		}
	}
}
</style>
