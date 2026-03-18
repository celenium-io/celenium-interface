<script setup>
const props = defineProps({
	title: String,
	description: String,
	icon: String,
	subIcon: String,
	subIconColor: String,
	descriptionWidth: Number,
	callback: Function,
	callbackText: String,
})

const handleReset = () => {
	props.callback()
}
</script>

<template>
	<Flex align="center" justify="center" direction="column" gap="16" wide :class="$style.wrapper">
		<Flex v-if="icon" align="center" justify="center" :class="$style.icon_badge">
			<Icon :name="icon" size="16" color="tertiary" />
			<Icon v-if="subIcon" :name="subIcon" size="16" :color="subIconColor ? subIconColor : 'tertiary'" :class="$style.sub_icon" />
		</Flex>

		<Flex direction="column" gap="8">
			<Text size="13" weight="600" color="secondary" align="center"> {{ title }} </Text>
			<Text
				size="12"
				weight="500"
				height="140"
				color="tertiary"
				align="center"
				:style="{ maxWidth: descriptionWidth ? `${descriptionWidth}px` : null }"
			>
				{{ description }}
			</Text>

			<Text v-if="callback" @click="handleReset" size="12" weight="600" color="brand" align="center" class="clickable">
				{{ callbackText }}
			</Text>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	padding: 32px 0;
}

.icon_badge {
	position: relative;

	box-sizing: content-box;
	background: var(--op-5);
	border-radius: 8px;

	padding: 8px;
}

.sub_icon {
	position: absolute;
	top: -8px;
	right: -8px;

	background: var(--card-background);
	border-radius: 50%;
	box-sizing: content-box;

	padding: 2px;
}
</style>
