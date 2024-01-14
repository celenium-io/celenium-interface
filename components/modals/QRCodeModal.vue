<script setup>
/** Vendor */
import qrcode from "qrcode"

/** UI */
import Modal from "@/components/ui/Modal.vue"

/** Store */
import { useCacheStore } from "@/store/cache"
const cacheStore = useCacheStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const qrEl = ref()

watch(
	() => props.show,
	() => {
		if (props.show) {
			nextTick(() => {
				qrcode.toDataURL(
					cacheStore.qr.data,
					{
						color: {
							light: "#0000",
						},
					},
					(err, url) => {
						qrEl.value.src = url
					},
				)
			})
		}
	},
)
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" width="400" disable-trap>
		<Flex direction="column" gap="24">
			<Text size="14" weight="600" color="primary">QR Code</Text>

			<Flex direction="column">
				<Flex gap="8" :class="$style.badge">
					<Icon :name="cacheStore.qr.icon" size="12" color="secondary" />

					<Flex direction="column" gap="6" :class="$style.content">
						<Text size="12" weight="600" color="primary">{{ cacheStore.qr.data }}</Text>
						<Text size="12" weight="600" color="tertiary">{{ cacheStore.qr.description }}</Text>
					</Flex>
				</Flex>

				<img ref="qrEl" :class="$style.qrcode" />
			</Flex>
		</Flex>
	</Modal>
</template>

<style module>
.badge {
	border-radius: 8px 8px 0 0;
	background: var(--op-5);

	padding: 12px;
}

.content {
	min-width: 0;

	& span:first-child {
		min-width: 0;
		text-overflow: ellipsis;
		overflow: hidden;
	}
}

.qrcode {
	filter: invert(1);

	user-select: none;
	-webkit-user-drag: none;
	box-shadow: inset 0 0 0 4px rgba(0, 0, 0, 5%);
	border-radius: 0 0 12px 12px;
}
</style>
