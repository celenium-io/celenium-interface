<script setup>
/**
 * Vendor
 */
import * as focusTrap from "focus-trap"

/**
 * Composable
 */
import { useOutside } from "@/composables/outside"

const emit = defineEmits(["onClose"])
const props = defineProps({
	new: {
		type: Boolean,
		default: false,
	},

	show: {
		type: Boolean,
	},
	width: {
		type: [String, Number],
	},
	fullscreen: {
		type: Boolean,
		default: false,
	},
	closable: {
		type: Boolean,
		default: true,
	},
	focus: {
		type: Boolean,
		default: false,
	},

	required: {
		type: Boolean,
	},
	zIndex: {
		type: String,
		default: "1001",
	},
	blockClosing: {
		type: Boolean,
		default: false,
	},
	disableTrap: {
		type: Boolean,
		default: false,
	},

	closeOutside: {
		type: Boolean,
		default: true,
	},
})

let removeOutside
const modal = ref(null)
const trap = ref({})

watch(
	() => props.show,
	() => {
		if (!props.show) {
			document.removeEventListener("keydown", onKeydown)

			if (!props.disableTrap) trap.value.deactivate()

			if (removeOutside) {
				removeOutside()
			}
		} else {
			document.addEventListener("keydown", onKeydown)

			nextTick(() => {
				if (!props.disableTrap) {
					trap.value = focusTrap.createFocusTrap(modal.value, { initialFocus: props.focus })
					trap.value.activate()
				}

				if (!props.closeOutside) return
				removeOutside = useOutside(modal, () => {
					if (props.blockClosing) return
					handleClose()
				})
			})
		}
	},
)

const calcModalStyles = computed(() => {
	const styles = {
		width: props.fullscreen ? "calc(100vw - 40px)" : props.width ? `${props.width}px` : `400px`,
		height: props.fullscreen ? "900px" : "",
	}

	props.new && (styles.padding = "0")

	return styles
})

const showShakeAnimation = ref(false)
const handleClose = (e) => {
	if (e && e.path?.find((el) => el.id === "dropdown")) {
		return
	} else {
		/** prevent closing */
		if (props.blockClosing) return
		if (props.required) {
			showShakeAnimation.value = true
			setTimeout(() => {
				showShakeAnimation.value = false
			}, 700)
			return
		}

		emit("onClose")
	}
}

const onKeydown = (e) => {
	if (e.code === "Escape") handleClose()
}
</script>

<template>
	<ClientOnly>
		<teleport to="#modal">
			<transition name="fastfade">
				<Flex v-if="show" align="center" justify="center" :class="$style.wrapper" :style="{ zIndex: zIndex }">
					<div ref="modal" :style="calcModalStyles" :class="[$style.modal, showShakeAnimation && $style.shake]">
						<slot />

						<Icon v-if="closable && !props.new" name="close" size="16" @click="handleClose" :class="$style.close_icon" />
					</div>
				</Flex>
			</transition>
		</teleport>
	</ClientOnly>
</template>

<style module>
.wrapper {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;

	overflow: hidden;

	background: rgba(0, 0, 0, 0.2);

	transition: all 0.2s ease;
}

.modal {
	position: relative;
	overflow-x: hidden;
	overflow-y: auto;

	max-height: calc(100vh - 40px);

	border-radius: 12px;
	background: var(--card-background);
	box-shadow: rgb(0 0 0 / 20%) 0px 0px 1px, rgb(0 0 0 / 10%) 0px 10px 40px;
	border: 1px solid var(--op-5);

	padding: 16px;
	margin: 0 20px;
}

.modal.shake {
	animation: shake 0.4s;
}

@keyframes shake {
	0% {
		transform: translatex(8px) scale(1.03);
	}

	20% {
		transform: translatex(-6px) scale(1.02);
	}

	40% {
		transform: translatex(4px) scale(1.01);
	}

	60% {
		transform: translatex(-2px);
	}

	80% {
		transform: translatex(0);
	}

	100% {
		transform: translateY(0);
	}
}

.close_icon {
	position: absolute;
	top: 12px;
	right: 12px;

	fill: var(--txt-tertiary);
	background: transparent;
	box-sizing: content-box;
	cursor: pointer;
	border-radius: 5px;

	padding: 4px;

	transition: all 0.2s ease;

	&:hover {
		fill: var(--txt-secondary);
		background: var(--op-10);
	}

	&:active {
		fill: var(--txt-primary);
		background: var(--op-15);
	}
}

@media (max-width: 800px) {
	.wrapper {
		top: 16px;
		bottom: 16px;
	}

	.modal {
		width: 100% !important;
		max-height: 100%;

		overflow-y: auto;

		margin: 16px;
	}
}
</style>
