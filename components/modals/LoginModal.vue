<script setup>
/** UI */
import Modal from "@/components/ui/Modal.vue"
import Input from "@/components/ui/Input.vue"
import Button from "~/components/ui/Button.vue"

/** Store */
import { useModalsStore } from "@/store/modals.store.js"

const modalsStore = useModalsStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const username = ref()
const password = ref()

const handleSignup = () => {
	modalsStore.closeAll()
	modalsStore.open("signup")
}
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" width="400" disable-trap>
		<Flex align="center" direction="column" gap="20">
			<Flex wide>
				<Text size="14" weight="600" color="primary">Celenium Login</Text>
			</Flex>

			<Input v-model="username" label="Username" placeholder="Account username" wide />
			<Input v-model="password" label="Password" placeholder="Your password" wide />

			<Button type="white" size="small" wide>Login</Button>

			<Flex wide justify="center" gap="4">
				<Text size="12" weight="600" color="tertiary">Don't have an account?</Text>
				<Text @click="handleSignup" size="12" weight="600" color="blue" align="center"
					  class="clickable">
					Sign up
				</Text>
			</Flex>
		</Flex>
	</Modal>
</template>

<style module>
.tab {
	border-radius: 6px;
	background: var(--op-5);
	cursor: pointer;
	user-select: none;

	padding: 6px 8px;

	transition: all .2s ease;

	&.selected {
		background: var(--op-10);
	}

	&:hover {
		background: var(--op-10);
	}
}
</style>
