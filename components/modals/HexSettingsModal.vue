<script setup>
/** UI */
import Modal from "@/components/ui/Modal.vue"
import Input from "@/components/ui/Input.vue"
import Checkbox from "@/components/ui/Checkbox.vue"
import Button from "@/components/ui/Button.vue"

/** Store */
import { useSettingsStore } from "@/store/settings.store"
const settingsStore = useSettingsStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const characterSet = ref(settingsStore.hex.characterSet)
const dataInspector = reactive({
	binary: settingsStore.hex.inspector.binary,
	uint8: settingsStore.hex.inspector.uint8,
	time: settingsStore.hex.inspector.time,
	ascii: settingsStore.hex.inspector.ascii,
	char: settingsStore.hex.inspector.char,
})

watch(
	() => props.show,
	() => {
		if (!props.show) return
	},
)

const handleSave = () => {
	if (characterSet.value) settingsStore.hex.characterSet = characterSet.value

	Object.keys(dataInspector).forEach((i) => {
		settingsStore.hex.inspector[i] = dataInspector[i]
	})

	emit("onClose")
}
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" width="450" disable-trap>
		<Flex direction="column" gap="24">
			<Text size="14" weight="600" color="primary">Hex Viewer Settings</Text>

			<Flex direction="column" gap="24">
				<Input v-model="characterSet" label="Character set" placeholder="E.g. IBM437" />

				<Flex direction="column" gap="12">
					<Text size="12" weight="500" color="secondary">Data inspector</Text>

					<Flex v-for="ch in Object.keys(dataInspector)" align="center" gap="8" :class="$style.ch">
						<Checkbox v-model="dataInspector[ch]" />
						<Text size="13" weight="500" color="primary">{{ ch }}</Text>
					</Flex>
				</Flex>
			</Flex>

			<Button @click="handleSave" type="secondary" size="small" wide> Save </Button>
		</Flex>
	</Modal>
</template>

<style module>
.ch {
	cursor: pointer;
}
</style>
