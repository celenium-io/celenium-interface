<script setup>
const props = defineProps({
	blob: {
		type: Object,
	},
})

const imgEl = ref()
const videoEl = ref()

const getDataString = () => {
	return atob(props.blob.data)
}

onMounted(() => {
	if (["image/png", "image/jpeg"].includes(props.blob.content_type)) {
		const image = new Image()
		image.src = `data:image/png;base64,${props.blob.data}`
		imgEl.value.appendChild(image)
	} else if (props.blob.content_type === "video/mp4") {
		videoEl.value.src = `data:video/mp4;base64,${props.blob.data}`
	}
})
</script>

<template>
	<Flex :class="[$style.wrapper, ['image/png', 'image/jpeg'].includes(blob.content_type) && $style.square]">
		<template v-if="blob.content_type === 'text/plain; charset=utf-8'">
			<Text size="13" color="secondary" height="140" class="selectable" :class="$style.text">
				{{ getDataString() }}
			</Text>
		</template>
		<template v-else-if="['image/png', 'image/jpeg'].includes(blob.content_type)">
			<div ref="imgEl" :class="$style.image" />
		</template>
		<template v-else-if="blob.content_type === 'video/mp4'">
			<video controls>
				<source type="video/mp4" ref="videoEl" />
			</video>
		</template>
	</Flex>
</template>

<style module>
.wrapper {
	aspect-ratio: 16/9;
	max-height: 185px;

	border-radius: 6px;
	background: repeating-linear-gradient(
		45deg,
		var(--card-background),
		var(--card-background) 10px,
		var(--app-background) 10px,
		var(--app-background) 20px
	);
	box-shadow: 0 0 0 2px var(--op-5);

	overflow: auto;

	&.square {
		aspect-ratio: 1/1;
		max-height: initial;
	}
}

.text {
	padding: 12px;
}

.image {
	display: flex;

	width: 100%;

	& img {
		width: 100%;
	}
}
</style>
