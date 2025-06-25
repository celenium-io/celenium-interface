<script setup>
/** UI */
import Modal from "@/components/ui/Modal.vue"
import Input from "@/components/ui/Input.vue"
import Button from "@/components/ui/Button.vue"

/** Store */
import { useCacheStore } from "@/store/cache.store"
const cacheStore = useCacheStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const commitment = ref("")
const hash = ref("")
const height = ref("")

watch(
	() => props.show,
	() => {
		if (!props.show) return

		commitment.value = cacheStore.current.blob.commitment
		hash.value = cacheStore.current.blob.hash
		height.value = cacheStore.current.blob.height
	},
)

const handleChange = () => {
	if (!commitment.value.length || !hash.value.length || !height.value.length) return

	cacheStore.current.blob = {
		commitment: commitment.value,
		hash: hash.value,
		height: height.value,
	}

	emit("onClose")
}
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" width="600" disable-trap>
		<Flex direction="column" gap="24">
			<Text size="14" weight="600" color="primary">Select blob</Text>

			<Flex direction="column" gap="20">
				<Input v-model="commitment" label="Commitment" placeholder="" />
				<Input v-model="hash" label="Hash" placeholder="" />
				<Input v-model="height" label="Height" placeholder="" />
			</Flex>

			<Button @click="handleChange" type="secondary" size="small" wide> Select </Button>
		</Flex>
	</Modal>
</template>

<style module></style>
