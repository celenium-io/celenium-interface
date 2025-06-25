<script setup>
import { computed } from "vue"

import icons from "@/assets/icons.json"

const props = defineProps({
	name: { type: String, required: true, default: "" },
	size: { type: [String, Number], default: "16" },
	color: { type: String, default: null },
	hoverColor: { type: String, required: false },
	rotate: { type: [String, Number], default: 0 },
	fill: { type: Boolean, default: false },
	scale: { type: [String, Number], default: 1 },
	loading: { type: Boolean, default: false },
})

const styles = computed(() => {
	const s = {
		minWidth: `${props.size}px`,
		minHeight: `${props.size}px`,
		transformBox: "view-box",
		transformOrigin: "center center",
		transform: "",
	}

	const ops = []
	if (props.rotate) ops.push(`rotate(${props.rotate}deg)`)
	if (props.scale != 1) ops.push(`scale(${props.scale})`)
	if (ops.length) s.transform = ops.join(" ")

	return s
})

const classes = computed(() => {
	const iconClasses = []

	if (props.color) iconClasses.push(`fill--${props.color}`)

	return iconClasses
})

const hoverColorVar = computed(() => {
	return `var(--txt-${props.hoverColor})`
})

const getIcon = () => {
	return icons[props.name.charAt(0).toLowerCase() + props.name.slice(1)]
}

const isSplitted = () => {
	return typeof icons[props.name.charAt(0).toLowerCase() + props.name.slice(1)] == "object"
}
</script>

<template>
	<svg
		viewBox="0 0 24 24"
		:width="size"
		:height="size"
		:style="styles"
		:class="[classes, hoverColor && $style.hovered, loading && $style.loading]"
		role="img"
	>
		<path v-if="!isSplitted(name)" :d="getIcon(name)" />
		<template v-else>
			<path v-if="!Array.isArray(getIcon(name))" :d="getIcon(name)" :style="{ opacity: path.opacity }" />

			<template v-else>
				<path
					v-for="(icon, i) in getIcon(name)"
					:key="i"
					:d="icon.path"
					:style="{ opacity: fill ? 1 : icon.opacity, fill: icon.color && icon.color }"
				/>
			</template>
		</template>
	</svg>
</template>

<style module>
.hovered {
	transition: all 0.3s var(--bezier);

	&:hover {
		fill: v-bind(hoverColorVar);
	}
}

.loading {
	animation: skeleton 1s ease-in-out infinite;
}

@keyframes skeleton {
	0% {
		opacity: 1;
	}

	50% {
		opacity: 0.5;
	}

	100% {
		opacity: 1;
	}
}
</style>
